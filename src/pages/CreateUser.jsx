import { useEffect, useState } from 'react'
import { 
  createUserWithEmailAndPassword, 
  signOut,
  deleteUser,
  signInWithEmailAndPassword
} from 'firebase/auth'
import { ref, set, onValue, remove } from 'firebase/database'
import { UserPlus, Mail, Lock, Users2, Trash2, X } from 'lucide-react'
import { db, secondaryAuth } from '../firebase'
import { useAuth } from '../context/AuthContext'
import { formatDate } from '../utils/helpers'
import Loader from '../components/Loader'
import { Navigate } from 'react-router-dom'

export default function CreateUser() {
  const { companyId, company, profile, user } = useAuth()
  const [team, setTeam] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [busy, setBusy] = useState(false)

  // Delete user states
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteEmail, setDeleteEmail] = useState('')
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [deleteSuccess, setDeleteSuccess] = useState('')

  // Check if user is owner
  const isOwner = profile?.role === 'owner' || user?.role === 'owner'

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

  // If user is not owner, redirect to dashboard
  if (!isOwner) {
    return <Navigate to="/" replace />
  }

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

      setSuccess(`Naya login ban gaya: ${email}. Ye ab isi company ka data access kar sakta hai.`)
      setEmail('')
      setPassword('')
    } catch (err) {
      setError(friendlyError(err.code))
    } finally {
      setBusy(false)
    }
  }

  // ============================================================
  // DELETE USER - DIRECT DELETE WITHOUT PASSWORD
  // ============================================================

  async function handleDeleteUser() {
    setDeleteError('')
    setDeleteSuccess('')
    setDeleteBusy(true)

    try {
      // Step 1: Find user in team
      const userToDelete = team?.find(t => t.email === deleteEmail)
      
      if (!userToDelete) {
        setDeleteError('User not found in team')
        setDeleteBusy(false)
        return
      }

      if (userToDelete.role === 'owner') {
        setDeleteError('Cannot delete owner')
        setDeleteBusy(false)
        return
      }

      // Step 2: Delete from Realtime Database first
      await remove(ref(db, `companies/${companyId}/team/${userToDelete.id}`))
      await remove(ref(db, `users/${userToDelete.id}`))

      // Step 3: Delete from Firebase Authentication
      // We'll use the secondaryAuth to sign in and delete
      // But we don't have password, so we use admin SDK approach
      // Since we can't delete from frontend without password,
      // we'll use a different approach - mark as inactive
      
      // Actually, we CAN delete using secondary auth if we have the user's token
      // But since we don't have password, we'll use the Firebase Admin SDK approach
      
      // For now, we'll delete from database only
      // And the user will be removed from team
      
      setDeleteSuccess(`User ${deleteEmail} successfully removed from company`)
      
      // Close modal after 2 seconds
      setTimeout(() => {
        setShowDeleteModal(false)
        setDeleteEmail('')
        setDeleteSuccess('')
      }, 2000)

    } catch (err) {
      console.error('Delete error:', err)
      setDeleteError(err.message || 'Failed to delete user')
    } finally {
      setDeleteBusy(false)
    }
  }

  // Open delete modal
  function openDeleteModal(userEmail) {
    setDeleteEmail(userEmail)
    setDeleteError('')
    setDeleteSuccess('')
    setShowDeleteModal(true)
  }

  // Close delete modal
  function closeDeleteModal() {
    setShowDeleteModal(false)
    setDeleteEmail('')
    setDeleteError('')
    setDeleteSuccess('')
  }

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-2xl font-semibold text-ink">Create User</h1>
      <p className="text-sm text-slateink mt-0.5 mb-6">
        Create a new login for {company?.name} — the user can sign in and access the same company data.
      </p>

      {/* Create User Form */}
      <div className="bg-surface border border-line rounded-2xl shadow-card p-6 mb-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-xs font-medium text-slateink">Email</span>
              <div className="mt-1 relative">
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

      {/* Team List */}
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
              <div className="flex items-center gap-3">
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    t.role === 'owner' ? 'bg-teal-light text-teal-dark' : 'bg-ink/5 text-ink'
                  }`}
                >
                  {t.role}
                </span>
                
                {/* DELETE BUTTON - Only for staff */}
                {t.role !== 'owner' && (
                  <button
                    onClick={() => openDeleteModal(t.email)}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-coral hover:text-red-700 hover:underline transition-colors"
                    title="Remove user from company"
                  >
                    <Trash2 size={14} />
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ============================================================
          DELETE USER MODAL - DIRECT DELETE (NO PASSWORD)
          ============================================================ */}

      {showDeleteModal && (
        <div className="fixed inset-0 z-[99999] bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-ink flex items-center gap-2">
                <Trash2 size={20} className="text-coral" />
                Remove User
              </h3>
              <button
                onClick={closeDeleteModal}
                className="text-slateink hover:text-ink"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              
              <div className="bg-coral-light/30 border border-coral/30 rounded-lg p-3">
                <p className="text-sm text-coral">
                  <strong>Warning:</strong> This will permanently remove the user from:
                </p>
                <ul className="text-xs text-coral mt-1 space-y-0.5 list-disc list-inside">
                  <li>Company Team</li>
                  <li>Users Database</li>
                </ul>
                <p className="text-xs text-coral mt-1 font-semibold">
                  User will no longer be able to access this company!
                </p>
              </div>

              <div>
                <label className="text-xs font-medium text-slateink block">
                  User Email
                </label>
                <p className="text-sm font-medium text-ink mt-1">
                  {deleteEmail}
                </p>
              </div>

              {deleteError && (
                <p className="text-xs font-medium text-coral bg-coral-light rounded-lg px-3 py-2">
                  {deleteError}
                </p>
              )}
              {deleteSuccess && (
                <p className="text-xs font-medium text-teal-dark bg-teal-light rounded-lg px-3 py-2">
                  {deleteSuccess}
                </p>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={closeDeleteModal}
                  className="flex-1 rounded-lg border border-line text-ink text-sm font-medium py-2.5 hover:bg-paper transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteUser}
                  disabled={deleteBusy}
                  className="flex-1 rounded-lg bg-coral text-white text-sm font-medium py-2.5 hover:bg-red-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  <Trash2 size={16} />
                  {deleteBusy ? 'Removing...' : 'Remove User'}
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  )
}

function friendlyError(code) {
  const map = {
    'auth/email-already-in-use': 'This email is already registered.',
    'auth/invalid-email': 'Invalid email format.',
    'auth/weak-password': 'Password is too weak.',
    'auth/user-not-found': 'No user found with this email address.',
    'auth/too-many-requests': 'Too many requests. Please try again later.'
  }
  return map[code] || 'Failed to perform action. Please try again.'
}