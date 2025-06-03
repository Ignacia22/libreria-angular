import { Component, OnInit } from '@angular/core';
import { map, Observable } from 'rxjs';
import { CartService } from '../../../core/services/cart.service';
import { UserService } from '../../../core/services/user.service';
import { FavoritesService } from '../../../core/services/favorites.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  cartItemCount$: Observable<number>;
  favoritesCount$: Observable<number>;
  isLoggedIn$: Observable<boolean>;
  userName$: Observable<string>;

  constructor(
    private cartService: CartService,
    private userService: UserService,
    private favoritesService: FavoritesService
  ) {
    // Contador del carrito
    this.cartItemCount$ = this.cartService.cart$.pipe(
      map(cart => cart.itemCount)
    );
    
    // Contador de favoritos
    this.favoritesCount$ = this.favoritesService.favorites$.pipe(
      map(favorites => favorites.length)
    );
    
    // Estado de login
    this.isLoggedIn$ = this.userService.user$.pipe(
      map(user => !!user)
    );
    
    // Nombre del usuario
    this.userName$ = this.userService.user$.pipe(
      map(user => user?.name || '')
    );
  }

  ngOnInit(): void {
    // Cargar favoritos del usuario cuando se inicializa el header
    this.userService.user$.subscribe(user => {
      if (user) {
        this.favoritesService.onUserChange();
      }
    });
  }

  login(): void {
    // Simulación simple de login
    const name = prompt('¿Cómo te llamas?') || 'Usuario';
    const email = prompt('¿Tu email?') || 'usuario@email.com';
    this.userService.login(email, name);
  }

  logout(): void {
    this.userService.logout();
  }
}