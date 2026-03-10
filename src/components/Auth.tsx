import { useState } from 'react'
import { supabase } from '../lib/supabase'

const ERROR_MESSAGES: Record<string, string> = {
  'Invalid login credentials': 'Email o contraseña incorrectos.',
  'Email not confirmed': 'Confirma tu email antes de iniciar sesión.',
  'User already registered': 'Este email ya está registrado. Usa "Entrar".',
  'Password should be at least 6 characters': 'La contraseña debe tener al menos 6 caracteres.',
  'Unable to validate email address: invalid format': 'Introduce un email válido.',
}

function translateError(msg: string): string {
  return ERROR_MESSAGES[msg] ?? msg
}

interface AuthProps {
  onAuth: () => void
}

export default function Auth({ onAuth }: AuthProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [useMagicLink, setUseMagicLink] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  if (!supabase) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 max-w-sm w-full text-center">
          <p className="text-zinc-400 text-sm mb-4">
            Supabase no está configurado. Crea un archivo .env con VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.
          </p>
          <button
            type="button"
            onClick={onAuth}
            className="w-full py-3 rounded-xl bg-emerald-500 text-zinc-950 font-bold hover:bg-emerald-400"
          >
            Continuar sin cuenta (solo local)
          </button>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supabase) return
    setError(null)
    setMessage(null)
    setLoading(true)
    try {
      if (useMagicLink) {
        const { error: err } = await supabase.auth.signInWithOtp({ email })
        if (err) throw err
        setMessage('Revisa tu email y haz clic en el enlace para entrar.')
      } else if (isSignUp) {
        const { error: err } = await supabase.auth.signUp({ email, password })
        if (err) throw err
        setMessage('Revisa tu email para confirmar la cuenta.')
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password })
        if (err) throw err
        onAuth()
      }
    } catch (err: unknown) {
      setError(translateError(err instanceof Error ? err.message : 'Error desconocido'))
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async () => {
    if (!email.trim()) {
      setError('Introduce tu email para restablecer la contraseña.')
      return
    }
    if (!supabase) return
    setError(null)
    setMessage(null)
    setLoading(true)
    try {
      const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/`,
      })
      if (err) throw err
      setMessage('Revisa tu email para restablecer la contraseña.')
    } catch (err: unknown) {
      setError(err instanceof Error ? translateError(err.message) : 'Error al enviar el email.')
    } finally {
      setLoading(false)
    }
  }

  const showPassword = !useMagicLink

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 max-w-sm w-full">
        <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 mb-2">
          PRIME TRACKER
        </h1>
        <p className="text-zinc-500 text-sm mb-6">Inicia sesión para sincronizar tu progreso</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            autoComplete="email"
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-zinc-100 placeholder:text-zinc-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none disabled:opacity-60"
          />
          {showPassword && (
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required={!useMagicLink && !isSignUp}
              minLength={6}
              disabled={loading}
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-zinc-100 placeholder:text-zinc-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none disabled:opacity-60"
            />
          )}
          {error && <p className="text-red-400 text-sm" role="alert">{error}</p>}
          {message && <p className="text-emerald-400 text-sm" role="status">{message}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-emerald-500 text-zinc-950 font-bold hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          >
            {loading
              ? 'Procesando...'
              : useMagicLink
                ? 'Enviar enlace'
                : isSignUp
                  ? 'Registrarse'
                  : 'Entrar'}
          </button>
        </form>

        {!useMagicLink && (
          <button
            type="button"
            onClick={handleResetPassword}
            disabled={loading}
            className="w-full mt-2 text-zinc-500 text-xs hover:text-zinc-400 disabled:opacity-50"
          >
            ¿Olvidaste tu contraseña?
          </button>
        )}

        <button
          type="button"
          onClick={() => { setUseMagicLink(!useMagicLink); setError(null); setMessage(null); }}
          className="w-full mt-2 text-zinc-500 text-sm hover:text-zinc-400"
        >
          {useMagicLink ? 'Usar email y contraseña' : 'Entrar con enlace al email (sin contraseña)'}
        </button>

        <button
          type="button"
          onClick={() => { setIsSignUp(!isSignUp); setUseMagicLink(false); setError(null); setMessage(null); }}
          className="w-full mt-2 text-zinc-500 text-sm hover:text-zinc-400"
        >
          {isSignUp ? '¿Ya tienes cuenta? Entrar' : '¿No tienes cuenta? Registrarse'}
        </button>

        {!isSignUp && (
          <button
            type="button"
            onClick={onAuth}
            className="w-full mt-2 text-zinc-600 text-xs hover:text-zinc-500"
          >
            Usar sin cuenta (solo en este dispositivo)
          </button>
        )}
      </div>
    </div>
  )
}
