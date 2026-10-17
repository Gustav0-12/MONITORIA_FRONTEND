import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  CentroAcademico, Curso, Discente, Disciplina, Docente, DiaSemana, Historico, Ies, Modalidade, Monitoria, Relatorio, Turno,
} from './models';

@Injectable({ providedIn: 'root' })
export class MonitoriaService {
  constructor(private http: HttpClient) {}

  // ---------- IES (administrador) ----------
  listarIes(): Observable<Ies[]> { return this.http.get<Ies[]>('/ies'); }
  buscarIes(id: number): Observable<Ies> { return this.http.get<Ies>('/ies/' + id); }
  criarIes(d: { sigla: string; nome: string; emailCentral: string; telefoneCentral: string }) {
    return this.http.post<void>('/ies/criar', d);
  }
  editarIes(id: number, d: { sigla: string; nome: string; emailCentral: string; telefoneCentral: string }) {
    return this.http.put<void>('/ies/' + id + '/editar', d);
  }
  inativarIes(id: number, motivo: string) { return this.http.patch<void>('/ies/' + id + '/inativar', motivo); }
  definirReitor(id: number, docenteId: number) { return this.http.patch<void>('/ies/' + id + '/reitor/' + docenteId, null); }

  // ---------- Centros acadêmicos (administrador) ----------
  listarCas(): Observable<CentroAcademico[]> { return this.http.get<CentroAcademico[]>('/centros-academicos'); }
  buscarCa(id: number): Observable<CentroAcademico> { return this.http.get<CentroAcademico>('/centros-academicos/' + id); }
  criarCa(d: { nome: string; emailCentral: string; telefoneCentral: string; iesId: number }) {
    return this.http.post<void>('/centros-academicos/criar', d);
  }
  editarCa(id: number, d: { nome: string; emailCentral: string; telefoneCentral: string }) {
    return this.http.put<void>('/centros-academicos/' + id + '/editar', d);
  }
  inativarCa(id: number, motivo: string) { return this.http.patch<void>('/centros-academicos/' + id + '/inativar', motivo); }
  definirCoordenadorCa(id: number, docenteId: number) {
    return this.http.patch<void>('/centros-academicos/' + id + '/coordenador/' + docenteId, null);
  }

  // ---------- Cursos (administrador; docente só lista) ----------
  listarCursos(): Observable<Curso[]> { return this.http.get<Curso[]>('/cursos'); }
  buscarCurso(id: number): Observable<Curso> { return this.http.get<Curso>('/cursos/' + id); }
  criarCurso(d: { sigla: string; descricao: string; turnos: Turno[]; centroAcademicoId: number; coordenadorId: number | null }) {
    return this.http.post<void>('/cursos/criar', d);
  }
  editarCurso(id: number, d: { sigla: string; descricao: string; turnos: Turno[]; centroAcademicoId: number; coordenadorId: number | null }) {
    return this.http.put<void>('/cursos/' + id + '/editar', d);
  }
  inativarCurso(id: number, motivo: string) { return this.http.patch<void>('/cursos/' + id + '/inativar', motivo); }

  // ---------- Docentes (administrador) ----------
  listarDocentes(): Observable<Docente[]> { return this.http.get<Docente[]>('/docentes'); }
  buscarDocente(id: number): Observable<Docente> { return this.http.get<Docente>('/docentes/' + id); }
  criarDocente(d: { nome: string; email: string; senha: string; matricula: string; telefone: string; centroAcademicoId: number }) {
    return this.http.post<void>('/docentes/criar', d);
  }
  inativarDocente(id: number, motivo: string) { return this.http.patch<void>('/docentes/' + id + '/inativar', motivo); }

  // ---------- Discentes (docente) ----------
  listarDiscentes(): Observable<Discente[]> { return this.http.get<Discente[]>('/discentes'); }
  criarDiscente(d: { nome: string; email: string; senha: string; matricula: string; telefone: string; cursoId: number }) {
    return this.http.post<void>('/discentes/criar', d);
  }
  inativarDiscente(id: number, motivo: string) { return this.http.put<void>('/discentes/' + id + '/inativar', motivo); }

  // ---------- Disciplinas (administrador e docente) ----------
  listarDisciplinas(): Observable<Disciplina[]> { return this.http.get<Disciplina[]>('/disciplinas'); }
  criarDisciplina(d: { sigla: string; descricao: string; cargaHoraria: number; cursoId: number }) {
    return this.http.post<void>('/disciplinas/criar', d);
  }
  editarDisciplina(id: number, d: { sigla: string; descricao: string; cargaHoraria: number; cursoId: number }) {
    return this.http.put<void>('/disciplinas/' + id + '/editar', d);
  }
  inativarDisciplina(id: number, motivo: string) { return this.http.put<void>('/disciplinas/' + id + '/inativar', motivo); }

  // ---------- Histórico (administrador) ----------
  listarHistorico(): Observable<Historico[]> { return this.http.get<Historico[]>('/historico'); }

  // ---------- Monitorias (docente; discente vê a própria) ----------
  listarMonitorias(): Observable<Monitoria[]> { return this.http.get<Monitoria[]>('/monitorias'); }
  buscarMonitoria(id: number): Observable<Monitoria> { return this.http.get<Monitoria>('/monitorias/' + id); }
  criarMonitoria(d: {
    docenteId: number; discenteId: number; semestre: string; disciplinaId: number; dias: DiaSemana[];
    dataInicio: string; dataFim: string; horarioInicio: string; horarioFim: string;
  }) { return this.http.post<void>('/monitorias/criar', d); }
  cancelarMonitoria(id: number, motivo: string) { return this.http.put<void>('/monitorias/' + id + '/cancelar', motivo); }
  finalizarMonitoria(id: number, motivo: string) { return this.http.put<void>('/monitorias/' + id + '/finalizar', motivo); }
  minhaMonitoria(): Observable<Monitoria> { return this.http.get<Monitoria>('/monitorias/discente'); }

  // ---------- Relatório (discente) ----------
  criarRelatorio(d: { ocorrencias: string; modalidade: Modalidade; local: string; frequencia: string; consideracoes: string }) {
    return this.http.post<void>('/relatorio-monitoria/criar', d);
  }
  editarRelatorio(d: { ocorrencias: string; modalidade: Modalidade; local: string; frequencia: string; consideracoes: string }) {
    return this.http.put<void>('/relatorio-monitoria/editar', d);
  }
  emitirRelatorio(): Observable<Relatorio> { return this.http.get<Relatorio>('/relatorio-monitoria'); }
  baixarRelatorioPdf(): Observable<Blob> {
    return this.http.get('/relatorio-monitoria/pdf', { responseType: 'blob' });
  }
}
