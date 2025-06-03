import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { Review, ReviewSummary } from '../../models/review.model';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {

  private reviewsSubject = new BehaviorSubject<Review[]>([]);
  public reviews$ = this.reviewsSubject.asObservable();

  constructor(private userService: UserService) {
    this.loadReviewsFromStorage();
  }

  // ✅ PUBLIC: API de reseñas
  addReview(bookId: string, rating: number, title: string, content: string): Observable<Review> {
    const currentUser = this.userService.getCurrentUser();
    if (!currentUser) {
      throw new Error('Usuario debe estar logueado para escribir reseña');
    }

    const newReview: Review = {
      id: this.generateReviewId(),
      bookId,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      rating,
      title,
      content,
      date: new Date(),
      helpful: 0,
      verifiedPurchase: this.hasUserPurchasedBook(currentUser.id, bookId)
    };

    const currentReviews = this.reviewsSubject.value;
    const updatedReviews = [newReview, ...currentReviews];
    
    this.reviewsSubject.next(updatedReviews);
    this.saveReviewsToStorage(updatedReviews);

    return new BehaviorSubject(newReview).asObservable();
  }

  getReviewsByBook(bookId: string): Observable<Review[]> {
    return this.reviews$.pipe(
      map(reviews => reviews.filter(review => review.bookId === bookId))
    );
  }

  getReviewSummary(bookId: string): Observable<ReviewSummary> {
    return this.getReviewsByBook(bookId).pipe(
      map(reviews => this.calculateReviewSummary(reviews))
    );
  }

  markReviewHelpful(reviewId: string): void {
    const currentReviews = this.reviewsSubject.value;
    const reviewIndex = currentReviews.findIndex(r => r.id === reviewId);
    
    if (reviewIndex >= 0) {
      currentReviews[reviewIndex].helpful += 1;
      this.reviewsSubject.next([...currentReviews]);
      this.saveReviewsToStorage(currentReviews);
    }
  }

  canUserReview(bookId: string): boolean {
    const currentUser = this.userService.getCurrentUser();
    if (!currentUser) return false;

    // Verificar si ya escribió una reseña para este libro
    const currentReviews = this.reviewsSubject.value;
    const existingReview = currentReviews.find(r => 
      r.bookId === bookId && r.userId === currentUser.id
    );

    return !existingReview;
  }

  getUserReview(bookId: string): Review | null {
    const currentUser = this.userService.getCurrentUser();
    if (!currentUser) return null;

    const currentReviews = this.reviewsSubject.value;
    return currentReviews.find(r => 
      r.bookId === bookId && r.userId === currentUser.id
    ) || null;
  }

  // 🔒 PRIVATE: Helpers internos
  private generateReviewId(): string {
    return 'review_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private calculateReviewSummary(reviews: Review[]): ReviewSummary {
    if (reviews.length === 0) {
      return {
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      };
    }

    const totalReviews = reviews.length;
    const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews;
    
    const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(review => {
      ratingDistribution[review.rating as keyof typeof ratingDistribution]++;
    });

    return {
      totalReviews,
      averageRating: Math.round(averageRating * 10) / 10,
      ratingDistribution
    };
  }

  private hasUserPurchasedBook(userId: string, bookId: string): boolean {
    // Aquí podrías verificar el historial de compras
    // Por ahora, simplificamos que siempre es true si está logueado
    return true;
  }

  private saveReviewsToStorage(reviews: Review[]): void {
    try {
      localStorage.setItem('libro-mart-reviews', JSON.stringify(reviews));
    } catch (error) {
      console.error('Error saving reviews:', error);
    }
  }

  private loadReviewsFromStorage(): void {
    try {
      const savedReviews = localStorage.getItem('libro-mart-reviews');
      if (savedReviews) {
        const reviews = JSON.parse(savedReviews);
        // Convertir fechas
        reviews.forEach((review: Review) => {
          review.date = new Date(review.date);
        });
        this.reviewsSubject.next(reviews);
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
    }
  }
}
