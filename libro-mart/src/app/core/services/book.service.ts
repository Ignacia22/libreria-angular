import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Book } from '../../models/book.model';
import { environment } from '../../../environments/environment';

// ✅ NUEVA INTERFAZ para resultados paginados
export interface PaginatedBookResult {
  books: Book[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class BookService {
  private readonly apiKey = environment.googleBooksApiKey;
  private readonly baseUrl = environment.googleBooksApiUrl;
  
  private searchResultsSubject = new BehaviorSubject<Book[]>([]);
  public searchResults$ = this.searchResultsSubject.asObservable();

  constructor(private http: HttpClient) { }

  // ✅ NUEVO: Buscar libros con paginación
  searchBooksWithPagination(
    query: string, 
    page: number = 1, 
    itemsPerPage: number = 20
  ): Observable<PaginatedBookResult> {
    const startIndex = (page - 1) * itemsPerPage;
    const url = `${this.baseUrl}?q=${encodeURIComponent(query)}&startIndex=${startIndex}&maxResults=${itemsPerPage}`;
    
    return this.http.get<any>(url).pipe(
      map(response => this.transformToPaginatedResult(response, page, itemsPerPage))
    );
  }

  // ✅ NUEVO: Libros por categoría con paginación
  getBooksByCategoryWithPagination(
    category: string, 
    page: number = 1, 
    itemsPerPage: number = 20
  ): Observable<PaginatedBookResult> {
    return this.searchBooksWithPagination(`subject:${category}`, page, itemsPerPage);
  }

  // ✅ NUEVO: Libros populares con paginación
  getPopularBooksWithPagination(
    page: number = 1, 
    itemsPerPage: number = 20
  ): Observable<PaginatedBookResult> {
    return this.searchBooksWithPagination('bestseller fiction', page, itemsPerPage);
  }

  // Métodos originales (mantener para compatibilidad)
  searchBooks(query: string, maxResults: number = 20): Observable<Book[]> {
    const url = `${this.baseUrl}?q=${encodeURIComponent(query)}&maxResults=${maxResults}`;
    
    return this.http.get<any>(url).pipe(
      map(response => this.transformGoogleBooksResponse(response))
    );
  }

  getBookById(id: string): Observable<Book> {
    const url = `${this.baseUrl}/${id}`;
    
    return this.http.get<any>(url).pipe(
      map(response => this.transformSingleBook(response))
    );
  }

  getPopularBooks(): Observable<Book[]> {
    return this.searchBooks('bestseller fiction', 12);
  }

  getBooksByCategory(category: string): Observable<Book[]> {
    return this.searchBooks(`subject:${category}`, 20);
  }

  // ✅ NUEVO: Transformar a resultado paginado
  private transformToPaginatedResult(
    response: any, 
    currentPage: number, 
    itemsPerPage: number
  ): PaginatedBookResult {
    const books = this.transformGoogleBooksResponse(response);
    const totalItems = response.totalItems || 0;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
    return {
      books,
      totalItems,
      currentPage,
      totalPages,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1
    };
  }

  // Métodos de transformación existentes (sin cambios)
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