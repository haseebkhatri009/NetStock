import { useEffect, useMemo, useState } from 'react'
import { ref, push, onValue, remove, set } from 'firebase/database'
import { Plus, Search, Trash2, Building2, Phone, MapPin, X } from 'lucide-react'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'
import { formatDate } from '../utils/helpers'
import Loader from '../components/Loader'

const emptyForm = { name: '', company: '', phone: '', address: '', description: '' }

export default function Customers() {
  const { companyId } = useAuth()
  const [customers, setCustomers] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!companyId) return
    const custRef = ref(db, `companies/${companyId}/customers`)
    const unsub = onValue(
      custRef,
      (snap) => {
        const val = snap.val() || {}
        const list = Object.entries(val)
          .map(([id, c]) => ({ id, ...c }))
          .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
        setCustomers(list)
      },
      (err) => {
        console.error('customers read failed:', err)
        setCustomers([])
      }
    )
    return () => unsub()
  }, [companyId])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim() || !form.phone.trim()) return
    setSaving(true)
    try {
      const custRef = ref(db, `companies/${companyId}/customers`)
      await push(custRef, { ...form, createdAt: Date.now() })
      setForm(emptyForm)
      setShowForm(false)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Ye customer delete karna hai?')) return
    await remove(ref(db, `companies/${companyId}/customers/${id}`))
  }

  const filtered = useMemo(() => {
    if (!customers) return []
    const q = search.toLowerCase()
    return customers.filter(
      (c) =>
        c.name?.toLowerCase().includes(q) ||
        c.company?.toLowerCase().includes(q) ||
        c.phone?.toLowerCase().includes(q)
    )
  }, [customers, search])

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Customers</h1>
          <p className="text-sm text-slateink mt-0.5">Manage your client records here.</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-lg bg-ink text-white text-sm font-medium px-4 py-2.5 hover:bg-inkSoft transition-colors self-start"
        >
          <Plus size={16} /> Add Customer
        </button>
      </div>

      <div className="relative max-w-sm mb-5">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slateink" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, company, phone…"
          className="w-full rounded-lg border border-line bg-surface pl-9 pr-3 py-2.5 text-sm outline-none focus:border-teal"
        />
      </div>

      {customers === null ? (
        <Loader />
      ) : filtered.length === 0 ? (
        <EmptyState onAdd={() => setShowForm(true)} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c) => (
            <div key={c.id} className="bg-surface rounded-2xl border border-line shadow-card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-display font-semibold text-ink">{c.name}</p>
                  {c.company && (
                    <p className="text-xs text-slateink flex items-center gap-1 mt-0.5">
                      <Building2 size={12} /> {c.company}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(c.id)}
                  className="text-slateink hover:text-coral transition-colors"
                  aria-label="Delete customer"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="mt-3 space-y-1.5 text-sm text-ink/80">
                <p className="flex items-center gap-2">
                  <Phone size={13} className="text-slateink" /> {c.phone}
                </p>
                {c.address && (
                  <p className="flex items-start gap-2">
                    <MapPin size={13} className="text-slateink mt-0.5 shrink-0" /> {c.address}
                  </p>
                )}
              </div>
              {c.description && (
                <p className="mt-3 text-xs text-slateink border-t border-line pt-3">{c.description}</p>
              )}
              <p className="mt-3 text-[11px] text-slateink/70 font-mono">
                Added {formatDate(c.createdAt)}
              </p>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <Modal onClose={() => setShowForm(false)} title="Add Customer">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Customer Name *">
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input"
                placeholder="e.g. Ahmed Khan"
              />
            </Field>
            <Field label="Company">
              <input
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                className="input"
                placeholder="e.g. Khan Traders"
              />
            </Field>
            <Field label="Phone Number *">
              <input
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="input"
                placeholder="03xx-xxxxxxx"
              />
            </Field>
            <Field label="Address">
              <input
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="input"
                placeholder="Shop / office address"
              />
            </Field>
            <Field label="Description">
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="input min-h-[70px]"
                placeholder="Notes about this customer…"
              />
            </Field>
            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-lg bg-teal text-white text-sm font-medium py-2.5 hover:bg-teal-dark transition-colors disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Save Customer'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  )
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-slateink">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  )
}

export function Modal({ title, onClose, children, wide = false }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-ink/50" onClick={onClose} />
      <div
        className={`relative bg-surface rounded-2xl shadow-xl w-full ${
          wide ? 'max-w-2xl' : 'max-w-md'
        } max-h-[90vh] overflow-y-auto scrollbar-thin p-6`}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display text-lg font-semibold text-ink">{title}</h3>
          <button onClick={onClose} className="text-slateink hover:text-ink">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

function EmptyState({ onAdd }) {
  return (
    <div className="border border-dashed border-line rounded-2xl py-16 flex flex-col items-center justify-center text-center">
      <Building2 className="text-slateink mb-3" size={28} />
      <p className="font-medium text-ink">Abhi tak koi customer nahi hai</p>
      <p className="text-sm text-slateink mt-1">Pehla customer add karke shuru karein.</p>
      <button
        onClick={onAdd}
        className="mt-4 flex items-center gap-2 rounded-lg bg-ink text-white text-sm font-medium px-4 py-2 hover:bg-inkSoft"
      >
        <Plus size={15} /> Add Customer
      </button>
    </div>
  )
}
