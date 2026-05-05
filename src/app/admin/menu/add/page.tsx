'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Logo from '@/components/Logo'
import { ArrowLeft } from 'lucide-react'

export default function AddMenuPage() {
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [stock, setStock] = useState('10')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      if (profile?.role !== 'admin') router.push('/dashboard')
    }
    check()
  }, [supabase, router])

  // Handle file selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      // Create preview URL
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Upload image to Supabase Storage
  const uploadImage = async (file: File): Promise<string | null> => {
    const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`
    const { data, error } = await supabase.storage
      .from('menu-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      console.error('Upload error:', error)
      return null
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('menu-images')
      .getPublicUrl(data.path)

    return urlData.publicUrl
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!name || !price || !category) {
      setError('Please fill in all required fields.')
      return
    }

    setLoading(true)

    let photoUrl: string | null = null

    // Upload image if selected
    if (imageFile) {
      photoUrl = await uploadImage(imageFile)
      if (!photoUrl) {
        setError('Failed to upload image. Please try again.')
        setLoading(false)
        return
      }
    }

    // Insert into database
    const { error: insertError } = await supabase.from('menu_items').insert({
      name,
      category,
      description,
      price: Number(price),
      stock: Number(stock) || 10,
      photo: photoUrl,
    })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    setSuccess('Menu item added successfully!')
    // Reset form
    setName('')
    setCategory('')
    setDescription('')
    setPrice('')
    setStock('10')
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    setLoading(false)
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="max-w-2xl mx-auto p-4 md:p-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <Logo size={48} />
            <h1 className="text-3xl font-black text-gray-800">Add Menu Item</h1>
          </div>
          <Link href="/admin/menu" className="text-orange-500 font-semibold hover:underline flex items-center gap-1">
            <ArrowLeft size={16} /> Back to Manage Menu
          </Link>
        </div>

        {error && (
          <div className="bg-red-500/80 text-white text-center py-3 px-4 rounded-xl mb-5 font-medium">{error}</div>
        )}
        {success && (
          <div className="bg-green-500/80 text-white text-center py-3 px-4 rounded-xl mb-5 font-medium">{success}</div>
        )}

        <div className="bg-white rounded-2xl shadow p-8">
          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <label className="block text-gray-700 font-semibold mb-2">Food Name *</label>
              <input type="text" required value={name} onChange={e => setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-400 outline-none transition-all"
                placeholder="e.g. Fish Amok" />
            </div>

            <div className="mb-5">
              <label className="block text-gray-700 font-semibold mb-2">Category *</label>
              <select required value={category} onChange={e => setCategory(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-400 outline-none transition-all">
                <option value="">Select category</option>
                <option value="khmer">Khmer Food</option>
                <option value="fastfood">Fast Food</option>
                <option value="pasta">Pasta</option>
                <option value="korean">Korean Food</option>
                <option value="dessert">Dessert</option>
                <option value="drink">Drinks</option>
              </select>
            </div>

            <div className="mb-5">
              <label className="block text-gray-700 font-semibold mb-2">Description</label>
              <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-400 outline-none transition-all"
                placeholder="Short description of the food" />
            </div>

            <div className="mb-5">
              <label className="block text-gray-700 font-semibold mb-2">Price ($) *</label>
              <input type="number" step="0.01" min="0" required value={price} onChange={e => setPrice(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-400 outline-none transition-all"
                placeholder="e.g. 4.50" />
            </div>

            <div className="mb-5">
              <label className="block text-gray-700 font-semibold mb-2">Stock</label>
              <input type="number" min="0" required value={stock} onChange={e => setStock(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-400 outline-none transition-all"
                placeholder="e.g. 10" />
            </div>

            {/* Image Upload Section */}
            <div className="mb-8">
              <label className="block text-gray-700 font-semibold mb-2">Food Image</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
              />
              {imagePreview && (
                <div className="mt-4 flex justify-center">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-40 w-40 object-cover rounded-2xl shadow-md"
                  />
                </div>
              )}
              <p className="text-gray-400 text-sm mt-1">
                Leave empty to add image later
              </p>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-2xl shadow-lg transition-all text-lg disabled:opacity-50">
              {loading ? 'Adding...' : 'Add Menu Item'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}