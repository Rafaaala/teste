import { EstadoBot, EstadoUsuarioType } from '../types'

const estados = new Map<string, EstadoUsuarioType>()

const ESTADO_INICIAL: EstadoUsuarioType = {
  etapa: EstadoBot.INICIO,
}

export const estadoService = {
  get(numero: string): EstadoUsuarioType {
    return estados.get(numero) ?? { ...ESTADO_INICIAL }
  },

  set(numero: string, estado: EstadoUsuarioType): void {
    estados.set(numero, estado)
  },

  reset(numero: string): void {
    estados.delete(numero)
  },
}