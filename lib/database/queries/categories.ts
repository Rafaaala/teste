import { sql } from '@/lib/database'
import type {
  Category,
  CategoryPublic,
  CreateCategoryInput,
  UpdateCategoryInput,
} from '@/types/database'

// Busca todas as categorias ativas (GetAllActive)
// Usada no cardápio público e no painel admin
export async function getActiveCategories(): Promise<CategoryPublic[]> {
  const rows = await sql`
    SELECT
      id,
      name,
      description,
      sort_order
    FROM categories
    WHERE is_active  = TRUE
      AND deleted_at IS NULL
    ORDER BY sort_order ASC, name ASC
  `
  return rows as CategoryPublic[]
}

// Busca todas as categorias ativas & inativas (GetAll)
// Usada apenas no painel admin
export async function getAllCategories(): Promise<Category[]> {
  const rows = await sql`
    SELECT *
    FROM categories
    WHERE deleted_at IS NULL
    ORDER BY sort_order ASC, name ASC
  `
  return rows as Category[]
}

// Busca uma categoria por ID (GetById)
export async function getCategoryById(
  id: string
): Promise<Category | null> {
  const rows = await sql`
    SELECT *
    FROM categories
    WHERE id         = ${id}
      AND deleted_at IS NULL
    LIMIT 1
  `
  return (rows[0] as Category | undefined) ?? null
}

// Cria uma nova categoria (Create)
export async function createCategory(
  input: CreateCategoryInput
): Promise<Category> {
  const rows = await sql`
    INSERT INTO categories (
      name,
      description,
      sort_order
    ) VALUES (
      ${input.name},
      ${input.description ?? null},
      ${input.sort_order ?? 0}
    )
    RETURNING *
  `
  return rows[0] as Category
}

// Atualiza uma categoria existente (Update)
export async function updateCategory(
  id:    string,
  input: UpdateCategoryInput
): Promise<Category | null> {
  const rows = await sql`
    UPDATE categories
    SET
      name        = COALESCE(${input.name        ?? null}, name),
      description = COALESCE(${input.description ?? null}, description),
      sort_order  = COALESCE(${input.sort_order  ?? null}, sort_order),
      is_active   = COALESCE(${input.is_active   ?? null}, is_active),
      updated_at  = NOW()
    WHERE id         = ${id}
      AND deleted_at IS NULL
    RETURNING *
  `
  return (rows[0] as Category | undefined) ?? null
}

// Soft delete — não apaga fisicamente (Delete)
export async function deleteCategory(
  id: string
): Promise<boolean> {
  const rows = await sql`
    UPDATE categories
    SET
      deleted_at = NOW(),
      updated_at = NOW()
    WHERE id         = ${id}
      AND deleted_at IS NULL
    RETURNING id
  `
  return rows.length > 0
}