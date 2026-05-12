'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Logo from '@/components/Logo'
import { type Order, type OrderItem } from '@/types'
import { Package, Clock, ChefHat, CheckCircle, XCircle, ArrowLeft } from 'lucide-react'

// Status badges – pending removed
const statusConfig: Record<string, { class: string; icon: React.ReactNode; label: string }> = {
  preparing: { class: 'bg-blue-100 text-blue-700', icon: <ChefHat size={14} />, label: 'Preparing' },
  delivered: { class: 'bg-green-100 text-green-700', icon: <CheckCircle size={14} />, label: 'Delivered' },
  cancelled: { class: 'bg-red-100 text-red-700', icon: <XCircle size={14} />, label: 'Cancelled' },
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [orderItems, setOrderItems] = useState<Record<number, OrderItem[]>>({})
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

      const { data: ordersData } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      setOrders(ordersData || [])

      // Fetch items for each order
      const itemsMap: Record<number, OrderItem[]> = {}
      for (const order of ordersData || []) {
        const { data: items } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', order.id)
        itemsMap[order.id] = items || []
      }
      setOrderItems(itemsMap)
      setLoading(false)
    }
    init()
  }, [supabase, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-orange-500 font-black">Loading...</div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Minimal Navbar */}
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

      <div className="max-w-4xl mx-auto p-4 md:p-8">
        <h1 className="text-3xl font-black text-gray-800 mb-8">📦 Order History</h1>

        {orders.length > 0 ? (
          <div className="space-y-6">
            {orders.map((order) => {
              const items = orderItems[order.id] || []
              const status = statusConfig[order.status || 'pending']

              return (
                <div key={order.id} className="bg-white rounded-2xl shadow overflow-hidden">
                  <div className="bg-orange-500 px-6 py-4">
                    <p className="text-white font-black text-lg">Order #{order.id}</p>
                    <p className="text-white/80 text-sm">
                      {order.created_at
                        ? new Date(order.created_at).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '-'}
                    </p>
                  </div>
                  <div className="px-6 py-4">
                    <div className="space-y-2 mb-4">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className="flex justify-between items-center py-2 border-b border-gray-100"
                        >
                          <div>
                            <p className="font-semibold text-gray-800">{item.item_name}</p>
                            <p className="text-gray-400 text-sm">
                              x{item.quantity} × ${Number(item.price).toFixed(2)}
                            </p>
                          </div>
                          <p className="font-black text-gray-800">
                            ${((item.price || 0) * (item.quantity || 0)).toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4 mb-4">
                      <p className="text-gray-500 text-sm font-semibold mb-1">📍 Delivery Address</p>
                      <p className="text-gray-800 font-semibold">{order.user_name}</p>
                      <p className="text-gray-600 text-sm">{order.phone}</p>
                      <p className="text-gray-600 text-sm">{order.address}</p>
                    </div>

                    <div className="flex justify-between items-center">
                      {/* Only show badge if status exists in config (i.e., not pending) */}
                      {status ? (
                        <span
                          className={`${status.class} font-black px-4 py-1 rounded-full text-sm uppercase flex items-center gap-1`}
                        >
                          {status.icon} {status.label}
                        </span>
                      ) : (
                        <span /> /* empty placeholder to keep layout */
                      )}
                      <span className="font-black text-orange-500 text-xl">
                        ${Number(order.total_price).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center mt-20">
            <Package size={64} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-400 text-xl font-semibold">No orders yet.</p>
            <Link href="/dashboard" className="mt-4 inline-block text-orange-500 font-bold hover:underline">
              Order Now →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}