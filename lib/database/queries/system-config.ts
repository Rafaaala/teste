import { sql } from '@/lib/database'
import type {
  SystemConfig,
  ConfigValue,
  CreateSystemConfigInput,
  UpdateSystemConfigInput,
} from '@/types/database'

// Busca todas as configurações (GetAll)
export async function getAllSystemConfig(): Promise<SystemConfig[]> {
  const rows = await sql`
    SELECT *
    FROM system_config
    ORDER BY key ASC
  `
  return rows as SystemConfig[]
}

// Busca uma configuração por chave (GetByKey)
export async function getSystemConfigByKey(
  key: string
): Promise<SystemConfig | null> {
  const rows = await sql`
    SELECT *
    FROM system_config
    WHERE key = ${key}
    LIMIT 1
  `
  return (rows[0] as SystemConfig | undefined) ?? null
}

// Cria uma nova configuração (Create)
export async function createSystemConfig(
  input: CreateSystemConfigInput
): Promise<SystemConfig> {
  const rows = await sql`
    INSERT INTO system_config (
      key,
      value,
      description,
      updated_by
    ) VALUES (
      ${input.key},
      ${JSON.stringify(input.value)}::jsonb,
      ${input.description ?? null},
      ${input.updated_by    ?? null}
    )
    RETURNING *
  `
  return rows[0] as SystemConfig
}

// Atualiza uma configuração existente (Update)
export async function updateSystemConfig(
  key:   string,
  input: UpdateSystemConfigInput
): Promise<SystemConfig | null> {
  const valueJson =
    input.value !== undefined ? JSON.stringify(input.value) : null

  const rows = await sql`
    UPDATE system_config
    SET
      value       = COALESCE(${valueJson}::jsonb, value),
      description = COALESCE(${input.description ?? null}, description),
      updated_by  = COALESCE(${input.updated_by  ?? null}, updated_by),
      updated_at  = NOW()
    WHERE key = ${key}
    RETURNING *
  `
  return (rows[0] as SystemConfig | undefined) ?? null
}

export function isValidConfigKey(key: string): boolean {
  return /^[a-z][a-z0-9_]{0,79}$/.test(key)
}

export function parseConfigValue(raw: unknown): ConfigValue | null {
  if (raw === undefined) return null
  if (
    typeof raw === 'string' ||
    typeof raw === 'number' ||
    typeof raw === 'boolean' ||
    raw === null
  ) {
    return raw
  }
  if (Array.isArray(raw)) return raw as ConfigValue[]
  if (typeof raw === 'object') return raw as ConfigValue
  return null
}
