export interface Review {
  id: string;
  bookId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number; // 1-5 estrellas
  title: string;
  content: string;
  date: Date;
  helpful: number; // votos de "útil"
  verifiedPurchase?: boolean;
}

export interface ReviewSummary {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}