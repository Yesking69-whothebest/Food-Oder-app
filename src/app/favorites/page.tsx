'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Logo from '@/components/Logo'
import { CATEGORIES, type MenuItem } from '@/types'
import { ArrowLeft } from 'lucide-react'

export default function FavoritesPage() {
  const [items, setItems] = useState<MenuItem[]>([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
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

      const { data } = await supabase
        .from('favorites')
        .select('menu_item_id, menu_items(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      const favItems = data?.map((f: any) => f.menu_items as MenuItem) || []
      setItems(favItems)
      setLoading(false)
    }
    init()
  }, [supabase, router])

  const toggleFavorite = async (itemId: number) => {
    if (!user) return
    await supabase.from('favorites').delete().eq('user_id', user.id).eq('menu_item_id', itemId)
    setItems(items.filter(item => item.id !== itemId))
  }

  const addToCart = (item: MenuItem) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '{}')
    if (cart[item.id]) {
      if (cart[item.id].quantity < item.stock) cart[item.id].quantity++
    } else {
      cart[item.id] = { ...item, quantity: 1 }
    }
    localStorage.setItem('cart', JSON.stringify(cart))
    window.dispatchEvent(new Event('storage'))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-orange-500 font-black">Loading...</div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* ── MINIMAL NAVBAR ── */}
      <nav className="bg-white px-4 md:px-8 py-4 flex justify-between items-center shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <Logo size={40} />
          <h1 className="text-orange-500 font-black text-xl">FoodOrder</h1>
        </div>
        <Link
          href="/dashboard"
          className="bg-gray-800 text-white font-bold px-4 py-2 rounded-xl hover:bg-gray-900 transition-all flex items-center gap-1"
        >
          <ArrowLeft size={16} /> Back to Menu
        </Link>
      </nav>

      <div className="bg-gradient-to-r from-orange-500 to-orange-400 text-white text-center py-14 px-8">
        <h2 className="text-4xl font-black mb-2">My Favorites</h2>
        <p className="text-white/80 text-lg">
          Quick access to menu items you <span className="font-bold">LOVE</span> the most
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 mt-8">
        {items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pb-10">
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl shadow hover:shadow-lg transition-all overflow-hidden flex flex-col">
                <div className="relative">
                  {item.photo ? (
                    <img
                      src={item.photo}
                      alt={item.name}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-orange-50 flex items-center justify-center text-5xl">
                      {CATEGORIES[item.category as keyof typeof CATEGORIES]?.icon || '🍽️'}
                    </div>
                  )}

                  <button
                    onClick={() => toggleFavorite(item.id)}
                    className="absolute top-3 right-3 text-2xl transition-opacity"
                  >
                    <span className="text-red-500">❤️</span>
                  </button>

                  {item.stock <= 3 && item.stock > 0 && (
                    <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      Only {item.stock} left!
                    </span>
                  )}
                  {item.stock === 0 && (
                    <span className="absolute top-3 left-3 bg-gray-800 text-white text-xs font-bold px-2 py-1 rounded-full">
                      Out of Stock
                    </span>
                  )}
                </div>

                <div className="p-4 flex flex-col flex-1">
                  <span className="text-xs font-bold text-orange-500 uppercase tracking-wide">
                    {CATEGORIES[item.category as keyof typeof CATEGORIES]?.label || item.category}
                  </span>
                  <h3 className="font-black text-gray-800 text-lg mt-1 line-clamp-2">{item.name}</h3>
                  <p className="text-gray-400 text-sm mt-1 line-clamp-2">{item.description}</p>

                  <div className="flex justify-between items-center mt-auto pt-3">
                    <span className="text-orange-500 font-black text-xl">
                      ${Number(item.price).toFixed(2)}
                    </span>
                    {item.stock > 0 ? (
                      <button
                        onClick={() => addToCart(item)}
                        className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2 rounded-xl transition-all text-sm"
                      >
                        + Add
                      </button>
                    ) : (
                      <span className="bg-gray-200 text-gray-400 font-bold px-4 py-2 rounded-xl text-sm cursor-not-allowed">
                        Out of Stock
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-400 mt-20 text-xl">You have no favorites yet.</div>
        )}
      </div>
    </div>
  )
}