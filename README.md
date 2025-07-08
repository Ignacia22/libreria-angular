# 📚 LibroMart - Librería Online

Una plataforma web moderna para la compra y gestión de libros online. LibroMart ofrece una experiencia de usuario completa para descubrir, buscar y adquirir libros con una interfaz elegante y funcional desarrollada con Angular.

## ✨ Características principales

- 📖 **Catálogo extenso**: Navegación por géneros, autores y categorías
- 🔍 **Búsqueda avanzada**: Filtros por título, autor, género, precio y disponibilidad
- 🛒 **Carrito de compras**: Gestión completa de productos seleccionados
- ⭐ **Sistema de reseñas**: Valoraciones y comentarios de lectores
- 📱 **Diseño responsivo**: Experiencia optimizada en todos los dispositivos
- 👤 **Gestión de usuarios**: Registro, login y perfil personalizado
- 📚 **Lista de deseos**: Guarda libros para comprar más tarde
- 🏷️ **Ofertas y descuentos**: Sistema de promociones especiales
- 📦 **Historial de compras**: Seguimiento de pedidos realizados

## 🚀 Tecnologías utilizadas

### Frontend
- **Angular 17** - Framework principal para SPA
- **TypeScript** - Lenguaje de programación tipado
- **Angular Material** - Componentes de UI y diseño
- **RxJS** - Programación reactiva y manejo de observables
- **Angular Router** - Navegación y routing
- **Angular Forms** - Formularios reactivos y template-driven
- **SCSS/Sass** - Preprocesador CSS para estilos avanzados

### Librerías adicionales
- **Angular CDK** - Kit de desarrollo de componentes
- **Angular Flex Layout** - Sistema de layout responsivo
- **NgBootstrap** - Componentes Bootstrap para Angular
- **SweetAlert2** - Alertas y notificaciones elegantes

### Backend (si aplica)
- **Node.js + Express** - API REST
- **MongoDB/PostgreSQL** - Base de datos
- **JWT** - Autenticación de usuarios

## 🏗️ Instalación

### Requisitos previos
- Node.js (>= 18)
- npm o yarn
- Angular CLI (`npm install -g @angular/cli`)
- Git

### Pasos de instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/Ignacia22/libreria-angular.git
cd libreria-angular
```

2. **Instalar dependencias**
```bash
npm install
# o
yarn install
```

3. **Configurar variables de entorno**
```bash
cp src/environments/environment.example.ts src/environments/environment.ts
```
Edita el archivo con tus configuraciones:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  stripePublicKey: 'tu_clave_publica_stripe',
  firebaseConfig: {
    // Tu configuración de Firebase
  }
};
```

4. **Ejecutar en modo desarrollo**
```bash
ng serve
# o
npm start
```

