import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, switchMap, tap, throwError } from 'rxjs';
import { Perfil, TokenResponse } from './models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  token = signal(localStorage.getItem('token') ?? '');
  perfil = signal<Perfil | null>((localStorage.getItem('perfil') as Perfil) || null);
  email = signal(localStorage.getItem('email') ?? '');
  aviso = signal('');
  logado = computed(() => !!this.token() && !!this.perfil());

  constructor(private http: HttpClient) {}

  entrar(email: string, senha: string): Observable<Perfil> {
    this.aviso.set('');
    return this.http.post<TokenResponse>('/auth/login', { email, senha }).pipe(
      tap((r) => {
        this.token.set(r.token);
        localStorage.setItem('token', r.token);
        this.email.set(email);
        localStorage.setItem('email', email);
      }),
      switchMap(() => this.descobrirPerfil()),
      tap((p) => {
        this.perfil.set(p);
        localStorage.setItem('perfil', p);
      }),
      catchError((e) => {
        this.sair();
        return throwError(() => e);
      })
    );
  }

  // O token do back não traz o perfil, então testamos uma rota exclusiva de cada perfil.
  // Só o 403 significa "não é o meu perfil"; qualquer outro erro é mostrado ao usuário.
  private descobrirPerfil(): Observable<Perfil> {
    return this.http.get('/ies').pipe(
      map(() => 'ADMINISTRADOR' as Perfil),
      catchError((e) => {
        if (e.status !== 403) return throwError(() => e);
        return this.http.get('/discentes').pipe(
          map(() => 'COLABORADOR' as Perfil),
          catchError((e2) => (e2.status === 403 ? of('USUARIO' as Perfil) : throwError(() => e2)))
        );
      })
    );
  }

  sair(aviso = '') {
    this.token.set('');
    this.perfil.set(null);
    this.email.set('');
    localStorage.removeItem('token');
    localStorage.removeItem('perfil');
    localStorage.removeItem('email');
    this.aviso.set(aviso);
  }
}
