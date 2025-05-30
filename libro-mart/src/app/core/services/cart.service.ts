import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Cart, CartItem } from '../../models/cart.model';
import { Book } from '../../models/book.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartSubject = new BehaviorSubject<Cart>(this.getInitialCart()); // El "estado interno" del carrito (privado)
  public cart$ = this.cartSubject.asObservable(); // La "ventana pública" para que otros componentes vean el carrito

  constructor() { 
    this.loadCartFromStorage(); // Cargar carrito guardado al iniciar
  }

  // ✅ PUBLIC: API del carrito
  addToCart(book: Book, quantity: number = 1): void {
    const currentCart = this.cartSubject.value; // Obtener carrito actual
    const existingItemIndex = currentCart.items.findIndex(item => item.book.id === book.id); // ¿El libro ya existe?

    if (existingItemIndex >= 0) {
      // El libro ya existe, aumentar cantidad
      currentCart.items[existingItemIndex].quantity += quantity;
    } else { // SI NO existe:
      // Nuevo libro en el carrito
      const newItem: CartItem = { //    Crear nuevo item
        book,
        quantity,
        addedAt: new Date()
      };
      currentCart.items.push(newItem); //    Agregarlo al carrito
    }

    this.updateCart(currentCart); //  Actualizar todo
  }

  removeFromCart(bookId: string): void {
    const currentCart = this.cartSubject.value;  //  Obtener carrito
    currentCart.items = currentCart.items.filter(item => item.book.id !== bookId); // Filtrar (quitar el libro)
    this.updateCart(currentCart);  //  Actualizar
  }

  updateQuantity(bookId: string, quantity: number): void {
    if (quantity <= 0) {  //  Si cantidad es 0 o menos:
      this.removeFromCart(bookId);   //    Quitar del carrito
      return;
    }

    const currentCart = this.cartSubject.value;  //  Obtener carrito
    const itemIndex = currentCart.items.findIndex(item => item.book.id === bookId);  //  Encontrar el libro

    if (itemIndex >= 0) {  //  Si existe:
      currentCart.items[itemIndex].quantity = quantity;  //    Cambiar cantidad
      this.updateCart(currentCart);  //    Actualizar
    }
  }

  clearCart(): void {
    const emptyCart = this.getInitialCart();
    this.updateCart(emptyCart);
  }

  getCartItem(bookId: string): CartItem | undefined {
    const currentCart = this.cartSubject.value;
    return currentCart.items.find(item => item.book.id === bookId);
  }

  isInCart(bookId: string): boolean {
    return !!this.getCartItem(bookId);
  }

  getCartItemCount(): number {
    return this.cartSubject.value.itemCount;
  }

  getCartTotal(): number {
    return this.cartSubject.value.total;
  }

  // 🔒 PRIVATE: Helpers internos
  private updateCart(cart: Cart): void {
    // Recalcular totales
    cart.total = this.calculateTotal(cart.items);  //  Recalcular precio total
    cart.itemCount = this.calculateItemCount(cart.items);  //  Recalcular precio total
    cart.updatedAt = new Date();  //  Actualizar fecha

    // Actualizar estado reactivo
    this.cartSubject.next(cart);  //  ¡Notificar a todos los componentes!
    
    // Persistir en localStorage
    this.saveCartToStorage(cart);   //  Guardar en localStorage
  }

  private calculateTotal(items: CartItem[]): number {
    return items.reduce((total, item) => {   // Para cada item:
      const price = item.book.retailPrice?.amount || item.book.listPrice?.amount || 0;  // Obtener precio
      return total + (price * item.quantity);  // Sumar al total
    }, 0);
  }

  private calculateItemCount(items: CartItem[]): number {
    return items.reduce((count, item) => count + item.quantity, 0); 
  }

  private getInitialCart(): Cart {
    return {
      items: [],
      total: 0,
      itemCount: 0,
      updatedAt: new Date()
    };
  }

  private saveCartToStorage(cart: Cart): void {
    try {
      localStorage.setItem('libro-mart-cart', JSON.stringify(cart));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }

  private loadCartFromStorage(): void {
    try {
      const savedCart = localStorage.getItem('libro-mart-cart');
      if (savedCart) {
        const cart = JSON.parse(savedCart);
        // Convertir fechas de string a Date
        cart.updatedAt = new Date(cart.updatedAt);
        cart.items.forEach((item: CartItem) => {
          item.addedAt = new Date(item.addedAt);
        });
        
        this.cartSubject.next(cart);
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      // Si hay error, usar carrito vacío
      this.cartSubject.next(this.getInitialCart());
    }
  }
}
