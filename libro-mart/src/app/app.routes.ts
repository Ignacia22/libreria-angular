import { Routes } from '@angular/router';
import { BookListComponent } from './features/books/pages/book-list/book-list.component';
import { BookDetailComponent } from './features/books/pages/book-detail/book-detail.component';
import { CartViewComponent } from './features/cart/pages/cart-view/cart-view.component';

export const routes: Routes = [
    { path: '', redirectTo: '/books', pathMatch: 'full' },
    { path: 'books', component: BookListComponent },
    { path: 'books/:id', component: BookDetailComponent },
    { path: 'cart', component: CartViewComponent },
    { path: '**', redirectTo: '/books' }
];
