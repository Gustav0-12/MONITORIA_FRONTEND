import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MonitoriaService } from './monitoria.service';
import { AvisoComponent } from './aviso.component';
import { DIAS, DiaSemana, Discente, Disciplina, Monitoria, ROTULO_DIA } from './models';
import { Base, pedirMotivo } from './util';

@Component({
  selector: 'app-monitorias',
  standalone: true,
  imports: [FormsModule, DatePipe, AvisoComponent],
  template: `
    <h2 class="titulo">Monitorias</h2>
    <app-aviso [erro]="erro" [ok]="ok" />

    <div class="form-box">
      <h3 style="font-weight: 700; margin-bottom: .5rem">Cadastrar monitoria</h3>
      <div class="grade">
        <div>
          <label class="rotulo">Seu ID de docente</label>
          <input class="campo" type="number" min="1" [(ngModel)]="form.docenteId" (ngModelChange)="guardarDocenteId()" />
        </div>
        <div>
          <label class="rotulo">Discente</label>
          <select class="campo" [(ngModel)]="form.discenteId">
            <option [ngValue]="null">Escolher discente</option>
            @for (d of discentesAtivos; track d.id) { <option [ngValue]="d.id">{{ d.nome }} ({{ d.matricula }})</option> }
          </select>
        </div>
        <div>
          <label class="rotulo">Disciplina</label>
          <select class="campo" [(ngModel)]="form.disciplinaId">
            <option [ngValue]="null">Escolher disciplina</option>
            @for (d of disciplinasAtivas; track d.id) { <option [ngValue]="d.id">{{ d.sigla }} - {{ d.descricao }}</option> }
          </select>
        </div>
        <div><label class="rotulo">Semestre</label><input class="campo" placeholder="2026.2" [(ngModel)]="form.semestre" /></div>
        <div><label class="rotulo">Data de início</label><input class="campo" type="date" [(ngModel)]="form.dataInicio" /></div>
        <div><label class="rotulo">Data de fim</label><input class="campo" type="date" [(ngModel)]="form.dataFim" /></div>
        <div><label class="rotulo">Horário de início</label><input class="campo" type="time" [(ngModel)]="form.horarioInicio" /></div>
        <div><label class="rotulo">Horário de fim</label><input class="campo" type="time" [(ngModel)]="form.horarioFim" /></div>
      </div>
      <div style="margin-top: .5rem">
        <label class="rotulo">Dias da semana</label>
        @for (d of dias; track d) {
          <label style="margin-right: 1rem; font-size: .875rem">
            <input type="checkbox" [checked]="form.dias.includes(d)" (change)="alternarDia(d)" /> {{ rotulo(d) }}
          </label>
        }
      </div>
      <div style="margin-top: .75rem; display: flex; gap: .5rem">
        <button class="btn btn-azul" (click)="salvar()">Salvar no banco</button>
        <button class="btn btn-claro" (click)="recarregar()">↻ Atualizar lista</button>
      </div>
      <p style="margin-top: .5rem; font-size: .75rem; color: #6b7280">
        O back ainda não tem rota para descobrir o ID do docente logado. Peça ao administrador (aba Docentes) e ele fica salvo neste navegador.
      </p>
    </div>

    <div class="rolagem">
      <table class="tabela">
        <thead>
          <tr><th>ID</th><th>Docente</th><th>Discente</th><th>Disciplina</th><th>Semestre</th><th>Dias</th><th>Horário</th><th>Período</th><th>Status</th><th>Ações</th></tr>
        </thead>
        <tbody>
          @for (m of lista; track m.id) {
            <tr>
              <td>{{ m.id }}</td>
              <td>{{ m.docente }}</td>
              <td>{{ m.discente }}</td>
              <td>{{ m.disciplina }}</td>
              <td>{{ m.semestre }}</td>
              <td>{{ diasTexto(m.dias) }}</td>
              <td>{{ m.horaInicio?.slice(0, 5) }} - {{ m.horaFim?.slice(0, 5) }}</td>
              <td>{{ m.dataInicio | date: 'dd/MM/yyyy' }} a {{ m.dataFim | date: 'dd/MM/yyyy' }}</td>
              <td><span [class]="m.status === 'ATIVA' ? 'ativo' : m.status === 'FINALIZADA' ? 'finalizada' : 'inativo'">{{ m.status }}</span></td>
              <td style="white-space: nowrap">
                @if (m.status === 'ATIVA') {
                  <button class="btn btn-verde" (click)="finalizar(m)">Finalizar</button>
                  <button class="btn btn-vermelho" (click)="cancelar(m)">Cancelar</button>
                }
              </td>
            </tr>
          } @empty {
            <tr><td colspan="10" class="vazio">Nenhuma monitoria encontrada.</td></tr>
          }
        </tbody>
      </table>
    </div>
  `,
})
export class MonitoriasComponent extends Base implements OnInit {
  dias = DIAS;
  lista: Monitoria[] = [];
  discentesAtivos: Discente[] = [];
  disciplinasAtivas: Disciplina[] = [];
  form = this.vazio();

