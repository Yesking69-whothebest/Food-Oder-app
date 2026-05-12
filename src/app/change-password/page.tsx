'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Logo from '@/components/Logo'
import { ArrowLeft } from 'lucide-react'

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) router.push('/login')
    }
    check()
  }, [supabase, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Please fill in all fields.')
      return
    }
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.')
      return
    }

    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.email) {
      setError('User not found.')
      setLoading(false)
      return
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    })

    if (signInError) {
      setError('Current password is incorrect.')
      setLoading(false)
      return
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (updateError) {
      setError(updateError.message)
      setLoading(false)
      return
    }

    setSuccess('Password changed successfully!')
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setLoading(false)
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* ── MINIMAL NAVBAR ── */}
      <nav className="bg-white px-4 md:px-8 py-4 flex justify-between items-center shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <Logo size={40} />
          <h1 className="text-orange-500 font-black text-xl">FoodOrderApp</h1>
        </div>
        <Link
          href="/profile"
          className="bg-gray-800 text-white font-bold px-4 py-2 rounded-xl hover:bg-gray-900 transition-all flex items-center gap-1"
        >
          <ArrowLeft size={16} /> Back to Profile
        </Link>
      </nav>

      <div className="max-w-md mx-auto p-4 md:p-8">
        <h1 className="text-3xl font-black text-gray-800 mb-8">🔑 Change Password</h1>

        {success && (
          <div className="bg-green-500/80 text-white text-center py-3 px-4 rounded-xl mb-5 font-medium">
            {success}
            <Link href="/dashboard" className="underline font-bold ml-1">
              Go to Dashboard
            </Link>
          </div>
        )}
        {error && (
          <div className="bg-red-500/80 text-white text-center py-3 px-4 rounded-xl mb-5 font-medium">
            {error}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow p-8">
          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <label className="block text-gray-700 font-semibold mb-2">Current Password</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-400 outline-none transition-all"
                placeholder="Enter current password"
              />
            </div>
            <div className="mb-5">
              <label className="block text-gray-700 font-semibold mb-2">New Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-400 outline-none transition-all"
              />
            </div>
            <div className="mb-8">
              <label className="block text-gray-700 font-semibold mb-2">Confirm New Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-400 outline-none transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-2xl shadow-lg transition-all text-lg disabled:opacity-50"
            >
              {loading ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}