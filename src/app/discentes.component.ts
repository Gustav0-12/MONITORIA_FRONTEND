import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MonitoriaService } from './monitoria.service';
import { AvisoComponent } from './aviso.component';
import { Curso, Discente } from './models';
import { Base, pedirMotivo } from './util';

@Component({
  selector: 'app-discentes',
  standalone: true,
  imports: [FormsModule, AvisoComponent],
  template: `
    <h2 class="titulo">Discentes</h2>
    <app-aviso [erro]="erro" [ok]="ok" />

    <div class="form-box">
      <h3 style="font-weight: 700; margin-bottom: .5rem">Cadastrar discente</h3>
      <div class="grade">
        <div><label class="rotulo">Nome</label><input class="campo" [(ngModel)]="form.nome" /></div>
        <div><label class="rotulo">E-mail (login)</label><input class="campo" type="email" [(ngModel)]="form.email" /></div>
        <div><label class="rotulo">Senha</label><input class="campo" type="password" [(ngModel)]="form.senha" /></div>
        <div><label class="rotulo">Matrícula</label><input class="campo" [(ngModel)]="form.matricula" /></div>
        <div><label class="rotulo">Telefone</label><input class="campo" [(ngModel)]="form.telefone" /></div>
        <div>
          <label class="rotulo">Curso</label>
          <select class="campo" [(ngModel)]="form.cursoId">
            <option [ngValue]="null">Escolher curso</option>
            @for (c of cursos; track c.id) { <option [ngValue]="c.id">{{ c.sigla }} - {{ c.descricao }}</option> }
          </select>
        </div>
      </div>
      <div style="margin-top: .75rem; display: flex; gap: .5rem">
        <button class="btn btn-azul" (click)="salvar()">Salvar no banco</button>
        <button class="btn btn-claro" (click)="recarregar()">↻ Atualizar lista</button>
      </div>
    </div>

    <div class="rolagem">
      <table class="tabela">
        <thead>
          <tr><th>ID</th><th>Nome</th><th>E-mail</th><th>Matrícula</th><th>Telefone</th><th>Curso</th><th>Status</th><th>Ações</th></tr>
        </thead>
        <tbody>
          @for (d of lista; track d.id) {
            <tr>
              <td>{{ d.id }}</td>
              <td>{{ d.nome }}</td>
              <td>{{ d.email }}</td>
              <td>{{ d.matricula }}</td>
              <td>{{ d.telefone }}</td>
              <td>{{ siglaCurso(d.cursoId) }}</td>
              <td><span [class]="d.status === 'ATIVO' ? 'ativo' : 'inativo'">{{ d.status }}</span></td>
              <td>
                @if (d.status === 'ATIVO') { <button class="btn btn-vermelho" (click)="inativar(d)">Inativar</button> }
              </td>
            </tr>
          } @empty {
            <tr><td colspan="8" class="vazio">Nenhum discente encontrado.</td></tr>
          }
        </tbody>
      </table>
    </div>
  `,
})
export class DiscentesComponent extends Base implements OnInit {
  lista: Discente[] = [];
  cursos: Curso[] = [];
  form = this.vazio();

  constructor(private api: MonitoriaService) { super(); }

  ngOnInit() { this.recarregar(); }

  private vazio(): { nome: string; email: string; senha: string; matricula: string; telefone: string; cursoId: number | null } {
    return { nome: '', email: '', senha: '', matricula: '', telefone: '', cursoId: null };
  }

  siglaCurso(id: number) { return this.cursos.find((c) => c.id === id)?.sigla ?? '#' + id; }

  recarregar() {
    this.api.listarDiscentes().subscribe({ next: (l) => (this.lista = l), error: () => (this.erro = 'Erro ao listar discentes.') });
    this.api.listarCursos().subscribe({ next: (l) => (this.cursos = l), error: () => {} });
  }

  salvar() {
    const f = this.form;
    if (!f.nome.trim() || !f.email.trim() || !f.senha || !f.matricula.trim() || !f.cursoId) {
      this.erro = 'Preencha nome, e-mail, senha, matrícula e curso.';
      return;
    }
    this.executar(
      this.api.criarDiscente({ nome: f.nome, email: f.email, senha: f.senha, matricula: f.matricula, telefone: f.telefone, cursoId: f.cursoId }),
      'Discente cadastrado.',
      () => (this.form = this.vazio())
    );
  }

  inativar(d: Discente) {
    const motivo = pedirMotivo('inativar ' + d.nome);
    if (motivo) this.executar(this.api.inativarDiscente(d.id, motivo), 'Discente inativado.');
  }
}
