import { Routes } from '@angular/router';
import { BookListComponent } from './features/books/pages/book-list/book-list.component';
import { BookDetailComponent } from './features/books/pages/book-detail/book-detail.component';
import { CartViewComponent } from './features/cart/pages/cart-view/cart-view.component';
import { UserProfileComponent } from './features/user/pages/user-profile/user-profile.component';
import { CartGuard } from './core/guards/cart.guard';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/books', pathMatch: 'full' },
  
  // ✅ Rutas públicas
  { path: 'books', component: BookListComponent },
  { path: 'books/:id', component: BookDetailComponent },
  
  // ✅ Rutas protegidas
  { 
    path: 'cart', 
    component: CartViewComponent,
    canActivate: [CartGuard] // Proteger carrito (debe tener items)
  },
  
  { 
    path: 'profile', 
    component: UserProfileComponent, // ← ¡Aquí está el cambio!
    canActivate: [AuthGuard] // Proteger perfil (debe estar logueado)
  },

  // ✅ Ruta de respaldo
  { path: '**', redirectTo: '/books' }
];