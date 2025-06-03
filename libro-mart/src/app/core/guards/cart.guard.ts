import { Injectable } from '@angular/core';
import { CanActivate, CanActivateFn, Router, UrlTree } from '@angular/router';
import { CartService } from '../services/cart.service';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartGuard implements CanActivate {

  constructor(
    private cartService: CartService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.cartService.cart$.pipe(
      map(cart => {
        if (cart.items.length > 0) {
          return true; // Carrito tiene items, permitir acceso
        } else {
          // Carrito vacío, redirigir y mostrar mensaje
          alert('🛒 Tu carrito está vacío. Agrega algunos libros primero.');
          return this.router.createUrlTree(['/books']); // Redirigir al catálogo
        }
      })
    );
  }
}
