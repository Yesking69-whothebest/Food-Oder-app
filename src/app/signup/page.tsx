'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!name || !email || !password) {
      setError('Please fill in all fields.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Invalid email format.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    setSuccess('Account created! You can now login.')
    setLoading(false)
  }

  return (
    <div 
      className="flex items-center justify-center min-h-screen bg-cover bg-center bg-no-repeat relative"
      style={{
        backgroundImage: `linear-gradient(rgba(57,57,57,0.4), rgba(40,40,40,0.4)), url('/images/Bgpicture.jpg')`,
      }}
    >
      <div className="absolute top-6 right-6">
        <img src="/images/Logo.jpg" alt="Logo" className="h-20 w-20 rounded-full border-2 border-white shadow-lg object-cover" />
      </div>

      <div className="bg-white/20 backdrop-blur-md p-10 rounded-3xl shadow-2xl w-full max-w-md border border-white/30 fade-in mx-4">
        <div className="text-center mb-8 fade-in-delay-1">
          <h1 className="text-4xl font-black text-white tracking-tight">CREATE ACCOUNT</h1>
          <p className="text-white/80 mt-2 font-medium">Join us and order your favorite food online</p>
        </div>

        {error && (
          <div className="bg-red-500/80 text-white text-center py-3 px-4 rounded-xl mb-5 font-medium fade-in-delay-1">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-500/80 text-white text-center py-3 px-4 rounded-xl mb-5 font-medium fade-in-delay-1">
            {success}
            <Link href="/login" className="underline font-bold ml-1">Login here</Link>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4 fade-in-delay-2">
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-5 py-4 bg-white/90 border-none rounded-2xl focus:ring-4 focus:ring-orange-400 outline-none transition-all placeholder:text-gray-400 shadow-inner"
              placeholder="Full Name"
            />
          </div>

          <div className="mb-4 fade-in-delay-3">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-4 bg-white/90 border-none rounded-2xl focus:ring-4 focus:ring-orange-400 outline-none transition-all placeholder:text-gray-400 shadow-inner"
              placeholder="Email Address"
            />
          </div>

          <div className="mb-4 fade-in-delay-4">
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-4 bg-white/90 border-none rounded-2xl focus:ring-4 focus:ring-orange-400 outline-none transition-all placeholder:text-gray-400 shadow-inner"
              placeholder="Password (6 characters up)"
            />
          </div>

          <div className="mb-8 fade-in-delay-5">
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-5 py-4 bg-white/90 border-none rounded-2xl focus:ring-4 focus:ring-orange-400 outline-none transition-all placeholder:text-gray-400 shadow-inner"
              placeholder="Confirm Password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-2xl shadow-lg transform active:scale-95 transition-all text-lg fade-in-delay-6 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Sign Up'}
          </button>
        </form>

        <div className="text-center mt-8 text-sm fade-in-delay-7">
          <span className="text-white/70">Already have an account?</span>
          <Link href="/login" className="text-white font-semibold ml-1 hover:underline">Login</Link>
        </div>
      </div>
    </div>
  )
}