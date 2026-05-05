'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError('Wrong email or password.')
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div 
      className="flex items-center justify-center relative min-h-screen w-full overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(rgba(57,57,57,0.4), rgba(40,40,40,0.4)), url('/images/Bgpicture.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute top-6 right-6">
        <img src="/images/Logo.jpg" alt="Logo" className="h-20 w-20 rounded-full border-2 border-white shadow-lg object-cover" />
      </div>

      <div className="bg-white/20 backdrop-blur-md p-10 rounded-3xl shadow-2xl w-full max-w-md border border-white/30 fade-in mx-4">
        <div className="text-center mb-10 fade-in-delay-1">
          <h1 className="text-4xl font-black text-white tracking-tight">WELCOME</h1>
          <p className="text-white/80 mt-2 font-medium">Login to order your favorite food online</p>
        </div>

        {error && (
          <div className="bg-red-500/80 text-white text-center py-3 px-4 rounded-xl mb-5 font-medium fade-in-delay-1">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-5 fade-in-delay-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-4 bg-white/90 border-none rounded-2xl focus:ring-4 focus:ring-orange-400 outline-none transition-all placeholder:text-gray-400 shadow-inner"
              placeholder="Email Address"
            />
          </div>

          <div className="mb-8 fade-in-delay-3">
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-4 bg-white/90 border-none rounded-2xl focus:ring-4 focus:ring-orange-400 outline-none transition-all placeholder:text-gray-400 shadow-inner"
              placeholder="Password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-2xl shadow-lg transform active:scale-95 transition-all text-lg fade-in-delay-4 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Login'}
          </button>
        </form>

        <div className="text-center mt-8 fade-in-delay-5">
          <Link href="/signup" className="text-white/90 hover:text-white font-semibold underline text-sm">
            Click here if you don't have an account.
          </Link>
        </div>
      </div>
    </div>
  )
}