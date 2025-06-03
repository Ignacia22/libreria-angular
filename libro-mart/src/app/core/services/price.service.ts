import { Injectable } from '@angular/core';
import { Book } from '../../models/book.model';

@Injectable({
  providedIn: 'root'
})
export class PriceService {
  
  // ✅ Precios por defecto en PESOS CHILENOS
  private defaultPrices = {
    'Fiction': 15990,           // ~$16 USD
    'Mystery': 13990,           // ~$14 USD  
    'Romance': 12990,           // ~$13 USD
    'Science': 22990,           // ~$23 USD
    'History': 18990,           // ~$19 USD
    'Biography': 19990,         // ~$20 USD
    'Technology': 29990,        // ~$30 USD
    'Business & Economics': 24990, // ~$25 USD
    'Self-Help': 16990,         // ~$17 USD
    'Health & Fitness': 17990,  // ~$18 USD
    'default': 14990            // ~$15 USD
  };

  // ✅ Tasa de conversión USD a CLP (aproximada)
  private readonly USD_TO_CLP = 850;

  constructor() { }

  // ✅ Método principal para obtener precio en CLP
  getBookPrice(book: Book): number {
    // 1. Intentar precio real de la API (convertir de USD a CLP)
    if (book.retailPrice?.amount && book.retailPrice.currencyCode === 'USD') {
      return Math.round(book.retailPrice.amount * this.USD_TO_CLP);
    }
    
    if (book.listPrice?.amount && book.listPrice.currencyCode === 'USD') {
      return Math.round(book.listPrice.amount * this.USD_TO_CLP);
    }

    // Si ya está en CLP, usar directamente
    if (book.retailPrice?.amount && book.retailPrice.currencyCode === 'CLP') {
      return book.retailPrice.amount;
    }
    
    if (book.listPrice?.amount && book.listPrice.currencyCode === 'CLP') {
      return book.listPrice.amount;
    }
    
    // 2. Usar precio por defecto en CLP
    return this.getDefaultPrice(book);
  }

  // ✅ Precio por defecto inteligente en CLP
  private getDefaultPrice(book: Book): number {
    if (!book.categories || book.categories.length === 0) {
      return this.defaultPrices.default;
    }

    // Buscar precio por categoría
    for (const category of book.categories) {
      if (this.defaultPrices[category as keyof typeof this.defaultPrices]) {
        return this.defaultPrices[category as keyof typeof this.defaultPrices];
      }
    }

    // Precio especial por número de páginas (en CLP)
    if (book.pageCount) {
      if (book.pageCount > 500) return 24990; // Libros largos
      if (book.pageCount > 300) return 19990; // Libros medianos
      if (book.pageCount > 100) return 16990; // Libros cortos
    }

    return this.defaultPrices.default;
  }

  // ✅ Formatear precio chileno
  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  }

  // ✅ Formato corto sin símbolo (para mostrar en cards)
  formatPriceShort(price: number): string {
    return new Intl.NumberFormat('es-CL', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  }

  // ✅ Calcular descuentos
  applyDiscount(price: number, discountPercent: number): number {
    return Math.round(price * (1 - discountPercent / 100));
  }

  // ✅ Precio con IVA (19% en Chile)
  addIVA(price: number): number {
    return Math.round(price * 1.19);
  }

  // ✅ Obtener precio sin IVA
  getNetPrice(price: number): number {
    return Math.round(price / 1.19);
  }
}