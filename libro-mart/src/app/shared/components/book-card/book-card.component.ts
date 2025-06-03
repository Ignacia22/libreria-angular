import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Book } from '../../../models/book.model';
import { CartService } from '../../../core/services/cart.service';
import { PriceService } from '../../../core/services/price.service';
import { FavoritesService } from '../../../core/services/favorites.service';

@Component({
  selector: 'app-book-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './book-card.component.html',
  styleUrl: './book-card.component.css'
})
export class BookCardComponent {
  @Input() book!: Book;
  private hasErrored = false;
  
  constructor(
    private cartService: CartService,
    private priceService: PriceService,
    private favoritesService: FavoritesService
  ) {}

  ngOnInit(): void {}

  addToCart(): void {
    this.cartService.addToCart(this.book, 1);
  }

  isInCart(): boolean {
    return this.cartService.isInCart(this.book.id);
  }

  getPrice(): number {
    return this.priceService.getBookPrice(this.book);
  }

  getCurrency(): string {
    return this.book.retailPrice?.currencyCode || this.book.listPrice?.currencyCode || 'USD';
  }

  getAuthors(): string {
    return this.book.authors.join(', ');
  }


  getImageUrl(): string {
    if (this.hasErrored) {
      return this.getDefaultImage();
    }
    
    return this.book.imageLinks?.thumbnail || 
           this.book.imageLinks?.smallThumbnail || 
           this.getDefaultImage();
  }

  getRating(): number {
    return this.book.averageRating || 0;
  }

  getStars(): boolean[] {
    const rating = Math.round(this.getRating());
    return Array(5).fill(false).map((_, i) => i < rating);
  }

   // ✅ ARREGLAR: onImageError con protección
  onImageError(event: Event): void {
    if (this.hasErrored) return; // ← Evitar bucle
    
    const target = event.target as HTMLImageElement;
    if (target) {
      this.hasErrored = true;
      target.src = this.getDefaultImage(); // ← Usar imagen segura
    }
  }

  addToFavorites(): void {
    this.favoritesService.addToFavorites(this.book);
  }

  removeFromFavorites(): void {
    this.favoritesService.removeFromFavorites(this.book.id);
  }

  isInFavorites(): boolean {
    return this.favoritesService.isInFavorites(this.book.id);
  }

  toggleFavorite(): void {
    if (this.isInFavorites()) {
      this.removeFromFavorites();
    } else {
      this.addToFavorites();
    }
  }

  private getDefaultImage(): string {
    // Imagen base64 embebida (nunca falla)
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjE5NiIgdmlld0JveD0iMCAwIDEyOCAxOTYiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjgiIGhlaWdodD0iMTk2IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik01NCA4OEg3NFY5Nkg1NFY4OFoiIGZpbGw9IiM5Q0E0QUYiLz4KPHBhdGggZD0iTTQyIDEwOEg4NlYxMTZINDJWMTA4WiIgZmlsbD0iIzlDQTRBRiIvPgo8dGV4dCB4PSI2NCIgeT0iMTMwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNkI3Mjg1IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTAiPlNpbiBJbWFnZW48L3RleHQ+Cjwvc3ZnPg==';
  }
}
