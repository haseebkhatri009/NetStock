import { useState } from 'react'
import { ref, get } from 'firebase/database'
import { ShieldCheck, ShieldAlert, ShieldX, Search } from 'lucide-react'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'
import { formatDate, normalizeMac, addMonths, WARRANTY_MONTHS } from '../utils/helpers'

export default function WarrantyValidator() {
  const { companyId } = useAuth()
  const [mac, setMac] = useState('')
  const [result, setResult] = useState(null)
  const [notFound, setNotFound] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSearch(e) {
    e.preventDefault()
    setResult(null)
    setNotFound(false)
    const target = normalizeMac(mac)
    if (!target) return
    setLoading(true)
    try {
      const snap = await get(ref(db, `companies/${companyId}/stock`))
      const val = snap.val() || {}
      const match = Object.entries(val)
        .map(([id, s]) => ({ id, ...s }))
        .find((s) => normalizeMac(s.mac) === target)

      if (!match) {
        setNotFound(true)
      } else {
        setResult(match)
      }
    } finally {
      setLoading(false)
    }
  }

  const warrantyEnd = result?.soldDate ? addMonths(result.soldDate, WARRANTY_MONTHS) : null
  const isActive = warrantyEnd ? warrantyEnd.getTime() >= Date.now() : null

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-2xl font-semibold text-ink">Warranty Validator</h1>
      <p className="text-sm text-slateink mt-0.5 mb-6">
        Enter the device's MAC address to view its entry date, sale date, and warranty status.
      </p>

      <form onSubmit={handleSearch} className="flex gap-2 mb-8">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slateink" />
          <input
            value={mac}
            onChange={(e) => setMac(e.target.value)}
            placeholder="AA:BB:CC:DD:EE:FF"
            className="input pl-9 font-mono"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-ink text-white text-sm font-medium px-5 py-2.5 hover:bg-inkSoft transition-colors disabled:opacity-60"
        >
          {loading ? 'Searching…' : 'Check'}
        </button>
      </form>

      {notFound && (
        <div className="bg-surface border border-line rounded-2xl shadow-card p-6 flex items-center gap-4">
          <div className="h-11 w-11 rounded-xl bg-coral-light text-coral flex items-center justify-center">
            <ShieldX size={20} />
          </div>
          <div>
            <p className="font-medium text-ink">Koi device nahi mila</p>
            <p className="text-sm text-slateink">Ye MAC address system me record nahi hai.</p>
          </div>
        </div>
      )}

      {result && (
        <div className="bg-surface border border-line rounded-2xl shadow-card p-6">
          <div className="flex items-center gap-4 pb-5 border-b border-line">
            <div
              className={`h-11 w-11 rounded-xl flex items-center justify-center ${
                result.status !== 'sold'
                  ? 'bg-teal-light text-teal-dark'
                  : isActive
                  ? 'bg-teal-light text-teal-dark'
                  : 'bg-amber-light text-amber'
              }`}
            >
              {result.status !== 'sold' ? (
                <ShieldCheck size={20} />
              ) : isActive ? (
                <ShieldCheck size={20} />
              ) : (
                <ShieldAlert size={20} />
              )}
            </div>
            <div>
              <p className="font-display font-semibold text-ink">{result.name}</p>
              <p className="text-xs text-slateink">{result.category} · MAC {result.mac}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-5 text-sm">
            <Detail label="Stock Entry Date" value={formatDate(result.addedDate)} />
            <Detail label="Serial Number" value={result.serial || '—'} />
            <Detail
              label="Status"
              value={result.status === 'sold' ? 'Sold to customer' : 'In stock (not yet sold)'}
            />
            {result.status === 'sold' && (
              <>
                <Detail label="Sold To" value={result.soldTo || '—'} />
                <Detail label="Sale Date" value={formatDate(result.soldDate)} />
                <Detail
                  label="Warranty Status"
                  value={
                    isActive
                      ? `Active till ${formatDate(warrantyEnd)}`
                      : `Expired on ${formatDate(warrantyEnd)}`
                  }
                  highlight={isActive ? 'good' : 'bad'}
                />
                {result.dcNumber && <Detail label="Document #" value={result.dcNumber} />}
              </>
            )}
          </div>

          {result.description && (
            <p className="mt-5 text-xs text-slateink border-t border-line pt-4">{result.description}</p>
          )}
        </div>
      )}
    </div>
  )
}

function Detail({ label, value, highlight }) {
  const color =
    highlight === 'good' ? 'text-teal-dark' : highlight === 'bad' ? 'text-coral' : 'text-ink'
  return (
    <div>
      <p className="text-xs text-slateink">{label}</p>
      <p className={`font-medium ${color}`}>{value}</p>
    </div>
  )
}
