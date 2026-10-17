import { Component } from '@angular/core';
import { AuthService } from './auth.service';
import { LoginComponent } from './login.component';
import { IesComponent } from './ies.component';
import { CaComponent } from './ca.component';
import { DocentesComponent } from './docentes.component';
import { CursosComponent } from './cursos.component';
import { DisciplinasComponent } from './disciplinas.component';
import { HistoricoComponent } from './historico.component';
import { DiscentesComponent } from './discentes.component';
import { MonitoriasComponent } from './monitorias.component';
import { AreaDiscenteComponent } from './area-discente.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    LoginComponent, IesComponent, CaComponent, DocentesComponent, CursosComponent,
    DisciplinasComponent, HistoricoComponent, DiscentesComponent, MonitoriasComponent, AreaDiscenteComponent,
  ],
  templateUrl: './app.component.html',
})
export class AppComponent {
  aba = '';

  constructor(public auth: AuthService) {}

  get abas(): { id: string; nome: string }[] {
    switch (this.auth.perfil()) {
      case 'ADMINISTRADOR':
        return [
          { id: 'ies', nome: 'IES' },
          { id: 'ca', nome: 'Centros acadêmicos' },
          { id: 'docentes', nome: 'Docentes' },
          { id: 'cursos', nome: 'Cursos' },
          { id: 'disciplinas', nome: 'Disciplinas' },
          { id: 'historico', nome: 'Histórico' },
        ];
      case 'COLABORADOR':
        return [
          { id: 'monitorias', nome: 'Monitorias' },
          { id: 'discentes', nome: 'Discentes' },
          { id: 'disciplinas', nome: 'Disciplinas' },
          { id: 'cursos', nome: 'Cursos' },
        ];
      case 'USUARIO':
        return [{ id: 'minha', nome: 'Minha monitoria' }];
      default:
        return [];
    }
  }

  get abaAtual(): string {
    const ids = this.abas.map((a) => a.id);
    return ids.includes(this.aba) ? this.aba : ids[0] ?? '';
  }

  get nomePerfil(): string {
    switch (this.auth.perfil()) {
      case 'ADMINISTRADOR': return 'Administrador';
      case 'COLABORADOR': return 'Docente';
      case 'USUARIO': return 'Discente';
      default: return '';
    }
  }

  sair() {
    this.aba = '';
    this.auth.sair();
  }
}
