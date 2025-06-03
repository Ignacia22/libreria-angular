import { Component, Input, OnInit } from '@angular/core';
import { CartItem } from '../../../../models/cart.model';
import { CartService } from '../../../../core/services/cart.service';
import { CommonModule, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-cart-item',
  standalone: true,
  imports: [CommonModule, DecimalPipe],
  templateUrl: './cart-item.component.html',
  styleUrl: './cart-item.component.css'
})
export class CartItemComponent implements OnInit {
  @Input() item!: CartItem;

  constructor(private cartService: CartService) {}

  ngOnInit(): void {}

  updateQuantity(newQuantity: number): void {
    if (newQuantity < 1) {
      this.removeItem();
      return;
    }
    this.cartService.updateQuantity(this.item.book.id, newQuantity);
  }

  removeItem(): void {
    this.cartService.removeFromCart(this.item.book.id);
  }

  getImageUrl(): string {
    return this.item.book.imageLinks?.thumbnail || 
           this.item.book.imageLinks?.smallThumbnail || 
           'https://via.placeholder.com/80x120?text=Sin+Imagen';
  }

  getPrice(): number {
    return this.item.book.retailPrice?.amount || this.item.book.listPrice?.amount || 15.99;
  }

  getSubtotal(): number {
    return this.getPrice() * this.item.quantity;
  }

  getAuthors(): string {
    return this.item.book.authors.join(', ');
  }
}
