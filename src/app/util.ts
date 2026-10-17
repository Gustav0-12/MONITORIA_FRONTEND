import { Observable } from 'rxjs';

export function msgErro(err: any): string {
  if (err?.status === 0) return 'Não consegui falar com o back. Ele está rodando na porta 8080?';
  if (err?.status === 401) return 'Sessão expirada ou credenciais inválidas.';
  if (err?.status === 403) return 'Seu perfil não tem permissão para isso.';
  const corpo = err?.error;
  if (typeof corpo === 'string' && corpo.trim()) return corpo;
  if (corpo?.message) return corpo.message;
  return 'Erro ' + (err?.status ?? '') + ' no back. Veja o console do Spring para os detalhes.';
}

export function pedirMotivo(acao: string): string | null {
  const m = window.prompt('Motivo (' + acao + '):');
  if (m === null) return null;
  const t = m.trim();
  if (!t) { alert('Informe um motivo.'); return null; }
  return t;
}

export abstract class Base {
  erro = '';
  ok = '';
  protected abstract recarregar(): void;

  protected executar(obs: Observable<unknown>, msg: string, depois?: () => void) {
    this.erro = '';
    this.ok = '';
    obs.subscribe({
      next: () => { this.ok = msg; if (depois) depois(); this.recarregar(); },
      error: (e) => (this.erro = msgErro(e)),
    });
  }
}
