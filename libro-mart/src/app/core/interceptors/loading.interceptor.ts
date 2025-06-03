import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { LoadingService } from '../services/loading.service';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);
  
  // Mostrar loading al iniciar request
  loadingService.setLoading(true, req.url);

  return next(req).pipe(
    finalize(() => {
      // Ocultar loading al finalizar request
      loadingService.setLoading(false, req.url);
    })
  );
};