export enum EstadoBot {
  INICIO     = 'INICIO',
  AGUARDANDO = 'AGUARDANDO',
}

export interface EstadoUsuarioType {
  etapa:     EstadoBot
  nome?:     string
  pedidoId?: string
}