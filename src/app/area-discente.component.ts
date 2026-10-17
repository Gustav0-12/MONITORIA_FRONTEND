import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MonitoriaService } from './monitoria.service';
import { AvisoComponent } from './aviso.component';
import { Modalidade, Monitoria, ROTULO_DIA, Relatorio } from './models';
import { msgErro } from './util';

@Component({
  selector: 'app-area-discente',
  standalone: true,
  imports: [FormsModule, DatePipe, AvisoComponent],
  template: `
    <h2 class="titulo">Minha monitoria</h2>
    <app-aviso [erro]="erro" [ok]="ok" />

    @if (carregando) {
      <p>Carregando...</p>
    } @else if (!monitoria) {
      <div class="aviso aviso-erro">Você ainda não tem uma monitoria cadastrada. Peça ao seu docente para cadastrar.</div>
    } @else {
      <div class="form-box">
        <div class="grade" style="font-size: .875rem">
          <div><b>Disciplina:</b> {{ monitoria.disciplina }}</div>
          <div><b>Docente:</b> {{ monitoria.docente }}</div>
          <div><b>Semestre:</b> {{ monitoria.semestre }}</div>
          <div><b>Dias:</b> {{ diasTexto(monitoria) }}</div>
          <div><b>Horário:</b> {{ monitoria.horaInicio?.slice(0, 5) }} - {{ monitoria.horaFim?.slice(0, 5) }}</div>
          <div><b>Período:</b> {{ monitoria.dataInicio | date: 'dd/MM/yyyy' }} a {{ monitoria.dataFim | date: 'dd/MM/yyyy' }}</div>
          <div><b>Status:</b> <span [class]="monitoria.status === 'ATIVA' ? 'ativo' : 'inativo'">{{ monitoria.status }}</span></div>
        </div>
      </div>

      <h3 style="font-weight: 700; margin-bottom: .5rem">
        {{ relatorio ? 'Editar relatório final' : 'Criar relatório final' }}
      </h3>
      <div style="display: flex; flex-direction: column; gap: .75rem; max-width: 36rem">
        <div>
          <label class="rotulo">Modalidade</label>
          <select class="campo" [(ngModel)]="form.modalidade">
            <option value="PRESENCIAL">Presencial</option>
            <option value="REMOTO">Remoto</option>
          </select>
        </div>
        <div><label class="rotulo">Local de atuação</label><input class="campo" placeholder="Ex: Lab de Redes" [(ngModel)]="form.local" /></div>
        <div><label class="rotulo">Frequência</label><input class="campo" placeholder="Ex: 2 vezes por semana" [(ngModel)]="form.frequencia" /></div>
        <div><label class="rotulo">Ocorrências</label><textarea class="campo" rows="3" [(ngModel)]="form.ocorrencias"></textarea></div>
        <div><label class="rotulo">Considerações finais</label><textarea class="campo" rows="4" placeholder="Como foi a monitoria?" [(ngModel)]="form.consideracoes"></textarea></div>
        <div style="display: flex; gap: .5rem">
          <button class="btn btn-azul" (click)="salvar()">{{ relatorio ? 'Salvar alterações' : 'Criar relatório' }}</button>
          @if (relatorio) { <button class="btn btn-verde" (click)="baixarPdf()">Baixar PDF</button> }
        </div>
      </div>
    }
  `,
})
export class AreaDiscenteComponent implements OnInit {
  monitoria: Monitoria | null = null;
  relatorio: Relatorio | null = null;
  carregando = true;
  erro = '';
  ok = '';
  form: { modalidade: Modalidade; local: string; frequencia: string; ocorrencias: string; consideracoes: string } = this.vazio();

  constructor(private api: MonitoriaService) {}

  ngOnInit() { this.carregar(); }

  private vazio(): { modalidade: Modalidade; local: string; frequencia: string; ocorrencias: string; consideracoes: string } {
    return { modalidade: 'PRESENCIAL', local: '', frequencia: '', ocorrencias: '', consideracoes: '' };
  }

  diasTexto(m: Monitoria) { return (m.dias ?? []).map((d) => ROTULO_DIA[d]).join(', '); }

  carregar() {
    this.carregando = true;
    this.api.minhaMonitoria().subscribe({
      next: (m) => {
        this.monitoria = m;
        this.carregarRelatorio();
      },
      error: () => {
        this.monitoria = null;
        this.carregando = false;
      },
    });
  }

  private carregarRelatorio() {
    this.api.emitirRelatorio().subscribe({
      next: (r) => {
        this.relatorio = r;
        this.form = {
          modalidade: r.modalidade, local: r.local ?? '', frequencia: r.frequencia ?? '',
          ocorrencias: r.ocorrencias ?? '', consideracoes: r.consideracoes ?? '',
        };
        this.carregando = false;
      },
      error: () => {
        this.relatorio = null;
        this.carregando = false;
      },
    });
  }

  salvar() {
    this.erro = '';
    this.ok = '';
    if (!this.form.local.trim()) { this.erro = 'Informe o local de atuação.'; return; }
    const obs = this.relatorio ? this.api.editarRelatorio(this.form) : this.api.criarRelatorio(this.form);
    obs.subscribe({
      next: () => {
        this.ok = this.relatorio ? 'Relatório atualizado.' : 'Relatório criado.';
        this.carregarRelatorio();
      },
      error: (e) => (this.erro = msgErro(e)),
    });
  }

  baixarPdf() {
    this.erro = '';
    this.api.baixarRelatorioPdf().subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'relatorio-monitoria.pdf';
        a.click();
        URL.revokeObjectURL(url);
      },
      error: (e) => (this.erro = msgErro(e)),
    });
  }
}
