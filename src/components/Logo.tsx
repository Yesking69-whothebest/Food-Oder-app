import Link from 'next/link'
import Image from 'next/image'

export default function Logo({ size = 40 }: { size?: number }) {
  return (
    <Link href="/dashboard">
      <Image 
        src="/images/Logo.jpg" 
        alt="FoodOrderApp Logo" 
        width={size} 
        height={size} 
        className="rounded-full hover:opacity-80 transition-all object-cover"
      />
    </Link>
  )
}