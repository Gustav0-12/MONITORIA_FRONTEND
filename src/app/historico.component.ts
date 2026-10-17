import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MonitoriaService } from './monitoria.service';
import { AvisoComponent } from './aviso.component';
import { Historico } from './models';
import { Base } from './util';

@Component({
  selector: 'app-historico',
  standalone: true,
  imports: [DatePipe, AvisoComponent],
  template: `
    <h2 class="titulo">Histórico de ações</h2>
    <app-aviso [erro]="erro" [ok]="ok" />
    <button class="btn btn-claro" style="margin-bottom: .75rem" (click)="recarregar()">↻ Atualizar lista</button>

    <div class="rolagem">
      <table class="tabela">
        <thead>
          <tr><th>Data/hora</th><th>Ação</th><th>Entidade</th><th>ID</th><th>Motivo</th><th>Responsável</th></tr>
        </thead>
        <tbody>
          @for (h of lista; track h.id) {
            <tr>
              <td>{{ h.dataHora | date: 'dd/MM/yyyy HH:mm' }}</td>
              <td>{{ h.tipoAcao }}</td>
              <td>{{ h.entidade }}</td>
              <td>{{ h.entidadeId }}</td>
              <td>{{ h.motivo }}</td>
              <td>{{ h.responsavelNome }} <span style="color: #6b7280">({{ h.responsavelEmail }})</span></td>
            </tr>
          } @empty {
            <tr><td colspan="6" class="vazio">Nenhum registro no histórico.</td></tr>
          }
        </tbody>
      </table>
    </div>
  `,
})
export class HistoricoComponent extends Base implements OnInit {
  lista: Historico[] = [];

  constructor(private api: MonitoriaService) { super(); }

  ngOnInit() { this.recarregar(); }

  recarregar() {
    this.api.listarHistorico().subscribe({
      next: (l) => (this.lista = [...l].sort((a, b) => b.dataHora.localeCompare(a.dataHora))),
      error: () => (this.erro = 'Erro ao carregar o histórico.'),
    });
  }
}
