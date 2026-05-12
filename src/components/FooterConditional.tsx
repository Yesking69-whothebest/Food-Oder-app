'use client'

import { usePathname } from 'next/navigation'
import Footer from '@/components/Footer'

export default function FooterConditional() {
  const pathname = usePathname()

  // Hide footer on login, signup, and auth-related pages
  if (
    pathname === '/login' ||
    pathname === '/signup' ||
    pathname.startsWith('/auth')
  ) {
    return null
  }

  return <Footer />
}