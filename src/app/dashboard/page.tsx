'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Navbar from '@/components/Navbar'
import { CATEGORIES, type MenuItem, type Category } from '@/types'

export default function DashboardPage() {
  const [items, setItems] = useState<MenuItem[]>([])
  const [favorites, setFavorites] = useState<number[]>([])
  const [user, setUser] = useState<any>(null)
  const [category, setCategory] = useState<Category>('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    const cat = searchParams.get('category') as Category
    const srch = searchParams.get('search')
    if (cat && CATEGORIES[cat]) setCategory(cat)
    if (srch) setSearch(srch)

    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)

      // Fetch menu items
      let query = supabase.from('menu_items').select('*')
      if (cat && cat !== 'all') query = query.eq('category', cat)
      if (srch) query = query.ilike('name', `%${srch}%`)
      const { data: menuData } = await query.order('created_at', { ascending: false })
      setItems(menuData || [])

      // Fetch favorites
      const { data: favData } = await supabase
        .from('favorites')
        .select('menu_item_id')
        .eq('user_id', user.id)
      setFavorites(favData?.map(f => f.menu_item_id) || [])
      setLoading(false)
    }
    init()
  }, [searchParams, supabase, router])

  const toggleFavorite = async (itemId: number) => {
    if (!user) return
    const isFav = favorites.includes(itemId)

    if (isFav) {
      await supabase.from('favorites').delete().eq('user_id', user.id).eq('menu_item_id', itemId)
      setFavorites(favorites.filter(id => id !== itemId))
    } else {
      await supabase.from('favorites').insert({ user_id: user.id, menu_item_id: itemId })
      setFavorites([...favorites, itemId])
    }
  }

  const addToCart = (item: MenuItem) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '{}')
    if (cart[item.id]) {
      if (cart[item.id].quantity < item.stock) {
        cart[item.id].quantity++
      }
    } else {
      cart[item.id] = { ...item, quantity: 1 }
    }
    localStorage.setItem('cart', JSON.stringify(cart))
    window.dispatchEvent(new Event('storage'))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-orange-500 font-black text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />

      <div className="bg-gradient-to-r from-orange-500 to-orange-400 text-white text-center py-14 px-8">
        <h2 className="text-4xl font-black mb-2">Order Your Favorite Food</h2>
        <p className="text-white/80 text-lg">Fresh and delicious meals delivered to your door</p>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 mt-8">
        {/* Category Filter */}
        <div className="flex gap-3 overflow-x-auto pb-4 mb-8 scrollbar-hide">
          {(Object.keys(CATEGORIES) as Category[]).map((key) => (
            <Link
              key={key}
              href={`/dashboard?category=${key}${search ? `&search=${search}` : ''}`}
              className={`flex-shrink-0 flex items-center gap-2 px-5 py-3 rounded-2xl font-bold transition-all whitespace-nowrap
                ${category === key ? 'bg-orange-500 text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-orange-50 shadow'}`}
            >
              {CATEGORIES[key].icon} {CATEGORIES[key].label}
            </Link>
          ))}
        </div>

        <p className="text-gray-400 text-sm mb-4">{items.length} items found</p>

        {items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pb-10">
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl shadow hover:shadow-lg transition-all overflow-hidden flex flex-col">
                <div className="relative">
                  {/* ********** FIXED IMAGE DISPLAY ********** */}
                  {item.photo ? (
                    <img
                      src={item.photo}
                      alt={item.name}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-orange-50 flex items-center justify-center text-5xl">
                      {CATEGORIES[item.category as Category]?.icon || '🍽️'}
                    </div>
                  )}

                  <button
                    onClick={() => toggleFavorite(item.id)}
                    className="absolute top-3 right-3 text-2xl transition-opacity"
                  >
                    {favorites.includes(item.id) ? (
                      <span className="text-red-500">❤️</span>
                    ) : (
                      <span className="text-gray-300">🤍</span>
                    )}
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
                    {CATEGORIES[item.category as Category]?.label || item.category}
                  </span>
                  <h3 className="font-black text-gray-800 text-lg mt-1 line-clamp-2">{item.name}</h3>
                  <p className="text-gray-400 text-sm mt-1 line-clamp-2">{item.description}</p>

                  <div className="flex justify-between items-center mt-auto pt-3">
                    <span className="text-orange-500 font-black text-xl">${Number(item.price).toFixed(2)}</span>
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
          <div className="text-center text-gray-400 mt-20 text-xl">No items found.</div>
        )}
      </div>
    </div>
  )
}