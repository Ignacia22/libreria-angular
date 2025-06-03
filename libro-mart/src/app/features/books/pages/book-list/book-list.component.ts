import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BookCardComponent } from '../../../../shared/components/book-card/book-card.component';
import { Book } from '../../../../models/book.model';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { BookService } from '../../../../core/services/book.service';

@Component({
  selector: 'app-book-list',
  standalone: true,
  imports: [CommonModule, FormsModule, BookCardComponent],
  templateUrl: './book-list.component.html',
  styleUrl: './book-list.component.css'
})
export class BookListComponent implements OnInit, OnDestroy {
  books: Book[] = [];
  loading = false;
  searchTerm = '';
  selectedCategory = 'all';
  noResults = false;

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
    // Configurar búsqueda con debounce
    this.searchSubject.pipe(
      debounceTime(500), // Esperar 500ms después de que el usuario pare de escribir
      distinctUntilChanged(), // Solo buscar si el término cambió
      takeUntil(this.destroy$)
    ).subscribe(searchTerm => {
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

  // ✅ Cargar libros populares por defecto
  loadPopularBooks(): void {
    this.loading = true;
    this.noResults = false;
    
    this.bookService.getPopularBooks()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (books) => {
          this.books = books;
          this.loading = false;
          this.noResults = books.length === 0;
        },
        error: (error) => {
          console.error('Error loading popular books:', error);
          this.loading = false;
          this.noResults = true;
        }
      });
    }

    // ✅ Búsqueda con debounce
  onSearchChange(searchTerm: string): void {
    this.searchTerm = searchTerm;
    if (searchTerm.trim().length > 0) {
      this.searchSubject.next(searchTerm.trim());
    } else {
      this.loadPopularBooks();
    }
  }

   // ✅ Buscar por categoría
  onCategoryChange(): void {
    if (this.selectedCategory === 'all') {
      this.loadPopularBooks();
    } else {
      this.loading = true;
      this.noResults = false;
      
      this.bookService.getBooksByCategory(this.selectedCategory)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (books) => {
            this.books = books;
            this.loading = false;
            this.noResults = books.length === 0;
          },
          error: (error) => {
            console.error('Error loading books by category:', error);
            this.loading = false;
            this.noResults = true;
          }
        });
    }
  }

  // 🔒 Realizar búsqueda
  private performSearch(searchTerm: string): void {
    if (!searchTerm || searchTerm.length < 2) {
      this.loadPopularBooks();
      return;
    }

    this.loading = true;
    this.noResults = false;
    
    this.bookService.searchBooks(searchTerm, 24)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (books) => {
          this.books = books;
          this.loading = false;
          this.noResults = books.length === 0;
        },
        error: (error) => {
          console.error('Error searching books:', error);
          this.loading = false;
          this.noResults = true;
        }
      });
  }

  // ✅ Limpiar búsqueda
  clearSearch(): void {
    this.searchTerm = '';
    this.selectedCategory = 'all';
    this.loadPopularBooks();
  }

  // ✅ Getters para el template
  getResultsText(): string {
    if (this.loading) return 'Buscando...';
    if (this.noResults) return 'No se encontraron libros';
    if (this.searchTerm) return `${this.books.length} libros encontrados para "${this.searchTerm}"`;
    if (this.selectedCategory !== 'all') {
      const category = this.categories.find(c => c.value === this.selectedCategory);
      return `${this.books.length} libros en ${category?.label || this.selectedCategory}`;
    }
    return `${this.books.length} libros populares`;
  }

  trackByBookId(index: number, book: Book): string {
  return book.id;
}
}
