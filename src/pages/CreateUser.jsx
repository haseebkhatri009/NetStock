// import { useEffect, useState } from 'react'
// import { 
//   createUserWithEmailAndPassword, 
//   signOut,
//   deleteUser,
//   signInWithEmailAndPassword
// } from 'firebase/auth'
// import { ref, set, onValue, remove } from 'firebase/database'
// import { UserPlus, Mail, Lock, Users2, Trash2, X } from 'lucide-react'
// import { db, secondaryAuth } from '../firebase'
// import { useAuth } from '../context/AuthContext'
// import { formatDate } from '../utils/helpers'
// import Loader from '../components/Loader'
// import { Navigate } from 'react-router-dom'

// export default function CreateUser() {
//   const { companyId, company, profile, user } = useAuth()
//   const [team, setTeam] = useState(null)
//   const [email, setEmail] = useState('')
//   const [password, setPassword] = useState('')
//   const [error, setError] = useState('')
//   const [success, setSuccess] = useState('')
//   const [busy, setBusy] = useState(false)

//   // Delete user states
//   const [showDeleteModal, setShowDeleteModal] = useState(false)
//   const [deleteEmail, setDeleteEmail] = useState('')
//   const [deleteBusy, setDeleteBusy] = useState(false)
//   const [deleteError, setDeleteError] = useState('')
//   const [deleteSuccess, setDeleteSuccess] = useState('')

//   // Check if user is owner
//   const isOwner = profile?.role === 'owner' || user?.role === 'owner'

//   useEffect(() => {
//     if (!companyId) return
//     const unsub = onValue(
//       ref(db, `companies/${companyId}/team`),
//       (snap) => {
//         const val = snap.val() || {}
//         setTeam(
//           Object.entries(val)
//             .map(([id, t]) => ({ id, ...t }))
//             .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
//         )
//       },
//       (err) => {
//         console.error('team read failed:', err)
//         setTeam([])
//       }
//     )
//     return () => unsub()
//   }, [companyId])

//   // If user is not owner, redirect to dashboard
//   if (!isOwner) {
//     return <Navigate to="/" replace />
//   }

//   async function handleSubmit(e) {
//     e.preventDefault()
//     setError('')
//     setSuccess('')
//     if (password.length < 6) {
//       setError('Password kam az kam 6 characters ka hona chahiye.')
//       return
//     }
//     setBusy(true)
//     try {
//       const cred = await createUserWithEmailAndPassword(secondaryAuth, email, password)
//       const newUid = cred.user.uid

//       await set(ref(db, `users/${newUid}`), {
//         email,
//         companyId,
//         role: 'staff',
//         createdAt: Date.now()
//       })
//       await set(ref(db, `companies/${companyId}/team/${newUid}`), {
//         email,
//         role: 'staff',
//         createdAt: Date.now()
//       })

//       await signOut(secondaryAuth)

//       setSuccess(`Naya login ban gaya: ${email}. Ye ab isi company ka data access kar sakta hai.`)
//       setEmail('')
//       setPassword('')
//     } catch (err) {
//       setError(friendlyError(err.code))
//     } finally {
//       setBusy(false)
//     }
//   }

//   // ============================================================
//   // DELETE USER - DIRECT DELETE WITHOUT PASSWORD
//   // ============================================================

//   async function handleDeleteUser() {
//     setDeleteError('')
//     setDeleteSuccess('')
//     setDeleteBusy(true)

//     try {
//       // Step 1: Find user in team
//       const userToDelete = team?.find(t => t.email === deleteEmail)
      
//       if (!userToDelete) {
//         setDeleteError('User not found in team')
//         setDeleteBusy(false)
//         return
//       }

//       if (userToDelete.role === 'owner') {
//         setDeleteError('Cannot delete owner')
//         setDeleteBusy(false)
//         return
//       }

//       // Step 2: Delete from Realtime Database first
//       await remove(ref(db, `companies/${companyId}/team/${userToDelete.id}`))
//       await remove(ref(db, `users/${userToDelete.id}`))


//       setDeleteSuccess(`User ${deleteEmail} successfully removed from company`)
      
