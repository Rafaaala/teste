import { z } from 'zod'

const envSchema = z.object({
  // ── Obrigatórias para a aplicação iniciar ────────────────────────────────
  DATABASE_URL: z
    .string()
    .min(1, 'DATABASE_URL é obrigatória (PostgreSQL / Neon)'),
  NEXTAUTH_SECRET: z
    .string()
    .min(1, 'NEXTAUTH_SECRET é obrigatória (openssl rand -base64 32)'),
  NEXTAUTH_URL: z
    .string()
    .url()
    .optional()
    .default('http://localhost:3000'),

  // ── Pagamentos (obrigatórias apenas nas rotas de pagamento) ──────────────
  MP_ACCESS_TOKEN: z.string().min(1).optional(),
  MP_WEBHOOK_SECRET: z.string().min(1).optional(),

  // ── Workers / integrações (opcionais) ────────────────────────────────────
  INTERNAL_API_SECRET: z.string().min(1).optional(),
  RAILWAY_WORKER_URL: z.string().url().optional(),
  FOCUS_NFE_TOKEN: z.string().min(1).optional(),
  WPP_SESSION: z.string().optional(),
  CARDAPIO_URL: z.string().optional(),

  // ── Runtime ──────────────────────────────────────────────────────────────
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .optional()
    .default('development'),
  PORT: z.string().optional(),
})

export type Env = z.infer<typeof envSchema>

let _env: Env | null = null
let _validationError: string | null = null

function parseEnv(): Env | null {
  const result = envSchema.safeParse(process.env)
  if (!result.success) {
    const missing = result.error.issues
      .map((i) => `  • ${i.path.join('.')}: ${i.message}`)
      .join('\n')
    _validationError =
      `Variáveis de ambiente inválidas ou ausentes:\n${missing}\n\n` +
      'Copie .env.example para .env e preencha os valores.'
    return null
  }
  return result.data
}

/** Variáveis validadas — lança apenas quando chamada e env está incompleta. */
export function getEnv(): Env {
  if (!_env) {
    _env = parseEnv()
  }
  if (!_env) {
    throw new Error(_validationError ?? 'Configuração de ambiente inválida.')
  }
  return _env
}

/** Retorna env ou null sem lançar (útil para health checks). */
export function tryGetEnv(): Env | null {
  if (!_env) {
    _env = parseEnv()
  }
  return _env
}

export function getEnvError(): string | null {
  if (!_validationError && !_env) {
    parseEnv()
  }
  return _validationError
}

export function requireEnv<K extends keyof Env>(key: K): NonNullable<Env[K]> {
  const env = getEnv()
  const value = env[key]
  if (value === undefined || value === null || value === '') {
    throw new Error(
      `Variável de ambiente obrigatória ausente: ${String(key)}. ` +
        'Consulte .env.example.'
    )
  }
  return value as NonNullable<Env[K]>
}
