'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Logo from '@/components/Logo'
import { createClient } from '@/lib/supabase/client'
import { FaFacebook, FaInstagram, FaTwitter } from 'react-icons/fa'

export default function Footer() {
  const [isAdmin, setIsAdmin] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const checkRole = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role === 'admin') {
        setIsAdmin(true)
      }
    }

    checkRole()
  }, [supabase])

  return (
    <footer className="bg-gray-800 text-gray-300 mt-16">
      <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 sm:grid-cols-3 gap-8">
        {/* Brand column (unchanged) */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Logo size={36} />
            <span className="text-white font-black text-lg">FoodOrderApp</span>
          </div>
          <p className="text-sm text-gray-400 leading-relaxed">
            Fresh & delicious meals delivered to your doorstep. Order now and enjoy!
          </p>
        </div>

        {/* Quick Links – role‑aware */}
        <div>
          <h3 className="text-white font-semibold mb-3">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            {isAdmin ? (
              // Admin links
              <>
                <li><Link href="/admin/dashboard" className="hover:text-orange-400 transition">Admin Dashboard</Link></li>
                <li><Link href="/admin/menu" className="hover:text-orange-400 transition">Manage Menu</Link></li>
                <li><Link href="/admin/reports" className="hover:text-orange-400 transition">Reports</Link></li>
                <li><Link href="/admin/users" className="hover:text-orange-400 transition">Manage Users</Link></li>
              </>
            ) : (
              // Customer links (also visible to non‑logged‑in users)
              <>
                <li><Link href="/dashboard" className="hover:text-orange-400 transition">Menu</Link></li>
                <li><Link href="/orders" className="hover:text-orange-400 transition">My Orders</Link></li>
                <li><Link href="/cart" className="hover:text-orange-400 transition">Cart</Link></li>
                <li><Link href="/profile" className="hover:text-orange-400 transition">My Profile</Link></li>
                <li><Link href="/favorites" className="hover:text-orange-400 transition">Favorites</Link></li>
              </>
            )}
          </ul>
        </div>

        {/* Contact / Info (unchanged) */}
        <div>
          <h3 className="text-white font-semibold mb-3">Contact</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <span>📧</span> support@foodorderapp.com
            </li>
            <li className="flex items-center gap-2">
              <span>📞</span> +855 12 345 678
            </li>
            <li className="flex items-center gap-2">
              <span>📍</span> Phnom Penh, Cambodia
            </li>
          </ul>
          <div className="flex gap-3 mt-4">
            <a href="#" className="text-gray-400 hover:text-white transition">
              <FaFacebook size={20} />
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition">
              <FaInstagram size={20} />
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition">
              <FaTwitter size={20} />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-700 py-4 text-center text-xs text-gray-500">
        &copy; {new Date().getFullYear()} FoodOrderApp. All rights reserved.
      </div>
    </footer>
  )
}