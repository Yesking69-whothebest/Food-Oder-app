'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Logo from '@/components/Logo'
import { type MenuItem } from '@/types'
import { Pencil, Trash2, Plus } from 'lucide-react'

const categoryLabels: Record<string, string> = {
  khmer: 'KHMER FOOD',
  fastfood: 'FAST FOOD',
  pasta: 'PASTA',
  korean: 'KOREAN FOOD',
  dessert: 'DESSERT',
  drink: 'DRINKS',
}

export default function AdminMenuPage() {
  const [items, setItems] = useState<MenuItem[]>([])
  const [profile, setProfile] = useState<any>(null)
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

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileData?.role !== 'admin') {
        router.push('/dashboard')
        return
      }
      setProfile(profileData)

      const { data } = await supabase
        .from('menu_items')
        .select('*')
        .order('created_at', { ascending: false })
      setItems(data || [])
      setLoading(false)
    }
    init()
  }, [supabase, router])

  const deleteItem = async (id: number) => {
    if (!confirm('Are you sure?')) return
    await supabase.from('menu_items').delete().eq('id', id)
    setItems(items.filter(item => item.id !== id))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-orange-500 font-black">Loading...</div>
      </div>
    )
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <Logo size={48} />
            <h1 className="text-3xl font-black text-gray-800">Manage Menu Items</h1>
          </div>
          <div className="flex gap-3">
            <Link href="/admin/menu/add" className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-2xl transition-all flex items-center gap-2">
              <Plus size={18} /> Add New Item
            </Link>
          </div>
        </div>

        {items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl shadow overflow-hidden flex flex-col h-full">
                {item.photo ? (
  <img
    src={item.photo}
    alt={item.name}
    className="w-full h-48 object-cover"
  />
) : (
  <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-400">No Image</div>
)}

                <div className="p-4 flex flex-col flex-1">
                  <span className="text-xs bg-orange-100 text-orange-600 font-semibold px-2 py-1 rounded-full w-fit">
                    {categoryLabels[item.category] || item.category.toUpperCase()}
                  </span>
                  <h2 className="text-lg font-bold text-gray-800 mt-2 line-clamp-2">{item.name}</h2>
                  <p className="text-gray-500 text-sm mt-1 line-clamp-2">{item.description}</p>
                  <p className="text-gray-400 text-sm mt-1">Stock: {item.stock}</p>

                  <div className="mt-auto pt-4">
                    <p className="text-orange-500 font-black text-xl mb-3">${Number(item.price).toFixed(2)}</p>
                    <div className="flex gap-2">
                      <Link href={`/admin/menu/edit/${item.id}`}
                        className="flex-1 text-center bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 rounded-xl transition-all flex items-center justify-center gap-1">
                        <Pencil size={14} /> Edit
                      </Link>
                      <button onClick={() => deleteItem(item.id)}
                        className="flex-1 text-center bg-red-500 hover:bg-red-600 text-white font-bold py-2 rounded-xl transition-all flex items-center justify-center gap-1">
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-400 mt-20 text-xl">No menu items yet. Add one!</div>
        )}
      </div>
    </div>
  )
}