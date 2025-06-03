import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, combineLatest } from 'rxjs';
import { ReviewService } from '../../../../core/services/review.service';
import { UserService } from '../../../../core/services/user.service';
import { Review, ReviewSummary } from '../../../../models/review.model';
import { WriteReviewComponent } from '../write-review/write-review.component';

@Component({
  selector: 'app-book-reviews',
  standalone: true,
  imports: [CommonModule, FormsModule, DecimalPipe ],
  templateUrl: './book-reviews.component.html',
  styleUrls: ['./book-reviews.component.css']
})
export class BookReviewsComponent implements OnInit, OnDestroy {
  @Input() bookId!: string;
  
  reviews: Review[] = [];
  filteredReviews: Review[] = [];
  reviewSummary: ReviewSummary = {
    totalReviews: 0,
    averageRating: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  };
  
  // Filtros y ordenamiento
  filterRating: number | 'all' = 'all';
  sortBy: 'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful' = 'newest';
  
  // Paginación
  currentPage = 1;
  reviewsPerPage = 5;
  
  private destroy$ = new Subject<void>();

  constructor(
    private reviewService: ReviewService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadReviews();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getRatingCount(rating: number): number {
  return this.reviewSummary.ratingDistribution[rating as keyof typeof this.reviewSummary.ratingDistribution] || 0;
  }

  
  getRoundedAverageRating(): number {
    return Math.round(this.reviewSummary.averageRating);
  }

  private loadReviews(): void {
    combineLatest([
      this.reviewService.getReviewsByBook(this.bookId),
      this.reviewService.getReviewSummary(this.bookId)
    ]).pipe(takeUntil(this.destroy$))
      .subscribe(([reviews, summary]) => {
        this.reviews = reviews;
        this.reviewSummary = summary;
        this.applyFiltersAndSort();
      });
  }

  onReviewSubmitted(): void {
    // Recargar reseñas cuando se envía una nueva
    this.loadReviews();
  }

  onFilterChange(): void {
    this.currentPage = 1; // Reset página
    this.applyFiltersAndSort();
  }

  onSortChange(): void {
    this.currentPage = 1; // Reset página
    this.applyFiltersAndSort();
  }

  private applyFiltersAndSort(): void {
    let filtered = [...this.reviews];

    // Aplicar filtro por rating
    if (this.filterRating !== 'all') {
      filtered = filtered.filter(review => review.rating === this.filterRating);
    }

    // Aplicar ordenamiento
    switch (this.sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        break;
      case 'highest':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'lowest':
        filtered.sort((a, b) => a.rating - b.rating);
        break;
      case 'helpful':
        filtered.sort((a, b) => b.helpful - a.helpful);
        break;
    }

    this.filteredReviews = filtered;
  }

  markAsHelpful(reviewId: string): void {
    this.reviewService.markReviewHelpful(reviewId);
  }

  // Paginación
  get paginatedReviews(): Review[] {
    const startIndex = (this.currentPage - 1) * this.reviewsPerPage;
    return this.filteredReviews.slice(startIndex, startIndex + this.reviewsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredReviews.length / this.reviewsPerPage);
  }

  get hasReviews(): boolean {
    return this.reviews.length > 0;
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  // Helpers para el template
  getStars(rating: number): boolean[] {
    return Array(5).fill(false).map((_, i) => i < rating);
  }

  getEmptyStars(rating: number): boolean[] {
    return Array(5).fill(false).map((_, i) => i >= rating);
  }

  getPercentage(count: number, total: number): number {
    return total > 0 ? (count / total) * 100 : 0;
  }

  getFilterLabel(rating: number | 'all'): string {
    if (rating === 'all') return 'Todas';
    return `${rating} estrellas`;
  }

  getSortLabel(sort: string): string {
    const labels = {
      'newest': 'Más recientes',
      'oldest': 'Más antiguas',
      'highest': 'Mejor calificadas',
      'lowest': 'Peor calificadas',
      'helpful': 'Más útiles'
    };
    return labels[sort as keyof typeof labels] || sort;
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getRelativeTime(date: Date): string {
    const now = new Date();
    const reviewDate = new Date(date);
    const diffTime = Math.abs(now.getTime() - reviewDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Hace 1 día';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    if (diffDays < 30) return `Hace ${Math.ceil(diffDays / 7)} semanas`;
    if (diffDays < 365) return `Hace ${Math.ceil(diffDays / 30)} meses`;
    return `Hace ${Math.ceil(diffDays / 365)} años`;
  }

  getCurrentUser() {
    return this.userService.getCurrentUser();
  }

  canMarkHelpful(review: Review): boolean {
  const currentUser = this.getCurrentUser();
  if (!currentUser) {
    return false; // No está logueado
  }
  return currentUser.id !== review.userId; // No es su propia reseña
}


}