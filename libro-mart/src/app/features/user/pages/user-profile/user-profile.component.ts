import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, ViewChild, ElementRef, HostListener } from '@angular/core';
import { RouterModule } from '@angular/router';
import { EditProfileComponent } from '../../components/edit-profile/edit-profile.component';
import { FavoritesListComponent } from '../../components/favorites-list/favorites-list.component';
import { User } from '../../../../models/user.model';
import { Book } from '../../../../models/book.model';
import { Subject, takeUntil } from 'rxjs';
import { UserService } from '../../../../core/services/user.service';
import { FavoritesService } from '../../../../core/services/favorites.service';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, EditProfileComponent, FavoritesListComponent],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css'
})
export class UserProfileComponent implements OnInit, OnDestroy {
  @ViewChild('avatarInput') avatarInput!: ElementRef<HTMLInputElement>;
  @ViewChild('coverInput') coverInput!: ElementRef<HTMLInputElement>;

  user: User | null = null;
  favorites: Book[] = [];
  favoritesByCategory: { [category: string]: Book[] } = {};

  // Pestañas del perfil
  activeTab: 'overview' | 'edit' | 'favorites' | 'reading' = 'overview';
  
  // Control de opciones de avatar
  showAvatarOptions = false;

  // URLs de imágenes con fallbacks
  private defaultAvatarUrl = 'https://ui-avatars.com/api/?background=667eea&color=fff&size=200&name=Usuario';
  private defaultCoverUrl = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';

  private destroy$ = new Subject<void>();

  constructor(
    private userService: UserService,
    private favoritesService: FavoritesService
  ) {}

  ngOnInit(): void {
    // Suscribirse al usuario actual
    this.userService.user$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.user = user;
        if (user) {
          this.favoritesService.onUserChange();
        }
      });

    // Suscribirse a favoritos
    this.favoritesService.favorites$
      .pipe(takeUntil(this.destroy$))
      .subscribe(favorites => {
        this.favorites = favorites;
        this.favoritesByCategory = this.favoritesService.getFavoritesByCategory();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ==================== GESTIÓN DE PESTAÑAS ====================
  
  setActiveTab(tab: 'overview' | 'edit' | 'favorites' | 'reading'): void {
    this.activeTab = tab;
  }

  // ==================== GESTIÓN DE IMÁGENES ====================

  getAvatarUrl(): string {
    if (this.user?.avatar) {
      return this.user.avatar;
    }
    
    // Generar avatar automático con el nombre
    const name = this.user?.name || 'Usuario';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=667eea&color=fff&size=200`;
  }

  getCoverBackground(): string {
    if (this.user?.coverImage) {
      return `url(${this.user.coverImage})`;
    }
    return this.defaultCoverUrl;
  }

  onAvatarError(event: any): void {
    // Si falla la carga del avatar, usar el default
    event.target.src = this.defaultAvatarUrl;
  }

  // ==================== EDICIÓN DE AVATAR ====================

  editAvatar(): void {
    this.showAvatarOptions = !this.showAvatarOptions;
  }

  selectAvatarFile(): void {
    this.avatarInput.nativeElement.click();
    this.showAvatarOptions = false;
  }

  onAvatarChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.processImageFile(file, 'avatar');
    }
  }

  generateRandomAvatar(): void {
    const colors = ['667eea', 'f093fb', '4facfe', '43e97b', 'fa709a', 'ffecd2', 'a8edea', 'fed6e3', 'ff9a9e', '74b9ff'];
    const styles = ['initials', 'identicon', 'bottts', 'avataaars'];
    
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const randomStyle = styles[Math.floor(Math.random() * styles.length)];
    const name = this.user?.name || 'Usuario';
    
    let newAvatar = '';
    
    if (randomStyle === 'initials') {
      newAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${randomColor}&color=fff&size=200&font-size=0.6`;
    } else {
      // Para otros estilos, usar un servicio diferente
      const seed = Math.random().toString(36).substring(7);
      newAvatar = `https://api.dicebear.com/7.x/${randomStyle}/svg?seed=${seed}&backgroundColor=${randomColor}`;
    }
    
    this.updateUserAvatar(newAvatar);
    this.showAvatarOptions = false;
  }

  removeAvatar(): void {
    this.updateUserAvatar('');
    this.showAvatarOptions = false;
  }

  // ==================== EDICIÓN DE COVER ====================

  editCover(): void {
    this.coverInput.nativeElement.click();
  }

  onCoverChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.processImageFile(file, 'cover');
    }
  }

  // ==================== PROCESAMIENTO DE ARCHIVOS ====================

  private processImageFile(file: File, type: 'avatar' | 'cover'): void {
    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido.');
      return;
    }

    // Validar tamaño (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen es muy grande. Por favor selecciona una imagen menor a 5MB.');
      return;
    }

    // Leer archivo y convertir a base64
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      
      if (type === 'avatar') {
        this.updateUserAvatar(result);
      } else {
        this.updateUserCover(result);
      }
    };
    reader.readAsDataURL(file);
  }

  private updateUserAvatar(avatarUrl: string): void {
    if (this.user) {
      const updatedUser = { ...this.user, avatar: avatarUrl };
      this.userService.updateProfile(updatedUser);
      console.log('✅ Avatar actualizado');
    }
  }

  private updateUserCover(coverUrl: string): void {
    if (this.user) {
      const updatedUser = { ...this.user, coverImage: coverUrl };
      this.userService.updateProfile(updatedUser);
      console.log('✅ Portada actualizada');
    }
  }

  // ==================== ESTADÍSTICAS ====================

  getFavoritesCount(): number {
    return this.favorites.length;
  }

  getReadingGoalProgress(): number {
    if (!this.user?.readingGoal) return 0;
    return Math.min((this.favorites.length / this.user.readingGoal) * 100, 100);
  }

  getJoinedDays(): number {
    if (!this.user?.joinDate) return 0;
    const now = new Date();
    const joinDate = new Date(this.user.joinDate);
    const diffTime = Math.abs(now.getTime() - joinDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getTopCategories(): string[] {
    const categories = Object.keys(this.favoritesByCategory);
    return categories
      .filter(category => this.favoritesByCategory[category]?.length > 0)
      .sort((a, b) => this.favoritesByCategory[b].length - this.favoritesByCategory[a].length)
      .slice(0, 3);
  }

  onProfileUpdated(): void {
    this.setActiveTab('overview');
    console.log('✅ Perfil actualizado exitosamente');
  }

  formatDate(date: Date | string | undefined): string {
    const dateToFormat = date ? new Date(date) : new Date();
    return dateToFormat.toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // ==================== CERRAR OPCIONES AL CLICK FUERA ====================

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.avatar-section')) {
      this.showAvatarOptions = false;
    }
  }
}