import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  Menu,
  X,
  LayoutDashboard,
  Users,
  Boxes,
  FileText,
  Receipt,
  ShieldCheck,
  UserPlus,
  LogOut,
  Radio,
  FileSpreadsheet
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

// Base navigation for everyone
const BASE_NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/inventory', label: 'Inventory', icon: Boxes },
  { to: '/challan', label: 'Delivery Challan', icon: FileText },
  { to: '/demo-challan', label: 'Demo Challan', icon: FileText },
  { to: '/invoice', label: 'Invoice', icon: Receipt },
  { to: '/quotation', label: 'Quotation', icon: FileSpreadsheet },
  { to: '/warranty', label: 'Warranty Validator', icon: ShieldCheck }
]

// Owner only nav items
const OWNER_NAV = [
  { to: '/create-user', label: 'Create User', icon: UserPlus }
]

export default function Topbar({ title }) {
  const [open, setOpen] = useState(false)
  const { logout, company, profile, user } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  // Check if user is owner
  const isOwner = profile?.role === 'owner' || user?.role === 'owner'

  // Combine nav items based on role
  const NAV = isOwner ? [...BASE_NAV, ...OWNER_NAV] : BASE_NAV

  return (
    <>
      <header className="md:hidden sticky top-0 z-30 bg-ink text-white flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal/20 text-teal">
            <Radio size={16} />
          </div>
          <span className="font-display font-semibold text-sm">{title || 'NetStock'}</span>
        </div>
        <button onClick={() => setOpen(true)} aria-label="Open menu">
          <Menu size={22} />
        </button>
      </header>

      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-ink text-white p-4 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <span className="font-display font-semibold">{company?.name || 'NetStock'}</span>
              <button onClick={() => setOpen(false)} aria-label="Close menu">
                <X size={20} />
              </button>
            </div>
            <nav className="flex-1 space-y-1">
              {NAV.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${
                      isActive ? 'bg-white/10 text-white' : 'text-white/60'
                    }`
                  }
                >
                  <Icon size={16} />
                  {label}
                </NavLink>
              ))}
            </nav>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-white/60 border-t border-white/10 pt-4 mt-4"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      )}
    </>
  )
}