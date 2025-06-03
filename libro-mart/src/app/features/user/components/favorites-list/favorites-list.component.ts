import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

import { Book } from '../../../../models/book.model';
import { FavoritesService } from '../../../../core/services/favorites.service';

@Component({
  selector: 'app-favorites-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './favorites-list.component.html',
  styleUrl: './favorites-list.component.css'
})
export class FavoritesListComponent implements OnInit, OnDestroy {
  favorites: Book[] = [];
  filteredFavorites: Book[] = [];
  categories: string[] = [];
  removingBookIds = new Set<string>();

  // Filtros y búsqueda
  searchQuery = '';
  selectedCategory = '';
  sortBy: 'title' | 'author' | 'dateAdded' | 'rating' = 'title';

  // Paginación
  currentPage = 1;
  itemsPerPage = 12;
  totalPages = 1;

  private destroy$ = new Subject<void>();

  constructor(private favoritesService: FavoritesService) {}

  ngOnInit(): void {
    // Suscribirse a los favoritos
    this.favoritesService.favorites$
      .pipe(takeUntil(this.destroy$))
      .subscribe(favorites => {
        this.favorites = favorites;
        this.updateCategories();
        this.applyFilters();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ==================== FILTROS Y BÚSQUEDA ====================

  onSearchChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  onCategoryChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  onSortChange(): void {
    this.applyFilters();
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedCategory = '';
    this.sortBy = 'title';
    this.currentPage = 1;
    this.applyFilters();
  }

  private applyFilters(): void {
    let filtered = [...this.favorites];

    // Aplicar búsqueda
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(book => 
        book.title.toLowerCase().includes(query) ||
        (book.authors && book.authors.some(author => 
          author.toLowerCase().includes(query)
        )) ||
        (book.description && book.description.toLowerCase().includes(query))
      );
    }

    // Aplicar filtro de categoría
    if (this.selectedCategory) {
      filtered = filtered.filter(book => 
        book.categories && book.categories.includes(this.selectedCategory)
      );
    }

    // Aplicar ordenamiento
    filtered.sort((a, b) => {
      switch (this.sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'author':
          const authorA = a.authors?.[0] || '';
          const authorB = b.authors?.[0] || '';
          return authorA.localeCompare(authorB);
        case 'dateAdded':
          const dateA = a.dateAddedToFavorites || new Date(0);
          const dateB = b.dateAddedToFavorites || new Date(0);
          return new Date(dateB).getTime() - new Date(dateA).getTime();
        case 'rating':
          const ratingA = a.averageRating || 0;
          const ratingB = b.averageRating || 0;
          return ratingB - ratingA;
        default:
          return 0;
      }
    });

    this.filteredFavorites = filtered;
    this.updatePagination();
  }

  private updateCategories(): void {
    const categorySet = new Set<string>();
    this.favorites.forEach(book => {
      if (book.categories) {
        book.categories.forEach(category => categorySet.add(category));
      }
    });
    this.categories = Array.from(categorySet).sort();
  }

  // ==================== ACCIONES DE LIBROS ====================

  async removeFromFavorites(book: Book): Promise<void> {
    if (this.removingBookIds.has(book.id)) return;

    const confirmRemove = confirm(`¿Estás seguro de que quieres quitar "${book.title}" de tus favoritos?`);
    if (!confirmRemove) return;

    this.removingBookIds.add(book.id);

    try {
      await this.favoritesService.removeFromFavorites(book.id);
      console.log(`✅ "${book.title}" quitado de favoritos`);
    } catch (error) {
      console.error('❌ Error al quitar de favoritos:', error);
      alert('Error al quitar el libro de favoritos. Intenta de nuevo.');
    } finally {
      this.removingBookIds.delete(book.id);
    }
  }

  viewBookDetails(book: Book): void {
    // Aquí podrías navegar a la página de detalles del libro
    // o abrir un modal con más información
    console.log('Ver detalles de:', book.title);
    // Ejemplo: this.router.navigate(['/book', book.id]);
  }

  shareBook(book: Book): void {
    if (navigator.share) {
      navigator.share({
        title: book.title,
        text: `Te recomiendo este libro: ${book.title} por ${book.authors?.join(', ') || 'Autor desconocido'}`,
        url: window.location.href
      }).catch(console.error);
    } else {
      // Fallback para navegadores que no soportan Web Share API
      const text = `Te recomiendo este libro: ${book.title} por ${book.authors?.join(', ') || 'Autor desconocido'}`;
      navigator.clipboard.writeText(text).then(() => {
        alert('Información del libro copiada al portapapeles');
      }).catch(() => {
        alert('No se pudo compartir el libro');
      });
    }
  }

  // ==================== ACCIONES MASIVAS ====================

  exportFavorites(): void {
    const data = this.favorites.map(book => ({
      title: book.title,
      authors: book.authors?.join(', ') || '',
      categories: book.categories?.join(', ') || '',
      rating: book.averageRating || '',
      dateAdded: book.dateAddedToFavorites || ''
    }));

    const csvContent = this.convertToCSV(data);
    this.downloadCSV(csvContent, 'mis-favoritos.csv');
  }

  private convertToCSV(data: any[]): string {
    if (data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvRows = [];

    // Agregar headers
    csvRows.push(headers.join(','));

    // Agregar filas
    for (const row of data) {
      const values = headers.map(header => {
        const escaped = (row[header] + '').replace(/"/g, '\\"');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
  }

  private downloadCSV(content: string, filename: string): void {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  clearAllFavorites(): void {
    const confirmClear = confirm(
      `¿Estás seguro de que quieres quitar TODOS los ${this.favorites.length} libros de tus favoritos? Esta acción no se puede deshacer.`
    );
    
    if (confirmClear) {
      const secondConfirm = confirm('Esta acción eliminará todos tus favoritos permanentemente. ¿Continuar?');
      if (secondConfirm) {
        this.favoritesService.clearFavorites();
        console.log('✅ Todos los favoritos han sido eliminados');
      }
    }
  }

  // ==================== PAGINACIÓN ====================

  private updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredFavorites.length / this.itemsPerPage);
    
    // Asegurar que la página actual sea válida
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages;
    }
    
    // Obtener los elementos de la página actual
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.filteredFavorites = this.filteredFavorites.slice(startIndex, endIndex);
  }

  goToPage(page: number | string): void {
    if (typeof page === 'string') return;
    
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.applyFilters();
    }
  }

  getPageNumbers(): (number | string)[] {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (this.totalPages <= maxVisible) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (this.currentPage > 3) {
        pages.push('...');
      }

      const start = Math.max(2, this.currentPage - 1);
      const end = Math.min(this.totalPages - 1, this.currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (i !== 1 && i !== this.totalPages) {
          pages.push(i);
        }
      }

      if (this.currentPage < this.totalPages - 2) {
        pages.push('...');
      }

      if (this.totalPages > 1) {
        pages.push(this.totalPages);
      }
    }

    return pages;
  }

  // ==================== UTILIDADES ====================

  trackByBookId(index: number, book: Book): string {
    return book.id;
  }

  getStarsArray(rating: number): string[] {
    const stars: string[] = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push('filled');
    }

    if (hasHalfStar) {
      stars.push('half');
    }

    while (stars.length < 5) {
      stars.push('empty');
    }

    return stars;
  }

  truncateDescription(description: string, maxLength: number = 150): string {
    if (!description || description.length <= maxLength) {
      return description || '';
    }
    return description.substring(0, maxLength).trim() + '...';
  }

  getRelativeDate(date: Date | string | undefined): string {
    if (!date) return 'recientemente';

    const now = new Date();
    const addedDate = new Date(date);
    const diffInDays = Math.floor((now.getTime() - addedDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'hoy';
    if (diffInDays === 1) return 'ayer';
    if (diffInDays < 7) return `hace ${diffInDays} días`;
    if (diffInDays < 30) return `hace ${Math.floor(diffInDays / 7)} semana${Math.floor(diffInDays / 7) > 1 ? 's' : ''}`;
    if (diffInDays < 365) return `hace ${Math.floor(diffInDays / 30)} mes${Math.floor(diffInDays / 30) > 1 ? 'es' : ''}`;
    
    return `hace ${Math.floor(diffInDays / 365)} año${Math.floor(diffInDays / 365) > 1 ? 's' : ''}`;
  }

  getAverageRating(): number {
    if (this.favorites.length === 0) return 0;
    
    const ratedBooks = this.favorites.filter(book => book.averageRating && book.averageRating > 0);
    if (ratedBooks.length === 0) return 0;
    
    const totalRating = ratedBooks.reduce((sum, book) => sum + (book.averageRating || 0), 0);
    return totalRating / ratedBooks.length;
  }
}