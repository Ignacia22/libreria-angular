export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  preferences?: {
    favoriteGenres: string[];
    language: string;
  };
}