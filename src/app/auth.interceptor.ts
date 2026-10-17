import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const ehLogin = req.url.includes('/auth/login');
  const token = auth.token();

  if (token && !ehLogin) {
    req = req.clone({ setHeaders: { Authorization: 'Bearer ' + token } });
  }

  return next(req).pipe(
    catchError((err) => {
      if (err.status === 401 && !ehLogin) {
        auth.sair('Sua sessão expirou. Entre de novo.');
      }
      return throwError(() => err);
    })
  );
};
