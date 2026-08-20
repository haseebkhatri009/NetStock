import { useEffect, useMemo, useState, useRef } from 'react'
import { ref, push, onValue, update, get, set, remove } from 'firebase/database'
import {
  Plus,
  Trash2,
  FileText,
  Printer,
  Pencil,
  X,
  Download
} from 'lucide-react'

import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'
import {
  formatDate,
  todayISO,
  docNumber
} from '../utils/helpers'

import { Modal } from './Customers'
import Loader from '../components/Loader'


/* ============================================================
   COMPANY INFORMATION
   ============================================================ */

const COMPANY_NAME = 'Pearl Networks'
const COMPANY_LOGO = '/PN.png'
const COMPANY_ADDRESS = `
KCHS, Gohar Chamber, Office # 304,
Shahrah-e-Faisal, near Duty Free Shop,
Karachi, 75660
`
const COMPANY_EMAIL = 'info@globalonesystem.com'


/* ============================================================
   DC NUMBER GENERATOR - DATE BASED WITH COUNTER
   ============================================================ */

// Get today's date in YYYYMMDD format
function getTodayDateString() {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}${month}${day}`
}

// Yeh function SIRF next number READ karega, INCREMENT nahi karega
async function getNextDcNumber(companyId) {
  try {
    const dateStr = getTodayDateString()
    const counterRef = ref(db, `companies/${companyId}/counters/dc`)
    const snapshot = await get(counterRef)
    
    let lastNumber = 0
    let lastDate = ''
    
    if (snapshot.exists()) {
      const data = snapshot.val()
      lastNumber = data.number || 0
      lastDate = data.date || ''
    }
    
    // Agar date change ho gayi hai toh counter reset karo
    let nextNumber = lastNumber + 1
    if (lastDate !== dateStr) {
      nextNumber = 1
    }
    
    const padded = String(nextNumber).padStart(4, '0')
    return `DC-${dateStr}-${padded}`
    
  } catch (error) {
    console.error('Error getting DC number:', error)
    const dateStr = getTodayDateString()
    const timestamp = Date.now().toString().slice(-6)
    return `DC-${dateStr}-${timestamp}`
  }
}

// Yeh function SIRF increment karega (save ke waqt)
async function incrementDcCounter(companyId) {
  try {
    const dateStr = getTodayDateString()
    const counterRef = ref(db, `companies/${companyId}/counters/dc`)
    const snapshot = await get(counterRef)
    
    let lastNumber = 0
    let lastDate = ''
    
    if (snapshot.exists()) {
      const data = snapshot.val()
      lastNumber = data.number || 0
      lastDate = data.date || ''
    }
    
    // Agar date change ho gayi hai toh counter reset karo
    let newNumber = lastNumber + 1
    if (lastDate !== dateStr) {
      newNumber = 1
    }
    
    // Counter update karo with date and number
    await set(counterRef, {
      date: dateStr,
      number: newNumber
    })
    
    return {
      number: newNumber,
      date: dateStr
    }
    
  } catch (error) {
    console.error('Error incrementing counter:', error)
    return null
  }
}


/* ============================================================
   EMPTY ITEM
   ============================================================ */

const emptyItem = {
  stockId: '',
  name: '',
  category: '',
  mac: '',
  serial: '',
  qty: 1,
  available: 0
}


/* ============================================================
   MAIN DELIVERY CHALLAN COMPONENT
   ============================================================ */

export default function DeliveryChallan() {
  const { companyId, company } = useAuth()

  const [customers, setCustomers] = useState(null)
  const [stock, setStock] = useState(null)
  const [challans, setChallans] = useState(null)

  const [showForm, setShowForm] = useState(false)
  const [preview, setPreview] = useState(null)

  const [editingChallan, setEditingChallan] = useState(null)

  const [customerId, setCustomerId] = useState('')
  const [dcNumber, setDcNumber] = useState('')

  const [items, setItems] = useState([])

  const [pickStockId, setPickStockId] = useState('')
  const [pickQty, setPickQty] = useState(1)

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')


  /* ============================================================
     LOAD CUSTOMERS / STOCK / CHALLANS
     ============================================================ */

  useEffect(() => {
    if (!companyId) return

    const customersRef = ref(db, `companies/${companyId}/customers`)
    const stockRef = ref(db, `companies/${companyId}/stock`)
    const challansRef = ref(db, `companies/${companyId}/challans`)

    const unsubCustomers = onValue(customersRef, (snap) => {
      const value = snap.val() || {}
      const list = Object.entries(value).map(([id, customer]) => ({
        id,
        ...customer
      }))
      setCustomers(list)
    }, (err) => {
      console.error('customers read failed:', err)
      setCustomers([])
    })

    const unsubStock = onValue(stockRef, (snap) => {
      const value = snap.val() || {}
      const list = Object.entries(value).map(([id, stockItem]) => ({
        id,
        ...stockItem
      }))
      setStock(list)
    }, (err) => {
      console.error('stock read failed:', err)
      setStock([])
    })

    const unsubChallans = onValue(challansRef, (snap) => {
      const value = snap.val() || {}
      const list = Object.entries(value)
        .map(([id, challan]) => ({
          id,
          ...challan
        }))
        .sort((a, b) => (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0))
      setChallans(list)
    }, (err) => {
      console.error('challans read failed:', err)
      setChallans([])
    })

    return () => {
      unsubCustomers()
      unsubStock()
      unsubChallans()
    }
  }, [companyId])


  /* ============================================================
     AVAILABLE STOCK
     ============================================================ */

  const availableStock = useMemo(() => {
    if (!stock) return []

    const selectedIds = new Set(items.map((item) => item.stockId))

    return stock.filter((s) => {
      const isCurrentEditItem = editingChallan && selectedIds.has(s.id)
      const quantity = Number(s.quantity) || 0

      if (isCurrentEditItem) return true
      if (s.status === 'sold') return false
      return quantity > 0
    })
  }, [stock, items, editingChallan])


  /* ============================================================
     RESET FORM
     ============================================================ */

  function resetForm() {
    setCustomerId('')
    setDcNumber('')
    setItems([])
    setPickStockId('')
    setPickQty(1)
    setError('')
    setEditingChallan(null)
  }


  /* ============================================================
     OPEN NEW CHALLAN
     ============================================================ */

  const openNewChallan = async () => {
    resetForm()
    if (companyId) {
      const number = await getNextDcNumber(companyId)
      setDcNumber(number)
    }
    setShowForm(true)
  }


  /* ============================================================
     OPEN EDIT CHALLAN
     ============================================================ */

  function openEditChallan(challan) {
    setError('')
    setEditingChallan(challan)
    setCustomerId(challan.customerId || '')
    setDcNumber(challan.dcNumber || '')

    const oldItems = Array.isArray(challan.items)
      ? challan.items.map((item) => ({
          stockId: item.stockId || '',
          name: item.name || '',
          category: item.category || '',
          mac: item.mac || '',
          serial: item.serial || '',
          qty: Number(item.qty) || 1,
          available: Number(item.available) || 0
        }))
      : []

    setItems(oldItems)
    setPickStockId('')
    setPickQty(1)
    setShowForm(true)
  }


  /* ============================================================
     DELETE CHALLAN
     ============================================================ */

  async function handleDeleteChallan(id) {
    if (!confirm('Are you sure you want to delete this Delivery Challan?')) return
    
    try {
      // First, get the challan data to restore stock
      const challanRef = ref(db, `companies/${companyId}/challans/${id}`)
      const snap = await get(challanRef)
      
      if (!snap.exists()) {
        setError('Challan not found')
        return
      }
      
      const challan = snap.val()
      const oldItems = challan.items || []
      
      // Restore stock for each item
      const updates = {}
      
      for (const item of oldItems) {
        if (!item.stockId) continue
        
        const stockRef = ref(db, `companies/${companyId}/stock/${item.stockId}`)
        const stockSnap = await get(stockRef)
        
        if (!stockSnap.exists()) continue
        
        const stockItem = stockSnap.val()
        
        // Check if it's a serialized item (MAC or Serial)
        if (stockItem.mac || stockItem.serial || item.mac || item.serial) {
          // Restore serialized item
          updates[`companies/${companyId}/stock/${item.stockId}/status`] = 'available'
          updates[`companies/${companyId}/stock/${item.stockId}/soldTo`] = null
          updates[`companies/${companyId}/stock/${item.stockId}/soldToId`] = null
          updates[`companies/${companyId}/stock/${item.stockId}/soldDate`] = null
          updates[`companies/${companyId}/stock/${item.stockId}/dcNumber`] = null
        } else {
          // Restore quantity for bulk items
          const currentQty = Number(stockItem.quantity) || 0
          const restoredQty = currentQty + (Number(item.qty) || 0)
          
          updates[`companies/${companyId}/stock/${item.stockId}/quantity`] = restoredQty
          updates[`companies/${companyId}/stock/${item.stockId}/status`] = 'available'
          updates[`companies/${companyId}/stock/${item.stockId}/soldTo`] = null
          updates[`companies/${companyId}/stock/${item.stockId}/soldToId`] = null
          updates[`companies/${companyId}/stock/${item.stockId}/soldDate`] = null
          updates[`companies/${companyId}/stock/${item.stockId}/dcNumber`] = null
        }
      }
      
      // Delete the challan
      updates[`companies/${companyId}/challans/${id}`] = null
      
      await update(ref(db), updates)
      
      setSuccess('Delivery Challan deleted successfully!')
      
    } catch (err) {
      console.error('Delete error:', err)
      setError('Failed to delete challan')
    }
  }


  /* ============================================================
     ADD ITEM
     ============================================================ */

  function addItem() {
    if (!stock) return

    const selectedStock = stock.find((s) => s.id === pickStockId)
    if (!selectedStock) return

    const isSerialized = !!selectedStock.mac || !!selectedStock.serial

    let qty = 1
    if (!isSerialized) {
      qty = Math.min(Math.max(1, Number(pickQty) || 1), Math.max(1, Number(selectedStock.quantity) || 1))
    }

    const alreadyAdded = items.some((item) => item.stockId === selectedStock.id)
    if (alreadyAdded) {
      setError('Ye product already list mein hai.')
      return
    }

    setItems([
      ...items,
      {
        stockId: selectedStock.id,
        name: selectedStock.name || '',
        category: selectedStock.category || '',
        mac: selectedStock.mac || '',
        serial: selectedStock.serial || '',
        qty,
        available: Number(selectedStock.quantity) || 0
      }
    ])

    setPickStockId('')
    setPickQty(1)
    setError('')
  }


  /* ============================================================
     REMOVE ITEM
     ============================================================ */

  function removeItem(stockId) {
    setItems(items.filter((item) => item.stockId !== stockId))
  }


  /* ============================================================
     UPDATE ITEM QTY
     ============================================================ */

  function changeItemQty(stockId, value) {
    const stockItem = stock?.find((s) => s.id === stockId)
    if (!stockItem) return

    const currentQty = Number(value) || 1
    const maxQty = Number(stockItem.quantity) || 1
    const isSerialized = !!stockItem.mac || !!stockItem.serial

    const finalQty = isSerialized ? 1 : Math.min(Math.max(1, currentQty), maxQty)

    setItems(items.map((item) =>
      item.stockId === stockId ? { ...item, qty: finalQty } : item
    ))
  }


  /* ============================================================
     RESTORE OLD STOCK
     ============================================================ */

  async function restoreOldStock(oldItems) {
    if (!oldItems?.length) return {}

    const updates = {}

    for (const item of oldItems) {
      if (!item.stockId) continue

      const stockRef = ref(db, `companies/${companyId}/stock/${item.stockId}`)
      const snap = await get(stockRef)

      if (!snap.exists()) continue

      const stockItem = snap.val()

      if (stockItem.mac || stockItem.serial || item.mac || item.serial) {
        updates[`companies/${companyId}/stock/${item.stockId}/status`] = 'available'
        updates[`companies/${companyId}/stock/${item.stockId}/soldTo`] = null
        updates[`companies/${companyId}/stock/${item.stockId}/soldToId`] = null
        updates[`companies/${companyId}/stock/${item.stockId}/soldDate`] = null
        updates[`companies/${companyId}/stock/${item.stockId}/dcNumber`] = null
      } else {
        const currentQty = Number(stockItem.quantity) || 0
        const restoredQty = currentQty + (Number(item.qty) || 0)

        updates[`companies/${companyId}/stock/${item.stockId}/quantity`] = restoredQty
        updates[`companies/${companyId}/stock/${item.stockId}/status`] = 'available'
        updates[`companies/${companyId}/stock/${item.stockId}/soldTo`] = null
        updates[`companies/${companyId}/stock/${item.stockId}/soldToId`] = null
        updates[`companies/${companyId}/stock/${item.stockId}/soldDate`] = null
        updates[`companies/${companyId}/stock/${item.stockId}/dcNumber`] = null
      }
    }

    return updates
  }


  /* ============================================================
     DEDUCT NEW STOCK
     ============================================================ */

  async function deductStock(newItems, customer, customerId, dcNumber, date) {
    const updates = {}

    for (const item of newItems) {
      if (!item.stockId) continue

      const stockRef = ref(db, `companies/${companyId}/stock/${item.stockId}`)
      const snap = await get(stockRef)

      if (!snap.exists()) continue

      const stockItem = snap.val()

      if (stockItem.mac || stockItem.serial) {
        updates[`companies/${companyId}/stock/${item.stockId}/status`] = 'sold'
        updates[`companies/${companyId}/stock/${item.stockId}/soldTo`] = customer.name
        updates[`companies/${companyId}/stock/${item.stockId}/soldToId`] = customerId
        updates[`companies/${companyId}/stock/${item.stockId}/soldDate`] = date
        updates[`companies/${companyId}/stock/${item.stockId}/dcNumber`] = dcNumber
      } else {
        const currentQty = Number(stockItem.quantity) || 0
        const requestedQty = Number(item.qty) || 0

        if (requestedQty > currentQty) {
          throw new Error(`Stock kam hai: ${item.name}`)
        }

        const newQty = Math.max(0, currentQty - requestedQty)

        updates[`companies/${companyId}/stock/${item.stockId}/quantity`] = newQty
        updates[`companies/${companyId}/stock/${item.stockId}/soldDate`] = date
        updates[`companies/${companyId}/stock/${item.stockId}/soldTo`] = customer.name
        updates[`companies/${companyId}/stock/${item.stockId}/soldToId`] = customerId
        updates[`companies/${companyId}/stock/${item.stockId}/dcNumber`] = dcNumber

        updates[`companies/${companyId}/stock/${item.stockId}/status`] = newQty === 0 ? 'sold' : 'available'
      }
    }

    return updates
  }


  /* ============================================================
     SUBMIT / SAVE / UPDATE CHALLAN
     ============================================================ */

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!customerId || items.length === 0) {
      setError('Customer aur kam az kam aik product select karein.')
      return
    }

    if (!customers) {
      setError('Customers load nahi hue.')
      return
    }

    const customer = customers.find((c) => c.id === customerId)
    if (!customer) {
      setError('Customer nahi mila.')
      return
    }

    setSaving(true)

    try {
      const date = editingChallan?.date || todayISO()
      
      let finalDcNumber = dcNumber

      // Agar editing nahi hai (new challan) toh counter increment karo
      if (!editingChallan) {
        // Counter increment karo (tracking ke liye)
        await incrementDcCounter(companyId)
        
        // Agar user ne number empty chhoda hai toh fallback generate karo
        if (!finalDcNumber || finalDcNumber.trim() === '') {
          const dateStr = getTodayDateString()
          const timestamp = Date.now().toString().slice(-6)
          finalDcNumber = `DC-${dateStr}-${timestamp}`
          setDcNumber(finalDcNumber)
        }
      }

      if (editingChallan) {
        const restoreUpdates = await restoreOldStock(editingChallan.items || [])
        const deductUpdates = await deductStock(items, customer, customerId, finalDcNumber, date)

        const allUpdates = {
          ...restoreUpdates,
          ...deductUpdates,
          [`companies/${companyId}/challans/${editingChallan.id}/dcNumber`]: finalDcNumber,
          [`companies/${companyId}/challans/${editingChallan.id}/date`]: date,
          [`companies/${companyId}/challans/${editingChallan.id}/customerId`]: customerId,
          [`companies/${companyId}/challans/${editingChallan.id}/customerName`]: customer.name,
          [`companies/${companyId}/challans/${editingChallan.id}/customerCompany`]: customer.company || '',
          [`companies/${companyId}/challans/${editingChallan.id}/customerPhone`]: customer.phone || '',
          [`companies/${companyId}/challans/${editingChallan.id}/customerAddress`]: customer.address || '',
          [`companies/${companyId}/challans/${editingChallan.id}/companyName`]: company?.name || COMPANY_NAME,
          [`companies/${companyId}/challans/${editingChallan.id}/items`]: items,
          [`companies/${companyId}/challans/${editingChallan.id}/updatedAt`]: Date.now()
        }

        await update(ref(db), allUpdates)

        setPreview({
          id: editingChallan.id,
          dcNumber: finalDcNumber,
          date,
          customerId,
          customer,
          items,
          companyName: company?.name || COMPANY_NAME
        })

        setShowForm(false)
        resetForm()
        return
      }

      const challansRef = ref(db, `companies/${companyId}/challans`)
      const newRef = await push(challansRef, {
        dcNumber: finalDcNumber,
        date,
        customerId,
        customerName: customer.name,
        customerCompany: customer.company || '',
        customerPhone: customer.phone || '',
        customerAddress: customer.address || '',
        companyName: company?.name || COMPANY_NAME,
        items,
        createdAt: Date.now()
      })

      const updates = await deductStock(items, customer, customerId, finalDcNumber, date)
      await update(ref(db), updates)

      setPreview({
        id: newRef.key,
        dcNumber: finalDcNumber,
        date,
        customerId,
        customer,
        items,
        companyName: company?.name || COMPANY_NAME
      })

      setShowForm(false)
      resetForm()
    } catch (err) {
      console.error('Challan save/update failed:', err)
      setError(err?.message || 'Challan save nahi ho saka. Dobara koshish karein.')
    } finally {
      setSaving(false)
    }
  }


  /* ============================================================
     DOWNLOAD PDF - SHOW PREVIEW FIRST
     ============================================================ */

  function handleDownloadPdf(challan) {
    const previewChallan = {
      id: challan.id,
      dcNumber: challan.dcNumber,
      date: challan.date,
      items: challan.items || [],
      companyName: challan.companyName || COMPANY_NAME,
      customer: {
        name: challan.customerName,
        company: challan.customerCompany,
        phone: challan.customerPhone,
        address: challan.customerAddress
      }
    }
    
    setPreview(previewChallan)
  }


  /* ============================================================
     MAIN PAGE
     ============================================================ */

  return (
    <div>

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Delivery Challan</h1>
          <p className="text-sm text-slateink mt-0.5">Create a DC — stock will be automatically deducted.</p>
        </div>
        <button onClick={openNewChallan} className="flex items-center gap-2 rounded-lg bg-ink text-white text-sm font-medium px-4 py-2.5 hover:bg-inkSoft transition-colors self-start">
          <Plus size={16} /> New Challan
        </button>
      </div>

      {/* CHALLAN LIST */}
      {challans === null ? (
        <Loader />
      ) : challans.length === 0 ? (
        <div className="border border-dashed border-line rounded-2xl py-16 flex flex-col items-center justify-center text-center">
          <FileText className="text-slateink mb-3" size={28} />
          <p className="font-medium text-ink">Abhi tak koi DC nahi banaya</p>
        </div>
      ) : (
        <div className="bg-surface rounded-2xl border border-line shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-slateink">
                  <th className="px-4 py-3 font-medium">DC #</th>
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Items</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {challans.map((c) => (
                  <tr key={c.id} className="border-b border-line last:border-0 hover:bg-paper/60">
                    <td className="px-4 py-3 font-mono text-xs">{c.dcNumber}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-ink">{c.customerName}</p>
                      <p className="text-xs text-slateink">{c.customerCompany}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-slateink">{c.items?.length || 0} item(s)</td>
                    <td className="px-4 py-3 text-xs font-mono text-slateink">{formatDate(c.date)}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end items-center gap-2 flex-wrap">
                        <button 
                          onClick={() => setPreview({
                            id: c.id,
                            dcNumber: c.dcNumber,
                            date: c.date,
                            items: c.items || [],
                            companyName: c.companyName || COMPANY_NAME,
                            customer: {
                              name: c.customerName,
                              company: c.customerCompany,
                              phone: c.customerPhone,
                              address: c.customerAddress
                            }
                          })} 
                          className="flex items-center gap-1.5 text-teal-dark text-xs font-medium hover:underline"
                        >
                          <Printer size={14} /> View
                        </button>

                        <button 
                          onClick={() => openEditChallan(c)} 
                          className="flex items-center gap-1.5 text-ink text-xs font-medium hover:underline"
                        >
                          <Pencil size={14} /> Edit
                        </button>

                        <button
                          onClick={() => handleDownloadPdf(c)}
                          className="flex items-center gap-1.5 text-red-600 text-xs font-medium hover:text-red-800"
                        >
                          <Download size={14} /> PDF
                        </button>

                        {/* DELETE BUTTON */}
                        <button
                          onClick={() => handleDeleteChallan(c.id)}
                          className="flex items-center gap-1.5 text-coral text-xs font-medium hover:text-red-700"
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE / EDIT FORM */}
      {showForm && (
        <Modal 
          title={editingChallan ? `Edit Delivery Challan — ${editingChallan.dcNumber}` : 'New Delivery Challan'} 
          onClose={() => { setShowForm(false); resetForm() }} 
          wide
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* DC NUMBER - EDITABLE */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-xs font-medium text-slateink">DC Number *</span>
                <input
                  type="text"
                  value={dcNumber}
                  onChange={(e) => setDcNumber(e.target.value)}
                  className="input mt-1"
                  placeholder="DC-YYYYMMDD-0001"
                  required
                />
                <small className="text-xs text-slateink mt-1 block">
                  Format: DC-YYYYMMDD-0001 (Auto-generated)
                </small>
              </label>

              <label className="block">
                <span className="text-xs font-medium text-slateink">Customer *</span>
                <select
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  className="input mt-1"
                  required
                >
                  <option value="">Select customer…</option>
                  {(customers || []).map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}{c.company ? ` — ${c.company}` : ''}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div>
              <span className="text-xs font-medium text-slateink">Date</span>
              <p className="mt-1 font-mono text-sm text-ink">{formatDate(editingChallan?.date || todayISO())} {editingChallan ? '' : '(today)'}</p>
            </div>

            <div className="border border-line rounded-xl p-4">
              <p className="text-xs font-medium text-slateink mb-3">Add Products</p>
              <div className="flex flex-col sm:flex-row gap-2">
                <select value={pickStockId} onChange={(e) => setPickStockId(e.target.value)} className="input flex-1">
                  <option value="">Select from stock…</option>
                  {availableStock.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.category ? `${s.category} — ` : ''}{s.name}
                      {s.mac ? ` (MAC ${s.mac})` : s.serial ? ` (Serial ${s.serial})` : ` (Qty ${s.quantity})`}
                    </option>
                  ))}
                </select>

                {!stock?.find((s) => s.id === pickStockId)?.mac && !stock?.find((s) => s.id === pickStockId)?.serial && (
                  <input type="number" min={1} value={pickQty} onChange={(e) => setPickQty(e.target.value)} className="input sm:w-24" placeholder="Qty" />
                )}

                <button type="button" onClick={addItem} disabled={!pickStockId} className="rounded-lg bg-teal text-white text-sm font-medium px-4 py-2.5 hover:bg-teal-dark disabled:opacity-50 shrink-0">
                  Add
                </button>
              </div>

              {items.length > 0 && (
                <div className="mt-4 space-y-2">
                  {items.map((item) => {
                    const serialized = !!item.mac || !!item.serial
                    return (
                      <div key={item.stockId} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-paper rounded-lg px-3 py-3 text-sm">
                        <div>
                          <div className="font-medium text-ink">{item.name}</div>
                          <div className="text-xs text-slateink mt-1">
                            {item.category && `${item.category} · `}
                            {item.mac && `MAC ${item.mac}`}
                            {item.serial && `Serial ${item.serial}`}
                            {!item.mac && !item.serial && `Qty ${item.qty}`}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {!serialized && (
                            <input type="number" min={1} value={item.qty} onChange={(e) => changeItemQty(item.stockId, e.target.value)} className="input w-24" />
                          )}
                          <button type="button" onClick={() => removeItem(item.stockId)} className="text-coral" title="Remove">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {error && <p className="text-xs font-medium text-coral bg-coral-light rounded-lg px-3 py-2">{error}</p>}

            <button type="submit" disabled={saving} className="w-full rounded-lg bg-ink text-white text-sm font-medium py-2.5 hover:bg-inkSoft transition-colors disabled:opacity-60">
              {saving ? editingChallan ? 'Updating…' : 'Saving…' : editingChallan ? 'Update Challan' : 'Generate Challan'}
            </button>
          </form>
        </Modal>
      )}

      {/* PRINT PREVIEW */}
      {preview && (
        <PrintableModal doc={preview} type="Delivery Challan" onClose={() => setPreview(null)} />
      )}

    </div>
  )
}


/* =================================================================
   PRINTABLE DELIVERY CHALLAN
   ================================================================= */

export function PrintableModal({ doc, type, onClose }) {
  const printRef = useRef(null)

  /* ================================================================
     PRINT
  ================================================================ */

  function handlePrint() {
    if (!printRef.current) return

    const content = printRef.current.innerHTML
    const win = window.open('', '_blank', 'width=1000,height=900')

    if (!win) {
      alert('Popup blocked hai. Browser mein popup allow karein.')
      return
    }

    win.document.open()
    win.document.write(`
