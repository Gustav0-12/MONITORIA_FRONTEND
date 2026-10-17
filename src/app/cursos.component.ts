import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MonitoriaService } from './monitoria.service';
import { AvisoComponent } from './aviso.component';
import { CentroAcademico, Curso, Docente, TURNOS, Turno } from './models';
import { Base, pedirMotivo } from './util';

@Component({
  selector: 'app-cursos',
  standalone: true,
  imports: [FormsModule, AvisoComponent],
  template: `
    <h2 class="titulo">Cursos {{ leitura ? '(somente consulta)' : '' }}</h2>
    <app-aviso [erro]="erro" [ok]="ok" />

    @if (!leitura) {
      <div class="form-box">
        <h3 style="font-weight: 700; margin-bottom: .5rem">{{ editId ? 'Editar curso #' + editId : 'Cadastrar curso' }}</h3>
        <div class="grade">
          <div><label class="rotulo">Sigla</label><input class="campo" [(ngModel)]="form.sigla" /></div>
          <div><label class="rotulo">Descrição</label><input class="campo" [(ngModel)]="form.descricao" /></div>
          <div>
            <label class="rotulo">Centro acadêmico</label>
            <select class="campo" [(ngModel)]="form.centroAcademicoId">
              <option [ngValue]="null">Escolher centro</option>
              @for (c of centros; track c.id) { <option [ngValue]="c.id">{{ c.nome }}</option> }
            </select>
          </div>
          <div>
            <label class="rotulo">Coordenador (opcional)</label>
            <select class="campo" [(ngModel)]="form.coordenadorId">
              <option [ngValue]="null">Sem coordenador</option>
              @for (d of docentes; track d.id) { <option [ngValue]="d.id">{{ d.nome }}</option> }
            </select>
          </div>
        </div>
        <div style="margin-top: .5rem">
          <label class="rotulo">Turnos</label>
          @for (t of turnos; track t) {
            <label style="margin-right: 1rem; font-size: .875rem">
              <input type="checkbox" [checked]="form.turnos.includes(t)" (change)="alternarTurno(t)" /> {{ t }}
            </label>
          }
        </div>
        <div style="margin-top: .75rem; display: flex; gap: .5rem">
          <button class="btn btn-azul" (click)="salvar()">{{ editId ? 'Salvar alterações' : 'Salvar no banco' }}</button>
          @if (editId) { <button class="btn btn-cinza" (click)="cancelar()">Cancelar edição</button> }
          <button class="btn btn-claro" (click)="recarregar()">↻ Atualizar lista</button>
        </div>
      </div>
    } @else {
      <button class="btn btn-claro" style="margin-bottom: .75rem" (click)="recarregar()">↻ Atualizar lista</button>
    }

    <div class="rolagem">
      <table class="tabela">
        <thead>
          <tr><th>Sigla</th><th>Descrição</th><th>Turnos</th><th>Centro</th><th>Coordenador</th><th>Disciplinas</th><th>Status</th>@if (!leitura) { <th>Ações</th> }</tr>
        </thead>
        <tbody>
          @for (c of lista; track c.id) {
            <tr>
              <td>{{ c.sigla }}</td>
              <td>{{ c.descricao }}</td>
              <td>{{ c.turnos.join(', ') }}</td>
              <td>{{ nomeCentro(c.centroAcademicoId) }}</td>
              <td>{{ c.coordenador?.nome || '—' }}</td>
              <td>{{ c.disciplinas.length }}</td>
              <td><span [class]="c.status === 'ATIVO' ? 'ativo' : 'inativo'">{{ c.status }}</span></td>
              @if (!leitura) {
                <td style="white-space: nowrap">
                  <button class="btn btn-azul" (click)="editar(c)">Editar</button>
                  @if (c.status === 'ATIVO') { <button class="btn btn-vermelho" (click)="inativar(c)">Inativar</button> }
                </td>
              }
            </tr>
          } @empty {
            <tr><td [attr.colspan]="leitura ? 7 : 8" class="vazio">Nenhum curso encontrado.</td></tr>
          }
        </tbody>
      </table>
    </div>
  `,
})
export class CursosComponent extends Base implements OnInit {
  @Input() leitura = false;
  turnos = TURNOS;
  lista: Curso[] = [];
  centros: CentroAcademico[] = [];
  docentes: Docente[] = [];
  editId: number | null = null;
  form = this.vazio();

  constructor(private api: MonitoriaService) { super(); }

  ngOnInit() { this.recarregar(); }

  private vazio(): { sigla: string; descricao: string; turnos: Turno[]; centroAcademicoId: number | null; coordenadorId: number | null } {
    return { sigla: '', descricao: '', turnos: [], centroAcademicoId: null, coordenadorId: null };
  }

  nomeCentro(id: number) { return this.centros.find((c) => c.id === id)?.nome ?? '#' + id; }

  recarregar() {
    this.api.listarCursos().subscribe({ next: (l) => (this.lista = l), error: () => (this.erro = 'Erro ao listar cursos.') });
    if (!this.leitura) {
      this.api.listarCas().subscribe({ next: (l) => (this.centros = l), error: () => {} });
      this.api.listarDocentes().subscribe({ next: (l) => (this.docentes = l), error: () => {} });
    }
  }

  alternarTurno(t: Turno) {
    const i = this.form.turnos.indexOf(t);
    if (i >= 0) this.form.turnos.splice(i, 1);
    else this.form.turnos.push(t);
  }

  salvar() {
    const f = this.form;
    if (!f.sigla.trim() || !f.descricao.trim() || !f.centroAcademicoId || f.turnos.length === 0) {
      this.erro = 'Preencha sigla, descrição, centro acadêmico e ao menos um turno.';
      return;
    }
    const dto = { sigla: f.sigla, descricao: f.descricao, turnos: f.turnos, centroAcademicoId: f.centroAcademicoId, coordenadorId: f.coordenadorId };
    const obs = this.editId ? this.api.editarCurso(this.editId, dto) : this.api.criarCurso(dto);
    this.executar(obs, this.editId ? 'Curso atualizado.' : 'Curso cadastrado.', () => this.cancelar());
  }

  editar(c: Curso) {
    this.editId = c.id;
    this.form = {
      sigla: c.sigla, descricao: c.descricao, turnos: [...c.turnos],
      centroAcademicoId: c.centroAcademicoId, coordenadorId: c.coordenador?.id ?? null,
    };
  }

  cancelar() { this.editId = null; this.form = this.vazio(); }

  inativar(c: Curso) {
    const motivo = pedirMotivo('inativar ' + c.sigla);
    if (motivo) this.executar(this.api.inativarCurso(c.id, motivo), 'Curso inativado.');
  }
}
