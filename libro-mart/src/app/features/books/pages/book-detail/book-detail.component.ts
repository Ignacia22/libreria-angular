import { CommonModule, DecimalPipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Book } from '../../../../models/book.model';
import { Subject, takeUntil } from 'rxjs';
import { BookService } from '../../../../core/services/book.service';
import { CartService } from '../../../../core/services/cart.service';
import { WriteReviewComponent } from '../../components/write-review/write-review.component';
import { BookReviewsComponent } from '../../components/book-reviews/book-reviews.component';
import { PriceService } from '../../../../core/services/price.service';

@Component({
  selector: 'app-book-detail',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    FormsModule, 
    DecimalPipe,
    WriteReviewComponent,   
    BookReviewsComponent
  ],
  templateUrl: './book-detail.component.html',
  styleUrl: './book-detail.component.css'
})
export class BookDetailComponent {
  book: Book | null = null;
  relatedBooks: Book[] = [];
  loading = true;
  notFound = false;
  quantity = 1;
  showFullDescription = false;

  private destroy$ = new Subject<void>();


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookService: BookService,
    private cartService: CartService,
    private priceService: PriceService
  ) {}

  ngOnInit(): void {
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const bookId = params['id'];
        if (bookId) {
          this.loadBookDetail(bookId);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadBookDetail(bookId: string): void {
    this.loading = true;
    this.notFound = false;

    this.bookService.getBookById(bookId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (book) => {
          this.book = book;
          this.loading = false;
          this.loadRelatedBooks();
        },
        error: (error) => {
          console.error('Error loading book:', error);
          this.loading = false;
          this.notFound = true;
        }
      });
  }

  private loadRelatedBooks(): void {
    if (!this.book?.categories?.length) return;

    const category = this.book.categories[0];
    this.bookService.getBooksByCategory(category)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (books) => {
          // Filtrar el libro actual y tomar solo 4
          this.relatedBooks = books
            .filter(b => b.id !== this.book?.id)
            .slice(0, 4);
        },
        error: (error) => {
          console.error('Error loading related books:', error);
        }
      });
  }

  addToCart(): void {
    if (!this.book) return;
    
    this.cartService.addToCart(this.book, this.quantity);
    
    // Mostrar feedback visual
    const button = document.querySelector('.btn-add-cart') as HTMLElement;
    if (button) {
      const originalText = button.innerText;
      button.innerText = '✅ ¡Agregado!';
      button.style.background = '#27ae60';
      
      setTimeout(() => {
        button.innerText = originalText;
        button.style.background = '';
      }, 2000);
    }
  }

  updateQuantity(newQuantity: number): void {
    if (newQuantity >= 1 && newQuantity <= 10) {
      this.quantity = newQuantity;
    }
  }

  goBack(): void {
    this.router.navigate(['/books']);
  }

  isInCart(): boolean {
    return this.book ? this.cartService.isInCart(this.book.id) : false;
  }

  // Getters para el template
  getImageUrl(): string {
    if (!this.book) return '';
    return this.book.imageLinks?.thumbnail || 
           this.book.imageLinks?.smallThumbnail || 
           'https://via.placeholder.com/400x600?text=Sin+Imagen';
  }

  getPrice(): number {
  if (!this.book) return 0;
  return this.priceService.getBookPrice(this.book); 
  }

  getCurrency(): string {
    if (!this.book) return 'USD';
    return this.book.retailPrice?.currencyCode || this.book.listPrice?.currencyCode || 'USD';
  }

  getAuthors(): string {
    if (!this.book) return '';
    return this.book.authors.join(', ');
  }

  getRating(): number {
    return this.book?.averageRating || 0;
  }

  getStars(): boolean[] {
    const rating = Math.round(this.getRating());
    return Array(5).fill(false).map((_, i) => i < rating);
  }

  getPublishedYear(): string {
    if (!this.book?.publishedDate) return 'Desconocido';
    return new Date(this.book.publishedDate).getFullYear().toString();
  }

  getCategories(): string {
    if (!this.book?.categories?.length) return 'General';
    return this.book.categories.slice(0, 3).join(', ');
  }

  getDescription(): string {
    if (!this.book?.description) return 'Descripción no disponible.';
    
    // Limpiar HTML tags básicos si existen
    return this.book.description
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>');
  }

  hasLongDescription(): boolean {
    return this.getDescription().length > 500;
  }

  getShortDescription(): string {
    const desc = this.getDescription();
    return desc.length > 500 ? desc.substring(0, 500) + '...' : desc;
  }

  onReviewSubmitted(): void {
  // Este método se ejecuta cuando se envía una nueva reseña
  // Los componentes de reseñas se actualizarán automáticamente
  console.log('Nueva reseña enviada para el libro:', this.book?.title);
}
}
