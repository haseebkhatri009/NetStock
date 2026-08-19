import { useState } from 'react'
import { ref, get } from 'firebase/database'
import { ShieldCheck, ShieldAlert, ShieldX, Search, ChevronDown, ChevronUp } from 'lucide-react'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'
import { formatDate, normalizeMac, addMonths, WARRANTY_MONTHS } from '../utils/helpers'

export default function WarrantyValidator() {
  const { companyId } = useAuth()
  const [mac, setMac] = useState('')
  const [results, setResults] = useState([])
  const [notFound, setNotFound] = useState(false)
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState(null)

  async function handleSearch(e) {
    e.preventDefault()
    setResults([])
    setNotFound(false)
    
    const searchTerm = mac.trim()
    if (!searchTerm) return
    
    setLoading(true)
    
    try {
      // First, get all stock items
      const stockSnap = await get(ref(db, `companies/${companyId}/stock`))
      const stockVal = stockSnap.val() || {}
      
      // Get all customers with their details
      const customersSnap = await get(ref(db, `companies/${companyId}/customers`))
      const customersVal = customersSnap.val() || {}
      
      // Create customer lookup map with full details
      const customerMap = {}
      Object.entries(customersVal).forEach(([id, customer]) => {
        customerMap[id] = {
          name: customer.name || '',
          company: customer.company || '',
          phone: customer.phone || '',
          address: customer.address || ''
        }
      })
      
      // Also create a map by name for legacy data
      const customerByNameMap = {}
      Object.entries(customersVal).forEach(([id, customer]) => {
        if (customer.name) {
          customerByNameMap[customer.name.toLowerCase().trim()] = {
            id: id,
            name: customer.name || '',
            company: customer.company || ''
          }
        }
      })
      
      // Normalize the search term
      const normalizedSearch = normalizeMac(searchTerm)
      const lastFour = searchTerm.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(-4)
      
      // Find all matching devices and enrich with customer data
      const matches = Object.entries(stockVal)
        .map(([id, s]) => {
          let soldToName = ''
          let soldToCompany = ''
          let soldToPhone = ''
          let soldToAddress = ''
          
          // CASE 1: soldTo is a customer ID (e.g., "customer_123")
          if (s.soldTo && customerMap[s.soldTo]) {
            soldToName = customerMap[s.soldTo].name || ''
            soldToCompany = customerMap[s.soldTo].company || ''
            soldToPhone = customerMap[s.soldTo].phone || ''
            soldToAddress = customerMap[s.soldTo].address || ''
          }
          // CASE 2: soldTo is a name and we need to find matching customer
          else if (s.soldTo && typeof s.soldTo === 'string' && !s.soldTo.startsWith('soldTo_')) {
            const trimmedName = s.soldTo.toLowerCase().trim()
            if (customerByNameMap[trimmedName]) {
              soldToName = customerByNameMap[trimmedName].name || s.soldTo
              soldToCompany = customerByNameMap[trimmedName].company || ''
            } else {
              soldToName = s.soldTo
              soldToCompany = s.soldToCompany || '' // Fallback to direct field
            }
          }
          // CASE 3: No soldTo data
          else {
            soldToName = s.soldTo || ''
            soldToCompany = s.soldToCompany || ''
          }
          
          return {
            id,
            ...s,
            soldToName,
            soldToCompany,
            soldToPhone,
            soldToAddress
          }
        })
        .filter((s) => {
          if (!s.mac) return false
          
          const normalizedMac = normalizeMac(s.mac)
          
          // Check if full MAC matches
          if (normalizedMac === normalizedSearch) return true
          
          // Check if last 4 digits match
          const macLastFour = s.mac.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(-4)
          if (macLastFour === lastFour && lastFour.length === 4) return true
          
          return false
        })
      
      if (matches.length === 0) {
        setNotFound(true)
      } else {
        setResults(matches)
        // Auto expand first result
        if (matches.length === 1) {
          setExpanded(matches[0].id)
        } else {
          setExpanded(null)
        }
      }
      
    } catch (error) {
      console.error('Search error:', error)
      setNotFound(true)
    } finally {
      setLoading(false)
    }
  }

  function toggleExpand(id) {
    setExpanded(expanded === id ? null : id)
  }

  // Function to format sold to with name and company
  function formatSoldTo(result) {
    if (!result.soldTo && !result.soldToName) {
      return '—'
    }
    
    const name = result.soldToName || ''
    const company = result.soldToCompany || ''
    
    if (name && company) {
      return `${name} (${company})`
    } else if (name) {
      return name
    } else if (company) {
      return company
    }
    
    return '—'
  }

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-2xl font-semibold text-ink">Warranty Validator</h1>
      <p className="text-sm text-slateink mt-0.5 mb-6">
        Enter full MAC address or last 4 digits to search. Multiple devices with same last 4 digits will show all results.
      </p>

      <form onSubmit={handleSearch} className="flex gap-2 mb-8">
        <div className="relative flex-1">
          {/* <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slateink" /> */}
          <input
            value={mac}
            onChange={(e) => setMac(e.target.value)}
            placeholder="AA:BB:CC:DD:EE:FF or last 4 digits (e.g., EE:FF)"
            className="input pl-9 font-mono"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-ink text-white text-sm font-medium px-5 py-2.5 hover:bg-inkSoft transition-colors disabled:opacity-60"
        >
          {loading ? 'Searching...' : 'Check'}
        </button>
      </form>

      {notFound && (
        <div className="bg-surface border border-line rounded-2xl shadow-card p-6 flex items-center gap-4">
          <div className="h-11 w-11 rounded-xl bg-coral-light text-coral flex items-center justify-center">
            <ShieldX size={20} />
          </div>
          <div>
            <p className="font-medium text-ink">No device found</p>
            <p className="text-sm text-slateink">This MAC address or last 4 digits did not match any record.</p>
          </div>
        </div>
      )}

      {results.length > 1 && (
        <div className="mb-4 bg-amber-light/20 border border-amber/30 rounded-xl p-3">
          <p className="text-sm text-amber-dark font-medium">
            🔍 Found {results.length} device(s) matching your search
          </p>
          <p className="text-xs text-slateink mt-1">
            Click on each device to view details
          </p>
        </div>
      )}

      {results.map((result) => {
        const warrantyEnd = result?.soldDate ? addMonths(result.soldDate, WARRANTY_MONTHS) : null
        const isActive = warrantyEnd ? warrantyEnd.getTime() >= Date.now() : null
        const isExpanded = expanded === result.id
        const soldToDisplay = formatSoldTo(result)

        return (
          <div
            key={result.id}
            className="bg-surface border border-line rounded-2xl shadow-card mb-4 overflow-hidden"
          >
            {/* Header - Always visible */}
            <div
              className="p-4 cursor-pointer hover:bg-paper/50 transition-colors flex items-center justify-between"
              onClick={() => toggleExpand(result.id)}
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div
                  className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                    result.status !== 'sold'
                      ? 'bg-teal-light text-teal-dark'
                      : isActive
                      ? 'bg-teal-light text-teal-dark'
                      : 'bg-amber-light text-amber'
                  }`}
                >
                  {result.status !== 'sold' ? (
                    <ShieldCheck size={18} />
                  ) : isActive ? (
                    <ShieldCheck size={18} />
                  ) : (
                    <ShieldAlert size={18} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-semibold text-ink text-sm truncate">{result.name}</p>
                  <p className="text-xs text-slateink truncate">
                    {result.category || 'Uncategorized'} · MAC {result.mac}
                    {result.status === 'sold' && (
                      <span className={`ml-2 ${isActive ? 'text-teal-dark' : 'text-coral'}`}>
                        · {isActive ? 'Active' : 'Expired'}
                      </span>
                    )}
                    {result.status !== 'sold' && (
                      <span className="ml-2 text-teal-dark">· In Stock</span>
                    )}
                  </p>
                </div>
              </div>
              <div className="shrink-0 ml-2">
                {isExpanded ? (
                  <ChevronUp size={18} className="text-slateink" />
                ) : (
                  <ChevronDown size={18} className="text-slateink" />
                )}
              </div>
            </div>

            {/* Expanded Details */}
            {isExpanded && (
              <div className="px-4 pb-4 pt-1 border-t border-line">
                <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                  <Detail label="Stock Entry Date" value={formatDate(result.addedDate)} />
                  <Detail label="Serial Number" value={result.serial || '—'} />
                  <Detail
                    label="Status"
                    value={
                      result.status === 'sold' 
                        ? 'Sold to customer' 
                        : result.quantity > 0 
                          ? `In stock (${result.quantity} available)` 
                          : 'In stock (not yet sold)'
                    }
                  />
                  {result.status === 'sold' && (
                    <>
                      <Detail label="Sold To" value={soldToDisplay} />
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
                  {result.status !== 'sold' && result.quantity > 0 && (
                    <Detail label="Available Quantity" value={result.quantity} />
                  )}
                </div>

                {result.description && (
                  <p className="mt-4 text-xs text-slateink border-t border-line pt-4">
                    {result.description}
                  </p>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function Detail({ label, value, highlight }) {
  const color =
    highlight === 'good' ? 'text-teal-dark' : highlight === 'bad' ? 'text-coral' : 'text-ink'
  return (
    <div>
      <p className="text-xs text-slateink">{label}</p>
      <p className={`font-medium ${color} break-words`}>{value || '—'}</p>
    </div>
  )
}