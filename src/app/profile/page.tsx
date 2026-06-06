'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Logo from '@/components/Logo'
import { ArrowLeft, Camera } from 'lucide-react'

export default function ProfilePage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profile) {
        setName(profile.name || '')
        setEmail(profile.email || user.email || '')
        setPhone(profile.phone || '')
        setAvatarUrl(profile.avatar_url || null)
        setAvatarPreview(profile.avatar_url || null)
      } else {
        setName('')
        setEmail(user.email || '')
      }
      setInitialLoading(false)
    }
    init()
  }, [supabase, router])

  // Handle avatar file selection
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onloadend = () => setAvatarPreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  // Upload avatar to Supabase Storage (avatars bucket)
  const uploadAvatar = async (file: File): Promise<string | null> => {
    const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      console.error('Avatar upload error:', error)
      return null
    }

    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(data.path)

    return urlData.publicUrl
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Upload new avatar if selected
    let finalAvatarUrl = avatarUrl
    if (avatarFile) {
      const uploadedUrl = await uploadAvatar(avatarFile)
      if (uploadedUrl) {
        finalAvatarUrl = uploadedUrl
        setAvatarUrl(uploadedUrl)
        setAvatarPreview(uploadedUrl)
      } else {
        setError('Failed to upload avatar.')
        setLoading(false)
        return
      }
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        name,
        phone,
        email,
        avatar_url: finalAvatarUrl,
      })

    if (updateError) {
      setError(updateError.message)
      setLoading(false)
      return
    }

    setSuccess('Profile updated successfully!')
    setAvatarFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    setLoading(false)
  }

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-orange-500 font-black">Loading...</div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Minimal Navbar */}
      <nav className="bg-white px-4 md:px-8 py-4 flex justify-between items-center shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <Logo size={40} />
          <h1 className="text-orange-500 font-black text-xl">FoodOrderApp</h1>
        </div>
        <Link
          href="/dashboard"
          className="bg-gray-800 text-white font-bold px-4 py-2 rounded-xl hover:bg-gray-900 transition-all flex items-center gap-1"
        >
          <ArrowLeft size={16} /> Dashboard
        </Link>
      </nav>

      <div className="max-w-2xl mx-auto p-4 md:p-8">
        <h1 className="text-3xl font-black text-gray-800 mb-8">👤 My Profile</h1>

        {success && (
          <div className="bg-green-500/80 text-white text-center py-3 px-4 rounded-xl mb-5 font-medium">
            {success}
          </div>
        )}
        {error && (
          <div className="bg-red-500/80 text-white text-center py-3 px-4 rounded-xl mb-5 font-medium">
            {error}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow p-8">
          {/* Avatar Section */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Avatar"
                  className="w-24 h-24 rounded-full object-cover border-2 border-orange-500"
                />
              ) : (
                <div className="w-24 h-24 bg-orange-500 rounded-full flex items-center justify-center text-white text-4xl font-black">
                  {name ? name.charAt(0).toUpperCase() : '?'}
                </div>
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-orange-500 text-white p-1.5 rounded-full shadow hover:bg-orange-600 transition"
              >
                <Camera size={16} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
            <p className="text-gray-800 font-black text-xl mt-3">{name || 'User'}</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <label className="block text-gray-700 font-semibold mb-2">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-400 outline-none transition-all"
              />
            </div>
            <div className="mb-5">
              <label className="block text-gray-700 font-semibold mb-2">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-400 outline-none transition-all"
              />
            </div>
            <div className="mb-8">
              <label className="block text-gray-700 font-semibold mb-2">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-400 outline-none transition-all"
                placeholder="e.g. 012 345 678"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-2xl shadow-lg transition-all text-lg disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>

          <Link
            href="/change-password"
            className="block text-center mt-4 text-orange-500 font-semibold hover:underline"
          >
            🔑 Change Password
          </Link>
        </div>
      </div>
    </div>
  )
}