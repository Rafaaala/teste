// app/api/health/route.ts
import { sql } from '@/lib/database'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const result = await sql`SELECT NOW() AS timestamp`
    return NextResponse.json({ 
      status: 'ok', 
      timestamp: result[0].timestamp 
    })
  } catch (error) {
    return NextResponse.json(
      { status: 'error', message: String(error) },
      { status: 500 }
    )
  }
}
