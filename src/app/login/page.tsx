'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ name, password }),
      headers: { 'Content-Type': 'application/json' }
    })

    const data = await res.json()
    if (!res.ok) {
      setError(data.error || 'Login failed')
      return
    }

    router.push('/')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row relative">

      {/* LEFT COLUMN - Marketing/Hero */}
      <div className="flex-1 z-10 flex flex-col justify-center px-8 sm:px-16 lg:px-24 py-12 lg:py-0 border-r border-[#d0d1e6] dark:border-[#464555]">
        <div className="max-w-xl">
          {/* Logo Section */}
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <svg className="w-5 h-5 text-[#1a1b2e] dark:text-[#dae2fd]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight text-[#1a1b2e] dark:text-[#dae2fd]">Incident Response System</span>
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#eef0fb] dark:bg-[#171f33] border border-[#d0d1e6] dark:border-[#464555] text-xs font-medium text-[#1a1b2e] dark:text-[#c7c4d8] mb-6 backdrop-blur-sm">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            Role-based incident management
          </div>

          {/* Headline */}
          <h1 className="text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight mb-6 text-[#1a1b2e] dark:text-[#dae2fd]">
            Resolve issues <br/>
            <span className="bg-gradient-to-r from-purple-400 via-fuchsia-400 to-pink-500 bg-clip-text text-transparent">
              before they escalate.
            </span>
          </h1>

          <p className="text-lg text-[#8b8ca8] dark:text-[#c7c4d8] dark:text-[#c7c4d8] mb-12 max-w-lg leading-relaxed">
            Report, triage, assign and resolve incidents across every department, with the right access for every role.
          </p>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-[#111218]/80 backdrop-blur-md border border-[#d0d1e6] dark:border-[#464555] rounded-xl p-5 shadow-lg">
              <div className="text-2xl font-bold text-[#1a1b2e] dark:text-[#dae2fd] mb-1">6</div>
              <div className="text-xs font-medium text-[#8b8ca8] dark:text-[#c7c4d8] uppercase tracking-wider">Departments</div>
            </div>
            <div className="bg-[#111218]/80 backdrop-blur-md border border-[#d0d1e6] dark:border-[#464555] rounded-xl p-5 shadow-lg">
              <div className="text-2xl font-bold text-[#1a1b2e] dark:text-[#dae2fd] mb-1">4</div>
              <div className="text-xs font-medium text-[#8b8ca8] dark:text-[#c7c4d8] uppercase tracking-wider">Access roles</div>
            </div>
            <div className="bg-[#111218]/80 backdrop-blur-md border border-[#d0d1e6] dark:border-[#464555] rounded-xl p-5 shadow-lg hidden md:block">
              <div className="text-2xl font-bold text-[#1a1b2e] dark:text-[#dae2fd] mb-1">24/7</div>
              <div className="text-xs font-medium text-[#8b8ca8] dark:text-[#c7c4d8] uppercase tracking-wider">Tracking</div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN - Login Form */}
      <div className="flex-1 z-10 flex flex-col justify-center px-8 sm:px-16 lg:px-24 py-12 lg:py-0 bg-[#08080C]/50 backdrop-blur-3xl">
        <div className="w-full max-w-md mx-auto">
          <div className="bg-white dark:bg-[#171f33] border border-[#d0d1e6] dark:border-[#464555] rounded-2xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
            {/* Top highlight glow */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
            
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-bold tracking-widest text-purple-400 uppercase bg-purple-500/10 mb-6">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Secure Sign-In
            </div>

            <h2 className="text-3xl font-bold text-[#1a1b2e] dark:text-[#dae2fd] mb-2">Welcome back</h2>
            <p className="text-[#8b8ca8] dark:text-[#c7c4d8] dark:text-[#c7c4d8] text-sm mb-8">Enter your credentials to access your dashboard.</p>
            
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg mb-6 text-sm flex items-start gap-2">
                <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-[#1a1b2e] dark:text-[#c7c4d8] mb-1.5">Full Name</label>
                <input 
                  type="text" 
                  required 
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full rounded-xl border border-gray-700 bg-[#eef0fb] dark:bg-[#131b2e] text-[#1a1b2e] dark:text-[#dae2fd] px-4 py-3 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors placeholder-[#8b8ca8]" 
                  placeholder="e.g. Hanniel Nyemitei"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1a1b2e] dark:text-[#c7c4d8] mb-1.5">Password</label>
                <input 
                  type="password" 
                  required 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-gray-700 bg-[#eef0fb] dark:bg-[#131b2e] text-[#1a1b2e] dark:text-[#dae2fd] px-4 py-3 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors placeholder-[#8b8ca8]" 
                  placeholder="••••••••••••"
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-white hover:bg-[#eef0fb] text-black font-semibold py-3.5 px-4 rounded-xl transition-colors mt-2"
              >
                Sign In
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
