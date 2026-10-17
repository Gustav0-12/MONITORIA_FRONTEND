import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MonitoriaService } from './monitoria.service';
import { AvisoComponent } from './aviso.component';
import { Docente, Ies } from './models';
import { Base, pedirMotivo } from './util';

@Component({
  selector: 'app-ies',
  standalone: true,
  imports: [FormsModule, AvisoComponent],
  template: `
    <h2 class="titulo">Instituições de ensino superior (IES)</h2>
    <app-aviso [erro]="erro" [ok]="ok" />

    <div class="form-box">
      <h3 style="font-weight: 700; margin-bottom: .5rem">{{ editId ? 'Editar IES #' + editId : 'Cadastrar IES' }}</h3>
      <div class="grade">
        <div><label class="rotulo">Sigla</label><input class="campo" [(ngModel)]="form.sigla" /></div>
        <div><label class="rotulo">Nome</label><input class="campo" [(ngModel)]="form.nome" /></div>
        <div><label class="rotulo">E-mail central</label><input class="campo" type="email" [(ngModel)]="form.emailCentral" /></div>
        <div><label class="rotulo">Telefone central</label><input class="campo" [(ngModel)]="form.telefoneCentral" /></div>
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
          <tr><th>Sigla</th><th>Nome</th><th>E-mail</th><th>Telefone</th><th>Reitor</th><th>Centros</th><th>Status</th><th>Ações</th></tr>
        </thead>
        <tbody>
          @for (i of lista; track i.id) {
            <tr>
              <td>{{ i.sigla }}</td>
              <td>{{ i.nome }}</td>
              <td>{{ i.emailCentral }}</td>
              <td>{{ i.telefoneCentral }}</td>
              <td>
                {{ i.reitor?.nome || '—' }}
                <div style="display: flex; gap: .25rem; margin-top: .25rem">
                  <select #sel class="campo" style="width: 9rem">
                    <option value="">Escolher docente</option>
                    @for (d of docentes; track d.id) { <option [value]="d.id">{{ d.nome }}</option> }
                  </select>
                  <button class="btn btn-claro" (click)="reitor(i, sel.value)">Definir</button>
                </div>
              </td>
              <td>{{ i.centrosAcademicos.length }}</td>
              <td><span [class]="i.status === 'ATIVO' ? 'ativo' : 'inativo'">{{ i.status }}</span></td>
              <td style="white-space: nowrap">
                <button class="btn btn-azul" (click)="editar(i)">Editar</button>
                @if (i.status === 'ATIVO') { <button class="btn btn-vermelho" (click)="inativar(i)">Inativar</button> }
              </td>
            </tr>
          } @empty {
            <tr><td colspan="8" class="vazio">Nenhuma IES encontrada.</td></tr>
          }
        </tbody>
      </table>
    </div>
  `,
})
export class IesComponent extends Base implements OnInit {
  lista: Ies[] = [];
  docentes: Docente[] = [];
  editId: number | null = null;
  form = this.vazio();

  constructor(private api: MonitoriaService) { super(); }

  ngOnInit() { this.recarregar(); }

  private vazio() { return { sigla: '', nome: '', emailCentral: '', telefoneCentral: '' }; }

  recarregar() {
    this.api.listarIes().subscribe({ next: (l) => (this.lista = l), error: (e) => (this.erro = e.status === 403 ? 'Sem permissão.' : 'Erro ao listar IES.') });
    this.api.listarDocentes().subscribe({ next: (d) => (this.docentes = d), error: () => {} });
  }

  salvar() {
    if (!this.form.sigla.trim() || !this.form.nome.trim()) { this.erro = 'Preencha ao menos sigla e nome.'; return; }
    const obs = this.editId ? this.api.editarIes(this.editId, this.form) : this.api.criarIes(this.form);
    this.executar(obs, this.editId ? 'IES atualizada.' : 'IES cadastrada.', () => this.cancelar());
  }

  editar(i: Ies) {
    this.editId = i.id;
    this.form = { sigla: i.sigla, nome: i.nome, emailCentral: i.emailCentral, telefoneCentral: i.telefoneCentral };
  }

  cancelar() { this.editId = null; this.form = this.vazio(); }

  inativar(i: Ies) {
    const motivo = pedirMotivo('inativar ' + i.sigla);
    if (motivo) this.executar(this.api.inativarIes(i.id, motivo), 'IES inativada.');
  }

  reitor(i: Ies, docenteId: string) {
    if (!docenteId) { this.erro = 'Escolha um docente para ser reitor.'; return; }
    this.executar(this.api.definirReitor(i.id, Number(docenteId)), 'Reitor definido.');
  }
}