//       // Close modal after 2 seconds
//       setTimeout(() => {
//         setShowDeleteModal(false)
//         setDeleteEmail('')
//         setDeleteSuccess('')
//       }, 2000)

//     } catch (err) {
//       console.error('Delete error:', err)
//       setDeleteError(err.message || 'Failed to delete user')
//     } finally {
//       setDeleteBusy(false)
//     }
//   }

//   // Open delete modal
//   function openDeleteModal(userEmail) {
//     setDeleteEmail(userEmail)
//     setDeleteError('')
//     setDeleteSuccess('')
//     setShowDeleteModal(true)
//   }

//   // Close delete modal
//   function closeDeleteModal() {
//     setShowDeleteModal(false)
//     setDeleteEmail('')
//     setDeleteError('')
//     setDeleteSuccess('')
//   }

//   return (
//     <div className="max-w-2xl">
//       <h1 className="font-display text-2xl font-semibold text-ink">Create User</h1>
//       <p className="text-sm text-slateink mt-0.5 mb-6">
//         Create a new login for {company?.name} — the user can sign in and access the same company data.
//       </p>

//       {/* Create User Form */}
//       <div className="bg-surface border border-line rounded-2xl shadow-card p-6 mb-8">
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div className="grid sm:grid-cols-2 gap-4">
//             <label className="block">
//               <span className="text-xs font-medium text-slateink">Email</span>
//               <div className="mt-1 relative">
//                 <input
//                   type="email"
//                   required
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   className="input pl-9"
//                   placeholder="staff@company.com"
//                 />
//               </div>
//             </label>
//             <label className="block">
//               <span className="text-xs font-medium text-slateink">Password</span>
//               <div className="mt-1 relative"> 
//                 <input
//                   type="password"
//                   required
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   className="input pl-9"
//                   placeholder="Kam az kam 6 characters"
//                 />
//               </div>
//             </label>
//           </div>

//           {error && (
//             <p className="text-xs font-medium text-coral bg-coral-light rounded-lg px-3 py-2">{error}</p>
//           )}
//           {success && (
//             <p className="text-xs font-medium text-teal-dark bg-teal-light rounded-lg px-3 py-2">
//               {success}
//             </p>
//           )}

//           <button
//             type="submit"
//             disabled={busy}
//             className="flex items-center gap-2 rounded-lg bg-ink text-white text-sm font-medium px-5 py-2.5 hover:bg-inkSoft transition-colors disabled:opacity-60"
//           >
//             <UserPlus size={16} />
//             {busy ? 'Creating…' : 'Create Login'}
//           </button>
//         </form>
//       </div>

//       {/* Team List */}
//       <h2 className="text-sm font-medium text-slateink mb-3 flex items-center gap-2">
//         <Users2 size={15} /> Team Members
//       </h2>

//       {team === null ? (
//         <Loader />
//       ) : (
//         <div className="bg-surface border border-line rounded-2xl shadow-card divide-y divide-line">
//           {team.map((t) => (
//             <div key={t.id} className="flex items-center justify-between px-5 py-3">
//               <div>
//                 <p className="text-sm font-medium text-ink">{t.email}</p>
//                 <p className="text-xs text-slateink">Added {formatDate(t.createdAt)}</p>
//               </div>
//               <div className="flex items-center gap-3">
//                 <span
//                   className={`text-xs font-medium px-2.5 py-1 rounded-full ${
//                     t.role === 'owner' ? 'bg-teal-light text-teal-dark' : 'bg-ink/5 text-ink'
//                   }`}
//                 >
//                   {t.role}
//                 </span>
                
//                 {/* DELETE BUTTON - Only for staff */}
//                 {t.role !== 'owner' && (
//                   <button
//                     onClick={() => openDeleteModal(t.email)}
//                     className="inline-flex items-center gap-1.5 text-xs font-medium text-coral hover:text-red-700 hover:underline transition-colors"
//                     title="Remove user from company"
//                   >
//                     <Trash2 size={14} />
//                     Remove
//                   </button>
//                 )}
//               </div>
//             </div>
//           ))}
//         </div>
//       )}

//       {/* ============================================================
//           DELETE USER MODAL - DIRECT DELETE (NO PASSWORD)
//           ============================================================ */}

