import { CommonModule, DecimalPipe } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CartItemComponent } from '../../components/cart-item/cart-item.component';
import { Cart } from '../../../../models/cart.model';
import { Subject, takeUntil } from 'rxjs';
import { CartService } from '../../../../core/services/cart.service';
import { UserService } from '../../../../core/services/user.service';

@Component({
  selector: 'app-cart-view',
  standalone: true,
  imports: [CommonModule, RouterModule, CartItemComponent, DecimalPipe],
  templateUrl: './cart-view.component.html',
  styleUrl: './cart-view.component.css'
})
export class CartViewComponent {
  cart: Cart = { items: [], total: 0, itemCount: 0, updatedAt: new Date() };
  isLoggedIn = false;

  private destroy$ = new Subject<void>();

  constructor(
    private cartService: CartService,
    private userService: UserService
  ) {}

   ngOnInit(): void {
    // Suscribirse al carrito
    this.cartService.cart$
      .pipe(takeUntil(this.destroy$))
      .subscribe(cart => {
        this.cart = cart;
      });

    // Suscribirse al estado del usuario
    this.userService.user$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.isLoggedIn = !!user;
      });
  }


  clearCart(): void {
    if (confirm('¿Estás segura de vaciar todo el carrito?')) {
      this.cartService.clearCart();
    }
  }

  proceedToCheckout(): void {
    if (!this.isLoggedIn) {
      alert('Debes iniciar sesión para realizar la compra');
      return;
    }

    if (this.cart.items.length === 0) {
      alert('El carrito está vacío');
      return;
    }

    // Simular checkout
    const purchaseData = {
      total: this.cart.total,
      books: this.cart.items.map(item => ({
        title: item.book.title,
        authors: item.book.authors,
        quantity: item.quantity,
        price: item.book.retailPrice?.amount || item.book.listPrice?.amount || 15.99
      })),
      paymentMethod: 'credit-card',
      status: 'completed'
    };

    // Agregar al historial de compras
    this.userService.addPurchase(purchaseData);
    
    // Limpiar carrito
    this.cartService.clearCart();
    
    alert('¡Compra realizada con éxito! Revisa tu historial de compras.');
  }

   continueShopping(): void {
    // Navegar de vuelta al catálogo
  }

  getSubtotal(): number {
    return this.cart.total;
  }

  getShipping(): number {
    // Envío gratis si la compra es mayor a $50
    return this.cart.total > 50 ? 0 : 5.99;
  }

  getTax(): number {
    // Impuesto del 8%
    return this.cart.total * 0.08;
  }

  getTotal(): number {
    return this.getSubtotal() + this.getShipping() + this.getTax();
  }

  trackByItemId(index: number, item: any): string {
  return item.book.id;
}

  getFormattedDate(): string {
    return this.cart.updatedAt.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
