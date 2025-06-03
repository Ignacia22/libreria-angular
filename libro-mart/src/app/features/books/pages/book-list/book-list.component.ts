import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { BookService, PaginatedBookResult } from '../../../../core/services/book.service'; // ✅ Importar interfaz
import { Book } from '../../../../models/book.model';
import { BookCardComponent } from '../../../../shared/components/book-card/book-card.component';

@Component({
  selector: 'app-book-list',
  standalone: true,
  imports: [CommonModule, FormsModule, BookCardComponent],
  templateUrl: './book-list.component.html',
  styleUrls: ['./book-list.component.css']
})
export class BookListComponent implements OnInit, OnDestroy {
  books: Book[] = [];
  loading = false;
  searchTerm = '';
  selectedCategory = 'all';
  noResults = false;
  
  // ✅ NUEVAS PROPIEDADES para paginación
  currentPage = 1;
  totalPages = 0;
  totalItems = 0;
  itemsPerPage = 20;
  hasNextPage = false;
  hasPrevPage = false;
  
  categories = [
    { value: 'all', label: 'Todas las categorías' },
    { value: 'fiction', label: 'Ficción' },
    { value: 'mystery', label: 'Misterio' },
    { value: 'romance', label: 'Romance' },
    { value: 'science', label: 'Ciencia' },
    { value: 'history', label: 'Historia' },
    { value: 'biography', label: 'Biografía' },
    { value: 'technology', label: 'Tecnología' }
  ];

  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  constructor(private bookService: BookService) {
    this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(searchTerm => {
      this.currentPage = 1; // Reset página en nueva búsqueda
      this.performSearch(searchTerm);
    });
  }

  ngOnInit(): void {
    this.loadPopularBooks();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ✅ MODIFICADO: Cargar libros populares con paginación
  loadPopularBooks(): void {
    this.loading = true;
    this.noResults = false;
    
    this.bookService.getPopularBooksWithPagination(this.currentPage, this.itemsPerPage)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.updatePaginationData(result);
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading popular books:', error);
          this.loading = false;
          this.noResults = true;
        }
      });
  }

  onSearchChange(searchTerm: string): void {
    this.searchTerm = searchTerm;
    if (searchTerm.trim().length > 0) {
      this.searchSubject.next(searchTerm.trim());
    } else {
      this.currentPage = 1;
      this.loadPopularBooks();
    }
  }

  // ✅ MODIFICADO: Búsqueda por categoría con paginación
  onCategoryChange(): void {
    this.currentPage = 1; // Reset página
    if (this.selectedCategory === 'all') {
      this.loadPopularBooks();
    } else {
      this.loading = true;
      this.noResults = false;
      
      this.bookService.getBooksByCategoryWithPagination(this.selectedCategory, this.currentPage, this.itemsPerPage)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (result) => {
            this.updatePaginationData(result);
            this.loading = false;
          },
          error: (error) => {
            console.error('Error loading books by category:', error);
            this.loading = false;
            this.noResults = true;
          }
        });
    }
  }

  // ✅ NUEVO: Cambiar página
  onPageChange(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) return;
    
    this.currentPage = page;
    this.scrollToTop();
    
    if (this.searchTerm.trim()) {
      this.performSearch(this.searchTerm.trim());
    } else if (this.selectedCategory === 'all') {
      this.loadPopularBooks();
    } else {
      this.onCategoryChange();
    }
  }

  // ✅ NUEVO: Scroll al inicio al cambiar página
  private scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ✅ MODIFICADO: Búsqueda con paginación
  private performSearch(searchTerm: string): void {
    if (!searchTerm || searchTerm.length < 2) {
      this.loadPopularBooks();
      return;
    }

    this.loading = true;
    this.noResults = false;
    
    this.bookService.searchBooksWithPagination(searchTerm, this.currentPage, this.itemsPerPage)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.updatePaginationData(result);
          this.loading = false;
        },
        error: (error) => {
          console.error('Error searching books:', error);
          this.loading = false;
          this.noResults = true;
        }
      });
  }

  // ✅ NUEVO: Actualizar datos de paginación
  private updatePaginationData(result: PaginatedBookResult): void {
    this.books = result.books;
    this.currentPage = result.currentPage;
    this.totalPages = result.totalPages;
    this.totalItems = result.totalItems;
    this.hasNextPage = result.hasNextPage;
    this.hasPrevPage = result.hasPrevPage;
    this.noResults = result.books.length === 0;
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.selectedCategory = 'all';
    this.currentPage = 1;
    this.loadPopularBooks();
  }

  // ✅ MODIFICADO: Texto de resultados con paginación
  getResultsText(): string {
    if (this.loading) return 'Buscando...';
    if (this.noResults) return 'No se encontraron libros';
    
    const startItem = (this.currentPage - 1) * this.itemsPerPage + 1;
    const endItem = Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
    
    if (this.searchTerm) {
      return `${startItem}-${endItem} de ${this.totalItems} libros para "${this.searchTerm}"`;
    }
    if (this.selectedCategory !== 'all') {
      const category = this.categories.find(c => c.value === this.selectedCategory);
      return `${startItem}-${endItem} de ${this.totalItems} libros en ${category?.label || this.selectedCategory}`;
    }
    return `${startItem}-${endItem} de ${this.totalItems} libros populares`;
  }

  // ✅ NUEVO: Métodos para paginación
  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;
    
    let startPage = Math.max(1, this.currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(this.totalPages, startPage + maxPagesToShow - 1);
    
    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  trackByBookId(index: number, book: Book): string {
  return book.id;
}
}