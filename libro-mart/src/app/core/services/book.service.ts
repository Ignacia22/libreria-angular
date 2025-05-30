import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { Book } from '../../models/book.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BookService {
  private readonly apiKey = environment.googleBooksApiKey;
  private readonly baseUrl = environment.googleBooksApiUrl;

  private searchResultsSubject = new BehaviorSubject<Book[]>([]);
  public searchResults$ = this.searchResultsSubject.asObservable();

  constructor(private http: HttpClient) { }

  // Buscar libros
  searchBooks(query: string, maxResults: number = 20): Observable<Book[]> {
    const url = `${this.baseUrl}?q=${encodeURIComponent(query)}&maxResults=${maxResults}&key=${this.apiKey}`;
    
    return this.http.get<any>(url).pipe(
      map(response => this.transformGoogleBooksResponse(response))
    );
  }

  // Obtener libro por ID
  getBookById(id: string): Observable<Book> {
    const url = `${this.baseUrl}/${id}?key=${this.apiKey}`;
    
    return this.http.get<any>(url).pipe(
      map(response => this.transformSingleBook(response))
    );
  }

  // Libros populares (simulado por ahora)
  getPopularBooks(): Observable<Book[]> {
    return this.searchBooks('bestseller fiction', 12);
  }

  // Buscar por categoría
  getBooksByCategory(category: string): Observable<Book[]> {
    return this.searchBooks(`subject:${category}`, 20);
  }

  // Transformar respuesta de Google Books API
  private transformGoogleBooksResponse(response: any): Book[] {
    if (!response.items) return [];
    
    return response.items.map((item: any) => this.transformSingleBook(item));
  }

  private transformSingleBook(item: any): Book {
    const volumeInfo = item.volumeInfo || {};
    const saleInfo = item.saleInfo || {};
    
    return {
      id: item.id,
      title: volumeInfo.title || 'Sin título',
      authors: volumeInfo.authors || ['Autor desconocido'],
      description: volumeInfo.description,
      publishedDate: volumeInfo.publishedDate,
      categories: volumeInfo.categories,
      averageRating: volumeInfo.averageRating,
      ratingsCount: volumeInfo.ratingsCount,
      imageLinks: volumeInfo.imageLinks,
      listPrice: saleInfo.listPrice,
      retailPrice: saleInfo.retailPrice,
      isbn: volumeInfo.industryIdentifiers?.[0]?.identifier,
      pageCount: volumeInfo.pageCount,
      language: volumeInfo.language
    };
  }

}
