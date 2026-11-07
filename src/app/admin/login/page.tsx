'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Scissors, Crown, Lock, Eye, EyeOff, AlertCircle, Loader2, User, Shield } from 'lucide-react'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/admin'

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Credenciais inválidas')
        setIsLoading(false)
        return
      }

      // Success - redirect to admin panel
      router.push(redirect)
      router.refresh()
    } catch {
      setError('Erro de conexão. Tente novamente.')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-noir-1000 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-2xl font-display font-bold text-white mb-4">
            <Scissors className="w-8 h-8 text-gold-500" />
            <span>KingsStudio <span className="text-gold-400">2020</span></span>
          </Link>
          <Crown className="w-16 h-16 text-gold-500 mx-auto mb-4 opacity-50" />
          <h1 className="font-display text-3xl font-bold text-white mb-2">Painel Admin</h1>
          <p className="text-gold-400">Iniciar sessão</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="card-luxury p-8 space-y-6">
          <div>
            <label htmlFor="username" className="label-field flex items-center gap-2">
              <User className="w-5 h-5 text-gold-500" aria-hidden="true" />
              Utilizador
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input-field"
              placeholder="ex: admin, king, ricardo, miguel"
              autoComplete="username"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="password" className="label-field flex items-center gap-2">
              <Lock className="w-5 h-5 text-gold-500" aria-hidden="true" />
              Senha
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pr-12"
                placeholder="Digite a senha"
                autoComplete="current-password"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-noir-400 hover:text-gold-500 transition-colors"
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2" role="alert">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <button type="submit" className="btn-primary w-full py-3 text-lg" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" aria-hidden="true" />
                A entrar...
              </>
            ) : (
              <>
                <Lock className="w-5 h-5 mr-2" />
                Entrar no Painel
              </>
            )}
          </button>

          <div className="text-center pt-4 border-t border-noir-800 space-y-3">
            <p className="text-noir-400 text-sm">Credenciais de teste:</p>
            <div className="text-left space-y-1 text-xs font-mono bg-noir-800 p-3 rounded-lg">
              <div className="flex justify-between text-gold-400">
                <span><strong>Admin:</strong> admin / kings2020</span>
                <Shield className="w-3.5 h-3.5 text-gold-500" />
              </div>
              <div className="flex justify-between text-gold-400">
                <span><strong>King:</strong> king / king2020</span>
                <Crown className="w-3.5 h-3.5 text-gold-500" />
              </div>
              <div className="flex justify-between text-gold-400">
                <span><strong>Ricardo:</strong> ricardo / ricardo2020</span>
              </div>
              <div className="flex justify-between text-gold-400">
                <span><strong>Miguel:</strong> miguel / miguel2020</span>
              </div>
            </div>
            <p className="text-noir-500 text-xs">
              <strong>Nota:</strong> Em produção, altere as senhas nas variáveis de ambiente.
            </p>
            <Link href="/" className="text-gold-400 hover:text-gold-300 text-sm flex items-center justify-center gap-1 mt-2">
              <Scissors className="w-4 h-4" />
              Voltar ao site
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

import { Suspense } from 'react'

export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-noir-1000 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-gold-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gold-400">A carregar...</p>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}