//       {showDeleteModal && (
//         <div className="fixed inset-0 z-[99999] bg-black/60 flex items-center justify-center p-4">
//           <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            
//             <div className="flex items-center justify-between mb-4">
//               <h3 className="text-lg font-semibold text-ink flex items-center gap-2">
//                 <Trash2 size={20} className="text-coral" />
//                 Remove User
//               </h3>
//               <button
//                 onClick={closeDeleteModal}
//                 className="text-slateink hover:text-ink"
//               >
//                 <X size={20} />
//               </button>
//             </div>

//             <div className="space-y-4">
              
//               <div className="bg-coral-light/30 border border-coral/30 rounded-lg p-3">
//                 <p className="text-sm text-coral">
//                   <strong>Warning:</strong> This will permanently remove the user from:
//                 </p>
//                 <ul className="text-xs text-coral mt-1 space-y-0.5 list-disc list-inside">
//                   <li>Company Team</li>
//                   <li>Users Database</li>
//                 </ul>
//                 <p className="text-xs text-coral mt-1 font-semibold">
//                   User will no longer be able to access this company!
//                 </p>
//               </div>

//               <div>
//                 <label className="text-xs font-medium text-slateink block">
//                   User Email
//                 </label>
//                 <p className="text-sm font-medium text-ink mt-1">
//                   {deleteEmail}
//                 </p>
//               </div>

//               {deleteError && (
//                 <p className="text-xs font-medium text-coral bg-coral-light rounded-lg px-3 py-2">
//                   {deleteError}
//                 </p>
//               )}
//               {deleteSuccess && (
//                 <p className="text-xs font-medium text-teal-dark bg-teal-light rounded-lg px-3 py-2">
//                   {deleteSuccess}
//                 </p>
//               )}

//               <div className="flex gap-3">
//                 <button
//                   type="button"
//                   onClick={closeDeleteModal}
//                   className="flex-1 rounded-lg border border-line text-ink text-sm font-medium py-2.5 hover:bg-paper transition-colors"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="button"
//                   onClick={handleDeleteUser}
//                   disabled={deleteBusy}
//                   className="flex-1 rounded-lg bg-coral text-white text-sm font-medium py-2.5 hover:bg-red-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
//                 >
//                   <Trash2 size={16} />
//                   {deleteBusy ? 'Removing...' : 'Remove User'}
//                 </button>
//               </div>

//             </div>

//           </div>
//         </div>
//       )}

//     </div>
//   )
// }

// function friendlyError(code) {
//   const map = {
//     'auth/email-already-in-use': 'This email is already registered.',
//     'auth/invalid-email': 'Invalid email format.',
//     'auth/weak-password': 'Password is too weak.',
//     'auth/user-not-found': 'No user found with this email address.',
//     'auth/too-many-requests': 'Too many requests. Please try again later.'
//   }
//   return map[code] || 'Failed to perform action. Please try again.'
// }



//owner changed to super admin

// import { useEffect, useState } from 'react'
// import { 
//   createUserWithEmailAndPassword, 
//   signOut,
//   deleteUser,
//   signInWithEmailAndPassword
// } from 'firebase/auth'
// import { ref, set, onValue, remove } from 'firebase/database'
// import { UserPlus, Mail, Lock, Users2, Trash2, X } from 'lucide-react'
// import { db, secondaryAuth } from '../firebase'
// import { useAuth } from '../context/AuthContext'
// import { formatDate } from '../utils/helpers'
// import Loader from '../components/Loader'
// import { Navigate } from 'react-router-dom'

// export default function CreateUser() {
//   const { companyId, company, profile, user } = useAuth()
//   const [team, setTeam] = useState(null)
//   const [email, setEmail] = useState('')
//   const [password, setPassword] = useState('')
//   const [error, setError] = useState('')
//   const [success, setSuccess] = useState('')
//   const [busy, setBusy] = useState(false)

//   // Delete user states
//   const [showDeleteModal, setShowDeleteModal] = useState(false)
//   const [deleteEmail, setDeleteEmail] = useState('')
//   const [deleteBusy, setDeleteBusy] = useState(false)
//   const [deleteError, setDeleteError] = useState('')
//   const [deleteSuccess, setDeleteSuccess] = useState('')