<!doctype html>
<html>
<head>
<meta charset="UTF-8" />
<title>${type} ${doc.dcNumber || ''}</title>
<style>
@page { size: A4; margin: 0; }
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; width: 210mm; min-height: 297mm; }
body { font-family: Arial, Helvetica, sans-serif; color: #111; background: #fff; }
.dc-sheet { width: 210mm; min-height: 297mm; padding: 12mm 8mm 10mm 8mm; margin: 0; background: #fff; position: relative; }
.dc-title { text-align: center; font-size: 18px; line-height: 1; font-weight: 700; text-decoration: underline; margin: 0 0 8mm 0; }
.dc-header { display: grid; grid-template-columns: 43% 57%; column-gap: 4mm; min-height: 46mm; }
.dc-left { font-size: 11px; line-height: 1.45; }
.dc-label { font-weight: 700; text-decoration: underline; margin-bottom: 1.5mm; }
.dc-company-name { font-weight: 600; margin-bottom: 0.8mm; }
.dc-address { white-space: pre-line; margin: 0; }
.dc-email { margin-top: 0.5mm; color: #0563c1; text-decoration: underline; }
.dc-delivery-to { margin-top: 3.5mm; }
.dc-delivery-to-name { font-weight: 600; }
.dc-info-box { width: 100%; border: 1px solid #111; margin-top: 1mm; }
.dc-info-row { display: grid; grid-template-columns: 50% 50%; min-height: 8mm; }
.dc-info-cell { border: 1px solid #111; display: flex; align-items: center; padding: 1.5mm 2mm; font-size: 10.5px; }
.dc-info-label { font-weight: 600; text-align: right; justify-content: flex-end; padding-right: 3mm; }
.dc-info-value { font-weight: 600; justify-content: flex-start; padding-left: 3mm; }
.dc-products { margin-top: 55mm; width: 100%; }
.dc-product-table { width: 100%; border-collapse: collapse; table-layout: fixed; margin: 0; }
.dc-product-table col:nth-child(1) { width: 9%; }
.dc-product-table col:nth-child(2) { width: 30%; }
.dc-product-table col:nth-child(3) { width: 14%; }
.dc-product-table col:nth-child(4) { width: 25%; }
.dc-product-table col:nth-child(5) { width: 22%; }
.dc-product-table th, .dc-product-table td { border: 1px solid #111; padding: 1.8mm 2mm; font-size: 10.5px; vertical-align: middle; }
.dc-product-table th { font-weight: 700; text-align: center; }
.dc-product-table td { text-align: center; min-height: 7mm; }
.dc-product-name { text-align: center !important; font-weight: 500; }
.dc-signatures { margin-top: 18mm; width: 100%; font-size: 11px; }
.dc-signature-top { display: grid; grid-template-columns: 1fr 1fr; column-gap: 20mm; margin-bottom: 7mm; }
.dc-signature-heading { font-weight: 500; white-space: nowrap; }
.dc-signature-heading.right { text-align: right; }
.dc-signature-bottom { display: grid; grid-template-columns: 1fr 1fr; column-gap: 30mm; }
.dc-signature-block { min-height: 25mm; position: relative; }
.dc-signature-name { font-size: 11px; margin-bottom: 2mm; }
.dc-signature-line { width: 72mm; border-bottom: 1px solid #111; }
.dc-signature-line.right { margin-left: auto; }
@media print {
  html, body { width: 210mm; min-height: 297mm; margin: 0; padding: 0; background: #fff; }
  .dc-sheet { width: 210mm; min-height: 297mm; margin: 0; padding: 12mm 8mm 10mm 8mm; page-break-after: avoid; }
}
</style>
</head>
<body>
${content}
</body>
</html>
`)

    win.document.close()
    setTimeout(() => { win.focus(); win.print(); }, 500)
  }

  const rawItems = Array.isArray(doc.items) ? doc.items : []
  const printableItems = rawItems.length > 0 ? rawItems : [{ name: '', qty: '', mac: '', serial: '' }]

  function getMacLines(item) {
    if (!item) return []
    if (Array.isArray(item.mac)) return item.mac
    if (typeof item.mac === 'string' && item.mac.includes(',')) {
      return item.mac.split(',').map(x => x.trim()).filter(Boolean)
    }
    return item.mac ? [item.mac] : []
  }

  function getSerialLines(item) {
    if (!item) return []
    if (Array.isArray(item.serial)) return item.serial
    if (typeof item.serial === 'string' && item.serial.includes(',')) {
      return item.serial.split(',').map(x => x.trim()).filter(Boolean)
    }
    return item.serial ? [item.serial] : []
  }

  const companyName = doc.companyName || COMPANY_NAME
  const companyAddress = COMPANY_ADDRESS
  const companyEmail = COMPANY_EMAIL

  const customerName = doc.customer?.name || ''
  const customerCompany = doc.customer?.company || ''
  const customerAddress = doc.customer?.address || ''
  const customerPhone = doc.customer?.phone || ''

  return (
    <Modal title={`${type} — ${doc.dcNumber || ''}`} onClose={onClose} wide>
      
      {/* BUTTONS */}
      <div className="flex gap-3 mb-4 no-print">
        <button onClick={handlePrint} className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-ink text-white text-sm font-medium py-2.5 hover:bg-inkSoft">
          <Printer size={16} /> Print / Save as PDF
        </button>
        <button onClick={onClose} className="px-5 rounded-lg border border-line text-ink text-sm font-medium py-2.5 hover:bg-paper">
          Close
        </button>
      </div>

      {/* PRINT CONTENT */}
      <div ref={printRef} style={{ 
        background: '#ffffff', 
        padding: '0', 
        overflow: 'hidden',
        width: '210mm',
        margin: '0 auto'
      }}>
        <div className="dc-sheet" style={{ 
          width: '210mm', 
          minHeight: '297mm', 
          margin: '0 auto', 
          background: '#ffffff', 
          padding: '12mm 8mm 10mm 8mm', 
          boxSizing: 'border-box', 
          color: '#111', 
          fontFamily: 'Arial, Helvetica, sans-serif',
          overflow: 'hidden'
        }}>
          
          {/* TITLE */}
          <div className="dc-title" style={{ textAlign: 'center', fontSize: '18px', lineHeight: '1', fontWeight: 700, textDecoration: 'underline', margin: '0 0 8mm 0' }}>
            DELIVERY CHALLAN
          </div>

          {/* HEADER */}
          <div className="dc-header" style={{ display: 'grid', gridTemplateColumns: '43% 57%', columnGap: '4mm', minHeight: '46mm' }}>
            <div className="dc-left" style={{ fontSize: '11px', lineHeight: 1.45 }}>
              <div className="dc-label" style={{ fontWeight: 700, textDecoration: 'underline', marginBottom: '1.5mm' }}>Delivery From:</div>
              <div className="dc-company-name" style={{ fontWeight: 600 }}>{companyName}</div>
              <div className="dc-address" style={{ whiteSpace: 'pre-line' }}>{companyAddress}</div>
              <div className="dc-email" style={{ marginTop: '0.5mm', color: '#0563c1', textDecoration: 'underline' }}>{companyEmail}</div>

              <div className="dc-delivery-to" style={{ marginTop: '3.5mm' }}>
                <div className="dc-label" style={{ fontWeight: 700, textDecoration: 'underline' }}>Delivery To:</div>
                <div className="dc-delivery-to-name" style={{ fontWeight: 600 }}>
                  {customerCompany ? `M/S. ${customerCompany}` : `M/S. ${customerName}`}
                </div>
                {!customerCompany && customerName && <div>{customerName}</div>}
                {customerAddress && <div style={{ marginTop: '1mm', fontSize: '10px' }}>{customerAddress}</div>}
                {customerPhone && <div style={{ fontSize: '10px' }}>Phone: {customerPhone}</div>}
              </div>
            </div>

            <div>
              <div className="dc-info-box" style={{ width: '100%', border: '1px solid #111', marginTop: '1mm' }}>
                <div className="dc-info-row" style={{ display: 'grid', gridTemplateColumns: '50% 50%', minHeight: '8mm' }}>
                  <div className="dc-info-cell dc-info-label" style={{ border: '1px solid #111', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '1.5mm 3mm', fontSize: '10.5px', fontWeight: 600 }}>Delivery Challan No:</div>
                  <div className="dc-info-cell dc-info-value" style={{ border: '1px solid #111', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', padding: '1.5mm 3mm', fontSize: '10.5px', fontWeight: 600 }}>{doc.dcNumber}</div>
                </div>
                <div className="dc-info-row" style={{ display: 'grid', gridTemplateColumns: '50% 50%', minHeight: '8mm' }}>
                  <div className="dc-info-cell dc-info-label" style={{ border: '1px solid #111', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '1.5mm 3mm', fontSize: '10.5px', fontWeight: 600 }}>Date:</div>
                  <div className="dc-info-cell dc-info-value" style={{ border: '1px solid #111', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', padding: '1.5mm 3mm', fontSize: '10.5px', fontWeight: 600 }}>{formatDate(doc.date)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* PRODUCT TABLE */}
          <div className="dc-products" style={{ marginTop: '55mm', width: '100%' }}>
            <table className="dc-product-table" style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', margin: 0 }}>
              <colgroup>
                <col style={{ width: '9%' }} />
                <col style={{ width: '30%' }} />
                <col style={{ width: '14%' }} />
                <col style={{ width: '25%' }} />
                <col style={{ width: '22%' }} />
              </colgroup>
              <thead>
                <tr>
                  <th style={{ border: '1px solid #111', padding: '1.8mm 2mm', fontSize: '10.5px', textAlign: 'center', fontWeight: 700 }}>S.No.</th>
                  <th style={{ border: '1px solid #111', padding: '1.8mm 2mm', fontSize: '10.5px', textAlign: 'center', fontWeight: 700 }}>Product Name</th>
                  <th style={{ border: '1px solid #111', padding: '1.8mm 2mm', fontSize: '10.5px', textAlign: 'center', fontWeight: 700 }}>Quantity</th>
                  <th style={{ border: '1px solid #111', padding: '1.8mm 2mm', fontSize: '10.5px', textAlign: 'center', fontWeight: 700 }}>Mac Address</th>
                  <th style={{ border: '1px solid #111', padding: '1.8mm 2mm', fontSize: '10.5px', textAlign: 'center', fontWeight: 700 }}>Serial Number</th>
                </tr>
              </thead>
              <tbody>
                {printableItems.map((item, index) => {
                  const macLines = getMacLines(item)
                  const serialLines = getSerialLines(item)
                  const maxLines = Math.max(1, macLines.length, serialLines.length)

                  return (
                    <tr key={`${item.stockId || item.name}-${index}`}>
                      <td style={{ border: '1px solid #111', padding: '1.8mm 2mm', fontSize: '10.5px', textAlign: 'center', verticalAlign: 'middle' }}>{index + 1}</td>
                      <td className="dc-product-name" style={{ border: '1px solid #111', padding: '1.8mm 2mm', fontSize: '10.5px', textAlign: 'center', verticalAlign: 'middle', fontWeight: 500 }}>{item.name}</td>
                      <td style={{ border: '1px solid #111', padding: '1.8mm 2mm', fontSize: '10.5px', textAlign: 'center', verticalAlign: 'middle' }}>{item.qty}</td>
                      <td style={{ border: '1px solid #111', padding: '1.8mm 2mm', fontSize: '10.5px', textAlign: 'center', verticalAlign: 'middle' }}>
                        {Array.from({ length: maxLines }).map((_, macIndex) => (
                          <div key={`mac-${macIndex}`} style={{ minHeight: '5mm', lineHeight: 1.4 }}>{macLines[macIndex] || ''}</div>
                        ))}
                      </td>
                      <td style={{ border: '1px solid #111', padding: '1.8mm 2mm', fontSize: '10.5px', textAlign: 'center', verticalAlign: 'middle' }}>
                        {Array.from({ length: maxLines }).map((_, serialIndex) => (
                          <div key={`serial-${serialIndex}`} style={{ minHeight: '5mm', lineHeight: 1.4 }}>{serialLines[serialIndex] || ''}</div>
                        ))}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* SIGNATURE SECTION */}
          <div className="dc-signatures" style={{ marginTop: '18mm', width: '100%', fontSize: '11px' }}>
            <div className="dc-signature-top" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: '20mm', marginBottom: '7mm' }}>
              <div className="dc-signature-heading" style={{ fontWeight: 500, whiteSpace: 'nowrap' }}>Received In Sound Condition By:</div>
              <div className="dc-signature-heading right" style={{ fontWeight: 500, whiteSpace: 'nowrap', textAlign: 'right' }}>Delivered By:</div>
            </div>

            <div className="dc-signature-bottom" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: '30mm' }}>
              <div className="dc-signature-block" style={{ minHeight: '25mm' }}>
                <div className="dc-signature-name" style={{ fontSize: '11px', marginBottom: '2mm' }}>Name:</div>
                <div className="dc-signature-line" style={{ width: '72mm', borderBottom: '1px solid #111' }} />
                <div style={{ marginTop: '4mm', fontSize: '10px', color: '#666' }}>Signature</div>
              </div>
              <div className="dc-signature-block" style={{ minHeight: '25mm' }}>
                <div className="dc-signature-line right" style={{ width: '72mm', borderBottom: '1px solid #111', marginLeft: 'auto' }} />
                <div style={{ marginTop: '4mm', fontSize: '10px', color: '#666', textAlign: 'right' }}>Signature</div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* PRINT CSS */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          .no-print { display: none !important; }
          #dc-print-content { display: block !important; }
          .dc-sheet { box-shadow: none !important; }
          body { background: #fff !important; }
        }
      `}} />

    </Modal>
  )
}