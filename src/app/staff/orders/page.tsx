'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Logo from '@/components/Logo'

export default function StaffOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      // Only staff and admin can access
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      if (profile?.role !== 'staff' && profile?.role !== 'admin') {
        router.push('/dashboard')
        return
      }

      // Fetch orders that need attention
      const { data } = await supabase
        .from('orders')
        .select('*')
        .in('status', ['pending', 'preparing'])
        .order('created_at', { ascending: true })

      setOrders(data || [])
      setLoading(false)
    }
    init()
  }, [supabase, router])

  const updateStatus = async (orderId: number, newStatus: string) => {
    await supabase.from('orders').update({ status: newStatus }).eq('id', orderId)
    setOrders(orders.filter(o => o.id !== orderId)) // remove from list after update
  }

  if (loading) return <div className="text-center mt-20">Loading...</div>

  return (
    <div className="bg-gray-100 min-h-screen">
      <nav className="bg-white px-4 py-4 flex items-center gap-3 shadow">
        <Logo size={40} />
        <h1 className="text-orange-500 font-black">Staff Orders</h1>
      </nav>
      <div className="max-w-2xl mx-auto p-4">
        <h2 className="text-2xl font-black mb-6">📋 Orders to Process</h2>
        {orders.length === 0 ? (
          <div className="text-gray-400 text-center mt-20">All caught up! 🎉</div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order.id} className="bg-white rounded-2xl shadow p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold text-lg">Order #{order.id}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleString()}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold uppercase 
                    ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}`}>
                    {order.status}
                  </span>
                </div>
                <div className="mt-2 text-sm">
                  <p><span className="font-semibold">Name:</span> {order.user_name}</p>
                  <p><span className="font-semibold">Phone:</span> {order.phone}</p>
                  <p><span className="font-semibold">Address:</span> {order.address}</p>
                  <p className="mt-1 font-bold text-orange-600">Total: ${Number(order.total_price).toFixed(2)}</p>
                </div>
                <div className="mt-4 flex gap-2">
                  {order.status === 'pending' && (
                    <button
                      onClick={() => updateStatus(order.id, 'preparing')}
                      className="bg-blue-500 text-white px-4 py-2 rounded-xl font-bold hover:bg-blue-600"
                    >
                      Start Preparing
                    </button>
                  )}
                  {order.status === 'preparing' && (
                    <button
                      onClick={() => updateStatus(order.id, 'delivered')}
                      className="bg-green-500 text-white px-4 py-2 rounded-xl font-bold hover:bg-green-600"
                    >
                      Mark as Delivered
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}