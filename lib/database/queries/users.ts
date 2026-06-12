// lib/database/queries/users.ts
import { sql } from '@/lib/database'

export interface User {
  id:             string
  clerk_user_id:  string | null
  name:           string
  email:          string | null
  role:           string
  is_active:      boolean
  // Requires column `password_hash text` on the `users` table.
  // Run: ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash text;
  password_hash:  string | null
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

export async function getUserByEmail(
  email: string
): Promise<User | null> {
  const rows = await sql`
    SELECT *
    FROM users
    WHERE email      = ${email.toLowerCase()}
      AND is_active  = TRUE
      AND deleted_at IS NULL
    LIMIT 1
  `
  return (rows[0] as User | undefined) ?? null
}

export async function getUserById(
  id: string
): Promise<User | null> {
  const rows = await sql`
    SELECT *
    FROM users
    WHERE id         = ${id}
      AND is_active  = TRUE
      AND deleted_at IS NULL
    LIMIT 1
  `
  return (rows[0] as User | undefined) ?? null
}
