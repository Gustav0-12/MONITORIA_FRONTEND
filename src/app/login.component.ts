import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="cartao" style="max-width: 380px; margin: 3rem auto">
      <h2 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 1rem">Entrar no sistema</h2>

      @if (auth.aviso()) { <div class="aviso aviso-erro">{{ auth.aviso() }}</div> }
      @if (erro) { <div class="aviso aviso-erro">{{ erro }}</div> }

      <label class="rotulo">E-mail</label>
      <input class="campo" type="email" [(ngModel)]="email" placeholder="Seu e-mail" (keyup.enter)="entrar()" />

      <label class="rotulo" style="margin-top: .75rem">Senha</label>
      <input class="campo" type="password" [(ngModel)]="senha" (keyup.enter)="entrar()" />

      <button class="btn btn-azul" style="margin-top: 1rem; width: 100%" (click)="entrar()" [disabled]="carregando">
        {{ carregando ? 'Entrando...' : 'Entrar' }}
      </button>

      <p style="margin-top: 1rem; font-size: .75rem; color: #6b7280">
        Administrador de teste (criado pelo AdminInicialConfig): admin&#64;monitoria.com / 123
      </p>
    </div>
  `,
})
export class LoginComponent {
  email = '';
  senha = '';
  erro = '';
  carregando = false;

  constructor(public auth: AuthService) {}

  entrar() {
    if (!this.email.trim() || !this.senha) {
      this.erro = 'Preencha e-mail e senha.';
      return;
    }
    this.erro = '';
    this.auth.aviso.set('');
    this.carregando = true;
    this.auth.entrar(this.email.trim(), this.senha).subscribe({
      next: () => (this.carregando = false),
      error: (e) => {
        this.carregando = false;
        this.erro =
          e.status === 401 || e.status === 403
            ? 'E-mail ou senha incorretos.'
            : e.status === 0
              ? 'Não consegui falar com o back. Ele está rodando na porta 8080?'
              : 'Erro ao entrar (' + e.status + '). Confira se o proxy.conf.json novo está na raiz e se o ng serve foi iniciado com --proxy-config. Veja também o console do Spring.';
      },
    });
  }
}
