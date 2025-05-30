import { Book } from './book.model';

export interface CartItem {
  book: Book;
  quantity: number;
  addedAt: Date;
}

export interface Cart {
  items: CartItem[];
  total: number;
  itemCount: number;
  updatedAt: Date;
}