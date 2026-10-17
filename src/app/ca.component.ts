import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MonitoriaService } from './monitoria.service';
import { AvisoComponent } from './aviso.component';
import { CentroAcademico, Docente, Ies } from './models';
import { Base, pedirMotivo } from './util';

@Component({
  selector: 'app-ca',
  standalone: true,
  imports: [FormsModule, AvisoComponent],
  template: `
    <h2 class="titulo">Centros acadêmicos</h2>
    <app-aviso [erro]="erro" [ok]="ok" />

    <div class="form-box">
      <h3 style="font-weight: 700; margin-bottom: .5rem">{{ editId ? 'Editar centro #' + editId : 'Cadastrar centro acadêmico' }}</h3>
      <div class="grade">
        <div><label class="rotulo">Nome</label><input class="campo" [(ngModel)]="form.nome" /></div>
        <div><label class="rotulo">E-mail central</label><input class="campo" type="email" [(ngModel)]="form.emailCentral" /></div>
        <div><label class="rotulo">Telefone central</label><input class="campo" [(ngModel)]="form.telefoneCentral" /></div>
        @if (!editId) {
          <div>
            <label class="rotulo">IES</label>
            <select class="campo" [(ngModel)]="form.iesId">
              <option [ngValue]="null">Escolher IES</option>
              @for (i of ies; track i.id) { <option [ngValue]="i.id">{{ i.sigla }} - {{ i.nome }}</option> }
            </select>
          </div>
        }
      </div>
      <div style="margin-top: .75rem; display: flex; gap: .5rem">
        <button class="btn btn-azul" (click)="salvar()">{{ editId ? 'Salvar alterações' : 'Salvar no banco' }}</button>
        @if (editId) { <button class="btn btn-cinza" (click)="cancelar()">Cancelar edição</button> }
        <button class="btn btn-claro" (click)="recarregar()">↻ Atualizar lista</button>
      </div>
    </div>

    <div class="rolagem">
      <table class="tabela">
        <thead>
          <tr><th>Nome</th><th>IES</th><th>E-mail</th><th>Coordenador</th><th>Docentes</th><th>Cursos</th><th>Status</th><th>Ações</th></tr>
        </thead>
        <tbody>
          @for (c of lista; track c.id) {
            <tr>
              <td>{{ c.nome }}</td>
              <td>{{ siglaIes(c.iesId) }}</td>
              <td>{{ c.emailCentral }}</td>
              <td>
                {{ c.coordenador?.nome || '—' }}
                <div style="display: flex; gap: .25rem; margin-top: .25rem">
                  <select #sel class="campo" style="width: 9rem">
                    <option value="">Escolher docente</option>
                    @for (d of docentes; track d.id) { <option [value]="d.id">{{ d.nome }}</option> }
                  </select>
                  <button class="btn btn-claro" (click)="coordenador(c, sel.value)">Definir</button>
                </div>
              </td>
              <td>{{ c.docentes.length }}</td>
              <td>{{ c.cursos.length }}</td>
              <td><span [class]="c.status === 'ATIVO' ? 'ativo' : 'inativo'">{{ c.status }}</span></td>
              <td style="white-space: nowrap">
                <button class="btn btn-azul" (click)="editar(c)">Editar</button>
                @if (c.status === 'ATIVO') { <button class="btn btn-vermelho" (click)="inativar(c)">Inativar</button> }
              </td>
            </tr>
          } @empty {
            <tr><td colspan="8" class="vazio">Nenhum centro acadêmico encontrado.</td></tr>
          }
        </tbody>
      </table>
    </div>
  `,
})
export class CaComponent extends Base implements OnInit {
  lista: CentroAcademico[] = [];
  ies: Ies[] = [];
  docentes: Docente[] = [];
  editId: number | null = null;
  form = this.vazio();

  constructor(private api: MonitoriaService) { super(); }

  ngOnInit() { this.recarregar(); }

  private vazio(): { nome: string; emailCentral: string; telefoneCentral: string; iesId: number | null } {
    return { nome: '', emailCentral: '', telefoneCentral: '', iesId: null };
  }

  siglaIes(id: number) { return this.ies.find((i) => i.id === id)?.sigla ?? '#' + id; }

  recarregar() {
    this.api.listarCas().subscribe({ next: (l) => (this.lista = l), error: () => (this.erro = 'Erro ao listar centros acadêmicos.') });
    this.api.listarIes().subscribe({ next: (l) => (this.ies = l), error: () => {} });
    this.api.listarDocentes().subscribe({ next: (d) => (this.docentes = d), error: () => {} });
  }

  salvar() {
    const f = this.form;
    if (!f.nome.trim()) { this.erro = 'Informe o nome do centro.'; return; }
    if (this.editId) {
      this.executar(this.api.editarCa(this.editId, { nome: f.nome, emailCentral: f.emailCentral, telefoneCentral: f.telefoneCentral }), 'Centro atualizado.', () => this.cancelar());
    } else {
      if (!f.iesId) { this.erro = 'Escolha a IES do centro.'; return; }
      this.executar(this.api.criarCa({ nome: f.nome, emailCentral: f.emailCentral, telefoneCentral: f.telefoneCentral, iesId: f.iesId }), 'Centro cadastrado.', () => this.cancelar());
    }
  }

  editar(c: CentroAcademico) {
    this.editId = c.id;
    this.form = { nome: c.nome, emailCentral: c.emailCentral, telefoneCentral: c.telefoneCentral, iesId: c.iesId };
  }

  cancelar() { this.editId = null; this.form = this.vazio(); }

  inativar(c: CentroAcademico) {
    const motivo = pedirMotivo('inativar ' + c.nome);
    if (motivo) this.executar(this.api.inativarCa(c.id, motivo), 'Centro inativado.');
  }

  coordenador(c: CentroAcademico, docenteId: string) {
    if (!docenteId) { this.erro = 'Escolha um docente para ser coordenador.'; return; }
    this.executar(this.api.definirCoordenadorCa(c.id, Number(docenteId)), 'Coordenador definido.');
  }
}