5. **Abrir en el navegador**
Visita [http://localhost:4200](http://localhost:4200)

## 📁 Estructura del proyecto

```
libreria-angular/
├── src/
│   ├── app/
│   │   ├── components/          # Componentes reutilizables
│   │   │   ├── header/          # Cabecera y navegación
│   │   │   ├── footer/          # Pie de página
│   │   │   ├── book-card/       # Tarjeta de libro
│   │   │   └── shopping-cart/   # Carrito de compras
│   │   ├── pages/               # Páginas principales
│   │   │   ├── home/            # Página de inicio
│   │   │   ├── catalog/         # Catálogo de libros
│   │   │   ├── book-detail/     # Detalle del libro
│   │   │   ├── profile/         # Perfil de usuario
│   │   │   └── checkout/        # Proceso de compra
│   │   ├── services/            # Servicios Angular
│   │   │   ├── book.service.ts  # Gestión de libros
│   │   │   ├── auth.service.ts  # Autenticación
│   │   │   ├── cart.service.ts  # Carrito de compras
│   │   │   └── user.service.ts  # Gestión de usuarios
│   │   ├── guards/              # Guards de rutas
│   │   ├── interfaces/          # Interfaces TypeScript
│   │   ├── pipes/               # Pipes personalizados
│   │   └── shared/              # Módulos compartidos
│   ├── assets/                  # Recursos estáticos
│   │   ├── images/              # Imágenes
│   │   ├── icons/               # Iconos
│   │   └── styles/              # Estilos globales
│   ├── environments/            # Configuraciones de entorno
│   └── styles.scss              # Estilos globales
├── angular.json                 # Configuración de Angular
├── package.json                 # Dependencias del proyecto
└── tsconfig.json               # Configuración de TypeScript
```

## 🎯 Funcionalidades implementadas

### 📚 Gestión de libros
- Listado de libros con paginación
- Vista detallada con información completa
- Búsqueda por múltiples criterios
- Filtros por género, autor, precio
- Ordenamiento por popularidad, precio, fecha

### 🛒 Sistema de compras
- Carrito de compras persistente
- Cálculo automático de totales
- Aplicación de descuentos y cupones
- Proceso de checkout seguro
- Múltiples métodos de pago

### 👤 Gestión de usuarios
- Registro e inicio de sesión
- Perfil de usuario editable
- Historial de compras
- Lista de libros favoritos
- Sistema de recomendaciones

### ⭐ Interacciones sociales
- Sistema de calificaciones
- Reseñas y comentarios
- Compartir en redes sociales
- Recomendaciones personalizadas

## 🎨 Componentes principales

### BookCardComponent
```typescript
@Component({
  selector: 'app-book-card',
  templateUrl: './book-card.component.html',
  styleUrls: ['./book-card.component.scss']
})
export class BookCardComponent {
  @Input() book: Book;
  @Output() addToCart = new EventEmitter<Book>();
  @Output() addToWishlist = new EventEmitter<Book>();
}
```

### ShoppingCartComponent
- Gestión del carrito de compras
- Actualización de cantidades
- Eliminación de productos
- Cálculo de totales

### BookSearchComponent
- Barra de búsqueda inteligente
- Autocomplete de títulos y autores
- Filtros avanzados
- Resultados en tiempo real

## 🚀 Scripts disponibles

```bash
ng serve             # Servidor de desarrollo
ng build             # Build de producción
ng build --prod      # Build optimizado para producción
ng test              # Ejecutar tests unitarios
ng e2e               # Tests end-to-end
ng lint              # Linting del código
ng generate          # Generar componentes, servicios, etc.
```

## 🔧 Servicios Angular

### BookService
```typescript
@Injectable({
  providedIn: 'root'
})
export class BookService {
  getBooks(): Observable<Book[]>
  getBookById(id: string): Observable<Book>
  searchBooks(query: string): Observable<Book[]>
  getBooksByGenre(genre: string): Observable<Book[]>
}
```

### CartService
- Gestión del estado del carrito
- Persistencia en localStorage
- Cálculos de totales y descuentos
- Sincronización con el servidor

## 🎨 Estilos y temas

### Angular Material Theme
```scss
@import '~@angular/material/theming';

$primary: mat-palette($mat-blue);
$accent: mat-palette($mat-amber);
$warn: mat-palette($mat-red);

$theme: mat-light-theme($primary, $accent, $warn);
@include angular-material-theme($theme);
```

### Responsive Design
- Breakpoints optimizados para móviles
- Grid system flexible
- Imágenes responsivas
- Navegación adaptativa

## 🌐 Deploy

### Netlify
```bash
ng build --prod
# Subir carpeta 'dist/libreria-angular' a Netlify
```

### Vercel
```bash
ng build --prod
vercel --prod
```

### Firebase Hosting
```bash
ng add @angular/fire
ng build --prod
firebase deploy
```

## 📱 Progressive Web App (PWA)

LibroMart está configurado como PWA:
```bash
ng add @angular/pwa
```

Características PWA incluidas:
- ⚡ Carga rápida offline
- 📱 Instalable en dispositivos móviles
- 🔄 Actualizaciones automáticas
- 📨 Notificaciones push

## 🧪 Testing

### Tests unitarios
```bash
ng test
```

### Tests de integración
```bash
ng e2e
```

### Coverage de código
```bash
ng test --code-coverage
```

## 🤝 Contribuciones

¡Las contribuciones son bienvenidas! Para contribuir:

1. Fork el proyecto
2. Crea una branch (`git checkout -b feature/NuevaFuncionalidad`)
3. Commit tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la branch (`git push origin feature/NuevaFuncionalidad`)
5. Abre un Pull Request

## 📋 Roadmap

- [ ] Integración con API de Google Books
- [ ] Sistema de recomendaciones con IA
- [ ] Chat en vivo para soporte
- [ ] Libros electrónicos (ebooks)
- [ ] Sistema de suscripciones
- [ ] App móvil con Ionic
- [ ] Realidad aumentada para preview de libros

## 🐛 Problemas conocidos

- Optimización de imágenes en dispositivos de baja gama
- Mejora del tiempo de carga inicial
- Compatibilidad con navegadores legacy

## 📧 Contacto

**María Ignacia Fernández** - Frontend Developer  
📧 Email: [mfernandezpolanco@gmail.com](mailto:mfernandezpolanco@gmail.com)  
🔗 LinkedIn: [www.linkedin.com/in/maria-ignacia-fernandez-p]  
🌐 Portfolio: [https://ignacia-fernandez.vercel.app]  
📱 GitHub: [@Ignacia22](https://github.com/Ignacia22)

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

---

⭐ **¿Te gustó LibroMart? ¡Dale una estrella en GitHub!**
