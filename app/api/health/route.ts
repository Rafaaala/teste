import { NextResponse } from 'next/server'
import { sql } from '@/lib/database'
import { getEnvError, tryGetEnv } from '@/lib/env'

export async function GET() {
  const envError = getEnvError()
  if (envError) {
    return NextResponse.json(
      { status: 'degraded', env: 'invalid', message: envError },
      { status: 503 }
    )
  }

  try {
    const result = await sql`SELECT NOW() AS timestamp`
    return NextResponse.json({
      status: 'ok',
      env: tryGetEnv() ? 'valid' : 'unknown',
      timestamp: result[0].timestamp,
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'degraded',
        env: 'valid',
        database: 'unreachable',
        message: String(error),
      },
      { status: 503 }
    )
  }
}
