import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReviewService } from '../../../../core/services/review.service';
import { UserService } from '../../../../core/services/user.service';

@Component({
  selector: 'app-write-review',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './write-review.component.html',
  styleUrl: './write-review.component.css'
})
export class WriteReviewComponent {
  @Input() bookId!: string;
  @Input() bookTitle!: string;
  @Output() reviewSubmitted = new EventEmitter<void>();

  rating = 0;
  title = '';
  content = '';
  hoveredRating = 0;
  isSubmitting = false;
  showForm = false;

  constructor(
    private reviewService: ReviewService,
    private userService: UserService
  ) {}

  get isLoggedIn(): boolean {
    return this.userService.isLoggedIn();
  }

  get canWriteReview(): boolean {
    return this.isLoggedIn && this.reviewService.canUserReview(this.bookId);
  }

  get currentUser() {
    return this.userService.getCurrentUser();
  }

  toggleForm(): void {
    if (!this.isLoggedIn) {
      alert('Debes iniciar sesión para escribir una reseña');
      return;
    }
    this.showForm = !this.showForm;
    if (this.showForm) {
      this.resetForm();
    }
  }

  setRating(stars: number): void {
    this.rating = stars;
  }

  setHoveredRating(stars: number): void {
    this.hoveredRating = stars;
  }

  clearHoveredRating(): void {
    this.hoveredRating = 0;
  }

  getStarClass(starNumber: number): string {
    const activeRating = this.hoveredRating || this.rating;
    return starNumber <= activeRating ? 'star active' : 'star';
  }

  isFormValid(): boolean {
    return this.rating > 0 && 
           this.title.trim().length >= 5 && 
           this.content.trim().length >= 20;
  }

  async submitReview(): Promise<void> {
    if (!this.isFormValid() || this.isSubmitting) return;

    this.isSubmitting = true;

    try {
      await this.reviewService.addReview(
        this.bookId,
        this.rating,
        this.title.trim(),
        this.content.trim()
      ).toPromise();

      // Éxito
      this.showForm = false;
      this.resetForm();
      this.reviewSubmitted.emit();
      
      // Feedback visual
      alert('¡Reseña enviada con éxito! Gracias por compartir tu opinión.');
      
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Error al enviar la reseña. Inténtalo de nuevo.');
    } finally {
      this.isSubmitting = false;
    }
  }

  private resetForm(): void {
    this.rating = 0;
    this.title = '';
    this.content = '';
    this.hoveredRating = 0;
  }

  getRemainingChars(field: 'title' | 'content'): number {
    const maxLength = field === 'title' ? 100 : 500;
    const currentLength = field === 'title' ? this.title.length : this.content.length;
    return maxLength - currentLength;
  }


}
