// types/database.ts
// ENUMS

export type UserRole =
  | 'admin'
  | 'gerente'
  | 'garcom'
  | 'motoboy'

export type ItemStatus =
  | 'pendente'
  | 'em_preparo'
  | 'pronto'
  | 'cancelado'

// CATEGORY

export interface Category {
  id:          string
  name:        string
  description: string | null
  sort_order:  number
  is_active:   boolean
  created_at:  Date
  updated_at:  Date
  deleted_at:  Date | null
}

// ResponseDto
export interface CategoryPublic {
  id:          string
  name:        string
  description: string | null
  sort_order:  number
}

// CreateDto
export interface CreateCategoryInput {
  name:        string
  description?: string
  sort_order?: number
}

// UpdateDto
export interface UpdateCategoryInput {
  name?:        string
  description?: string
  sort_order?:  number
  is_active?:   boolean
}

// PRODUCT

export interface Product {
  id:          string
  category_id: string
  name:        string
  description: string | null
  price:       number
  image_url:   string | null
  sort_order:  number
  is_active:   boolean
  created_at:  Date
  updated_at:  Date
  deleted_at:  Date | null
}

// Produto com o nome da categoria embutido
export interface ProductWithCategory extends Product {
  category_name: string
}

// ResponseDto
export interface ProductPublic {
  id:            string
  category_id:   string
  category_name: string
  name:          string
  description:   string | null
  price:         number
  image_url:     string | null
  sort_order:    number
}

// CreateDto
export interface CreateProductInput {
  category_id:  string
  name:         string
  description?: string
  price:        number
  image_url?:   string
  sort_order?:  number
}

// UpdateDto
export interface UpdateProductInput {
  category_id?:  string
  name?:         string
  description?:  string
  price?:        number
  image_url?:    string
  sort_order?:   number
  is_active?:    boolean
}

// Cardápio agrupado por categoria
// ResponseDto
export interface MenuCategory extends CategoryPublic {
  products: ProductPublic[]
}

// CUSTOMER (tabela customers)

export interface Customer {
  id:         string
  name:       string
  phone:      string
  email:      string | null
  cpf:        string | null
  created_at: Date
  updated_at: Date
}

// CreateDto
export interface CreateCustomerInput {
  name:  string
  phone?: string
  email?: string
  cpf?:  string
}

// UpdateDto
export interface UpdateCustomerInput {
  name?:  string
  phone?: string
  email?: string
  cpf?:   string
}

// TABLE

export type TableStatus =
  | 'disponivel'
  | 'ocupada'
  | 'bloqueada'

export interface Table {
  id:         string
  number:     number
  capacity:   number
  status:     TableStatus
  is_active:  boolean
  created_at: Date
  updated_at: Date
  deleted_at: Date | null
}

// ResponseDto
export interface TablePublic {
  id:       string
  number:   number
  capacity: number
  status:   TableStatus
}

// CreateDto
export interface CreateTableInput {
  number:    number
  capacity:  number
  status?:   TableStatus
  is_active?: boolean
}

// UpdateDto
export interface UpdateTableInput {
  number?:    number
  capacity?:  number
  status?:    TableStatus
  is_active?: boolean
}

// ADDRESS

export interface Address {
  id:           string
  customer_id:  string
  zip_code:     string
  street:       string
  number:       string
  complement:   string | null
  neighborhood: string
  city:         string
  state:        string
  latitude:     number | null
  longitude:    number | null
  created_at:   Date          
  updated_at:   Date          
}

// CreateDto (customer_id informado no body ou via rota aninhada)
export interface CreateAddressInput {
  customer_id:  string
  zip_code:     string
  street:       string
  number:       string
  complement?:  string
  neighborhood: string
  city:         string
  state:        string
  latitude?:    number
  longitude?:   number
}

// UpdateDto
export interface UpdateAddressInput {
  customer_id?:  string
  zip_code?:     string
  street?:       string
  number?:       string
  complement?:   string
  neighborhood?: string
  city?:         string
  state?:        string
  latitude?:     number
  longitude?:    number
}

// ORDER

export type OrderStatus =
  | 'pendente'
  | 'confirmado'
  | 'em_preparo'
  | 'saindo'
  | 'entregue'
  | 'cancelado'

export type PaymentMethod =
  | 'pix'
  | 'cartao_credito'
  | 'cartao_debito'
  | 'dinheiro'

export type PaymentStatus =
  | 'pendente'
  | 'confirmado'
  | 'recusado'
  | 'expirado'

export interface Order {
  id:                   string
  customer_id:          string
  address_id:           string
  status:               OrderStatus
  subtotal:             number
  delivery_fee:         number
  total:                number
  notes:                string | null
  cancellation_reason:  string | null
  cancelled_by:         string | null
  confirmed_at:         Date | null
  preparing_at:         Date | null
  dispatched_at:        Date | null
  delivered_at:         Date | null
  cancelled_at:         Date | null
  created_at:           Date
  updated_at:           Date
}

// CreateDto
export interface CreateOrderInput {
  customer_id:   string
  address_id:    string
  subtotal:      number
  delivery_fee?: number
  notes?:        string
}

// UpdateDto
export interface UpdateOrderInput {
  customer_id?:          string
  address_id?:           string
  status?:               OrderStatus
  subtotal?:             number
  delivery_fee?:         number
  notes?:                string
  cancellation_reason?:  string
  cancelled_by?:         string
}

// PAYMENT

export interface Payment {
  id:               string
  order_id:         string
  method:           PaymentMethod
  amount:           number
  status:           PaymentStatus
  external_id:      string | null
  pix_qr_code:      string | null
  pix_qr_code_text: string | null
  pix_expires_at:   Date | null
  expires_at:       Date | null
  failure_reason:   string | null
  confirmed_at:     Date | null
  created_at:       Date
  updated_at:       Date
}

export interface CreatePaymentInput {
  order_id: string
  method: PaymentMethod
  amount: number
  status?: PaymentStatus
}

// ORDER ITEM

export interface OrderItem {
  id:             string
  order_id:       string
  product_id:     string
  product_name:   string
  product_price:  number
  quantity:       number
  notes:          string | null
  status:         ItemStatus
  cancelled_by:   string | null
  cancel_reason:  string | null
  created_at:     Date
  updated_at:     Date
}

// CreateDto (product_name e product_price preenchidos via snapshot do produto)
export interface CreateOrderItemInput {
  order_id:       string
  product_id:     string
  product_name:   string
  product_price:  number
  quantity:       number
  notes?:         string
}

// Body enviado pelo cliente na API
export interface CreateOrderItemBody {
  product_id:  string
  quantity:    number
  notes?:      string
}

// UpdateDto
export interface UpdateOrderItemInput {
  quantity?:       number
  notes?:          string
  status?:         ItemStatus
  cancel_reason?:  string
  cancelled_by?:   string
}

// SYSTEM CONFIG

export type ConfigValue =
  | string
  | number
  | boolean
  | null
  | ConfigValue[]
  | { [key: string]: ConfigValue }

export interface SystemConfig {
  key:         string
  value:       ConfigValue
  description: string | null
  updated_by:  string | null
  updated_at:  Date
}

// CreateDto
export interface CreateSystemConfigInput {
  key:         string
  value:       ConfigValue
  description?: string
  updated_by?:  string
}

// UpdateDto
export interface UpdateSystemConfigInput {
  value?:       ConfigValue
  description?: string
  updated_by?: string | null
}