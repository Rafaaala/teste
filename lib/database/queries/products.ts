import { sql } from '@/lib/database'
import type {
  Product,
  ProductWithCategory,
  ProductPublic,
  MenuCategory,
  CreateProductInput,
  UpdateProductInput,
} from '@/types/database'

type MenuRow = ProductPublic & { category_name: string; category_sort: number }

// Cardápio público agrupado por categoria (GetMenu)
// Usada no cardápio público
export async function getMenu(): Promise<MenuCategory[]> {
  const rows = await sql`
    SELECT
      p.id,
      p.category_id,
      p.name,
      p.description,
      p.price,
      p.image_url,
      p.sort_order,
      c.name        AS category_name,
      c.sort_order  AS category_sort
    FROM products p
    JOIN categories c ON c.id = p.category_id
    WHERE p.is_active  = TRUE
      AND p.deleted_at IS NULL
      AND c.is_active  = TRUE
      AND c.deleted_at IS NULL
    ORDER BY c.sort_order ASC, p.sort_order ASC
  `

  // Agrupa os produtos por categoria em memória
  const menuMap = new Map<string, MenuCategory>()

  for (const row of rows as MenuRow[]) {
    if (!menuMap.has(row.category_id)) {
      menuMap.set(row.category_id, {
        id:          row.category_id,
        name:        row.category_name,
        description: null,
        sort_order:  row.category_sort,
        products:    [],
      })
    }

    menuMap.get(row.category_id)!.products.push({
      id:            row.id,
      category_id:   row.category_id,
      category_name: row.category_name,
      name:          row.name,
      description:   row.description,
      price:         row.price,
      image_url:     row.image_url,
      sort_order:    row.sort_order,
    })
  }

  return Array.from(menuMap.values())
}

// Busca todos os produtos ativos e inativos (GetAll)
// Usada apenas no painel admin
export async function getAllProducts(): Promise<ProductWithCategory[]> {
  const rows = await sql`
    SELECT
      p.*,
      c.name AS category_name
    FROM products p
    JOIN categories c ON c.id = p.category_id
    WHERE p.deleted_at IS NULL
    ORDER BY c.sort_order ASC, p.sort_order ASC
  `
  return rows as ProductWithCategory[]
}

// Busca um produto por ID (GetById)
export async function getProductById(
  id: string
): Promise<ProductWithCategory | null> {
  const rows = await sql`
    SELECT
      p.*,
      c.name AS category_name
    FROM products p
    JOIN categories c ON c.id = p.category_id
    WHERE p.id         = ${id}
      AND p.deleted_at IS NULL
    LIMIT 1
  `
  return (rows[0] as ProductWithCategory | undefined) ?? null
}

// Cria um novo produto e registra o preço inicial no histórico (Create)
export async function createProduct(
  input:     CreateProductInput,
  createdBy: string
): Promise<Product> {
  const rows = await sql`
    WITH new_product AS (
      INSERT INTO products (
        category_id,
        name,
        description,
        price,
        image_url,
        sort_order
      ) VALUES (
        ${input.category_id},
        ${input.name},
        ${input.description  ?? null},
        ${input.price},
        ${input.image_url    ?? null},
        ${input.sort_order   ?? 0}
      )
      RETURNING *
    ),
    price_log AS (
      INSERT INTO product_price_history (
        product_id,
        old_price,
        new_price,
        changed_by
      )
      SELECT
        new_product.id,
        0,
        new_product.price,
        ${createdBy}
      FROM new_product
    )
    SELECT * FROM new_product
  `
  return rows[0] as Product
}

// Atualiza um produto existente — registra no histórico se o preço mudou (Update)
export async function updateProduct(
  id:        string,
  input:     UpdateProductInput,
  updatedBy: string
): Promise<Product | null> {
  const current = await getProductById(id)
  if (!current) return null

  const priceChanged =
    input.price !== undefined &&
    input.price !== current.price

  const rows = await sql`
    UPDATE products
    SET
      category_id = COALESCE(${input.category_id ?? null}, category_id),
      name        = COALESCE(${input.name        ?? null}, name),
      description = COALESCE(${input.description ?? null}, description),
      price       = COALESCE(${input.price       ?? null}, price),
      image_url   = COALESCE(${input.image_url   ?? null}, image_url),
      sort_order  = COALESCE(${input.sort_order  ?? null}, sort_order),
      is_active   = COALESCE(${input.is_active   ?? null}, is_active),
      updated_at  = NOW()
    WHERE id         = ${id}
      AND deleted_at IS NULL
    RETURNING *
  `

  if (!rows[0]) return null

  if (priceChanged) {
    await sql`
      INSERT INTO product_price_history (
        product_id,
        old_price,
        new_price,
        changed_by
      ) VALUES (
        ${id},
        ${current.price},
        ${input.price!},
        ${updatedBy}
      )
    `
  }

  return rows[0] as Product
}

// Soft delete — não apaga fisicamente (Delete)
export async function deleteProduct(
  id: string
): Promise<boolean> {
  const rows = await sql`
    UPDATE products
    SET
      deleted_at = NOW(),
      updated_at = NOW()
    WHERE id         = ${id}
      AND deleted_at IS NULL
    RETURNING id
  `
  return rows.length > 0
}
