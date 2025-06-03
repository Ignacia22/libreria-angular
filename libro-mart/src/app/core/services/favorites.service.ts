import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Book } from '../../models/book.model';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  private favoritesSubject = new BehaviorSubject<Book[]>([]);
  public favorites$ = this.favoritesSubject.asObservable()

  constructor(private userService: UserService) { 
    this.loadFavoritesFromStorage();
  }

  // ✅ PUBLIC: API de favoritos
  addToFavorites(book: Book): void {
    const currentUser = this.userService.getCurrentUser();
    if (!currentUser) {
      alert('Debes iniciar sesión para agregar favoritos');
      return;
    }

    const currentFavorites = this.favoritesSubject.value;
    const exists = currentFavorites.find(fav => fav.id === book.id);
    
    if (!exists) {
      const updatedFavorites = [...currentFavorites, book];
      this.favoritesSubject.next(updatedFavorites);
      this.saveFavoritesToStorage(updatedFavorites);
      
      // Feedback visual
      console.log(`📚 "${book.title}" agregado a favoritos`);
    }
  }

  removeFromFavorites(bookId: string): void {
    const currentFavorites = this.favoritesSubject.value;
    const updatedFavorites = currentFavorites.filter(book => book.id !== bookId);
    
    this.favoritesSubject.next(updatedFavorites);
    this.saveFavoritesToStorage(updatedFavorites);
  }

  isInFavorites(bookId: string): boolean {
    const currentFavorites = this.favoritesSubject.value;
    return currentFavorites.some(book => book.id === bookId);
  }

  getFavoritesCount(): number {
    return this.favoritesSubject.value.length;
  }

  clearFavorites(): void {
    this.favoritesSubject.next([]);
    this.saveFavoritesToStorage([]);
  }

  getFavoritesByCategory(): { [category: string]: Book[] } {
    const favorites = this.favoritesSubject.value;
    const grouped: { [category: string]: Book[] } = {};

    favorites.forEach(book => {
      const category = book.categories?.[0] || 'Sin categoría';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(book);
    });

    return grouped;
  }

  // 🔒 PRIVATE: Persistencia
  private saveFavoritesToStorage(favorites: Book[]): void {
    const currentUser = this.userService.getCurrentUser();
    if (!currentUser) return;

    try {
      const key = `libro-mart-favorites-${currentUser.id}`;
      localStorage.setItem(key, JSON.stringify(favorites));
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  }

  private loadFavoritesFromStorage(): void {
    const currentUser = this.userService.getCurrentUser();
    if (!currentUser) return;

    try {
      const key = `libro-mart-favorites-${currentUser.id}`;
      const savedFavorites = localStorage.getItem(key);
      
      if (savedFavorites) {
        const favorites = JSON.parse(savedFavorites);
        this.favoritesSubject.next(favorites);
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  }

  // ✅ Llamar cuando cambie el usuario
  onUserChange(): void {
    this.loadFavoritesFromStorage();
  }
}
