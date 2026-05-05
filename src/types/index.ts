export interface MenuItem {
  id: number
  name: string
  photo: string | null
  description: string | null
  price: number
  stock: number
  category: string
  created_at: string
}

export interface CartItem extends MenuItem {
  quantity: number
}

export interface Order {
  id: number
  user_id: string | null
  user_name: string | null
  phone: string | null
  address: string | null
  total_price: number | null
  status: 'pending' | 'preparing' | 'delivered' | 'cancelled'
  created_at: string
}

export interface OrderItem {
  id: number
  order_id: number
  item_name: string | null
  price: number | null
  quantity: number | null
}

export interface UserProfile {
  id: string
  name: string | null
  email: string | null
  phone: string | null
  role: string
  created_at: string
}

export interface Favorite {
  id: number
  user_id: string
  menu_item_id: number
  created_at: string
}

export type Category = 'all' | 'khmer' | 'fastfood' | 'pasta' | 'korean' | 'dessert' | 'drink'

export const CATEGORIES: Record<Category, { label: string; icon: string }> = {
  all: { label: 'All', icon: '🍽️' },
  khmer: { label: 'Khmer Food', icon: '🍲' },
  fastfood: { label: 'Fast Food', icon: '🍔' },
  pasta: { label: 'Pasta', icon: '🍝' },
  korean: { label: 'Korean Food', icon: '🍜' },
  dessert: { label: 'Dessert', icon: '🍰' },
  drink: { label: 'Drinks', icon: '🥤' },
}