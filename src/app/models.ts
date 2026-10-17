export type Perfil = 'ADMINISTRADOR' | 'COLABORADOR' | 'USUARIO';
export type Status = 'ATIVO' | 'INATIVO';
export type Turno = 'MATUTINO' | 'VESPERTINO' | 'NOTURNO';
export type DiaSemana = 'SEGUNDA_FEIRA' | 'TERCA_FEIRA' | 'QUARTA_FEIRA' | 'QUINTA_FEIRA' | 'SEXTA_FEIRA' | 'SABADO' | 'DOMINGO';
export type StatusMonitoria = 'ATIVA' | 'FINALIZADA' | 'CANCELADA';
export type Modalidade = 'PRESENCIAL' | 'REMOTO';

export const TURNOS: Turno[] = ['MATUTINO', 'VESPERTINO', 'NOTURNO'];
export const DIAS: DiaSemana[] = ['SEGUNDA_FEIRA', 'TERCA_FEIRA', 'QUARTA_FEIRA', 'QUINTA_FEIRA', 'SEXTA_FEIRA', 'SABADO', 'DOMINGO'];
export const ROTULO_DIA: Record<DiaSemana, string> = {
  SEGUNDA_FEIRA: 'Segunda', TERCA_FEIRA: 'Terça', QUARTA_FEIRA: 'Quarta', QUINTA_FEIRA: 'Quinta',
  SEXTA_FEIRA: 'Sexta', SABADO: 'Sábado', DOMINGO: 'Domingo',
};

export interface DocenteResumo { id: number; nome: string; }
export interface CentroResumo { id: number; nome: string; status: Status; }
export interface CursoResumo { id: number; sigla: string; descricao: string; status: Status; }
export interface DisciplinaResumo { id: number; sigla: string; descricao: string; cargaHoraria: number; status: Status; }

export interface Ies {
  id: number; sigla: string; nome: string; emailCentral: string; telefoneCentral: string;
  dataCadastro: string; status: Status; reitor: DocenteResumo | null; centrosAcademicos: CentroResumo[];
}
export interface CentroAcademico {
  id: number; nome: string; emailCentral: string; telefoneCentral: string; status: Status;
  dataCadastro: string; iesId: number; coordenador: DocenteResumo | null;
  docentes: DocenteResumo[]; cursos: CursoResumo[];
}
export interface Curso {
  id: number; sigla: string; descricao: string; turnos: Turno[]; status: Status; dataCadastro: string;
  centroAcademicoId: number; coordenador: DocenteResumo | null; disciplinas: DisciplinaResumo[];
}
export interface Docente {
  id: number; matricula: string; telefone: string; usuarioId: number; nome: string; email: string;
  status: Status; centroAcademico: CentroResumo | null;
}
export interface Discente {
  id: number; matricula: string; telefone: string; usuarioId: number; nome: string; email: string;
  status: Status; cursoId: number;
}
export interface Disciplina {
  id: number; sigla: string; descricao: string; cargaHoraria: number; dataCadastro: string; status: Status; cursoId: number;
}
export interface Historico {
  id: number; tipoAcao: string; entidade: string; entidadeId: number; motivo: string;
  dataHora: string; responsavelNome: string; responsavelEmail: string;
}
export interface Monitoria {
  id: number; docente: string; discente: string; disciplina: string; semestre: string;
  dias: DiaSemana[]; horaInicio: string; horaFim: string; dataInicio: string; dataFim: string; status: StatusMonitoria;
}
export interface Relatorio {
  id: number; docente: string; semestre: string; disciplina: string; dias: DiaSemana[];
  horaInicio: string; horaFim: string; dataInicio: string; dataFim: string; status: StatusMonitoria;
  ocorrencias: string; modalidade: Modalidade; local: string; frequencia: string; consideracoes: string;
}
export interface TokenResponse { token: string; expiresIn: number; }
