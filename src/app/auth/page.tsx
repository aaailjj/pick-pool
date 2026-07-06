// src/app/auth/page.tsx
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function AuthPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit() {
    setLoading(true)
    setMessage('')

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setMessage('Check your email to confirm your account.')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        router.push('/pool')
        router.refresh()
      }
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #1a0a2e 0%, #2d1b69 50%, #1a0a2e 100%)' }}>
      
      {/* Decorative pool rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {[1,2,3,4].map(i => (
          <div key={i} className="absolute rounded-full border border-purple-500/10"
            style={{
              width: `${i * 200}px`,
              height: `${i * 200}px`,
              opacity: 1 - i * 0.2,
            }} />
        ))}
      </div>

      {/* Floating sparkles */}
      {[...Array(12)].map((_, i) => (
        <div key={i}
          className="absolute w-1 h-1 rounded-full bg-purple-300/40"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `float ${2 + Math.random() * 2}s ease-in-out ${Math.random() * 2}s infinite`,
          }} />
      ))}

      <div className="relative z-10 w-full max-w-sm mx-4">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
            style={{ background: 'radial-gradient(circle, #7c3aed, #4c2a8a)' }}>
            <span className="text-2xl">💧</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Pick Pool</h1>
          <p className="text-purple-300/70 mt-1 text-sm">A beauty discovery space</p>
        </div>

        {/* Card */}
        <div className="glass rounded-2xl p-6">
          <div className="flex gap-2 mb-6 p-1 rounded-lg" style={{ background: 'rgba(26,10,46,0.6)' }}>
            {(['signin', 'signup'] as const).map(m => (
              <button key={m} onClick={() => setMode(m)}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                  mode === m
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'text-purple-300/60 hover:text-purple-200'
                }`}>
                {m === 'signin' ? 'Sign In' : 'Join Pool'}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-purple-300/70 uppercase tracking-widest mb-1.5 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl text-white placeholder-purple-300/30 text-sm outline-none focus:ring-1 focus:ring-purple-500/50"
                style={{ background: 'rgba(26,10,46,0.6)', border: '1px solid rgba(167,139,250,0.2)' }}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              />
            </div>

            <div>
              <label className="text-xs text-purple-300/70 uppercase tracking-widest mb-1.5 block">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl text-white placeholder-purple-300/30 text-sm outline-none focus:ring-1 focus:ring-purple-500/50"
                style={{ background: 'rgba(26,10,46,0.6)', border: '1px solid rgba(167,139,250,0.2)' }}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              />
            </div>
          </div>

          {message && (
            <p className={`mt-3 text-xs text-center ${
              message.includes('Check') ? 'text-emerald-400' : 'text-rose-400'
            }`}>{message}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading || !email || !password}
            className="mt-5 w-full py-3 rounded-xl font-semibold text-sm text-white transition-all disabled:opacity-40"
            style={{
              background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
              boxShadow: '0 4px 20px rgba(124, 58, 237, 0.4)',
            }}>
            {loading ? 'Entering...' : mode === 'signin' ? 'Enter Pool' : 'Create Account'}
          </button>
        </div>
      </div>
    </div>
  )
}