//   // Check if user is owner
//   const isOwner = profile?.role === 'owner' || user?.role === 'owner'

//   useEffect(() => {
//     if (!companyId) return
//     const unsub = onValue(
//       ref(db, `companies/${companyId}/team`),
//       (snap) => {
//         const val = snap.val() || {}
//         setTeam(
//           Object.entries(val)
//             .map(([id, t]) => ({ id, ...t }))
//             .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
//         )
//       },
//       (err) => {
//         console.error('team read failed:', err)
//         setTeam([])
//       }
//     )
//     return () => unsub()
//   }, [companyId])

//   // If user is not owner, redirect to dashboard
//   if (!isOwner) {
//     return <Navigate to="/" replace />
//   }

//   async function handleSubmit(e) {
//     e.preventDefault()
//     setError('')
//     setSuccess('')
//     if (password.length < 6) {
//       setError('Password kam az kam 6 characters ka hona chahiye.')
//       return
//     }
//     setBusy(true)
//     try {
//       const cred = await createUserWithEmailAndPassword(secondaryAuth, email, password)
//       const newUid = cred.user.uid

//       await set(ref(db, `users/${newUid}`), {
//         email,
//         companyId,
//         role: 'staff',
//         createdAt: Date.now()
//       })
//       await set(ref(db, `companies/${companyId}/team/${newUid}`), {
//         email,
//         role: 'staff',
//         createdAt: Date.now()
//       })

//       await signOut(secondaryAuth)

//       setSuccess(`Naya login ban gaya: ${email}. Ye ab isi company ka data access kar sakta hai.`)
//       setEmail('')
//       setPassword('')
//     } catch (err) {
//       setError(friendlyError(err.code))
//     } finally {
//       setBusy(false)
//     }
//   }

//   // ============================================================
//   // DELETE USER - DIRECT DELETE WITHOUT PASSWORD
//   // ============================================================

//   async function handleDeleteUser() {
//     setDeleteError('')
//     setDeleteSuccess('')
//     setDeleteBusy(true)

//     try {
//       // Step 1: Find user in team
//       const userToDelete = team?.find(t => t.email === deleteEmail)
      
//       if (!userToDelete) {
//         setDeleteError('User not found in team')
//         setDeleteBusy(false)
//         return
//       }

//       if (userToDelete.role === 'owner') {
//         setDeleteError('Cannot delete owner')
//         setDeleteBusy(false)
//         return
//       }

//       // Step 2: Delete from Realtime Database first
//       await remove(ref(db, `companies/${companyId}/team/${userToDelete.id}`))
//       await remove(ref(db, `users/${userToDelete.id}`))


//       setDeleteSuccess(`User ${deleteEmail} successfully removed from company`)
      
//       // Close modal after 2 seconds
//       setTimeout(() => {
//         setShowDeleteModal(false)
//         setDeleteEmail('')
//         setDeleteSuccess('')
//       }, 2000)

//     } catch (err) {
//       console.error('Delete error:', err)
//       setDeleteError(err.message || 'Failed to delete user')
//     } finally {
//       setDeleteBusy(false)
//     }
//   }

//   // Open delete modal
//   function openDeleteModal(userEmail) {
//     setDeleteEmail(userEmail)
//     setDeleteError('')
//     setDeleteSuccess('')
//     setShowDeleteModal(true)
//   }

//   // Close delete modal
//   function closeDeleteModal() {
//     setShowDeleteModal(false)
//     setDeleteEmail('')
//     setDeleteError('')
//     setDeleteSuccess('')
//   }

//   // Display role label - show "Super Admin" instead of "owner"
//   function getRoleLabel(role) {
//     return role === 'owner' ? 'Super Admin' : role
//   }

//   return (
//     <div className="max-w-2xl">
//       <h1 className="font-display text-2xl font-semibold text-ink">Create User</h1>
//       <p className="text-sm text-slateink mt-0.5 mb-6">
//         Create a new login for {company?.name} — the user can sign in and access the same company data.
//       </p>

