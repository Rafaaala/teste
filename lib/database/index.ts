import { neon, type NeonQueryFunction } from '@neondatabase/serverless'
import { requireEnv } from '@/lib/env'

let _sql: NeonQueryFunction<false, false> | null = null

function getSqlClient(): NeonQueryFunction<false, false> {
  if (!_sql) {
    const databaseUrl = requireEnv('DATABASE_URL')
    _sql = neon(databaseUrl)
  }
  return _sql
}

/** Cliente SQL lazy — só conecta na primeira query (não quebra o build/import). */
export const sql: NeonQueryFunction<false, false> = new Proxy(
  (() => undefined) as unknown as NeonQueryFunction<false, false>,
  {
    apply(_target, _thisArg, args) {
      return Reflect.apply(getSqlClient(), _thisArg, args)
    },
    get(_target, prop, receiver) {
      const client = getSqlClient()
      const value = Reflect.get(client, prop, receiver)
      return typeof value === 'function' ? value.bind(client) : value
    },
  }
)
