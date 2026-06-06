'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Logo from '@/components/Logo'
import { TrendingUp, DollarSign, Users, Utensils, Package, LogOut } from 'lucide-react'

interface RecentOrder {
  id: number
  user_name: string | null
  total_price: number | null
  created_at: string
}

interface TopItem {
  item_name: string
  total_qty: number
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({ orders: 0, revenue: 0, users: 0, items: 0 })
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [topItems, setTopItems] = useState<TopItem[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  // ── Logout handler ──
  const handleLogout = async () => {
    await supabase.auth.signOut()
    localStorage.removeItem('cart')
    router.push('/login')
    router.refresh()
  }

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (!profile || profile.role !== 'admin') {
        router.push('/dashboard')
        return
      }

      // Stats
      const { count: orderCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })

      const { data: revenueData } = await supabase.from('orders').select('total_price')
      const revenue = revenueData?.reduce((sum, o) => sum + (o.total_price || 0), 0) || 0

      const { count: userCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })

      const { count: itemCount } = await supabase
        .from('menu_items')
        .select('*', { count: 'exact', head: true })

      setStats({
        orders: orderCount || 0,
        revenue,
        users: userCount || 0,
        items: itemCount || 0,
      })

      // Recent 5 orders
      const { data: orders } = await supabase
        .from('orders')
        .select('id, user_name, total_price, created_at')
        .order('created_at', { ascending: false })
        .limit(5)
      setRecentOrders(orders || [])

      // Top 5 selling items
      const { data: items } = await supabase
        .from('order_items')
        .select('item_name, quantity')
      const itemMap: Record<string, number> = {}
      items?.forEach((item) => {
        const name = item.item_name || 'Unknown'
        itemMap[name] = (itemMap[name] || 0) + (item.quantity || 0)
      })
      const sorted = Object.entries(itemMap)
        .map(([item_name, total_qty]) => ({ item_name, total_qty }))
        .sort((a, b) => b.total_qty - a.total_qty)
        .slice(0, 5)
      setTopItems(sorted)

      setLoading(false)
    }

    checkAdmin()
  }, [supabase, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-orange-500 font-black">Loading...</div>
      </div>
    )
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Minimal Navbar with Logout */}
      <nav className="bg-white px-4 md:px-8 py-4 flex items-center justify-between shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Logo size={40} />
          <h1 className="text-orange-500 font-black text-xl">FoodOrderApp Admin</h1>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white font-bold px-4 py-2 rounded-xl transition-all flex items-center gap-2"
        >
          <LogOut size={18} /> Logout
        </button>
      </nav>

      <div className="max-w-6xl mx-auto p-4 md:p-8">
        <h1 className="text-3xl font-black text-gray-800 mb-8">Admin Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow p-6 text-center">
            <TrendingUp className="mx-auto text-orange-500 mb-2" size={32} />
            <p className="text-4xl font-black text-orange-500">{stats.orders}</p>
            <p className="text-gray-500 font-semibold mt-1">Total Orders</p>
          </div>
          <div className="bg-white rounded-2xl shadow p-6 text-center">
            <DollarSign className="mx-auto text-green-500 mb-2" size={32} />
            <p className="text-4xl font-black text-green-500">${stats.revenue.toFixed(2)}</p>
            <p className="text-gray-500 font-semibold mt-1">Total Revenue</p>
          </div>
          <div className="bg-white rounded-2xl shadow p-6 text-center">
            <Users className="mx-auto text-blue-500 mb-2" size={32} />
            <p className="text-4xl font-black text-blue-500">{stats.users}</p>
            <p className="text-gray-500 font-semibold mt-1">Total Users</p>
          </div>
          <div className="bg-white rounded-2xl shadow p-6 text-center">
            <Utensils className="mx-auto text-purple-500 mb-2" size={32} />
            <p className="text-4xl font-black text-purple-500">{stats.items}</p>
            <p className="text-gray-500 font-semibold mt-1">Menu Items</p>
          </div>
        </div>

        {/* Two-column data section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Recent Orders */}
          <div className="bg-white rounded-2xl shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-black text-gray-800">
                <Package className="inline mr-2" size={20} />
                Recent Orders
              </h2>
              <Link href="/admin/reports" className="text-orange-500 text-sm font-semibold hover:underline">
                View All →
              </Link>
            </div>
            {recentOrders.length > 0 ? (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex justify-between items-center border-b border-gray-100 pb-2">
                    <div>
                      <p className="font-semibold text-gray-800">#{order.id} – {order.user_name || 'Guest'}</p>
                      <p className="text-xs text-gray-400">
                        {order.created_at ? new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '-'}
                      </p>
                    </div>
                    <span className="font-black text-green-600">${Number(order.total_price).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-4">No orders yet.</p>
            )}
          </div>

          {/* Top Selling Items */}
          <div className="bg-white rounded-2xl shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-black text-gray-800">
                🏆 Top Items
              </h2>
              <Link href="/admin/reports" className="text-orange-500 text-sm font-semibold hover:underline">
                Full Report →
              </Link>
            </div>
            {topItems.length > 0 ? (
              <div className="space-y-3">
                {topItems.map((item, i) => (
                  <div key={item.item_name} className="flex justify-between items-center border-b border-gray-100 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-400 text-sm">#{i + 1}</span>
                      <span className="font-semibold text-gray-800">{item.item_name}</span>
                    </div>
                    <span className="font-bold text-gray-600">{item.total_qty} sold</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-4">No sales yet.</p>
            )}
          </div>
        </div>

        {/* Quick management links (smaller) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/admin/menu" className="bg-white hover:bg-orange-50 rounded-xl shadow p-4 text-center transition-all">
            <span className="text-xl">🍽️</span>
            <h3 className="font-bold text-gray-800 mt-1">Manage Menu</h3>
          </Link>
          <Link href="/admin/reports" className="bg-white hover:bg-orange-50 rounded-xl shadow p-4 text-center transition-all">
            <span className="text-xl">📊</span>
            <h3 className="font-bold text-gray-800 mt-1">Reports</h3>
          </Link>
          <Link href="/admin/users" className="bg-white hover:bg-orange-50 rounded-xl shadow p-4 text-center transition-all">
            <span className="text-xl">👥</span>
            <h3 className="font-bold text-gray-800 mt-1">Manage Users</h3>
          </Link>
        </div>
      </div>
    </div>
  )
}