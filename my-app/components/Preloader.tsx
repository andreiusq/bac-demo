'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import logo from '@/public/guvern.png'

export default function Preloader() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 1500)
    return () => clearTimeout(timeout)
  }, [])

  if (!loading) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-zinc-950 transition-colors">
      <Image src={logo} alt="Guvernul României" width={100} height={100} className="animate-pulse" />
    </div>
  )
}