//       {/* Create User Form */}
//       <div className="bg-surface border border-line rounded-2xl shadow-card p-6 mb-8">
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div className="grid sm:grid-cols-2 gap-4">
//             <label className="block">
//               <span className="text-xs font-medium text-slateink">Email</span>
//               <div className="mt-1 relative">
//                 <input
//                   type="email"
//                   required
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   className="input pl-9"
//                   placeholder="staff@company.com"
//                 />
//               </div>
//             </label>
//             <label className="block">
//               <span className="text-xs font-medium text-slateink">Password</span>
//               <div className="mt-1 relative"> 
//                 <input
//                   type="password"
//                   required
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   className="input pl-9"
//                   placeholder="Kam az kam 6 characters"
//                 />
//               </div>
//             </label>
//           </div>

//           {error && (
//             <p className="text-xs font-medium text-coral bg-coral-light rounded-lg px-3 py-2">{error}</p>
//           )}
//           {success && (
//             <p className="text-xs font-medium text-teal-dark bg-teal-light rounded-lg px-3 py-2">
//               {success}
//             </p>
//           )}

//           <button
//             type="submit"
//             disabled={busy}
//             className="flex items-center gap-2 rounded-lg bg-ink text-white text-sm font-medium px-5 py-2.5 hover:bg-inkSoft transition-colors disabled:opacity-60"
//           >
//             <UserPlus size={16} />
//             {busy ? 'Creating…' : 'Create Login'}
//           </button>
//         </form>
//       </div>

//       {/* Team List */}
//       <h2 className="text-sm font-medium text-slateink mb-3 flex items-center gap-2">
//         <Users2 size={15} /> Team Members
//       </h2>

//       {team === null ? (
//         <Loader />
//       ) : (
//         <div className="bg-surface border border-line rounded-2xl shadow-card divide-y divide-line">
//           {team.map((t) => (
//             <div key={t.id} className="flex items-center justify-between px-5 py-3">
//               <div>
//                 <p className="text-sm font-medium text-ink">{t.email}</p>
//                 <p className="text-xs text-slateink">Added {formatDate(t.createdAt)}</p>
//               </div>
//               <div className="flex items-center gap-3">
//                 <span
//                   className={`text-xs font-medium px-2.5 py-1 rounded-full ${
//                     t.role === 'owner' ? 'bg-teal-light text-teal-dark' : 'bg-ink/5 text-ink'
//                   }`}
//                 >
//                   {getRoleLabel(t.role)}
//                 </span>
                
//                 {/* DELETE BUTTON - Only for staff */}
//                 {t.role !== 'owner' && (
//                   <button
//                     onClick={() => openDeleteModal(t.email)}
//                     className="inline-flex items-center gap-1.5 text-xs font-medium text-coral hover:text-red-700 hover:underline transition-colors"
//                     title="Remove user from company"
//                   >
//                     <Trash2 size={14} />
//                     Remove
//                   </button>
//                 )}
//               </div>
//             </div>
//           ))}
//         </div>
//       )}

//       {/* ============================================================
//           DELETE USER MODAL - DIRECT DELETE (NO PASSWORD)
//           ============================================================ */}

//       {showDeleteModal && (
//         <div className="fixed inset-0 z-[99999] bg-black/60 flex items-center justify-center p-4">
//           <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            
//             <div className="flex items-center justify-between mb-4">
//               <h3 className="text-lg font-semibold text-ink flex items-center gap-2">
//                 <Trash2 size={20} className="text-coral" />
//                 Remove User
//               </h3>
//               <button
//                 onClick={closeDeleteModal}
//                 className="text-slateink hover:text-ink"
//               >
//                 <X size={20} />
//               </button>
//             </div>

//             <div className="space-y-4">
              
//               <div className="bg-coral-light/30 border border-coral/30 rounded-lg p-3">
//                 <p className="text-sm text-coral">
//                   <strong>Warning:</strong> This will permanently remove the user from:
//                 </p>
//                 <ul className="text-xs text-coral mt-1 space-y-0.5 list-disc list-inside">
//                   <li>Company Team</li>
//                   <li>Users Database</li>
//                 </ul>
//                 <p className="text-xs text-coral mt-1 font-semibold">
//                   User will no longer be able to access this company!
//                 </p>
//               </div>

