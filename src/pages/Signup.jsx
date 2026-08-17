import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Radio, Mail, Lock, Building2, ArrowRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Signup() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [companyName, setCompanyName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (password.length < 6) {
      setError('Password kam az kam 6 characters ka hona chahiye.')
      return
    }
    setBusy(true)
    try {
      await signup(email, password, companyName)
      navigate('/')
    } catch (err) {
      setError(friendlyError(err.code))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex bg-ink">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center">
        <div className="circuit-track" style={{ left: '50%' }} />
        <div className="relative z-10 max-w-md px-10 text-white">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal/20 text-teal mb-8">
            <Radio size={22} />
          </div>
          <h1 className="font-display text-3xl font-semibold leading-tight">
            Apni company ka
            <br />
            account banayein.
          </h1>
          <p className="mt-4 text-white/50 text-sm leading-relaxed">
            Aap is company ke owner account honge. Baad mein "Create User" se apni team
            ke liye aur logins bana sakte hain — sab ka data same rahega.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center bg-paper px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-light text-teal-dark">
              <Radio size={18} />
            </div>
            <span className="font-display font-semibold text-ink">NetStock</span>
          </div>

          <h2 className="font-display text-2xl font-semibold text-ink">Create account</h2>
          <p className="text-sm text-slateink mt-1">Company sign up — pehla user owner hoga.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label className="text-xs font-medium text-slateink">Company Name</label>
              <div className="mt-1 relative">
                <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slateink" />
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Al-Noor Networks"
                  className="w-full rounded-lg border border-line bg-surface pl-9 pr-3 py-2.5 text-sm outline-none focus:border-teal"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-slateink">Email</label>
              <div className="mt-1 relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slateink" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full rounded-lg border border-line bg-surface pl-9 pr-3 py-2.5 text-sm outline-none focus:border-teal"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-slateink">Password</label>
              <div className="mt-1 relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slateink" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Kam az kam 6 characters"
                  className="w-full rounded-lg border border-line bg-surface pl-9 pr-3 py-2.5 text-sm outline-none focus:border-teal"
                />
              </div>
            </div>

            {error && (
              <p className="text-xs font-medium text-coral bg-coral-light rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-teal text-white text-sm font-medium py-2.5 hover:bg-teal-dark transition-colors disabled:opacity-60"
            >
              {busy ? 'Creating…' : 'Sign up'}
              {!busy && <ArrowRight size={16} />}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slateink">
            Pehle se account hai?{' '}
            <Link to="/login" className="text-teal-dark font-medium">
              Login karein
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

function friendlyError(code) {
  const map = {
    'auth/email-already-in-use': 'Ye email pehle se registered hai.',
    'auth/invalid-email': 'Email format sahi nahi hai.',
    'auth/weak-password': 'Password kamzor hai, mazeed characters add karein.'
  }
  return map[code] || 'Account nahi ban saka. Dobara koshish karein.'
}
