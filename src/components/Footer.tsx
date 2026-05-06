import Link from 'next/link'
import Logo from '@/components/Logo'
import { FaFacebook, FaInstagram, FaTwitter } from 'react-icons/fa'

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-300 mt-16">
      <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 sm:grid-cols-3 gap-8">
        {/* Brand column */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Logo size={36} />
            <span className="text-white font-black text-lg">FoodOrder</span>
          </div>
          <p className="text-sm text-gray-400 leading-relaxed">
            Fresh & delicious meals delivered to your doorstep. Order now and enjoy!
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-white font-semibold mb-3">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/dashboard" className="hover:text-orange-400 transition">Menu</Link></li>
            <li><Link href="/orders" className="hover:text-orange-400 transition">My Orders</Link></li>
            <li><Link href="/cart" className="hover:text-orange-400 transition">Cart</Link></li>
            <li><Link href="/profile" className="hover:text-orange-400 transition">My Profile</Link></li>
            <li><Link href="/favorites" className="hover:text-orange-400 transition">Favorites</Link></li>
          </ul>
        </div>

        {/* Contact / Info */}
        <div>
          <h3 className="text-white font-semibold mb-3">Contact</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <span>📧</span> support@foodorder.com
            </li>
            <li className="flex items-center gap-2">
              <span>📞</span> +855 12 345 678
            </li>
            <li className="flex items-center gap-2">
              <span>📍</span> Phnom Penh, Cambodia
            </li>
          </ul>
          <div className="flex gap-3 mt-4">
            <a href="https://fhtgpfjzluvzkfioeria.supabase.co/storage/v1/object/public/menu-images/1778056053856_Gorilla.png" className="text-gray-400 hover:text-white transition">
              <FaFacebook size={20} />
            </a>
            <a href="https://fhtgpfjzluvzkfioeria.supabase.co/storage/v1/object/public/menu-images/1778056053856_Gorilla.png" className="text-gray-400 hover:text-white transition">
              <FaInstagram size={20} />
            </a>
            <a href="https://fhtgpfjzluvzkfioeria.supabase.co/storage/v1/object/public/menu-images/1778056053856_Gorilla.png" className="text-gray-400 hover:text-white transition">
              <FaTwitter size={20} />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-700 py-4 text-center text-xs text-gray-500">
        &copy; {new Date().getFullYear()} FoodOrder. All rights reserved.
      </div>
    </footer>
  )
}