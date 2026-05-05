'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Logo from '@/components/Logo'
import { ArrowLeft } from 'lucide-react'

interface CartItem {
  id: number
  name: string
  price: number
  photo: string | null
  quantity: number
}

export default function CheckoutPage() {
  const [cart, setCart] = useState<Record<number, CartItem>>({})
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
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

      const savedCart = JSON.parse(localStorage.getItem('cart') || '{}')
      if (Object.keys(savedCart).length === 0) {
        router.push('/dashboard')
        return
      }
      setCart(savedCart)

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      setProfile(profileData)

      // Auto-fill name and phone from profile
      if (profileData?.name) setName(profileData.name)
      if (profileData?.phone) setPhone(profileData.phone)
    }
    init()
  }, [supabase, router])

  const cartItems = Object.values(cart)
  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const totalQty = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  const bulkEligible = totalQty > 3
  const discountPercent = 0.15
  const discountAmount = bulkEligible ? Math.round(total * discountPercent * 100) / 100 : 0
  const finalTotal = Math.max(0, total - discountAmount)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name || !phone || !address) {
      setError('Please fill in all fields.')
      return
    }

    setLoading(true)

    // Insert order
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        user_name: name,
        phone,
        address,
        total_price: finalTotal,
        status: 'pending',
      })
      .select()
      .single()

    if (orderError || !orderData) {
      setError('Failed to place order. Please try again.')
      setLoading(false)
      return
    }

    // Insert order items and reduce stock
    for (const item of cartItems) {
      await supabase.from('order_items').insert({
        order_id: orderData.id,
        item_name: item.name,
        price: item.price,
        quantity: item.quantity,
      })

      // Reduce stock (make sure you have a reduce_stock RPC or handle it differently)
      await supabase.rpc('reduce_stock', {
        item_id: item.id,
        qty: item.quantity,
      })
    }

    // Clear cart and redirect
    localStorage.removeItem('cart')
    window.dispatchEvent(new Event('storage'))
    sessionStorage.setItem('last_order_id', String(orderData.id))
    if (bulkEligible) {
      sessionStorage.setItem('order_discount', String(discountAmount))
      sessionStorage.setItem('order_discount_percent', String(discountPercent * 100))
    }

    router.push('/order-success')
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* ── MINIMAL NAVBAR (same as cart) ── */}
      <nav className="bg-white px-4 md:px-8 py-4 flex justify-between items-center shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <Logo size={40} />
          <h1 className="text-orange-500 font-black text-xl">FoodOrder</h1>
        </div>
        <Link
          href="/cart"
          className="bg-gray-800 text-white font-bold px-4 py-2 rounded-xl hover:bg-gray-900 transition-all flex items-center gap-1"
        >
          <ArrowLeft size={16} /> Back to Cart
        </Link>
      </nav>

      <div className="max-w-4xl mx-auto p-4 md:p-8">
        <h1 className="text-3xl font-black text-gray-800 mb-8">Checkout</h1>

        {error && (
          <div className="bg-red-500/80 text-white text-center py-3 px-4 rounded-xl mb-5 font-medium">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-xl font-black text-gray-800 mb-6">Delivery Details</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-400 outline-none transition-all"
                  placeholder="Your full name"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">Phone Number</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-400 outline-none transition-all"
                  placeholder="e.g. 012 345 678"
                />
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-2">Delivery Address</label>
                <textarea
                  required
                  rows={3}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-400 outline-none transition-all"
                  placeholder="Street, City, Province"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-2xl shadow-lg transition-all text-lg disabled:opacity-50"
              >
                {loading ? 'Placing Order...' : 'Place Order →'}
              </button>
            </form>
          </div>

          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-xl font-black text-gray-800 mb-6">Order Summary</h2>
            <div className="space-y-3 mb-6">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-100">
                  <div>
                    <p className="font-semibold text-gray-800">{item.name}</p>
                    <p className="text-gray-400 text-sm">x{item.quantity}</p>
                  </div>
                  <p className="font-black text-gray-800">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-semibold">Total Items:</span>
              <span className="font-black text-gray-800">{totalQty}</span>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-semibold">Subtotal:</span>
                <span className="font-black text-gray-800">${total.toFixed(2)}</span>
              </div>
              {bulkEligible && (
                <>
                  <div className="flex justify-between items-center text-sm text-gray-600">
                    <span>Bulk Discount (15%):</span>
                    <span className="font-black text-green-600">- ${discountAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-semibold text-lg">Total Price:</span>
                    <span className="font-black text-orange-500 text-2xl">${finalTotal.toFixed(2)}</span>
                  </div>
                </>
              )}
              {!bulkEligible && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-semibold text-lg">Total Price:</span>
                  <span className="font-black text-orange-500 text-2xl">${total.toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}