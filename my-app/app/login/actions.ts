'use server'

export async function login(formData: { email: string; password: string }) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.message || 'Eroare autentificare')
  }

  return await res.json()
}
