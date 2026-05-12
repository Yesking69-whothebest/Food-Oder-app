'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Logo from '@/components/Logo'
import { Minus, Plus, X, ShoppingBag, ArrowLeft } from 'lucide-react'

interface CartItem {
  id: number
  name: string
  price: number
  photo: string | null
  quantity: number
  stock: number
}

export default function CartPage() {
  const [cart, setCart] = useState<Record<number, CartItem>>({})
  const [user, setUser] = useState<any>(null)
  const [stockError, setStockError] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)
      const saved = JSON.parse(localStorage.getItem('cart') || '{}')
      setCart(saved)
    }
    init()
  }, [supabase, router])

  const updateQuantity = async (id: number, action: 'increase' | 'decrease') => {
    const item = cart[id]
    if (!item) return

    if (action === 'increase') {
      if (item.quantity >= item.stock) {
        setStockError(true)
        setTimeout(() => setStockError(false), 3000)
        return
      }
      item.quantity++
    } else {
      item.quantity--
      if (item.quantity <= 0) {
        const newCart = { ...cart }
        delete newCart[id]
        localStorage.setItem('cart', JSON.stringify(newCart))
        setCart(newCart)
        window.dispatchEvent(new Event('storage'))
        return
      }
    }

    const newCart = { ...cart, [id]: item }
    localStorage.setItem('cart', JSON.stringify(newCart))
    setCart(newCart)
    window.dispatchEvent(new Event('storage'))
  }

  const removeItem = (id: number) => {
    const newCart = { ...cart }
    delete newCart[id]
    localStorage.setItem('cart', JSON.stringify(newCart))
    setCart(newCart)
    window.dispatchEvent(new Event('storage'))
  }

  const cartItems = Object.values(cart)
  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const totalQty = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="bg-gray-50 min-h-screen">
      <nav className="bg-white px-4 md:px-8 py-4 flex justify-between items-center shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <Logo size={40} />
          <h1 className="text-orange-500 font-black text-xl">FoodOrderApp</h1>
        </div>
        <Link
          href="/dashboard"
          className="bg-gray-800 text-white font-bold px-4 py-2 rounded-xl hover:bg-gray-900 transition-all flex items-center gap-1"
        >
          <ArrowLeft size={16} /> Back to Menu
        </Link>
      </nav>

      <div className="max-w-3xl mx-auto p-4 md:p-8">
        <h1 className="text-3xl font-black text-gray-800 mb-8">🛒 Your Cart</h1>

        {stockError && (
          <div className="bg-red-100 text-red-700 font-semibold px-5 py-3 rounded-xl mb-5 animate-pulse">
            You can't add more. Stock limit reached!
          </div>
        )}

        {cartItems.length > 0 ? (
          <>
            <div className="space-y-4 mb-8">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl shadow p-4 flex items-center gap-4 transition-all hover:shadow-md"
                >
                  {item.photo ? (
                    <img
                      src={item.photo}
                      alt={item.name}
                      className="h-20 w-20 object-cover rounded-xl flex-shrink-0"
                    />
                  ) : (
                    <div className="h-20 w-20 bg-orange-50 rounded-xl flex items-center justify-center text-3xl flex-shrink-0">
                      🍽️
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-gray-800 text-lg truncate">{item.name}</h3>
                    <p className="text-orange-500 font-bold">${Number(item.price).toFixed(2)}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateQuantity(item.id, 'decrease')}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-black w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="font-black text-gray-800 text-lg w-6 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, 'increase')}
                      className="bg-orange-500 hover:bg-orange-600 text-white font-black w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <div className="text-right w-20 hidden sm:block">
                    <p className="font-black text-gray-800">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-red-400 hover:text-red-600 font-bold text-xl transition-all active:scale-90"
                  >
                    <X size={18} />
                  </button>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl shadow p-6 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-semibold text-lg">Total Items:</span>
                <span className="font-black text-gray-800">{totalQty}</span>
              </div>
              <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                <span className="text-gray-800 font-black text-lg">Total Price:</span>
                <span className="font-black text-orange-500 text-2xl">${total.toFixed(2)}</span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="block w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-2xl shadow-lg transition-all text-lg text-center active:scale-[0.99]"
            >
              Proceed to Checkout →
            </Link>
          </>
        ) : (
          <div className="text-center mt-20">
            <ShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-400 text-xl font-semibold">Your cart is empty.</p>
            <Link href="/dashboard" className="mt-4 inline-block text-orange-500 font-bold hover:underline">
              Browse Menu →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}