//               <div>
//                 <label className="text-xs font-medium text-slateink block">
//                   User Email
//                 </label>
//                 <p className="text-sm font-medium text-ink mt-1">
//                   {deleteEmail}
//                 </p>
//               </div>

//               {deleteError && (
//                 <p className="text-xs font-medium text-coral bg-coral-light rounded-lg px-3 py-2">
//                   {deleteError}
//                 </p>
//               )}
//               {deleteSuccess && (
//                 <p className="text-xs font-medium text-teal-dark bg-teal-light rounded-lg px-3 py-2">
//                   {deleteSuccess}
//                 </p>
//               )}

//               <div className="flex gap-3">
//                 <button
//                   type="button"
//                   onClick={closeDeleteModal}
//                   className="flex-1 rounded-lg border border-line text-ink text-sm font-medium py-2.5 hover:bg-paper transition-colors"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="button"
//                   onClick={handleDeleteUser}
//                   disabled={deleteBusy}
//                   className="flex-1 rounded-lg bg-coral text-white text-sm font-medium py-2.5 hover:bg-red-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
//                 >
//                   <Trash2 size={16} />
//                   {deleteBusy ? 'Removing...' : 'Remove User'}
//                 </button>
//               </div>

//             </div>

//           </div>
//         </div>
//       )}

//     </div>
//   )
// }

// function friendlyError(code) {
//   const map = {
//     'auth/email-already-in-use': 'This email is already registered.',
//     'auth/invalid-email': 'Invalid email format.',
//     'auth/weak-password': 'Password is too weak.',
//     'auth/user-not-found': 'No user found with this email address.',
//     'auth/too-many-requests': 'Too many requests. Please try again later.'
//   }
//   return map[code] || 'Failed to perform action. Please try again.'
// }













import { useEffect, useState } from 'react'
import { 
  createUserWithEmailAndPassword, 
  signOut,
  deleteUser,
  signInWithEmailAndPassword
} from 'firebase/auth'
import { ref, set, onValue, remove, update } from 'firebase/database'
import { UserPlus, Mail, Lock, Users2, Trash2, X, Upload, Building2, Save } from 'lucide-react'
import { db, secondaryAuth } from '../firebase'
import { useAuth } from '../context/AuthContext'
import { formatDate } from '../utils/helpers'
import Loader from '../components/Loader'
import { Navigate } from 'react-router-dom'

/* ============================================================
   IMGBB IMAGE UPLOAD HELPER
   ============================================================ */

const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_API_KEY

