'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Logo from '@/components/Logo'
import { ArrowLeft } from 'lucide-react'

interface UserData {
  id: string
  name: string | null
  email: string | null
  role: string
  created_at: string
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserData[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setCurrentUser(user)

      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      if (profile?.role !== 'admin') { router.push('/dashboard'); return }

      const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
      setUsers(data || [])
      setLoading(false)
    }
    init()
  }, [supabase, router])

  const deleteUser = async (id: string) => {
    if (id === currentUser?.id) {
      setError('You cannot delete your own account!')
      return
    }
    if (!confirm('Delete this user?')) return

    await supabase.from('profiles').delete().eq('id', id)
    setUsers(users.filter(u => u.id !== id))
    setSuccess('User deleted successfully!')
    setTimeout(() => setSuccess(''), 3000)
  }

  const totalUsers = users.length
  const adminCount = users.filter(u => u.role === 'admin').length
  const userCount = users.filter(u => u.role === 'user').length
  const joinedToday = users.filter(u => {
    const d = new Date(u.created_at)
    const today = new Date()
    return d.toDateString() === today.toDateString()
  }).length

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-orange-500 font-black">Loading...</div>
      </div>
    )
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="bg-white px-4 md:px-8 py-4 flex justify-between items-center shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Logo size={40} />
          <h1 className="text-orange-500 font-black text-xl">Manage Users</h1>
        </div>
        <Link href="/dashboard" className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2 rounded-xl transition-all flex items-center gap-1">
          <ArrowLeft size={16} /> Dashboard
        </Link>
      </div>

      <div className="max-w-6xl mx-auto p-4 md:p-8">
        {success && (
          <div className="bg-green-500/80 text-white text-center py-3 px-4 rounded-xl mb-5 font-medium">{success}</div>
        )}
        {error && (
          <div className="bg-red-500/80 text-white text-center py-3 px-4 rounded-xl mb-5 font-medium">{error}</div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow p-6 text-center">
            <p className="text-4xl font-black text-orange-500">{totalUsers}</p>
            <p className="text-gray-500 font-semibold mt-1">Total Users</p>
          </div>
          <div className="bg-white rounded-2xl shadow p-6 text-center">
            <p className="text-4xl font-black text-blue-500">{adminCount}</p>
            <p className="text-gray-500 font-semibold mt-1">Admins</p>
          </div>
          <div className="bg-white rounded-2xl shadow p-6 text-center">
            <p className="text-4xl font-black text-green-500">{userCount}</p>
            <p className="text-gray-500 font-semibold mt-1">Regular Users</p>
          </div>
          <div className="bg-white rounded-2xl shadow p-6 text-center">
            <p className="text-4xl font-black text-purple-500">{joinedToday}</p>
            <p className="text-gray-500 font-semibold mt-1">Joined Today</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-xl font-black text-gray-800">All Users</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-orange-500 text-white">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Joined</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-t hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-500">#{user.id.slice(0, 8)}</td>
                    <td className="px-6 py-4 font-semibold text-gray-800">{user.name || '-'}</td>
                    <td className="px-6 py-4 text-gray-600">{user.email || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${user.role === 'admin' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                    </td>
                    <td className="px-6 py-4">
                      {user.id !== currentUser?.id ? (
                        <button onClick={() => deleteUser(user.id)}
                          className="bg-red-500 hover:bg-red-600 text-white font-bold px-4 py-2 rounded-xl transition-all text-sm">
                          Delete
                        </button>
                      ) : (
                        <span className="text-gray-300 text-sm">You</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}