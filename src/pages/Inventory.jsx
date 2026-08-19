import { useEffect, useMemo, useState } from 'react'
import { ref, push, onValue, remove } from 'firebase/database'
import { Plus, Boxes, Trash2, Search } from 'lucide-react'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'
import { CATEGORIES, formatDate, normalizeMac } from '../utils/helpers'
import { Modal } from './Customers'
import Loader from '../components/Loader'

const emptyForm = {
  category: CATEGORIES[0],
  customCategory: '',
  name: '',
  mac: '',
  serial: '',
  description: '',
  quantity: 1
}

export default function Inventory() {
  const { companyId } = useAuth()
  const [stock, setStock] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [showForm, setShowForm] = useState(false)
  const [activeCat, setActiveCat] = useState('All')
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!companyId) return
    const stockRef = ref(db, `companies/${companyId}/stock`)
    const unsub = onValue(
      stockRef,
      (snap) => {
        const val = snap.val() || {}
        const list = Object.entries(val)
          .map(([id, s]) => ({ id, ...s }))
          .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
        setStock(list)
      },
      (err) => {
        console.error('stock read failed:', err)
        setStock([])
      }
    )
    return () => unsub()
  }, [companyId])

  const allCategories = useMemo(() => {
    const dynamic = new Set(CATEGORIES)
    ;(stock || []).forEach((s) => s.category && dynamic.add(s.category))
    return ['All', ...Array.from(dynamic)]
  }, [stock])

  const filtered = useMemo(() => {
    if (!stock) return []
    return stock.filter((s) => {
      const matchesCat = activeCat === 'All' || s.category === activeCat
      const q = search.toLowerCase()
      const matchesSearch =
        !q ||
        s.name?.toLowerCase().includes(q) ||
        s.mac?.toLowerCase().includes(q) ||
        s.serial?.toLowerCase().includes(q)
      return matchesCat && matchesSearch
    })
  }, [stock, activeCat, search])

  async function handleSubmit(e) {
    e.preventDefault()
    const category = form.category === 'Custom' ? form.customCategory.trim() : form.category
    if (!category || !form.name.trim()) return
    setSaving(true)
    try {
      const stockRef = ref(db, `companies/${companyId}/stock`)
      const mac = normalizeMac(form.mac)
      const qty = mac ? 1 : Math.max(1, Number(form.quantity) || 1)
      await push(stockRef, {
        category,
        name: form.name.trim(),
        mac: mac || null,
        serial: form.serial.trim() || null,
        description: form.description.trim() || null,
        quantity: qty,
        status: 'in-stock',
        addedDate: new Date().toISOString().slice(0, 10),
        createdAt: Date.now()
      })
      setForm(emptyForm)
      setShowForm(false)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Ye stock item delete karna hai?')) return
    await remove(ref(db, `companies/${companyId}/stock/${id}`))
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Inventory</h1>
          <p className="text-sm text-slateink mt-0.5">Track your stock by category.</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-lg bg-ink text-white text-sm font-medium px-4 py-2.5 hover:bg-inkSoft transition-colors self-start"
        >
          <Plus size={16} /> Add Stock
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative max-w-sm w-full">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slateink" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, MAC, serial…"
            className="input pl-9"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-thin pb-1">
          {allCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCat(cat)}
              className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-medium border transition-colors ${
                activeCat === cat
                  ? 'bg-ink text-white border-ink'
                  : 'bg-surface text-slateink border-line hover:border-ink/30'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {stock === null ? (
        <Loader />
      ) : filtered.length === 0 ? (
        <div className="border border-dashed border-line rounded-2xl py-16 flex flex-col items-center justify-center text-center">
          <Boxes className="text-slateink mb-3" size={28} />
          <p className="font-medium text-ink">Koi stock item nahi mila</p>
          <p className="text-sm text-slateink mt-1">Naya product add karein.</p>
        </div>
      ) : (
        <div className="bg-surface rounded-2xl border border-line shadow-card overflow-hidden">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-slateink">
                  <th className="px-4 py-3 font-medium">Product</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">MAC</th>
                  <th className="px-4 py-3 font-medium">Serial</th>
                  <th className="px-4 py-3 font-medium">Qty</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Added</th>
                  <th className="px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s.id} className="border-b border-line last:border-0 hover:bg-paper/60">
                    <td className="px-4 py-3">
                      <p className="font-medium text-ink">{s.name}</p>
                      {s.description && (
                        <p className="text-xs text-slateink max-w-xs truncate">{s.description}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-teal-light text-teal-dark text-xs font-medium px-2.5 py-1">
                        {s.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-ink/80">{s.mac || '—'}</td>
                    <td className="px-4 py-3 font-mono text-xs text-ink/80">{s.serial || '—'}</td>
                    <td className="px-4 py-3">{s.quantity}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full text-xs font-medium px-2.5 py-1 ${
                          s.status === 'sold'
                            ? 'bg-coral-light text-coral'
                            : 'bg-teal-light text-teal-dark'
                        }`}
                      >
                        {s.status === 'sold' ? 'Sold' : 'In Stock'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slateink font-mono">
                      {formatDate(s.addedDate)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDelete(s.id)}
                        className="text-slateink hover:text-coral"
                        aria-label="Delete stock"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showForm && (
        <Modal title="Add Stock" onClose={() => setShowForm(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block">
              <span className="text-xs font-medium text-slateink">Category *</span>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="input mt-1"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
                <option value="Custom">Custom…</option>
              </select>
            </label>
            {form.category === 'Custom' && (
              <label className="block">
                <span className="text-xs font-medium text-slateink">Custom Category Name *</span>
                <input
                  required
                  value={form.customCategory}
                  onChange={(e) => setForm({ ...form, customCategory: e.target.value })}
                  className="input mt-1"
                  placeholder="e.g. Router"
                />
              </label>
            )}
            <label className="block">
              <span className="text-xs font-medium text-slateink">Product Name *</span>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input mt-1"
                placeholder="e.g. Yealink T31G"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-slateink">MAC Address (optional)</span>
              <input
                value={form.mac}
                onChange={(e) => setForm({ ...form, mac: e.target.value })}
                className="input mt-1 font-mono"
                placeholder="AA:BB:CC:DD:EE:FF"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-slateink">Serial Number (optional)</span>
              <input
                value={form.serial}
                onChange={(e) => setForm({ ...form, serial: e.target.value })}
                className="input mt-1 font-mono"
                placeholder="SN-000123"
              />
            </label>
            {!form.mac && (
              <label className="block">
                <span className="text-xs font-medium text-slateink">Quantity</span>
                <input
                  type="number"
                  min={1}
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  className="input mt-1"
                />
              </label>
            )}
            <label className="block">
              <span className="text-xs font-medium text-slateink">Description (optional)</span>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="input min-h-[70px] mt-1"
                placeholder="Notes about this product…"
              />
            </label>
            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-lg bg-teal text-white text-sm font-medium py-2.5 hover:bg-teal-dark transition-colors disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Add to Stock'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  )
}
