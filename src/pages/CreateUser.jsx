import { useEffect, useState } from 'react'
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth'
import { ref, set, onValue } from 'firebase/database'
import { UserPlus, Mail, Lock, Users2 } from 'lucide-react'
import { db, secondaryAuth } from '../firebase'
import { useAuth } from '../context/AuthContext'
import { formatDate } from '../utils/helpers'
import Loader from '../components/Loader'

export default function CreateUser() {
  const { companyId, company } = useAuth()
  const [team, setTeam] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!companyId) return
    const unsub = onValue(
      ref(db, `companies/${companyId}/team`),
      (snap) => {
        const val = snap.val() || {}
        setTeam(
          Object.entries(val)
            .map(([id, t]) => ({ id, ...t }))
            .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
        )
      },
      (err) => {
        console.error('team read failed:', err)
        setTeam([])
      }
    )
    return () => unsub()
  }, [companyId])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (password.length < 6) {
      setError('Password kam az kam 6 characters ka hona chahiye.')
      return
    }
    setBusy(true)
    try {
      // Use a secondary, isolated Firebase Auth instance so this doesn't
      // sign the current admin out of their own session.
      const cred = await createUserWithEmailAndPassword(secondaryAuth, email, password)
      const newUid = cred.user.uid

      await set(ref(db, `users/${newUid}`), {
        email,
        companyId,
        role: 'staff',
        createdAt: Date.now()
      })
      await set(ref(db, `companies/${companyId}/team/${newUid}`), {
        email,
        role: 'staff',
        createdAt: Date.now()
      })

      await signOut(secondaryAuth)

      setSuccess(`Naya login ban gaya: ${email}. Ye ab isi company ka data access kar sakega.`)
      setEmail('')
      setPassword('')
    } catch (err) {
      setError(friendlyError(err.code))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-2xl font-semibold text-ink">Create User</h1>
      <p className="text-sm text-slateink mt-0.5 mb-6">
Create a new login for {company?.name} — the user can sign in and access the same company data.
      </p>

      <div className="bg-surface border border-line rounded-2xl shadow-card p-6 mb-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-xs font-medium text-slateink">Email</span>
              <div className="mt-1 relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slateink" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input pl-9"
                  placeholder="staff@company.com"
                />
              </div>
            </label>
            <label className="block">
              <span className="text-xs font-medium text-slateink">Password</span>
              <div className="mt-1 relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slateink" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pl-9"
                  placeholder="Kam az kam 6 characters"
                />
              </div>
            </label>
          </div>

          {error && (
            <p className="text-xs font-medium text-coral bg-coral-light rounded-lg px-3 py-2">{error}</p>
          )}
          {success && (
            <p className="text-xs font-medium text-teal-dark bg-teal-light rounded-lg px-3 py-2">
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="flex items-center gap-2 rounded-lg bg-ink text-white text-sm font-medium px-5 py-2.5 hover:bg-inkSoft transition-colors disabled:opacity-60"
          >
            <UserPlus size={16} />
            {busy ? 'Creating…' : 'Create Login'}
          </button>
        </form>
      </div>

      <h2 className="text-sm font-medium text-slateink mb-3 flex items-center gap-2">
        <Users2 size={15} /> Team Members
      </h2>
      {team === null ? (
        <Loader />
      ) : (
        <div className="bg-surface border border-line rounded-2xl shadow-card divide-y divide-line">
          {team.map((t) => (
            <div key={t.id} className="flex items-center justify-between px-5 py-3">
              <div>
                <p className="text-sm font-medium text-ink">{t.email}</p>
                <p className="text-xs text-slateink">Added {formatDate(t.createdAt)}</p>
              </div>
              <span
                className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                  t.role === 'owner' ? 'bg-teal-light text-teal-dark' : 'bg-ink/5 text-ink'
                }`}
              >
                {t.role}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function friendlyError(code) {
  const map = {
    'auth/email-already-in-use': 'Ye email pehle se registered hai.',
    'auth/invalid-email': 'Email format sahi nahi hai.',
    'auth/weak-password': 'Password kamzor hai.'
  }
  return map[code] || 'User create nahi ho saka. Dobara koshish karein.'
}
