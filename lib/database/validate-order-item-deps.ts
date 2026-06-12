import { getOrderById } from '@/lib/database/queries/orders'
import { getProductById } from '@/lib/database/queries/products'

export async function validateOrderAndProduct(
  orderId: string,
  productId: string
): Promise<
  | { ok: true; product: { name: string; price: number } }
  | { ok: false; error: string; status: number }
> {
  const order = await getOrderById(orderId)
  if (!order) {
    return { ok: false, error: 'Pedido não encontrado', status: 404 }
  }

  if (order.status === 'cancelado') {
    return {
      ok: false,
      error: 'Não é possível adicionar itens a um pedido cancelado',
      status: 400,
    }
  }

  const product = await getProductById(productId)
  if (!product) {
    return { ok: false, error: 'Produto não encontrado', status: 404 }
  }

  if (!product.is_active) {
    return { ok: false, error: 'Produto indisponível', status: 400 }
  }

  return {
    ok: true,
    product: { name: product.name, price: product.price },
  }
}
