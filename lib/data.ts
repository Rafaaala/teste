export interface Product {
  id: number
  name: string
  description: string
  price: number
  image: string
  category: string
  isPromo?: boolean
  promoPrice?: number
}

export interface CartItem extends Product {
  quantity: number
}

export interface Category {
  id: string
  name: string
  icon: string
}

export const categories: Category[] = [
  { id: "sushi", name: "Sushi", icon: "🍣" },
  { id: "combos", name: "Combos", icon: "🍱" },
  { id: "temaki", name: "Temaki", icon: "🌯" },
  { id: "sashimi", name: "Sashimi", icon: "🐟" },
  { id: "hot", name: "Hot Roll", icon: "🔥" },
  { id: "bebidas", name: "Bebidas", icon: "🥤" },
]

export const products: Product[] = [
  {
    id: 1,
    name: "Combinado Niran 30 peças",
    description: "10 sushis, 10 uramakis, 5 sashimis e 5 hot rolls",
    price: 89.90,
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-tSqWFzwujh2uaZGNIl6rc8ER6VZhV0.png",
    category: "combos",
    isPromo: true,
    promoPrice: 79.90
  },
  {
    id: 2,
    name: "Sushi de Salmão (8 unid)",
    description: "Tradicional sushi de salmão fresco com arroz temperado",
    price: 32.90,
    image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400",
    category: "sushi",
  },
  {
    id: 3,
    name: "Temaki Salmão Completo",
    description: "Temaki de salmão com cream cheese, cebolinha e gergelim",
    price: 24.90,
    image: "https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=400",
    category: "temaki",
  },
  {
    id: 4,
    name: "Hot Roll Especial (8 unid)",
    description: "Uramaki empanado com salmão, cream cheese e molho tarê",
    price: 38.90,
    image: "https://images.unsplash.com/photo-1562802378-063ec186a863?w=400",
    category: "hot",
    isPromo: true,
    promoPrice: 32.90
  },
  {
    id: 5,
    name: "Sashimi de Salmão (10 fatias)",
    description: "Fatias frescas de salmão premium",
    price: 45.90,
    image: "https://images.unsplash.com/photo-1534482421-64566f976cfa?w=400",
    category: "sashimi",
  },
  {
    id: 6,
    name: "Combo Casal 40 peças",
    description: "15 sushis, 15 uramakis, 5 sashimis e 5 hot rolls",
    price: 129.90,
    image: "https://images.unsplash.com/photo-1553621042-f6e147245754?w=400",
    category: "combos",
    isPromo: true,
    promoPrice: 109.90
  },
  {
    id: 7,
    name: "Uramaki Philadelphia (8 unid)",
    description: "Uramaki com salmão, cream cheese e cebolinha",
    price: 36.90,
    image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400",
    category: "sushi",
  },
  {
    id: 8,
    name: "Temaki Atum Especial",
    description: "Temaki de atum com pepino, cebolinha e gergelim",
    price: 26.90,
    image: "https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=400",
    category: "temaki",
  },
  {
    id: 9,
    name: "Refrigerante Lata",
    description: "Coca-Cola, Guaraná ou Sprite 350ml",
    price: 6.90,
    image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400",
    category: "bebidas",
  },
  {
    id: 10,
    name: "Suco Natural 500ml",
    description: "Laranja, Limão ou Maracujá",
    price: 9.90,
    image: "https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?w=400",
    category: "bebidas",
  },
  {
    id: 11,
    name: "Combo Individual 20 peças",
    description: "5 sushis, 8 uramakis, 4 sashimis e 3 hot rolls",
    price: 59.90,
    image: "https://images.unsplash.com/photo-1583623025817-d180a2221d0a?w=400",
    category: "combos",
  },
  {
    id: 12,
    name: "Sushi de Atum (8 unid)",
    description: "Sushi tradicional de atum fresco premium",
    price: 34.90,
    image: "https://images.unsplash.com/photo-1617196035154-1e7e6e28b0db?w=400",
    category: "sushi",
  },
]
