import { useEffect, useMemo, useState, useRef } from 'react'
import { ref, push, onValue, update, get, set, remove } from 'firebase/database'
import {
  Plus,
  Trash2,
  FileText,
  Printer,
  Pencil,
  Download,
  RotateCcw
} from 'lucide-react'

import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'
import {
  formatDate,
  todayISO
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
   DDC NUMBER
   ============================================================ */

function getTodayDateString() {
  const today = new Date()

  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')

  return `${year}${month}${day}`
}


/* ============================================================
   GET NEXT DDC NUMBER
   ============================================================ */

async function getNextDdcNumber(companyId) {
  try {
    const dateStr = getTodayDateString()

    const counterRef = ref(
      db,
      `companies/${companyId}/counters/ddc`
    )

    const snapshot = await get(counterRef)

    let lastNumber = 0
    let lastDate = ''

    if (snapshot.exists()) {
      const data = snapshot.val()

      lastNumber = data.number || 0
      lastDate = data.date || ''
    }

    let nextNumber = lastNumber + 1

    if (lastDate !== dateStr) {
      nextNumber = 1
    }

    const padded = String(nextNumber).padStart(4, '0')

    return `DDC-${dateStr}-${padded}`

  } catch (error) {
    console.error('Error getting DDC number:', error)

    const dateStr = getTodayDateString()
    const timestamp = Date.now().toString().slice(-6)

    return `DDC-${dateStr}-${timestamp}`
  }
}


/* ============================================================
   INCREMENT DDC COUNTER
   ============================================================ */

async function incrementDdcCounter(companyId) {
  try {
    const dateStr = getTodayDateString()

    const counterRef = ref(
      db,
      `companies/${companyId}/counters/ddc`
    )

    const snapshot = await get(counterRef)

    let lastNumber = 0
    let lastDate = ''

    if (snapshot.exists()) {
      const data = snapshot.val()

      lastNumber = data.number || 0
      lastDate = data.date || ''
    }

    let newNumber = lastNumber + 1

    if (lastDate !== dateStr) {
      newNumber = 1
    }

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
   MAIN DEMO DELIVERY CHALLAN
   ============================================================ */

export default function DemoDeliveryChallan() {

  const { companyId, company } = useAuth()

  const [customers, setCustomers] = useState(null)
  const [stock, setStock] = useState(null)
  const [demoChallans, setDemoChallans] = useState(null)

  const [showForm, setShowForm] = useState(false)
  const [preview, setPreview] = useState(null)

  const [editingChallan, setEditingChallan] = useState(null)

  const [customerId, setCustomerId] = useState('')
  const [ddcNumber, setDdcNumber] = useState('')
  const [ddcDate, setDdcDate] = useState('')

  const [items, setItems] = useState([])

  const [pickStockId, setPickStockId] = useState('')
  const [pickQty, setPickQty] = useState(1)

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')


  /* ============================================================
     LOAD DATA
     ============================================================ */

  useEffect(() => {

    if (!companyId) return

    const customersRef = ref(
      db,
      `companies/${companyId}/customers`
    )

    const stockRef = ref(
      db,
      `companies/${companyId}/stock`
    )

    const demoChallansRef = ref(
      db,
      `companies/${companyId}/demo-challans`
    )


    const unsubCustomers = onValue(
      customersRef,
      (snap) => {

        const value = snap.val() || {}

        const list = Object.entries(value).map(
          ([id, customer]) => ({
            id,
            ...customer
          })
        )

        setCustomers(list)

      },
      (err) => {

        console.error('customers read failed:', err)
        setCustomers([])

      }
    )


    const unsubStock = onValue(
      stockRef,
      (snap) => {

        const value = snap.val() || {}

        const list = Object.entries(value).map(
          ([id, stockItem]) => ({
            id,
            ...stockItem
          })
        )

        setStock(list)

      },
      (err) => {

        console.error('stock read failed:', err)
        setStock([])

      }
    )


    const unsubDemoChallans = onValue(
      demoChallansRef,
      (snap) => {

        const value = snap.val() || {}

        const list = Object.entries(value)
          .map(([id, challan]) => ({
            id,
            ...challan
          }))
          .sort(
            (a, b) =>
              (b.updatedAt || b.createdAt || 0) -
              (a.updatedAt || a.createdAt || 0)
          )

        setDemoChallans(list)

      },
      (err) => {

        console.error('demo challans read failed:', err)
        setDemoChallans([])

      }
    )


    return () => {

      unsubCustomers()
      unsubStock()
      unsubDemoChallans()

    }

  }, [companyId])


  /* ============================================================
     AVAILABLE STOCK - ONLY AVAILABLE AND NOT SOLD
     ============================================================ */

  const availableStock = useMemo(() => {

    if (!stock) return []

    const selectedIds = new Set(
      items.map((item) => item.stockId)
    )

    return stock.filter((s) => {

      const isCurrentEditItem =
        editingChallan &&
        selectedIds.has(s.id)

      const quantity =
        Number(s.quantity) || 0

      // For editing - allow current items
      if (isCurrentEditItem) return true

      // EXCLUDE SOLD ITEMS
      if (s.status === 'sold') return false

      // EXCLUDE DEMO ITEMS (already on demo)
      if (s.status === 'demo') return false

      // Only show items with quantity > 0
      return quantity > 0

    })

  }, [stock, items, editingChallan])


  /* ============================================================
     RESET FORM
     ============================================================ */

  function resetForm() {

    setCustomerId('')
    setDdcNumber('')
    setDdcDate('')
    setItems([])
    setPickStockId('')
    setPickQty(1)
    setError('')
    setEditingChallan(null)

  }


  /* ============================================================
     NEW DEMO CHALLAN
     ============================================================ */

  const openNewChallan = async () => {

    resetForm()

    if (companyId) {

      const number =
        await getNextDdcNumber(companyId)

      setDdcNumber(number)
      setDdcDate(todayISO())

    }

    setShowForm(true)

  }


  /* ============================================================
     EDIT DEMO CHALLAN
     ============================================================ */

  function openEditChallan(challan) {

    setError('')

    setEditingChallan(challan)

    setCustomerId(
      challan.customerId || ''
    )

    setDdcNumber(
      challan.ddcNumber || ''
    )

    setDdcDate(
      challan.date || todayISO()
    )


    const oldItems =
      Array.isArray(challan.items)
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
     DELETE DEMO CHALLAN
     ============================================================ */

  async function handleDeleteChallan(id) {

    if (
      !confirm(
        'Are you sure you want to delete this Demo Delivery Challan?'
      )
    ) {
      return
    }


    try {

      const challanRef = ref(
        db,
        `companies/${companyId}/demo-challans/${id}`
      )

      const snap = await get(challanRef)


      if (!snap.exists()) {

        setError('Demo Challan not found')
        return

      }


      const challan = snap.val()

      const oldItems =
        challan.items || []


      const updates = {}


      for (const item of oldItems) {

        if (!item.stockId) continue


        const stockRef = ref(
          db,
          `companies/${companyId}/stock/${item.stockId}`
        )

        const stockSnap =
          await get(stockRef)


        if (!stockSnap.exists()) continue


        const stockItem =
          stockSnap.val()


        if (
          stockItem.mac ||
          stockItem.serial ||
          item.mac ||
          item.serial
        ) {

          updates[
            `companies/${companyId}/stock/${item.stockId}/status`
          ] = 'available'

          updates[
            `companies/${companyId}/stock/${item.stockId}/demoTo`
          ] = null

          updates[
            `companies/${companyId}/stock/${item.stockId}/demoToId`
          ] = null

          updates[
            `companies/${companyId}/stock/${item.stockId}/demoDate`
          ] = null

          updates[
            `companies/${companyId}/stock/${item.stockId}/ddcNumber`
          ] = null

        } else {

          const currentQty =
            Number(stockItem.quantity) || 0

          const restoredQty =
            currentQty +
            (Number(item.qty) || 0)


          updates[
            `companies/${companyId}/stock/${item.stockId}/quantity`
          ] = restoredQty

          updates[
            `companies/${companyId}/stock/${item.stockId}/status`
          ] = 'available'

          updates[
            `companies/${companyId}/stock/${item.stockId}/demoTo`
          ] = null

          updates[
            `companies/${companyId}/stock/${item.stockId}/demoToId`
          ] = null

          updates[
            `companies/${companyId}/stock/${item.stockId}/demoDate`
          ] = null

          updates[
            `companies/${companyId}/stock/${item.stockId}/ddcNumber`
          ] = null

        }

      }


      updates[
        `companies/${companyId}/demo-challans/${id}`
      ] = null


      await update(
        ref(db),
        updates
      )


    } catch (err) {

      console.error('Delete error:', err)

      setError(
        'Failed to delete demo challan'
      )

    }

  }


  /* ============================================================
     ADD ITEM
     ============================================================ */

  function addItem() {

    if (!stock) return


    const selectedStock =
      stock.find(
        (s) => s.id === pickStockId
      )


    if (!selectedStock) return


    const isSerialized =
      !!selectedStock.mac ||
      !!selectedStock.serial


    let qty = 1


    if (!isSerialized) {

      qty = Math.min(
        Math.max(
          1,
          Number(pickQty) || 1
        ),
        Math.max(
          1,
          Number(selectedStock.quantity) || 1
        )
      )

    }


    const alreadyAdded =
      items.some(
        (item) =>
          item.stockId ===
          selectedStock.id
      )


    if (alreadyAdded) {

      setError(
        'Ye product already list mein hai.'
      )

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
        available:
          Number(selectedStock.quantity) || 0
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

    setItems(
      items.filter(
        (item) =>
          item.stockId !== stockId
      )
    )

  }


  /* ============================================================
     CHANGE QTY
     ============================================================ */

  function changeItemQty(
    stockId,
    value
  ) {

    const stockItem =
      stock?.find(
        (s) => s.id === stockId
      )


    if (!stockItem) return


    const currentQty =
      Number(value) || 1

    const maxQty =
      Number(stockItem.quantity) || 1

    const isSerialized =
      !!stockItem.mac ||
      !!stockItem.serial


    const finalQty =
      isSerialized
        ? 1
        : Math.min(
            Math.max(1, currentQty),
            maxQty
          )


    setItems(
      items.map((item) =>
        item.stockId === stockId
          ? {
              ...item,
              qty: finalQty
            }
          : item
      )
    )

  }


  /* ============================================================
     RESTORE OLD STOCK
     ============================================================ */

  async function restoreOldStock(
    oldItems
  ) {

    if (!oldItems?.length) return {}

    const updates = {}


    for (const item of oldItems) {

      if (!item.stockId) continue


      const stockRef = ref(
        db,
        `companies/${companyId}/stock/${item.stockId}`
      )


      const snap =
        await get(stockRef)


      if (!snap.exists()) continue


      const stockItem =
        snap.val()


      if (
        stockItem.mac ||
        stockItem.serial ||
        item.mac ||
        item.serial
      ) {

        updates[
          `companies/${companyId}/stock/${item.stockId}/status`
        ] = 'available'

        updates[
          `companies/${companyId}/stock/${item.stockId}/demoTo`
        ] = null

        updates[
          `companies/${companyId}/stock/${item.stockId}/demoToId`
        ] = null

        updates[
          `companies/${companyId}/stock/${item.stockId}/demoDate`
        ] = null

        updates[
          `companies/${companyId}/stock/${item.stockId}/ddcNumber`
        ] = null

      } else {

        const currentQty =
          Number(stockItem.quantity) || 0

        const restoredQty =
          currentQty +
          (Number(item.qty) || 0)


        updates[
          `companies/${companyId}/stock/${item.stockId}/quantity`
        ] = restoredQty

        updates[
          `companies/${companyId}/stock/${item.stockId}/status`
        ] = 'available'

        updates[
          `companies/${companyId}/stock/${item.stockId}/demoTo`
        ] = null

        updates[
          `companies/${companyId}/stock/${item.stockId}/demoToId`
        ] = null

        updates[
          `companies/${companyId}/stock/${item.stockId}/demoDate`
        ] = null

        updates[
          `companies/${companyId}/stock/${item.stockId}/ddcNumber`
        ] = null

      }

    }


    return updates

  }


  /* ============================================================
     DEDUCT STOCK FOR DEMO
     ============================================================ */

  async function deductStockForDemo(
    newItems,
    customer,
    customerId,
    ddcNumber,
    date
  ) {

    const updates = {}


    for (const item of newItems) {

      if (!item.stockId) continue


      const stockRef = ref(
        db,
        `companies/${companyId}/stock/${item.stockId}`
      )


      const snap =
        await get(stockRef)


      if (!snap.exists()) continue


      const stockItem =
        snap.val()


      if (
        stockItem.mac ||
        stockItem.serial
      ) {

        updates[
          `companies/${companyId}/stock/${item.stockId}/status`
        ] = 'demo'

        updates[
          `companies/${companyId}/stock/${item.stockId}/demoTo`
        ] = customer.name

        updates[
          `companies/${companyId}/stock/${item.stockId}/demoToId`
        ] = customerId

        updates[
          `companies/${companyId}/stock/${item.stockId}/demoDate`
        ] = date

        updates[
          `companies/${companyId}/stock/${item.stockId}/ddcNumber`
        ] = ddcNumber

        updates[
          `companies/${companyId}/stock/${item.stockId}/demoCompany`
        ] = customer.company || ''

        updates[
          `companies/${companyId}/stock/${item.stockId}/demoPhone`
        ] = customer.phone || ''

      } else {

        const currentQty =
          Number(stockItem.quantity) || 0

        const requestedQty =
          Number(item.qty) || 0


        if (
          requestedQty >
          currentQty
        ) {

          throw new Error(
            `Stock kam hai: ${item.name}`
          )

        }


        const newQty =
          Math.max(
            0,
            currentQty -
            requestedQty
          )


        updates[
          `companies/${companyId}/stock/${item.stockId}/quantity`
        ] = newQty

        updates[
          `companies/${companyId}/stock/${item.stockId}/demoDate`
        ] = date

        updates[
          `companies/${companyId}/stock/${item.stockId}/demoTo`
        ] = customer.name

        updates[
          `companies/${companyId}/stock/${item.stockId}/demoToId`
        ] = customerId

        updates[
          `companies/${companyId}/stock/${item.stockId}/ddcNumber`
        ] = ddcNumber

        updates[
          `companies/${companyId}/stock/${item.stockId}/demoCompany`
        ] = customer.company || ''

        updates[
          `companies/${companyId}/stock/${item.stockId}/demoPhone`
        ] = customer.phone || ''

        updates[
          `companies/${companyId}/stock/${item.stockId}/status`
        ] =
          newQty === 0
            ? 'demo'
            : 'available'

      }

    }


    return updates

  }


  /* ============================================================
     SUBMIT
     ============================================================ */

  async function handleSubmit(e) {

    e.preventDefault()

    setError('')


    if (
      !customerId ||
      items.length === 0
    ) {

      setError(
        'Customer aur kam az kam aik product select karein.'
      )

      return

    }


    if (!customers) {

      setError(
        'Customers load nahi hue.'
      )

      return

    }


    const customer =
      customers.find(
        (c) => c.id === customerId
      )


    if (!customer) {

      setError(
        'Customer nahi mila.'
      )

      return

    }


    setSaving(true)


    try {

      const date =
        ddcDate || todayISO()


      let finalDdcNumber =
        ddcNumber


      if (!editingChallan) {

        await incrementDdcCounter(
          companyId
        )


        if (
          !finalDdcNumber ||
          finalDdcNumber.trim() === ''
        ) {

          const dateStr =
            getTodayDateString()

          const timestamp =
            Date.now()
              .toString()
              .slice(-6)


          finalDdcNumber =
            `DDC-${dateStr}-${timestamp}`

          setDdcNumber(
            finalDdcNumber
          )

        }

      }


      if (editingChallan) {

        const restoreUpdates =
          await restoreOldStock(
            editingChallan.items || []
          )


        const deductUpdates =
          await deductStockForDemo(
            items,
            customer,
            customerId,
            finalDdcNumber,
            date
          )


        const allUpdates = {

          ...restoreUpdates,

          ...deductUpdates,


          [`companies/${companyId}/demo-challans/${editingChallan.id}/ddcNumber`]:
            finalDdcNumber,

          [`companies/${companyId}/demo-challans/${editingChallan.id}/date`]:
            date,

          [`companies/${companyId}/demo-challans/${editingChallan.id}/customerId`]:
            customerId,

          [`companies/${companyId}/demo-challans/${editingChallan.id}/customerName`]:
            customer.name,

          [`companies/${companyId}/demo-challans/${editingChallan.id}/customerCompany`]:
            customer.company || '',

          [`companies/${companyId}/demo-challans/${editingChallan.id}/customerPhone`]:
            customer.phone || '',

          [`companies/${companyId}/demo-challans/${editingChallan.id}/customerAddress`]:
            customer.address || '',

          [`companies/${companyId}/demo-challans/${editingChallan.id}/companyName`]:
            company?.name ||
            COMPANY_NAME,

          [`companies/${companyId}/demo-challans/${editingChallan.id}/items`]:
            items,

          [`companies/${companyId}/demo-challans/${editingChallan.id}/updatedAt`]:
            Date.now(),

          [`companies/${companyId}/demo-challans/${editingChallan.id}/status`]:
            'active'

        }


        await update(
          ref(db),
          allUpdates
        )


        setPreview({

          id: editingChallan.id,

          ddcNumber:
            finalDdcNumber,

          date,

          customerId,

          customer,

          items,

          companyName:
            company?.name ||
            COMPANY_NAME

        })


        setShowForm(false)

        resetForm()

        return

      }


      const demoChallansRef =
        ref(
          db,
          `companies/${companyId}/demo-challans`
        )


      const newRef =
        await push(
          demoChallansRef,
          {

            ddcNumber:
              finalDdcNumber,

            date,

            customerId,

            customerName:
              customer.name,

            customerCompany:
              customer.company || '',

            customerPhone:
              customer.phone || '',

            customerAddress:
              customer.address || '',

            companyName:
              company?.name ||
              COMPANY_NAME,

            items,

            status: 'active',

            createdAt:
              Date.now()

          }
        )


      const updates =
        await deductStockForDemo(
          items,
          customer,
          customerId,
          finalDdcNumber,
          date
        )


      await update(
        ref(db),
        updates
      )


      setPreview({

        id: newRef.key,

        ddcNumber:
          finalDdcNumber,

        date,

        customerId,

        customer,

        items,

        companyName:
          company?.name ||
          COMPANY_NAME

      })


      setShowForm(false)

      resetForm()


    } catch (err) {

      console.error(
        'Demo Challan save/update failed:',
        err
      )

      setError(
        err?.message ||
        'Demo Challan save nahi ho saka. Dobara koshish karein.'
      )

    } finally {

      setSaving(false)

    }

  }


  /* ============================================================
     PDF PREVIEW
     ============================================================ */

  function handleDownloadPdf(challan) {

    const previewChallan = {

      id: challan.id,

      ddcNumber:
        challan.ddcNumber,

      date:
        challan.date,

      items:
        challan.items || [],

      companyName:
        challan.companyName ||
        COMPANY_NAME,

      customer: {

        name:
          challan.customerName,

        company:
          challan.customerCompany,

        phone:
          challan.customerPhone,

        address:
          challan.customerAddress

      }

    }


    setPreview(
      previewChallan
    )

  }


  /* ============================================================
     GET ITEM STATUS FOR DISPLAY - FIXED
     ============================================================ */

  function getItemStatusDisplay(challan) {
    if (!challan || !challan.items || challan.items.length === 0) {
      return { text: '0/0', returnedCount: 0, totalItems: 0 }
    }
    
    const totalItems = challan.items.length
    let returnedCount = 0
    
    // Check each item's stock status
    if (stock) {
      challan.items.forEach((item) => {
        const stockItem = stock.find((s) => s.id === item.stockId)
        // Agar stock item exist nahi karta ya uski status 'demo' nahi hai toh returned count karo
        if (!stockItem || stockItem.status !== 'demo') {
          returnedCount++
        }
      })
    }
    
    return { 
      text: `${returnedCount}/${totalItems}`, 
      returnedCount, 
      totalItems 
    }
  }


  /* ============================================================
     PAGE
     ============================================================ */

  return (

    <div>

      {/* HEADER */}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">

        <div>

          <h1 className="font-display text-2xl font-semibold text-ink">
            Demo Delivery Challan
          </h1>

          <p className="text-sm text-slateink mt-0.5">
            Create a Demo DC — stock will be marked as demo.
          </p>

        </div>


        <button
          onClick={openNewChallan}
          className="flex items-center gap-2 rounded-lg bg-amber text-white text-sm font-medium px-4 py-2.5 hover:bg-amber-dark transition-colors self-start"
        >

          <Plus size={16} />

          New Demo Challan

        </button>

      </div>


      {/* DEMO CHALLAN LIST */}

      {demoChallans === null ? (

        <Loader />

      ) : demoChallans.length === 0 ? (

        <div className="border border-dashed border-line rounded-2xl py-16 flex flex-col items-center justify-center text-center">

          <FileText
            className="text-slateink mb-3"
            size={28}
          />

          <p className="font-medium text-ink">
            Abhi tak koi Demo DC nahi banaya
          </p>

        </div>

      ) : (

        <div className="bg-surface rounded-2xl border border-line shadow-card overflow-hidden">

          <div className="overflow-x-auto">

            <table className="w-full text-sm">

              <thead>

                <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-slateink">

                  <th className="px-4 py-3 font-medium">
                    DDC #
                  </th>

                  <th className="px-4 py-3 font-medium">
                    Customer
                  </th>

                  <th className="px-4 py-3 font-medium">
                    Items
                  </th>

                  <th className="px-4 py-3 font-medium">
                    Date
                  </th>

                  <th className="px-4 py-3 font-medium">
                    Status
                  </th>

                  <th className="px-4 py-3 font-medium">
                    Actions
                  </th>

                </tr>

              </thead>


              <tbody>

                {demoChallans.map((c) => {

                  const status = getItemStatusDisplay(c)
                  
                  // Status logic - FIXED
                  const isFullyReturned = status.returnedCount === status.totalItems && status.totalItems > 0
                  const isPartiallyReturned = status.returnedCount > 0 && status.returnedCount < status.totalItems
                  const isActive = status.returnedCount === 0 && status.totalItems > 0

                  return (
                    <tr
                      key={c.id}
                      className="border-b border-line last:border-0 hover:bg-paper/60"
                    >

                      <td className="px-4 py-3 font-mono text-xs">
                        {c.ddcNumber}
                      </td>


                      <td className="px-4 py-3">

                        <p className="font-medium text-ink">
                          {c.customerName}
                        </p>

                        <p className="text-xs text-slateink">
                          {c.customerCompany}
                        </p>

                      </td>


                      <td className="px-4 py-3 text-xs text-slateink">
                        {status.text}
                      </td>


                      <td className="px-4 py-3 text-xs font-mono text-slateink">
                        {formatDate(c.date)}
                      </td>


                      <td className="px-4 py-3">

                        <span
                          className={`rounded-full text-xs font-medium px-2.5 py-1 ${
                            isFullyReturned
                              ? 'bg-teal-light text-teal-dark'
                              : isPartiallyReturned
                              ? 'bg-amber-light text-amber'
                              : 'bg-gray-200 text-gray-500'
                          }`}
                        >

                          {isFullyReturned
                            ? 'Returned' 
                            : isPartiallyReturned
                            ? 'Partial Return'
                            : 'Active'}
                        </span>

                      </td>


                      <td className="px-4 py-3">

                        <div className="flex justify-end items-center gap-2 flex-wrap">

                          <button
                            onClick={() =>
                              setPreview({
                                id: c.id,
                                ddcNumber: c.ddcNumber,
                                date: c.date,
                                items: c.items || [],
                                companyName:
                                  c.companyName ||
                                  COMPANY_NAME,
                                customer: {
                                  name:
                                    c.customerName,
                                  company:
                                    c.customerCompany,
                                  phone:
                                    c.customerPhone,
                                  address:
                                    c.customerAddress
                                }
                              })
                            }
                            className="flex items-center gap-1.5 text-teal-dark text-xs font-medium hover:underline"
                          >

                            <Printer size={14} />

                            View

                          </button>


                          {!isFullyReturned && c.status !== 'returned' && (

                            <button
                              onClick={() =>
                                openEditChallan(c)
                              }
                              className="flex items-center gap-1.5 text-ink text-xs font-medium hover:underline"
                            >

                              <Pencil size={14} />

                              Edit

                            </button>

                          )}


                          <button
                            onClick={() =>
                              handleDownloadPdf(c)
                            }
                            className="flex items-center gap-1.5 text-red-600 text-xs font-medium hover:text-red-800"
                          >

                            <Download size={14} />

                            PDF

                          </button>


                          {/* DELETE BUTTON - Always visible */}
                          <button
                            onClick={() =>
                              handleDeleteChallan(c.id)
                            }
                            className="flex items-center gap-1.5 text-coral text-xs font-medium hover:text-red-700"
                          >

                            <Trash2 size={14} />

                            Delete

                          </button>

                        </div>

                      </td>

                    </tr>
                  )

                })}

              </tbody>

            </table>

          </div>

        </div>

      )}


      {/* CREATE / EDIT */}

      {showForm && (

        <Modal
          title={
            editingChallan
              ? `Edit Demo Delivery Challan — ${editingChallan.ddcNumber}`
              : 'New Demo Delivery Challan'
          }
          onClose={() => {
            setShowForm(false)
            resetForm()
          }}
          wide
        >

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              <label className="block">

                <span className="text-xs font-medium text-slateink">
                  DDC Number *
                </span>

                <input
                  type="text"
                  value={ddcNumber}
                  onChange={(e) =>
                    setDdcNumber(e.target.value)
                  }
                  className="input mt-1"
                  placeholder="DDC-YYYYMMDD-0001"
                  required
                />

                <small className="text-xs text-slateink mt-1 block">
                  Format: DDC-YYYYMMDD-0001
                </small>

              </label>


              <label className="block">

                <span className="text-xs font-medium text-slateink">
                  Date *
                </span>

                <input
                  type="date"
                  value={ddcDate}
                  onChange={(e) =>
                    setDdcDate(e.target.value)
                  }
                  className="input mt-1"
                  required
                />

              </label>


              <label className="block">

                <span className="text-xs font-medium text-slateink">
                  Customer *
                </span>

                <select
                  value={customerId}
                  onChange={(e) =>
                    setCustomerId(e.target.value)
                  }
                  className="input mt-1"
                  required
                >

                  <option value="">
                    Select customer…
                  </option>

                  {(customers || []).map(
                    (c) => (

                      <option
                        key={c.id}
                        value={c.id}
                      >
                        {c.name}
                        {c.company
                          ? ` — ${c.company}`
                          : ''}
                      </option>

                    )
                  )}

                </select>

              </label>

            </div>


            <div className="border border-line rounded-xl p-4">

              <p className="text-xs font-medium text-slateink mb-3">
                Add Products for Demo
              </p>


              <div className="flex flex-col sm:flex-row gap-2">

                <select
                  value={pickStockId}
                  onChange={(e) =>
                    setPickStockId(
                      e.target.value
                    )
                  }
                  className="input flex-1"
                >

                  <option value="">
                    Select from stock…
                  </option>

                  {availableStock.map(
                    (s) => (

                      <option
                        key={s.id}
                        value={s.id}
                      >

                        {s.category
                          ? `${s.category} — `
                          : ''}

                        {s.name}

                        {s.mac
                          ? ` (MAC ${s.mac})`
                          : s.serial
                            ? ` (Serial ${s.serial})`
                            : ` (Qty ${s.quantity})`}

                      </option>

                    )
                  )}

                </select>


                {!stock?.find(
                  (s) =>
                    s.id ===
                    pickStockId
                )?.mac &&
                  !stock?.find(
                    (s) =>
                      s.id ===
                      pickStockId
                  )?.serial && (

                    <input
                      type="number"
                      min={1}
                      value={pickQty}
                      onChange={(e) =>
                        setPickQty(
                          e.target.value
                        )
                      }
                      className="input sm:w-24"
                      placeholder="Qty"
                    />

                  )}


                <button
                  type="button"
                  onClick={addItem}
                  disabled={!pickStockId}
                  className="rounded-lg bg-amber text-white text-sm font-medium px-4 py-2.5 hover:bg-amber-dark disabled:opacity-50 shrink-0"
                >

                  Add for Demo

                </button>

              </div>


              {items.length > 0 && (

                <div className="mt-4 space-y-2">

                  {items.map((item) => {

                    const serialized =
                      !!item.mac ||
                      !!item.serial


                    return (

                      <div
                        key={item.stockId}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-paper rounded-lg px-3 py-3 text-sm"
                      >

                        <div>

                          <div className="font-medium text-ink">
                            {item.name}
                          </div>

                          <div className="text-xs text-slateink mt-1">

                            {item.category &&
                              `${item.category} · `}

                            {item.mac &&
                              `MAC ${item.mac}`}

                            {item.serial &&
                              `Serial ${item.serial}`}

                            {!item.mac &&
                              !item.serial &&
                              `Qty ${item.qty}`}

                          </div>

                        </div>


                        <div className="flex items-center gap-3">

                          {!serialized && (

                            <input
                              type="number"
                              min={1}
                              value={item.qty}
                              onChange={(e) =>
                                changeItemQty(
                                  item.stockId,
                                  e.target.value
                                )
                              }
                              className="input w-24"
                            />

                          )}


                          <button
                            type="button"
                            onClick={() =>
                              removeItem(
                                item.stockId
                              )
                            }
                            className="text-coral"
                            title="Remove"
                          >

                            <Trash2 size={16} />

                          </button>

                        </div>

                      </div>

                    )

                  })}

                </div>

              )}

            </div>


            {error && (

              <p className="text-xs font-medium text-coral bg-coral-light rounded-lg px-3 py-2">
                {error}
              </p>

            )}


            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-lg bg-amber text-white text-sm font-medium py-2.5 hover:bg-amber-dark transition-colors disabled:opacity-60"
            >

              {saving
                ? editingChallan
                  ? 'Updating…'
                  : 'Saving…'
                : editingChallan
                  ? 'Update Demo Challan'
                  : 'Generate Demo Challan'}

            </button>

          </form>

        </Modal>

      )}


      {/* PREVIEW */}

      {preview && (

        <PrintableModal
          doc={preview}
          type="Demo Delivery Challan"
          isDemo={true}
          onClose={() =>
            setPreview(null)
          }
        />

      )}

    </div>

  )

}


/* =================================================================
   PRINTABLE DEMO DELIVERY CHALLAN
   ================================================================= */

export function PrintableModal({
  doc,
  type,
  isDemo = false,
  onClose
}) {

  const printRef =
    useRef(null)


  /* ============================================================
     PRINT
     ============================================================ */

  function handlePrint() {

    if (!printRef.current)
      return


    const content =
      printRef.current.innerHTML


    const win =
      window.open(
        '',
        '_blank',
        'width=1000,height=900'
      )


    if (!win) {

      alert(
        'Popup blocked hai. Browser mein popup allow karein.'
      )

      return

    }


    win.document.open()


    win.document.write(`

<!doctype html>

<html>

<head>

<meta charset="UTF-8" />

<title>
  ${type} ${doc.ddcNumber || doc.dcNumber || ''}
</title>


<style>

/* ============================================================
   PAGE
   ============================================================ */

@page {
  size: A4;
  margin: 0;
}


* {
  box-sizing: border-box;
}


html,
body {

  margin: 0;
  padding: 0;

  width: 210mm;

  min-height: 297mm;

}


body {

  font-family:
    Arial,
    Helvetica,
    sans-serif;

  color: #111;

  background: #fff;

}


/* ============================================================
   SHEET
   ============================================================ */

.dc-sheet {

  width: 210mm;

  min-height: 297mm;

  padding:
    10mm
    8mm
    10mm
    8mm;

  margin: 0;

  background: #fff;

  position: relative;

}


/* ============================================================
   TITLE
   ============================================================ */

.dc-title {

  text-align: center;

  font-size: 18px;

  line-height: 1;

  font-weight: 700;

  text-decoration: underline;

  margin:
    0
    0
    3mm
    0;

}


/* ============================================================
   LOGO
   ============================================================ */

.dc-logo {

  width: 28mm;

  height: auto;

  object-fit: contain;

  display: block;

  margin:
    0
    0
    2mm
    0;

}


/* ============================================================
   HEADER
   ============================================================ */

.dc-header {

  display: grid;

  grid-template-columns:
    43%
    57%;

  column-gap: 4mm;

  align-items: start;

}


/* ============================================================
   LEFT SIDE
   ============================================================ */

.dc-left {

  font-size: 11px;

  line-height: 1.4;

}


.dc-label {

  font-weight: 700;

  text-decoration: underline;

  margin-bottom: 1mm;

}


.dc-company-name {

  font-weight: 600;

  margin: 0;

  line-height: 1.3;

}


.dc-address {

  white-space: pre-line;

  margin: 0;

  padding: 0;

  line-height: 1.35;

}


.dc-email {

  margin-top: 0.5mm;

  color: #0563c1;

  text-decoration: underline;

}


.dc-delivery-to {

  margin-top: 3.5mm;

}


.dc-delivery-to-name {

  font-weight: 600;

}


/* ============================================================
   INFO BOX
   ============================================================ */

.dc-info-box {

  width: 100%;

  border:
    0.6px
    solid
    #b8b8b8;

  margin: 0;

}


.dc-info-row {

  display: grid;

  grid-template-columns:
    50%
    50%;

  min-height: 8mm;

}


.dc-info-cell {

  border:
    0.6px
    solid
    #b8b8b8;

  display: flex;

  align-items: center;

  padding:
    1.5mm
    2mm;

  font-size: 10.5px;

}


.dc-info-label {

  font-weight: 600;

  text-align: right;

  justify-content: flex-end;

  padding-right: 3mm;

}


.dc-info-value {

  font-weight: 600;

  justify-content: flex-start;

  padding-left: 3mm;

}


/* ============================================================
   PRODUCTS
   ============================================================ */

.dc-products {

  margin-top: 5mm;

  width: 100%;

}


.dc-product-table {

  width: 100%;

  border-collapse: collapse;

  table-layout: fixed;

  margin: 0;

}


.dc-product-table col:nth-child(1) {
  width: 9%;
}


.dc-product-table col:nth-child(2) {
  width: 30%;
}


.dc-product-table col:nth-child(3) {
  width: 14%;
}


.dc-product-table col:nth-child(4) {
  width: 25%;
}


.dc-product-table col:nth-child(5) {
  width: 22%;
}


.dc-product-table th,
.dc-product-table td {

  border:
    0.6px
    solid
    #b8b8b8;

  padding:
    1.8mm
    2mm;

  font-size: 10.5px;

  vertical-align: top;

}


.dc-product-table th {

  font-weight: 700;

  text-align: center;

  vertical-align: middle;

}


.dc-product-table td {

  text-align: center;

}


.dc-product-name {

  text-align: center !important;

  font-weight: 500;

  vertical-align: top !important;

}


.dc-multi-line {

  min-height: 5mm;

  line-height: 1.4;

  text-align: center;

}


/* ============================================================
   SIGNATURE
   ============================================================ */

.dc-signatures {

  margin-top: 18mm;

  width: 100%;

  font-size: 11px;

}


.dc-signature-top {

  display: grid;

  grid-template-columns:
    1fr
    1fr;

  column-gap: 20mm;

  margin-bottom: 7mm;

}


.dc-signature-heading {

  font-weight: 500;

  white-space: nowrap;

}


.dc-signature-heading.right {

  text-align: right;

}


.dc-signature-bottom {

  display: grid;

  grid-template-columns:
    1fr
    1fr;

  column-gap: 30mm;

}


.dc-signature-block {

  min-height: 25mm;

  position: relative;

}


.dc-signature-name {

  font-size: 11px;

  margin-bottom: 2mm;

}


.dc-signature-line {

  width: 72mm;

  border-bottom:
    0.7px
    solid
    #333;

}


.dc-signature-line.right {

  margin-left: auto;

}


.demo-badge {
  background: #f59e0b;
  color: #fff;
  font-size: 8px;
  font-weight: 700;
  padding: 1mm 3mm;
  display: inline-block;
  border-radius: 2px;
  margin-left: 3mm;
  text-transform: uppercase;
}


@media print {

  html,
  body {

    width: 210mm;

    min-height: 297mm;

    margin: 0;

    padding: 0;

    background: #fff;

  }


  .dc-sheet {

    width: 210mm;

    min-height: 297mm;

    margin: 0;

    padding:
      10mm
      8mm
      10mm
      8mm;

    page-break-after: avoid;

  }

}

</style>

</head>


<body>

${content}

</body>

</html>

`)


    win.document.close()


    setTimeout(() => {

      win.focus()

      win.print()

    }, 500)

  }


  /* ============================================================
     GET MAC
     ============================================================ */

  function getMacLines(item) {

    if (!item)
      return []


    if (Array.isArray(item.mac))
      return item.mac


    if (
      typeof item.mac === 'string' &&
      item.mac.includes(',')
    ) {

      return item.mac
        .split(',')
        .map(x => x.trim())
        .filter(Boolean)

    }


    return item.mac
      ? [item.mac]
      : []

  }


  /* ============================================================
     GET SERIAL
     ============================================================ */

  function getSerialLines(item) {

    if (!item)
      return []


    if (Array.isArray(item.serial))
      return item.serial


    if (
      typeof item.serial === 'string' &&
      item.serial.includes(',')
    ) {

      return item.serial
        .split(',')
        .map(x => x.trim())
        .filter(Boolean)

    }


    return item.serial
      ? [item.serial]
      : []

  }


  /* ============================================================
     GROUP SAME PRODUCT
     ============================================================ */

  const groupedItems =
    useMemo(() => {

      const groups = []

      const map =
        new Map()


      rawItemsLoop:
      for (
        const item
        of (
          Array.isArray(doc.items)
            ? doc.items
            : []
        )
      ) {

        const key =
          `${item.category || ''}__${item.name || ''}`
            .toLowerCase()
            .trim()


        if (!map.has(key)) {

          const newGroup = {

            stockId:
              item.stockId || '',

            name:
              item.name || '',

            category:
              item.category || '',

            qty:
              0,

            macLines: [],

            serialLines: []

          }


          map.set(
            key,
            newGroup
          )

          groups.push(
            newGroup
          )

        }


        const group =
          map.get(key)


        group.qty +=
          Number(item.qty) || 0


        const macs =
          getMacLines(item)


        macs.forEach(
          (mac) => {

            if (mac)
              group.macLines.push(mac)

          }
        )


        const serials =
          getSerialLines(item)


        serials.forEach(
          (serial) => {

            if (serial)
              group.serialLines.push(
                serial
              )

          }
        )

      }


      return groups

    }, [doc.items])


  const printableItems =
    groupedItems.length > 0
      ? groupedItems
      : [
          {
            name: '',
            qty: '',
            macLines: [],
            serialLines: []
          }
        ]


  const companyName =
    doc.companyName ||
    COMPANY_NAME


  const companyAddress =
    COMPANY_ADDRESS


  const companyEmail =
    COMPANY_EMAIL


  const customerName =
    doc.customer?.name || ''


  const customerCompany =
    doc.customer?.company || ''


  const customerAddress =
    doc.customer?.address || ''


  const customerPhone =
    doc.customer?.phone || ''


  const docNumber =
    doc.ddcNumber || doc.dcNumber || ''


  return (

    <Modal
      title={`${type} — ${docNumber}`}
      onClose={onClose}
      wide
    >


      {/* BUTTONS */}

      <div className="flex gap-3 mb-4 no-print">

        <button
          onClick={handlePrint}
          className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-amber text-white text-sm font-medium py-2.5 hover:bg-amber-dark"
        >

          <Printer size={16} />

          Print / Save as PDF

        </button>


        <button
          onClick={onClose}
          className="px-5 rounded-lg border border-line text-ink text-sm font-medium py-2.5 hover:bg-paper"
        >

          Close

        </button>

      </div>


      {/* ========================================================
          PRINT CONTENT
          ======================================================== */}

      <div
        ref={printRef}
        style={{
          background: '#ffffff',
          padding: '0',
          overflow: 'hidden',
          width: '210mm',
          margin: '0 auto'
        }}
      >

        <div
          className="dc-sheet"
          style={{
            width: '210mm',
            minHeight: '297mm',
            margin: '0 auto',
            background: '#ffffff',
            padding: '10mm 8mm 10mm 8mm',
            boxSizing: 'border-box',
            color: '#111',
            fontFamily:
              'Arial, Helvetica, sans-serif',
            overflow: 'hidden'
          }}
        >


          {/* ====================================================
              TITLE
              ==================================================== */}

          <div
            className="dc-title"
            style={{
              textAlign: 'center',
              fontSize: '18px',
              lineHeight: '1',
              fontWeight: 700,
              textDecoration: 'underline',
              margin: '0 0 3mm 0'
            }}
          >

            DEMO DELIVERY CHALLAN

          </div>


          {/* ====================================================
              LOGO
              ==================================================== */}

          <img
            src={COMPANY_LOGO}
            alt="Pearl Networks"
            className="dc-logo"
            style={{
              width: '28mm',
              height: 'auto',
              objectFit: 'contain',
              display: 'block',
              margin: '0 0 -3mm 0'
            }}
          />


          {/* ====================================================
              HEADER
              ==================================================== */}

          <div
            className="dc-header"
            style={{
              display: 'grid',
              gridTemplateColumns:
                '43% 57%',
              columnGap: '4mm',
              alignItems: 'start'
            }}
          >


            {/* ==================================================
                LEFT
                ================================================== */}

            <div
              className="dc-left"
              style={{
                fontSize: '11px',
                lineHeight: 1.4
              }}
            >

              <div
                className="dc-address"
                style={{
                  whiteSpace:
                    'pre-line',
                  margin: 0,
                  padding: 0,
                  lineHeight: 1.35
                }}
              >

                {companyAddress}

              </div>


              <div
                className="dc-email"
                style={{
                  marginTop:
                    '0.5mm',
                  color:
                    '#0563c1',
                  textDecoration:
                    'underline'
                }}
              >

                {companyEmail}

              </div>


              {/* DELIVERY TO */}

              <div
                className="dc-delivery-to"
                style={{
                  marginTop:
                    '15.5mm'
                }}
              >

                <div
                  className="dc-label"
                  style={{
                    fontWeight: 700,
                    textDecoration:
                      'underline'
                  }}
                >

                  Delivery To:

                </div>


                <div
                  className="dc-delivery-to-name"
                  style={{
                    fontWeight: 600
                  }}
                >

                  {customerCompany
                    ? `M/S. ${customerCompany}`
                    : `M/S. ${customerName}`}

                </div>


                {!customerCompany &&
                  customerName && (

                    <div>
                      {customerName}
                    </div>

                  )}


                {customerAddress && (

                  <div
                    style={{
                      marginTop:
                        '1mm',
                      fontSize:
                        '10px'
                    }}
                  >

                    {customerAddress}

                  </div>

                )}


                {customerPhone && (

                  <div
                    style={{
                      fontSize:
                        '10px'
                    }}
                  >

                    Phone:
                    {' '}
                    {customerPhone}

                  </div>

                )}

              </div>

            </div>


            {/* ==================================================
                RIGHT INFO BOX
                ================================================== */}

            <div>

              <div
                className="dc-info-box"
                style={{
                  width: '100%',
                  border:
                    '0.6px solid #b8b8b8',
                  margin: 0
                }}
              >

                <div
                  className="dc-info-row"
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                      '50% 50%',
                    minHeight: '8mm'
                  }}
                >

                  <div
                    className="dc-info-cell dc-info-label"
                    style={{
                      border:
                        '0.6px solid #b8b8b8',
                      display:
                        'flex',
                      alignItems:
                        'center',
                      justifyContent:
                        'flex-end',
                      padding:
                        '1.5mm 3mm',
                      fontSize:
                        '10.5px',
                      fontWeight: 600
                    }}
                  >

                    Demo Challan No:

                  </div>


                  <div
                    className="dc-info-cell dc-info-value"
                    style={{
                      border:
                        '0.6px solid #b8b8b8',
                      display:
                        'flex',
                      alignItems:
                        'center',
                      justifyContent:
                        'flex-start',
                      padding:
                        '1.5mm 3mm',
                      fontSize:
                        '10.5px',
                      fontWeight: 600
                    }}
                  >

                    {docNumber}

                    <span className="demo-badge" style={{
                      background: '#f59e0b',
                      color: '#fff',
                      fontSize: '8px',
                      fontWeight: 700,
                      padding: '1mm 3mm',
                      display: 'inline-block',
                      borderRadius: '2px',
                      marginLeft: '3mm',
                      textTransform: 'uppercase'
                    }}>DEMO</span>

                  </div>

                </div>


                <div
                  className="dc-info-row"
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                      '50% 50%',
                    minHeight: '8mm'
                  }}
                >

                  <div
                    className="dc-info-cell dc-info-label"
                    style={{
                      border:
                        '0.6px solid #b8b8b8',
                      display:
                        'flex',
                      alignItems:
                        'center',
                      justifyContent:
                        'flex-end',
                      padding:
                        '1.5mm 3mm',
                      fontSize:
                        '10.5px',
                      fontWeight: 600
                    }}
                  >

                    Date:

                  </div>


                  <div
                    className="dc-info-cell dc-info-value"
                    style={{
                      border:
                        '0.6px solid #b8b8b8',
                      display:
                        'flex',
                      alignItems:
                        'center',
                      justifyContent:
                        'flex-start',
                      padding:
                        '1.5mm 3mm',
                      fontSize:
                        '10.5px',
                      fontWeight: 600
                    }}
                  >

                    {formatDate(doc.date)}

                  </div>

                </div>

              </div>

            </div>

          </div>


          {/* ====================================================
              PRODUCT TABLE
              ==================================================== */}

          <div
            className="dc-products"
            style={{
              marginTop: '5mm',
              width: '100%'
            }}
          >

            <table
              className="dc-product-table"
              style={{
                width: '100%',
                borderCollapse:
                  'collapse',
                tableLayout:
                  'fixed',
                margin: 0
              }}
            >

              <colgroup>

                <col
                  style={{
                    width: '9%'
                  }}
                />

                <col
                  style={{
                    width: '30%'
                  }}
                />

                <col
                  style={{
                    width: '14%'
                  }}
                />

                <col
                  style={{
                    width: '25%'
                  }}
                />

                <col
                  style={{
                    width: '22%'
                  }}
                />

              </colgroup>


              <thead>

                <tr>

                  <th
                    style={{
                      border:
                        '0.6px solid #b8b8b8',
                      padding:
                        '1.8mm 2mm',
                      fontSize:
                        '10.5px',
                      textAlign:
                        'center',
                      fontWeight: 700
                    }}
                  >
                    S.No.
                  </th>


                  <th
                    style={{
                      border:
                        '0.6px solid #b8b8b8',
                      padding:
                        '1.8mm 2mm',
                      fontSize:
                        '10.5px',
                      textAlign:
                        'center',
                      fontWeight: 700
                    }}
                  >
                    Product Name
                  </th>


                  <th
                    style={{
                      border:
                        '0.6px solid #b8b8b8',
                      padding:
                        '1.8mm 2mm',
                      fontSize:
                        '10.5px',
                      textAlign:
                        'center',
                      fontWeight: 700
                    }}
                  >
                    Quantity
                  </th>


                  <th
                    style={{
                      border:
                        '0.6px solid #b8b8b8',
                      padding:
                        '1.8mm 2mm',
                      fontSize:
                        '10.5px',
                      textAlign:
                        'center',
                      fontWeight: 700
                    }}
                  >
                    Mac Address
                  </th>


                  <th
                    style={{
                      border:
                        '0.6px solid #b8b8b8',
                      padding:
                        '1.8mm 2mm',
                      fontSize:
                        '10.5px',
                      textAlign:
                        'center',
                      fontWeight: 700
                    }}
                  >
                    Serial Number
                  </th>

                </tr>

              </thead>


              <tbody>

                {printableItems.map(
                  (item, index) => {

                    const macLines =
                      item.macLines ||
                      []

                    const serialLines =
                      item.serialLines ||
                      []


                    const maxLines =
                      Math.max(
                        1,
                        macLines.length,
                        serialLines.length
                      )


                    return (

                      <tr
                        key={`${item.name}-${index}`}
                      >

                        <td
                          style={{
                            border:
                              '0.6px solid #b8b8b8',
                            padding:
                              '1.8mm 2mm',
                            fontSize:
                              '10.5px',
                            textAlign:
                              'center',
                            verticalAlign:
                              'top'
                          }}
                        >

                          {index + 1}

                        </td>


                        <td
                          className="dc-product-name"
                          style={{
                            border:
                              '0.6px solid #b8b8b8',
                            padding:
                              '1.8mm 2mm',
                            fontSize:
                              '10.5px',
                            textAlign:
                              'center',
                            verticalAlign:
                              'top',
                            fontWeight: 500
                          }}
                        >

                          {item.name}

                        </td>


                        <td
                          style={{
                            border:
                              '0.6px solid #b8b8b8',
                            padding:
                              '1.8mm 2mm',
                            fontSize:
                              '10.5px',
                            textAlign:
                              'center',
                            verticalAlign:
                              'top'
                          }}
                        >

                          {item.qty}

                        </td>


                        <td
                          style={{
                            border:
                              '0.6px solid #b8b8b8',
                            padding:
                              '1.8mm 2mm',
                            fontSize:
                              '10.5px',
                            textAlign:
                              'center',
                            verticalAlign:
                              'top'
                          }}
                        >

                          {Array.from({
                            length:
                              maxLines
                          }).map(
                            (_, macIndex) => (

                              <div
                                key={`mac-${macIndex}`}
                                className="dc-multi-line"
                              >

                                {macLines[
                                  macIndex
                                ] || ''}

                              </div>

                            )
                          )}

                        </td>


                        <td
                          style={{
                            border:
                              '0.6px solid #b8b8b8',
                            padding:
                              '1.8mm 2mm',
                            fontSize:
                              '10.5px',
                            textAlign:
                              'center',
                            verticalAlign:
                              'top'
                          }}
                        >

                          {Array.from({
                            length:
                              maxLines
                          }).map(
                            (_, serialIndex) => (

                              <div
                                key={`serial-${serialIndex}`}
                                className="dc-multi-line"
                              >

                                {serialLines[
                                  serialIndex
                                ] || ''}

                              </div>

                            )
                          )}

                        </td>

                      </tr>

                    )

                  }
                )}

              </tbody>

            </table>

          </div>


          {/* ====================================================
              SIGNATURES
              ==================================================== */}

          <div
            className="dc-signatures"
            style={{
              marginTop: '18mm',
              width: '100%',
              fontSize: '11px'
            }}
          >

            <div
              className="dc-signature-top"
              style={{
                display: 'grid',
                gridTemplateColumns:
                  '1fr 1fr',
                columnGap: '20mm',
                marginBottom: '7mm'
              }}
            >

              <div
                className="dc-signature-heading"
                style={{
                  fontWeight: 500,
                  whiteSpace:
                    'nowrap'
                }}
              >

                Received In Sound Condition By:

              </div>


              <div
                className="dc-signature-heading right"
                style={{
                  fontWeight: 500,
                  whiteSpace:
                    'nowrap',
                  textAlign: 'right'
                }}
              >

                Delivered By:

              </div>

            </div>


            <div
              className="dc-signature-bottom"
              style={{
                display: 'grid',
                gridTemplateColumns:
                  '1fr 1fr',
                columnGap: '30mm'
              }}
            >

              <div
                className="dc-signature-block"
                style={{
                  minHeight:
                    '25mm'
                }}
              >

                <div
                  className="dc-signature-name"
                  style={{
                    fontSize:
                      '11px',
                    marginBottom:
                      '2mm'
                  }}
                >

                  Name:

                </div>


                <div
                  className="dc-signature-line"
                  style={{
                    width: '72mm',
                    borderBottom:
                      '0.7px solid #333'
                  }}
                />


                <div
                  style={{
                    marginTop:
                      '4mm',
                    fontSize:
                      '10px',
                    color: '#666'
                  }}
                >

                  Signature

                </div>

              </div>


              <div
                className="dc-signature-block"
                style={{
                  minHeight:
                    '25mm'
                }}
              >

                <div
                  className="dc-signature-line right"
                  style={{
                    width: '72mm',
                    borderBottom:
                      '0.7px solid #333',
                    marginLeft:
                      'auto'
                  }}
                />


                <div
                  style={{
                    marginTop:
                      '4mm',
                    fontSize:
                      '10px',
                    color: '#666',
                    textAlign:
                      'right'
                  }}
                >

                  Signature

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>


      {/* PRINT CSS */}

      <style
        dangerouslySetInnerHTML={{
          __html: `

@media print {

  .no-print {
    display: none !important;
  }

  .dc-sheet {
    box-shadow: none !important;
  }

  body {
    background: #fff !important;
  }

}

`
        }}
      />

    </Modal>

  )

}