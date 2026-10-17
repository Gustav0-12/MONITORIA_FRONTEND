import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MonitoriaService } from './monitoria.service';
import { AvisoComponent } from './aviso.component';
import { CentroAcademico, Docente } from './models';
import { Base, pedirMotivo } from './util';

@Component({
  selector: 'app-docentes',
  standalone: true,
  imports: [FormsModule, AvisoComponent],
  template: `
    <h2 class="titulo">Docentes</h2>
    <app-aviso [erro]="erro" [ok]="ok" />

    <div class="form-box">
      <h3 style="font-weight: 700; margin-bottom: .5rem">Cadastrar docente</h3>
      <div class="grade">
        <div><label class="rotulo">Nome</label><input class="campo" [(ngModel)]="form.nome" /></div>
        <div><label class="rotulo">E-mail (login)</label><input class="campo" type="email" [(ngModel)]="form.email" /></div>
        <div><label class="rotulo">Senha</label><input class="campo" type="password" [(ngModel)]="form.senha" /></div>
        <div><label class="rotulo">Matrícula</label><input class="campo" [(ngModel)]="form.matricula" /></div>
        <div><label class="rotulo">Telefone</label><input class="campo" [(ngModel)]="form.telefone" /></div>
        <div>
          <label class="rotulo">Centro acadêmico</label>
          <select class="campo" [(ngModel)]="form.centroAcademicoId">
            <option [ngValue]="null">Escolher centro</option>
            @for (c of centros; track c.id) { <option [ngValue]="c.id">{{ c.nome }}</option> }
          </select>
        </div>
      </div>
      <div style="margin-top: .75rem; display: flex; gap: .5rem">
        <button class="btn btn-azul" (click)="salvar()">Salvar no banco</button>
        <button class="btn btn-claro" (click)="recarregar()">↻ Atualizar lista</button>
      </div>
      <p style="margin-top: .5rem; font-size: .75rem; color: #6b7280">
        O docente entra no sistema com esse e-mail e senha. Anote o ID dele: é necessário para cadastrar monitorias.
      </p>
    </div>

    <div class="rolagem">
      <table class="tabela">
        <thead>
          <tr><th>ID</th><th>Nome</th><th>E-mail</th><th>Matrícula</th><th>Telefone</th><th>Centro</th><th>Status</th><th>Ações</th></tr>
        </thead>
        <tbody>
          @for (d of lista; track d.id) {
            <tr>
              <td>{{ d.id }}</td>
              <td>{{ d.nome }}</td>
              <td>{{ d.email }}</td>
              <td>{{ d.matricula }}</td>
              <td>{{ d.telefone }}</td>
              <td>{{ d.centroAcademico?.nome || '—' }}</td>
              <td><span [class]="d.status === 'ATIVO' ? 'ativo' : 'inativo'">{{ d.status }}</span></td>
              <td>
                @if (d.status === 'ATIVO') { <button class="btn btn-vermelho" (click)="inativar(d)">Inativar</button> }
              </td>
            </tr>
          } @empty {
            <tr><td colspan="8" class="vazio">Nenhum docente encontrado.</td></tr>
          }
        </tbody>
      </table>
    </div>
  `,
})
export class DocentesComponent extends Base implements OnInit {
  lista: Docente[] = [];
  centros: CentroAcademico[] = [];
  form = this.vazio();

  constructor(private api: MonitoriaService) { super(); }

  ngOnInit() { this.recarregar(); }

  private vazio(): { nome: string; email: string; senha: string; matricula: string; telefone: string; centroAcademicoId: number | null } {
    return { nome: '', email: '', senha: '', matricula: '', telefone: '', centroAcademicoId: null };
  }

  recarregar() {
    this.api.listarDocentes().subscribe({ next: (l) => (this.lista = l), error: () => (this.erro = 'Erro ao listar docentes.') });
    this.api.listarCas().subscribe({ next: (l) => (this.centros = l), error: () => {} });
  }

  salvar() {
    const f = this.form;
    if (!f.nome.trim() || !f.email.trim() || !f.senha || !f.matricula.trim() || !f.centroAcademicoId) {
      this.erro = 'Preencha nome, e-mail, senha, matrícula e centro acadêmico.';
      return;
    }
    this.executar(
      this.api.criarDocente({ nome: f.nome, email: f.email, senha: f.senha, matricula: f.matricula, telefone: f.telefone, centroAcademicoId: f.centroAcademicoId }),
      'Docente cadastrado.',
      () => (this.form = this.vazio())
    );
  }

  inativar(d: Docente) {
    const motivo = pedirMotivo('inativar ' + d.nome);
    if (motivo) this.executar(this.api.inativarDocente(d.id, motivo), 'Docente inativado.');
  }
}
