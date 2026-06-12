// lib/database/queries/users.ts
import { sql } from '@/lib/database'

export interface User {
  id:             string
  clerk_user_id:  string
  name:           string
  email:          string | null
  role:           string
  is_active:      boolean
}

export async function getUserByClerkId(
  clerkUserId: string
): Promise<User | null> {
  const rows = await sql`
    SELECT *
    FROM users
    WHERE clerk_user_id = ${clerkUserId}
      AND is_active     = TRUE
      AND deleted_at    IS NULL
    LIMIT 1
  `
  return (rows[0] as User | undefined) ?? null
}