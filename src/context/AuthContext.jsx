// import { createContext, useContext, useEffect, useState } from 'react'
// import {
//   createUserWithEmailAndPassword,
//   signInWithEmailAndPassword,
//   signOut,
//   onAuthStateChanged
// } from 'firebase/auth'
// import { ref, set, get, serverTimestamp } from 'firebase/database'
// import { auth, db } from '../firebase'

// const AuthContext = createContext(null)

// export function useAuth() {
//   return useContext(AuthContext)
// }

// export function AuthProvider({ children }) {
//   const [currentUser, setCurrentUser] = useState(null)
//   const [profile, setProfile] = useState(null) // { companyId, role, email }
//   const [company, setCompany] = useState(null) // { name, ownerUid, createdAt }
//   const [loading, setLoading] = useState(true)

//   useEffect(() => {
//     const unsub = onAuthStateChanged(auth, async (user) => {
//       setCurrentUser(user)
//       if (user) {
//         const snap = await get(ref(db, `users/${user.uid}`))
//         if (snap.exists()) {
//           const p = snap.val()
//           setProfile(p)
//           const cSnap = await get(ref(db, `companies/${p.companyId}/profile`))
//           setCompany(cSnap.exists() ? cSnap.val() : null)
//         } else {
//           setProfile(null)
//           setCompany(null)
//         }
//       } else {
//         setProfile(null)
//         setCompany(null)
//       }
//       setLoading(false)
//     })
//     return unsub
//   }, [])

//   // First-time signup: this person becomes the company owner.
//   // companyId === owner's uid, so all their data lives under companies/{uid}/...
//   async function signup(email, password, companyName) {
//     const cred = await createUserWithEmailAndPassword(auth, email, password)
//     const uid = cred.user.uid
//     await set(ref(db, `users/${uid}`), {
//       email,
//       companyId: uid,
//       role: 'owner',
//       createdAt: Date.now()
//     })
//     await set(ref(db, `companies/${uid}/profile`), {
//       name: companyName || 'My Company',
//       ownerUid: uid,
//       createdAt: Date.now()
//     })
//     await set(ref(db, `companies/${uid}/team/${uid}`), {
//       email,
//       role: 'owner',
//       createdAt: Date.now()
//     })
//     return cred
//   }

//   function login(email, password) {
//     return signInWithEmailAndPassword(auth, email, password)
//   }

//   function logout() {
//     return signOut(auth)
//   }

//   const value = {
//     currentUser,
//     profile,
//     company,
//     companyId: profile?.companyId || null,
//     role: profile?.role || null,
//     loading,
//     signup,
//     login,
//     logout,
//     setCompany
//   }

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
// }





import { createContext, useContext, useEffect, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth'
import { ref, set, get, onValue } from 'firebase/database'
import { auth, db } from '../firebase'

const AuthContext = createContext(null)

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [profile, setProfile] = useState(null) // { companyId, role, email }
  const [company, setCompany] = useState(null) // { name, logoUrl, address, phone, email, ntn, strn, ... }
  const [loading, setLoading] = useState(true)

  /* ============================================================
     AUTH STATE LISTENER
     ============================================================
     Loads user profile on auth change.
     Company data is loaded separately (real-time) below.
     ============================================================ */

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user)

      if (user) {
        try {
          const snap = await get(ref(db, `users/${user.uid}`))

          if (snap.exists()) {
            setProfile(snap.val())
          } else {
            setProfile(null)
            setCompany(null)
          }
        } catch (err) {
          console.error('profile read failed:', err)
          setProfile(null)
          setCompany(null)
        }
      } else {
        setProfile(null)
        setCompany(null)
      }

      setLoading(false)
    })

    return unsub
  }, [])

  /* ============================================================
     REAL-TIME COMPANY LISTENER
     ============================================================
     Loads the entire company object from `companies/{companyId}`.

     This is where logoUrl, address, phone, email, ntn, strn
     are stored (saved from Create User page).

     Real-time: any update reflects instantly.
     ============================================================ */

  useEffect(() => {
    if (!profile?.companyId) {
      setCompany(null)
      return
    }

    const companyRef = ref(db, `companies/${profile.companyId}`)

    const unsub = onValue(
      companyRef,
      (snap) => {
        if (snap.exists()) {
          const data = snap.val()

          /*
           * Backward-compatibility:
           * If old data was saved under `companies/{id}/profile`
           * (with name/ownerUid/createdAt), merge it in.
           * Root-level fields take priority.
           */

          const rootData = { ...data }
          const profileData = rootData.profile || {}

          delete rootData.profile
          delete rootData.team
          delete rootData.counters
          delete rootData.customers
          delete rootData.stock
          delete rootData.challans
          delete rootData.invoices
          delete rootData.demoChallans

          const merged = {
            ...profileData,
            ...rootData
          }

          setCompany(merged)
        } else {
          setCompany(null)
        }
      },
      (err) => {
        console.error('company read failed:', err)
        setCompany(null)
      }
    )

    return () => unsub()
  }, [profile?.companyId])

  /* ============================================================
     SIGNUP (Owner)
     ============================================================
     Company data is now saved at ROOT level (`companies/{uid}`)
     so the real-time listener can find logoUrl, address, etc.
     ============================================================ */

  async function signup(email, password, companyName) {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    const uid = cred.user.uid

    /* ---------- User record ---------- */

    await set(ref(db, `users/${uid}`), {
      email,
      companyId: uid,
      role: 'owner',
      createdAt: Date.now()
    })

    /* ---------- Company (ROOT level) ----------
     *
     * All company-level fields live directly under
     * companies/{uid}. This is where Create User page
     * will later update logoUrl, address, phone, etc.
     */

    await set(ref(db, `companies/${uid}`), {
      name: companyName || 'My Company',
      ownerUid: uid,
      email: email || '',
      address: '',
      phone: '',
      ntn: '',
      strn: '',
      logoUrl: '',
      createdAt: Date.now()
    })

    /* ---------- Team (owner as first member) ---------- */

    await set(ref(db, `companies/${uid}/team/${uid}`), {
      email,
      role: 'owner',
      createdAt: Date.now()
    })

    return cred
  }

  /* ============================================================
     LOGIN / LOGOUT
     ============================================================ */

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password)
  }

  function logout() {
    return signOut(auth)
  }

  /* ============================================================
     CONTEXT VALUE
     ============================================================ */

  const value = {
    currentUser,
    profile,
    company,
    companyId: profile?.companyId || null,
    role: profile?.role || null,
    loading,
    signup,
    login,
    logout,
    setCompany
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}