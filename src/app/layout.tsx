import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Footer from '@/components/Footer'
import FooterConditional from '@/components/FooterConditional'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FoodOrderApp - Online Food Delivery',
  description: 'Order your favorite food online',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen flex flex-col [&_*]:font-sans`}>
        <main className="flex-1">{children}</main>
        <FooterConditional />
      </body>
    </html>
  )
}