import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Book } from '../../../models/book.model';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-book-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './book-card.component.html',
  styleUrl: './book-card.component.css'
})
export class BookCardComponent {
  @Input() book!: Book;
  
  constructor(private cartService: CartService) {}

  ngOnInit(): void {}

  addToCart(): void {
    this.cartService.addToCart(this.book, 1);
  }

  isInCart(): boolean {
    return this.cartService.isInCart(this.book.id);
  }

  getPrice(): number {
    return this.book.retailPrice?.amount || this.book.listPrice?.amount || 15.99;
  }

  getCurrency(): string {
    return this.book.retailPrice?.currencyCode || this.book.listPrice?.currencyCode || 'USD';
  }

  getAuthors(): string {
    return this.book.authors.join(', ');
  }

  getImageUrl(): string {
    return this.book.imageLinks?.thumbnail || 
           this.book.imageLinks?.smallThumbnail || 
           'https://via.placeholder.com/128x196?text=Sin+Imagen';
  }

  getRating(): number {
    return this.book.averageRating || 0;
  }

  getStars(): boolean[] {
    const rating = Math.round(this.getRating());
    return Array(5).fill(false).map((_, i) => i < rating);
  }
}
