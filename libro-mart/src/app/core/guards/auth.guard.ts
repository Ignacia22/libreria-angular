import { Injectable } from '@angular/core';
import { CanActivate, CanActivateFn, Router, UrlTree } from '@angular/router';
import { UserService } from '../services/user.service';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class AuthGuard implements CanActivate {

  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.userService.user$.pipe(
      map(user => {
        if (user) {
          return true; // Usuario autenticado, permitir acceso
        } else {
          // Usuario no autenticado, redirigir y mostrar mensaje
          alert('🔒 Debes iniciar sesión para acceder a esta página');
          return this.router.createUrlTree(['/books']); // Redirigir al catálogo
        }
      })
    );
  }
}
