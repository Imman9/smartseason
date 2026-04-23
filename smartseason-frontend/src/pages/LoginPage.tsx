import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login as loginApi } from '../api/endpoints'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await loginApi({ email, password })
      login(res.data.user, res.data.token)
      navigate(res.data.user.role === 'ADMIN' ? '/dashboard' : '/my-fields')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-8">
        <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1M4.22 4.22l.707.707m12.02 12.02.708.708M1 12h1m20 0h1M4.22 19.78l.707-.707M18.95 5.05l.708-.708M12 7a5 5 0 100 10A5 5 0 0012 7z" />
          </svg>
        </div>
        <span className="font-semibold text-gray-900">SmartSeason</span>
      </div>

      {/* Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm w-full max-w-sm p-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">Sign in</h1>
        <p className="text-sm text-gray-500 mb-6">Field monitoring dashboard</p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@smartseason.dev"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-2.5 rounded-lg text-sm transition-colors disabled:opacity-60"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          No account?{' '}
          <Link to="/register" className="text-gray-900 font-medium hover:underline">
            Create one
          </Link>
        </p>

        {/* Demo credentials */}
        <div className="mt-6 p-3 bg-gray-50 rounded-lg border border-gray-100">
          <p className="text-xs font-medium text-gray-600 mb-1">Demo credentials</p>
          <p className="text-xs text-gray-500">Admin: admin@smartseason.dev / admin123</p>
          <p className="text-xs text-gray-500">Agent: agent1@smartseason.dev / agent123</p>
        </div>
      </div>
    </div>
  )
}
