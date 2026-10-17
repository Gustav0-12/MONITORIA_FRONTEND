import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MonitoriaService } from './monitoria.service';
import { AvisoComponent } from './aviso.component';
import { Curso, Disciplina } from './models';
import { Base, pedirMotivo } from './util';

@Component({
  selector: 'app-disciplinas',
  standalone: true,
  imports: [FormsModule, AvisoComponent],
  template: `
    <h2 class="titulo">Disciplinas</h2>
    <app-aviso [erro]="erro" [ok]="ok" />

    <div class="form-box">
      <h3 style="font-weight: 700; margin-bottom: .5rem">{{ editId ? 'Editar disciplina #' + editId : 'Cadastrar disciplina' }}</h3>
      <div class="grade">
        <div><label class="rotulo">Sigla</label><input class="campo" [(ngModel)]="form.sigla" /></div>
        <div><label class="rotulo">Descrição</label><input class="campo" [(ngModel)]="form.descricao" /></div>
        <div><label class="rotulo">Carga horária (h)</label><input class="campo" type="number" min="1" [(ngModel)]="form.cargaHoraria" /></div>
        <div>
          <label class="rotulo">Curso</label>
          <select class="campo" [(ngModel)]="form.cursoId">
            <option [ngValue]="null">Escolher curso</option>
            @for (c of cursos; track c.id) { <option [ngValue]="c.id">{{ c.sigla }} - {{ c.descricao }}</option> }
          </select>
        </div>
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
          <tr><th>Sigla</th><th>Descrição</th><th>Carga horária</th><th>Curso</th><th>Status</th><th>Ações</th></tr>
        </thead>
        <tbody>
          @for (d of lista; track d.id) {
            <tr>
              <td>{{ d.sigla }}</td>
              <td>{{ d.descricao }}</td>
              <td>{{ d.cargaHoraria }} h</td>
              <td>{{ siglaCurso(d.cursoId) }}</td>
              <td><span [class]="d.status === 'ATIVO' ? 'ativo' : 'inativo'">{{ d.status }}</span></td>
              <td style="white-space: nowrap">
                <button class="btn btn-azul" (click)="editar(d)">Editar</button>
                @if (d.status === 'ATIVO') { <button class="btn btn-vermelho" (click)="inativar(d)">Inativar</button> }
              </td>
            </tr>
          } @empty {
            <tr><td colspan="6" class="vazio">Nenhuma disciplina encontrada.</td></tr>
          }
        </tbody>
      </table>
    </div>
  `,
})
export class DisciplinasComponent extends Base implements OnInit {
  lista: Disciplina[] = [];
  cursos: Curso[] = [];
  editId: number | null = null;
  form = this.vazio();

  constructor(private api: MonitoriaService) { super(); }

  ngOnInit() { this.recarregar(); }

  private vazio(): { sigla: string; descricao: string; cargaHoraria: number | null; cursoId: number | null } {
    return { sigla: '', descricao: '', cargaHoraria: null, cursoId: null };
  }

  siglaCurso(id: number) { return this.cursos.find((c) => c.id === id)?.sigla ?? '#' + id; }

  recarregar() {
    this.api.listarDisciplinas().subscribe({ next: (l) => (this.lista = l), error: () => (this.erro = 'Erro ao listar disciplinas.') });
    this.api.listarCursos().subscribe({ next: (l) => (this.cursos = l), error: () => {} });
  }

  salvar() {
    const f = this.form;
    if (!f.sigla.trim() || !f.descricao.trim() || !f.cargaHoraria || !f.cursoId) {
      this.erro = 'Preencha sigla, descrição, carga horária e curso.';
      return;
    }
    const dto = { sigla: f.sigla, descricao: f.descricao, cargaHoraria: Number(f.cargaHoraria), cursoId: f.cursoId };
    const obs = this.editId ? this.api.editarDisciplina(this.editId, dto) : this.api.criarDisciplina(dto);
    this.executar(obs, this.editId ? 'Disciplina atualizada.' : 'Disciplina cadastrada.', () => this.cancelar());
  }

  editar(d: Disciplina) {
    this.editId = d.id;
    this.form = { sigla: d.sigla, descricao: d.descricao, cargaHoraria: d.cargaHoraria, cursoId: d.cursoId };
  }

  cancelar() { this.editId = null; this.form = this.vazio(); }

  inativar(d: Disciplina) {
    const motivo = pedirMotivo('inativar ' + d.sigla);
    if (motivo) this.executar(this.api.inativarDisciplina(d.id, motivo), 'Disciplina inativada.');
  }
}
