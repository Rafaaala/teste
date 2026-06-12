import { getCustomerById } from '@/lib/database/queries/customer'
import { getAddressById } from '@/lib/database/queries/addresses'

export async function validateCustomerAndAddress(
  customerId: string,
  addressId: string
): Promise<{ ok: true } | { ok: false; error: string; status: number }> {
  const customer = await getCustomerById(customerId)
  if (!customer) {
    return { ok: false, error: 'Cliente não encontrado', status: 404 }
  }

  const address = await getAddressById(addressId)
  if (!address) {
    return { ok: false, error: 'Endereço não encontrado', status: 404 }
  }

  if (address.customer_id !== customerId) {
    return {
      ok: false,
      error: 'Endereço não pertence ao cliente',
      status: 400,
    }
  }

  return { ok: true }
}
