import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { BookOpen, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SignupPage() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [err, setErr]   = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault(); setErr(''); setLoading(true)
    if (form.password.length < 6) { setErr('Password needs 6+ characters'); setLoading(false); return }
    try {
      await signup(form.name, form.email, form.password)
      toast.success('Account created — start studying!'); navigate('/')
    } catch (e) { setErr(e.response?.data?.error || 'Signup failed') }
    finally { setLoading(false) }
  }

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  return (
    <div className="min-h-screen bg-sand-50 dot-bg flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm animate-slide-up">
        <div className="text-center mb-8">
          <div className="inline-flex w-12 h-12 bg-ink-900 rounded-2xl items-center justify-center mb-4">
            <BookOpen size={20} className="text-sand-50" />
          </div>
          <h1 className="font-display text-2xl font-semibold text-ink-900">Create your account</h1>
          <p className="text-sand-500 text-sm mt-1">Start turning PDFs into practice.</p>
        </div>

        <div className="card">
          {err && (
            <div className="mb-4 px-3 py-2.5 bg-rose-light border border-rose/20 text-rose text-sm rounded-xl font-body">{err}</div>
          )}
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input type="text" required placeholder="Alex Johnson" className="input" value={form.name} onChange={set('name')} />
            </div>
            <div>
              <label className="label">Email</label>
              <input type="email" required placeholder="you@example.com" className="input" value={form.email} onChange={set('email')} />
            </div>
            <div>
              <label className="label">Password</label>
              <input type="password" required placeholder="Min. 6 characters" className="input" value={form.password} onChange={set('password')} />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full mt-1">
              {loading
                ? <span className="w-4 h-4 border-2 border-sand-300 border-t-sand-50 rounded-full animate-spin" />
                : <>Create Account <ArrowRight size={15} /></>}
            </button>
          </form>
        </div>

        <p className="text-center text-sand-500 text-sm mt-5 font-body">
          Already have an account?{' '}
          <Link to="/login" className="text-ink-900 font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
