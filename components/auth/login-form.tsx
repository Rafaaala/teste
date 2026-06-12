"use client"

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function LoginForm() {
  const router = useRouter()
  const [identifier, setIdentifier] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const value = identifier.trim()
    if (!value) return setError('Email ou telefone é obrigatório')
    setLoading(true)
    const isEmail = value.includes('@')
    const res = await signIn('credentials', {
      redirect: false,
      ...(isEmail ? { email: value } : { phone: value }),
    } as any)

    setLoading(false)
    if ((res as any)?.error) {
      setError((res as any).error || 'Falha ao entrar')
      return
    }

    // refresh server components / data
    try { router.refresh() } catch (e) { window.location.reload() }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <label className="block">
        <span className="text-sm text-muted-foreground">Telefone ou email</span>
        <input
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          placeholder="+55 11 91234-5678 ou email@ex.com"
          className="mt-1 w-full rounded-md border px-3 py-2"
        />
      </label>

      {error && <div className="text-sm text-destructive">{error}</div>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-primary px-4 py-2 text-white disabled:opacity-60"
      >
        {loading ? 'Entrando...' : 'Entrar'}
      </button>
    </form>
  )
}
