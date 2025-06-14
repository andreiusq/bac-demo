'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { motion } from 'framer-motion'
import { ThemeToggle } from '@/components/ThemeToggle'
import Preloader from '@/components/Preloader'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',  // << aici
            body: JSON.stringify({ email, password }),
          })
          

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Eroare la autentificare')
      }

      // Salvează token-ul în localStorage
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))

      // Redirecționează către dashboard
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'A apărut o eroare')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Preloader />
      <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-zinc-900 dark:to-zinc-950 px-4 relative">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <Card className="shadow-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900">
            <CardContent className="p-6">
              <h1 className="text-2xl font-semibold text-center mb-4 text-zinc-900 dark:text-white">
                🛡️ Bine ai venit!
              </h1>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="email" className="dark:text-zinc-200">Adresa de Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="exemplu@domeniu.ro" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                    disabled={loading}
                  />
                </div>

                <div>
                  <Label htmlFor="password" className="dark:text-zinc-200">Parola</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="Introduceți parola dvs." 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                    disabled={loading}
                  />
                </div>

                {error && (
                  <div className="text-red-600 dark:text-red-400 text-sm text-center bg-red-50 dark:bg-red-900/20 p-2 rounded">
                    {error}
                  </div>
                )}

                <div className="text-right text-sm">
                  <a href="#" className="text-blue-600 hover:underline dark:text-blue-400">
                    Recuperare parolă
                  </a>
                </div>

                <Button 
                  type="submit"
                  className="w-full mt-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors"
                  disabled={loading}
                >
                  {loading ? 'Se autentifică...' : 'Autentificare'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="mt-6 text-center text-sm px-4">
            <p className="text-red-600 dark:text-red-400 font-semibold">
              ⚠️ Aceasta este o platformă demonstrativă. Nu este asociată cu Ministerul Educației.
            </p>
          </div>

          <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-4">
            © 2025 Platformă demo pentru corectura examenelor.
          </p>
        </motion.div>
      </div>
    </>
  )
}