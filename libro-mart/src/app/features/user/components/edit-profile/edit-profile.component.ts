import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { User } from '../../../../models/user.model';
import { UserService } from '../../../../core/services/user.service';

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-profile.component.html',
  styleUrl: './edit-profile.component.css'
})
export class EditProfileComponent implements OnInit, OnChanges {
  @Input() user: User | null = null;
  @Output() profileUpdated = new EventEmitter<void>();

  profileForm: FormGroup;
  isSubmitting = false;

  // Opciones para formulario
  genres = [
    'Fiction', 'Mystery', 'Romance', 'Science Fiction', 'Fantasy',
    'History', 'Biography', 'Technology', 'Business', 'Self-Help',
    'Health & Fitness', 'Travel', 'Cooking', 'Art', 'Philosophy'
  ];

  countries = [
    'Chile', 'Argentina', 'Perú', 'Colombia', 'México', 
    'España', 'Estados Unidos', 'Brasil', 'Uruguay', 'Bolivia'
  ];

  constructor(
    private fb: FormBuilder,
    private userService: UserService
  ) {
    this.profileForm = this.createForm();
  }

  ngOnInit(): void {
    this.populateForm();
  }

  ngOnChanges(): void {
    this.populateForm();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      bio: ['', [Validators.maxLength(500)]],
      location: [''],
      birthDate: [''],
      phone: ['', [Validators.pattern(/^[+]?[0-9\s\-\(\)]{0,20}$/)]],
      favoriteAuthor: ['', [Validators.maxLength(100)]],
      readingGoal: [12, [Validators.min(1), Validators.max(365)]],
      favoriteGenres: [[]]
    });
  }

  private populateForm(): void {
    if (this.user) {
      this.profileForm.patchValue({
        name: this.user.name || '',
        email: this.user.email || '',
        bio: this.user.bio || '',
        location: this.user.location || '',
        birthDate: this.user.birthDate || '',
        phone: this.user.phone || '',
        favoriteAuthor: this.user.favoriteAuthor || '',
        readingGoal: this.user.readingGoal || 12,
        favoriteGenres: this.user.preferences?.favoriteGenres || []
      });
    }
  }

   // ✅ Manejar géneros favoritos
  onGenreChange(genre: string, event: any): void {
    const favoriteGenres = this.profileForm.get('favoriteGenres')?.value || [];
    
    if (event.target.checked) {
      if (!favoriteGenres.includes(genre)) {
        favoriteGenres.push(genre);
      }
    } else {
      const index = favoriteGenres.indexOf(genre);
      if (index > -1) {
        favoriteGenres.splice(index, 1);
      }
    }
    
    this.profileForm.patchValue({ favoriteGenres });
  }

  isGenreSelected(genre: string): boolean {
    const favoriteGenres = this.profileForm.get('favoriteGenres')?.value || [];
    return favoriteGenres.includes(genre);
  }

  // ✅ Generar nuevo avatar
  generateNewAvatar(): void {
    const name = this.profileForm.get('name')?.value || 'Usuario';
    const colors = ['667eea', 'f093fb', '4facfe', '43e97b', 'fa709a', 'ffecd2', 'a8edea', 'fed6e3'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    const newAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${randomColor}&color=fff&size=200`;
    
    // Actualizar el usuario temporalmente para preview
    if (this.user) {
      this.user.avatar = newAvatar;
    }
  }

  // ✅ Validación y envío
  onSubmit(): void {
    if (this.profileForm.invalid || this.isSubmitting) {
      this.markFormGroupTouched();
      return;
    }

    this.isSubmitting = true;
    const formData = this.profileForm.value;

    // Preparar datos actualizados
    const updates: Partial<User> = {
      name: formData.name,
      email: formData.email,
      bio: formData.bio,
      location: formData.location,
      birthDate: formData.birthDate,
      phone: formData.phone,
      favoriteAuthor: formData.favoriteAuthor,
      readingGoal: formData.readingGoal,
      preferences: {
        favoriteGenres: formData.favoriteGenres,
        language: this.user?.preferences?.language || 'es'
      }
    };

    // Simular delay de guardado
    setTimeout(() => {
      this.userService.updateProfile(updates);
      this.isSubmitting = false;
      this.profileUpdated.emit();
      
      // Feedback visual
      alert('✅ Perfil actualizado exitosamente');
    }, 1000);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.profileForm.controls).forEach(field => {
      const control = this.profileForm.get(field);
      control?.markAsTouched({ onlySelf: true });
    });
  }

  // ✅ Helpers para validación
  isFieldInvalid(fieldName: string): boolean {
    const field = this.profileForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.profileForm.get(fieldName);
    if (field && field.errors && field.touched) {
      const errors = field.errors;
      
      if (errors['required']) return `${fieldName} es requerido`;
      if (errors['email']) return 'Email inválido';
      if (errors['minlength']) return `Mínimo ${errors['minlength'].requiredLength} caracteres`;
      if (errors['maxlength']) return `Máximo ${errors['maxlength'].requiredLength} caracteres`;
      if (errors['pattern']) return 'Formato inválido';
      if (errors['min']) return `Valor mínimo: ${errors['min'].min}`;
      if (errors['max']) return `Valor máximo: ${errors['max'].max}`;
    }
    return '';
  }

  // ✅ Resetear formulario
  resetForm(): void {
    this.populateForm();
    this.profileForm.markAsUntouched();
  }

  // ✅ Calcular edad
  getAge(): number {
    const birthDate = this.profileForm.get('birthDate')?.value;
    if (!birthDate) return 0;
    
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  }
}
