'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { PartyPopper } from 'lucide-react'

export default function OrderSuccessPage() {
  const [orderId, setOrderId] = useState<string | null>(null)
  const [discount, setDiscount] = useState<number | null>(null)
  const [discountPercent, setDiscountPercent] = useState<number | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      const id = sessionStorage.getItem('last_order_id')
      if (!id) {
        router.push('/dashboard')
        return
      }
      setOrderId(id)
      const disc = sessionStorage.getItem('order_discount')
      const discPct = sessionStorage.getItem('order_discount_percent')
      if (disc) setDiscount(Number(disc))
      if (discPct) setDiscountPercent(Number(discPct))

      // Clear session storage
      sessionStorage.removeItem('last_order_id')
      sessionStorage.removeItem('order_discount')
      sessionStorage.removeItem('order_discount_percent')
    }
    init()
  }, [supabase, router])

  if (!orderId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-orange-500 font-black">Loading...</div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-md w-full text-center">
        <div className="text-7xl mb-6">🎉</div>
        <h1 className="text-3xl font-black text-gray-800 mb-2">Order Placed!</h1>
        <p className="text-gray-400 mb-2">Thank you for your order.</p>
        <p className="text-gray-500 font-semibold mb-8">
          Order ID: <span className="text-orange-500">#{orderId}</span>
        </p>

        {discount && discountPercent && (
          <div className="mb-4 bg-green-50 border border-green-100 rounded-xl p-4 text-green-700 font-semibold">
            🎉 You get discount {discountPercent}% = ${discount.toFixed(2)}
          </div>
        )}

        <div className="flex flex-col gap-3">
          <Link href="/orders" className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-2xl transition-all">
            View Order History
          </Link>
          <Link href="/dashboard" className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 rounded-2xl transition-all">
            Back to Menu
          </Link>
        </div>
      </div>
    </div>
  )
}