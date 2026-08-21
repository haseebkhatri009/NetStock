import { NavLink, useNavigate } from 'react-router-dom'
import {
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

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/inventory', label: 'Inventory', icon: Boxes },
  { to: '/challan', label: 'Delivery Challan', icon: FileText },
  { to: '/demo-challan', label: 'Demo Challan', icon: FileText }, // NEW - Demo Challan
  { to: '/invoice', label: 'Invoice', icon: Receipt },
  { to: '/quotation', label: 'Quotation', icon: FileSpreadsheet },
  { to: '/warranty', label: 'Warranty Validator', icon: ShieldCheck }
]

// Owner only nav items
const OWNER_NAV = [
  { to: '/create-user', label: 'Create User', icon: UserPlus }
]

export default function Sidebar() {
  const { logout, company, profile, user } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  // Check if user is owner - from profile.role or user.role
  const isOwner = profile?.role === 'owner' || user?.role === 'owner'

  // Combine nav items based on role
  const allNav = isOwner ? [...NAV, ...OWNER_NAV] : NAV

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col bg-ink text-white shrink-0">
      <div className="flex items-center gap-2 px-5 py-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal/20 text-teal">
          <Radio size={18} />
        </div>
        <div>
          <p className="font-display font-semibold text-[15px] leading-tight">NetStock</p>
          <p className="text-[11px] text-white/40 truncate max-w-[140px]">
            {company?.name || 'ERP'}
          </p>
        </div>
      </div>

      <nav className="relative flex-1 px-4 pt-2">
        <div className="circuit-track" />
        <ul className="space-y-1">
          {allNav.map(({ to, label, icon: Icon, end }) => (
            <li key={to} className="circuit-node">
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-white/[0.06] text-white'
                      : 'text-white/55 hover:text-white hover:bg-white/[0.04]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span className={`circuit-node ${isActive ? 'active' : ''}`}>
                      <span className="circuit-dot block" />
                    </span>
                    <Icon size={16} className="shrink-0" />
                    <span>{label}</span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="px-4 py-4 border-t border-white/10">
        <div className="flex items-center gap-2 px-1 pb-3">
          <div className="h-8 w-8 rounded-full bg-teal/20 text-teal flex items-center justify-center text-xs font-semibold uppercase">
            {profile?.email?.[0] || user?.email?.[0] || '?'}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-white/80 truncate">
              {profile?.email || user?.email || 'User'}
            </p>
            <p className="text-[10px] uppercase tracking-wide text-white/35">
              {profile?.role || user?.role || 'staff'}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-white/60 hover:text-white hover:bg-white/[0.06] transition-colors"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  )
}