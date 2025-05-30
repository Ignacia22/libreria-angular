import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private userSubject = new BehaviorSubject<User | null>(null);
  public user$ = this.userSubject.asObservable();
  // purchaseHistorySubject es historial de compras
  private purchaseHistorySubject = new BehaviorSubject<any[]>([]); //  Es como una lista privada de todas las compras del usuario
  public purchaseHistory$ = this.purchaseHistorySubject.asObservable();

  constructor() { 
    this.loadUserFromStorage();
    this.loadPurchaseHistoryFromStorage();
  }

  // ✅ PUBLIC: API del usuario
  login(email: string, name: string): Observable<User> {
    const user: User = {
      id: this.generateUserId(),
      name,
      email,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=667eea&color=fff`,
      preferences: {
        favoriteGenres: [],
        language: 'es'
      }
    };

    this.userSubject.next(user);
    this.saveUserToStorage(user);
    
    return new BehaviorSubject(user).asObservable();
  }

  logout(): void {
    this.userSubject.next(null);
    this.clearUserFromStorage();
  }

  updatePreferences(favoriteGenres: string[], language: string = 'es'): void {
    const currentUser = this.userSubject.value;
    if (!currentUser) return;

    const updatedUser: User = {
      ...currentUser,
      preferences: {
        favoriteGenres,
        language
      }
    };

    this.userSubject.next(updatedUser);
    this.saveUserToStorage(updatedUser);
  }

  addToFavoriteGenres(genre: string): void {
    const currentUser = this.userSubject.value;
    if (!currentUser) return;

    const currentGenres = currentUser.preferences?.favoriteGenres || [];
    if (!currentGenres.includes(genre)) {
      const newGenres = [...currentGenres, genre];
      this.updatePreferences(newGenres, currentUser.preferences?.language || 'es');
    }
  }

  removeFromFavoriteGenres(genre: string): void {
    const currentUser = this.userSubject.value;
    if (!currentUser) return;

    const currentGenres = currentUser.preferences?.favoriteGenres || [];
    const newGenres = currentGenres.filter(g => g !== genre);
    this.updatePreferences(newGenres, currentUser.preferences?.language || 'es');
  }

  addPurchase(purchase: any): void {
    const currentHistory = this.purchaseHistorySubject.value; //  Dame el historial actual
    const newPurchase = {  //  Crear nueva compra con:
      id: this.generatePurchaseId(),   //    - ID único
      date: new Date(),    //    - Fecha actual
      ...purchase   //    - Info que me mandaron
    };

    const updatedHistory = [newPurchase, ...currentHistory];  //  Nueva compra AL INICIO
    this.purchaseHistorySubject.next(updatedHistory);   //  Actualizar lista
    this.savePurchaseHistoryToStorage(updatedHistory);  //  Guardar en localStorage
  }

  isLoggedIn(): boolean {
    return this.userSubject.value !== null;
  }

  getCurrentUser(): User | null {
    return this.userSubject.value;
  }

  getUserFavoriteGenres(): string[] {
    const user = this.userSubject.value;
    return user?.preferences?.favoriteGenres || [];
  }

  getPurchaseHistory(): Observable<any[]> {
    return this.purchaseHistory$;
  }


  // 🔒 PRIVATE: Helpers internos
  private generateUserId(): string {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9); //  Math.random() = números aleatorios
  }

  private generatePurchaseId(): string {  // Generar ID único
    return 'purchase_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private saveUserToStorage(user: User): void {
    try {
      localStorage.setItem('libro-mart-user', JSON.stringify(user));
    } catch (error) {
      console.error('Error saving user to localStorage:', error);
    }
  }

  private loadUserFromStorage(): void {
    try {
      const savedUser = localStorage.getItem('libro-mart-user');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        this.userSubject.next(user);
      }
    } catch (error) {
      console.error('Error loading user from localStorage:', error);
    }
  }

  private clearUserFromStorage(): void {
    try {
      localStorage.removeItem('libro-mart-user');
      localStorage.removeItem('libro-mart-purchase-history');
    } catch (error) {
      console.error('Error clearing user from localStorage:', error);
    }
  }

   private savePurchaseHistoryToStorage(history: any[]): void {  // Guarda el historial en localStorage para que persista entre sesiones.
    try {
      localStorage.setItem('libro-mart-purchase-history', JSON.stringify(history));
    } catch (error) {
      console.error('Error saving purchase history:', error);
    }
  }

  private loadPurchaseHistoryFromStorage(): void {
    try {
      const savedHistory = localStorage.getItem('libro-mart-purchase-history');
      if (savedHistory) {
        const history = JSON.parse(savedHistory);
        // Convertir fechas de string a Date
        history.forEach((purchase: any) => {
          purchase.date = new Date(purchase.date);
        });
        this.purchaseHistorySubject.next(history);
      }
    } catch (error) {
      console.error('Error loading purchase history:', error);
    }
  }

//   Al iniciar la app, busca historial guardado
// Convierte las fechas de texto a objetos Date
// Carga el historial en memoria
}
