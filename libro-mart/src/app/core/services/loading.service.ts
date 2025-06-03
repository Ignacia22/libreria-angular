import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  private activeRequests = new Set<string>();

  constructor() { }

  setLoading(loading: boolean, url: string): void {
    if (loading) {
      this.activeRequests.add(url);
    } else {
      this.activeRequests.delete(url);
    }

    // Mostrar loading si hay al menos una request activa
    this.loadingSubject.next(this.activeRequests.size > 0);
  }

  // Método para forzar loading (útil para operaciones que no son HTTP)
  show(): void {
    this.loadingSubject.next(true);
  }

  hide(): void {
    this.activeRequests.clear();
    this.loadingSubject.next(false);
  }

  isLoading(): boolean {
    return this.loadingSubject.value;
  }
}
