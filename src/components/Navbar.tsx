'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Logo from '@/components/Logo'
import { Menu, X, ShoppingCart, Package, User, Heart, Lock, LogOut } from 'lucide-react'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [cartCount, setCartCount] = useState(0)
  const [favCount, setFavCount] = useState(0)
  const [isMobile, setIsMobile] = useState(true)
  const [mobileSearch, setMobileSearch] = useState('') // NEW – mobile search input value

  const router = useRouter()
  const supabase = createClient()

  // ── Detect screen size ──
  const handleResize = useCallback(() => {
    setIsMobile(window.innerWidth < 768)
  }, [])

  useEffect(() => {
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [handleResize])

  // ── Auth, profile, cart & favorites ──
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        setProfile(profileData)

        const cart = JSON.parse(localStorage.getItem('cart') || '{}')
        setCartCount(
          Object.values(cart).reduce((acc: number, item: any) => acc + item.quantity, 0)
        )

        const { count } = await supabase
          .from('favorites')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
        setFavCount(count || 0)
      }
    }
    getUser()

    const handleStorage = () => {
      const cart = JSON.parse(localStorage.getItem('cart') || '{}')
      setCartCount(
        Object.values(cart).reduce((acc: number, item: any) => acc + item.quantity, 0)
      )
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    localStorage.removeItem('cart')
    router.push('/login')
    router.refresh()
  }

  const closeMenu = () => setMenuOpen(false)

  // ── MOBILE SEARCH HANDLER ──
  const handleMobileSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (mobileSearch.trim()) {
      router.push(`/dashboard?search=${encodeURIComponent(mobileSearch)}`)
      setMobileSearch('')
      closeMenu()
    }
  }

  return (
    <nav className="bg-white px-4 md:px-8 py-4 flex justify-between items-center shadow-sm sticky top-0 z-50">
      {/* ── Logo ── */}
      <div className="flex items-center gap-2">
        <Logo size={40} />
        <h1 className="text-orange-500 font-black text-xl">FoodOrderApp</h1>
      </div>

      {/* ── DESKTOP: Search form (unchanged) ── */}
      <form method="GET" action="/dashboard" className="hidden md:flex items-center gap-2 w-1/3">
        <div className="flex w-full bg-gray-100 rounded-2xl px-4 py-2 items-center gap-2">
          <span className="text-gray-400">🔍</span>
          <input
            type="text"
            name="search"
            placeholder="Search food or drink..."
            className="bg-transparent outline-none w-full text-gray-700 placeholder:text-gray-400"
          />
        </div>
        <button type="submit" className="bg-orange-500 text-white px-5 py-2 rounded-2xl font-bold hover:bg-orange-600 transition-all">
          Search
        </button>
      </form>

      <div className="flex items-center gap-3">
        {/* ── DESKTOP: Cart & My Orders (hidden on mobile) ── */}
        <Link href="/cart" className="hidden md:flex relative bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-xl font-bold text-gray-800 transition-all items-center gap-2">
          <ShoppingCart size={18} />
          <span className="hidden lg:inline">Cart</span>
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-black w-5 h-5 rounded-full flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </Link>

        <Link href="/orders" className="hidden md:flex bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold px-4 py-2 rounded-xl transition-all items-center gap-2">
          <Package size={18} />
          <span className="hidden lg:inline">My Orders</span>
        </Link>

        {/* ── Hamburger button (always visible) ── */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold px-4 py-3 rounded-xl transition-all"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* ── Dropdown Menu (responsive) ── */}
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden max-h-[90vh] overflow-y-auto">
              {/* ── MOBILE ONLY: Search, Cart, Orders ── */}
                            {isMobile && (
                <>
                  <div className="px-5 pt-4 pb-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-100 rounded-2xl px-4 py-2 flex items-center gap-2">
                        <span className="text-gray-400">🔍</span>
                        <input
                          type="text"
                          value={mobileSearch}
                          onChange={(e) => setMobileSearch(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && mobileSearch.trim()) {
                              router.push(`/dashboard?search=${encodeURIComponent(mobileSearch)}`)
                              setMobileSearch('')
                              closeMenu()
                            }
                          }}
                          placeholder="Search food..."
                          className="bg-transparent outline-none w-full text-gray-700 placeholder:text-gray-400"
                        />
                      </div>
                      <Link
                        href={`/dashboard?search=${encodeURIComponent(mobileSearch)}`}
                        onClick={() => {
                          setMobileSearch('')
                          closeMenu()
                        }}
                        className={`bg-orange-500 text-white px-4 py-2 rounded-2xl font-bold text-sm hover:bg-orange-600 transition-all ${
                          !mobileSearch.trim() ? 'pointer-events-none opacity-50' : ''
                        }`}
                      >
                        Search
                      </Link>
                    </div>
                  </div>

                  <Link href="/cart" onClick={closeMenu} className="flex items-center gap-3 px-5 py-3 hover:bg-orange-50 text-gray-700 font-semibold transition-all relative">
                    <ShoppingCart size={18} />
                    Cart
                    {cartCount > 0 && (
                      <span className="ml-2 bg-red-500 text-white text-xs font-black w-5 h-5 rounded-full flex items-center justify-center">
                        {cartCount}
                      </span>
                    )}
                  </Link>

                  <Link href="/orders" onClick={closeMenu} className="flex items-center gap-3 px-5 py-3 hover:bg-orange-50 text-gray-700 font-semibold transition-all">
                    <Package size={18} />
                    My Orders
                  </Link>

                  <hr className="border-gray-100 my-1" />
                </>
              )}

              {/* Common menu items (both mobile & desktop) */}
              <Link href="/profile" onClick={closeMenu} className="flex items-center gap-3 px-5 py-3 hover:bg-orange-50 text-gray-700 font-semibold transition-all">
                <User size={18} /> My Profile
              </Link>
              <Link href="/change-password" onClick={closeMenu} className="flex items-center gap-3 px-5 py-3 hover:bg-orange-50 text-gray-700 font-semibold transition-all">
                <Lock size={18} /> Change Password
              </Link>
              <Link href="/favorites" onClick={closeMenu} className="flex items-center gap-3 px-5 py-3 hover:bg-orange-50 text-gray-700 font-semibold transition-all">
                <Heart size={18} /> Favorites
                {favCount > 0 && (
                  <span className="ml-auto bg-orange-100 text-orange-500 text-xs font-black px-2 py-1 rounded-full">{favCount}</span>
                )}
              </Link>

              {/* Admin links */}
              {profile?.role === 'admin' && (
                <>
                  <hr className="border-gray-100" />
                  <p className="px-5 py-2 text-xs text-gray-400 font-bold uppercase tracking-wide">Admin</p>
                  <Link href="/admin/menu" onClick={closeMenu} className="flex items-center gap-3 px-5 py-3 hover:bg-orange-50 text-gray-700 font-semibold transition-all">
                    🍽️ Manage Menu
                  </Link>
                  <Link href="/admin/reports" onClick={closeMenu} className="flex items-center gap-3 px-5 py-3 hover:bg-orange-50 text-gray-700 font-semibold transition-all">
                    📊 Reports
                  </Link>
                  <Link href="/admin/users" onClick={closeMenu} className="flex items-center gap-3 px-5 py-3 hover:bg-orange-50 text-gray-700 font-semibold transition-all">
                    👥 Manage Users
                  </Link>
                </>
              )}

              <hr className="border-gray-100" />
              <button
                onClick={() => { closeMenu(); handleLogout(); }}
                className="w-full flex items-center gap-3 px-5 py-3 hover:bg-red-50 text-red-500 font-semibold transition-all text-left"
              >
                <LogOut size={18} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}