  constructor(private api: MonitoriaService) { super(); }

  ngOnInit() {
    const salvo = localStorage.getItem('docenteId');
    if (salvo) this.form.docenteId = Number(salvo);
    this.recarregar();
  }

  private vazio(): {
    docenteId: number | null; discenteId: number | null; disciplinaId: number | null; semestre: string;
    dias: DiaSemana[]; dataInicio: string; dataFim: string; horarioInicio: string; horarioFim: string;
  } {
    return {
      docenteId: null, discenteId: null, disciplinaId: null, semestre: '',
      dias: [], dataInicio: '', dataFim: '', horarioInicio: '', horarioFim: '',
    };
  }

  rotulo(d: DiaSemana) { return ROTULO_DIA[d]; }
  diasTexto(ds: DiaSemana[]) { return (ds ?? []).map((d) => ROTULO_DIA[d]).join(', '); }

  guardarDocenteId() {
    if (this.form.docenteId) localStorage.setItem('docenteId', String(this.form.docenteId));
  }

  recarregar() {
    this.api.listarMonitorias().subscribe({ next: (l) => (this.lista = l), error: () => (this.erro = 'Erro ao listar monitorias.') });
    this.api.listarDiscentes().subscribe({ next: (l) => (this.discentesAtivos = l.filter((d) => d.status === 'ATIVO')), error: () => {} });
    this.api.listarDisciplinas().subscribe({ next: (l) => (this.disciplinasAtivas = l.filter((d) => d.status === 'ATIVO')), error: () => {} });
  }

  alternarDia(d: DiaSemana) {
    const i = this.form.dias.indexOf(d);
    if (i >= 0) this.form.dias.splice(i, 1);
    else this.form.dias.push(d);
  }

  salvar() {
    const f = this.form;
    if (!f.docenteId || !f.discenteId || !f.disciplinaId || !f.semestre.trim() || f.dias.length === 0 ||
        !f.dataInicio || !f.dataFim || !f.horarioInicio || !f.horarioFim) {
      this.erro = 'Preencha todos os campos e marque ao menos um dia da semana.';
      return;
    }
    const dto = {
      docenteId: f.docenteId, discenteId: f.discenteId, disciplinaId: f.disciplinaId, semestre: f.semestre,
      dias: f.dias, dataInicio: f.dataInicio, dataFim: f.dataFim, horarioInicio: f.horarioInicio, horarioFim: f.horarioFim,
    };
    this.executar(this.api.criarMonitoria(dto), 'Monitoria cadastrada.', () => {
      const docenteId = f.docenteId;
      this.form = this.vazio();
      this.form.docenteId = docenteId;
    });
  }

  cancelar(m: Monitoria) {
    const motivo = pedirMotivo('cancelar monitoria #' + m.id);
    if (motivo) this.executar(this.api.cancelarMonitoria(m.id, motivo), 'Monitoria cancelada.');
  }

  finalizar(m: Monitoria) {
    const motivo = pedirMotivo('finalizar monitoria #' + m.id);
    if (motivo) this.executar(this.api.finalizarMonitoria(m.id, motivo), 'Monitoria finalizada.');
  }
}
