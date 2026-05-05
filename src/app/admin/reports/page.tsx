'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Logo from '@/components/Logo'
import { ArrowLeft, Printer, TrendingUp, DollarSign, Users, Utensils } from 'lucide-react'

interface TopItem {
  item_name: string
  total_qty: number
  total_revenue: number
}

interface BestCustomer {
  user_name: string
  phone: string | null
  total_orders: number
  total_spent: number
}

interface RecentOrder {
  id: number
  user_name: string | null
  phone: string | null
  total_price: number | null
  created_at: string
}

export default function ReportsPage() {
  const [stats, setStats] = useState({ total_orders: 0, total_revenue: 0, total_users: 0, total_items: 0 })
  const [topItems, setTopItems] = useState<TopItem[]>([])
  const [bestCustomers, setBestCustomers] = useState<BestCustomer[]>([])
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      if (profile?.role !== 'admin') { router.push('/dashboard'); return }

      const { count: orderCount } = await supabase.from('orders').select('*', { count: 'exact', head: true })
      const { data: revenueData } = await supabase.from('orders').select('total_price')
      const totalRevenue = revenueData?.reduce((sum, o) => sum + (o.total_price || 0), 0) || 0
      const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
      const { count: itemCount } = await supabase.from('menu_items').select('*', { count: 'exact', head: true })

      setStats({
        total_orders: orderCount || 0,
        total_revenue: totalRevenue,
        total_users: userCount || 0,
        total_items: itemCount || 0,
      })

      const { data: topData } = await supabase
        .from('order_items')
        .select('item_name, quantity, price')
      const itemMap: Record<string, { qty: number; rev: number }> = {}
      topData?.forEach((item) => {
        const name = item.item_name || 'Unknown'
        if (!itemMap[name]) itemMap[name] = { qty: 0, rev: 0 }
        itemMap[name].qty += item.quantity || 0
        itemMap[name].rev += (item.price || 0) * (item.quantity || 0)
      })
      const sortedTop = Object.entries(itemMap)
        .map(([item_name, v]) => ({ item_name, total_qty: v.qty, total_revenue: v.rev }))
        .sort((a, b) => b.total_qty - a.total_qty)
        .slice(0, 10)
      setTopItems(sortedTop)

      const { data: orderData } = await supabase.from('orders').select('user_name, phone, total_price')
      const custMap: Record<string, { phone: string; orders: number; spent: number }> = {}
      orderData?.forEach((o) => {
        const name = o.user_name || 'Guest'
        if (!custMap[name]) custMap[name] = { phone: o.phone || '-', orders: 0, spent: 0 }
        custMap[name].orders++
        custMap[name].spent += o.total_price || 0
      })
      const sortedCust = Object.entries(custMap)
        .map(([user_name, v]) => ({ user_name, phone: v.phone, total_orders: v.orders, total_spent: v.spent }))
        .sort((a, b) => b.total_spent - a.total_spent)
        .slice(0, 10)
      setBestCustomers(sortedCust)

      const { data: recent } = await supabase
        .from('orders')
        .select('id, user_name, phone, total_price, created_at')
        .order('created_at', { ascending: false })
        .limit(20)
      setRecentOrders(recent || [])
      setLoading(false)
    }
    init()
  }, [supabase, router])

  const exportCSV = (type: string) => {
    let csv = ''
    if (type === 'orders') {
      csv = 'Order ID,Customer Name,Phone,Total,Date\n'
      recentOrders.forEach(o => {
        csv += `#${o.id},${o.user_name || ''},${o.phone || ''},$${Number(o.total_price).toFixed(2)},${o.created_at ? new Date(o.created_at).toLocaleDateString() : ''}\n`
      })
    } else if (type === 'top_items') {
      csv = 'Item Name,Total Quantity Sold,Total Revenue\n'
      topItems.forEach(i => {
        csv += `${i.item_name},${i.total_qty},$${i.total_revenue.toFixed(2)}\n`
      })
    } else if (type === 'customers') {
      csv = 'Customer Name,Phone,Total Orders,Total Spent\n'
      bestCustomers.forEach(c => {
        csv += `${c.user_name},${c.phone},${c.total_orders},$${c.total_spent.toFixed(2)}\n`
      })
    }
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${type}_report_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
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
      <div className="no-print bg-white px-4 md:px-8 py-4 flex justify-between items-center shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Logo size={40} />
          <h1 className="text-orange-500 font-black text-xl">Reports</h1>
        </div>
        <div className="flex gap-3">
          <button onClick={() => window.print()}
            className="bg-gray-800 hover:bg-gray-900 text-white font-bold px-4 py-2 rounded-xl transition-all flex items-center gap-1">
            <Printer size={16} /> Save PDF
          </button>
          <Link href="/dashboard" className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2 rounded-xl transition-all flex items-center gap-1">
            <ArrowLeft size={16} /> Dashboard
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 md:p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-gray-800">Food Order App</h1>
          <p className="text-gray-500 mt-1">Report — Date on: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
          <hr className="mt-4 border-orange-500 border-2" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow p-6 text-center">
            <TrendingUp className="mx-auto text-orange-500 mb-2" size={32} />
            <p className="text-4xl font-black text-orange-500">{stats.total_orders}</p>
            <p className="text-gray-500 font-semibold mt-1">Total Orders</p>
          </div>
          <div className="bg-white rounded-2xl shadow p-6 text-center">
            <DollarSign className="mx-auto text-green-500 mb-2" size={32} />
            <p className="text-4xl font-black text-green-500">${stats.total_revenue.toFixed(2)}</p>
            <p className="text-gray-500 font-semibold mt-1">Total Revenue</p>
          </div>
          <div className="bg-white rounded-2xl shadow p-6 text-center">
            <Users className="mx-auto text-blue-500 mb-2" size={32} />
            <p className="text-4xl font-black text-blue-500">{stats.total_users}</p>
            <p className="text-gray-500 font-semibold mt-1">Total Users</p>
          </div>
          <div className="bg-white rounded-2xl shadow p-6 text-center">
            <Utensils className="mx-auto text-purple-500 mb-2" size={32} />
            <p className="text-4xl font-black text-purple-500">{stats.total_items}</p>
            <p className="text-gray-500 font-semibold mt-1">Menu Items</p>
          </div>
        </div>

        {/* Top Selling Items */}
        <div className="bg-white rounded-2xl shadow p-6 mb-8">
          <div className="flex justify-between items-center mb-4 no-print">
            <h2 className="text-2xl font-black text-gray-800">🏆 Top Selling Items</h2>
            <button onClick={() => exportCSV('top_items')}
              className="text-orange-500 font-semibold hover:underline text-sm">Export CSV</button>
          </div>
          <h2 className="text-2xl font-black text-gray-800 mb-4 hidden print:block">🏆 Top Selling Items</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-orange-500 text-white">
                <tr>
                  <th className="px-4 py-3 rounded-tl-xl">#</th>
                  <th className="px-4 py-3">Item Name</th>
                  <th className="px-4 py-3">Qty Sold</th>
                  <th className="px-4 py-3 rounded-tr-xl">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {topItems.length > 0 ? topItems.map((item, i) => (
                  <tr key={i} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 font-bold text-gray-500">{i + 1}</td>
                    <td className="px-4 py-3 font-semibold text-gray-800">{item.item_name}</td>
                    <td className="px-4 py-3 text-gray-600">{item.total_qty}</td>
                    <td className="px-4 py-3 font-black text-green-600">${item.total_revenue.toFixed(2)}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={4} className="px-4 py-6 text-center text-gray-400">No data yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Best Customers */}
        <div className="bg-white rounded-2xl shadow p-6 mb-8">
          <div className="flex justify-between items-center mb-4 no-print">
            <h2 className="text-2xl font-black text-gray-800">⭐ Best Customers</h2>
            <button onClick={() => exportCSV('customers')}
              className="text-orange-500 font-semibold hover:underline text-sm">Export CSV</button>
          </div>
          <h2 className="text-2xl font-black text-gray-800 mb-4 hidden print:block">⭐ Best Customers</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-orange-500 text-white">
                <tr>
                  <th className="px-4 py-3 rounded-tl-xl">#</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Total Orders</th>
                  <th className="px-4 py-3 rounded-tr-xl">Total Spent</th>
                </tr>
              </thead>
              <tbody>
                {bestCustomers.length > 0 ? bestCustomers.map((customer, i) => (
                  <tr key={i} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 font-bold text-gray-500">{i + 1}</td>
                    <td className="px-4 py-3 font-semibold text-gray-800">{customer.user_name}</td>
                    <td className="px-4 py-3 text-gray-600">{customer.phone}</td>
                    <td className="px-4 py-3 text-gray-600">{customer.total_orders}</td>
                    <td className="px-4 py-3 font-black text-green-600">${customer.total_spent.toFixed(2)}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-400">No data yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl shadow p-6 mb-8">
          <div className="flex justify-between items-center mb-4 no-print">
            <h2 className="text-2xl font-black text-gray-800">📦 Recent Orders</h2>
            <button onClick={() => exportCSV('orders')}
              className="text-orange-500 font-semibold hover:underline text-sm">Export CSV</button>
          </div>
          <h2 className="text-2xl font-black text-gray-800 mb-4 hidden print:block">📦 Recent Orders</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-orange-500 text-white">
                <tr>
                  <th className="px-4 py-3 rounded-tl-xl">Order ID</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3 text-center rounded-tr-xl">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length > 0 ? recentOrders.map((order) => (
                  <tr key={order.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 font-bold text-orange-500">#{order.id}</td>
                    <td className="px-4 py-3 font-semibold text-gray-800">{order.user_name || '-'}</td>
                    <td className="px-4 py-3 text-gray-600">{order.phone || '-'}</td>
                    <td className="px-4 py-3 font-black text-green-600">${Number(order.total_price).toFixed(2)}</td>
                    <td className="px-4 py-3 text-gray-500 text-sm text-center">
                      {order.created_at ? new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-400">No orders yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}