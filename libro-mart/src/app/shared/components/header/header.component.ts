import { Component } from '@angular/core';
import { map, Observable } from 'rxjs';
import { CartService } from '../../../core/services/cart.service';
import { UserService } from '../../../core/services/user.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  cartItemCount$: Observable<number>;
  isLoggedIn$: Observable<boolean>;
  userName$: Observable<string>;

  constructor(
    private cartService: CartService,
    private userService: UserService
  ) {
    this.cartItemCount$ = this.cartService.cart$.pipe(
      map(cart => cart.itemCount)
    );
    
    this.isLoggedIn$ = this.userService.user$.pipe(
      map(user => !!user)
    );
    
    this.userName$ = this.userService.user$.pipe(
      map(user => user?.name || '')
    );
  }

  ngOnInit(): void {}

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
