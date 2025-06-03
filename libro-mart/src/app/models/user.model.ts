export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  preferences?: {
    favoriteGenres: string[];
    language: string;
  };
  // ✅ NUEVAS PROPIEDADES:
  bio?: string;
  location?: string;
  birthDate?: string;
  phone?: string;
  joinDate: Date;
  readingGoal?: number; // Libros por año
  favoriteAuthor?: string;
  coverImage?: string
}