async function uploadImageToImgBB(file) {
  if (!IMGBB_API_KEY) {
    throw new Error('ImgBB API key missing. Check your .env.local file.')
  }

  if (!file) {
    throw new Error('No file provided')
  }

  if (!file.type.startsWith('image/')) {
    throw new Error('Please select a valid image file')
  }

  const MAX_SIZE = 5 * 1024 * 1024 // 5MB

  if (file.size > MAX_SIZE) {
    throw new Error('Image size must be less than 5MB')
  }

  const formData = new FormData()
  formData.append('image', file)

  const response = await fetch(
    `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
    {
      method: 'POST',
      body: formData
    }
  )

  if (!response.ok) {
    throw new Error(`ImgBB upload failed (${response.status})`)
  }

  const data = await response.json()

  if (!data.success || !data.data?.url) {
    throw new Error(
      data.error?.message || 'ImgBB did not return an image URL'
    )
  }

  return data.data.url
}

/* ============================================================
   MAIN COMPONENT
   ============================================================ */

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

  // ============================================================
  // COMPANY PROFILE STATES
  // ============================================================
  const [companyName, setCompanyName] = useState('')
  const [companyAddress, setCompanyAddress] = useState('')
  const [companyPhone, setCompanyPhone] = useState('')
  const [companyEmail, setCompanyEmail] = useState('')
  const [companyNTN, setCompanyNTN] = useState('')
  const [companySTRN, setCompanySTRN] = useState('')
  const [logoUrl, setLogoUrl] = useState('')

  const [logoFile, setLogoFile] = useState(null)
  const [logoPreview, setLogoPreview] = useState('')
  const [logoUploading, setLogoUploading] = useState(false)

  const [companySaving, setCompanySaving] = useState(false)
  const [companyError, setCompanyError] = useState('')
  const [companySuccess, setCompanySuccess] = useState('')

  // Check if user is owner
  const isOwner = profile?.role === 'owner' || user?.role === 'owner'

  // ============================================================
  // LOAD COMPANY DATA INTO FORM
  // ============================================================

  useEffect(() => {
    if (!company) return

    setCompanyName(company.name || '')
    setCompanyAddress(company.address || '')
    setCompanyPhone(company.phone || '')
    setCompanyEmail(company.email || '')
    setCompanyNTN(company.ntn || '')
    setCompanySTRN(company.strn || '')
    setLogoUrl(company.logoUrl || '')
    setLogoPreview(company.logoUrl || '')
  }, [company])

  // ============================================================
  // LOAD TEAM
  // ============================================================

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

  // ============================================================
  // LOGO HANDLERS
  // ============================================================

  function handleLogoChange(e) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setCompanyError('Please select an image file (PNG/JPG)')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setCompanyError('Image must be less than 5MB')
      return
    }

    setCompanyError('')
    setLogoFile(file)
    setLogoPreview(URL.createObjectURL(file))
  }

  function clearLogo() {
    setLogoFile(null)
    setLogoPreview('')
    setLogoUrl('')
  }

  // ============================================================
  // SAVE COMPANY PROFILE
  // ============================================================

  async function handleSaveCompany(e) {
    e.preventDefault()

    setCompanyError('')
    setCompanySuccess('')

    if (!companyName.trim()) {
      setCompanyError('Company name is required')
      return
    }

    setCompanySaving(true)

    try {
      let finalLogoUrl = logoUrl

      // Upload new logo if file selected
      if (logoFile) {
        try {
          setLogoUploading(true)
          finalLogoUrl = await uploadImageToImgBB(logoFile)
        } catch (err) {
          setCompanyError(err.message || 'Logo upload failed')
          setCompanySaving(false)
          setLogoUploading(false)
          return
        } finally {
          setLogoUploading(false)
        }
      }

      // Update company data in Firebase
      await update(
        ref(db, `companies/${companyId}`),
        {
          name: companyName.trim(),
          address: companyAddress.trim(),
          phone: companyPhone.trim(),
          email: companyEmail.trim(),
          ntn: companyNTN.trim(),
          strn: companySTRN.trim(),
          logoUrl: finalLogoUrl,
          updatedAt: Date.now()
        }
      )

      setLogoUrl(finalLogoUrl)
      setLogoPreview(finalLogoUrl)
      setLogoFile(null)

      setCompanySuccess('Company profile updated successfully!')
      setTimeout(() => setCompanySuccess(''), 3000)

    } catch (err) {
      console.error('Save company error:', err)
      setCompanyError(err.message || 'Failed to save company profile')
    } finally {
      setCompanySaving(false)
    }
  }

  // ============================================================
  // CREATE USER
  // ============================================================

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

  // Display role label - show "Super Admin" instead of "owner"
  function getRoleLabel(role) {
    return role === 'owner' ? 'Super Admin' : role
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="max-w-2xl">

      <h1 className="font-display text-2xl font-semibold text-ink">Create User</h1>
      <p className="text-sm text-slateink mt-0.5 mb-6">
        Create a new login for {company?.name} — the user can sign in and access the same company data.
      </p>

      {/* ============================================================
          COMPANY PROFILE SECTION
          ============================================================ */}

      <div className="bg-surface border border-line rounded-2xl shadow-card p-6 mb-8">
        <h2 className="text-sm font-medium text-ink mb-4 flex items-center gap-2">
          <Building2 size={16} />
          Company Profile
        </h2>
        <p className="text-xs text-slateink mb-4 -mt-2">
          Ye details Invoice aur Delivery Challan pe automatically use hongi.
        </p>

        <form onSubmit={handleSaveCompany} className="space-y-4">

          {/* LOGO UPLOAD */}

          <label className="block">
            <span className="text-xs font-medium text-slateink">
              Company Logo
            </span>

            <div className="mt-1 flex items-center gap-4">
              {/* Preview */}
              <div className="w-20 h-20 rounded-lg border border-line bg-paper flex items-center justify-center overflow-hidden shrink-0">
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <Upload size={20} className="text-slateink" />
                )}
              </div>

              {/* File input */}
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="hidden"
                  id="company-logo-upload"
                />

                <div className="flex items-center gap-2 flex-wrap">
                  <label
                    htmlFor="company-logo-upload"
                    className="inline-flex items-center gap-2 cursor-pointer rounded-lg border border-line bg-surface px-3 py-2 text-sm font-medium text-ink hover:bg-paper transition-colors"
                  >
                    <Upload size={14} />
                    {logoFile ? 'Change Logo' : 'Choose Logo'}
                  </label>

                  {(logoFile || logoUrl) && (
                    <button
                      type="button"
                      onClick={clearLogo}
                      className="text-xs text-coral hover:underline font-medium"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <p className="text-xs text-slateink mt-1">
                  PNG / JPG, max 5MB. Square logo recommended.
                </p>
              </div>
            </div>
          </label>

          {/* COMPANY NAME */}

          <label className="block">
            <span className="text-xs font-medium text-slateink">
              Company Name *
            </span>

            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="input mt-1"
              placeholder="Pearl Networks"
              required
            />
          </label>

          {/* ADDRESS */}

          <label className="block">
            <span className="text-xs font-medium text-slateink">
              Company Address
            </span>

            <textarea
              value={companyAddress}
              onChange={(e) => setCompanyAddress(e.target.value)}
              rows={3}
              className="input mt-1"
              placeholder="Street, area, city, postal code"
            />
          </label>

          {/* PHONE + EMAIL */}

          <div className="grid sm:grid-cols-2 gap-4">

            <label className="block">
              <span className="text-xs font-medium text-slateink">
                Company Phone
              </span>

              <input
                type="text"
                value={companyPhone}
                onChange={(e) => setCompanyPhone(e.target.value)}
                className="input mt-1"
                placeholder="0341-1293604"
              />
            </label>

            <label className="block">
              <span className="text-xs font-medium text-slateink">
                Company Email
              </span>

              <input
                type="email"
                value={companyEmail}
                onChange={(e) => setCompanyEmail(e.target.value)}
                className="input mt-1"
                placeholder="info@company.com"
              />
            </label>

          </div>

          {/* NTN + STRN */}

          <div className="grid sm:grid-cols-2 gap-4">

            <label className="block">
              <span className="text-xs font-medium text-slateink">
                NTN
              </span>

              <input
                type="text"
                value={companyNTN}
                onChange={(e) => setCompanyNTN(e.target.value)}
                className="input mt-1"
                placeholder="-"
              />
            </label>

            <label className="block">
              <span className="text-xs font-medium text-slateink">
                STRN
              </span>

              <input
                type="text"
                value={companySTRN}
                onChange={(e) => setCompanySTRN(e.target.value)}
                className="input mt-1"
                placeholder="-"
              />
            </label>

          </div>

          {/* MESSAGES */}

          {companyError && (
            <p className="text-xs font-medium text-coral bg-coral-light rounded-lg px-3 py-2">
              {companyError}
            </p>
          )}
          {companySuccess && (
            <p className="text-xs font-medium text-teal-dark bg-teal-light rounded-lg px-3 py-2">
              {companySuccess}
            </p>
          )}

          {/* SAVE BUTTON */}

          <button
            type="submit"
            disabled={companySaving || logoUploading}
            className="flex items-center gap-2 rounded-lg bg-teal text-white text-sm font-medium px-5 py-2.5 hover:bg-teal-dark transition-colors disabled:opacity-60"
          >
            <Save size={16} />
            {logoUploading
              ? 'Uploading logo…'
              : companySaving
              ? 'Saving…'
              : 'Save Company Profile'}
          </button>

        </form>
      </div>

      {/* ============================================================
          CREATE USER FORM
          ============================================================ */}

      <div className="bg-surface border border-line rounded-2xl shadow-card p-6 mb-8">
        <h2 className="text-sm font-medium text-ink mb-4 flex items-center gap-2">
          <UserPlus size={16} />
          Create New Login
        </h2>

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
                  {getRoleLabel(t.role)}
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

/* ============================================================
   FRIENDLY ERROR MESSAGES
   ============================================================ */

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