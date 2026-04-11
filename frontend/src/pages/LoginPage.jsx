import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { BookOpen, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [err, setErr]   = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault(); setErr(''); setLoading(true)
    try {
      await login(form.email, form.password)
      toast.success('Welcome back!'); navigate('/')
    } catch (e) { setErr(e.response?.data?.error || 'Login failed') }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-sand-50 dot-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm animate-slide-up">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex w-12 h-12 bg-ink-900 rounded-2xl items-center justify-center mb-4">
            <BookOpen size={20} className="text-sand-50" />
          </div>
          <h1 className="font-display text-2xl font-semibold text-ink-900">Sign in to Cartify</h1>
          <p className="text-sand-500 text-sm mt-1">Your decks are waiting.</p>
        </div>

        <div className="card">
          {err && (
            <div className="mb-4 px-3 py-2.5 bg-rose-light border border-rose/20 text-rose text-sm rounded-xl font-body">
              {err}
            </div>
          )}
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input type="email" required placeholder="you@example.com"
                className="input" value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div>
              <label className="label">Password</label>
              <input type="password" required placeholder="••••••••"
                className="input" value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full mt-1">
              {loading
                ? <span className="w-4 h-4 border-2 border-sand-300 border-t-sand-50 rounded-full animate-spin" />
                : <> Sign In <ArrowRight size={15} /> </>}
            </button>
          </form>
        </div>

        <p className="text-center text-sand-500 text-sm mt-5 font-body">
          No account?{' '}
          <Link to="/signup" className="text-ink-900 font-semibold hover:underline">Create one free</Link>
        </p>
      </div>
    </div>
  )
}
