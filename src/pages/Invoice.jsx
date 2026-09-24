
// import { useEffect, useMemo, useState } from 'react'
// import { ref, push, onValue, update, get, set, remove } from 'firebase/database'
// import {
//   Plus,
//   Trash2,
//   Receipt,
//   Pencil,
//   Printer,
//   X,
//   Save,
//   Download
// } from 'lucide-react'

// import { db } from '../firebase'
// import { useAuth } from '../context/AuthContext'
// import {
//   formatDate,
//   todayISO,
//   currency
// } from '../utils/helpers'

// import { Modal } from './Customers'
// import Loader from '../components/Loader'


// /* ============================================================
//    COMPANY INFORMATION
//    ============================================================ */

// const COMPANY_NAME = ''

// const COMPANY_LOGO = '/PN.png'

// const COMPANY_ADDRESS = `
// KCHS, Gohar Chamber, Office # 304,
// Shahra-e-Faisal, near Duty Free Shop,
// Karachi, 75600
// `

// const COMPANY_PHONE = '0341-1293604'

// const COMPANY_NTN = '-'

// const COMPANY_STRN = '-'


// /* ============================================================
//    INVOICE NUMBER GENERATOR
//    ============================================================ */

// function getTodayDateString() {
//   const today = new Date()
//   const year = today.getFullYear()
//   const month = String(today.getMonth() + 1).padStart(2, '0')
//   const day = String(today.getDate()).padStart(2, '0')

//   return `${year}${month}${day}`
// }


// async function getNextInvoiceNumber(companyId) {

//   try {

//     const dateStr = getTodayDateString()

//     const counterRef =
//       ref(
//         db,
//         `companies/${companyId}/counters/invoice`
//       )

//     const snapshot =
//       await get(counterRef)

//     let lastNumber = 0
//     let lastDate = ''

//     if (snapshot.exists()) {

//       const data = snapshot.val()

//       lastNumber =
//         data.number || 0

//       lastDate =
//         data.date || ''

//     }

//     let nextNumber =
//       lastNumber + 1

//     if (lastDate !== dateStr) {
//       nextNumber = 1
//     }

//     const padded =
//       String(nextNumber).padStart(4, '0')

//     return `INV-${dateStr}-${padded}`

//   } catch (error) {

//     console.error(
//       'Error getting invoice number:',
//       error
//     )

//     const dateStr =
//       getTodayDateString()

//     const timestamp =
//       Date.now().toString().slice(-6)

//     return `INV-${dateStr}-${timestamp}`

//   }

// }


// async function incrementInvoiceCounter(companyId) {

//   try {

//     const dateStr =
//       getTodayDateString()

//     const counterRef =
//       ref(
//         db,
//         `companies/${companyId}/counters/invoice`
//       )

//     const snapshot =
//       await get(counterRef)

//     let lastNumber = 0
//     let lastDate = ''

//     if (snapshot.exists()) {

//       const data =
//         snapshot.val()

//       lastNumber =
//         data.number || 0

//       lastDate =
//         data.date || ''

//     }

//     let newNumber =
//       lastNumber + 1

//     if (lastDate !== dateStr) {
//       newNumber = 1
//     }

//     await set(
//       counterRef,
//       {
//         date: dateStr,
//         number: newNumber
//       }
//     )

//     return {
//       number: newNumber,
//       date: dateStr
//     }

//   } catch (error) {

//     console.error(
//       'Error incrementing counter:',
//       error
//     )

//     return null

//   }

// }


// /* ============================================================
//    EMPTY PRODUCT
//    ============================================================ */

// const emptyItem = {
//   name: '',
//   qty: 1,
//   price: ''
// }


// /* ============================================================
//    MAIN INVOICE COMPONENT
//    ============================================================ */

// export default function Invoice() {

//   const { companyId } = useAuth()

//   const [customers, setCustomers] =
//     useState(null)

//   const [invoices, setInvoices] =
//     useState(null)

//   const [showForm, setShowForm] =
//     useState(false)

//   const [preview, setPreview] =
//     useState(null)

//   const [editingInvoice, setEditingInvoice] =
//     useState(null)

//   const [customerId, setCustomerId] =
//     useState('')

//   const [invoiceNumber, setInvoiceNumber] =
//     useState('')

//   /* ============================================================
//      NEW: INVOICE DATE
//      ============================================================ */

//   const [invoiceDate, setInvoiceDate] =
//     useState(todayISO())

//   const [poNumber, setPoNumber] =
//     useState('')

//   const [poDate, setPoDate] =
//     useState('')

//   const [items, setItems] =
//     useState([])

//   const [pick, setPick] =
//     useState({
//       ...emptyItem
//     })

//   const [saving, setSaving] =
//     useState(false)

//   const [error, setError] =
//     useState('')


//   /* ============================================================
//      DELETE CONFIRMATION
//      ============================================================ */

//   const [deleteConfirm, setDeleteConfirm] =
//     useState(null)

//   const [deleting, setDeleting] =
//     useState(false)


//   /* ============================================================
//      EDIT PRODUCT STATE
//      ============================================================ */

//   const [editingProductIndex, setEditingProductIndex] =
//     useState(null)

//   const [editProduct, setEditProduct] =
//     useState({
//       name: '',
//       qty: 1,
//       price: 0
//     })


//   /* ============================================================
//      LOAD CUSTOMERS AND INVOICES
//      ============================================================ */

//   useEffect(() => {

//     if (!companyId) {
//       return
//     }


//     const customersRef =
//       ref(
//         db,
//         `companies/${companyId}/customers`
//       )


//     const unsubscribeCustomers =
//       onValue(
//         customersRef,

//         (snapshot) => {

//           const value =
//             snapshot.val() || {}

//           const list =
//             Object.entries(value).map(
//               ([id, customer]) => ({
//                 id,
//                 ...customer
//               })
//             )

//           setCustomers(list)

//         },

//         (err) => {

//           console.error(
//             'Customers read failed:',
//             err
//           )

//           setCustomers([])

//         }
//       )


//     const invoicesRef =
//       ref(
//         db,
//         `companies/${companyId}/invoices`
//       )


//     const unsubscribeInvoices =
//       onValue(
//         invoicesRef,

//         (snapshot) => {

//           const value =
//             snapshot.val() || {}

//           const list =
//             Object.entries(value)
//               .map(
//                 ([id, invoice]) => ({
//                   id,
//                   ...invoice
//                 })
//               )
//               .sort(
//                 (a, b) =>
//                   (
//                     b.updatedAt ||
//                     b.createdAt ||
//                     0
//                   ) -
//                   (
//                     a.updatedAt ||
//                     a.createdAt ||
//                     0
//                   )
//               )

//           setInvoices(list)

//         },

//         (err) => {

//           console.error(
//             'Invoices read failed:',
//             err
//           )

//           setInvoices([])

//         }
//       )


//     return () => {

//       unsubscribeCustomers()
//       unsubscribeInvoices()

//     }

//   }, [companyId])


//   /* ============================================================
//      TOTAL
//      ============================================================ */

//   const total =
//     useMemo(() => {

//       return items.reduce(
//         (sum, item) => {

//           const qty =
//             Number(item.qty) || 0

//           const price =
//             Number(item.price) || 0

//           return (
//             sum +
//             qty * price
//           )

//         },
//         0
//       )

//     }, [items])


//   /* ============================================================
//      ADD PRODUCT
//      ============================================================ */

//   function addItem() {

//     if (!pick.name.trim()) {
//       return
//     }

//     const newItem = {

//       name:
//         pick.name.trim(),

//       qty:
//         Math.max(
//           1,
//           Number(pick.qty) || 1
//         ),

//       price:
//         Math.max(
//           0,
//           Number(pick.price) || 0
//         )

//     }

//     setItems(
//       previous => [
//         ...previous,
//         newItem
//       ]
//     )

//     setPick({
//       ...emptyItem
//     })

//   }


//   /* ============================================================
//      REMOVE PRODUCT
//      ============================================================ */

//   function removeItem(index) {

//     setItems(
//       previous =>
//         previous.filter(
//           (_, i) =>
//             i !== index
//         )
//     )

//   }


//   /* ============================================================
//      EDIT PRODUCT - OPEN
//      ============================================================ */

//   function openEditProduct(index) {

//     const item =
//       items[index]

//     setEditingProductIndex(index)

//     setEditProduct({
//       name: item.name,
//       qty: item.qty,
//       price: item.price
//     })

//   }


//   /* ============================================================
//      EDIT PRODUCT - SAVE
//      ============================================================ */

//   function saveEditProduct() {

//     if (!editProduct.name.trim()) {
//       return
//     }

//     const updatedItems =
//       [...items]

//     updatedItems[
//       editingProductIndex
//     ] = {
//       name:
//         editProduct.name.trim(),

//       qty:
//         Math.max(
//           1,
//           Number(editProduct.qty) || 1
//         ),

//       price:
//         Math.max(
//           0,
//           Number(editProduct.price) || 0
//         )
//     }

//     setItems(updatedItems)

//     setEditingProductIndex(null)

//     setEditProduct({
//       name: '',
//       qty: 1,
//       price: 0
//     })

//   }


//   /* ============================================================
//      EDIT PRODUCT - CLOSE
//      ============================================================ */

//   function closeEditProduct() {

//     setEditingProductIndex(null)

//     setEditProduct({
//       name: '',
//       qty: 1,
//       price: 0
//     })

//   }


//   /* ============================================================
//      RESET FORM
//      ============================================================ */

//   function resetForm() {

//     setCustomerId('')

//     setInvoiceNumber('')

//     /* NEW: RESET DATE TO TODAY */

//     setInvoiceDate(
//       todayISO()
//     )

//     setPoNumber('')

//     setPoDate('')

//     setItems([])

//     setPick({
//       ...emptyItem
//     })

//     setEditingInvoice(null)

//     setError('')

//     setEditingProductIndex(null)

//     setEditProduct({
//       name: '',
//       qty: 1,
//       price: 0
//     })

//   }


//   /* ============================================================
//      DELETE INVOICE
//      ============================================================ */

//   async function handleDeleteInvoice() {

//     if (
//       !companyId ||
//       !deleteConfirm
//     ) {
//       return
//     }

//     setDeleting(true)

//     try {

//       const invoiceRef =
//         ref(
//           db,
//           `companies/${companyId}/invoices/${deleteConfirm.id}`
//         )

//       await remove(invoiceRef)

//       setDeleteConfirm(null)

//     } catch (err) {

//       console.error(
//         'Invoice delete error:',
//         err
//       )

//       alert(
//         'Invoice delete nahi ho saka. Dobara koshish karein.'
//       )

//     } finally {

//       setDeleting(false)

//     }

//   }


//   /* ============================================================
//      OPEN NEW INVOICE
//      ============================================================ */

//   const openNewInvoice =
//     async () => {

//       resetForm()

//       /* NEW: DATE WILL BE ASKED, DEFAULT TODAY */

//       setInvoiceDate(
//         todayISO()
//       )

//       if (companyId) {

//         const number =
//           await getNextInvoiceNumber(
//             companyId
//           )

//         setInvoiceNumber(number)

//       }

//       setShowForm(true)

//     }


//   /* ============================================================
//      OPEN EDIT INVOICE
//      ============================================================ */

//   function openEditInvoice(invoice) {

//     setEditingInvoice(invoice)

//     setCustomerId(
//       invoice.customerId || ''
//     )

//     setInvoiceNumber(
//       invoice.invoiceNumber || ''
//     )

//     /* NEW: LOAD EXISTING INVOICE DATE */

//     setInvoiceDate(
//       invoice.date ||
//       todayISO()
//     )

//     setPoNumber(
//       invoice.poNumber || ''
//     )

//     setPoDate(
//       invoice.poDate || ''
//     )


//     setItems(
//       Array.isArray(invoice.items)
//         ? invoice.items.map(
//             item => ({
//               name:
//                 item.name || '',

//               qty:
//                 Number(item.qty) || 1,

//               price:
//                 Number(item.price) || 0
//             })
//           )
//         : []
//     )


//     setPick({
//       ...emptyItem
//     })

//     setError('')

//     setShowForm(true)

//   }


//   /* ============================================================
//      CLOSE FORM
//      ============================================================ */

//   function closeForm() {

//     if (saving) {
//       return
//     }

//     setShowForm(false)

//     resetForm()

//   }


//   /* ============================================================
//      SAVE / UPDATE INVOICE
//      ============================================================ */

//   async function handleSubmit(e) {

//     e.preventDefault()

//     setError('')


//     if (!companyId) {

//       setError(
//         'Company ID nahi mila.'
//       )

//       return

//     }


//     if (!customerId) {

//       setError(
//         'Customer select karein.'
//       )

//       return

//     }


//     /* NEW: DATE VALIDATION */

//     if (!invoiceDate) {

//       setError(
//         'Invoice date select karein.'
//       )

//       return

//     }


//     if (items.length === 0) {

//       setError(
//         'Kam az kam aik product add karein.'
//       )

//       return

//     }


//     const customer =
//       customers?.find(
//         c =>
//           c.id === customerId
//       )


//     if (!customer) {

//       setError(
//         'Customer nahi mila.'
//       )

//       return

//     }


//     setSaving(true)


//     try {

//       let finalInvoiceNumber =
//         invoiceNumber


//       if (!editingInvoice) {

//         await incrementInvoiceCounter(
//           companyId
//         )


//         if (
//           !finalInvoiceNumber ||
//           finalInvoiceNumber.trim() === ''
//         ) {

//           const dateStr =
//             getTodayDateString()

//           const timestamp =
//             Date.now()
//               .toString()
//               .slice(-6)

//           finalInvoiceNumber =
//             `INV-${dateStr}-${timestamp}`

//           setInvoiceNumber(
//             finalInvoiceNumber
//           )

//         }

//       }


//       /* ========================================================
//          UPDATE EXISTING INVOICE
//          ======================================================== */

//       if (editingInvoice) {

//         const invoiceRef =
//           ref(
//             db,
//             `companies/${companyId}/invoices/${editingInvoice.id}`
//           )


//         const updatedInvoice = {

//           invoiceNumber:
//             finalInvoiceNumber,

//           /* NEW: USE SELECTED DATE */

//           date:
//             invoiceDate,

//           poNumber:
//             poNumber || '',

//           poDate:
//             poDate || '',

//           customerId:
//             customerId,

//           customerName:
//             customer.name || '',

//           customerCompany:
//             customer.company || '',

//           customerPhone:
//             customer.phone || '',

//           customerAddress:
//             customer.address || '',

//           companyName:
//             COMPANY_NAME,

//           companyLogo:
//             COMPANY_LOGO,

//           companyAddress:
//             COMPANY_ADDRESS,

//           companyPhone:
//             COMPANY_PHONE,

//           companyNTN:
//             COMPANY_NTN,

//           companySTRN:
//             COMPANY_STRN,

//           items:
//             items,

//           total:
//             total,

//           updatedAt:
//             Date.now()

//         }


//         await update(
//           invoiceRef,
//           updatedInvoice
//         )


//         setShowForm(false)

//         resetForm()


//         setPreview({

//           id:
//             editingInvoice.id,

//           invoiceNumber:
//             updatedInvoice.invoiceNumber,

//           date:
//             updatedInvoice.date,

//           poNumber:
//             updatedInvoice.poNumber,

//           poDate:
//             updatedInvoice.poDate,

//           items:
//             updatedInvoice.items,

//           total:
//             updatedInvoice.total,

//           companyName:
//             COMPANY_NAME,

//           companyLogo:
//             COMPANY_LOGO,

//           companyAddress:
//             COMPANY_ADDRESS,

//           companyPhone:
//             COMPANY_PHONE,

//           companyNTN:
//             COMPANY_NTN,

//           companySTRN:
//             COMPANY_STRN,

//           customer: {

//             name:
//               updatedInvoice.customerName,

//             company:
//               updatedInvoice.customerCompany,

//             phone:
//               updatedInvoice.customerPhone,

//             address:
//               updatedInvoice.customerAddress

//           }

//         })

//         return

//       }


//       /* ========================================================
//          CREATE NEW INVOICE
//          ======================================================== */

//       const date =
//         invoiceDate


//       const invoiceData = {

//         invoiceNumber:
//           finalInvoiceNumber,

//         /* NEW: SELECTED DATE */

//         date:
//           date,

//         poNumber:
//           poNumber || '',

//         poDate:
//           poDate || '',

//         customerId:
//           customerId,

//         customerName:
//           customer.name || '',

//         customerCompany:
//           customer.company || '',

//         customerPhone:
//           customer.phone || '',

//         customerAddress:
//           customer.address || '',

//         companyName:
//           COMPANY_NAME,

//         companyLogo:
//           COMPANY_LOGO,

//         companyAddress:
//           COMPANY_ADDRESS,

//         companyPhone:
//           COMPANY_PHONE,

//         companyNTN:
//           COMPANY_NTN,

//         companySTRN:
//           COMPANY_STRN,

//         items:
//           items,

//         total:
//           total,

//         createdAt:
//           Date.now()

//       }


//       const invoicesRef =
//         ref(
//           db,
//           `companies/${companyId}/invoices`
//         )


//       const newInvoice =
//         await push(
//           invoicesRef,
//           invoiceData
//         )


//       setPreview({

//         id:
//           newInvoice.key,

//         invoiceNumber:
//           finalInvoiceNumber,

//         date:
//           date,

//         poNumber:
//           invoiceData.poNumber,

//         poDate:
//           invoiceData.poDate,

//         items:
//           invoiceData.items,

//         total:
//           invoiceData.total,

//         companyName:
//           COMPANY_NAME,

//         companyLogo:
//           COMPANY_LOGO,

//         companyAddress:
//           COMPANY_ADDRESS,

//         companyPhone:
//           COMPANY_PHONE,

//         companyNTN:
//           COMPANY_NTN,

//         companySTRN:
//           COMPANY_STRN,

//         customer: {

//           name:
//             invoiceData.customerName,

//           company:
//             invoiceData.customerCompany,

//           phone:
//             invoiceData.customerPhone,

//           address:
//             invoiceData.customerAddress

//         }

//       })


//       setShowForm(false)

//       resetForm()


//     } catch (err) {

//       console.error(
//         'Invoice save error:',
//         err
//       )

//       setError(
//         err?.message ||
//         'Invoice save nahi ho saka. Dobara koshish karein.'
//       )

//     } finally {

//       setSaving(false)

//     }

//   }


//   /* ============================================================
//      DOWNLOAD PDF
//      ============================================================ */

//   function handleDownloadPdf(invoice) {

//     const previewInvoice =
//       convertInvoiceToPreview(
//         invoice
//       )

//     setPreview(
//       previewInvoice
//     )

//   }


//   /* ============================================================
//      PAGE
//      ============================================================ */

//   return (

//     <>

//       <div>

//         {/* HEADER */}

//         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">

//           <div>

//             <h1 className="font-display text-2xl font-semibold text-ink">
//               Invoice
//             </h1>

//             <p className="text-sm text-slateink mt-0.5">
//               Enter the product name, quantity, and price to create an invoice.
//             </p>

//           </div>


//           <button
//             onClick={openNewInvoice}
//             className="flex items-center gap-2 rounded-lg bg-ink text-white text-sm font-medium px-4 py-2.5 hover:bg-inkSoft transition-colors self-start"
//           >

//             <Plus size={16} />

//             New Invoice

//           </button>

//         </div>


//         {/* INVOICE LIST */}

//         {invoices === null ? (

//           <Loader />

//         ) : invoices.length === 0 ? (

//           <div className="border border-dashed border-line rounded-2xl py-16 flex flex-col items-center justify-center text-center">

//             <Receipt
//               className="text-slateink mb-3"
//               size={28}
//             />

//             <p className="font-medium text-ink">
//               Abhi tak koi invoice nahi bana
//             </p>

//           </div>

//         ) : (

//           <div className="bg-surface rounded-2xl border border-line shadow-card overflow-hidden">

//             <div className="overflow-x-auto">

//               <table className="w-full text-sm">

//                 <thead>

//                   <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-slateink">

//                     <th className="px-4 py-3 font-medium">
//                       Invoice #
//                     </th>

//                     <th className="px-4 py-3 font-medium">
//                       Customer
//                     </th>

//                     <th className="px-4 py-3 font-medium">
//                       Total
//                     </th>

//                     <th className="px-4 py-3 font-medium">
//                       Date
//                     </th>

//                     <th className="px-4 py-3 font-medium text-right">
//                       Action
//                     </th>

//                   </tr>

//                 </thead>


//                 <tbody>

//                   {invoices.map(
//                     invoice => (

//                       <tr
//                         key={invoice.id}
//                         className="border-b border-line last:border-0 hover:bg-paper/60"
//                       >

//                         <td className="px-4 py-3 font-mono text-xs">
//                           {invoice.invoiceNumber}
//                         </td>


//                         <td className="px-4 py-3">

//                           <p className="font-medium text-ink">
//                             {invoice.customerName}
//                           </p>

//                           <p className="text-xs text-slateink">
//                             {invoice.customerCompany}
//                           </p>

//                         </td>


//                         <td className="px-4 py-3 font-medium text-ink">

//                           Rs{' '}

//                           {currency(
//                             invoice.total
//                           )}

//                         </td>


//                         <td className="px-4 py-3 text-xs font-mono text-slateink">

//                           {formatDate(
//                             invoice.date
//                           )}

//                         </td>


//                         <td className="px-4 py-3">

//                           <div className="flex items-center justify-end gap-2 flex-wrap">

//                             <button
//                               onClick={() =>
//                                 setPreview(
//                                   convertInvoiceToPreview(
//                                     invoice
//                                   )
//                                 )
//                               }
//                               className="text-teal-dark text-xs font-medium hover:underline"
//                             >
//                               View
//                             </button>


//                             <button
//                               onClick={() =>
//                                 openEditInvoice(
//                                   invoice
//                                 )
//                               }
//                               className="inline-flex items-center gap-1.5 text-xs font-medium text-ink hover:text-teal-dark"
//                             >

//                               <Pencil size={13} />

//                               Edit

//                             </button>


//                             <button
//                               onClick={() =>
//                                 handleDownloadPdf(
//                                   invoice
//                                 )
//                               }
//                               className="inline-flex items-center gap-1.5 text-xs font-medium text-red-600 hover:text-red-800"
//                             >

//                               <Download size={13} />

//                               PDF

//                             </button>


//                             <button
//                               onClick={() =>
//                                 setDeleteConfirm(
//                                   invoice
//                                 )
//                               }
//                               className="inline-flex items-center gap-1.5 text-xs font-medium text-coral hover:text-red-700"
//                             >

//                               <Trash2 size={13} />

//                               Delete

//                             </button>

//                           </div>

//                         </td>

//                       </tr>

//                     )
//                   )}

//                 </tbody>

//               </table>

//             </div>

//           </div>

//         )}


//         {/* CREATE / EDIT MODAL */}

//         {showForm && (

//           <Modal
//             title={
//               editingInvoice
//                 ? `Edit Invoice ${editingInvoice.invoiceNumber}`
//                 : 'New Invoice'
//             }
//             onClose={closeForm}
//             wide
//           >

//             <form
//               onSubmit={handleSubmit}
//               className="space-y-5"
//             >


//               {/* =================================================
//                   INVOICE NUMBER + DATE
//                   ================================================= */}

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

//                 <label className="block">

//                   <span className="text-xs font-medium text-slateink">
//                     Invoice Number *
//                   </span>

//                   <input
//                     type="text"
//                     value={invoiceNumber}
//                     onChange={(e) =>
//                       setInvoiceNumber(
//                         e.target.value
//                       )
//                     }
//                     className="input mt-1"
//                     placeholder="INV-YYYYMMDD-0001"
//                     required
//                   />

//                   <small className="text-xs text-slateink mt-1 block">
//                     Format: INV-YYYYMMDD-0001 (Auto-generated)
//                   </small>

//                 </label>


//                 {/* =================================================
//                     NEW: INVOICE DATE
//                     ================================================= */}

//                 <label className="block">

//                   <span className="text-xs font-medium text-slateink">
//                     Invoice Date *
//                   </span>

//                   <input
//                     type="date"
//                     value={invoiceDate}
//                     onChange={(e) =>
//                       setInvoiceDate(
//                         e.target.value
//                       )
//                     }
//                     className="input mt-1"
//                     required
//                   />

//                 </label>

//               </div>


//               {/* =================================================
//                   CUSTOMER
//                   ================================================= */}

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

//                 <label className="block">

//                   <span className="text-xs font-medium text-slateink">
//                     Customer *
//                   </span>

//                   <select
//                     value={customerId}
//                     onChange={(e) =>
//                       setCustomerId(
//                         e.target.value
//                       )
//                     }
//                     className="input mt-1"
//                     required
//                   >

//                     <option value="">
//                       Select customer…
//                     </option>

//                     {(customers || []).map(
//                       customer => (

//                         <option
//                           key={customer.id}
//                           value={customer.id}
//                         >

//                           {customer.name}

//                           {customer.company
//                             ? ` — ${customer.company}`
//                             : ''}

//                         </option>

//                       )
//                     )}

//                   </select>

//                 </label>

//               </div>


//               {/* =================================================
//                   PO NUMBER + PO DATE
//                   ================================================= */}

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

//                 <label className="block">

//                   <span className="text-xs font-medium text-slateink">
//                     P/Order No.
//                   </span>

//                   <input
//                     type="text"
//                     value={poNumber}
//                     onChange={(e) =>
//                       setPoNumber(
//                         e.target.value
//                       )
//                     }
//                     className="input mt-1"
//                     placeholder="P/Order No."
//                   />

//                 </label>


//                 <label className="block">

//                   <span className="text-xs font-medium text-slateink">
//                     P/Order Date
//                   </span>

//                   <input
//                     type="date"
//                     value={poDate}
//                     onChange={(e) =>
//                       setPoDate(
//                         e.target.value
//                       )
//                     }
//                     className="input mt-1"
//                   />

//                 </label>

//               </div>


//               {/* =================================================
//                   PRODUCTS
//                   ================================================= */}

//               <div className="border border-line rounded-xl p-4">

//                 <p className="text-xs font-medium text-slateink mb-3">
//                   Add Products
//                 </p>


//                 <div className="flex flex-col sm:flex-row gap-2">

//                   <input
//                     value={pick.name}
//                     onChange={(e) =>
//                       setPick({
//                         ...pick,
//                         name:
//                           e.target.value
//                       })
//                     }
//                     className="input flex-1"
//                     placeholder="Product name / model"
//                   />


//                   <input
//                     type="number"
//                     min={1}
//                     value={pick.qty}
//                     onChange={(e) =>
//                       setPick({
//                         ...pick,
//                         qty:
//                           e.target.value
//                       })
//                     }
//                     className="input sm:w-24"
//                     placeholder="Qty"
//                   />


//                   <input
//                     type="number"
//                     min={0}
//                     step="0.01"
//                     value={pick.price}
//                     onChange={(e) =>
//                       setPick({
//                         ...pick,
//                         price:
//                           e.target.value
//                       })
//                     }
//                     className="input sm:w-32"
//                     placeholder="Unit Price"
//                   />


//                   <button
//                     type="button"
//                     onClick={addItem}
//                     disabled={!pick.name.trim()}
//                     className="rounded-lg bg-teal text-white text-sm font-medium px-4 py-2.5 hover:bg-teal-dark disabled:opacity-50 shrink-0"
//                   >

//                     Add

//                   </button>

//                 </div>


//                 {/* PRODUCTS ADDED */}

//                 {items.length > 0 && (

//                   <div className="mt-4 space-y-2">

//                     {items.map(
//                       (
//                         item,
//                         index
//                       ) => (

//                         <div
//                           key={index}
//                           className="flex items-center justify-between bg-paper rounded-lg px-3 py-2 text-sm"
//                         >

//                           <div>

//                             <span className="font-medium text-ink">
//                               {item.name}
//                             </span>

//                             <span className="text-xs text-slateink ml-2">
//                               x{item.qty}
//                             </span>

//                             <span className="text-xs text-slateink ml-2">
//                               @ Rs{' '}
//                               {currency(
//                                 item.price
//                               )}
//                             </span>

//                           </div>


//                           <div className="flex items-center gap-2">

//                             <button
//                               type="button"
//                               onClick={() =>
//                                 openEditProduct(
//                                   index
//                                 )
//                               }
//                               className="text-blue-600 hover:text-blue-800"
//                             >

//                               <Pencil size={15} />

//                             </button>


//                             <button
//                               type="button"
//                               onClick={() =>
//                                 removeItem(
//                                   index
//                                 )
//                               }
//                               className="text-coral hover:text-red-700"
//                             >

//                               <Trash2 size={15} />

//                             </button>

//                           </div>

//                         </div>

//                       )
//                     )}


//                     <div className="flex justify-end pt-3">

//                       <div className="text-right">

//                         <p className="text-xs text-slateink">
//                           Total
//                         </p>

//                         <p className="text-lg font-bold text-ink">

//                           Rs{' '}

//                           {currency(
//                             total
//                           )}

//                         </p>

//                       </div>

//                     </div>

//                   </div>

//                 )}

//               </div>


//               {/* ERROR */}

//               {error && (

//                 <p className="text-xs font-medium text-coral bg-coral-light rounded-lg px-3 py-2">
//                   {error}
//                 </p>

//               )}


//               {/* SAVE BUTTON */}

//               <button
//                 type="submit"
//                 disabled={
//                   saving ||
//                   !customerId ||
//                   !invoiceDate ||
//                   items.length === 0
//                 }
//                 className="w-full rounded-lg bg-ink text-white text-sm font-medium py-2.5 hover:bg-inkSoft transition-colors disabled:opacity-60"
//               >

//                 {saving
//                   ? editingInvoice
//                     ? 'Updating…'
//                     : 'Saving…'
//                   : editingInvoice
//                   ? 'Update Invoice'
//                   : 'Generate Invoice'}

//               </button>

//             </form>

//           </Modal>

//         )}

//       </div>


//       {/* PREVIEW */}

//       {preview && (

//         <InvoicePreview
//           invoice={preview}
//           onClose={() =>
//             setPreview(null)
//           }
//         />

//       )}


//       {/* DELETE CONFIRMATION */}

//       {deleteConfirm && (

//         <div className="fixed inset-0 z-[99999] bg-black/60 flex items-center justify-center p-4">

//           <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">

//             <div className="flex items-center justify-between mb-4">

//               <h3 className="text-lg font-semibold text-ink">
//                 Delete Invoice
//               </h3>

//               <button
//                 onClick={() =>
//                   setDeleteConfirm(null)
//                 }
//                 className="text-slateink hover:text-ink"
//               >

//                 <X size={20} />

//               </button>

//             </div>


//             <div className="space-y-4">

//               <p className="text-sm text-ink">
//                 Kya aap ye invoice delete karna chahte hain?
//               </p>

//               <div className="bg-paper rounded-lg p-3 text-sm">

//                 <p className="font-medium text-ink">
//                   {deleteConfirm.invoiceNumber}
//                 </p>

//                 <p className="text-slateink text-xs">
//                   {deleteConfirm.customerName}
//                 </p>

//                 <p className="text-slateink text-xs">
//                   Total: Rs {currency(deleteConfirm.total || 0)}
//                 </p>

//               </div>


//               <div className="flex gap-3">

//                 <button
//                   onClick={() =>
//                     setDeleteConfirm(null)
//                   }
//                   className="flex-1 rounded-lg border border-line text-ink text-sm font-medium py-2.5 hover:bg-paper transition-colors"
//                 >
//                   Cancel
//                 </button>


//                 <button
//                   onClick={handleDeleteInvoice}
//                   disabled={deleting}
//                   className="flex-1 rounded-lg bg-coral text-white text-sm font-medium py-2.5 hover:bg-red-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
//                 >

//                   {deleting ? (
//                     'Deleting…'
//                   ) : (
//                     <>
//                       <Trash2 size={16} />
//                       Delete
//                     </>
//                   )}

//                 </button>

//               </div>

//             </div>

//           </div>

//         </div>

//       )}


//       {/* EDIT PRODUCT MODAL */}

//       {editingProductIndex !== null && (

//         <div className="fixed inset-0 z-[99999] bg-black/60 flex items-center justify-center p-4">

//           <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">

//             <div className="flex items-center justify-between mb-4">

//               <h3 className="text-lg font-semibold text-ink">
//                 Edit Product
//               </h3>

//               <button
//                 onClick={closeEditProduct}
//                 className="text-slateink hover:text-ink"
//               >

//                 <X size={20} />

//               </button>

//             </div>


//             <div className="space-y-3">

//               <div>

//                 <label className="text-xs font-medium text-slateink">
//                   Product Name
//                 </label>

//                 <input
//                   type="text"
//                   value={editProduct.name}
//                   onChange={(e) =>
//                     setEditProduct({
//                       ...editProduct,
//                       name:
//                         e.target.value
//                     })
//                   }
//                   className="input mt-1 w-full"
//                   placeholder="Product name"
//                 />

//               </div>


//               <div className="grid grid-cols-2 gap-3">

//                 <div>

//                   <label className="text-xs font-medium text-slateink">
//                     Quantity
//                   </label>

//                   <input
//                     type="number"
//                     min={1}
//                     value={editProduct.qty}
//                     onChange={(e) =>
//                       setEditProduct({
//                         ...editProduct,
//                         qty:
//                           Number(
//                             e.target.value
//                           ) || 1
//                       })
//                     }
//                     className="input mt-1 w-full"
//                   />

//                 </div>


//                 <div>

//                   <label className="text-xs font-medium text-slateink">
//                     Unit Price
//                   </label>

//                   <input
//                     type="number"
//                     min={0}
//                     step="0.01"
//                     value={editProduct.price}
//                     onChange={(e) =>
//                       setEditProduct({
//                         ...editProduct,
//                         price:
//                           Number(
//                             e.target.value
//                           ) || 0
//                       })
//                     }
//                     className="input mt-1 w-full"
//                   />

//                 </div>

//               </div>


//               <button
//                 onClick={saveEditProduct}
//                 disabled={
//                   !editProduct.name.trim()
//                 }
//                 className="w-full rounded-lg bg-blue-600 text-white text-sm font-medium py-2.5 hover:bg-blue-700 transition-colors disabled:opacity-50 mt-2 flex items-center justify-center gap-2"
//               >

//                 <Save size={16} />

//                 Save Product

//               </button>

//             </div>

//           </div>

//         </div>

//       )}

//     </>

//   )

// }


// /* ================================================================
//    CONVERT FIREBASE INVOICE
//    ================================================================ */

// function convertInvoiceToPreview(invoice) {

//   return {

//     id:
//       invoice.id,

//     invoiceNumber:
//       invoice.invoiceNumber,

//     date:
//       invoice.date,

//     poNumber:
//       invoice.poNumber || '',

//     poDate:
//       invoice.poDate || '',

//     items:
//       invoice.items || [],

//     total:
//       Number(
//         invoice.total || 0
//       ),

//     companyName:
//       invoice.companyName ||
//       COMPANY_NAME,

//     companyLogo:
//       invoice.companyLogo ||
//       COMPANY_LOGO,

//     companyAddress:
//       invoice.companyAddress ||
//       COMPANY_ADDRESS,

//     companyPhone:
//       invoice.companyPhone ||
//       COMPANY_PHONE,

//     companyNTN:
//       invoice.companyNTN ||
//       COMPANY_NTN,

//     companySTRN:
//       invoice.companySTRN ||
//       COMPANY_STRN,

//     customer: {

//       name:
//         invoice.customerName || '',

//       company:
//         invoice.customerCompany || '',

//       phone:
//         invoice.customerPhone || '',

//       address:
//         invoice.customerAddress || ''

//     }

//   }

// }


// /* ================================================================
//    INVOICE PREVIEW
//    ================================================================ */

// function InvoicePreview({
//   invoice,
//   onClose
// }) {

//   function printInvoice() {

//     window.print()

//   }


//   return (

//     <div className="invoice-preview-overlay fixed inset-0 z-[9999] bg-black/60 overflow-y-auto p-4 sm:p-8">


//       {/* TOP CONTROLS */}

//       <div className="invoice-preview-controls max-w-[900px] mx-auto mb-4 flex items-center justify-between">

//         <div>

//           <p className="text-white font-semibold text-sm">
//             Invoice Preview
//           </p>

//           <p className="text-white/70 text-xs">
//             {invoice.invoiceNumber}
//           </p>

//         </div>


//         <div className="flex items-center gap-2">

//           <button
//             onClick={printInvoice}
//             className="inline-flex items-center gap-2 rounded-lg bg-white text-ink px-4 py-2 text-sm font-medium hover:bg-gray-100"
//           >

//             <Printer size={16} />

//             Print / Save as PDF

//           </button>


//           <button
//             onClick={onClose}
//             className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-white/10 text-white hover:bg-white/20"
//           >

//             <X size={18} />

//           </button>

//         </div>

//       </div>


//       {/* PRINT AREA */}

//       <div
//         className="invoice-print-area"
//         id="invoice-print-area"
//       >

//         <div className="invoice-sheet">


//           {/* HEADER */}

//           <div className="invoice-header">


//             {/* COMPANY */}

//             <div className="invoice-company">

//               <img
//                 src={
//                   invoice.companyLogo ||
//                   COMPANY_LOGO
//                 }
//                 alt="Company Logo"
//                 className="invoice-logo"
//                 onError={(e) => {

//                   e.currentTarget.style.display =
//                     'none'

//                 }}
//               />

//               {(invoice.companyName || COMPANY_NAME) && (

//                 <div className="invoice-company-name">

//                   {invoice.companyName ||
//                     COMPANY_NAME}

//                 </div>

//               )}


//               <div className="invoice-company-address">

//                 {invoice.companyAddress ||
//                   COMPANY_ADDRESS}

//               </div>


//               {invoice.companyPhone && (

//                 <div className="invoice-company-address">

//                   {invoice.companyPhone}

//                 </div>

//               )}

//             </div>


//             {/* RIGHT SIDE */}

//             <div className="invoice-right-header">

//               <div className="invoice-tax-box">

//                 <div>
//                   NTN # {invoice.companyNTN || COMPANY_NTN}
//                 </div>

//                 <div>
//                   STRN # {invoice.companySTRN || COMPANY_STRN}
//                 </div>


//                 <div className="invoice-title">
//                   INVOICE
//                 </div>

//               </div>


//               <div className="invoice-meta-box">

//                 <div className="invoice-meta-title">
//                   Invoice No.
//                 </div>


//                 <div className="invoice-number">

//                   {invoice.invoiceNumber}

//                 </div>


//                 <div className="invoice-meta-row">

//                   <span>
//                     Date:
//                   </span>

//                   <span>

//                     {formatInvoiceDate(
//                       invoice.date
//                     )}

//                   </span>

//                 </div>


//                 <div className="invoice-meta-row">

//                   <span>
//                     P/Order No.
//                   </span>

//                   <span>
//                     {invoice.poNumber || ''}
//                   </span>

//                 </div>


//                 <div className="invoice-meta-row">

//                   <span>
//                     P/Order Date
//                   </span>

//                   <span>

//                     {invoice.poDate
//                       ? formatInvoiceDate(
//                           invoice.poDate
//                         )
//                       : ''}

//                   </span>

//                 </div>

//               </div>

//             </div>

//           </div>


//           {/* BUYER */}

//           <div className="invoice-buyer-box">

//             <div className="invoice-buyer-title">

//               Buyer's Name & Address

//             </div>


//             <div className="invoice-buyer-content">

//               <div className="invoice-buyer-name">

//                 {invoice.customer?.name || ''}

//               </div>


//               {invoice.customer?.company && (

//                 <div>
//                   {invoice.customer.company}
//                 </div>

//               )}


//               {invoice.customer?.address && (

//                 <div>
//                   {invoice.customer.address}
//                 </div>

//               )}


//               {invoice.customer?.phone && (

//                 <div>
//                   {invoice.customer.phone}
//                 </div>

//               )}

//             </div>

//           </div>


//           {/* PRODUCT TABLE */}

//           <table className="invoice-table">

//             <colgroup>

//               <col className="qty-col" />

//               <col className="unit-col" />

//               <col className="description-col" />

//               <col className="price-col" />

//               <col className="amount-col" />

//             </colgroup>


//             <thead>

//               <tr>

//                 <th>
//                   Quantity
//                 </th>

//                 <th>
//                   Unit
//                 </th>

//                 <th>
//                   Description Of Goods
//                 </th>

//                 <th>
//                   Unit Price
//                 </th>

//                 <th>
//                   Amount
//                 </th>

//               </tr>

//             </thead>


//             <tbody>

//               {(invoice.items || []).map(
//                 (
//                   item,
//                   index
//                 ) => {

//                   const qty =
//                     Number(
//                       item.qty || 0
//                     )

//                   const price =
//                     Number(
//                       item.price || 0
//                     )

//                   const amount =
//                     qty * price


//                   return (

//                     <tr key={index}>

//                       <td className="quantity-cell">
//                         {qty}
//                       </td>

//                       <td>
//                         PCS
//                       </td>

//                       <td className="description-cell">
//                         {item.name}
//                       </td>

//                       <td className="number-cell">
//                         {currency(price)}
//                       </td>

//                       <td className="number-cell">
//                         {currency(amount)}
//                       </td>

//                     </tr>

//                   )

//                 }
//               )}


//               {Array.from({

//                 length:
//                   Math.max(
//                     3,
//                     8 -
//                       (
//                         invoice.items?.length ||
//                         0
//                       )
//                   )

//               }).map(
//                 (
//                   _,
//                   index
//                 ) => (

//                   <tr
//                     key={`empty-${index}`}
//                     className="invoice-empty-row"
//                   >

//                     <td></td>
//                     <td></td>
//                     <td></td>
//                     <td></td>
//                     <td></td>

//                   </tr>

//                 )
//               )}

//             </tbody>

//           </table>


//           {/* TOTAL */}

//           <div className="invoice-total-wrapper">

//             <div className="invoice-total-label">
//               Total
//             </div>

//             <div className="invoice-total-value">

//               {currency(
//                 invoice.total || 0
//               )}

//             </div>

//           </div>


//           {/* FOOTER */}

//           <div className="invoice-footer-note">

//             <p className="text-center text-[9px] text-gray-500 mt-4 pt-2 border-t border-gray-300">

//               Note: This is a computer generated invoice, does not require any stamp or signature.

//             </p>

//           </div>


//         </div>

//       </div>

//     </div>

//   )

// }


// /* ================================================================
//    DATE FORMAT
//    ================================================================ */

// function formatInvoiceDate(value) {

//   if (!value) {
//     return ''
//   }

//   const date =
//     new Date(value)

//   if (
//     Number.isNaN(
//       date.getTime()
//     )
//   ) {

//     return value

//   }


//   const day =
//     String(
//       date.getDate()
//     ).padStart(
//       2,
//       '0'
//     )

//   const month =
//     String(
//       date.getMonth() + 1
//     ).padStart(
//       2,
//       '0'
//     )

//   const year =
//     date.getFullYear()

//   return `${day}/${month}/${year}`

// }


// /* ================================================================
//    INVOICE CSS
//    ================================================================ */

// const invoicePrintStyles = `

// .invoice-sheet {

//   width: 210mm;

//   min-height: 297mm;

//   background: #ffffff;

//   margin: 0 auto;

//   padding: 15mm 17mm;

//   box-sizing: border-box;

//   color: #111111;

//   font-family:
//     Arial,
//     Helvetica,
//     sans-serif;

// }


// .invoice-header {

//   display: flex;

//   justify-content: space-between;

//   align-items: flex-start;

//   min-height: 55mm;

// }


// .invoice-company {

//   width: 53%;

// }


// .invoice-logo {

//   width: 42mm;

//   height: 25mm;

//   object-fit: contain;

//   object-position: left center;

//   display: block;

//   margin-bottom: 0.5mm;

// }


// .invoice-company-name {

//   font-size: 16px;

//   font-weight: 700;

//   margin-bottom: 1mm;

// }


// .invoice-company-address {

//   white-space: pre-line;

//   font-size: 10px;

//   line-height: 1.4;

// }


// .invoice-right-header {

//   width: 40%;

//   padding-top: 2mm;

// }


// .invoice-tax-box {

//   border: 1px solid #222;

//   padding: 2.5mm 2mm;

//   font-size: 10px;

//   line-height: 1.5;

// }


// .invoice-title {

//   font-size: 14px;

//   font-weight: 700;

//   margin-top: 1mm;

// }


// .invoice-meta-box {

//   border: 1px solid #222;

//   margin-top: 5mm;

//   font-size: 10px;

// }


// .invoice-meta-title {

//   font-weight: 700;

//   padding: 1.8mm 2mm 0.5mm;

// }


// .invoice-number {

//   padding: 0 2mm 1.5mm;

//   font-size: 10px;

//   font-weight: 600;

// }


// .invoice-meta-row {

//   display: grid;

//   grid-template-columns: 1fr 1fr;

//   border-top: 1px solid #222;

//   min-height: 6mm;

// }


// .invoice-meta-row span {

//   padding: 1.1mm 1.5mm;

// }


// .invoice-meta-row span:first-child {

//   border-right: 1px solid #222;

//   text-align: right;

// }


// .invoice-meta-row span:last-child {

//   text-align: left;

// }


// .invoice-buyer-box {

//   width: 54%;

//   border: 1px solid #222;

//   margin-bottom: 18mm;

//   font-size: 10px;

// }


// .invoice-buyer-title {

//   font-weight: 700;

//   background: #f1f1f1;

//   border-bottom: 1px solid #222;

//   padding: 1.6mm 2mm;

// }


// .invoice-buyer-content {

//   min-height: 8mm;

//   padding: 1.6mm 2mm;

//   line-height: 1.4;

// }


// .invoice-buyer-name {

//   font-weight: 600;

// }


// .invoice-table {

//   width: 100%;

//   table-layout: fixed;

//   border-collapse: collapse;

//   border: 1px solid #222;

//   font-size: 10px;

// }


// .invoice-table .qty-col {
//   width: 13%;
// }

// .invoice-table .unit-col {
//   width: 10%;
// }

// .invoice-table .description-col {
//   width: 43%;
// }

// .invoice-table .price-col {
//   width: 17%;
// }

// .invoice-table .amount-col {
//   width: 17%;
// }


// .invoice-table thead th {

//   padding: 2.8mm 1.8mm;

//   font-weight: 700;

//   text-align: left;

//   border-left: 1px solid #222;

//   border-right: 1px solid #222;

//   border-bottom: 1px solid #222;

//   border-top: 0;

// }


// .invoice-table tbody td {

//   padding: 2.2mm 1.8mm;

//   height: 8mm;

//   vertical-align: top;

//   border-left: 1px solid #222;

//   border-right: 1px solid #222;

//   border-top: 0 !important;

//   border-bottom: 0 !important;

//   background: transparent !important;

// }


// .invoice-table tbody tr:last-child td {

//   border-bottom: 0 !important;

// }


// .invoice-table .quantity-cell {

//   text-align: center;

// }


// .invoice-table .description-cell {

//   text-align: left;

// }


// .invoice-table .number-cell {

//   text-align: right;

//   white-space: nowrap;

// }


// .invoice-table tbody .invoice-empty-row td {

//   height: 11mm;

//   border-left: 1px solid #222 !important;

//   border-right: 1px solid #222 !important;

//   border-top: 0 !important;

//   border-bottom: 0 !important;

// }


// .invoice-table th:first-child,
// .invoice-table td:first-child {

//   border-left: 1px solid #222 !important;

// }


// .invoice-table th:last-child,
// .invoice-table td:last-child {

//   border-right: 1px solid #222 !important;

// }


// .invoice-table tbody tr:last-child td {

//   border-bottom: 1px solid #222 !important;

// }


// .invoice-total-wrapper {

//   display: flex;

//   justify-content: flex-end;

//   margin-top: 5mm;

//   gap: 0;

// }


// .invoice-total-label {

//   width: 17%;

//   box-sizing: border-box;

//   border: 1px solid #222;

//   padding: 2.8mm 3mm;

//   font-size: 10px;

//   font-weight: 700;

//   text-align: center;

// }


// .invoice-total-value {

//   width: 17%;

//   box-sizing: border-box;

//   border: 1px solid #222;

//   padding: 2.8mm 3mm;

//   font-size: 10px;

//   font-weight: 700;

//   text-align: right;

// }


// .invoice-footer-note {

//   margin-top: 8mm;

//   padding-top: 2mm;

//   border-top: 1px solid #ccc;

// }


// .invoice-footer-note p {

//   text-align: center;

//   font-size: 9px;

//   color: #888;

//   margin: 0;

//   font-style: italic;

// }


// @media print {

//   @page {

//     size: A4 portrait;

//     margin: 0;

//   }


//   html,
//   body {

//     width: 210mm;

//     min-height: 297mm;

//     margin: 0 !important;

//     padding: 0 !important;

//     background: white !important;

//   }


//   body * {

//     visibility: hidden !important;

//   }


//   .invoice-print-area,
//   .invoice-print-area * {

//     visibility: visible !important;

//   }


//   .invoice-preview-overlay {

//     position: static !important;

//     width: 210mm !important;

//     min-height: 297mm !important;

//     padding: 0 !important;

//     margin: 0 !important;

//     overflow: visible !important;

//     background: white !important;

//   }


//   .invoice-preview-controls {

//     display: none !important;

//   }


//   .invoice-print-area {

//     position: absolute !important;

//     left: 0 !important;

//     top: 0 !important;

//     width: 210mm !important;

//     margin: 0 !important;

//     padding: 0 !important;

//   }


//   .invoice-sheet {

//     width: 210mm !important;

//     min-height: 297mm !important;

//     margin: 0 !important;

//     padding: 15mm 17mm !important;

//     box-sizing: border-box !important;

//     box-shadow: none !important;

//   }


//   .invoice-table {

//     width: 100% !important;

//     border-collapse: collapse !important;

//     border: 1px solid #222 !important;

//   }


//   .invoice-table thead th {

//     border-left: 1px solid #222 !important;

//     border-right: 1px solid #222 !important;

//     border-top: 0 !important;

//     border-bottom: 1px solid #222 !important;

//   }


//   .invoice-table tbody td {

//     border-left: 1px solid #222 !important;

//     border-right: 1px solid #222 !important;

//     border-top: 0 !important;

//     border-bottom: 0 !important;

//     background: transparent !important;

//   }


//   .invoice-table tbody tr:last-child td {

//     border-bottom: 1px solid #222 !important;

//   }


//   .invoice-table tbody .invoice-empty-row td {

//     border-left: 1px solid #222 !important;

//     border-right: 1px solid #222 !important;

//     border-top: 0 !important;

//     border-bottom: 0 !important;

//   }


//   .invoice-total-label {

//     border: 1px solid #222 !important;

//   }


//   .invoice-total-value {

//     border: 1px solid #222 !important;

//   }


//   .invoice-footer-note {

//     border-top: 1px solid #ccc !important;

//   }

// }

// `


// /* ================================================================
//    INSERT PRINT CSS
//    ================================================================ */

// if (
//   typeof document !== 'undefined'
// ) {

//   const styleId =
//     'invoice-print-styles'


//   const oldStyle =
//     document.getElementById(
//       styleId
//     )


//   if (!oldStyle) {

//     const style =
//       document.createElement(
//         'style'
//       )

//     style.id =
//       styleId

//     style.innerHTML =
//       invoicePrintStyles

//     document.head.appendChild(
//       style
//     )

//   }

// }










// import { useEffect, useMemo, useState } from 'react'

// import {
//   ref,
//   push,
//   onValue,
//   update,
//   get,
//   set,
//   remove
// } from 'firebase/database'

// import {
//   Plus,
//   Trash2,
//   Receipt,
//   Pencil,
//   Printer,
//   X,
//   Save,
//   Download,
//   Search
// } from 'lucide-react'

// import { db } from '../firebase'
// import { useAuth } from '../context/AuthContext'

// import {
//   formatDate,
//   todayISO,
//   currency
// } from '../utils/helpers'

// import { Modal } from './Customers'
// import Loader from '../components/Loader'


// /* ============================================================
//    COMPANY INFORMATION
//    ============================================================ */

// const COMPANY_NAME = ''

// const COMPANY_LOGO = '/PN.png'

// const COMPANY_ADDRESS = `
// KCHS, Gohar Chamber, Office # 304,
// Shahra-e-Faisal, near Duty Free Shop,
// Karachi, 75600
// `

// const COMPANY_PHONE = '0341-1293604'

// const COMPANY_NTN = '-'

// const COMPANY_STRN = '-'


// /* ============================================================
//    INVOICE NUMBER GENERATOR
//    ============================================================ */

// function getTodayDateString() {

//   const today = new Date()

//   const year =
//     today.getFullYear()

//   const month =
//     String(
//       today.getMonth() + 1
//     ).padStart(2, '0')

//   const day =
//     String(
//       today.getDate()
//     ).padStart(2, '0')

//   return `${year}${month}${day}`

// }


// async function getNextInvoiceNumber(companyId) {

//   try {

//     const dateStr =
//       getTodayDateString()

//     const counterRef =
//       ref(
//         db,
//         `companies/${companyId}/counters/invoice`
//       )

//     const snapshot =
//       await get(counterRef)

//     let lastNumber = 0
//     let lastDate = ''

//     if (snapshot.exists()) {

//       const data =
//         snapshot.val()

//       lastNumber =
//         data.number || 0

//       lastDate =
//         data.date || ''

//     }

//     let nextNumber =
//       lastNumber + 1

//     if (lastDate !== dateStr) {

//       nextNumber = 1

//     }

//     const padded =
//       String(
//         nextNumber
//       ).padStart(4, '0')

//     return `INV-${dateStr}-${padded}`

//   } catch (error) {

//     console.error(
//       'Error getting invoice number:',
//       error
//     )

//     const dateStr =
//       getTodayDateString()

//     const timestamp =
//       Date.now()
//         .toString()
//         .slice(-6)

//     return `INV-${dateStr}-${timestamp}`

//   }

// }


// async function incrementInvoiceCounter(companyId) {

//   try {

//     const dateStr =
//       getTodayDateString()

//     const counterRef =
//       ref(
//         db,
//         `companies/${companyId}/counters/invoice`
//       )

//     const snapshot =
//       await get(counterRef)

//     let lastNumber = 0
//     let lastDate = ''

//     if (snapshot.exists()) {

//       const data =
//         snapshot.val()

//       lastNumber =
//         data.number || 0

//       lastDate =
//         data.date || ''

//     }

//     let newNumber =
//       lastNumber + 1

//     if (lastDate !== dateStr) {

//       newNumber = 1

//     }

//     await set(
//       counterRef,
//       {
//         date: dateStr,
//         number: newNumber
//       }
//     )

//     return {
//       number: newNumber,
//       date: dateStr
//     }

//   } catch (error) {

//     console.error(
//       'Error incrementing counter:',
//       error
//     )

//     return null

//   }

// }


// /* ============================================================
//    EMPTY PRODUCT
//    ============================================================ */

// const emptyItem = {
//   name: '',
//   qty: 1,
//   price: '',
//   unit: 'PCS'  // Added unit field with default
// }


// /* ============================================================
//    MAIN INVOICE COMPONENT
//    ============================================================ */

// export default function Invoice() {

//   const { companyId } =
//     useAuth()


//   const [customers, setCustomers] =
//     useState(null)

//   const [invoices, setInvoices] =
//     useState(null)

//   const [showForm, setShowForm] =
//     useState(false)

//   const [preview, setPreview] =
//     useState(null)

//   const [editingInvoice, setEditingInvoice] =
//     useState(null)

//   const [customerId, setCustomerId] =
//     useState('')

//   /* ============================================================
//      CUSTOMER SEARCH
//      ============================================================ */

//   const [customerSearch, setCustomerSearch] =
//     useState('')

//   const [showCustomerDropdown, setShowCustomerDropdown] =
//     useState(false)

//   const [invoiceNumber, setInvoiceNumber] =
//     useState('')


//   /* ============================================================
//      INVOICE DATE
//      ============================================================ */

//   const [invoiceDate, setInvoiceDate] =
//     useState(
//       todayISO()
//     )


//   const [poNumber, setPoNumber] =
//     useState('')

//   const [poDate, setPoDate] =
//     useState('')


//   const [items, setItems] =
//     useState([])


//   const [pick, setPick] =
//     useState({
//       ...emptyItem
//     })


//   /* ============================================================
//      DISCOUNT
//      ============================================================ */

//   const [discount, setDiscount] =
//     useState(0)


//   /* ============================================================
//      TERMS & CONDITIONS
//      ============================================================ */

//   const [termsAndConditions, setTermsAndConditions] =
//     useState('')


//   const [saving, setSaving] =
//     useState(false)

//   const [error, setError] =
//     useState('')


//   /* ============================================================
//      DELETE CONFIRMATION
//      ============================================================ */

//   const [deleteConfirm, setDeleteConfirm] =
//     useState(null)

//   const [deleting, setDeleting] =
//     useState(false)


//   /* ============================================================
//      EDIT PRODUCT STATE
//      ============================================================ */

//   const [editingProductIndex, setEditingProductIndex] =
//     useState(null)


//   const [editProduct, setEditProduct] =
//     useState({
//       name: '',
//       qty: 1,
//       price: 0,
//       unit: 'PCS'
//     })


//   /* ============================================================
//      SEARCH STATE
//      ============================================================ */

//   const [searchTerm, setSearchTerm] =
//     useState('')


//   /* ============================================================
//      LOAD CUSTOMERS AND INVOICES
//      ============================================================ */

//   useEffect(() => {

//     if (!companyId) {

//       return

//     }


//     const customersRef =
//       ref(
//         db,
//         `companies/${companyId}/customers`
//       )


//     const unsubscribeCustomers =
//       onValue(
//         customersRef,

//         (snapshot) => {

//           const value =
//             snapshot.val() || {}

//           const list =
//             Object.entries(value)
//               .map(
//                 ([id, customer]) => ({
//                   id,
//                   ...customer
//                 })
//               )

//           setCustomers(list)

//         },

//         (err) => {

//           console.error(
//             'Customers read failed:',
//             err
//           )

//           setCustomers([])

//         }
//       )


//     const invoicesRef =
//       ref(
//         db,
//         `companies/${companyId}/invoices`
//       )


//     const unsubscribeInvoices =
//       onValue(
//         invoicesRef,

//         (snapshot) => {

//           const value =
//             snapshot.val() || {}

//           const list =
//             Object.entries(value)
//               .map(
//                 ([id, invoice]) => ({
//                   id,
//                   ...invoice
//                 })
//               )
//               .sort(
//                 (a, b) =>
//                   (
//                     b.updatedAt ||
//                     b.createdAt ||
//                     0
//                   ) -
//                   (
//                     a.updatedAt ||
//                     a.createdAt ||
//                     0
//                   )
//               )

//           setInvoices(list)

//         },

//         (err) => {

//           console.error(
//             'Invoices read failed:',
//             err
//           )

//           setInvoices([])

//         }
//       )


//     return () => {

//       unsubscribeCustomers()

//       unsubscribeInvoices()

//     }

//   }, [companyId])


//   /* ============================================================
//      FILTERED CUSTOMERS
//      ============================================================ */

//   const filteredCustomers =
//     useMemo(() => {

//       const search =
//         customerSearch
//           .trim()
//           .toLowerCase()

//       if (!search) {
//         return customers || []
//       }

//       return (customers || []).filter(
//         customer => {
//           const name = String(customer.name || '').toLowerCase()
//           const company = String(customer.company || '').toLowerCase()
//           const phone = String(customer.phone || '').toLowerCase()
//           const address = String(customer.address || '').toLowerCase()

//           return (
//             name.includes(search) ||
//             company.includes(search) ||
//             phone.includes(search) ||
//             address.includes(search)
//           )
//         }
//       )
//     }, [customers, customerSearch])


//   /* ============================================================
//      FILTERED INVOICES FOR SEARCH
//      ============================================================ */

//   const filteredInvoices =
//     useMemo(() => {

//       if (!invoices) return []

//       const search =
//         searchTerm
//           .trim()
//           .toLowerCase()

//       if (!search) {
//         return invoices
//       }

//       return invoices.filter(
//         invoice => {

//           // Search by invoice number
//           if (
//             invoice.invoiceNumber &&
//             invoice.invoiceNumber
//               .toLowerCase()
//               .includes(search)
//           ) {
//             return true
//           }

//           // Search by customer name
//           if (
//             invoice.customerName &&
//             invoice.customerName
//               .toLowerCase()
//               .includes(search)
//           ) {
//             return true
//           }

//           // Search by customer company
//           if (
//             invoice.customerCompany &&
//             invoice.customerCompany
//               .toLowerCase()
//               .includes(search)
//           ) {
//             return true
//           }

//           // Search by date (formatted)
//           if (
//             invoice.date &&
//             formatDate(invoice.date)
//               .toLowerCase()
//               .includes(search)
//           ) {
//             return true
//           }

//           // Search by PO number
//           if (
//             invoice.poNumber &&
//             invoice.poNumber
//               .toLowerCase()
//               .includes(search)
//           ) {
//             return true
//           }

//           return false
//         }
//       )

//     }, [invoices, searchTerm])


//   /* ============================================================
//      SELECT CUSTOMER
//      ============================================================ */

//   function selectCustomer(customer) {
//     setCustomerId(customer.id)
//     setCustomerSearch(
//       `${customer.name || ''}${customer.company ? ` — ${customer.company}` : ''}`
//     )
//     setShowCustomerDropdown(false)
//     setError('')
//   }


//   /* ============================================================
//      TOTAL
//      ============================================================ */

//   const total =
//     useMemo(() => {

//       return items.reduce(
//         (sum, item) => {

//           const qty =
//             Number(item.qty) || 0

//           const price =
//             Number(item.price) || 0

//           return (
//             sum +
//             qty * price
//           )

//         },
//         0
//       )

//     }, [items])


//   /* ============================================================
//      DISCOUNT VALUE
//      ============================================================ */

//   const discountValue =
//     useMemo(() => {

//       const value =
//         Number(discount) || 0

//       return Math.min(
//         Math.max(
//           value,
//           0
//         ),
//         total
//       )

//     }, [discount, total])


//   /* ============================================================
//      NET TOTAL
//      ============================================================ */

//   const netTotal =
//     useMemo(() => {

//       return Math.max(
//         0,
//         total - discountValue
//       )

//     }, [total, discountValue])


//   /* ============================================================
//      ADD PRODUCT
//      ============================================================ */

//   function addItem() {

//     if (!pick.name.trim()) {

//       return

//     }


//     const newItem = {

//       name:
//         pick.name.trim(),

//       qty:
//         Math.max(
//           1,
//           Number(pick.qty) || 1
//         ),

//       price:
//         Math.max(
//           0,
//           Number(pick.price) || 0
//         ),

//       unit:
//         pick.unit || 'PCS'

//     }


//     setItems(
//       previous => [
//         ...previous,
//         newItem
//       ]
//     )


//     setPick({
//       ...emptyItem
//     })

//   }


//   /* ============================================================
//      REMOVE PRODUCT
//      ============================================================ */

//   function removeItem(index) {

//     setItems(
//       previous =>
//         previous.filter(
//           (_, i) =>
//             i !== index
//         )
//     )

//   }


//   /* ============================================================
//      EDIT PRODUCT - OPEN
//      ============================================================ */

//   function openEditProduct(index) {

//     const item =
//       items[index]

//     if (!item) {

//       return

//     }

//     setEditingProductIndex(
//       index
//     )

//     setEditProduct({

//       name:
//         item.name,

//       qty:
//         item.qty,

//       price:
//         item.price,

//       unit:
//         item.unit || 'PCS'

//     })

//   }


//   /* ============================================================
//      EDIT PRODUCT - SAVE
//      ============================================================ */

//   function saveEditProduct() {

//     if (
//       !editProduct.name.trim()
//     ) {

//       return

//     }


//     if (
//       editingProductIndex === null
//     ) {

//       return

//     }


//     const updatedItems =
//       [...items]


//     updatedItems[
//       editingProductIndex
//     ] = {

//       name:
//         editProduct.name.trim(),

//       qty:
//         Math.max(
//           1,
//           Number(
//             editProduct.qty
//           ) || 1
//         ),

//       price:
//         Math.max(
//           0,
//           Number(
//             editProduct.price
//           ) || 0
//         ),

//       unit:
//         editProduct.unit || 'PCS'

//     }


//     setItems(
//       updatedItems
//     )


//     setEditingProductIndex(
//       null
//     )


//     setEditProduct({

//       name: '',
//       qty: 1,
//       price: 0,
//       unit: 'PCS'

//     })

//   }


//   /* ============================================================
//      EDIT PRODUCT - CLOSE
//      ============================================================ */

//   function closeEditProduct() {

//     setEditingProductIndex(
//       null
//     )

//     setEditProduct({

//       name: '',
//       qty: 1,
//       price: 0,
//       unit: 'PCS'

//     })

//   }


//   /* ============================================================
//      RESET FORM
//      ============================================================ */

//   function resetForm() {

//     setCustomerId('')
//     setCustomerSearch('')
//     setShowCustomerDropdown(false)

//     setInvoiceNumber('')

//     setInvoiceDate(
//       todayISO()
//     )

//     setPoNumber('')

//     setPoDate('')

//     setItems([])

//     setPick({
//       ...emptyItem
//     })

//     setDiscount(0)

//     setTermsAndConditions('')

//     setEditingInvoice(
//       null
//     )

//     setError('')

//     setEditingProductIndex(
//       null
//     )

//     setEditProduct({

//       name: '',
//       qty: 1,
//       price: 0,
//       unit: 'PCS'

//     })

//   }


//   /* ============================================================
//      DELETE INVOICE
//      ============================================================ */

//   async function handleDeleteInvoice() {

//     if (
//       !companyId ||
//       !deleteConfirm
//     ) {

//       return

//     }


//     setDeleting(true)


//     try {

//       const invoiceRef =
//         ref(
//           db,
//           `companies/${companyId}/invoices/${deleteConfirm.id}`
//         )


//       await remove(
//         invoiceRef
//       )


//       setDeleteConfirm(
//         null
//       )

//     } catch (err) {

//       console.error(
//         'Invoice delete error:',
//         err
//       )

//       alert(
//         'Invoice delete nahi ho saka. Dobara koshish karein.'
//       )

//     } finally {

//       setDeleting(false)

//     }

//   }


//   /* ============================================================
//      OPEN NEW INVOICE
//      ============================================================ */

//   const openNewInvoice =
//     async () => {

//       resetForm()

//       setInvoiceDate(
//         todayISO()
//       )

//       setDiscount(0)

//       setTermsAndConditions('')


//       if (companyId) {

//         const number =
//           await getNextInvoiceNumber(
//             companyId
//           )

//         setInvoiceNumber(
//           number
//         )

//       }


//       setShowForm(
//         true
//       )

//     }


//   /* ============================================================
//      OPEN EDIT INVOICE
//      ============================================================ */

//   function openEditInvoice(invoice) {

//     setEditingInvoice(
//       invoice
//     )


//     setCustomerId(
//       invoice.customerId || ''
//     )

//     const editCustomer =
//       customers?.find(
//         customer =>
//           customer.id === invoice.customerId
//       )

//     setCustomerSearch(
//       editCustomer
//         ? `${editCustomer.name || ''}${editCustomer.company ? ` — ${editCustomer.company}` : ''}`
//         : invoice.customerName || ''
//     )

//     setShowCustomerDropdown(false)


//     setInvoiceNumber(
//       invoice.invoiceNumber || ''
//     )


//     setInvoiceDate(
//       invoice.date ||
//       todayISO()
//     )


//     setPoNumber(
//       invoice.poNumber || ''
//     )


//     setPoDate(
//       invoice.poDate || ''
//     )


//     setItems(
//       Array.isArray(
//         invoice.items
//       )
//         ? invoice.items.map(
//             item => ({

//               name:
//                 item.name || '',

//               qty:
//                 Number(
//                   item.qty
//                 ) || 1,

//               price:
//                 Number(
//                   item.price
//                 ) || 0,

//               unit:
//                 item.unit || 'PCS'

//             })
//           )
//         : []
//     )


//     setDiscount(
//       Math.max(
//         0,
//         Number(
//           invoice.discount
//         ) || 0
//       )
//     )


//     setTermsAndConditions(
//       invoice.termsAndConditions || ''
//     )


//     setPick({
//       ...emptyItem
//     })


//     setError('')


//     setEditingProductIndex(
//       null
//     )


//     setShowForm(
//       true
//     )

//   }


//   /* ============================================================
//      CLOSE FORM
//      ============================================================ */

//   function closeForm() {

//     if (saving) {

//       return

//     }

//     setShowForm(false)

//     resetForm()

//   }


//   /* ============================================================
//      SAVE / UPDATE INVOICE
//      ============================================================ */

//   async function handleSubmit(e) {

//     e.preventDefault()

//     setError('')


//     if (!companyId) {

//       setError(
//         'Company ID nahi mila.'
//       )

//       return

//     }


//     if (!customerId) {

//       setError(
//         'Customer select karein.'
//       )

//       return

//     }


//     if (!invoiceDate) {

//       setError(
//         'Invoice date select karein.'
//       )

//       return

//     }


//     if (items.length === 0) {

//       setError(
//         'Kam az kam aik product add karein.'
//       )

//       return

//     }


//     const customer =
//       customers?.find(
//         c =>
//           c.id === customerId
//       )


//     if (!customer) {

//       setError(
//         'Customer nahi mila.'
//       )

//       return

//     }


//     const finalDiscount =
//       Math.min(
//         Math.max(
//           Number(discount) || 0,
//           0
//         ),
//         total
//       )


//     const finalNetTotal =
//       Math.max(
//         0,
//         total - finalDiscount
//       )


//     setSaving(true)


//     try {

//       let finalInvoiceNumber =
//         invoiceNumber


//       if (!editingInvoice) {

//         await incrementInvoiceCounter(
//           companyId
//         )


//         if (
//           !finalInvoiceNumber ||
//           finalInvoiceNumber.trim() === ''
//         ) {

//           const dateStr =
//             getTodayDateString()

//           const timestamp =
//             Date.now()
//               .toString()
//               .slice(-6)


//           finalInvoiceNumber =
//             `INV-${dateStr}-${timestamp}`


//           setInvoiceNumber(
//             finalInvoiceNumber
//           )

//         }

//       }


//       /* ========================================================
//          UPDATE EXISTING INVOICE
//          ======================================================== */

//       if (editingInvoice) {

//         const invoiceRef =
//           ref(
//             db,
//             `companies/${companyId}/invoices/${editingInvoice.id}`
//           )


//         const updatedInvoice = {

//           invoiceNumber:
//             finalInvoiceNumber,

//           date:
//             invoiceDate,

//           poNumber:
//             poNumber || '',

//           poDate:
//             poDate || '',

//           customerId:
//             customerId,

//           customerName:
//             customer.name || '',

//           customerCompany:
//             customer.company || '',

//           customerPhone:
//             customer.phone || '',

//           customerAddress:
//             customer.address || '',

//           companyName:
//             COMPANY_NAME,

//           companyLogo:
//             COMPANY_LOGO,

//           companyAddress:
//             COMPANY_ADDRESS,

//           companyPhone:
//             COMPANY_PHONE,

//           companyNTN:
//             COMPANY_NTN,

//           companySTRN:
//             COMPANY_STRN,

//           items:
//             items,

//           total:
//             total,

//           discount:
//             finalDiscount,

//           netTotal:
//             finalNetTotal,

//           termsAndConditions:
//             termsAndConditions.trim(),

//           updatedAt:
//             Date.now()

//         }


//         await update(
//           invoiceRef,
//           updatedInvoice
//         )


//         setShowForm(
//           false
//         )


//         resetForm()


//         setPreview({

//           id:
//             editingInvoice.id,

//           invoiceNumber:
//             updatedInvoice.invoiceNumber,

//           date:
//             updatedInvoice.date,

//           poNumber:
//             updatedInvoice.poNumber,

//           poDate:
//             updatedInvoice.poDate,

//           items:
//             updatedInvoice.items,

//           total:
//             updatedInvoice.total,

//           discount:
//             updatedInvoice.discount,

//           netTotal:
//             updatedInvoice.netTotal,

//           termsAndConditions:
//             updatedInvoice.termsAndConditions,

//           companyName:
//             COMPANY_NAME,

//           companyLogo:
//             COMPANY_LOGO,

//           companyAddress:
//             COMPANY_ADDRESS,

//           companyPhone:
//             COMPANY_PHONE,

//           companyNTN:
//             COMPANY_NTN,

//           companySTRN:
//             COMPANY_STRN,

//           customer: {

//             name:
//               updatedInvoice.customerName,

//             company:
//               updatedInvoice.customerCompany,

//             phone:
//               updatedInvoice.customerPhone,

//             address:
//               updatedInvoice.customerAddress

//           }

//         })


//         return

//       }


//       /* ========================================================
//          CREATE NEW INVOICE
//          ======================================================== */

//       const date =
//         invoiceDate


//       const invoiceData = {

//         invoiceNumber:
//           finalInvoiceNumber,

//         date:
//           date,

//         poNumber:
//           poNumber || '',

//         poDate:
//           poDate || '',

//         customerId:
//           customerId,

//         customerName:
//           customer.name || '',

//         customerCompany:
//           customer.company || '',

//         customerPhone:
//           customer.phone || '',

//         customerAddress:
//           customer.address || '',

//         companyName:
//           COMPANY_NAME,

//         companyLogo:
//           COMPANY_LOGO,

//         companyAddress:
//           COMPANY_ADDRESS,

//         companyPhone:
//           COMPANY_PHONE,

//         companyNTN:
//           COMPANY_NTN,

//         companySTRN:
//           COMPANY_STRN,

//         items:
//           items,

//         total:
//           total,

//         discount:
//           finalDiscount,

//         netTotal:
//           finalNetTotal,

//         termsAndConditions:
//           termsAndConditions.trim(),

//         createdAt:
//           Date.now()

//       }


//       const invoicesRef =
//         ref(
//           db,
//           `companies/${companyId}/invoices`
//         )


//       const newInvoice =
//         await push(
//           invoicesRef,
//           invoiceData
//         )


//       setPreview({

//         id:
//           newInvoice.key,

//         invoiceNumber:
//           finalInvoiceNumber,

//         date:
//           date,

//         poNumber:
//           invoiceData.poNumber,

//         poDate:
//           invoiceData.poDate,

//         items:
//           invoiceData.items,

//         total:
//           invoiceData.total,

//         discount:
//           invoiceData.discount,

//         netTotal:
//           invoiceData.netTotal,

//         termsAndConditions:
//           invoiceData.termsAndConditions,

//         companyName:
//           COMPANY_NAME,

//         companyLogo:
//           COMPANY_LOGO,

//         companyAddress:
//           COMPANY_ADDRESS,

//         companyPhone:
//           COMPANY_PHONE,

//         companyNTN:
//           COMPANY_NTN,

//         companySTRN:
//           COMPANY_STRN,

//         customer: {

//           name:
//             invoiceData.customerName,

//           company:
//             invoiceData.customerCompany,

//           phone:
//             invoiceData.customerPhone,

//           address:
//             invoiceData.customerAddress

//         }

//       })


//       setShowForm(
//         false
//       )


//       resetForm()


//     } catch (err) {

//       console.error(
//         'Invoice save error:',
//         err
//       )

//       setError(
//         err?.message ||
//         'Invoice save nahi ho saka. Dobara koshish karein.'
//       )

//     } finally {

//       setSaving(false)

//     }

//   }


//   /* ============================================================
//      DOWNLOAD / PREVIEW PDF
//      ============================================================ */

//   function handleDownloadPdf(invoice) {

//     const previewInvoice =
//       convertInvoiceToPreview(
//         invoice
//       )

//     setPreview(
//       previewInvoice
//     )

//   }


//   /* ============================================================
//      PAGE
//      ============================================================ */

//   return (

//     <>

//       <div>

//         {/* ======================================================
//             HEADER
//             ====================================================== */}

//         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">

//           <div>

//             <h1 className="font-display text-2xl font-semibold text-ink">
//               Invoice
//             </h1>

//             <p className="text-sm text-slateink mt-0.5">
//               Enter the product name, quantity, and price to create an invoice.
//             </p>

//           </div>


//           <button
//             onClick={openNewInvoice}
//             className="flex items-center gap-2 rounded-lg bg-ink text-white text-sm font-medium px-4 py-2.5 hover:bg-inkSoft transition-colors self-start"
//           >

//             <Plus size={16} />

//             New Invoice

//           </button>

//         </div>


//         {/* ======================================================
//             SEARCH BAR
//             ====================================================== */}

//         <div className="mb-6">

//           <div className="relative max-w-md">

//             <input
//               type="text"
//               value={searchTerm}
//               onChange={(e) =>
//                 setSearchTerm(e.target.value)
//               }
//               className="input w-full pl-9 pr-4"
//               placeholder="Search by invoice #, customer, company, date..."
//             />

//             {searchTerm && (
//               <button
//                 type="button"
//                 onClick={() => setSearchTerm('')}
//                 className="absolute right-3 top-1/2 -translate-y-1/2 text-slateink hover:text-ink"
//               >
//                 <X size={14} />
//               </button>
//             )}

//           </div>

//           <p className="text-xs text-slateink mt-1">
//             Search by invoice number, customer name, company name, or date
//           </p>

//         </div>


//         {/* ======================================================
//             INVOICE LIST
//             ====================================================== */}

//         {invoices === null ? (

//           <Loader />

//         ) : filteredInvoices.length === 0 ? (

//           <div className="border border-dashed border-line rounded-2xl py-16 flex flex-col items-center justify-center text-center">

//             <Receipt
//               className="text-slateink mb-3"
//               size={28}
//             />

//             <p className="font-medium text-ink">
//               {searchTerm
//                 ? 'No matching invoices found'
//                 : 'Abhi tak koi invoice nahi bana'}
//             </p>

//             {searchTerm && (
//               <p className="text-sm text-slateink mt-1">
//                 Try searching with different keywords
//               </p>
//             )}

//           </div>

//         ) : (

//           <div className="bg-surface rounded-2xl border border-line shadow-card overflow-hidden">

//             <div className="overflow-x-auto">

//               <table className="w-full text-sm">

//                 <thead>

//                   <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-slateink">

//                     <th className="px-4 py-3 font-medium">
//                       Invoice #
//                     </th>

//                     <th className="px-4 py-3 font-medium">
//                       Customer
//                     </th>

//                     <th className="px-4 py-3 font-medium">
//                       Total
//                     </th>

//                     <th className="px-4 py-3 font-medium">
//                       Date
//                     </th>

//                     <th className="px-4 py-3 font-medium text-right">
//                       Action
//                     </th>

//                   </tr>

//                 </thead>


//                 <tbody>

//                   {filteredInvoices.map(
//                     invoice => (

//                       <tr
//                         key={invoice.id}
//                         className="border-b border-line last:border-0 hover:bg-paper/60"
//                       >

//                         <td className="px-4 py-3 font-mono text-xs">
//                           {invoice.invoiceNumber}
//                         </td>


//                         <td className="px-4 py-3">

//                           <p className="font-medium text-ink">
//                             {invoice.customerName}
//                           </p>

//                           <p className="text-xs text-slateink">
//                             {invoice.customerCompany}
//                           </p>

//                         </td>


//                         <td className="px-4 py-3 font-medium text-ink">

//                           Rs{' '}

//                           {currency(
//                             invoice.netTotal !== undefined
//                               ? invoice.netTotal
//                               : Math.max(
//                                   0,
//                                   Number(invoice.total || 0) -
//                                   Number(invoice.discount || 0)
//                                 )
//                           )}

//                         </td>


//                         <td className="px-4 py-3 text-xs font-mono text-slateink">

//                           {formatDate(
//                             invoice.date
//                           )}

//                         </td>


//                         <td className="px-4 py-3">

//                           <div className="flex items-center justify-end gap-2 flex-wrap">

//                             <button
//                               onClick={() =>
//                                 setPreview(
//                                   convertInvoiceToPreview(
//                                     invoice
//                                   )
//                                 )
//                               }
//                               className="text-teal-dark text-xs font-medium hover:underline"
//                             >

//                               View

//                             </button>


//                             <button
//                               onClick={() =>
//                                 openEditInvoice(
//                                   invoice
//                                 )
//                               }
//                               className="inline-flex items-center gap-1.5 text-xs font-medium text-ink hover:text-teal-dark"
//                             >

//                               <Pencil size={13} />

//                               Edit

//                             </button>


//                             <button
//                               onClick={() =>
//                                 handleDownloadPdf(
//                                   invoice
//                                 )
//                               }
//                               className="inline-flex items-center gap-1.5 text-xs font-medium text-red-600 hover:text-red-800"
//                             >

//                               <Download size={13} />

//                               PDF

//                             </button>


//                             <button
//                               onClick={() =>
//                                 setDeleteConfirm(
//                                   invoice
//                                 )
//                               }
//                               className="inline-flex items-center gap-1.5 text-xs font-medium text-coral hover:text-red-700"
//                             >

//                               <Trash2 size={13} />

//                               Delete

//                             </button>

//                           </div>

//                         </td>

//                       </tr>

//                     )
//                   )}

//                 </tbody>

//               </table>

//             </div>

//           </div>

//         )}


//         {/* ======================================================
//             CREATE / EDIT MODAL
//             ====================================================== */}

//         {showForm && (

//           <Modal
//             title={
//               editingInvoice
//                 ? `Edit Invoice ${editingInvoice.invoiceNumber}`
//                 : 'New Invoice'
//             }
//             onClose={closeForm}
//             wide
//           >

//             <form
//               onSubmit={handleSubmit}
//               className="space-y-5"
//             >

//               {/* =================================================
//                   INVOICE NUMBER + DATE
//                   ================================================= */}

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

//                 <label className="block">

//                   <span className="text-xs font-medium text-slateink">
//                     Invoice Number *
//                   </span>

//                   <input
//                     type="text"
//                     value={invoiceNumber}
//                     onChange={(e) =>
//                       setInvoiceNumber(
//                         e.target.value
//                       )
//                     }
//                     className="input mt-1"
//                     placeholder="INV-YYYYMMDD-0001"
//                     required
//                   />

//                   <small className="text-xs text-slateink mt-1 block">
//                     Format: INV-YYYYMMDD-0001 (Auto-generated)
//                   </small>

//                 </label>


//                 <label className="block">

//                   <span className="text-xs font-medium text-slateink">
//                     Invoice Date *
//                   </span>

//                   <input
//                     type="date"
//                     value={invoiceDate}
//                     onChange={(e) =>
//                       setInvoiceDate(
//                         e.target.value
//                       )
//                     }
//                     className="input mt-1"
//                     required
//                   />

//                 </label>

//               </div>


//               {/* =================================================
//                   CUSTOMER
//                   ================================================= */}

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

//                 <label className="block">

//                   <span className="text-xs font-medium text-slateink">
//                     Customer *
//                   </span>

//                   <div className="relative mt-1">

//                     <input
//                       type="text"
//                       value={customerSearch}
//                       onChange={(e) => {
//                         const value = e.target.value
//                         setCustomerSearch(value)

//                         if (customerId) {
//                           setCustomerId('')
//                         }

//                         setShowCustomerDropdown(true)
//                       }}
//                       onFocus={() =>
//                         setShowCustomerDropdown(true)
//                       }
//                       className="input w-full pr-10"
//                       placeholder="Search customer by name, company, phone..."
//                       autoComplete="off"
//                       required={!customerId}
//                     />

//                     {customerSearch && (
//                       <button
//                         type="button"
//                         onClick={() => {
//                           setCustomerId('')
//                           setCustomerSearch('')
//                           setShowCustomerDropdown(true)
//                         }}
//                         className="absolute right-3 top-1/2 -translate-y-1/2 text-slateink hover:text-ink"
//                         aria-label="Clear customer"
//                       >
//                         <X size={16} />
//                       </button>
//                     )}

//                     {showCustomerDropdown && (
//                       <div className="absolute z-[100] left-0 right-0 mt-1 max-h-64 overflow-y-auto rounded-lg border border-line bg-white shadow-lg">
//                         {filteredCustomers.length === 0 ? (
//                           <div className="px-3 py-3 text-sm text-slateink">
//                             No customer found.
//                           </div>
//                         ) : (
//                           filteredCustomers.map(customer => (
//                             <button
//                               key={customer.id}
//                               type="button"
//                               onClick={() => selectCustomer(customer)}
//                               className={`w-full text-left px-3 py-2.5 hover:bg-paper transition-colors border-b border-line last:border-b-0 ${customer.id === customerId ? 'bg-paper' : ''}`}
//                             >
//                               <p className="text-sm font-medium text-ink">
//                                 {customer.name}
//                               </p>
//                               {customer.company && (
//                                 <p className="text-xs text-slateink mt-0.5">
//                                   {customer.company}
//                                 </p>
//                               )}
//                               {customer.phone && (
//                                 <p className="text-xs text-slateink mt-0.5">
//                                   {customer.phone}
//                                 </p>
//                               )}
//                             </button>
//                           ))
//                         )}
//                       </div>
//                     )}

//                   </div>

//                 </label>

//               </div>


//               {/* =================================================
//                   PO NUMBER + PO DATE
//                   ================================================= */}

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

//                 <label className="block">

//                   <span className="text-xs font-medium text-slateink">
//                     P/Order No.
//                   </span>

//                   <input
//                     type="text"
//                     value={poNumber}
//                     onChange={(e) =>
//                       setPoNumber(
//                         e.target.value
//                       )
//                     }
//                     className="input mt-1"
//                     placeholder="P/Order No."
//                   />

//                 </label>


//                 <label className="block">

//                   <span className="text-xs font-medium text-slateink">
//                     P/Order Date
//                   </span>

//                   <input
//                     type="date"
//                     value={poDate}
//                     onChange={(e) =>
//                       setPoDate(
//                         e.target.value
//                       )
//                     }
//                     className="input mt-1"
//                   />

//                 </label>

//               </div>


//               {/* =================================================
//                   PRODUCTS
//                   ================================================= */}

//               <div className="border border-line rounded-xl p-4">

//                 <p className="text-xs font-medium text-slateink mb-3">
//                   Add Products
//                 </p>


//                 <div className="flex flex-col sm:flex-row gap-2">

//                   <input
//                     value={pick.name}
//                     onChange={(e) =>
//                       setPick({
//                         ...pick,
//                         name:
//                           e.target.value
//                       })
//                     }
//                     className="input flex-1"
//                     placeholder="Product name / model"
//                   />

//                   <input
//                     type="text"
//                     value={pick.unit}
//                     onChange={(e) =>
//                       setPick({
//                         ...pick,
//                         unit:
//                           e.target.value
//                       })
//                     }
//                     className="input sm:w-20"
//                     placeholder="Unit"
//                   />

//                   <input
//                     type="number"
//                     min={1}
//                     value={pick.qty}
//                     onChange={(e) =>
//                       setPick({
//                         ...pick,
//                         qty:
//                           e.target.value
//                       })
//                     }
//                     className="input sm:w-24"
//                     placeholder="Qty"
//                   />


//                   <input
//                     type="number"
//                     min={0}
//                     step="0.01"
//                     value={pick.price}
//                     onChange={(e) =>
//                       setPick({
//                         ...pick,
//                         price:
//                           e.target.value
//                       })
//                     }
//                     className="input sm:w-32"
//                     placeholder="Unit Price"
//                   />


//                   <button
//                     type="button"
//                     onClick={addItem}
//                     disabled={!pick.name.trim()}
//                     className="rounded-lg bg-teal text-white text-sm font-medium px-4 py-2.5 hover:bg-teal-dark disabled:opacity-50 shrink-0"
//                   >

//                     Add

//                   </button>

//                 </div>


//                 {/* =================================================
//                     PRODUCTS ADDED
//                     ================================================= */}

//                 {items.length > 0 && (

//                   <div className="mt-4 space-y-2">

//                     {items.map(
//                       (
//                         item,
//                         index
//                       ) => (

//                         <div
//                           key={index}
//                           className="flex items-center justify-between bg-paper rounded-lg px-3 py-2 text-sm"
//                         >

//                           <div>

//                             <span className="font-medium text-ink">
//                               {item.name}
//                             </span>

//                             <span className="text-xs text-slateink ml-2">
//                               {item.unit || 'PCS'} x{item.qty}
//                             </span>

//                             <span className="text-xs text-slateink ml-2">
//                               @ Rs{' '}
//                               {currency(
//                                 item.price
//                               )}
//                             </span>

//                           </div>


//                           <div className="flex items-center gap-2">

//                             <button
//                               type="button"
//                               onClick={() =>
//                                 openEditProduct(
//                                   index
//                                 )
//                               }
//                               className="text-blue-600 hover:text-blue-800"
//                             >

//                               <Pencil size={15} />

//                             </button>


//                             <button
//                               type="button"
//                               onClick={() =>
//                                 removeItem(
//                                   index
//                                 )
//                               }
//                               className="text-coral hover:text-red-700"
//                             >

//                               <Trash2 size={15} />

//                             </button>

//                           </div>

//                         </div>

//                       )
//                     )}


//                     {/* =================================================
//                         FORM TOTAL
//                         ================================================= */}

//                     <div className="flex justify-end pt-3">

//                       <div className="w-full sm:w-64">

//                         <div className="flex justify-between py-1">

//                           <span className="text-xs text-slateink">
//                             Total
//                           </span>

//                           <span className="text-sm font-semibold text-ink">
//                             Rs {currency(total)}
//                           </span>

//                         </div>


//                         <div className="flex justify-between py-1">

//                           <span className="text-xs text-slateink">
//                             Discount
//                           </span>

//                           <span className="text-sm font-semibold text-red-600">
//                             Rs {currency(discountValue)}
//                           </span>

//                         </div>


//                         <div className="border-t border-line mt-1 pt-2 flex justify-between">

//                           <span className="text-sm font-bold text-ink">
//                             Net Total
//                           </span>

//                           <span className="text-lg font-bold text-ink">
//                             Rs {currency(netTotal)}
//                           </span>

//                         </div>

//                       </div>

//                     </div>

//                   </div>

//                 )}

//               </div>


//               {/* =================================================
//                   DISCOUNT
//                   ================================================= */}

//               <div className="border border-line rounded-xl p-4">

//                 <label className="block max-w-sm ml-auto">

//                   <span className="text-xs font-medium text-slateink">
//                     Discount
//                   </span>

//                   <div className="relative mt-1">

//                     <input
//                       type="number"
//                       min={0}
//                       max={total}
//                       step="0.01"
//                       value={discount}
//                       onChange={(e) =>
//                         setDiscount(
//                           e.target.value
//                         )
//                       }
//                       className="input pl-9 w-full"
//                       placeholder="0"
//                     />

//                   </div>

//                   <small className="text-xs text-slateink mt-1 block">
//                     Discount minus from total price.
//                   </small>

//                 </label>


//                 {/* SUMMARY */}

//                 <div className="mt-4 ml-auto max-w-sm border-t border-line pt-3">

//                   <div className="flex justify-between text-sm py-1">

//                     <span className="text-slateink">
//                       Total
//                     </span>

//                     <span className="font-medium text-ink">
//                       Rs {currency(total)}
//                     </span>

//                   </div>


//                   <div className="flex justify-between text-sm py-1">

//                     <span className="text-slateink">
//                       Discount
//                     </span>

//                     <span className="font-medium text-red-600">
//                       Rs {currency(discountValue)}
//                     </span>

//                   </div>


//                   <div className="flex justify-between border-t border-line pt-2 mt-1">

//                     <span className="font-bold text-ink">
//                       Net Total
//                     </span>

//                     <span className="font-bold text-lg text-ink">
//                       Rs {currency(netTotal)}
//                     </span>

//                   </div>

//                 </div>

//               </div>


//               {/* =================================================
//                   TERMS & CONDITIONS INPUT
//                   ================================================= */}

//               <div className="border border-line rounded-xl p-4">

//                 <label className="block">

//                   <span className="text-xs font-medium text-slateink">
//                     Terms & Conditions
//                   </span>

//                   <textarea
//                     value={termsAndConditions}
//                     onChange={(e) =>
//                       setTermsAndConditions(
//                         e.target.value
//                       )
//                     }
//                     rows={5}
//                     className="input mt-1 w-full resize-y"
//                     placeholder={`Example:
// 1. Payment must be made within 30 days.
// 2. Goods once sold cannot be returned.
// 3. Prices are exclusive of applicable taxes.`}
//                   />

//                   <small className="text-xs text-slateink mt-1 block">
//                     Enter each term on a new line.
//                   </small>

//                 </label>

//               </div>


//               {/* =================================================
//                   ERROR
//                   ================================================= */}

//               {error && (

//                 <p className="text-xs font-medium text-coral bg-coral-light rounded-lg px-3 py-2">
//                   {error}
//                 </p>

//               )}


//               {/* =================================================
//                   SAVE BUTTON
//                   ================================================= */}

//               <button
//                 type="submit"
//                 disabled={
//                   saving ||
//                   !customerId ||
//                   !invoiceDate ||
//                   items.length === 0
//                 }
//                 className="w-full rounded-lg bg-ink text-white text-sm font-medium py-2.5 hover:bg-inkSoft transition-colors disabled:opacity-60"
//               >

//                 {saving
//                   ? editingInvoice
//                     ? 'Updating…'
//                     : 'Saving…'
//                   : editingInvoice
//                   ? 'Update Invoice'
//                   : 'Generate Invoice'}

//               </button>

//             </form>

//           </Modal>

//         )}

//       </div>


//       {/* ========================================================
//           PREVIEW
//           ======================================================== */}

//       {preview && (

//         <InvoicePreview
//           invoice={preview}
//           onClose={() =>
//             setPreview(null)
//           }
//         />

//       )}


//       {/* ========================================================
//           DELETE CONFIRMATION
//           ======================================================== */}

//       {deleteConfirm && (

//         <div className="fixed inset-0 z-[99999] bg-black/60 flex items-center justify-center p-4">

//           <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">

//             <div className="flex items-center justify-between mb-4">

//               <h3 className="text-lg font-semibold text-ink">
//                 Delete Invoice
//               </h3>

//               <button
//                 onClick={() =>
//                   setDeleteConfirm(null)
//                 }
//                 className="text-slateink hover:text-ink"
//               >

//                 <X size={20} />

//               </button>

//             </div>


//             <div className="space-y-4">

//               <p className="text-sm text-ink">
//                 Are you sure to delete this invoice?
//               </p>


//               <div className="bg-paper rounded-lg p-3 text-sm">

//                 <p className="font-medium text-ink">
//                   {deleteConfirm.invoiceNumber}
//                 </p>

//                 <p className="text-slateink text-xs">
//                   {deleteConfirm.customerName}
//                 </p>


//                 <p className="text-slateink text-xs">
//                   Total: Rs{' '}
//                   {currency(
//                     deleteConfirm.total || 0
//                   )}
//                 </p>


//                 <p className="text-red-600 text-xs">
//                   Discount: Rs{' '}
//                   {currency(
//                     deleteConfirm.discount || 0
//                   )}
//                 </p>


//                 <p className="font-semibold text-ink text-xs">
//                   Net Total: Rs{' '}
//                   {currency(
//                     deleteConfirm.netTotal !== undefined
//                       ? deleteConfirm.netTotal
//                       : Math.max(
//                           0,
//                           Number(deleteConfirm.total || 0) -
//                           Number(deleteConfirm.discount || 0)
//                         )
//                   )}
//                 </p>

//               </div>


//               <div className="flex gap-3">

//                 <button
//                   onClick={() =>
//                     setDeleteConfirm(null)
//                   }
//                   className="flex-1 rounded-lg border border-line text-ink text-sm font-medium py-2.5 hover:bg-paper transition-colors"
//                 >
//                   Cancel
//                 </button>


//                 <button
//                   onClick={handleDeleteInvoice}
//                   disabled={deleting}
//                   className="flex-1 rounded-lg bg-coral text-white text-sm font-medium py-2.5 hover:bg-red-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
//                 >

//                   {deleting ? (

//                     'Deleting…'

//                   ) : (

//                     <>

//                       <Trash2 size={16} />

//                       Delete

//                     </>

//                   )}

//                 </button>

//               </div>

//             </div>

//           </div>

//         </div>

//       )}


//       {/* ========================================================
//           EDIT PRODUCT MODAL
//           ======================================================== */}

//       {editingProductIndex !== null && (

//         <div className="fixed inset-0 z-[99999] bg-black/60 flex items-center justify-center p-4">

//           <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">

//             <div className="flex items-center justify-between mb-4">

//               <h3 className="text-lg font-semibold text-ink">
//                 Edit Product
//               </h3>

//               <button
//                 onClick={closeEditProduct}
//                 className="text-slateink hover:text-ink"
//               >

//                 <X size={20} />

//               </button>

//             </div>


//             <div className="space-y-3">

//               <div>

//                 <label className="text-xs font-medium text-slateink">
//                   Product Name
//                 </label>

//                 <input
//                   type="text"
//                   value={editProduct.name}
//                   onChange={(e) =>
//                     setEditProduct({
//                       ...editProduct,
//                       name:
//                         e.target.value
//                     })
//                   }
//                   className="input mt-1 w-full"
//                   placeholder="Product name"
//                 />

//               </div>

//               <div>

//                 <label className="text-xs font-medium text-slateink">
//                   Unit
//                 </label>

//                 <input
//                   type="text"
//                   value={editProduct.unit}
//                   onChange={(e) =>
//                     setEditProduct({
//                       ...editProduct,
//                       unit:
//                         e.target.value
//                     })
//                   }
//                   className="input mt-1 w-full"
//                   placeholder="PCS, KG, MTR, etc."
//                 />

//               </div>


//               <div className="grid grid-cols-2 gap-3">

//                 <div>

//                   <label className="text-xs font-medium text-slateink">
//                     Quantity
//                   </label>

//                   <input
//                     type="number"
//                     min={1}
//                     value={editProduct.qty}
//                     onChange={(e) =>
//                       setEditProduct({
//                         ...editProduct,
//                         qty:
//                           Number(
//                             e.target.value
//                           ) || 1
//                       })
//                     }
//                     className="input mt-1 w-full"
//                   />

//                 </div>


//                 <div>

//                   <label className="text-xs font-medium text-slateink">
//                     Unit Price
//                   </label>

//                   <input
//                     type="number"
//                     min={0}
//                     step="0.01"
//                     value={editProduct.price}
//                     onChange={(e) =>
//                       setEditProduct({
//                         ...editProduct,
//                         price:
//                           Number(
//                             e.target.value
//                           ) || 0
//                       })
//                     }
//                     className="input mt-1 w-full"
//                   />

//                 </div>

//               </div>


//               <button
//                 type="button"
//                 onClick={saveEditProduct}
//                 disabled={
//                   !editProduct.name.trim()
//                 }
//                 className="w-full rounded-lg bg-blue-600 text-white text-sm font-medium py-2.5 hover:bg-blue-700 transition-colors disabled:opacity-50 mt-2 flex items-center justify-center gap-2"
//               >

//                 <Save size={16} />

//                 Save Product

//               </button>

//             </div>

//           </div>

//         </div>

//       )}

//     </>

//   )

// }


// /* ================================================================
//    CONVERT FIREBASE INVOICE TO PREVIEW
//    ================================================================ */

// function convertInvoiceToPreview(invoice) {

//   const total =
//     Number(
//       invoice.total || 0
//     )


//   const discount =
//     Math.min(
//       Math.max(
//         Number(
//           invoice.discount || 0
//         ),
//         0
//       ),
//       total
//     )


//   const netTotal =
//     invoice.netTotal !== undefined &&
//     invoice.netTotal !== null
//       ? Number(
//           invoice.netTotal
//         )
//       : Math.max(
//           0,
//           total - discount
//         )


//   return {

//     id:
//       invoice.id,

//     invoiceNumber:
//       invoice.invoiceNumber,

//     date:
//       invoice.date,

//     poNumber:
//       invoice.poNumber || '',

//     poDate:
//       invoice.poDate || '',

//     items:
//       invoice.items || [],

//     total:
//       total,

//     discount:
//       discount,

//     netTotal:
//       netTotal,

//     termsAndConditions:
//       invoice.termsAndConditions || '',

//     companyName:
//       invoice.companyName ||
//       COMPANY_NAME,

//     companyLogo:
//       invoice.companyLogo ||
//       COMPANY_LOGO,

//     companyAddress:
//       invoice.companyAddress ||
//       COMPANY_ADDRESS,

//     companyPhone:
//       invoice.companyPhone ||
//       COMPANY_PHONE,

//     companyNTN:
//       invoice.companyNTN ||
//       COMPANY_NTN,

//     companySTRN:
//       invoice.companySTRN ||
//       COMPANY_STRN,

//     customer: {

//       name:
//         invoice.customerName || '',

//       company:
//         invoice.customerCompany || '',

//       phone:
//         invoice.customerPhone || '',

//       address:
//         invoice.customerAddress || ''

//     }

//   }

// }


// /* ================================================================
//    INVOICE PREVIEW
//    ================================================================ */

// function InvoicePreview({
//   invoice,
//   onClose
// }) {

//   function printInvoice() {

//     window.print()

//   }


//   const total =
//     Number(
//       invoice.total || 0
//     )


//   const discount =
//     Math.min(
//       Math.max(
//         Number(
//           invoice.discount || 0
//         ),
//         0
//       ),
//       total
//     )


//   const netTotal =
//     invoice.netTotal !== undefined &&
//     invoice.netTotal !== null
//       ? Number(
//           invoice.netTotal
//         )
//       : Math.max(
//           0,
//           total - discount
//         )


//   // Check if customer has a name, otherwise use company as bold
//   const customerDisplayName = invoice.customer?.name?.trim() || invoice.customer?.company?.trim() || ''
//   const customerCompany = invoice.customer?.company?.trim() || ''
//   const showCompanySeparately = invoice.customer?.name?.trim() && invoice.customer?.company?.trim()


//   return (

//     <div className="invoice-preview-overlay fixed inset-0 z-[9999] bg-black/60 overflow-y-auto p-4 sm:p-8">


//       {/* ======================================================
//           TOP CONTROLS
//           ====================================================== */}

//       <div className="invoice-preview-controls max-w-[900px] mx-auto mb-4 flex items-center justify-between">

//         <div>

//           <p className="text-white font-semibold text-sm">
//             Invoice Preview
//           </p>

//           <p className="text-white/70 text-xs">
//             {invoice.invoiceNumber}
//           </p>

//         </div>


//         <div className="flex items-center gap-2">

//           <button
//             onClick={printInvoice}
//             className="inline-flex items-center gap-2 rounded-lg bg-white text-ink px-4 py-2 text-sm font-medium hover:bg-gray-100"
//           >

//             <Printer size={16} />

//             Print / Save as PDF

//           </button>


//           <button
//             onClick={onClose}
//             className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-white/10 text-white hover:bg-white/20"
//           >

//             <X size={18} />

//           </button>

//         </div>

//       </div>


//       {/* ======================================================
//           PRINT AREA
//           ====================================================== */}

//       <div
//         className="invoice-print-area"
//         id="invoice-print-area"
//       >

//         <div className="invoice-sheet">


//           {/* ==================================================
//               HEADER
//               ================================================== */}

//           <div className="invoice-header">


//             {/* COMPANY */}

//             <div className="invoice-company">

//               <img
//                 src={
//                   invoice.companyLogo ||
//                   COMPANY_LOGO
//                 }
//                 alt="Company Logo"
//                 className="invoice-logo"
//                 onError={(e) => {

//                   e.currentTarget.style.display =
//                     'none'

//                 }}
//               />


//               {(invoice.companyName || COMPANY_NAME) && (

//                 <div className="invoice-company-name">

//                   {invoice.companyName ||
//                     COMPANY_NAME}

//                 </div>

//               )}


//               <div className="invoice-company-address">

//                 {invoice.companyAddress ||
//                   COMPANY_ADDRESS}

//               </div>


//               {invoice.companyPhone && (

//                 <div className="invoice-company-address">

//                   {invoice.companyPhone}

//                 </div>

//               )}

//             </div>


//             {/* RIGHT SIDE */}

//             <div className="invoice-right-header">

//               <div className="invoice-tax-box">

//                 <div>
//                   NTN # {invoice.companyNTN || COMPANY_NTN}
//                 </div>

//                 <div>
//                   STRN # {invoice.companySTRN || COMPANY_STRN}
//                 </div>


//                 <div className="invoice-title">
//                   INVOICE
//                 </div>

//               </div>


//               <div className="invoice-meta-box">

//                 <div className="invoice-meta-title">
//                   Invoice No.
//                 </div>


//                 <div className="invoice-number">

//                   {invoice.invoiceNumber}

//                 </div>


//                 <div className="invoice-meta-row">

//                   <span>
//                     Date:
//                   </span>

//                   <span>

//                     {formatInvoiceDate(
//                       invoice.date
//                     )}

//                   </span>

//                 </div>


//                 <div className="invoice-meta-row">

//                   <span>
//                     P/Order No.
//                   </span>

//                   <span>
//                     {invoice.poNumber || ''}
//                   </span>

//                 </div>


//                 <div className="invoice-meta-row">

//                   <span>
//                     P/Order Date
//                   </span>

//                   <span>

//                     {invoice.poDate
//                       ? formatInvoiceDate(
//                           invoice.poDate
//                         )
//                       : ''}

//                   </span>

//                 </div>

//               </div>

//             </div>

//           </div>


//           {/* ==================================================
//               BUYER
//               ================================================== */}

//           <div className="invoice-buyer-box">

//             <div className="invoice-buyer-title">

//               Buyer's Name & Address

//             </div>


//             <div className="invoice-buyer-content">

//               {customerDisplayName && (
//                 <div className="invoice-buyer-name">
//                   {customerDisplayName}
//                 </div>
//               )}

//               {showCompanySeparately && customerCompany && (
//                 <div>
//                   {customerCompany}
//                 </div>
//               )}


//               {invoice.customer?.address && (

//                 <div>
//                   {invoice.customer.address}
//                 </div>

//               )}


//               {invoice.customer?.phone && (

//                 <div>
//                   {invoice.customer.phone}
//                 </div>

//               )}

//             </div>

//           </div>


//           {/* ==================================================
//               PRODUCT TABLE
//               ================================================== */}

//           <table className="invoice-table">

//             <colgroup>

//               <col className="qty-col " />

//               <col className="unit-col" />

//               <col className="description-col" />

//               <col className="price-col" />

//               <col className="amount-col" />

//             </colgroup>


//             <thead>

//               <tr>

//                 <th>
//                   Quantity
//                 </th>

//                 <th>
//                   Unit
//                 </th>

//                 <th >
//                   Description Of Goods
//                 </th>

//                 <th>
//                   Unit Price
//                 </th>

//                 <th>
//                   Amount
//                 </th>

//               </tr>

//             </thead>


//             <tbody>

//               {(invoice.items || []).map(
//                 (
//                   item,
//                   index
//                 ) => {

//                   const qty =
//                     Number(
//                       item.qty || 0
//                     )

//                   const price =
//                     Number(
//                       item.price || 0
//                     )

//                   const amount =
//                     qty * price


//                   return (

//                     <tr key={index}>

//                       <td className="quantity-cell">
//                         {qty}
//                       </td>

//                       <td>
//                         {item.unit || 'PCS'}
//                       </td>

//                       <td className="description-cell">
//                         {item.name}
//                       </td>

//                       <td className="number-cell">
//                         {currency(price)}
//                       </td>

//                       <td className="number-cell">
//                         {currency(amount)}
//                       </td>

//                     </tr>

//                   )

//                 }
//               )}


//               {Array.from({

//                 length:
//                   Math.max(
//                     3,
//                     8 -
//                       (
//                         invoice.items?.length ||
//                         0
//                       )
//                   )

//               }).map(
//                 (
//                   _,
//                   index
//                 ) => (

//                   <tr
//                     key={`empty-${index}`}
//                     className="invoice-empty-row"
//                   >

//                     <td></td>

//                     <td></td>

//                     <td></td>

//                     <td></td>

//                     <td></td>

//                   </tr>

//                 )
//               )}

//             </tbody>

//           </table>


//           {/* ============================================================
//               TOTAL / DISCOUNT / NET TOTAL
//               ============================================================ */}

//           <div className="invoice-total-wrapper">

//             {/* TOTAL */}

//             <div className="invoice-total-row">

//               <div className="invoice-total-label">
//                 Total
//               </div>

//               <div className="invoice-total-value">
//                 PKR: {currency(
//                   total
//                 )}
//               </div>

//             </div>


//             {/* DISCOUNT */}

//             <div className="invoice-total-row">

//               <div className="invoice-total-label">
//                 Discount
//               </div>

//               <div className="invoice-total-value">
//                PKR: {currency(
//                   discount
//                 )}
//               </div>

//             </div>


//             {/* NET TOTAL */}

//             <div className="invoice-total-row">

//               <div className="invoice-total-label">
//                 Net Total
//               </div>

//               <div className="invoice-total-value">
//                 PKR: {currency(
//                   netTotal
//                 )} 
//               </div>

//             </div>

//           </div>


//           {/* ============================================================
//               TERMS & CONDITIONS
//               ============================================================ */}

//           {invoice.termsAndConditions?.trim() && (

//             <div className="invoice-terms-box">

//               <div className="invoice-terms-title">
//                 Terms &amp; Condition
//               </div>


//               <div className="invoice-terms-content">

//                 {invoice.termsAndConditions
//                   .split(/\r?\n/)
//                   .map(
//                     (term, index) => {

//                       const cleanTerm =
//                         term.trim()

//                       if (!cleanTerm) {
//                         return null
//                       }


//                       return (

//                         <div
//                           key={index}
//                           className="invoice-term-item"
//                         >

//                           <span className="invoice-term-number">
//                             {index + 1}.
//                           </span>

//                           <span className="invoice-term-text">
//                             {cleanTerm}
//                           </span>

//                         </div>

//                       )

//                     }
//                   )}

//               </div>

//             </div>

//           )}


//           {/* ==================================================
//               FOOTER
//               ================================================== */}

//           <div className="invoice-footer-note">

//             <p>

//               Note: This is a computer generated invoice, does not require any stamp or signature.

//             </p>

//           </div>


//         </div>

//       </div>

//     </div>

//   )

// }


// /* ================================================================
//    DATE FORMAT
//    ================================================================ */

// function formatInvoiceDate(value) {

//   if (!value) {

//     return ''

//   }


//   const date =
//     new Date(value)


//   if (
//     Number.isNaN(
//       date.getTime()
//     )
//   ) {

//     return value

//   }


//   const day =
//     String(
//       date.getDate()
//     ).padStart(
//       2,
//       '0'
//     )


//   const month =
//     String(
//       date.getMonth() + 1
//     ).padStart(
//       2,
//       '0'
//     )


//   const year =
//     date.getFullYear()


//   return `${day}/${month}/${year}`

// }


// /* ================================================================
//    INVOICE CSS
//    ================================================================ */

// const invoicePrintStyles = `

// /* ============================================================
//    INVOICE SHEET
//    ============================================================ */

// .invoice-sheet {

//   width: 210mm;

//   min-height: 297mm;

//   background: #ffffff;

//   margin: 0 auto;

//   padding: 15mm 17mm;

//   box-sizing: border-box;

//   color: #111111;

//   font-family:
//     Arial,
//     Helvetica,
//     sans-serif;

// }


// /* ============================================================
//    HEADER
//    ============================================================ */

// .invoice-header {

//   display: flex;

//   justify-content: space-between;

//   align-items: flex-start;

//   min-height: 55mm;

// }


// .invoice-company {

//   width: 53%;

// }


// .invoice-logo {

//   width: 42mm;

//   height: 25mm;

//   object-fit: contain;

//   object-position: left center;

//   display: block;

//   margin-bottom: 0.5mm;

// }


// .invoice-company-name {

//   font-size: 16px;

//   font-weight: 700;

//   margin-bottom: 1mm;

// }


// .invoice-company-address {

//   white-space: pre-line;

//   font-size: 10px;

//   line-height: 1.4;

// }


// /* ============================================================
//    RIGHT HEADER
//    ============================================================ */

// .invoice-right-header {

//   width: 40%;

//   padding-top: 2mm;

// }


// .invoice-tax-box {

//   border: 1px solid #222;

//   padding: 2.5mm 2mm;

//   font-size: 10px;

//   line-height: 1.5;

// }


// .invoice-title {

//   font-size: 14px;

//   font-weight: 700;

//   margin-top: 1mm;

// }


// .invoice-meta-box {

//   border: 1px solid #222;

//   margin-top: 5mm;

//   font-size: 10px;

// }


// .invoice-meta-title {

//   font-weight: 700;

//   padding: 1.8mm 2mm 0.5mm;

// }


// .invoice-number {

//   padding: 0 2mm 1.5mm;

//   font-size: 10px;

//   font-weight: 600;

// }


// .invoice-meta-row {

//   display: grid;

//   grid-template-columns: 1fr 1fr;

//   border-top: 1px solid #222;

//   min-height: 6mm;

// }


// .invoice-meta-row span {

//   padding: 1.1mm 1.5mm;

// }


// .invoice-meta-row span:first-child {

//   border-right: 1px solid #222;

//   text-align: right;

// }


// .invoice-meta-row span:last-child {

//   text-align: left;

// }


// /* ============================================================
//    BUYER
//    ============================================================ */

// .invoice-buyer-box {

//   width: 54%;

//   border: 1px solid #222;

//   margin-bottom: 18mm;

//   font-size: 10px;

// }


// .invoice-buyer-title {

//   font-weight: 700;

//   background: #f1f1f1;

//   border-bottom: 1px solid #222;

//   padding: 1.6mm 2mm;

// }


// .invoice-buyer-content {

//   min-height: 8mm;

//   padding: 1.6mm 2mm;

//   line-height: 1.4;

// }


// .invoice-buyer-name {

//   font-weight: 600;

// }


// /* ============================================================
//    PRODUCT TABLE
//    ============================================================ */

// .invoice-table {

//   width: 100%;

//   table-layout: fixed;

//   border-collapse: collapse;

//   border: 1px solid #222;

//   font-size: 10px;

// }


// .invoice-table .qty-col {

//   width: 13%;

// }


// .invoice-table .unit-col {

//   width: 10%;

// }


// .invoice-table .description-col {

//   width: 43%;

// }


// .invoice-table .price-col {

//   width: 17%;

// }


// .invoice-table .amount-col {

//   width: 17%;

// }


// .invoice-table thead th {

//   padding: 2.8mm 1.8mm;

//   font-weight: 700;

//   text-align: center;

//   border-left: 1px solid #222;

//   border-right: 1px solid #222;

//   border-bottom: 1px solid #222;

//   border-top: 0;

// }


// .invoice-table tbody td:nth-child(2) {
//   text-align: center;
// }

// .invoice-table tbody td {

//   padding: 1.5mm 1.8mm;

//   height: 6mm;

//   vertical-align: top;

//   border-left: 1px solid #222;

//   border-right: 1px solid #222;

//   border-top: 0 !important;

//   border-bottom: 0 !important;

//   background: transparent !important;

// }


// .invoice-table .quantity-cell {

//   text-align: center;

// }


// .invoice-table .description-cell {

//   text-align: left;

// }


// .invoice-table .number-cell {

//   text-align: right;

//   white-space: nowrap;

// }


// .invoice-table tbody .invoice-empty-row td {

//   height: 1mm;

//   border-left: 1px solid #222 !important;

//   border-right: 1px solid #222 !important;

//   border-top: 0 !important;

//   border-bottom: 0 !important;

// }


// .invoice-table th:first-child,
// .invoice-table td:first-child {

//   border-left: 1px solid #222 !important;

// }


// .invoice-table th:last-child,
// .invoice-table td:last-child {

//   border-right: 1px solid #222 !important;

// }


// .invoice-table tbody tr:last-child td {

//   border-bottom: 1px solid #222 !important;

// }


// /* ============================================================
//    TOTAL / DISCOUNT / NET TOTAL
//    ============================================================ */

// .invoice-total-wrapper {

//   width: 34%;

//   margin-top: 5mm;

//   margin-left: auto;

//   display: flex;

//   flex-direction: column;

//   align-items: stretch;

// }


// .invoice-total-row {

//   width: 100%;

//   display: flex;

//   flex-direction: row;

//   margin: 0;

//   padding: 0;

// }


// /* ============================================================
//    LABEL
//    ============================================================ */

// .invoice-total-label {

//   width: 50%;

//   box-sizing: border-box;

//   border-left: 1px solid #222;

//   border-right: 1px solid #222;

//   border-top: 1px solid #222;

//   padding: 2.8mm 3mm;

//   font-size: 10px;

//   font-weight: 700;

//   text-align: center;

//   line-height: 1.2;

// }


// /* ============================================================
//    VALUE
//    ============================================================ */

// .invoice-total-value {

//   width: 50%;

//   box-sizing: border-box;

//   border-right: 1px solid #222;

//   border-top: 1px solid #222;

//   padding: 2.8mm 3mm;

//   font-size: 10px;

//   font-weight: 700;

//   text-align: right;

//   line-height: 1.2;

// }


// /* ============================================================
//    IMPORTANT:
//    NO BOTTOM BORDER ON TOTAL
//    ============================================================ */

// .invoice-total-row:first-child
// .invoice-total-label,

// .invoice-total-row:first-child
// .invoice-total-value {

//   border-bottom: 0;

// }


// /* ============================================================
//    DISCOUNT TOP BORDER
//    This creates the separator between Total and Discount.
//    ============================================================ */

// .invoice-total-row:nth-child(2)
// .invoice-total-label,

// .invoice-total-row:nth-child(2)
// .invoice-total-value {

//   border-top: 1px solid #222;

//   border-bottom: 0;

// }


// /* ============================================================
//    NET TOTAL
//    ============================================================ */

// .invoice-total-row:last-child
// .invoice-total-label,

// .invoice-total-row:last-child
// .invoice-total-value {

//   border-top: 1px solid #222;

//   border-bottom: 1px solid #222;

// }


// /* ============================================================
//    TERMS & CONDITIONS
//    ============================================================ */

// .invoice-terms-box {

//   width: 100%;

//   box-sizing: border-box;

//   border: 1px solid #222;

//   margin-top: 7mm;

//   font-size: 9.5px;

//   page-break-inside: avoid;

// }


// .invoice-terms-title {

//   display: block;

//   width: 100%;

//   box-sizing: border-box;

//   padding: 1.8mm 2.5mm;

//   background: #f1f1f1;

//   border-bottom: 1px solid #222;

//   font-size: 10px;

//   font-weight: 700;

//   text-align: left;

// }


// .invoice-terms-content {

//   width: 100%;

//   box-sizing: border-box;

//   padding: 2.5mm 3mm;

// }


// .invoice-term-item {

//   display: flex;

//   width: 100%;

//   box-sizing: border-box;

//   margin: 0;

//   padding: 0.8mm 0;

//   line-height: 1.00;

// }


// .invoice-term-number {

//   width: 7mm;

//   flex-shrink: 0;

//   font-weight: 600;

// }


// .invoice-term-text {

//   flex: 1;

//   min-width: 0;

//   white-space: normal;

//   overflow-wrap: break-word;

// }


// /* ============================================================
//    FOOTER
//    ============================================================ */

// .invoice-footer-note {

//   margin-top: 4mm;

//   padding-top: 2mm;

//   border-top: 1px solid #ccc;

// }


// .invoice-footer-note p {

//   text-align: center;

//   font-size: 9px;

//   color: #888;

//   margin: 0;

//   font-style: italic;

// }


// /* ============================================================
//    PRINT
//    ============================================================ */

// @media print {

//   @page {

//     size: A4 portrait;

//     margin: 0;

//   }


//   html,
//   body {

//     width: 210mm;

//     min-height: 297mm;

//     margin: 0 !important;

//     padding: 0 !important;

//     background: white !important;

//   }


//   body * {

//     visibility: hidden !important;

//   }


//   .invoice-print-area,
//   .invoice-print-area * {

//     visibility: visible !important;

//   }


//   .invoice-preview-overlay {

//     position: static !important;

//     width: 210mm !important;

//     min-height: 297mm !important;

//     padding: 0 !important;

//     margin: 0 !important;

//     overflow: visible !important;

//     background: white !important;

//   }


//   .invoice-preview-controls {

//     display: none !important;

//   }


//   .invoice-print-area {

//     position: absolute !important;

//     left: 0 !important;

//     top: 0 !important;

//     width: 210mm !important;

//     margin: 0 !important;

//     padding: 0 !important;

//   }


//   .invoice-sheet {

//     width: 210mm !important;

//     min-height: 297mm !important;

//     margin: 0 !important;

//     padding: 15mm 17mm !important;

//     box-sizing: border-box !important;

//     box-shadow: none !important;

//   }


//   /* ==========================================================
//      PRODUCT TABLE PRINT
//      ========================================================== */

//   .invoice-table {

//     width: 100% !important;

//     border-collapse: collapse !important;

//     border: 1px solid #222 !important;

//   }


//   .invoice-table thead th {

//     border-left: 1px solid #222 !important;

//     border-right: 1px solid #222 !important;

//     border-top: 0 !important;

//     border-bottom: 1px solid #222 !important;

//   }


//   .invoice-table tbody td {

//     border-left: 1px solid #222 !important;

//     border-right: 1px solid #222 !important;

//     border-top: 0 !important;

//     border-bottom: 0 !important;

//     background: transparent !important;

//   }


//   .invoice-table tbody .invoice-empty-row td {

//     border-left: 1px solid #222 !important;

//     border-right: 1px solid #222 !important;

//     border-top: 0 !important;

//     border-bottom: 0 !important;

//   }


//   .invoice-table tbody tr:last-child td {

//     border-bottom: 1px solid #222 !important;

//   }


//   /* ==========================================================
//      TOTAL / DISCOUNT / NET TOTAL PRINT
//      ========================================================== */

//   .invoice-total-wrapper {

//     width: 34% !important;

//     margin-top: 5mm !important;

//     margin-left: auto !important;

//     display: flex !important;

//     flex-direction: column !important;

//     align-items: stretch !important;

//   }


//   .invoice-total-row {

//     width: 100% !important;

//     display: flex !important;

//     flex-direction: row !important;

//     margin: 0 !important;

//     padding: 0 !important;

//   }


//   .invoice-total-label {

//     width: 50% !important;

//     box-sizing: border-box !important;

//     border-left: 1px solid #222 !important;

//     border-right: 1px solid #222 !important;

//     border-top: 1px solid #222 !important;

//     padding: 2.8mm 3mm !important;

//     font-size: 10px !important;

//     font-weight: 700 !important;

//     text-align: center !important;

//     line-height: 1.2 !important;

//   }


//   .invoice-total-value {

//     width: 50% !important;

//     box-sizing: border-box !important;

//     border-right: 1px solid #222 !important;

//     border-top: 1px solid #222 !important;

//     padding: 2.8mm 3mm !important;

//     font-size: 10px !important;

//     font-weight: 700 !important;

//     text-align: right !important;

//     line-height: 1.2 !important;

//   }


//   /* ==========================================================
//      TOTAL:
//      NO BOTTOM BORDER
//      ========================================================== */

//   .invoice-total-row:first-child
//   .invoice-total-label,

//   .invoice-total-row:first-child
//   .invoice-total-value {

//     border-bottom: 0 !important;

//   }


//   /* ==========================================================
//      DISCOUNT:
//      TOP SEPARATOR ONLY
//      ========================================================== */

//   .invoice-total-row:nth-child(2)
//   .invoice-total-label,

//   .invoice-total-row:nth-child(2)
//   .invoice-total-value {

//     border-top: 1px solid #222 !important;

//     border-bottom: 0 !important;

//   }


//   /* ==========================================================
//      NET TOTAL:
//      TOP + BOTTOM
//      ========================================================== */

//   .invoice-total-row:last-child
//   .invoice-total-label,

//   .invoice-total-row:last-child
//   .invoice-total-value {

//     border-top: 1px solid #222 !important;

//     border-bottom: 1px solid #222 !important;

//   }


//   /* ==========================================================
//      TERMS & CONDITIONS PRINT
//      ========================================================== */

//   .invoice-terms-box {

//     width: 100% !important;

//     box-sizing: border-box !important;

//     border: 1px solid #222 !important;

//     margin-top: 7mm !important;

//     page-break-inside: avoid !important;

//     break-inside: avoid !important;

//   }


//   .invoice-terms-title {

//     display: block !important;

//     width: 100% !important;

//     box-sizing: border-box !important;

//     padding: 1.8mm 2.5mm !important;

//     background: #f1f1f1 !important;

//     border-bottom: 1px solid #222 !important;

//     font-size: 10px !important;

//     font-weight: 700 !important;

//     text-align: left !important;

//     -webkit-print-color-adjust: exact !important;

//     print-color-adjust: exact !important;

//   }


//   .invoice-terms-content {

//     width: 100% !important;

//     box-sizing: border-box !important;

//     padding: 2.5mm 3mm !important;

//     -webkit-print-color-adjust: exact !important;

//     print-color-adjust: exact !important;

//   }


//   .invoice-term-item {

//     display: flex !important;

//     width: 100% !important;

//     box-sizing: border-box !important;

//     margin: 0 !important;

//     padding: 0.8mm 0 !important;

//     line-height: 1.45 !important;

//   }


//   .invoice-term-number {

//     width: 7mm !important;

//     flex-shrink: 0 !important;

//     font-weight: 600 !important;

//   }


//   .invoice-term-text {

//     flex: 1 !important;

//     min-width: 0 !important;

//     white-space: normal !important;

//     overflow-wrap: break-word !important;

//   }


//   /* ==========================================================
//      FOOTER PRINT
//      ========================================================== */

//   .invoice-footer-note {

//     border-top: 1px solid #ccc !important;

//   }

// }

// `


// /* ================================================================
//    INSERT PRINT CSS
//    ================================================================ */

// if (
//   typeof document !== 'undefined'
// ) {

//   const styleId =
//     'invoice-print-styles'


//   const oldStyle =
//     document.getElementById(
//       styleId
//     )


//   if (!oldStyle) {

//     const style =
//       document.createElement(
//         'style'
//       )


//     style.id =
//       styleId


//     style.innerHTML =
//       invoicePrintStyles


//     document.head.appendChild(
//       style
//     )

//   }

// }





//sorting

// import { useEffect, useMemo, useState } from 'react'

// import {
//   ref,
//   push,
//   onValue,
//   update,
//   get,
//   set,
//   remove
// } from 'firebase/database'

// import {
//   Plus,
//   Trash2,
//   Receipt,
//   Pencil,
//   Printer,
//   X,
//   Save,
//   Download,
//   Search,
//   ArrowUpDown
// } from 'lucide-react'

// import { db } from '../firebase'
// import { useAuth } from '../context/AuthContext'

// import {
//   formatDate,
//   todayISO,
//   currency
// } from '../utils/helpers'

// import { Modal } from './Customers'
// import Loader from '../components/Loader'


// /* ============================================================
//    COMPANY INFORMATION
//    ============================================================ */

// const COMPANY_NAME = ''

// const COMPANY_LOGO = '/PN.png'

// const COMPANY_ADDRESS = `
// KCHS, Gohar Chamber, Office # 304,
// Shahra-e-Faisal, near Duty Free Shop,
// Karachi, 75600
// `

// const COMPANY_PHONE = '0341-1293604'

// const COMPANY_NTN = '-'

// const COMPANY_STRN = '-'


// /* ============================================================
//    INVOICE NUMBER GENERATOR
//    ============================================================ */

// function getTodayDateString() {

//   const today = new Date()

//   const year =
//     today.getFullYear()

//   const month =
//     String(
//       today.getMonth() + 1
//     ).padStart(2, '0')

//   const day =
//     String(
//       today.getDate()
//     ).padStart(2, '0')

//   return `${year}${month}${day}`

// }


// async function getNextInvoiceNumber(companyId) {

//   try {

//     const dateStr =
//       getTodayDateString()

//     const counterRef =
//       ref(
//         db,
//         `companies/${companyId}/counters/invoice`
//       )

//     const snapshot =
//       await get(counterRef)

//     let lastNumber = 0
//     let lastDate = ''

//     if (snapshot.exists()) {

//       const data =
//         snapshot.val()

//       lastNumber =
//         data.number || 0

//       lastDate =
//         data.date || ''

//     }

//     let nextNumber =
//       lastNumber + 1

//     if (lastDate !== dateStr) {

//       nextNumber = 1

//     }

//     const padded =
//       String(
//         nextNumber
//       ).padStart(4, '0')

//     return `INV-${dateStr}-${padded}`

//   } catch (error) {

//     console.error(
//       'Error getting invoice number:',
//       error
//     )

//     const dateStr =
//       getTodayDateString()

//     const timestamp =
//       Date.now()
//         .toString()
//         .slice(-6)

//     return `INV-${dateStr}-${timestamp}`

//   }

// }


// async function incrementInvoiceCounter(companyId) {

//   try {

//     const dateStr =
//       getTodayDateString()

//     const counterRef =
//       ref(
//         db,
//         `companies/${companyId}/counters/invoice`
//       )

//     const snapshot =
//       await get(counterRef)

//     let lastNumber = 0
//     let lastDate = ''

//     if (snapshot.exists()) {

//       const data =
//         snapshot.val()

//       lastNumber =
//         data.number || 0

//       lastDate =
//         data.date || ''

//     }

//     let newNumber =
//       lastNumber + 1

//     if (lastDate !== dateStr) {

//       newNumber = 1

//     }

//     await set(
//       counterRef,
//       {
//         date: dateStr,
//         number: newNumber
//       }
//     )

//     return {
//       number: newNumber,
//       date: dateStr
//     }

//   } catch (error) {

//     console.error(
//       'Error incrementing counter:',
//       error
//     )

//     return null

//   }

// }


// /* ============================================================
//    EMPTY PRODUCT
//    ============================================================ */

// const emptyItem = {
//   name: '',
//   qty: 1,
//   price: '',
//   unit: 'PCS'  // Added unit field with default
// }


// /* ============================================================
//    HELPER: GET CUSTOMER DISPLAY NAME
//    ============================================================ */

// function getCustomerDisplayInfo(invoice) {
//   const name = String(invoice.customerName || '').trim()
//   const company = String(invoice.customerCompany || '').trim()

//   return {
//     primary: name || company || '-',
//     secondary: name && company ? company : '',
//     hasName: !!name,
//     hasCompany: !!company
//   }
// }


// /* ============================================================
//    MAIN INVOICE COMPONENT
//    ============================================================ */

// export default function Invoice() {

//   const { companyId } =
//     useAuth()


//   const [customers, setCustomers] =
//     useState(null)

//   const [invoices, setInvoices] =
//     useState(null)

//   const [showForm, setShowForm] =
//     useState(false)

//   const [preview, setPreview] =
//     useState(null)

//   const [editingInvoice, setEditingInvoice] =
//     useState(null)

//   const [customerId, setCustomerId] =
//     useState('')

//   /* ============================================================
//      CUSTOMER SEARCH
//      ============================================================ */

//   const [customerSearch, setCustomerSearch] =
//     useState('')

//   const [showCustomerDropdown, setShowCustomerDropdown] =
//     useState(false)

//   const [invoiceNumber, setInvoiceNumber] =
//     useState('')


//   /* ============================================================
//      INVOICE DATE
//      ============================================================ */

//   const [invoiceDate, setInvoiceDate] =
//     useState(
//       todayISO()
//     )


//   const [poNumber, setPoNumber] =
//     useState('')

//   const [poDate, setPoDate] =
//     useState('')


//   const [items, setItems] =
//     useState([])


//   const [pick, setPick] =
//     useState({
//       ...emptyItem
//     })


//   /* ============================================================
//      DISCOUNT
//      ============================================================ */

//   const [discount, setDiscount] =
//     useState(0)


//   /* ============================================================
//      TERMS & CONDITIONS
//      ============================================================ */

//   const [termsAndConditions, setTermsAndConditions] =
//     useState('')


//   const [saving, setSaving] =
//     useState(false)

//   const [error, setError] =
//     useState('')


//   /* ============================================================
//      DELETE CONFIRMATION
//      ============================================================ */

//   const [deleteConfirm, setDeleteConfirm] =
//     useState(null)

//   const [deleting, setDeleting] =
//     useState(false)


//   /* ============================================================
//      EDIT PRODUCT STATE
//      ============================================================ */

//   const [editingProductIndex, setEditingProductIndex] =
//     useState(null)


//   const [editProduct, setEditProduct] =
//     useState({
//       name: '',
//       qty: 1,
//       price: 0,
//       unit: 'PCS'
//     })


//   /* ============================================================
//      SEARCH STATE
//      ============================================================ */

//   const [searchTerm, setSearchTerm] =
//     useState('')


//   /* ============================================================
//      SORT STATE
//      ============================================================ */

//   const [sortBy, setSortBy] =
//     useState('date-desc')


//   /* ============================================================
//      LOAD CUSTOMERS AND INVOICES
//      ============================================================ */

//   useEffect(() => {

//     if (!companyId) {

//       return

//     }


//     const customersRef =
//       ref(
//         db,
//         `companies/${companyId}/customers`
//       )


//     const unsubscribeCustomers =
//       onValue(
//         customersRef,

//         (snapshot) => {

//           const value =
//             snapshot.val() || {}

//           const list =
//             Object.entries(value)
//               .map(
//                 ([id, customer]) => ({
//                   id,
//                   ...customer
//                 })
//               )

//           setCustomers(list)

//         },

//         (err) => {

//           console.error(
//             'Customers read failed:',
//             err
//           )

//           setCustomers([])

//         }
//       )


//     const invoicesRef =
//       ref(
//         db,
//         `companies/${companyId}/invoices`
//       )


//     const unsubscribeInvoices =
//       onValue(
//         invoicesRef,

//         (snapshot) => {

//           const value =
//             snapshot.val() || {}

//           const list =
//             Object.entries(value)
//               .map(
//                 ([id, invoice]) => ({
//                   id,
//                   ...invoice
//                 })
//               )

//           setInvoices(list)

//         },

//         (err) => {

//           console.error(
//             'Invoices read failed:',
//             err
//           )

//           setInvoices([])

//         }
//       )


//     return () => {

//       unsubscribeCustomers()

//       unsubscribeInvoices()

//     }

//   }, [companyId])


//   /* ============================================================
//      FILTERED CUSTOMERS
//      ============================================================ */

//   const filteredCustomers =
//     useMemo(() => {

//       const search =
//         customerSearch
//           .trim()
//           .toLowerCase()

//       if (!search) {
//         return customers || []
//       }

//       return (customers || []).filter(
//         customer => {
//           const name = String(customer.name || '').toLowerCase()
//           const company = String(customer.company || '').toLowerCase()
//           const phone = String(customer.phone || '').toLowerCase()
//           const address = String(customer.address || '').toLowerCase()

//           return (
//             name.includes(search) ||
//             company.includes(search) ||
//             phone.includes(search) ||
//             address.includes(search)
//           )
//         }
//       )
//     }, [customers, customerSearch])


//   /* ============================================================
//      FILTERED + SORTED INVOICES
//      ============================================================ */

//   const filteredInvoices =
//     useMemo(() => {

//       if (!invoices) return []

//       const search =
//         searchTerm
//           .trim()
//           .toLowerCase()

//       // First filter
//       let result = invoices

//       if (search) {
//         result = invoices.filter(
//           invoice => {

//             // Search by invoice number
//             if (
//               invoice.invoiceNumber &&
//               invoice.invoiceNumber
//                 .toLowerCase()
//                 .includes(search)
//             ) {
//               return true
//             }

//             // Search by customer name
//             if (
//               invoice.customerName &&
//               invoice.customerName
//                 .toLowerCase()
//                 .includes(search)
//             ) {
//               return true
//             }

//             // Search by customer company
//             if (
//               invoice.customerCompany &&
//               invoice.customerCompany
//                 .toLowerCase()
//                 .includes(search)
//             ) {
//               return true
//             }

//             // Search by date (formatted)
//             if (
//               invoice.date &&
//               formatDate(invoice.date)
//                 .toLowerCase()
//                 .includes(search)
//             ) {
//               return true
//             }

//             // Search by PO number
//             if (
//               invoice.poNumber &&
//               invoice.poNumber
//                 .toLowerCase()
//                 .includes(search)
//             ) {
//               return true
//             }

//             return false
//           }
//         )
//       }

//       // Then sort
//       const sorted = [...result]

//       const getAmount = (inv) => {
//         if (inv.netTotal !== undefined && inv.netTotal !== null) {
//           return Number(inv.netTotal) || 0
//         }
//         return Math.max(
//           0,
//           Number(inv.total || 0) - Number(inv.discount || 0)
//         )
//       }

//       switch (sortBy) {
//         case 'date-asc':
//           sorted.sort((a, b) => {
//             const dateA = new Date(a.date || 0).getTime()
//             const dateB = new Date(b.date || 0).getTime()
//             if (dateA !== dateB) return dateA - dateB
//             return (a.createdAt || 0) - (b.createdAt || 0)
//           })
//           break

//         case 'amount-desc':
//           sorted.sort((a, b) => {
//             const amountA = getAmount(a)
//             const amountB = getAmount(b)
//             if (amountB !== amountA) return amountB - amountA
//             return (b.createdAt || 0) - (a.createdAt || 0)
//           })
//           break

//         case 'amount-asc':
//           sorted.sort((a, b) => {
//             const amountA = getAmount(a)
//             const amountB = getAmount(b)
//             if (amountA !== amountB) return amountA - amountB
//             return (b.createdAt || 0) - (a.createdAt || 0)
//           })
//           break

//         case 'date-desc':
//         default:
//           sorted.sort((a, b) => {
//             const dateA = new Date(a.date || 0).getTime()
//             const dateB = new Date(b.date || 0).getTime()
//             if (dateA !== dateB) return dateB - dateA
//             return (b.createdAt || 0) - (a.createdAt || 0)
//           })
//           break
//       }

//       return sorted

//     }, [invoices, searchTerm, sortBy])


//   /* ============================================================
//      SELECT CUSTOMER
//      ============================================================ */

//   function selectCustomer(customer) {
//     setCustomerId(customer.id)
//     setCustomerSearch(
//       `${customer.name || ''}${customer.company ? ` — ${customer.company}` : ''}`
//     )
//     setShowCustomerDropdown(false)
//     setError('')
//   }


//   /* ============================================================
//      TOTAL
//      ============================================================ */

//   const total =
//     useMemo(() => {

//       return items.reduce(
//         (sum, item) => {

//           const qty =
//             Number(item.qty) || 0

//           const price =
//             Number(item.price) || 0

//           return (
//             sum +
//             qty * price
//           )

//         },
//         0
//       )

//     }, [items])


//   /* ============================================================
//      DISCOUNT VALUE
//      ============================================================ */

//   const discountValue =
//     useMemo(() => {

//       const value =
//         Number(discount) || 0

//       return Math.min(
//         Math.max(
//           value,
//           0
//         ),
//         total
//       )

//     }, [discount, total])


//   /* ============================================================
//      NET TOTAL
//      ============================================================ */

//   const netTotal =
//     useMemo(() => {

//       return Math.max(
//         0,
//         total - discountValue
//       )

//     }, [total, discountValue])


//   /* ============================================================
//      ADD PRODUCT
//      ============================================================ */

//   function addItem() {

//     if (!pick.name.trim()) {

//       return

//     }


//     const newItem = {

//       name:
//         pick.name.trim(),

//       qty:
//         Math.max(
//           1,
//           Number(pick.qty) || 1
//         ),

//       price:
//         Math.max(
//           0,
//           Number(pick.price) || 0
//         ),

//       unit:
//         pick.unit || 'PCS'

//     }


//     setItems(
//       previous => [
//         ...previous,
//         newItem
//       ]
//     )


//     setPick({
//       ...emptyItem
//     })

//   }


//   /* ============================================================
//      REMOVE PRODUCT
//      ============================================================ */

//   function removeItem(index) {

//     setItems(
//       previous =>
//         previous.filter(
//           (_, i) =>
//             i !== index
//         )
//     )

//   }


//   /* ============================================================
//      EDIT PRODUCT - OPEN
//      ============================================================ */

//   function openEditProduct(index) {

//     const item =
//       items[index]

//     if (!item) {

//       return

//     }

//     setEditingProductIndex(
//       index
//     )

//     setEditProduct({

//       name:
//         item.name,

//       qty:
//         item.qty,

//       price:
//         item.price,

//       unit:
//         item.unit || 'PCS'

//     })

//   }


//   /* ============================================================
//      EDIT PRODUCT - SAVE
//      ============================================================ */

//   function saveEditProduct() {

//     if (
//       !editProduct.name.trim()
//     ) {

//       return

//     }


//     if (
//       editingProductIndex === null
//     ) {

//       return

//     }


//     const updatedItems =
//       [...items]


//     updatedItems[
//       editingProductIndex
//     ] = {

//       name:
//         editProduct.name.trim(),

//       qty:
//         Math.max(
//           1,
//           Number(
//             editProduct.qty
//           ) || 1
//         ),

//       price:
//         Math.max(
//           0,
//           Number(
//             editProduct.price
//           ) || 0
//         ),

//       unit:
//         editProduct.unit || 'PCS'

//     }


//     setItems(
//       updatedItems
//     )


//     setEditingProductIndex(
//       null
//     )


//     setEditProduct({

//       name: '',
//       qty: 1,
//       price: 0,
//       unit: 'PCS'

//     })

//   }


//   /* ============================================================
//      EDIT PRODUCT - CLOSE
//      ============================================================ */

//   function closeEditProduct() {

//     setEditingProductIndex(
//       null
//     )

//     setEditProduct({

//       name: '',
//       qty: 1,
//       price: 0,
//       unit: 'PCS'

//     })

//   }


//   /* ============================================================
//      RESET FORM
//      ============================================================ */

//   function resetForm() {

//     setCustomerId('')
//     setCustomerSearch('')
//     setShowCustomerDropdown(false)

//     setInvoiceNumber('')

//     setInvoiceDate(
//       todayISO()
//     )

//     setPoNumber('')

//     setPoDate('')

//     setItems([])

//     setPick({
//       ...emptyItem
//     })

//     setDiscount(0)

//     setTermsAndConditions('')

//     setEditingInvoice(
//       null
//     )

//     setError('')

//     setEditingProductIndex(
//       null
//     )

//     setEditProduct({

//       name: '',
//       qty: 1,
//       price: 0,
//       unit: 'PCS'

//     })

//   }


//   /* ============================================================
//      DELETE INVOICE
//      ============================================================ */

//   async function handleDeleteInvoice() {

//     if (
//       !companyId ||
//       !deleteConfirm
//     ) {

//       return

//     }


//     setDeleting(true)


//     try {

//       const invoiceRef =
//         ref(
//           db,
//           `companies/${companyId}/invoices/${deleteConfirm.id}`
//         )


//       await remove(
//         invoiceRef
//       )


//       setDeleteConfirm(
//         null
//       )

//     } catch (err) {

//       console.error(
//         'Invoice delete error:',
//         err
//       )

//       alert(
//         'Invoice delete nahi ho saka. Dobara koshish karein.'
//       )

//     } finally {

//       setDeleting(false)

//     }

//   }


//   /* ============================================================
//      OPEN NEW INVOICE
//      ============================================================ */

//   const openNewInvoice =
//     async () => {

//       resetForm()

//       setInvoiceDate(
//         todayISO()
//       )

//       setDiscount(0)

//       setTermsAndConditions('')


//       if (companyId) {

//         const number =
//           await getNextInvoiceNumber(
//             companyId
//           )

//         setInvoiceNumber(
//           number
//         )

//       }


//       setShowForm(
//         true
//       )

//     }


//   /* ============================================================
//      OPEN EDIT INVOICE
//      ============================================================ */

//   function openEditInvoice(invoice) {

//     setEditingInvoice(
//       invoice
//     )


//     setCustomerId(
//       invoice.customerId || ''
//     )

//     const editCustomer =
//       customers?.find(
//         customer =>
//           customer.id === invoice.customerId
//       )

//     setCustomerSearch(
//       editCustomer
//         ? `${editCustomer.name || ''}${editCustomer.company ? ` — ${editCustomer.company}` : ''}`
//         : invoice.customerName || invoice.customerCompany || ''
//     )

//     setShowCustomerDropdown(false)


//     setInvoiceNumber(
//       invoice.invoiceNumber || ''
//     )


//     setInvoiceDate(
//       invoice.date ||
//       todayISO()
//     )


//     setPoNumber(
//       invoice.poNumber || ''
//     )


//     setPoDate(
//       invoice.poDate || ''
//     )


//     setItems(
//       Array.isArray(
//         invoice.items
//       )
//         ? invoice.items.map(
//             item => ({

//               name:
//                 item.name || '',

//               qty:
//                 Number(
//                   item.qty
//                 ) || 1,

//               price:
//                 Number(
//                   item.price
//                 ) || 0,

//               unit:
//                 item.unit || 'PCS'

//             })
//           )
//         : []
//     )


//     setDiscount(
//       Math.max(
//         0,
//         Number(
//           invoice.discount
//         ) || 0
//       )
//     )


//     setTermsAndConditions(
//       invoice.termsAndConditions || ''
//     )


//     setPick({
//       ...emptyItem
//     })


//     setError('')


//     setEditingProductIndex(
//       null
//     )


//     setShowForm(
//       true
//     )

//   }


//   /* ============================================================
//      CLOSE FORM
//      ============================================================ */

//   function closeForm() {

//     if (saving) {

//       return

//     }

//     setShowForm(false)

//     resetForm()

//   }


//   /* ============================================================
//      SAVE / UPDATE INVOICE
//      ============================================================ */

//   async function handleSubmit(e) {

//     e.preventDefault()

//     setError('')


//     if (!companyId) {

//       setError(
//         'Company ID nahi mila.'
//       )

//       return

//     }


//     if (!customerId) {

//       setError(
//         'Customer select karein.'
//       )

//       return

//     }


//     if (!invoiceDate) {

//       setError(
//         'Invoice date select karein.'
//       )

//       return

//     }


//     if (items.length === 0) {

//       setError(
//         'Kam az kam aik product add karein.'
//       )

//       return

//     }


//     const customer =
//       customers?.find(
//         c =>
//           c.id === customerId
//       )


//     if (!customer) {

//       setError(
//         'Customer nahi mila.'
//       )

//       return

//     }


//     const finalDiscount =
//       Math.min(
//         Math.max(
//           Number(discount) || 0,
//           0
//         ),
//         total
//       )


//     const finalNetTotal =
//       Math.max(
//         0,
//         total - finalDiscount
//       )


//     setSaving(true)


//     try {

//       let finalInvoiceNumber =
//         invoiceNumber


//       if (!editingInvoice) {

//         await incrementInvoiceCounter(
//           companyId
//         )


//         if (
//           !finalInvoiceNumber ||
//           finalInvoiceNumber.trim() === ''
//         ) {

//           const dateStr =
//             getTodayDateString()

//           const timestamp =
//             Date.now()
//               .toString()
//               .slice(-6)


//           finalInvoiceNumber =
//             `INV-${dateStr}-${timestamp}`


//           setInvoiceNumber(
//             finalInvoiceNumber
//           )

//         }

//       }


//       /* ========================================================
//          UPDATE EXISTING INVOICE
//          ======================================================== */

//       if (editingInvoice) {

//         const invoiceRef =
//           ref(
//             db,
//             `companies/${companyId}/invoices/${editingInvoice.id}`
//           )


//         const updatedInvoice = {

//           invoiceNumber:
//             finalInvoiceNumber,

//           date:
//             invoiceDate,

//           poNumber:
//             poNumber || '',

//           poDate:
//             poDate || '',

//           customerId:
//             customerId,

//           customerName:
//             customer.name || '',

//           customerCompany:
//             customer.company || '',

//           customerPhone:
//             customer.phone || '',

//           customerAddress:
//             customer.address || '',

//           companyName:
//             COMPANY_NAME,

//           companyLogo:
//             COMPANY_LOGO,

//           companyAddress:
//             COMPANY_ADDRESS,

//           companyPhone:
//             COMPANY_PHONE,

//           companyNTN:
//             COMPANY_NTN,

//           companySTRN:
//             COMPANY_STRN,

//           items:
//             items,

//           total:
//             total,

//           discount:
//             finalDiscount,

//           netTotal:
//             finalNetTotal,

//           termsAndConditions:
//             termsAndConditions.trim(),

//           updatedAt:
//             Date.now()

//         }


//         await update(
//           invoiceRef,
//           updatedInvoice
//         )


//         setShowForm(
//           false
//         )


//         resetForm()


//         setPreview({

//           id:
//             editingInvoice.id,

//           invoiceNumber:
//             updatedInvoice.invoiceNumber,

//           date:
//             updatedInvoice.date,

//           poNumber:
//             updatedInvoice.poNumber,

//           poDate:
//             updatedInvoice.poDate,

//           items:
//             updatedInvoice.items,

//           total:
//             updatedInvoice.total,

//           discount:
//             updatedInvoice.discount,

//           netTotal:
//             updatedInvoice.netTotal,

//           termsAndConditions:
//             updatedInvoice.termsAndConditions,

//           companyName:
//             COMPANY_NAME,

//           companyLogo:
//             COMPANY_LOGO,

//           companyAddress:
//             COMPANY_ADDRESS,

//           companyPhone:
//             COMPANY_PHONE,

//           companyNTN:
//             COMPANY_NTN,

//           companySTRN:
//             COMPANY_STRN,

//           customer: {

//             name:
//               updatedInvoice.customerName,

//             company:
//               updatedInvoice.customerCompany,

//             phone:
//               updatedInvoice.customerPhone,

//             address:
//               updatedInvoice.customerAddress

//           }

//         })


//         return

//       }


//       /* ========================================================
//          CREATE NEW INVOICE
//          ======================================================== */

//       const date =
//         invoiceDate


//       const invoiceData = {

//         invoiceNumber:
//           finalInvoiceNumber,

//         date:
//           date,

//         poNumber:
//           poNumber || '',

//         poDate:
//           poDate || '',

//         customerId:
//           customerId,

//         customerName:
//           customer.name || '',

//         customerCompany:
//           customer.company || '',

//         customerPhone:
//           customer.phone || '',

//         customerAddress:
//           customer.address || '',

//         companyName:
//           COMPANY_NAME,

//         companyLogo:
//           COMPANY_LOGO,

//         companyAddress:
//           COMPANY_ADDRESS,

//         companyPhone:
//           COMPANY_PHONE,

//         companyNTN:
//           COMPANY_NTN,

//         companySTRN:
//           COMPANY_STRN,

//         items:
//           items,

//         total:
//           total,

//         discount:
//           finalDiscount,

//         netTotal:
//           finalNetTotal,

//         termsAndConditions:
//           termsAndConditions.trim(),

//         createdAt:
//           Date.now()

//       }


//       const invoicesRef =
//         ref(
//           db,
//           `companies/${companyId}/invoices`
//         )


//       const newInvoice =
//         await push(
//           invoicesRef,
//           invoiceData
//         )


//       setPreview({

//         id:
//           newInvoice.key,

//         invoiceNumber:
//           finalInvoiceNumber,

//         date:
//           date,

//         poNumber:
//           invoiceData.poNumber,

//         poDate:
//           invoiceData.poDate,

//         items:
//           invoiceData.items,

//         total:
//           invoiceData.total,

//         discount:
//           invoiceData.discount,

//         netTotal:
//           invoiceData.netTotal,

//         termsAndConditions:
//           invoiceData.termsAndConditions,

//         companyName:
//           COMPANY_NAME,

//         companyLogo:
//           COMPANY_LOGO,

//         companyAddress:
//           COMPANY_ADDRESS,

//         companyPhone:
//           COMPANY_PHONE,

//         companyNTN:
//           COMPANY_NTN,

//         companySTRN:
//           COMPANY_STRN,

//         customer: {

//           name:
//             invoiceData.customerName,

//           company:
//             invoiceData.customerCompany,

//           phone:
//             invoiceData.customerPhone,

//           address:
//             invoiceData.customerAddress

//         }

//       })


//       setShowForm(
//         false
//       )


//       resetForm()


//     } catch (err) {

//       console.error(
//         'Invoice save error:',
//         err
//       )

//       setError(
//         err?.message ||
//         'Invoice save nahi ho saka. Dobara koshish karein.'
//       )

//     } finally {

//       setSaving(false)

//     }

//   }


//   /* ============================================================
//      DOWNLOAD / PREVIEW PDF
//      ============================================================ */

//   function handleDownloadPdf(invoice) {

//     const previewInvoice =
//       convertInvoiceToPreview(
//         invoice
//       )

//     setPreview(
//       previewInvoice
//     )

//   }


//   /* ============================================================
//      PAGE
//      ============================================================ */

//   return (

//     <>

//       <div>

//         {/* ======================================================
//             HEADER
//             ====================================================== */}

//         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">

//           <div>

//             <h1 className="font-display text-2xl font-semibold text-ink">
//               Invoice
//             </h1>

//             <p className="text-sm text-slateink mt-0.5">
//               Enter the product name, quantity, and price to create an invoice.
//             </p>

//           </div>


//           <button
//             onClick={openNewInvoice}
//             className="flex items-center gap-2 rounded-lg bg-ink text-white text-sm font-medium px-4 py-2.5 hover:bg-inkSoft transition-colors self-start"
//           >

//             <Plus size={16} />

//             New Invoice

//           </button>

//         </div>


//         {/* ======================================================
//             SEARCH BAR + SORT
//             ====================================================== */}

//         <div className="mb-6 flex flex-col sm:flex-row gap-4">

//           {/* SEARCH */}

//           <div className="flex-1">

//             <div className="relative max-w-md">

//               <input
//                 type="text"
//                 value={searchTerm}
//                 onChange={(e) =>
//                   setSearchTerm(e.target.value)
//                 }
//                 className="input w-full pl-9 pr-4"
//                 placeholder="Search by invoice #, customer, company, date..."
//               />

//               {searchTerm && (
//                 <button
//                   type="button"
//                   onClick={() => setSearchTerm('')}
//                   className="absolute right-3 top-1/2 -translate-y-1/2 text-slateink hover:text-ink"
//                 >
//                   <X size={14} />
//                 </button>
//               )}

//             </div>

//             <p className="text-xs text-slateink mt-1">
//               Search by invoice number, customer name, company name, or date
//             </p>

//           </div>

//           {/* SORT */}

//           <div className="flex items-start gap-2">

//             <div className="flex items-center gap-2">

//               <ArrowUpDown size={14} className="text-slateink mt-1" />

//               <select
//                 value={sortBy}
//                 onChange={(e) => setSortBy(e.target.value)}
//                 className="input text-sm py-2 pr-8 min-w-[190px]"
//               >
//                 <option value="date-desc">Date (Newest First)</option>
//                 <option value="date-asc">Date (Oldest First)</option>
//                 <option value="amount-desc">Amount (High to Low)</option>
//                 <option value="amount-asc">Amount (Low to High)</option>
//               </select>

//             </div>

//           </div>

//         </div>


//         {/* ======================================================
//             INVOICE LIST
//             ====================================================== */}

//         {invoices === null ? (

//           <Loader />

//         ) : filteredInvoices.length === 0 ? (

//           <div className="border border-dashed border-line rounded-2xl py-16 flex flex-col items-center justify-center text-center">

//             <Receipt
//               className="text-slateink mb-3"
//               size={28}
//             />

//             <p className="font-medium text-ink">
//               {searchTerm
//                 ? 'No matching invoices found'
//                 : 'Abhi tak koi invoice nahi bana'}
//             </p>

//             {searchTerm && (
//               <p className="text-sm text-slateink mt-1">
//                 Try searching with different keywords
//               </p>
//             )}

//           </div>

//         ) : (

//           <div className="bg-surface rounded-2xl border border-line shadow-card overflow-hidden">

//             <div className="overflow-x-auto">

//               <table className="w-full text-sm">

//                 <thead>

//                   <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-slateink">

//                     <th className="px-4 py-3 font-medium">
//                       Invoice #
//                     </th>

//                     <th className="px-4 py-3 font-medium">
//                       Customer
//                     </th>

//                     <th className="px-4 py-3 font-medium">
//                       Total
//                     </th>

//                     <th className="px-4 py-3 font-medium">
//                       Date
//                     </th>

//                     <th className="px-4 py-3 font-medium text-right">
//                       Action
//                     </th>

//                   </tr>

//                 </thead>


//                 <tbody>

//                   {filteredInvoices.map(
//                     invoice => {

//                       const display = getCustomerDisplayInfo(invoice)

//                       return (

//                         <tr
//                           key={invoice.id}
//                           className="border-b border-line last:border-0 hover:bg-paper/60"
//                         >

//                           <td className="px-4 py-3 font-mono text-xs">
//                             {invoice.invoiceNumber}
//                           </td>


//                           <td className="px-4 py-3">

//                             {/* Primary: name if exists, else company bold */}
//                             <p className="font-medium text-ink">
//                               {display.primary}
//                             </p>

//                             {/* Secondary: company below (only if name also exists) */}
//                             {display.secondary && (
//                               <p className="text-xs text-slateink">
//                                 {display.secondary}
//                               </p>
//                             )}

//                           </td>


//                           <td className="px-4 py-3 font-medium text-ink">

//                             Rs{' '}

//                             {currency(
//                               invoice.netTotal !== undefined
//                                 ? invoice.netTotal
//                                 : Math.max(
//                                     0,
//                                     Number(invoice.total || 0) -
//                                     Number(invoice.discount || 0)
//                                   )
//                             )}

//                           </td>


//                           <td className="px-4 py-3 text-xs font-mono text-slateink">

//                             {formatDate(
//                               invoice.date
//                             )}

//                           </td>


//                           <td className="px-4 py-3">

//                             <div className="flex items-center justify-end gap-2 flex-wrap">

//                               <button
//                                 onClick={() =>
//                                   setPreview(
//                                     convertInvoiceToPreview(
//                                       invoice
//                                     )
//                                   )
//                                 }
//                                 className="text-teal-dark text-xs font-medium hover:underline"
//                               >

//                                 View

//                               </button>


//                               <button
//                                 onClick={() =>
//                                   openEditInvoice(
//                                     invoice
//                                   )
//                                 }
//                                 className="inline-flex items-center gap-1.5 text-xs font-medium text-ink hover:text-teal-dark"
//                               >

//                                 <Pencil size={13} />

//                                 Edit

//                               </button>


//                               <button
//                                 onClick={() =>
//                                   handleDownloadPdf(
//                                     invoice
//                                   )
//                                 }
//                                 className="inline-flex items-center gap-1.5 text-xs font-medium text-red-600 hover:text-red-800"
//                               >

//                                 <Download size={13} />

//                                 PDF

//                               </button>


//                               <button
//                                 onClick={() =>
//                                   setDeleteConfirm(
//                                     invoice
//                                   )
//                                 }
//                                 className="inline-flex items-center gap-1.5 text-xs font-medium text-coral hover:text-red-700"
//                               >

//                                 <Trash2 size={13} />

//                                 Delete

//                               </button>

//                             </div>

//                           </td>

//                         </tr>

//                       )
//                     }
//                   )}

//                 </tbody>

//               </table>

//             </div>

//           </div>

//         )}


//         {/* ======================================================
//             CREATE / EDIT MODAL
//             ====================================================== */}

//         {showForm && (

//           <Modal
//             title={
//               editingInvoice
//                 ? `Edit Invoice ${editingInvoice.invoiceNumber}`
//                 : 'New Invoice'
//             }
//             onClose={closeForm}
//             wide
//           >

//             <form
//               onSubmit={handleSubmit}
//               className="space-y-5"
//             >

//               {/* =================================================
//                   INVOICE NUMBER + DATE
//                   ================================================= */}

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

//                 <label className="block">

//                   <span className="text-xs font-medium text-slateink">
//                     Invoice Number *
//                   </span>

//                   <input
//                     type="text"
//                     value={invoiceNumber}
//                     onChange={(e) =>
//                       setInvoiceNumber(
//                         e.target.value
//                       )
//                     }
//                     className="input mt-1"
//                     placeholder="INV-YYYYMMDD-0001"
//                     required
//                   />

//                   <small className="text-xs text-slateink mt-1 block">
//                     Format: INV-YYYYMMDD-0001 (Auto-generated)
//                   </small>

//                 </label>


//                 <label className="block">

//                   <span className="text-xs font-medium text-slateink">
//                     Invoice Date *
//                   </span>

//                   <input
//                     type="date"
//                     value={invoiceDate}
//                     onChange={(e) =>
//                       setInvoiceDate(
//                         e.target.value
//                       )
//                     }
//                     className="input mt-1"
//                     required
//                   />

//                 </label>

//               </div>


//               {/* =================================================
//                   CUSTOMER
//                   ================================================= */}

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

//                 <label className="block">

//                   <span className="text-xs font-medium text-slateink">
//                     Customer *
//                   </span>

//                   <div className="relative mt-1">

//                     <input
//                       type="text"
//                       value={customerSearch}
//                       onChange={(e) => {
//                         const value = e.target.value
//                         setCustomerSearch(value)

//                         if (customerId) {
//                           setCustomerId('')
//                         }

//                         setShowCustomerDropdown(true)
//                       }}
//                       onFocus={() =>
//                         setShowCustomerDropdown(true)
//                       }
//                       className="input w-full pr-10"
//                       placeholder="Search customer by name, company, phone..."
//                       autoComplete="off"
//                       required={!customerId}
//                     />

//                     {customerSearch && (
//                       <button
//                         type="button"
//                         onClick={() => {
//                           setCustomerId('')
//                           setCustomerSearch('')
//                           setShowCustomerDropdown(true)
//                         }}
//                         className="absolute right-3 top-1/2 -translate-y-1/2 text-slateink hover:text-ink"
//                         aria-label="Clear customer"
//                       >
//                         <X size={16} />
//                       </button>
//                     )}

//                     {showCustomerDropdown && (
//                       <div className="absolute z-[100] left-0 right-0 mt-1 max-h-64 overflow-y-auto rounded-lg border border-line bg-white shadow-lg">
//                         {filteredCustomers.length === 0 ? (
//                           <div className="px-3 py-3 text-sm text-slateink">
//                             No customer found.
//                           </div>
//                         ) : (
//                           filteredCustomers.map(customer => {

//                             const name = String(customer.name || '').trim()
//                             const company = String(customer.company || '').trim()

//                             return (

//                               <button
//                                 key={customer.id}
//                                 type="button"
//                                 onClick={() => selectCustomer(customer)}
//                                 className={`w-full text-left px-3 py-2.5 hover:bg-paper transition-colors border-b border-line last:border-b-0 ${customer.id === customerId ? 'bg-paper' : ''}`}
//                               >

//                                 {/* If name exists: show name bold + company below */}
//                                 {name ? (
//                                   <>
//                                     <p className="text-sm font-medium text-ink">
//                                       {name}
//                                     </p>
//                                     {company && (
//                                       <p className="text-xs text-slateink mt-0.5">
//                                         {company}
//                                       </p>
//                                     )}
//                                   </>
//                                 ) : (
//                                   /* If no name, show company in bold (name style) */
//                                   company && (
//                                     <p className="text-sm font-medium text-ink">
//                                       {company}
//                                     </p>
//                                   )
//                                 )}

//                                 {customer.phone && (
//                                   <p className="text-xs text-slateink mt-0.5">
//                                     {customer.phone}
//                                   </p>
//                                 )}

//                               </button>

//                             )
//                           })
//                         )}
//                       </div>
//                     )}

//                   </div>

//                 </label>

//               </div>


//               {/* =================================================
//                   PO NUMBER + PO DATE
//                   ================================================= */}

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

//                 <label className="block">

//                   <span className="text-xs font-medium text-slateink">
//                     P/Order No.
//                   </span>

//                   <input
//                     type="text"
//                     value={poNumber}
//                     onChange={(e) =>
//                       setPoNumber(
//                         e.target.value
//                       )
//                     }
//                     className="input mt-1"
//                     placeholder="P/Order No."
//                   />

//                 </label>


//                 <label className="block">

//                   <span className="text-xs font-medium text-slateink">
//                     P/Order Date
//                   </span>

//                   <input
//                     type="date"
//                     value={poDate}
//                     onChange={(e) =>
//                       setPoDate(
//                         e.target.value
//                       )
//                     }
//                     className="input mt-1"
//                   />

//                 </label>

//               </div>


//               {/* =================================================
//                   PRODUCTS
//                   ================================================= */}

//               <div className="border border-line rounded-xl p-4">

//                 <p className="text-xs font-medium text-slateink mb-3">
//                   Add Products
//                 </p>


//                 <div className="flex flex-col sm:flex-row gap-2">

//                   <input
//                     value={pick.name}
//                     onChange={(e) =>
//                       setPick({
//                         ...pick,
//                         name:
//                           e.target.value
//                       })
//                     }
//                     className="input flex-1"
//                     placeholder="Product name / model"
//                   />

//                   <input
//                     type="text"
//                     value={pick.unit}
//                     onChange={(e) =>
//                       setPick({
//                         ...pick,
//                         unit:
//                           e.target.value
//                       })
//                     }
//                     className="input sm:w-20"
//                     placeholder="Unit"
//                   />

//                   <input
//                     type="number"
//                     min={1}
//                     value={pick.qty}
//                     onChange={(e) =>
//                       setPick({
//                         ...pick,
//                         qty:
//                           e.target.value
//                       })
//                     }
//                     className="input sm:w-24"
//                     placeholder="Qty"
//                   />


//                   <input
//                     type="number"
//                     min={0}
//                     step="0.01"
//                     value={pick.price}
//                     onChange={(e) =>
//                       setPick({
//                         ...pick,
//                         price:
//                           e.target.value
//                       })
//                     }
//                     className="input sm:w-32"
//                     placeholder="Unit Price"
//                   />


//                   <button
//                     type="button"
//                     onClick={addItem}
//                     disabled={!pick.name.trim()}
//                     className="rounded-lg bg-teal text-white text-sm font-medium px-4 py-2.5 hover:bg-teal-dark disabled:opacity-50 shrink-0"
//                   >

//                     Add

//                   </button>

//                 </div>


//                 {/* =================================================
//                     PRODUCTS ADDED
//                     ================================================= */}

//                 {items.length > 0 && (

//                   <div className="mt-4 space-y-2">

//                     {items.map(
//                       (
//                         item,
//                         index
//                       ) => (

//                         <div
//                           key={index}
//                           className="flex items-center justify-between bg-paper rounded-lg px-3 py-2 text-sm"
//                         >

//                           <div>

//                             <span className="font-medium text-ink">
//                               {item.name}
//                             </span>

//                             <span className="text-xs text-slateink ml-2">
//                               {item.unit || 'PCS'} x{item.qty}
//                             </span>

//                             <span className="text-xs text-slateink ml-2">
//                               @ Rs{' '}
//                               {currency(
//                                 item.price
//                               )}
//                             </span>

//                           </div>


//                           <div className="flex items-center gap-2">

//                             <button
//                               type="button"
//                               onClick={() =>
//                                 openEditProduct(
//                                   index
//                                 )
//                               }
//                               className="text-blue-600 hover:text-blue-800"
//                             >

//                               <Pencil size={15} />

//                             </button>


//                             <button
//                               type="button"
//                               onClick={() =>
//                                 removeItem(
//                                   index
//                                 )
//                               }
//                               className="text-coral hover:text-red-700"
//                             >

//                               <Trash2 size={15} />

//                             </button>

//                           </div>

//                         </div>

//                       )
//                     )}


//                     {/* =================================================
//                         FORM TOTAL
//                         ================================================= */}

//                     <div className="flex justify-end pt-3">

//                       <div className="w-full sm:w-64">

//                         <div className="flex justify-between py-1">

//                           <span className="text-xs text-slateink">
//                             Total
//                           </span>

//                           <span className="text-sm font-semibold text-ink">
//                             Rs {currency(total)}
//                           </span>

//                         </div>


//                         <div className="flex justify-between py-1">

//                           <span className="text-xs text-slateink">
//                             Discount
//                           </span>

//                           <span className="text-sm font-semibold text-red-600">
//                             Rs {currency(discountValue)}
//                           </span>

//                         </div>


//                         <div className="border-t border-line mt-1 pt-2 flex justify-between">

//                           <span className="text-sm font-bold text-ink">
//                             Net Total
//                           </span>

//                           <span className="text-lg font-bold text-ink">
//                             Rs {currency(netTotal)}
//                           </span>

//                         </div>

//                       </div>

//                     </div>

//                   </div>

//                 )}

//               </div>


//               {/* =================================================
//                   DISCOUNT
//                   ================================================= */}

//               <div className="border border-line rounded-xl p-4">

//                 <label className="block max-w-sm ml-auto">

//                   <span className="text-xs font-medium text-slateink">
//                     Discount
//                   </span>

//                   <div className="relative mt-1">

//                     <input
//                       type="number"
//                       min={0}
//                       max={total}
//                       step="0.01"
//                       value={discount}
//                       onChange={(e) =>
//                         setDiscount(
//                           e.target.value
//                         )
//                       }
//                       className="input pl-9 w-full"
//                       placeholder="0"
//                     />

//                   </div>

//                   <small className="text-xs text-slateink mt-1 block">
//                     Discount minus from total price.
//                   </small>

//                 </label>


//                 {/* SUMMARY */}

//                 <div className="mt-4 ml-auto max-w-sm border-t border-line pt-3">

//                   <div className="flex justify-between text-sm py-1">

//                     <span className="text-slateink">
//                       Total
//                     </span>

//                     <span className="font-medium text-ink">
//                       Rs {currency(total)}
//                     </span>

//                   </div>


//                   <div className="flex justify-between text-sm py-1">

//                     <span className="text-slateink">
//                       Discount
//                     </span>

//                     <span className="font-medium text-red-600">
//                       Rs {currency(discountValue)}
//                     </span>

//                   </div>


//                   <div className="flex justify-between border-t border-line pt-2 mt-1">

//                     <span className="font-bold text-ink">
//                       Net Total
//                     </span>

//                     <span className="font-bold text-lg text-ink">
//                       Rs {currency(netTotal)}
//                     </span>

//                   </div>

//                 </div>

//               </div>


//               {/* =================================================
//                   TERMS & CONDITIONS INPUT
//                   ================================================= */}

//               <div className="border border-line rounded-xl p-4">

//                 <label className="block">

//                   <span className="text-xs font-medium text-slateink">
//                     Terms & Conditions
//                   </span>

//                   <textarea
//                     value={termsAndConditions}
//                     onChange={(e) =>
//                       setTermsAndConditions(
//                         e.target.value
//                       )
//                     }
//                     rows={5}
//                     className="input mt-1 w-full resize-y"
//                     placeholder={`Example:
// 1. Payment must be made within 30 days.
// 2. Goods once sold cannot be returned.
// 3. Prices are exclusive of applicable taxes.`}
//                   />

//                   <small className="text-xs text-slateink mt-1 block">
//                     Enter each term on a new line.
//                   </small>

//                 </label>

//               </div>


//               {/* =================================================
//                   ERROR
//                   ================================================= */}

//               {error && (

//                 <p className="text-xs font-medium text-coral bg-coral-light rounded-lg px-3 py-2">
//                   {error}
//                 </p>

//               )}


//               {/* =================================================
//                   SAVE BUTTON
//                   ================================================= */}

//               <button
//                 type="submit"
//                 disabled={
//                   saving ||
//                   !customerId ||
//                   !invoiceDate ||
//                   items.length === 0
//                 }
//                 className="w-full rounded-lg bg-ink text-white text-sm font-medium py-2.5 hover:bg-inkSoft transition-colors disabled:opacity-60"
//               >

//                 {saving
//                   ? editingInvoice
//                     ? 'Updating…'
//                     : 'Saving…'
//                   : editingInvoice
//                   ? 'Update Invoice'
//                   : 'Generate Invoice'}

//               </button>

//             </form>

//           </Modal>

//         )}

//       </div>


//       {/* ========================================================
//           PREVIEW
//           ======================================================== */}

//       {preview && (

//         <InvoicePreview
//           invoice={preview}
//           onClose={() =>
//             setPreview(null)
//           }
//         />

//       )}


//       {/* ========================================================
//           DELETE CONFIRMATION
//           ======================================================== */}

//       {deleteConfirm && (

//         <div className="fixed inset-0 z-[99999] bg-black/60 flex items-center justify-center p-4">

//           <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">

//             <div className="flex items-center justify-between mb-4">

//               <h3 className="text-lg font-semibold text-ink">
//                 Delete Invoice
//               </h3>

//               <button
//                 onClick={() =>
//                   setDeleteConfirm(null)
//                 }
//                 className="text-slateink hover:text-ink"
//               >

//                 <X size={20} />

//               </button>

//             </div>


//             <div className="space-y-4">

//               <p className="text-sm text-ink">
//                 Are you sure to delete this invoice?
//               </p>


//               <div className="bg-paper rounded-lg p-3 text-sm">

//                 <p className="font-medium text-ink">
//                   {deleteConfirm.invoiceNumber}
//                 </p>

//                 <p className="text-slateink text-xs">
//                   {deleteConfirm.customerName || deleteConfirm.customerCompany || '-'}
//                 </p>


//                 <p className="text-slateink text-xs">
//                   Total: Rs{' '}
//                   {currency(
//                     deleteConfirm.total || 0
//                   )}
//                 </p>


//                 <p className="text-red-600 text-xs">
//                   Discount: Rs{' '}
//                   {currency(
//                     deleteConfirm.discount || 0
//                   )}
//                 </p>


//                 <p className="font-semibold text-ink text-xs">
//                   Net Total: Rs{' '}
//                   {currency(
//                     deleteConfirm.netTotal !== undefined
//                       ? deleteConfirm.netTotal
//                       : Math.max(
//                           0,
//                           Number(deleteConfirm.total || 0) -
//                           Number(deleteConfirm.discount || 0)
//                         )
//                   )}
//                 </p>

//               </div>


//               <div className="flex gap-3">

//                 <button
//                   onClick={() =>
//                     setDeleteConfirm(null)
//                   }
//                   className="flex-1 rounded-lg border border-line text-ink text-sm font-medium py-2.5 hover:bg-paper transition-colors"
//                 >
//                   Cancel
//                 </button>


//                 <button
//                   onClick={handleDeleteInvoice}
//                   disabled={deleting}
//                   className="flex-1 rounded-lg bg-coral text-white text-sm font-medium py-2.5 hover:bg-red-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
//                 >

//                   {deleting ? (

//                     'Deleting…'

//                   ) : (

//                     <>

//                       <Trash2 size={16} />

//                       Delete

//                     </>

//                   )}

//                 </button>

//               </div>

//             </div>

//           </div>

//         </div>

//       )}


//       {/* ========================================================
//           EDIT PRODUCT MODAL
//           ======================================================== */}

//       {editingProductIndex !== null && (

//         <div className="fixed inset-0 z-[99999] bg-black/60 flex items-center justify-center p-4">

//           <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">

//             <div className="flex items-center justify-between mb-4">

//               <h3 className="text-lg font-semibold text-ink">
//                 Edit Product
//               </h3>

//               <button
//                 onClick={closeEditProduct}
//                 className="text-slateink hover:text-ink"
//               >

//                 <X size={20} />

//               </button>

//             </div>


//             <div className="space-y-3">

//               <div>

//                 <label className="text-xs font-medium text-slateink">
//                   Product Name
//                 </label>

//                 <input
//                   type="text"
//                   value={editProduct.name}
//                   onChange={(e) =>
//                     setEditProduct({
//                       ...editProduct,
//                       name:
//                         e.target.value
//                     })
//                   }
//                   className="input mt-1 w-full"
//                   placeholder="Product name"
//                 />

//               </div>

//               <div>

//                 <label className="text-xs font-medium text-slateink">
//                   Unit
//                 </label>

//                 <input
//                   type="text"
//                   value={editProduct.unit}
//                   onChange={(e) =>
//                     setEditProduct({
//                       ...editProduct,
//                       unit:
//                         e.target.value
//                     })
//                   }
//                   className="input mt-1 w-full"
//                   placeholder="PCS, KG, MTR, etc."
//                 />

//               </div>


//               <div className="grid grid-cols-2 gap-3">

//                 <div>

//                   <label className="text-xs font-medium text-slateink">
//                     Quantity
//                   </label>

//                   <input
//                     type="number"
//                     min={1}
//                     value={editProduct.qty}
//                     onChange={(e) =>
//                       setEditProduct({
//                         ...editProduct,
//                         qty:
//                           Number(
//                             e.target.value
//                           ) || 1
//                       })
//                     }
//                     className="input mt-1 w-full"
//                   />

//                 </div>


//                 <div>

//                   <label className="text-xs font-medium text-slateink">
//                     Unit Price
//                   </label>

//                   <input
//                     type="number"
//                     min={0}
//                     step="0.01"
//                     value={editProduct.price}
//                     onChange={(e) =>
//                       setEditProduct({
//                         ...editProduct,
//                         price:
//                           Number(
//                             e.target.value
//                           ) || 0
//                       })
//                     }
//                     className="input mt-1 w-full"
//                   />

//                 </div>

//               </div>


//               <button
//                 type="button"
//                 onClick={saveEditProduct}
//                 disabled={
//                   !editProduct.name.trim()
//                 }
//                 className="w-full rounded-lg bg-blue-600 text-white text-sm font-medium py-2.5 hover:bg-blue-700 transition-colors disabled:opacity-50 mt-2 flex items-center justify-center gap-2"
//               >

//                 <Save size={16} />

//                 Save Product

//               </button>

//             </div>

//           </div>

//         </div>

//       )}

//     </>

//   )

// }


// /* ================================================================
//    CONVERT FIREBASE INVOICE TO PREVIEW
//    ================================================================ */

// function convertInvoiceToPreview(invoice) {

//   const total =
//     Number(
//       invoice.total || 0
//     )


//   const discount =
//     Math.min(
//       Math.max(
//         Number(
//           invoice.discount || 0
//         ),
//         0
//       ),
//       total
//     )


//   const netTotal =
//     invoice.netTotal !== undefined &&
//     invoice.netTotal !== null
//       ? Number(
//           invoice.netTotal
//         )
//       : Math.max(
//           0,
//           total - discount
//         )


//   return {

//     id:
//       invoice.id,

//     invoiceNumber:
//       invoice.invoiceNumber,

//     date:
//       invoice.date,

//     poNumber:
//       invoice.poNumber || '',

//     poDate:
//       invoice.poDate || '',

//     items:
//       invoice.items || [],

//     total:
//       total,

//     discount:
//       discount,

//     netTotal:
//       netTotal,

//     termsAndConditions:
//       invoice.termsAndConditions || '',

//     companyName:
//       invoice.companyName ||
//       COMPANY_NAME,

//     companyLogo:
//       invoice.companyLogo ||
//       COMPANY_LOGO,

//     companyAddress:
//       invoice.companyAddress ||
//       COMPANY_ADDRESS,

//     companyPhone:
//       invoice.companyPhone ||
//       COMPANY_PHONE,

//     companyNTN:
//       invoice.companyNTN ||
//       COMPANY_NTN,

//     companySTRN:
//       invoice.companySTRN ||
//       COMPANY_STRN,

//     customer: {

//       name:
//         invoice.customerName || '',

//       company:
//         invoice.customerCompany || '',

//       phone:
//         invoice.customerPhone || '',

//       address:
//         invoice.customerAddress || ''

//     }

//   }

// }


// /* ================================================================
//    INVOICE PREVIEW
//    ================================================================ */

// function InvoicePreview({
//   invoice,
//   onClose
// }) {

//   function printInvoice() {

//     window.print()

//   }


//   const total =
//     Number(
//       invoice.total || 0
//     )


//   const discount =
//     Math.min(
//       Math.max(
//         Number(
//           invoice.discount || 0
//         ),
//         0
//       ),
//       total
//     )


//   const netTotal =
//     invoice.netTotal !== undefined &&
//     invoice.netTotal !== null
//       ? Number(
//           invoice.netTotal
//         )
//       : Math.max(
//           0,
//           total - discount
//         )


//   // ============================================================
//   // CUSTOMER DISPLAY LOGIC
//   // If customer has a name -> show name as primary (bold),
//   //   and company below (normal)
//   // If customer has NO name but has company -> show company as
//   //   primary (bold) in the same style as name
//   // ============================================================

//   const customerName = String(invoice.customer?.name || '').trim()
//   const customerCompany = String(invoice.customer?.company || '').trim()

//   const customerDisplayName = customerName || customerCompany || ''
//   const showCompanySeparately = customerName && customerCompany


//   return (

//     <div className="invoice-preview-overlay fixed inset-0 z-[9999] bg-black/60 overflow-y-auto p-4 sm:p-8">


//       {/* ======================================================
//           TOP CONTROLS
//           ====================================================== */}

//       <div className="invoice-preview-controls max-w-[900px] mx-auto mb-4 flex items-center justify-between">

//         <div>

//           <p className="text-white font-semibold text-sm">
//             Invoice Preview
//           </p>

//           <p className="text-white/70 text-xs">
//             {invoice.invoiceNumber}
//           </p>

//         </div>


//         <div className="flex items-center gap-2">

//           <button
//             onClick={printInvoice}
//             className="inline-flex items-center gap-2 rounded-lg bg-white text-ink px-4 py-2 text-sm font-medium hover:bg-gray-100"
//           >

//             <Printer size={16} />

//             Print / Save as PDF

//           </button>


//           <button
//             onClick={onClose}
//             className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-white/10 text-white hover:bg-white/20"
//           >

//             <X size={18} />

//           </button>

//         </div>

//       </div>


//       {/* ======================================================
//           PRINT AREA
//           ====================================================== */}

//       <div
//         className="invoice-print-area"
//         id="invoice-print-area"
//       >

//         <div className="invoice-sheet">


//           {/* ==================================================
//               HEADER
//               ================================================== */}

//           <div className="invoice-header">


//             {/* COMPANY */}

//             <div className="invoice-company">

//               <img
//                 src={
//                   invoice.companyLogo ||
//                   COMPANY_LOGO
//                 }
//                 alt="Company Logo"
//                 className="invoice-logo"
//                 onError={(e) => {

//                   e.currentTarget.style.display =
//                     'none'

//                 }}
//               />


//               {(invoice.companyName || COMPANY_NAME) && (

//                 <div className="invoice-company-name">

//                   {invoice.companyName ||
//                     COMPANY_NAME}

//                 </div>

//               )}


//               <div className="invoice-company-address">

//                 {invoice.companyAddress ||
//                   COMPANY_ADDRESS}

//               </div>


//               {invoice.companyPhone && (

//                 <div className="invoice-company-address">

//                   {invoice.companyPhone}

//                 </div>

//               )}

//             </div>


//             {/* RIGHT SIDE */}

//             <div className="invoice-right-header">

//               <div className="invoice-tax-box">

//                 <div>
//                   NTN # {invoice.companyNTN || COMPANY_NTN}
//                 </div>

//                 <div>
//                   STRN # {invoice.companySTRN || COMPANY_STRN}
//                 </div>


//                 <div className="invoice-title">
//                   INVOICE
//                 </div>

//               </div>


//               <div className="invoice-meta-box">

//                 <div className="invoice-meta-title">
//                   Invoice No.
//                 </div>


//                 <div className="invoice-number">

//                   {invoice.invoiceNumber}

//                 </div>


//                 <div className="invoice-meta-row">

//                   <span>
//                     Date:
//                   </span>

//                   <span>

//                     {formatInvoiceDate(
//                       invoice.date
//                     )}

//                   </span>

//                 </div>


//                 <div className="invoice-meta-row">

//                   <span>
//                     P/Order No.
//                   </span>

//                   <span>
//                     {invoice.poNumber || ''}
//                   </span>

//                 </div>


//                 <div className="invoice-meta-row">

//                   <span>
//                     P/Order Date
//                   </span>

//                   <span>

//                     {invoice.poDate
//                       ? formatInvoiceDate(
//                           invoice.poDate
//                         )
//                       : ''}

//                   </span>

//                 </div>

//               </div>

//             </div>

//           </div>


//           {/* ==================================================
//               BUYER
//               ================================================== */}

//           <div className="invoice-buyer-box">

//             <div className="invoice-buyer-title">

//               Buyer's Name & Address

//             </div>


//             <div className="invoice-buyer-content">

//               {/* Primary: name if exists, else company (bold) */}
//               {customerDisplayName && (
//                 <div className="invoice-buyer-name">
//                   {customerDisplayName}
//                 </div>
//               )}

//               {/* Secondary: company below only if name also exists */}
//               {showCompanySeparately && (
//                 <div>
//                   {customerCompany}
//                 </div>
//               )}


//               {invoice.customer?.address && (

//                 <div>
//                   {invoice.customer.address}
//                 </div>

//               )}


//               {invoice.customer?.phone && (

//                 <div>
//                   {invoice.customer.phone}
//                 </div>

//               )}

//             </div>

//           </div>


//           {/* ==================================================
//               PRODUCT TABLE
//               ================================================== */}

//           <table className="invoice-table">

//             <colgroup>

//               <col className="qty-col " />

//               <col className="unit-col" />

//               <col className="description-col" />

//               <col className="price-col" />

//               <col className="amount-col" />

//             </colgroup>


//             <thead>

//               <tr>

//                 <th>
//                   Quantity
//                 </th>

//                 <th>
//                   Unit
//                 </th>

//                 <th >
//                   Description Of Goods
//                 </th>

//                 <th>
//                   Unit Price
//                 </th>

//                 <th>
//                   Amount
//                 </th>

//               </tr>

//             </thead>


//             <tbody>

//               {(invoice.items || []).map(
//                 (
//                   item,
//                   index
//                 ) => {

//                   const qty =
//                     Number(
//                       item.qty || 0
//                     )

//                   const price =
//                     Number(
//                       item.price || 0
//                     )

//                   const amount =
//                     qty * price


//                   return (

//                     <tr key={index}>

//                       <td className="quantity-cell">
//                         {qty}
//                       </td>

//                       <td>
//                         {item.unit || 'PCS'}
//                       </td>

//                       <td className="description-cell">
//                         {item.name}
//                       </td>

//                       <td className="number-cell">
//                         {currency(price)}
//                       </td>

//                       <td className="number-cell">
//                         {currency(amount)}
//                       </td>

//                     </tr>

//                   )

//                 }
//               )}


//               {Array.from({

//                 length:
//                   Math.max(
//                     3,
//                     8 -
//                       (
//                         invoice.items?.length ||
//                         0
//                       )
//                   )

//               }).map(
//                 (
//                   _,
//                   index
//                 ) => (

//                   <tr
//                     key={`empty-${index}`}
//                     className="invoice-empty-row"
//                   >

//                     <td></td>

//                     <td></td>

//                     <td></td>

//                     <td></td>

//                     <td></td>

//                   </tr>

//                 )
//               )}

//             </tbody>

//           </table>


//           {/* ============================================================
//               TOTAL / DISCOUNT / NET TOTAL
//               ============================================================ */}

//           <div className="invoice-total-wrapper">

//             {/* TOTAL */}

//             <div className="invoice-total-row">

//               <div className="invoice-total-label">
//                 Total
//               </div>

//               <div className="invoice-total-value">
//                 PKR: {currency(
//                   total
//                 )}
//               </div>

//             </div>


//             {/* DISCOUNT */}

//             <div className="invoice-total-row">

//               <div className="invoice-total-label">
//                 Discount
//               </div>

//               <div className="invoice-total-value">
//                PKR: {currency(
//                   discount
//                 )}
//               </div>

//             </div>


//             {/* NET TOTAL */}

//             <div className="invoice-total-row">

//               <div className="invoice-total-label">
//                 Net Total
//               </div>

//               <div className="invoice-total-value">
//                 PKR: {currency(
//                   netTotal
//                 )} 
//               </div>

//             </div>

//           </div>


//           {/* ============================================================
//               TERMS & CONDITIONS
//               ============================================================ */}

//           {invoice.termsAndConditions?.trim() && (

//             <div className="invoice-terms-box">

//               <div className="invoice-terms-title">
//                 Terms &amp; Condition
//               </div>


//               <div className="invoice-terms-content">

//                 {invoice.termsAndConditions
//                   .split(/\r?\n/)
//                   .map(
//                     (term, index) => {

//                       const cleanTerm =
//                         term.trim()

//                       if (!cleanTerm) {
//                         return null
//                       }


//                       return (

//                         <div
//                           key={index}
//                           className="invoice-term-item"
//                         >

//                           <span className="invoice-term-number">
//                             {index + 1}.
//                           </span>

//                           <span className="invoice-term-text">
//                             {cleanTerm}
//                           </span>

//                         </div>

//                       )

//                     }
//                   )}

//               </div>

//             </div>

//           )}


//           {/* ==================================================
//               FOOTER
//               ================================================== */}

//           <div className="invoice-footer-note">

//             <p>

//               Note: This is a computer generated invoice, does not require any stamp or signature.

//             </p>

//           </div>


//         </div>

//       </div>

//     </div>

//   )

// }


// /* ================================================================
//    DATE FORMAT
//    ================================================================ */

// function formatInvoiceDate(value) {

//   if (!value) {

//     return ''

//   }


//   const date =
//     new Date(value)


//   if (
//     Number.isNaN(
//       date.getTime()
//     )
//   ) {

//     return value

//   }


//   const day =
//     String(
//       date.getDate()
//     ).padStart(
//       2,
//       '0'
//     )


//   const month =
//     String(
//       date.getMonth() + 1
//     ).padStart(
//       2,
//       '0'
//     )


//   const year =
//     date.getFullYear()


//   return `${day}/${month}/${year}`

// }


// /* ================================================================
//    INVOICE CSS
//    ================================================================ */

// const invoicePrintStyles = `

// /* ============================================================
//    INVOICE SHEET
//    ============================================================ */

// .invoice-sheet {

//   width: 210mm;

//   min-height: 297mm;

//   background: #ffffff;

//   margin: 0 auto;

//   padding: 15mm 17mm;

//   box-sizing: border-box;

//   color: #111111;

//   font-family:
//     Arial,
//     Helvetica,
//     sans-serif;

// }


// /* ============================================================
//    HEADER
//    ============================================================ */

// .invoice-header {

//   display: flex;

//   justify-content: space-between;

//   align-items: flex-start;

//   min-height: 55mm;

// }


// .invoice-company {

//   width: 53%;

// }


// .invoice-logo {

//   width: 42mm;

//   height: 25mm;

//   object-fit: contain;

//   object-position: left center;

//   display: block;

//   margin-bottom: 0.5mm;

// }


// .invoice-company-name {

//   font-size: 16px;

//   font-weight: 700;

//   margin-bottom: 1mm;

// }


// .invoice-company-address {

//   white-space: pre-line;

//   font-size: 10px;

//   line-height: 1.4;

// }


// /* ============================================================
//    RIGHT HEADER
//    ============================================================ */

// .invoice-right-header {

//   width: 40%;

//   padding-top: 2mm;

// }


// .invoice-tax-box {

//   border: 1px solid #222;

//   padding: 2.5mm 2mm;

//   font-size: 10px;

//   line-height: 1.5;

// }


// .invoice-title {

//   font-size: 14px;

//   font-weight: 700;

//   margin-top: 1mm;

// }


// .invoice-meta-box {

//   border: 1px solid #222;

//   margin-top: 5mm;

//   font-size: 10px;

// }


// .invoice-meta-title {

//   font-weight: 700;

//   padding: 1.8mm 2mm 0.5mm;

// }


// .invoice-number {

//   padding: 0 2mm 1.5mm;

//   font-size: 10px;

//   font-weight: 600;

// }


// .invoice-meta-row {

//   display: grid;

//   grid-template-columns: 1fr 1fr;

//   border-top: 1px solid #222;

//   min-height: 6mm;

// }


// .invoice-meta-row span {

//   padding: 1.1mm 1.5mm;

// }


// .invoice-meta-row span:first-child {

//   border-right: 1px solid #222;

//   text-align: right;

// }


// .invoice-meta-row span:last-child {

//   text-align: left;

// }


// /* ============================================================
//    BUYER
//    ============================================================ */

// .invoice-buyer-box {

//   width: 54%;

//   border: 1px solid #222;

//   margin-bottom: 18mm;

//   font-size: 10px;

// }


// .invoice-buyer-title {

//   font-weight: 700;

//   background: #f1f1f1;

//   border-bottom: 1px solid #222;

//   padding: 1.6mm 2mm;

// }


// .invoice-buyer-content {

//   min-height: 8mm;

//   padding: 1.6mm 2mm;

//   line-height: 1.4;

// }


// .invoice-buyer-name {

//   font-weight: 600;

// }


// /* ============================================================
//    PRODUCT TABLE
//    ============================================================ */

// .invoice-table {

//   width: 100%;

//   table-layout: fixed;

//   border-collapse: collapse;

//   border: 1px solid #222;

//   font-size: 10px;

// }


// .invoice-table .qty-col {

//   width: 13%;

// }


// .invoice-table .unit-col {

//   width: 10%;

// }


// .invoice-table .description-col {

//   width: 43%;

// }


// .invoice-table .price-col {

//   width: 17%;

// }


// .invoice-table .amount-col {

//   width: 17%;

// }


// .invoice-table thead th {

//   padding: 2.8mm 1.8mm;

//   font-weight: 700;

//   text-align: center;

//   border-left: 1px solid #222;

//   border-right: 1px solid #222;

//   border-bottom: 1px solid #222;

//   border-top: 0;

// }


// .invoice-table tbody td:nth-child(2) {
//   text-align: center;
// }

// .invoice-table tbody td {

//   padding: 1.5mm 1.8mm;

//   height: 6mm;

//   vertical-align: top;

//   border-left: 1px solid #222;

//   border-right: 1px solid #222;

//   border-top: 0 !important;

//   border-bottom: 0 !important;

//   background: transparent !important;

// }


// .invoice-table .quantity-cell {

//   text-align: center;

// }


// .invoice-table .description-cell {

//   text-align: left;

// }


// .invoice-table .number-cell {

//   text-align: right;

//   white-space: nowrap;

// }


// .invoice-table tbody .invoice-empty-row td {

//   height: 1mm;

//   border-left: 1px solid #222 !important;

//   border-right: 1px solid #222 !important;

//   border-top: 0 !important;

//   border-bottom: 0 !important;

// }


// .invoice-table th:first-child,
// .invoice-table td:first-child {

//   border-left: 1px solid #222 !important;

// }


// .invoice-table th:last-child,
// .invoice-table td:last-child {

//   border-right: 1px solid #222 !important;

// }


// .invoice-table tbody tr:last-child td {

//   border-bottom: 1px solid #222 !important;

// }


// /* ============================================================
//    TOTAL / DISCOUNT / NET TOTAL
//    ============================================================ */

// .invoice-total-wrapper {

//   width: 34%;

//   margin-top: 5mm;

//   margin-left: auto;

//   display: flex;

//   flex-direction: column;

//   align-items: stretch;

// }


// .invoice-total-row {

//   width: 100%;

//   display: flex;

//   flex-direction: row;

//   margin: 0;

//   padding: 0;

// }


// /* ============================================================
//    LABEL
//    ============================================================ */

// .invoice-total-label {

//   width: 50%;

//   box-sizing: border-box;

//   border-left: 1px solid #222;

//   border-right: 1px solid #222;

//   border-top: 1px solid #222;

//   padding: 2.8mm 3mm;

//   font-size: 10px;

//   font-weight: 700;

//   text-align: center;

//   line-height: 1.2;

// }


// /* ============================================================
//    VALUE
//    ============================================================ */

// .invoice-total-value {

//   width: 50%;

//   box-sizing: border-box;

//   border-right: 1px solid #222;

//   border-top: 1px solid #222;

//   padding: 2.8mm 3mm;

//   font-size: 10px;

//   font-weight: 700;

//   text-align: right;

//   line-height: 1.2;

// }


// /* ============================================================
//    IMPORTANT:
//    NO BOTTOM BORDER ON TOTAL
//    ============================================================ */

// .invoice-total-row:first-child
// .invoice-total-label,

// .invoice-total-row:first-child
// .invoice-total-value {

//   border-bottom: 0;

// }


// /* ============================================================
//    DISCOUNT TOP BORDER
//    This creates the separator between Total and Discount.
//    ============================================================ */

// .invoice-total-row:nth-child(2)
// .invoice-total-label,

// .invoice-total-row:nth-child(2)
// .invoice-total-value {

//   border-top: 1px solid #222;

//   border-bottom: 0;

// }


// /* ============================================================
//    NET TOTAL
//    ============================================================ */

// .invoice-total-row:last-child
// .invoice-total-label,

// .invoice-total-row:last-child
// .invoice-total-value {

//   border-top: 1px solid #222;

//   border-bottom: 1px solid #222;

// }


// /* ============================================================
//    TERMS & CONDITIONS
//    ============================================================ */

// .invoice-terms-box {

//   width: 100%;

//   box-sizing: border-box;

//   border: 1px solid #222;

//   margin-top: 7mm;

//   font-size: 9.5px;

//   page-break-inside: avoid;

// }


// .invoice-terms-title {

//   display: block;

//   width: 100%;

//   box-sizing: border-box;

//   padding: 1.8mm 2.5mm;

//   background: #f1f1f1;

//   border-bottom: 1px solid #222;

//   font-size: 10px;

//   font-weight: 700;

//   text-align: left;

// }


// .invoice-terms-content {

//   width: 100%;

//   box-sizing: border-box;

//   padding: 2.5mm 3mm;

// }


// .invoice-term-item {

//   display: flex;

//   width: 100%;

//   box-sizing: border-box;

//   margin: 0;

//   padding: 0.8mm 0;

//   line-height: 1.00;

// }


// .invoice-term-number {

//   width: 7mm;

//   flex-shrink: 0;

//   font-weight: 600;

// }


// .invoice-term-text {

//   flex: 1;

//   min-width: 0;

//   white-space: normal;

//   overflow-wrap: break-word;

// }


// /* ============================================================
//    FOOTER
//    ============================================================ */

// .invoice-footer-note {

//   margin-top: 4mm;

//   padding-top: 2mm;

//   border-top: 1px solid #ccc;

// }


// .invoice-footer-note p {

//   text-align: center;

//   font-size: 9px;

//   color: #888;

//   margin: 0;

//   font-style: italic;

// }


// /* ============================================================
//    PRINT
//    ============================================================ */

// @media print {

//   @page {

//     size: A4 portrait;

//     margin: 0;

//   }


//   html,
//   body {

//     width: 210mm;

//     min-height: 297mm;

//     margin: 0 !important;

//     padding: 0 !important;

//     background: white !important;

//   }


//   body * {

//     visibility: hidden !important;

//   }


//   .invoice-print-area,
//   .invoice-print-area * {

//     visibility: visible !important;

//   }


//   .invoice-preview-overlay {

//     position: static !important;

//     width: 210mm !important;

//     min-height: 297mm !important;

//     padding: 0 !important;

//     margin: 0 !important;

//     overflow: visible !important;

//     background: white !important;

//   }


//   .invoice-preview-controls {

//     display: none !important;

//   }


//   .invoice-print-area {

//     position: absolute !important;

//     left: 0 !important;

//     top: 0 !important;

//     width: 210mm !important;

//     margin: 0 !important;

//     padding: 0 !important;

//   }


//   .invoice-sheet {

//     width: 210mm !important;

//     min-height: 297mm !important;

//     margin: 0 !important;

//     padding: 15mm 17mm !important;

//     box-sizing: border-box !important;

//     box-shadow: none !important;

//   }


//   /* ==========================================================
//      PRODUCT TABLE PRINT
//      ========================================================== */

//   .invoice-table {

//     width: 100% !important;

//     border-collapse: collapse !important;

//     border: 1px solid #222 !important;

//   }


//   .invoice-table thead th {

//     border-left: 1px solid #222 !important;

//     border-right: 1px solid #222 !important;

//     border-top: 0 !important;

//     border-bottom: 1px solid #222 !important;

//   }


//   .invoice-table tbody td {

//     border-left: 1px solid #222 !important;

//     border-right: 1px solid #222 !important;

//     border-top: 0 !important;

//     border-bottom: 0 !important;

//     background: transparent !important;

//   }


//   .invoice-table tbody .invoice-empty-row td {

//     border-left: 1px solid #222 !important;

//     border-right: 1px solid #222 !important;

//     border-top: 0 !important;

//     border-bottom: 0 !important;

//   }


//   .invoice-table tbody tr:last-child td {

//     border-bottom: 1px solid #222 !important;

//   }


//   /* ==========================================================
//      TOTAL / DISCOUNT / NET TOTAL PRINT
//      ========================================================== */

//   .invoice-total-wrapper {

//     width: 34% !important;

//     margin-top: 5mm !important;

//     margin-left: auto !important;

//     display: flex !important;

//     flex-direction: column !important;

//     align-items: stretch !important;

//   }


//   .invoice-total-row {

//     width: 100% !important;

//     display: flex !important;

//     flex-direction: row !important;

//     margin: 0 !important;

//     padding: 0 !important;

//   }


//   .invoice-total-label {

//     width: 50% !important;

//     box-sizing: border-box !important;

//     border-left: 1px solid #222 !important;

//     border-right: 1px solid #222 !important;

//     border-top: 1px solid #222 !important;

//     padding: 2.8mm 3mm !important;

//     font-size: 10px !important;

//     font-weight: 700 !important;

//     text-align: center !important;

//     line-height: 1.2 !important;

//   }


//   .invoice-total-value {

//     width: 50% !important;

//     box-sizing: border-box !important;

//     border-right: 1px solid #222 !important;

//     border-top: 1px solid #222 !important;

//     padding: 2.8mm 3mm !important;

//     font-size: 10px !important;

//     font-weight: 700 !important;

//     text-align: right !important;

//     line-height: 1.2 !important;

//   }


//   /* ==========================================================
//      TOTAL:
//      NO BOTTOM BORDER
//      ========================================================== */

//   .invoice-total-row:first-child
//   .invoice-total-label,

//   .invoice-total-row:first-child
//   .invoice-total-value {

//     border-bottom: 0 !important;

//   }


//   /* ==========================================================
//      DISCOUNT:
//      TOP SEPARATOR ONLY
//      ========================================================== */

//   .invoice-total-row:nth-child(2)
//   .invoice-total-label,

//   .invoice-total-row:nth-child(2)
//   .invoice-total-value {

//     border-top: 1px solid #222 !important;

//     border-bottom: 0 !important;

//   }


//   /* ==========================================================
//      NET TOTAL:
//      TOP + BOTTOM
//      ========================================================== */

//   .invoice-total-row:last-child
//   .invoice-total-label,

//   .invoice-total-row:last-child
//   .invoice-total-value {

//     border-top: 1px solid #222 !important;

//     border-bottom: 1px solid #222 !important;

//   }


//   /* ==========================================================
//      TERMS & CONDITIONS PRINT
//      ========================================================== */

//   .invoice-terms-box {

//     width: 100% !important;

//     box-sizing: border-box !important;

//     border: 1px solid #222 !important;

//     margin-top: 7mm !important;

//     page-break-inside: avoid !important;

//     break-inside: avoid !important;

//   }


//   .invoice-terms-title {

//     display: block !important;

//     width: 100% !important;

//     box-sizing: border-box !important;

//     padding: 1.8mm 2.5mm !important;

//     background: #f1f1f1 !important;

//     border-bottom: 1px solid #222 !important;

//     font-size: 10px !important;

//     font-weight: 700 !important;

//     text-align: left !important;

//     -webkit-print-color-adjust: exact !important;

//     print-color-adjust: exact !important;

//   }


//   .invoice-terms-content {

//     width: 100% !important;

//     box-sizing: border-box !important;

//     padding: 2.5mm 3mm !important;

//     -webkit-print-color-adjust: exact !important;

//     print-color-adjust: exact !important;

//   }


//   .invoice-term-item {

//     display: flex !important;

//     width: 100% !important;

//     box-sizing: border-box !important;

//     margin: 0 !important;

//     padding: 0.8mm 0 !important;

//     line-height: 1.45 !important;

//   }


//   .invoice-term-number {

//     width: 7mm !important;

//     flex-shrink: 0 !important;

//     font-weight: 600 !important;

//   }


//   .invoice-term-text {

//     flex: 1 !important;

//     min-width: 0 !important;

//     white-space: normal !important;

//     overflow-wrap: break-word !important;

//   }


//   /* ==========================================================
//      FOOTER PRINT
//      ========================================================== */

//   .invoice-footer-note {

//     border-top: 1px solid #ccc !important;

//   }

// }

// `


// /* ================================================================
//    INSERT PRINT CSS
//    ================================================================ */

// if (
//   typeof document !== 'undefined'
// ) {

//   const styleId =
//     'invoice-print-styles'


//   const oldStyle =
//     document.getElementById(
//       styleId
//     )


//   if (!oldStyle) {

//     const style =
//       document.createElement(
//         'style'
//       )


//     style.id =
//       styleId


//     style.innerHTML =
//       invoicePrintStyles


//     document.head.appendChild(
//       style
//     )

//   }

// }







// import { useEffect, useMemo, useState } from 'react'

// import {
//   ref,
//   push,
//   onValue,
//   update,
//   get,
//   set,
//   remove
// } from 'firebase/database'

// import {
//   Plus,
//   Trash2,
//   Receipt,
//   Pencil,
//   Printer,
//   X,
//   Save,
//   Download,
//   Search,
//   ArrowUpDown
// } from 'lucide-react'

// import { db } from '../firebase'
// import { useAuth } from '../context/AuthContext'

// import {
//   formatDate,
//   todayISO,
//   currency
// } from '../utils/helpers'

// import { Modal } from './Customers'
// import Loader from '../components/Loader'


// /* ============================================================
//    FALLBACK COMPANY INFORMATION
//    ============================================================
//    Ye sirf fallback hain — agar kisi company ne apni detail
//    set nahi ki to ye use honge.
//    ============================================================ */

// const FALLBACK_COMPANY_NAME = ''

// const FALLBACK_COMPANY_LOGO = '/PN.png'

// const FALLBACK_COMPANY_ADDRESS = `
// KCHS, Gohar Chamber, Office # 304,
// Shahra-e-Faisal, near Duty Free Shop,
// Karachi, 75600
// `

// const FALLBACK_COMPANY_PHONE = '0341-1293604'

// const FALLBACK_COMPANY_NTN = '-'

// const FALLBACK_COMPANY_STRN = '-'


// /* ============================================================
//    INVOICE NUMBER GENERATOR
//    ============================================================ */

// function getTodayDateString() {

//   const today = new Date()

//   const year =
//     today.getFullYear()

//   const month =
//     String(
//       today.getMonth() + 1
//     ).padStart(2, '0')

//   const day =
//     String(
//       today.getDate()
//     ).padStart(2, '0')

//   return `${year}${month}${day}`

// }


// async function getNextInvoiceNumber(companyId) {

//   try {

//     const dateStr =
//       getTodayDateString()

//     const counterRef =
//       ref(
//         db,
//         `companies/${companyId}/counters/invoice`
//       )

//     const snapshot =
//       await get(counterRef)

//     let lastNumber = 0
//     let lastDate = ''

//     if (snapshot.exists()) {

//       const data =
//         snapshot.val()

//       lastNumber =
//         data.number || 0

//       lastDate =
//         data.date || ''

//     }

//     let nextNumber =
//       lastNumber + 1

//     if (lastDate !== dateStr) {

//       nextNumber = 1

//     }

//     const padded =
//       String(
//         nextNumber
//       ).padStart(4, '0')

//     return `INV-${dateStr}-${padded}`

//   } catch (error) {

//     console.error(
//       'Error getting invoice number:',
//       error
//     )

//     const dateStr =
//       getTodayDateString()

//     const timestamp =
//       Date.now()
//         .toString()
//         .slice(-6)

//     return `INV-${dateStr}-${timestamp}`

//   }

// }


// async function incrementInvoiceCounter(companyId) {

//   try {

//     const dateStr =
//       getTodayDateString()

//     const counterRef =
//       ref(
//         db,
//         `companies/${companyId}/counters/invoice`
//       )

//     const snapshot =
//       await get(counterRef)

//     let lastNumber = 0
//     let lastDate = ''

//     if (snapshot.exists()) {

//       const data =
//         snapshot.val()

//       lastNumber =
//         data.number || 0

//       lastDate =
//         data.date || ''

//     }

//     let newNumber =
//       lastNumber + 1

//     if (lastDate !== dateStr) {

//       newNumber = 1

//     }

//     await set(
//       counterRef,
//       {
//         date: dateStr,
//         number: newNumber
//       }
//     )

//     return {
//       number: newNumber,
//       date: dateStr
//     }

//   } catch (error) {

//     console.error(
//       'Error incrementing counter:',
//       error
//     )

//     return null

//   }

// }


// /* ============================================================
//    EMPTY PRODUCT
//    ============================================================ */

// const emptyItem = {
//   name: '',
//   qty: 1,
//   price: '',
//   unit: 'PCS'
// }


// /* ============================================================
//    HELPER: GET CUSTOMER DISPLAY NAME
//    ============================================================ */

// function getCustomerDisplayInfo(invoice) {
//   const name = String(invoice.customerName || '').trim()
//   const company = String(invoice.customerCompany || '').trim()

//   return {
//     primary: name || company || '-',
//     secondary: name && company ? company : '',
//     hasName: !!name,
//     hasCompany: !!company
//   }
// }


// /* ============================================================
//    MAIN INVOICE COMPONENT
//    ============================================================ */

// export default function Invoice() {

//   const { companyId, company } =
//     useAuth()


//   /* ============================================================
//      DYNAMIC COMPANY INFO (with fallback)
//      ============================================================ */

//   const companyName =
//     company?.name ||
//     FALLBACK_COMPANY_NAME

//   const companyLogo =
//     company?.logoUrl ||
//     FALLBACK_COMPANY_LOGO

//   const companyAddress =
//     company?.address ||
//     FALLBACK_COMPANY_ADDRESS

//   const companyPhone =
//     company?.phone ||
//     FALLBACK_COMPANY_PHONE

//   const companyEmail =
//     company?.email ||
//     ''

//   const companyNTN =
//     company?.ntn ||
//     FALLBACK_COMPANY_NTN

//   const companySTRN =
//     company?.strn ||
//     FALLBACK_COMPANY_STRN


//   const [customers, setCustomers] =
//     useState(null)

//   const [invoices, setInvoices] =
//     useState(null)

//   const [showForm, setShowForm] =
//     useState(false)

//   const [preview, setPreview] =
//     useState(null)

//   const [editingInvoice, setEditingInvoice] =
//     useState(null)

//   const [customerId, setCustomerId] =
//     useState('')

//   /* ============================================================
//      CUSTOMER SEARCH
//      ============================================================ */

//   const [customerSearch, setCustomerSearch] =
//     useState('')

//   const [showCustomerDropdown, setShowCustomerDropdown] =
//     useState(false)

//   const [invoiceNumber, setInvoiceNumber] =
//     useState('')


//   /* ============================================================
//      INVOICE DATE
//      ============================================================ */

//   const [invoiceDate, setInvoiceDate] =
//     useState(
//       todayISO()
//     )


//   const [poNumber, setPoNumber] =
//     useState('')

//   const [poDate, setPoDate] =
//     useState('')


//   const [items, setItems] =
//     useState([])


//   const [pick, setPick] =
//     useState({
//       ...emptyItem
//     })


//   /* ============================================================
//      DISCOUNT
//      ============================================================ */

//   const [discount, setDiscount] =
//     useState(0)


//   /* ============================================================
//      TERMS & CONDITIONS
//      ============================================================ */

//   const [termsAndConditions, setTermsAndConditions] =
//     useState('')


//   const [saving, setSaving] =
//     useState(false)

//   const [error, setError] =
//     useState('')


//   /* ============================================================
//      DELETE CONFIRMATION
//      ============================================================ */

//   const [deleteConfirm, setDeleteConfirm] =
//     useState(null)

//   const [deleting, setDeleting] =
//     useState(false)


//   /* ============================================================
//      EDIT PRODUCT STATE
//      ============================================================ */

//   const [editingProductIndex, setEditingProductIndex] =
//     useState(null)


//   const [editProduct, setEditProduct] =
//     useState({
//       name: '',
//       qty: 1,
//       price: 0,
//       unit: 'PCS'
//     })


//   /* ============================================================
//      SEARCH STATE
//      ============================================================ */

//   const [searchTerm, setSearchTerm] =
//     useState('')


//   /* ============================================================
//      SORT STATE
//      ============================================================ */

//   const [sortBy, setSortBy] =
//     useState('date-desc')


//   /* ============================================================
//      LOAD CUSTOMERS AND INVOICES
//      ============================================================ */

//   useEffect(() => {

//     if (!companyId) {

//       return

//     }


//     const customersRef =
//       ref(
//         db,
//         `companies/${companyId}/customers`
//       )


//     const unsubscribeCustomers =
//       onValue(
//         customersRef,

//         (snapshot) => {

//           const value =
//             snapshot.val() || {}

//           const list =
//             Object.entries(value)
//               .map(
//                 ([id, customer]) => ({
//                   id,
//                   ...customer
//                 })
//               )

//           setCustomers(list)

//         },

//         (err) => {

//           console.error(
//             'Customers read failed:',
//             err
//           )

//           setCustomers([])

//         }
//       )


//     const invoicesRef =
//       ref(
//         db,
//         `companies/${companyId}/invoices`
//       )


//     const unsubscribeInvoices =
//       onValue(
//         invoicesRef,

//         (snapshot) => {

//           const value =
//             snapshot.val() || {}

//           const list =
//             Object.entries(value)
//               .map(
//                 ([id, invoice]) => ({
//                   id,
//                   ...invoice
//                 })
//               )

//           setInvoices(list)

//         },

//         (err) => {

//           console.error(
//             'Invoices read failed:',
//             err
//           )

//           setInvoices([])

//         }
//       )


//     return () => {

//       unsubscribeCustomers()

//       unsubscribeInvoices()

//     }

//   }, [companyId])


//   /* ============================================================
//      FILTERED CUSTOMERS
//      ============================================================ */

//   const filteredCustomers =
//     useMemo(() => {

//       const search =
//         customerSearch
//           .trim()
//           .toLowerCase()

//       if (!search) {
//         return customers || []
//       }

//       return (customers || []).filter(
//         customer => {
//           const name = String(customer.name || '').toLowerCase()
//           const company = String(customer.company || '').toLowerCase()
//           const phone = String(customer.phone || '').toLowerCase()
//           const address = String(customer.address || '').toLowerCase()

//           return (
//             name.includes(search) ||
//             company.includes(search) ||
//             phone.includes(search) ||
//             address.includes(search)
//           )
//         }
//       )
//     }, [customers, customerSearch])


//   /* ============================================================
//      FILTERED + SORTED INVOICES
//      ============================================================ */

//   const filteredInvoices =
//     useMemo(() => {

//       if (!invoices) return []

//       const search =
//         searchTerm
//           .trim()
//           .toLowerCase()

//       // First filter
//       let result = invoices

//       if (search) {
//         result = invoices.filter(
//           invoice => {

//             if (
//               invoice.invoiceNumber &&
//               invoice.invoiceNumber
//                 .toLowerCase()
//                 .includes(search)
//             ) {
//               return true
//             }

//             if (
//               invoice.customerName &&
//               invoice.customerName
//                 .toLowerCase()
//                 .includes(search)
//             ) {
//               return true
//             }

//             if (
//               invoice.customerCompany &&
//               invoice.customerCompany
//                 .toLowerCase()
//                 .includes(search)
//             ) {
//               return true
//             }

//             if (
//               invoice.date &&
//               formatDate(invoice.date)
//                 .toLowerCase()
//                 .includes(search)
//             ) {
//               return true
//             }

//             if (
//               invoice.poNumber &&
//               invoice.poNumber
//                 .toLowerCase()
//                 .includes(search)
//             ) {
//               return true
//             }

//             return false
//           }
//         )
//       }

//       // Then sort
//       const sorted = [...result]

//       const getAmount = (inv) => {
//         if (inv.netTotal !== undefined && inv.netTotal !== null) {
//           return Number(inv.netTotal) || 0
//         }
//         return Math.max(
//           0,
//           Number(inv.total || 0) - Number(inv.discount || 0)
//         )
//       }

//       switch (sortBy) {
//         case 'date-asc':
//           sorted.sort((a, b) => {
//             const dateA = new Date(a.date || 0).getTime()
//             const dateB = new Date(b.date || 0).getTime()
//             if (dateA !== dateB) return dateA - dateB
//             return (a.createdAt || 0) - (b.createdAt || 0)
//           })
//           break

//         case 'amount-desc':
//           sorted.sort((a, b) => {
//             const amountA = getAmount(a)
//             const amountB = getAmount(b)
//             if (amountB !== amountA) return amountB - amountA
//             return (b.createdAt || 0) - (a.createdAt || 0)
//           })
//           break

//         case 'amount-asc':
//           sorted.sort((a, b) => {
//             const amountA = getAmount(a)
//             const amountB = getAmount(b)
//             if (amountA !== amountB) return amountA - amountB
//             return (b.createdAt || 0) - (a.createdAt || 0)
//           })
//           break

//         case 'date-desc':
//         default:
//           sorted.sort((a, b) => {
//             const dateA = new Date(a.date || 0).getTime()
//             const dateB = new Date(b.date || 0).getTime()
//             if (dateA !== dateB) return dateB - dateA
//             return (b.createdAt || 0) - (a.createdAt || 0)
//           })
//           break
//       }

//       return sorted

//     }, [invoices, searchTerm, sortBy])


//   /* ============================================================
//      SELECT CUSTOMER
//      ============================================================ */

//   function selectCustomer(customer) {
//     setCustomerId(customer.id)
//     setCustomerSearch(
//       `${customer.name || ''}${customer.company ? ` — ${customer.company}` : ''}`
//     )
//     setShowCustomerDropdown(false)
//     setError('')
//   }


//   /* ============================================================
//      TOTAL
//      ============================================================ */

//   const total =
//     useMemo(() => {

//       return items.reduce(
//         (sum, item) => {

//           const qty =
//             Number(item.qty) || 0

//           const price =
//             Number(item.price) || 0

//           return (
//             sum +
//             qty * price
//           )

//         },
//         0
//       )

//     }, [items])


//   /* ============================================================
//      DISCOUNT VALUE
//      ============================================================ */

//   const discountValue =
//     useMemo(() => {

//       const value =
//         Number(discount) || 0

//       return Math.min(
//         Math.max(
//           value,
//           0
//         ),
//         total
//       )

//     }, [discount, total])


//   /* ============================================================
//      NET TOTAL
//      ============================================================ */

//   const netTotal =
//     useMemo(() => {

//       return Math.max(
//         0,
//         total - discountValue
//       )

//     }, [total, discountValue])


//   /* ============================================================
//      ADD PRODUCT
//      ============================================================ */

//   function addItem() {

//     if (!pick.name.trim()) {

//       return

//     }


//     const newItem = {

//       name:
//         pick.name.trim(),

//       qty:
//         Math.max(
//           1,
//           Number(pick.qty) || 1
//         ),

//       price:
//         Math.max(
//           0,
//           Number(pick.price) || 0
//         ),

//       unit:
//         pick.unit || 'PCS'

//     }


//     setItems(
//       previous => [
//         ...previous,
//         newItem
//       ]
//     )


//     setPick({
//       ...emptyItem
//     })

//   }


//   /* ============================================================
//      REMOVE PRODUCT
//      ============================================================ */

//   function removeItem(index) {

//     setItems(
//       previous =>
//         previous.filter(
//           (_, i) =>
//             i !== index
//         )
//     )

//   }


//   /* ============================================================
//      EDIT PRODUCT - OPEN
//      ============================================================ */

//   function openEditProduct(index) {

//     const item =
//       items[index]

//     if (!item) {

//       return

//     }

//     setEditingProductIndex(
//       index
//     )

//     setEditProduct({

//       name:
//         item.name,

//       qty:
//         item.qty,

//       price:
//         item.price,

//       unit:
//         item.unit || 'PCS'

//     })

//   }


//   /* ============================================================
//      EDIT PRODUCT - SAVE
//      ============================================================ */

//   function saveEditProduct() {

//     if (
//       !editProduct.name.trim()
//     ) {

//       return

//     }


//     if (
//       editingProductIndex === null
//     ) {

//       return

//     }


//     const updatedItems =
//       [...items]


//     updatedItems[
//       editingProductIndex
//     ] = {

//       name:
//         editProduct.name.trim(),

//       qty:
//         Math.max(
//           1,
//           Number(
//             editProduct.qty
//           ) || 1
//         ),

//       price:
//         Math.max(
//           0,
//           Number(
//             editProduct.price
//           ) || 0
//         ),

//       unit:
//         editProduct.unit || 'PCS'

//     }


//     setItems(
//       updatedItems
//     )


//     setEditingProductIndex(
//       null
//     )


//     setEditProduct({

//       name: '',
//       qty: 1,
//       price: 0,
//       unit: 'PCS'

//     })

//   }


//   /* ============================================================
//      EDIT PRODUCT - CLOSE
//      ============================================================ */

//   function closeEditProduct() {

//     setEditingProductIndex(
//       null
//     )

//     setEditProduct({

//       name: '',
//       qty: 1,
//       price: 0,
//       unit: 'PCS'

//     })

//   }


//   /* ============================================================
//      RESET FORM
//      ============================================================ */

//   function resetForm() {

//     setCustomerId('')
//     setCustomerSearch('')
//     setShowCustomerDropdown(false)

//     setInvoiceNumber('')

//     setInvoiceDate(
//       todayISO()
//     )

//     setPoNumber('')

//     setPoDate('')

//     setItems([])

//     setPick({
//       ...emptyItem
//     })

//     setDiscount(0)

//     setTermsAndConditions('')

//     setEditingInvoice(
//       null
//     )

//     setError('')

//     setEditingProductIndex(
//       null
//     )

//     setEditProduct({

//       name: '',
//       qty: 1,
//       price: 0,
//       unit: 'PCS'

//     })

//   }


//   /* ============================================================
//      DELETE INVOICE
//      ============================================================ */

//   async function handleDeleteInvoice() {

//     if (
//       !companyId ||
//       !deleteConfirm
//     ) {

//       return

//     }


//     setDeleting(true)


//     try {

//       const invoiceRef =
//         ref(
//           db,
//           `companies/${companyId}/invoices/${deleteConfirm.id}`
//         )


//       await remove(
//         invoiceRef
//       )


//       setDeleteConfirm(
//         null
//       )

//     } catch (err) {

//       console.error(
//         'Invoice delete error:',
//         err
//       )

//       alert(
//         'Invoice delete nahi ho saka. Dobara koshish karein.'
//       )

//     } finally {

//       setDeleting(false)

//     }

//   }


//   /* ============================================================
//      OPEN NEW INVOICE
//      ============================================================ */

//   const openNewInvoice =
//     async () => {

//       resetForm()

//       setInvoiceDate(
//         todayISO()
//       )

//       setDiscount(0)

//       setTermsAndConditions('')


//       if (companyId) {

//         const number =
//           await getNextInvoiceNumber(
//             companyId
//           )

//         setInvoiceNumber(
//           number
//         )

//       }


//       setShowForm(
//         true
//       )

//     }


//   /* ============================================================
//      OPEN EDIT INVOICE
//      ============================================================ */

//   function openEditInvoice(invoice) {

//     setEditingInvoice(
//       invoice
//     )


//     setCustomerId(
//       invoice.customerId || ''
//     )

//     const editCustomer =
//       customers?.find(
//         customer =>
//           customer.id === invoice.customerId
//       )

//     setCustomerSearch(
//       editCustomer
//         ? `${editCustomer.name || ''}${editCustomer.company ? ` — ${editCustomer.company}` : ''}`
//         : invoice.customerName || invoice.customerCompany || ''
//     )

//     setShowCustomerDropdown(false)


//     setInvoiceNumber(
//       invoice.invoiceNumber || ''
//     )


//     setInvoiceDate(
//       invoice.date ||
//       todayISO()
//     )


//     setPoNumber(
//       invoice.poNumber || ''
//     )


//     setPoDate(
//       invoice.poDate || ''
//     )


//     setItems(
//       Array.isArray(
//         invoice.items
//       )
//         ? invoice.items.map(
//             item => ({

//               name:
//                 item.name || '',

//               qty:
//                 Number(
//                   item.qty
//                 ) || 1,

//               price:
//                 Number(
//                   item.price
//                 ) || 0,

//               unit:
//                 item.unit || 'PCS'

//             })
//           )
//         : []
//     )


//     setDiscount(
//       Math.max(
//         0,
//         Number(
//           invoice.discount
//         ) || 0
//       )
//     )


//     setTermsAndConditions(
//       invoice.termsAndConditions || ''
//     )


//     setPick({
//       ...emptyItem
//     })


//     setError('')


//     setEditingProductIndex(
//       null
//     )


//     setShowForm(
//       true
//     )

//   }


//   /* ============================================================
//      CLOSE FORM
//      ============================================================ */

//   function closeForm() {

//     if (saving) {

//       return

//     }

//     setShowForm(false)

//     resetForm()

//   }


//   /* ============================================================
//      SAVE / UPDATE INVOICE
//      ============================================================ */

//   async function handleSubmit(e) {

//     e.preventDefault()

//     setError('')


//     if (!companyId) {

//       setError(
//         'Company ID nahi mila.'
//       )

//       return

//     }


//     if (!customerId) {

//       setError(
//         'Customer select karein.'
//       )

//       return

//     }


//     if (!invoiceDate) {

//       setError(
//         'Invoice date select karein.'
//       )

//       return

//     }


//     if (items.length === 0) {

//       setError(
//         'Kam az kam aik product add karein.'
//       )

//       return

//     }


//     const customer =
//       customers?.find(
//         c =>
//           c.id === customerId
//       )


//     if (!customer) {

//       setError(
//         'Customer nahi mila.'
//       )

//       return

//     }


//     const finalDiscount =
//       Math.min(
//         Math.max(
//           Number(discount) || 0,
//           0
//         ),
//         total
//       )


//     const finalNetTotal =
//       Math.max(
//         0,
//         total - finalDiscount
//       )


//     setSaving(true)


//     try {

//       let finalInvoiceNumber =
//         invoiceNumber


//       if (!editingInvoice) {

//         await incrementInvoiceCounter(
//           companyId
//         )


//         if (
//           !finalInvoiceNumber ||
//           finalInvoiceNumber.trim() === ''
//         ) {

//           const dateStr =
//             getTodayDateString()

//           const timestamp =
//             Date.now()
//               .toString()
//               .slice(-6)


//           finalInvoiceNumber =
//             `INV-${dateStr}-${timestamp}`


//           setInvoiceNumber(
//             finalInvoiceNumber
//           )

//         }

//       }


//       /* ========================================================
//          UPDATE EXISTING INVOICE
//          ======================================================== */

//       if (editingInvoice) {

//         const invoiceRef =
//           ref(
//             db,
//             `companies/${companyId}/invoices/${editingInvoice.id}`
//           )


//         const updatedInvoice = {

//           invoiceNumber:
//             finalInvoiceNumber,

//           date:
//             invoiceDate,

//           poNumber:
//             poNumber || '',

//           poDate:
//             poDate || '',

//           customerId:
//             customerId,

//           customerName:
//             customer.name || '',

//           customerCompany:
//             customer.company || '',

//           customerPhone:
//             customer.phone || '',

//           customerAddress:
//             customer.address || '',

//           companyName,
//           companyLogo,
//           companyAddress,
//           companyPhone,
//           companyEmail,
//           companyNTN,
//           companySTRN,

//           items:
//             items,

//           total:
//             total,

//           discount:
//             finalDiscount,

//           netTotal:
//             finalNetTotal,

//           termsAndConditions:
//             termsAndConditions.trim(),

//           updatedAt:
//             Date.now()

//         }


//         await update(
//           invoiceRef,
//           updatedInvoice
//         )


//         setShowForm(
//           false
//         )


//         resetForm()


//         setPreview({

//           id:
//             editingInvoice.id,

//           invoiceNumber:
//             updatedInvoice.invoiceNumber,

//           date:
//             updatedInvoice.date,

//           poNumber:
//             updatedInvoice.poNumber,

//           poDate:
//             updatedInvoice.poDate,

//           items:
//             updatedInvoice.items,

//           total:
//             updatedInvoice.total,

//           discount:
//             updatedInvoice.discount,

//           netTotal:
//             updatedInvoice.netTotal,

//           termsAndConditions:
//             updatedInvoice.termsAndConditions,

//           companyName,
//           companyLogo,
//           companyAddress,
//           companyPhone,
//           companyEmail,
//           companyNTN,
//           companySTRN,

//           customer: {

//             name:
//               updatedInvoice.customerName,

//             company:
//               updatedInvoice.customerCompany,

//             phone:
//               updatedInvoice.customerPhone,

//             address:
//               updatedInvoice.customerAddress

//           }

//         })


//         return

//       }


//       /* ========================================================
//          CREATE NEW INVOICE
//          ======================================================== */

//       const date =
//         invoiceDate


//       const invoiceData = {

//         invoiceNumber:
//           finalInvoiceNumber,

//         date:
//           date,

//         poNumber:
//           poNumber || '',

//         poDate:
//           poDate || '',

//         customerId:
//           customerId,

//         customerName:
//           customer.name || '',

//         customerCompany:
//           customer.company || '',

//         customerPhone:
//           customer.phone || '',

//         customerAddress:
//           customer.address || '',

//         companyName,
//         companyLogo,
//         companyAddress,
//         companyPhone,
//         companyEmail,
//         companyNTN,
//         companySTRN,

//         items:
//           items,

//         total:
//           total,

//         discount:
//           finalDiscount,

//         netTotal:
//           finalNetTotal,

//         termsAndConditions:
//           termsAndConditions.trim(),

//         createdAt:
//           Date.now()

//       }


//       const invoicesRef =
//         ref(
//           db,
//           `companies/${companyId}/invoices`
//         )


//       const newInvoice =
//         await push(
//           invoicesRef,
//           invoiceData
//         )


//       setPreview({

//         id:
//           newInvoice.key,

//         invoiceNumber:
//           finalInvoiceNumber,

//         date:
//           date,

//         poNumber:
//           invoiceData.poNumber,

//         poDate:
//           invoiceData.poDate,

//         items:
//           invoiceData.items,

//         total:
//           invoiceData.total,

//         discount:
//           invoiceData.discount,

//         netTotal:
//           invoiceData.netTotal,

//         termsAndConditions:
//           invoiceData.termsAndConditions,

//         companyName,
//         companyLogo,
//         companyAddress,
//         companyPhone,
//         companyEmail,
//         companyNTN,
//         companySTRN,

//         customer: {

//           name:
//             invoiceData.customerName,

//           company:
//             invoiceData.customerCompany,

//           phone:
//             invoiceData.customerPhone,

//           address:
//             invoiceData.customerAddress

//         }

//       })


//       setShowForm(
//         false
//       )


//       resetForm()


//     } catch (err) {

//       console.error(
//         'Invoice save error:',
//         err
//       )

//       setError(
//         err?.message ||
//         'Invoice save nahi ho saka. Dobara koshish karein.'
//       )

//     } finally {

//       setSaving(false)

//     }

//   }


//   /* ============================================================
//      DOWNLOAD / PREVIEW PDF
//      ============================================================ */

//   function handleDownloadPdf(invoice) {

//     const previewInvoice =
//       convertInvoiceToPreview(
//         invoice
//       )

//     setPreview(
//       previewInvoice
//     )

//   }


//   /* ============================================================
//      PAGE
//      ============================================================ */

//   return (

//     <>

//       <div>

//         {/* ======================================================
//             HEADER
//             ====================================================== */}

//         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">

//           <div>

//             <h1 className="font-display text-2xl font-semibold text-ink">
//               Invoice
//             </h1>

//             <p className="text-sm text-slateink mt-0.5">
//               Enter the product name, quantity, and price to create an invoice.
//             </p>

//           </div>


//           <button
//             onClick={openNewInvoice}
//             className="flex items-center gap-2 rounded-lg bg-ink text-white text-sm font-medium px-4 py-2.5 hover:bg-inkSoft transition-colors self-start"
//           >

//             <Plus size={16} />

//             New Invoice

//           </button>

//         </div>


//         {/* ======================================================
//             SEARCH BAR + SORT
//             ====================================================== */}

//         <div className="mb-6 flex flex-col sm:flex-row gap-4">

//           {/* SEARCH */}

//           <div className="flex-1">

//             <div className="relative max-w-md">

//               <input
//                 type="text"
//                 value={searchTerm}
//                 onChange={(e) =>
//                   setSearchTerm(e.target.value)
//                 }
//                 className="input w-full pl-9 pr-4"
//                 placeholder="Search by invoice #, customer, company, date..."
//               />

//               {searchTerm && (
//                 <button
//                   type="button"
//                   onClick={() => setSearchTerm('')}
//                   className="absolute right-3 top-1/2 -translate-y-1/2 text-slateink hover:text-ink"
//                 >
//                   <X size={14} />
//                 </button>
//               )}

//             </div>

//             <p className="text-xs text-slateink mt-1">
//               Search by invoice number, customer name, company name, or date
//             </p>

//           </div>

//           {/* SORT */}

//           <div className="flex items-start gap-2">

//             <div className="flex items-center gap-2">

//               <ArrowUpDown size={14} className="text-slateink mt-1" />

//               <select
//                 value={sortBy}
//                 onChange={(e) => setSortBy(e.target.value)}
//                 className="input text-sm py-2 pr-8 min-w-[190px]"
//               >
//                 <option value="date-desc">Date (Newest First)</option>
//                 <option value="date-asc">Date (Oldest First)</option>
//                 <option value="amount-desc">Amount (High to Low)</option>
//                 <option value="amount-asc">Amount (Low to High)</option>
//               </select>

//             </div>

//           </div>

//         </div>


//         {/* ======================================================
//             INVOICE LIST
//             ====================================================== */}

//         {invoices === null ? (

//           <Loader />

//         ) : filteredInvoices.length === 0 ? (

//           <div className="border border-dashed border-line rounded-2xl py-16 flex flex-col items-center justify-center text-center">

//             <Receipt
//               className="text-slateink mb-3"
//               size={28}
//             />

//             <p className="font-medium text-ink">
//               {searchTerm
//                 ? 'No matching invoices found'
//                 : 'Abhi tak koi invoice nahi bana'}
//             </p>

//             {searchTerm && (
//               <p className="text-sm text-slateink mt-1">
//                 Try searching with different keywords
//               </p>
//             )}

//           </div>

//         ) : (

//           <div className="bg-surface rounded-2xl border border-line shadow-card overflow-hidden">

//             <div className="overflow-x-auto">

//               <table className="w-full text-sm">

//                 <thead>

//                   <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-slateink">

//                     <th className="px-4 py-3 font-medium">
//                       Invoice #
//                     </th>

//                     <th className="px-4 py-3 font-medium">
//                       Customer
//                     </th>

//                     <th className="px-4 py-3 font-medium">
//                       Total
//                     </th>

//                     <th className="px-4 py-3 font-medium">
//                       Date
//                     </th>

//                     <th className="px-4 py-3 font-medium text-right">
//                       Action
//                     </th>

//                   </tr>

//                 </thead>


//                 <tbody>

//                   {filteredInvoices.map(
//                     invoice => {

//                       const display = getCustomerDisplayInfo(invoice)

//                       return (

//                         <tr
//                           key={invoice.id}
//                           className="border-b border-line last:border-0 hover:bg-paper/60"
//                         >

//                           <td className="px-4 py-3 font-mono text-xs">
//                             {invoice.invoiceNumber}
//                           </td>


//                           <td className="px-4 py-3">

//                             <p className="font-medium text-ink">
//                               {display.primary}
//                             </p>

//                             {display.secondary && (
//                               <p className="text-xs text-slateink">
//                                 {display.secondary}
//                               </p>
//                             )}

//                           </td>


//                           <td className="px-4 py-3 font-medium text-ink">

//                             Rs{' '}

//                             {currency(
//                               invoice.netTotal !== undefined
//                                 ? invoice.netTotal
//                                 : Math.max(
//                                     0,
//                                     Number(invoice.total || 0) -
//                                     Number(invoice.discount || 0)
//                                   )
//                             )}

//                           </td>


//                           <td className="px-4 py-3 text-xs font-mono text-slateink">

//                             {formatDate(
//                               invoice.date
//                             )}

//                           </td>


//                           <td className="px-4 py-3">

//                             <div className="flex items-center justify-end gap-2 flex-wrap">

//                               <button
//                                 onClick={() =>
//                                   setPreview(
//                                     convertInvoiceToPreview(
//                                       invoice
//                                     )
//                                   )
//                                 }
//                                 className="text-teal-dark text-xs font-medium hover:underline"
//                               >

//                                 View

//                               </button>


//                               <button
//                                 onClick={() =>
//                                   openEditInvoice(
//                                     invoice
//                                   )
//                                 }
//                                 className="inline-flex items-center gap-1.5 text-xs font-medium text-ink hover:text-teal-dark"
//                               >

//                                 <Pencil size={13} />

//                                 Edit

//                               </button>


//                               <button
//                                 onClick={() =>
//                                   handleDownloadPdf(
//                                     invoice
//                                   )
//                                 }
//                                 className="inline-flex items-center gap-1.5 text-xs font-medium text-red-600 hover:text-red-800"
//                               >

//                                 <Download size={13} />

//                                 PDF

//                               </button>


//                               <button
//                                 onClick={() =>
//                                   setDeleteConfirm(
//                                     invoice
//                                   )
//                                 }
//                                 className="inline-flex items-center gap-1.5 text-xs font-medium text-coral hover:text-red-700"
//                               >

//                                 <Trash2 size={13} />

//                                 Delete

//                               </button>

//                             </div>

//                           </td>

//                         </tr>

//                       )
//                     }
//                   )}

//                 </tbody>

//               </table>

//             </div>

//           </div>

//         )}


//         {/* ======================================================
//             CREATE / EDIT MODAL
//             ====================================================== */}

//         {showForm && (

//           <Modal
//             title={
//               editingInvoice
//                 ? `Edit Invoice ${editingInvoice.invoiceNumber}`
//                 : 'New Invoice'
//             }
//             onClose={closeForm}
//             wide
//           >

//             <form
//               onSubmit={handleSubmit}
//               className="space-y-5"
//             >

//               {/* =================================================
//                   INVOICE NUMBER + DATE
//                   ================================================= */}

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

//                 <label className="block">

//                   <span className="text-xs font-medium text-slateink">
//                     Invoice Number *
//                   </span>

//                   <input
//                     type="text"
//                     value={invoiceNumber}
//                     onChange={(e) =>
//                       setInvoiceNumber(
//                         e.target.value
//                       )
//                     }
//                     className="input mt-1"
//                     placeholder="INV-YYYYMMDD-0001"
//                     required
//                   />

//                   <small className="text-xs text-slateink mt-1 block">
//                     Format: INV-YYYYMMDD-0001 (Auto-generated)
//                   </small>

//                 </label>


//                 <label className="block">

//                   <span className="text-xs font-medium text-slateink">
//                     Invoice Date *
//                   </span>

//                   <input
//                     type="date"
//                     value={invoiceDate}
//                     onChange={(e) =>
//                       setInvoiceDate(
//                         e.target.value
//                       )
//                     }
//                     className="input mt-1"
//                     required
//                   />

//                 </label>

//               </div>


//               {/* =================================================
//                   CUSTOMER
//                   ================================================= */}

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

//                 <label className="block">

//                   <span className="text-xs font-medium text-slateink">
//                     Customer *
//                   </span>

//                   <div className="relative mt-1">

//                     <input
//                       type="text"
//                       value={customerSearch}
//                       onChange={(e) => {
//                         const value = e.target.value
//                         setCustomerSearch(value)

//                         if (customerId) {
//                           setCustomerId('')
//                         }

//                         setShowCustomerDropdown(true)
//                       }}
//                       onFocus={() =>
//                         setShowCustomerDropdown(true)
//                       }
//                       className="input w-full pr-10"
//                       placeholder="Search customer by name, company, phone..."
//                       autoComplete="off"
//                       required={!customerId}
//                     />

//                     {customerSearch && (
//                       <button
//                         type="button"
//                         onClick={() => {
//                           setCustomerId('')
//                           setCustomerSearch('')
//                           setShowCustomerDropdown(true)
//                         }}
//                         className="absolute right-3 top-1/2 -translate-y-1/2 text-slateink hover:text-ink"
//                         aria-label="Clear customer"
//                       >
//                         <X size={16} />
//                       </button>
//                     )}

//                     {showCustomerDropdown && (
//                       <div className="absolute z-[100] left-0 right-0 mt-1 max-h-64 overflow-y-auto rounded-lg border border-line bg-white shadow-lg">
//                         {filteredCustomers.length === 0 ? (
//                           <div className="px-3 py-3 text-sm text-slateink">
//                             No customer found.
//                           </div>
//                         ) : (
//                           filteredCustomers.map(customer => {

//                             const name = String(customer.name || '').trim()
//                             const company = String(customer.company || '').trim()

//                             return (

//                               <button
//                                 key={customer.id}
//                                 type="button"
//                                 onClick={() => selectCustomer(customer)}
//                                 className={`w-full text-left px-3 py-2.5 hover:bg-paper transition-colors border-b border-line last:border-b-0 ${customer.id === customerId ? 'bg-paper' : ''}`}
//                               >

//                                 {name ? (
//                                   <>
//                                     <p className="text-sm font-medium text-ink">
//                                       {name}
//                                     </p>
//                                     {company && (
//                                       <p className="text-xs text-slateink mt-0.5">
//                                         {company}
//                                       </p>
//                                     )}
//                                   </>
//                                 ) : (
//                                   company && (
//                                     <p className="text-sm font-medium text-ink">
//                                       {company}
//                                     </p>
//                                   )
//                                 )}

//                                 {customer.phone && (
//                                   <p className="text-xs text-slateink mt-0.5">
//                                     {customer.phone}
//                                   </p>
//                                 )}

//                               </button>

//                             )
//                           })
//                         )}
//                       </div>
//                     )}

//                   </div>

//                 </label>

//               </div>


//               {/* =================================================
//                   PO NUMBER + PO DATE
//                   ================================================= */}

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

//                 <label className="block">

//                   <span className="text-xs font-medium text-slateink">
//                     P/Order No.
//                   </span>

//                   <input
//                     type="text"
//                     value={poNumber}
//                     onChange={(e) =>
//                       setPoNumber(
//                         e.target.value
//                       )
//                     }
//                     className="input mt-1"
//                     placeholder="P/Order No."
//                   />

//                 </label>


//                 <label className="block">

//                   <span className="text-xs font-medium text-slateink">
//                     P/Order Date
//                   </span>

//                   <input
//                     type="date"
//                     value={poDate}
//                     onChange={(e) =>
//                       setPoDate(
//                         e.target.value
//                       )
//                     }
//                     className="input mt-1"
//                   />

//                 </label>

//               </div>


//               {/* =================================================
//                   PRODUCTS
//                   ================================================= */}

//               <div className="border border-line rounded-xl p-4">

//                 <p className="text-xs font-medium text-slateink mb-3">
//                   Add Products
//                 </p>


//                 <div className="flex flex-col sm:flex-row gap-2">

//                   <input
//                     value={pick.name}
//                     onChange={(e) =>
//                       setPick({
//                         ...pick,
//                         name:
//                           e.target.value
//                       })
//                     }
//                     className="input flex-1"
//                     placeholder="Product name / model"
//                   />

//                   <input
//                     type="text"
//                     value={pick.unit}
//                     onChange={(e) =>
//                       setPick({
//                         ...pick,
//                         unit:
//                           e.target.value
//                       })
//                     }
//                     className="input sm:w-20"
//                     placeholder="Unit"
//                   />

//                   <input
//                     type="number"
//                     min={1}
//                     value={pick.qty}
//                     onChange={(e) =>
//                       setPick({
//                         ...pick,
//                         qty:
//                           e.target.value
//                       })
//                     }
//                     className="input sm:w-24"
//                     placeholder="Qty"
//                   />


//                   <input
//                     type="number"
//                     min={0}
//                     step="0.01"
//                     value={pick.price}
//                     onChange={(e) =>
//                       setPick({
//                         ...pick,
//                         price:
//                           e.target.value
//                       })
//                     }
//                     className="input sm:w-32"
//                     placeholder="Unit Price"
//                   />


//                   <button
//                     type="button"
//                     onClick={addItem}
//                     disabled={!pick.name.trim()}
//                     className="rounded-lg bg-teal text-white text-sm font-medium px-4 py-2.5 hover:bg-teal-dark disabled:opacity-50 shrink-0"
//                   >

//                     Add

//                   </button>

//                 </div>


//                 {/* =================================================
//                     PRODUCTS ADDED
//                     ================================================= */}

//                 {items.length > 0 && (

//                   <div className="mt-4 space-y-2">

//                     {items.map(
//                       (
//                         item,
//                         index
//                       ) => (

//                         <div
//                           key={index}
//                           className="flex items-center justify-between bg-paper rounded-lg px-3 py-2 text-sm"
//                         >

//                           <div>

//                             <span className="font-medium text-ink">
//                               {item.name}
//                             </span>

//                             <span className="text-xs text-slateink ml-2">
//                               {item.unit || 'PCS'} x{item.qty}
//                             </span>

//                             <span className="text-xs text-slateink ml-2">
//                               @ Rs{' '}
//                               {currency(
//                                 item.price
//                               )}
//                             </span>

//                           </div>


//                           <div className="flex items-center gap-2">

//                             <button
//                               type="button"
//                               onClick={() =>
//                                 openEditProduct(
//                                   index
//                                 )
//                               }
//                               className="text-blue-600 hover:text-blue-800"
//                             >

//                               <Pencil size={15} />

//                             </button>


//                             <button
//                               type="button"
//                               onClick={() =>
//                                 removeItem(
//                                   index
//                                 )
//                               }
//                               className="text-coral hover:text-red-700"
//                             >

//                               <Trash2 size={15} />

//                             </button>

//                           </div>

//                         </div>

//                       )
//                     )}


//                     {/* =================================================
//                         FORM TOTAL
//                         ================================================= */}

//                     <div className="flex justify-end pt-3">

//                       <div className="w-full sm:w-64">

//                         <div className="flex justify-between py-1">

//                           <span className="text-xs text-slateink">
//                             Total
//                           </span>

//                           <span className="text-sm font-semibold text-ink">
//                             Rs {currency(total)}
//                           </span>

//                         </div>


//                         <div className="flex justify-between py-1">

//                           <span className="text-xs text-slateink">
//                             Discount
//                           </span>

//                           <span className="text-sm font-semibold text-red-600">
//                             Rs {currency(discountValue)}
//                           </span>

//                         </div>


//                         <div className="border-t border-line mt-1 pt-2 flex justify-between">

//                           <span className="text-sm font-bold text-ink">
//                             Net Total
//                           </span>

//                           <span className="text-lg font-bold text-ink">
//                             Rs {currency(netTotal)}
//                           </span>

//                         </div>

//                       </div>

//                     </div>

//                   </div>

//                 )}

//               </div>


//               {/* =================================================
//                   DISCOUNT
//                   ================================================= */}

//               <div className="border border-line rounded-xl p-4">

//                 <label className="block max-w-sm ml-auto">

//                   <span className="text-xs font-medium text-slateink">
//                     Discount
//                   </span>

//                   <div className="relative mt-1">

//                     <input
//                       type="number"
//                       min={0}
//                       max={total}
//                       step="0.01"
//                       value={discount}
//                       onChange={(e) =>
//                         setDiscount(
//                           e.target.value
//                         )
//                       }
//                       className="input pl-9 w-full"
//                       placeholder="0"
//                     />

//                   </div>

//                   <small className="text-xs text-slateink mt-1 block">
//                     Discount minus from total price.
//                   </small>

//                 </label>


//                 {/* SUMMARY */}

//                 <div className="mt-4 ml-auto max-w-sm border-t border-line pt-3">

//                   <div className="flex justify-between text-sm py-1">

//                     <span className="text-slateink">
//                       Total
//                     </span>

//                     <span className="font-medium text-ink">
//                       Rs {currency(total)}
//                     </span>

//                   </div>


//                   <div className="flex justify-between text-sm py-1">

//                     <span className="text-slateink">
//                       Discount
//                     </span>

//                     <span className="font-medium text-red-600">
//                       Rs {currency(discountValue)}
//                     </span>

//                   </div>


//                   <div className="flex justify-between border-t border-line pt-2 mt-1">

//                     <span className="font-bold text-ink">
//                       Net Total
//                     </span>

//                     <span className="font-bold text-lg text-ink">
//                       Rs {currency(netTotal)}
//                     </span>

//                   </div>

//                 </div>

//               </div>


//               {/* =================================================
//                   TERMS & CONDITIONS INPUT
//                   ================================================= */}

//               <div className="border border-line rounded-xl p-4">

//                 <label className="block">

//                   <span className="text-xs font-medium text-slateink">
//                     Terms & Conditions
//                   </span>

//                   <textarea
//                     value={termsAndConditions}
//                     onChange={(e) =>
//                       setTermsAndConditions(
//                         e.target.value
//                       )
//                     }
//                     rows={5}
//                     className="input mt-1 w-full resize-y"
//                     placeholder={`Example:
// 1. Payment must be made within 30 days.
// 2. Goods once sold cannot be returned.
// 3. Prices are exclusive of applicable taxes.`}
//                   />

//                   <small className="text-xs text-slateink mt-1 block">
//                     Enter each term on a new line.
//                   </small>

//                 </label>

//               </div>


//               {/* =================================================
//                   ERROR
//                   ================================================= */}

//               {error && (

//                 <p className="text-xs font-medium text-coral bg-coral-light rounded-lg px-3 py-2">
//                   {error}
//                 </p>

//               )}


//               {/* =================================================
//                   SAVE BUTTON
//                   ================================================= */}

//               <button
//                 type="submit"
//                 disabled={
//                   saving ||
//                   !customerId ||
//                   !invoiceDate ||
//                   items.length === 0
//                 }
//                 className="w-full rounded-lg bg-ink text-white text-sm font-medium py-2.5 hover:bg-inkSoft transition-colors disabled:opacity-60"
//               >

//                 {saving
//                   ? editingInvoice
//                     ? 'Updating…'
//                     : 'Saving…'
//                   : editingInvoice
//                   ? 'Update Invoice'
//                   : 'Generate Invoice'}

//               </button>

//             </form>

//           </Modal>

//         )}

//       </div>


//       {/* ========================================================
//           PREVIEW
//           ======================================================== */}

//       {preview && (

//         <InvoicePreview
//           invoice={preview}
//           onClose={() =>
//             setPreview(null)
//           }
//         />

//       )}


//       {/* ========================================================
//           DELETE CONFIRMATION
//           ======================================================== */}

//       {deleteConfirm && (

//         <div className="fixed inset-0 z-[99999] bg-black/60 flex items-center justify-center p-4">

//           <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">

//             <div className="flex items-center justify-between mb-4">

//               <h3 className="text-lg font-semibold text-ink">
//                 Delete Invoice
//               </h3>

//               <button
//                 onClick={() =>
//                   setDeleteConfirm(null)
//                 }
//                 className="text-slateink hover:text-ink"
//               >

//                 <X size={20} />

//               </button>

//             </div>


//             <div className="space-y-4">

//               <p className="text-sm text-ink">
//                 Are you sure to delete this invoice?
//               </p>


//               <div className="bg-paper rounded-lg p-3 text-sm">

//                 <p className="font-medium text-ink">
//                   {deleteConfirm.invoiceNumber}
//                 </p>

//                 <p className="text-slateink text-xs">
//                   {deleteConfirm.customerName || deleteConfirm.customerCompany || '-'}
//                 </p>


//                 <p className="text-slateink text-xs">
//                   Total: Rs{' '}
//                   {currency(
//                     deleteConfirm.total || 0
//                   )}
//                 </p>


//                 <p className="text-red-600 text-xs">
//                   Discount: Rs{' '}
//                   {currency(
//                     deleteConfirm.discount || 0
//                   )}
//                 </p>


//                 <p className="font-semibold text-ink text-xs">
//                   Net Total: Rs{' '}
//                   {currency(
//                     deleteConfirm.netTotal !== undefined
//                       ? deleteConfirm.netTotal
//                       : Math.max(
//                           0,
//                           Number(deleteConfirm.total || 0) -
//                           Number(deleteConfirm.discount || 0)
//                         )
//                   )}
//                 </p>

//               </div>


//               <div className="flex gap-3">

//                 <button
//                   onClick={() =>
//                     setDeleteConfirm(null)
//                   }
//                   className="flex-1 rounded-lg border border-line text-ink text-sm font-medium py-2.5 hover:bg-paper transition-colors"
//                 >
//                   Cancel
//                 </button>


//                 <button
//                   onClick={handleDeleteInvoice}
//                   disabled={deleting}
//                   className="flex-1 rounded-lg bg-coral text-white text-sm font-medium py-2.5 hover:bg-red-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
//                 >

//                   {deleting ? (

//                     'Deleting…'

//                   ) : (

//                     <>

//                       <Trash2 size={16} />

//                       Delete

//                     </>

//                   )}

//                 </button>

//               </div>

//             </div>

//           </div>

//         </div>

//       )}


//       {/* ========================================================
//           EDIT PRODUCT MODAL
//           ======================================================== */}

//       {editingProductIndex !== null && (

//         <div className="fixed inset-0 z-[99999] bg-black/60 flex items-center justify-center p-4">

//           <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">

//             <div className="flex items-center justify-between mb-4">

//               <h3 className="text-lg font-semibold text-ink">
//                 Edit Product
//               </h3>

//               <button
//                 onClick={closeEditProduct}
//                 className="text-slateink hover:text-ink"
//               >

//                 <X size={20} />

//               </button>

//             </div>


//             <div className="space-y-3">

//               <div>

//                 <label className="text-xs font-medium text-slateink">
//                   Product Name
//                 </label>

//                 <input
//                   type="text"
//                   value={editProduct.name}
//                   onChange={(e) =>
//                     setEditProduct({
//                       ...editProduct,
//                       name:
//                         e.target.value
//                     })
//                   }
//                   className="input mt-1 w-full"
//                   placeholder="Product name"
//                 />

//               </div>

//               <div>

//                 <label className="text-xs font-medium text-slateink">
//                   Unit
//                 </label>

//                 <input
//                   type="text"
//                   value={editProduct.unit}
//                   onChange={(e) =>
//                     setEditProduct({
//                       ...editProduct,
//                       unit:
//                         e.target.value
//                     })
//                   }
//                   className="input mt-1 w-full"
//                   placeholder="PCS, KG, MTR, etc."
//                 />

//               </div>


//               <div className="grid grid-cols-2 gap-3">

//                 <div>

//                   <label className="text-xs font-medium text-slateink">
//                     Quantity
//                   </label>

//                   <input
//                     type="number"
//                     min={1}
//                     value={editProduct.qty}
//                     onChange={(e) =>
//                       setEditProduct({
//                         ...editProduct,
//                         qty:
//                           Number(
//                             e.target.value
//                           ) || 1
//                       })
//                     }
//                     className="input mt-1 w-full"
//                   />

//                 </div>


//                 <div>

//                   <label className="text-xs font-medium text-slateink">
//                     Unit Price
//                   </label>

//                   <input
//                     type="number"
//                     min={0}
//                     step="0.01"
//                     value={editProduct.price}
//                     onChange={(e) =>
//                       setEditProduct({
//                         ...editProduct,
//                         price:
//                           Number(
//                             e.target.value
//                           ) || 0
//                       })
//                     }
//                     className="input mt-1 w-full"
//                   />

//                 </div>

//               </div>


//               <button
//                 type="button"
//                 onClick={saveEditProduct}
//                 disabled={
//                   !editProduct.name.trim()
//                 }
//                 className="w-full rounded-lg bg-blue-600 text-white text-sm font-medium py-2.5 hover:bg-blue-700 transition-colors disabled:opacity-50 mt-2 flex items-center justify-center gap-2"
//               >

//                 <Save size={16} />

//                 Save Product

//               </button>

//             </div>

//           </div>

//         </div>

//       )}

//     </>

//   )

// }


// /* ================================================================
//    CONVERT FIREBASE INVOICE TO PREVIEW
//    ================================================================ */

// function convertInvoiceToPreview(invoice) {

//   const total =
//     Number(
//       invoice.total || 0
//     )


//   const discount =
//     Math.min(
//       Math.max(
//         Number(
//           invoice.discount || 0
//         ),
//         0
//       ),
//       total
//     )


//   const netTotal =
//     invoice.netTotal !== undefined &&
//     invoice.netTotal !== null
//       ? Number(
//           invoice.netTotal
//         )
//       : Math.max(
//           0,
//           total - discount
//         )


//   return {

//     id:
//       invoice.id,

//     invoiceNumber:
//       invoice.invoiceNumber,

//     date:
//       invoice.date,

//     poNumber:
//       invoice.poNumber || '',

//     poDate:
//       invoice.poDate || '',

//     items:
//       invoice.items || [],

//     total:
//       total,

//     discount:
//       discount,

//     netTotal:
//       netTotal,

//     termsAndConditions:
//       invoice.termsAndConditions || '',

//     /* Priority: saved snapshot -> fallback */
//     companyName:
//       invoice.companyName ||
//       FALLBACK_COMPANY_NAME,

//     companyLogo:
//       invoice.companyLogo ||
//       FALLBACK_COMPANY_LOGO,

//     companyAddress:
//       invoice.companyAddress ||
//       FALLBACK_COMPANY_ADDRESS,

//     companyPhone:
//       invoice.companyPhone ||
//       FALLBACK_COMPANY_PHONE,

//     companyEmail:
//       invoice.companyEmail || '',

//     companyNTN:
//       invoice.companyNTN ||
//       FALLBACK_COMPANY_NTN,

//     companySTRN:
//       invoice.companySTRN ||
//       FALLBACK_COMPANY_STRN,

//     customer: {

//       name:
//         invoice.customerName || '',

//       company:
//         invoice.customerCompany || '',

//       phone:
//         invoice.customerPhone || '',

//       address:
//         invoice.customerAddress || ''

//     }

//   }

// }


// /* ================================================================
//    INVOICE PREVIEW
//    ================================================================ */

// function InvoicePreview({
//   invoice,
//   onClose
// }) {

//   /* ============================================================
//      LIVE COMPANY DATA (fallback for old invoices)
//      ============================================================ */

//   const { company } = useAuth()


//   function printInvoice() {

//     window.print()

//   }


//   const total =
//     Number(
//       invoice.total || 0
//     )


//   const discount =
//     Math.min(
//       Math.max(
//         Number(
//           invoice.discount || 0
//         ),
//         0
//       ),
//       total
//     )


//   const netTotal =
//     invoice.netTotal !== undefined &&
//     invoice.netTotal !== null
//       ? Number(
//           invoice.netTotal
//         )
//       : Math.max(
//           0,
//           total - discount
//         )


//   /* ============================================================
//      CUSTOMER DISPLAY LOGIC
//      ============================================================ */

//   const customerName = String(invoice.customer?.name || '').trim()
//   const customerCompany = String(invoice.customer?.company || '').trim()

//   const customerDisplayName = customerName || customerCompany || ''
//   const showCompanySeparately = customerName && customerCompany


//   /* ============================================================
//      DYNAMIC COMPANY INFO
//      Priority: invoice.X -> live company.X -> FALLBACK.X
//      ============================================================ */

//   const companyName =
//     invoice.companyName ||
//     company?.name ||
//     FALLBACK_COMPANY_NAME

//   const companyLogo =
//     invoice.companyLogo ||
//     company?.logoUrl ||
//     FALLBACK_COMPANY_LOGO

//   const companyAddress =
//     invoice.companyAddress ||
//     company?.address ||
//     FALLBACK_COMPANY_ADDRESS

//   const companyPhone =
//     invoice.companyPhone ||
//     company?.phone ||
//     FALLBACK_COMPANY_PHONE

//   const companyEmail =
//     invoice.companyEmail ||
//     company?.email ||
//     ''

//   const companyNTN =
//     invoice.companyNTN ||
//     company?.ntn ||
//     FALLBACK_COMPANY_NTN

//   const companySTRN =
//     invoice.companySTRN ||
//     company?.strn ||
//     FALLBACK_COMPANY_STRN


//   return (

//     <div className="invoice-preview-overlay fixed inset-0 z-[9999] bg-black/60 overflow-y-auto p-4 sm:p-8">


//       {/* ======================================================
//           TOP CONTROLS
//           ====================================================== */}

//       <div className="invoice-preview-controls max-w-[900px] mx-auto mb-4 flex items-center justify-between">

//         <div>

//           <p className="text-white font-semibold text-sm">
//             Invoice Preview
//           </p>

//           <p className="text-white/70 text-xs">
//             {invoice.invoiceNumber}
//           </p>

//         </div>


//         <div className="flex items-center gap-2">

//           <button
//             onClick={printInvoice}
//             className="inline-flex items-center gap-2 rounded-lg bg-white text-ink px-4 py-2 text-sm font-medium hover:bg-gray-100"
//           >

//             <Printer size={16} />

//             Print / Save as PDF

//           </button>


//           <button
//             onClick={onClose}
//             className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-white/10 text-white hover:bg-white/20"
//           >

//             <X size={18} />

//           </button>

//         </div>

//       </div>


//       {/* ======================================================
//           PRINT AREA
//           ====================================================== */}

//       <div
//         className="invoice-print-area"
//         id="invoice-print-area"
//       >

//         <div className="invoice-sheet">


//           {/* ==================================================
//               HEADER
//               ================================================== */}

//           <div className="invoice-header">


//             {/* COMPANY */}

//             <div className="invoice-company">

//               <img
//                 src={companyLogo}
//                 alt={companyName || 'Company Logo'}
//                 className="invoice-logo"
//                 onError={(e) => {
//                   // If uploaded logo fails, fall back to default
//                   if (e.currentTarget.src !== window.location.origin + FALLBACK_COMPANY_LOGO) {
//                     e.currentTarget.src = FALLBACK_COMPANY_LOGO
//                   }
//                 }}
//               />



//               <div className="invoice-company-address">

//                 {companyAddress}

//               </div>


//               {companyPhone && (

//                 <div className="invoice-company-address">

//                   {companyPhone}

//                 </div>

//               )}


//               {companyEmail && (

//                 <div className="invoice-company-address">

//                   {companyEmail}

//                 </div>

//               )}

//             </div>


//             {/* RIGHT SIDE */}

//             <div className="invoice-right-header">

//               <div className="invoice-tax-box">

//                 <div>
//                   NTN # {companyNTN}
//                 </div>

//                 <div>
//                   STRN # {companySTRN}
//                 </div>


//                 <div className="invoice-title">
//                   INVOICE
//                 </div>

//               </div>


//               <div className="invoice-meta-box">

//                 <div className="invoice-meta-title">
//                   Invoice No.
//                 </div>


//                 <div className="invoice-number">

//                   {invoice.invoiceNumber}

//                 </div>


//                 <div className="invoice-meta-row">

//                   <span>
//                     Date:
//                   </span>

//                   <span>

//                     {formatInvoiceDate(
//                       invoice.date
//                     )}

//                   </span>

//                 </div>


//                 <div className="invoice-meta-row">

//                   <span>
//                     P/Order No.
//                   </span>

//                   <span>
//                     {invoice.poNumber || ''}
//                   </span>

//                 </div>


//                 <div className="invoice-meta-row">

//                   <span>
//                     P/Order Date
//                   </span>

//                   <span>

//                     {invoice.poDate
//                       ? formatInvoiceDate(
//                           invoice.poDate
//                         )
//                       : ''}

//                   </span>

//                 </div>

//               </div>

//             </div>

//           </div>


//           {/* ==================================================
//               BUYER
//               ================================================== */}

//           <div className="invoice-buyer-box">

//             <div className="invoice-buyer-title">

//               Buyer's Name & Address

//             </div>


//             <div className="invoice-buyer-content">

//               {customerDisplayName && (
//                 <div className="invoice-buyer-name">
//                   {customerDisplayName}
//                 </div>
//               )}

//               {showCompanySeparately && (
//                 <div>
//                   {customerCompany}
//                 </div>
//               )}


//               {invoice.customer?.address && (

//                 <div>
//                   {invoice.customer.address}
//                 </div>

//               )}


//               {invoice.customer?.phone && (

//                 <div>
//                   {invoice.customer.phone}
//                 </div>

//               )}

//             </div>

//           </div>


//           {/* ==================================================
//               PRODUCT TABLE
//               ================================================== */}

//           <table className="invoice-table">

//             <colgroup>

//               <col className="qty-col " />

//               <col className="unit-col" />

//               <col className="description-col" />

//               <col className="price-col" />

//               <col className="amount-col" />

//             </colgroup>


//             <thead>

//               <tr>

//                 <th>
//                   Quantity
//                 </th>

//                 <th>
//                   Unit
//                 </th>

//                 <th >
//                   Description Of Goods
//                 </th>

//                 <th>
//                   Unit Price
//                 </th>

//                 <th>
//                   Amount
//                 </th>

//               </tr>

//             </thead>


//             <tbody>

//               {(invoice.items || []).map(
//                 (
//                   item,
//                   index
//                 ) => {

//                   const qty =
//                     Number(
//                       item.qty || 0
//                     )

//                   const price =
//                     Number(
//                       item.price || 0
//                     )

//                   const amount =
//                     qty * price


//                   return (

//                     <tr key={index}>

//                       <td className="quantity-cell">
//                         {qty}
//                       </td>

//                       <td>
//                         {item.unit || 'PCS'}
//                       </td>

//                       <td className="description-cell">
//                         {item.name}
//                       </td>

//                       <td className="number-cell">
//                         {currency(price)}
//                       </td>

//                       <td className="number-cell">
//                         {currency(amount)}
//                       </td>

//                     </tr>

//                   )

//                 }
//               )}


//               {Array.from({

//                 length:
//                   Math.max(
//                     3,
//                     8 -
//                       (
//                         invoice.items?.length ||
//                         0
//                       )
//                   )

//               }).map(
//                 (
//                   _,
//                   index
//                 ) => (

//                   <tr
//                     key={`empty-${index}`}
//                     className="invoice-empty-row"
//                   >

//                     <td></td>

//                     <td></td>

//                     <td></td>

//                     <td></td>

//                     <td></td>

//                   </tr>

//                 )
//               )}

//             </tbody>

//           </table>


//           {/* ============================================================
//               TOTAL / DISCOUNT / NET TOTAL
//               ============================================================ */}

//           <div className="invoice-total-wrapper">

//             <div className="invoice-total-row">

//               <div className="invoice-total-label">
//                 Total
//               </div>

//               <div className="invoice-total-value">
//                 PKR: {currency(
//                   total
//                 )}
//               </div>

//             </div>


//             <div className="invoice-total-row">

//               <div className="invoice-total-label">
//                 Discount
//               </div>

//               <div className="invoice-total-value">
//                PKR: {currency(
//                   discount
//                 )}
//               </div>

//             </div>


//             <div className="invoice-total-row">

//               <div className="invoice-total-label">
//                 Net Total
//               </div>

//               <div className="invoice-total-value">
//                 PKR: {currency(
//                   netTotal
//                 )} 
//               </div>

//             </div>

//           </div>


//           {/* ============================================================
//               TERMS & CONDITIONS
//               ============================================================ */}

//           {invoice.termsAndConditions?.trim() && (

//             <div className="invoice-terms-box">

//               <div className="invoice-terms-title">
//                 Terms &amp; Condition
//               </div>


//               <div className="invoice-terms-content">

//                 {invoice.termsAndConditions
//                   .split(/\r?\n/)
//                   .map(
//                     (term, index) => {

//                       const cleanTerm =
//                         term.trim()

//                       if (!cleanTerm) {
//                         return null
//                       }


//                       return (

//                         <div
//                           key={index}
//                           className="invoice-term-item"
//                         >

//                           <span className="invoice-term-number">
//                             {index + 1}.
//                           </span>

//                           <span className="invoice-term-text">
//                             {cleanTerm}
//                           </span>

//                         </div>

//                       )

//                     }
//                   )}

//               </div>

//             </div>

//           )}


//           {/* ==================================================
//               FOOTER
//               ================================================== */}

//           <div className="invoice-footer-note">

//             <p>

//               Note: This is a computer generated invoice, does not require any stamp or signature.

//             </p>

//           </div>


//         </div>

//       </div>

//     </div>

//   )

// }


// /* ================================================================
//    DATE FORMAT
//    ================================================================ */

// function formatInvoiceDate(value) {

//   if (!value) {

//     return ''

//   }


//   const date =
//     new Date(value)


//   if (
//     Number.isNaN(
//       date.getTime()
//     )
//   ) {

//     return value

//   }


//   const day =
//     String(
//       date.getDate()
//     ).padStart(
//       2,
//       '0'
//     )


//   const month =
//     String(
//       date.getMonth() + 1
//     ).padStart(
//       2,
//       '0'
//     )


//   const year =
//     date.getFullYear()


//   return `${day}/${month}/${year}`

// }


// /* ================================================================
//    INVOICE CSS
//    ================================================================ */

// const invoicePrintStyles = `

// /* ============================================================
//    INVOICE SHEET
//    ============================================================ */

// .invoice-sheet {

//   width: 210mm;

//   min-height: 297mm;

//   background: #ffffff;

//   margin: 0 auto;

//   padding: 15mm 17mm;

//   box-sizing: border-box;

//   color: #111111;

//   font-family:
//     Arial,
//     Helvetica,
//     sans-serif;

// }


// /* ============================================================
//    HEADER
//    ============================================================ */

// .invoice-header {

//   display: flex;

//   justify-content: space-between;

//   align-items: flex-start;

//   min-height: 55mm;

// }


// .invoice-company {

//   width: 53%;

// }


// .invoice-logo {

//   width: 42mm;

//   height: 25mm;

//   object-fit: contain;

//   object-position: left center;

//   display: block;

//   margin-bottom: 3mm;   /* ✅ gap fix: 0.5mm -> 3mm */

// }


// .invoice-company-name {

//   font-size: 16px;

//   font-weight: 700;

//   margin-bottom: 1mm;

// }


// .invoice-company-address {

//   white-space: pre-line;

//   font-size: 10px;

//   line-height: 1.4;

//   padding-top: 2mm;   /* ✅ gap above address */

// }


// /* ============================================================
//    RIGHT HEADER
//    ============================================================ */

// .invoice-right-header {

//   width: 40%;

//   padding-top: 2mm;

// }


// .invoice-tax-box {

//   border: 1px solid #222;

//   padding: 2.5mm 2mm;

//   font-size: 10px;

//   line-height: 1.5;

// }


// .invoice-title {

//   font-size: 14px;

//   font-weight: 700;

//   margin-top: 1mm;

// }


// .invoice-meta-box {

//   border: 1px solid #222;

//   margin-top: 5mm;

//   font-size: 10px;

// }


// .invoice-meta-title {

//   font-weight: 700;

//   padding: 1.8mm 2mm 0.5mm;

// }


// .invoice-number {

//   padding: 0 2mm 1.5mm;

//   font-size: 10px;

//   font-weight: 600;

// }


// .invoice-meta-row {

//   display: grid;

//   grid-template-columns: 1fr 1fr;

//   border-top: 1px solid #222;

//   min-height: 6mm;

// }


// .invoice-meta-row span {

//   padding: 1.1mm 1.5mm;

// }


// .invoice-meta-row span:first-child {

//   border-right: 1px solid #222;

//   text-align: right;

// }


// .invoice-meta-row span:last-child {

//   text-align: left;

// }


// /* ============================================================
//    BUYER
//    ============================================================ */

// .invoice-buyer-box {

//   width: 54%;

//   border: 1px solid #222;

//   margin-bottom: 18mm;

//   font-size: 10px;

// }


// .invoice-buyer-title {

//   font-weight: 700;

//   background: #f1f1f1;

//   border-bottom: 1px solid #222;

//   padding: 1.6mm 2mm;

// }


// .invoice-buyer-content {

//   min-height: 8mm;

//   padding: 1.6mm 2mm;

//   line-height: 1.4;

// }


// .invoice-buyer-name {

//   font-weight: 600;

// }


// /* ============================================================
//    PRODUCT TABLE
//    ============================================================ */

// .invoice-table {

//   width: 100%;

//   table-layout: fixed;

//   border-collapse: collapse;

//   border: 1px solid #222;

//   font-size: 10px;

// }


// .invoice-table .qty-col {

//   width: 13%;

// }


// .invoice-table .unit-col {

//   width: 10%;

// }


// .invoice-table .description-col {

//   width: 43%;

// }


// .invoice-table .price-col {

//   width: 17%;

// }


// .invoice-table .amount-col {

//   width: 17%;

// }


// .invoice-table thead th {

//   padding: 2.8mm 1.8mm;

//   font-weight: 700;

//   text-align: center;

//   border-left: 1px solid #222;

//   border-right: 1px solid #222;

//   border-bottom: 1px solid #222;

//   border-top: 0;

// }


// .invoice-table tbody td:nth-child(2) {
//   text-align: center;
// }

// .invoice-table tbody td {

//   padding: 1.5mm 1.8mm;

//   height: 6mm;

//   vertical-align: top;

//   border-left: 1px solid #222;

//   border-right: 1px solid #222;

//   border-top: 0 !important;

//   border-bottom: 0 !important;

//   background: transparent !important;

// }


// .invoice-table .quantity-cell {

//   text-align: center;

// }


// .invoice-table .description-cell {

//   text-align: left;

// }


// .invoice-table .number-cell {

//   text-align: right;

//   white-space: nowrap;

// }


// .invoice-table tbody .invoice-empty-row td {

//   height: 1mm;

//   border-left: 1px solid #222 !important;

//   border-right: 1px solid #222 !important;

//   border-top: 0 !important;

//   border-bottom: 0 !important;

// }


// .invoice-table th:first-child,
// .invoice-table td:first-child {

//   border-left: 1px solid #222 !important;

// }


// .invoice-table th:last-child,
// .invoice-table td:last-child {

//   border-right: 1px solid #222 !important;

// }


// .invoice-table tbody tr:last-child td {

//   border-bottom: 1px solid #222 !important;

// }


// /* ============================================================
//    TOTAL / DISCOUNT / NET TOTAL
//    ============================================================ */

// .invoice-total-wrapper {

//   width: 34%;

//   margin-top: 5mm;

//   margin-left: auto;

//   display: flex;

//   flex-direction: column;

//   align-items: stretch;

// }


// .invoice-total-row {

//   width: 100%;

//   display: flex;

//   flex-direction: row;

//   margin: 0;

//   padding: 0;

// }


// /* ============================================================
//    LABEL
//    ============================================================ */

// .invoice-total-label {

//   width: 50%;

//   box-sizing: border-box;

//   border-left: 1px solid #222;

//   border-right: 1px solid #222;

//   border-top: 1px solid #222;

//   padding: 2.8mm 3mm;

//   font-size: 10px;

//   font-weight: 700;

//   text-align: center;

//   line-height: 1.2;

// }


// /* ============================================================
//    VALUE
//    ============================================================ */

// .invoice-total-value {

//   width: 50%;

//   box-sizing: border-box;

//   border-right: 1px solid #222;

//   border-top: 1px solid #222;

//   padding: 2.8mm 3mm;

//   font-size: 10px;

//   font-weight: 700;

//   text-align: right;

//   line-height: 1.2;

// }


// /* ============================================================
//    IMPORTANT:
//    NO BOTTOM BORDER ON TOTAL
//    ============================================================ */

// .invoice-total-row:first-child
// .invoice-total-label,

// .invoice-total-row:first-child
// .invoice-total-value {

//   border-bottom: 0;

// }


// /* ============================================================
//    DISCOUNT TOP BORDER
//    This creates the separator between Total and Discount.
//    ============================================================ */

// .invoice-total-row:nth-child(2)
// .invoice-total-label,

// .invoice-total-row:nth-child(2)
// .invoice-total-value {

//   border-top: 1px solid #222;

//   border-bottom: 0;

// }


// /* ============================================================
//    NET TOTAL
//    ============================================================ */

// .invoice-total-row:last-child
// .invoice-total-label,

// .invoice-total-row:last-child
// .invoice-total-value {

//   border-top: 1px solid #222;

//   border-bottom: 1px solid #222;

// }


// /* ============================================================
//    TERMS & CONDITIONS
//    ============================================================ */

// .invoice-terms-box {

//   width: 100%;

//   box-sizing: border-box;

//   border: 1px solid #222;

//   margin-top: 7mm;

//   font-size: 9.5px;

//   page-break-inside: avoid;

// }


// .invoice-terms-title {

//   display: block;

//   width: 100%;

//   box-sizing: border-box;

//   padding: 1.8mm 2.5mm;

//   background: #f1f1f1;

//   border-bottom: 1px solid #222;

//   font-size: 10px;

//   font-weight: 700;

//   text-align: left;

// }


// .invoice-terms-content {

//   width: 100%;

//   box-sizing: border-box;

//   padding: 2.5mm 3mm;

// }


// .invoice-term-item {

//   display: flex;

//   width: 100%;

//   box-sizing: border-box;

//   margin: 0;

//   padding: 0.8mm 0;

//   line-height: 1.00;

// }


// .invoice-term-number {

//   width: 7mm;

//   flex-shrink: 0;

//   font-weight: 600;

// }


// .invoice-term-text {

//   flex: 1;

//   min-width: 0;

//   white-space: normal;

//   overflow-wrap: break-word;

// }


// /* ============================================================
//    FOOTER
//    ============================================================ */

// .invoice-footer-note {

//   margin-top: 4mm;

//   padding-top: 2mm;

//   border-top: 1px solid #ccc;

// }


// .invoice-footer-note p {

//   text-align: center;

//   font-size: 9px;

//   color: #888;

//   margin: 0;

//   font-style: italic;

// }


// /* ============================================================
//    PRINT
//    ============================================================ */

// @media print {

//   @page {

//     size: A4 portrait;

//     margin: 0;

//   }


//   html,
//   body {

//     width: 210mm;

//     min-height: 297mm;

//     margin: 0 !important;

//     padding: 0 !important;

//     background: white !important;

//   }


//   body * {

//     visibility: hidden !important;

//   }


//   .invoice-print-area,
//   .invoice-print-area * {

//     visibility: visible !important;

//   }


//   .invoice-preview-overlay {

//     position: static !important;

//     width: 210mm !important;

//     min-height: 297mm !important;

//     padding: 0 !important;

//     margin: 0 !important;

//     overflow: visible !important;

//     background: white !important;

//   }


//   .invoice-preview-controls {

//     display: none !important;

//   }


//   .invoice-print-area {

//     position: absolute !important;

//     left: 0 !important;

//     top: 0 !important;

//     width: 210mm !important;

//     margin: 0 !important;

//     padding: 0 !important;

//   }


//   .invoice-sheet {

//     width: 210mm !important;

//     min-height: 297mm !important;

//     margin: 0 !important;

//     padding: 15mm 17mm !important;

//     box-sizing: border-box !important;

//     box-shadow: none !important;

//   }


//   .invoice-logo {

//     margin-bottom: 3mm !important;

//   }


//   .invoice-company-address {

//     padding-top: 2mm !important;

//   }


//   /* ==========================================================
//      PRODUCT TABLE PRINT
//      ========================================================== */

//   .invoice-table {

//     width: 100% !important;

//     border-collapse: collapse !important;

//     border: 1px solid #222 !important;

//   }


//   .invoice-table thead th {

//     border-left: 1px solid #222 !important;

//     border-right: 1px solid #222 !important;

//     border-top: 0 !important;

//     border-bottom: 1px solid #222 !important;

//   }


//   .invoice-table tbody td {

//     border-left: 1px solid #222 !important;

//     border-right: 1px solid #222 !important;

//     border-top: 0 !important;

//     border-bottom: 0 !important;

//     background: transparent !important;

//   }


//   .invoice-table tbody .invoice-empty-row td {

//     border-left: 1px solid #222 !important;

//     border-right: 1px solid #222 !important;

//     border-top: 0 !important;

//     border-bottom: 0 !important;

//   }


//   .invoice-table tbody tr:last-child td {

//     border-bottom: 1px solid #222 !important;

//   }


//   /* ==========================================================
//      TOTAL / DISCOUNT / NET TOTAL PRINT
//      ========================================================== */

//   .invoice-total-wrapper {

//     width: 34% !important;

//     margin-top: 5mm !important;

//     margin-left: auto !important;

//     display: flex !important;

//     flex-direction: column !important;

//     align-items: stretch !important;

//   }


//   .invoice-total-row {

//     width: 100% !important;

//     display: flex !important;

//     flex-direction: row !important;

//     margin: 0 !important;

//     padding: 0 !important;

//   }


//   .invoice-total-label {

//     width: 50% !important;

//     box-sizing: border-box !important;

//     border-left: 1px solid #222 !important;

//     border-right: 1px solid #222 !important;

//     border-top: 1px solid #222 !important;

//     padding: 2.8mm 3mm !important;

//     font-size: 10px !important;

//     font-weight: 700 !important;

//     text-align: center !important;

//     line-height: 1.2 !important;

//   }


//   .invoice-total-value {

//     width: 50% !important;

//     box-sizing: border-box !important;

//     border-right: 1px solid #222 !important;

//     border-top: 1px solid #222 !important;

//     padding: 2.8mm 3mm !important;

//     font-size: 10px !important;

//     font-weight: 700 !important;

//     text-align: right !important;

//     line-height: 1.2 !important;

//   }


//   /* ==========================================================
//      TOTAL:
//      NO BOTTOM BORDER
//      ========================================================== */

//   .invoice-total-row:first-child
//   .invoice-total-label,

//   .invoice-total-row:first-child
//   .invoice-total-value {

//     border-bottom: 0 !important;

//   }


//   /* ==========================================================
//      DISCOUNT:
//      TOP SEPARATOR ONLY
//      ========================================================== */

//   .invoice-total-row:nth-child(2)
//   .invoice-total-label,

//   .invoice-total-row:nth-child(2)
//   .invoice-total-value {

//     border-top: 1px solid #222 !important;

//     border-bottom: 0 !important;

//   }


//   /* ==========================================================
//      NET TOTAL:
//      TOP + BOTTOM
//      ========================================================== */

//   .invoice-total-row:last-child
//   .invoice-total-label,

//   .invoice-total-row:last-child
//   .invoice-total-value {

//     border-top: 1px solid #222 !important;

//     border-bottom: 1px solid #222 !important;

//   }


//   /* ==========================================================
//      TERMS & CONDITIONS PRINT
//      ========================================================== */

//   .invoice-terms-box {

//     width: 100% !important;

//     box-sizing: border-box !important;

//     border: 1px solid #222 !important;

//     margin-top: 7mm !important;

//     page-break-inside: avoid !important;

//     break-inside: avoid !important;

//   }


//   .invoice-terms-title {

//     display: block !important;

//     width: 100% !important;

//     box-sizing: border-box !important;

//     padding: 1.8mm 2.5mm !important;

//     background: #f1f1f1 !important;

//     border-bottom: 1px solid #222 !important;

//     font-size: 10px !important;

//     font-weight: 700 !important;

//     text-align: left !important;

//     -webkit-print-color-adjust: exact !important;

//     print-color-adjust: exact !important;

//   }


//   .invoice-terms-content {

//     width: 100% !important;

//     box-sizing: border-box !important;

//     padding: 2.5mm 3mm !important;

//     -webkit-print-color-adjust: exact !important;

//     print-color-adjust: exact !important;

//   }


//   .invoice-term-item {

//     display: flex !important;

//     width: 100% !important;

//     box-sizing: border-box !important;

//     margin: 0 !important;

//     padding: 0.8mm 0 !important;

//     line-height: 1.45 !important;

//   }


//   .invoice-term-number {

//     width: 7mm !important;

//     flex-shrink: 0 !important;

//     font-weight: 600 !important;

//   }


//   .invoice-term-text {

//     flex: 1 !important;

//     min-width: 0 !important;

//     white-space: normal !important;

//     overflow-wrap: break-word !important;

//   }


//   /* ==========================================================
//      FOOTER PRINT
//      ========================================================== */

//   .invoice-footer-note {

//     border-top: 1px solid #ccc !important;

//   }

// }

// `


// /* ================================================================
//    INSERT PRINT CSS
//    ================================================================ */

// if (
//   typeof document !== 'undefined'
// ) {

//   const styleId =
//     'invoice-print-styles'


//   const oldStyle =
//     document.getElementById(
//       styleId
//     )


//   if (!oldStyle) {

//     const style =
//       document.createElement(
//         'style'
//       )


//     style.id =
//       styleId


//     style.innerHTML =
//       invoicePrintStyles


//     document.head.appendChild(
//       style
//     )

//   }

// }







// import { useEffect, useMemo, useState } from 'react'

// import {
//   ref,
//   push,
//   onValue,
//   update,
//   get,
//   set,
//   remove
// } from 'firebase/database'

// import {
//   Plus,
//   Trash2,
//   Receipt,
//   Pencil,
//   Printer,
//   X,
//   Save,
//   Download,
//   Search,
//   ArrowUpDown
// } from 'lucide-react'

// import { db } from '../firebase'
// import { useAuth } from '../context/AuthContext'

// import {
//   formatDate,
//   todayISO,
//   currency
// } from '../utils/helpers'

// import { Modal } from './Customers'
// import Loader from '../components/Loader'


// /* ============================================================
//    GST COMPANY ID
//    ============================================================ */

// const GST_COMPANY_ID = 'CxH9LmB84yWzn7x1lCVQAmPfvi63'


// /* ============================================================
//    FALLBACK COMPANY INFORMATION
//    ============================================================ */

// const FALLBACK_COMPANY_NAME = ''

// const FALLBACK_COMPANY_LOGO = '/PN.png'

// const FALLBACK_COMPANY_ADDRESS = `
// KCHS, Gohar Chamber, Office # 304,
// Shahra-e-Faisal, near Duty Free Shop,
// Karachi, 75600
// `

// const FALLBACK_COMPANY_PHONE = '0341-1293604'

// const FALLBACK_COMPANY_NTN = '-'

// const FALLBACK_COMPANY_STRN = '-'


// /* ============================================================
//    ITEM TYPES
//    ============================================================ */

// const ITEM_TYPE_PRODUCT = 'product'

// const ITEM_TYPE_SERVICE = 'service'

// const ITEM_TYPE_INSTALLATION = 'installation'

// const ITEM_TYPE_OPTIONS = [
//   { value: ITEM_TYPE_PRODUCT, label: 'Product' },
//   { value: ITEM_TYPE_SERVICE, label: 'Service' },
//   { value: ITEM_TYPE_INSTALLATION, label: 'Installation' }
// ]


// /* ============================================================
//    INVOICE NUMBER GENERATOR
//    ============================================================ */

// function getTodayDateString() {

//   const today = new Date()

//   const year =
//     today.getFullYear()

//   const month =
//     String(
//       today.getMonth() + 1
//     ).padStart(2, '0')

//   const day =
//     String(
//       today.getDate()
//     ).padStart(2, '0')

//   return `${year}${month}${day}`

// }


// async function getNextInvoiceNumber(companyId) {

//   try {

//     const dateStr =
//       getTodayDateString()

//     const counterRef =
//       ref(
//         db,
//         `companies/${companyId}/counters/invoice`
//       )

//     const snapshot =
//       await get(counterRef)

//     let lastNumber = 0
//     let lastDate = ''

//     if (snapshot.exists()) {

//       const data =
//         snapshot.val()

//       lastNumber =
//         data.number || 0

//       lastDate =
//         data.date || ''

//     }

//     let nextNumber =
//       lastNumber + 1

//     if (lastDate !== dateStr) {

//       nextNumber = 1

//     }

//     const padded =
//       String(
//         nextNumber
//       ).padStart(4, '0')

//     return `INV-${dateStr}-${padded}`

//   } catch (error) {

//     console.error(
//       'Error getting invoice number:',
//       error
//     )

//     const dateStr =
//       getTodayDateString()

//     const timestamp =
//       Date.now()
//         .toString()
//         .slice(-6)

//     return `INV-${dateStr}-${timestamp}`

//   }

// }


// async function incrementInvoiceCounter(companyId) {

//   try {

//     const dateStr =
//       getTodayDateString()

//     const counterRef =
//       ref(
//         db,
//         `companies/${companyId}/counters/invoice`
//       )

//     const snapshot =
//       await get(counterRef)

//     let lastNumber = 0
//     let lastDate = ''

//     if (snapshot.exists()) {

//       const data =
//         snapshot.val()

//       lastNumber =
//         data.number || 0

//       lastDate =
//         data.date || ''

//     }

//     let newNumber =
//       lastNumber + 1

//     if (lastDate !== dateStr) {

//       newNumber = 1

//     }

//     await set(
//       counterRef,
//       {
//         date: dateStr,
//         number: newNumber
//       }
//     )

//     return {
//       number: newNumber,
//       date: dateStr
//     }

//   } catch (error) {

//     console.error(
//       'Error incrementing counter:',
//       error
//     )

//     return null

//   }

// }


// /* ============================================================
//    EMPTY PRODUCT / SERVICE ITEM
//    ============================================================ */

// const emptyItem = {
//   name: '',
//   qty: 1,
//   price: '',
//   unit: 'PCS',
//   type: ITEM_TYPE_PRODUCT
// }


// /* ============================================================
//    HELPER: GET CUSTOMER DISPLAY NAME
//    ============================================================ */

// function getCustomerDisplayInfo(invoice) {
//   const name = String(invoice.customerName || '').trim()
//   const company = String(invoice.customerCompany || '').trim()

//   return {
//     primary: name || company || '-',
//     secondary: name && company ? company : '',
//     hasName: !!name,
//     hasCompany: !!company
//   }
// }


// /* ============================================================
//    HELPER: Get Item Type Label
//    ============================================================ */

// function getItemTypeLabel(type) {
//   if (type === ITEM_TYPE_SERVICE) return 'Service'
//   if (type === ITEM_TYPE_INSTALLATION) return 'Installation'
//   return 'Product'
// }


// /* ============================================================
//    MAIN INVOICE COMPONENT
//    ============================================================ */

// export default function Invoice() {

//   const { companyId, company } =
//     useAuth()


//   const isGstCompany = companyId === GST_COMPANY_ID


//   /* ============================================================
//      DYNAMIC COMPANY INFO
//      ============================================================ */

//   const companyName =
//     company?.name ||
//     FALLBACK_COMPANY_NAME

//   const companyLogo =
//     company?.logoUrl ||
//     FALLBACK_COMPANY_LOGO

//   const companyAddress =
//     company?.address ||
//     FALLBACK_COMPANY_ADDRESS

//   const companyPhone =
//     company?.phone ||
//     FALLBACK_COMPANY_PHONE

//   const companyEmail =
//     company?.email ||
//     ''

//   const companyNTN =
//     company?.ntn ||
//     FALLBACK_COMPANY_NTN

//   const companySTRN =
//     company?.strn ||
//     FALLBACK_COMPANY_STRN


//   const [customers, setCustomers] =
//     useState(null)

//   const [invoices, setInvoices] =
//     useState(null)

//   const [showForm, setShowForm] =
//     useState(false)

//   const [preview, setPreview] =
//     useState(null)

//   const [editingInvoice, setEditingInvoice] =
//     useState(null)

//   const [customerId, setCustomerId] =
//     useState('')

//   const [customerSearch, setCustomerSearch] =
//     useState('')

//   const [showCustomerDropdown, setShowCustomerDropdown] =
//     useState(false)

//   const [invoiceNumber, setInvoiceNumber] =
//     useState('')


//   const [invoiceDate, setInvoiceDate] =
//     useState(
//       todayISO()
//     )


//   const [poNumber, setPoNumber] =
//     useState('')

//   const [poDate, setPoDate] =
//     useState('')


//   const [items, setItems] =
//     useState([])


//   const [pick, setPick] =
//     useState({
//       ...emptyItem
//     })


//   const [discount, setDiscount] =
//     useState(0)


//   /* ============================================================
//      GST FIELDS
//      ============================================================ */

//   const [gstNumber, setGstNumber] =
//     useState('')

//   const [productGstRate, setProductGstRate] =
//     useState(17)

//   const [serviceGstRate, setServiceGstRate] =
//     useState(15)


//   const [termsAndConditions, setTermsAndConditions] =
//     useState('')


//   const [saving, setSaving] =
//     useState(false)

//   const [error, setError] =
//     useState('')


//   const [deleteConfirm, setDeleteConfirm] =
//     useState(null)

//   const [deleting, setDeleting] =
//     useState(false)


//   const [editingProductIndex, setEditingProductIndex] =
//     useState(null)


//   const [editProduct, setEditProduct] =
//     useState({
//       name: '',
//       qty: 1,
//       price: 0,
//       unit: 'PCS',
//       type: ITEM_TYPE_PRODUCT
//     })


//   const [searchTerm, setSearchTerm] =
//     useState('')


//   const [sortBy, setSortBy] =
//     useState('date-desc')


//   /* ============================================================
//      LOAD CUSTOMERS AND INVOICES
//      ============================================================ */

//   useEffect(() => {

//     if (!companyId) {

//       return

//     }


//     const customersRef =
//       ref(
//         db,
//         `companies/${companyId}/customers`
//       )


//     const unsubscribeCustomers =
//       onValue(
//         customersRef,

//         (snapshot) => {

//           const value =
//             snapshot.val() || {}

//           const list =
//             Object.entries(value)
//               .map(
//                 ([id, customer]) => ({
//                   id,
//                   ...customer
//                 })
//               )

//           setCustomers(list)

//         },

//         (err) => {

//           console.error(
//             'Customers read failed:',
//             err
//           )

//           setCustomers([])

//         }
//       )


//     const invoicesRef =
//       ref(
//         db,
//         `companies/${companyId}/invoices`
//       )


//     const unsubscribeInvoices =
//       onValue(
//         invoicesRef,

//         (snapshot) => {

//           const value =
//             snapshot.val() || {}

//           const list =
//             Object.entries(value)
//               .map(
//                 ([id, invoice]) => ({
//                   id,
//                   ...invoice
//                 })
//               )

//           setInvoices(list)

//         },

//         (err) => {

//           console.error(
//             'Invoices read failed:',
//             err
//           )

//           setInvoices([])

//         }
//       )


//     return () => {

//       unsubscribeCustomers()

//       unsubscribeInvoices()

//     }

//   }, [companyId])


//   /* ============================================================
//      FILTERED CUSTOMERS
//      ============================================================ */

//   const filteredCustomers =
//     useMemo(() => {

//       const search =
//         customerSearch
//           .trim()
//           .toLowerCase()

//       if (!search) {
//         return customers || []
//       }

//       return (customers || []).filter(
//         customer => {
//           const name = String(customer.name || '').toLowerCase()
//           const company = String(customer.company || '').toLowerCase()
//           const phone = String(customer.phone || '').toLowerCase()
//           const address = String(customer.address || '').toLowerCase()

//           return (
//             name.includes(search) ||
//             company.includes(search) ||
//             phone.includes(search) ||
//             address.includes(search)
//           )
//         }
//       )
//     }, [customers, customerSearch])


//   /* ============================================================
//      FILTERED + SORTED INVOICES
//      ============================================================ */

//   const filteredInvoices =
//     useMemo(() => {

//       if (!invoices) return []

//       const search =
//         searchTerm
//           .trim()
//           .toLowerCase()

//       let result = invoices

//       if (search) {
//         result = invoices.filter(
//           invoice => {

//             if (
//               invoice.invoiceNumber &&
//               invoice.invoiceNumber
//                 .toLowerCase()
//                 .includes(search)
//             ) {
//               return true
//             }

//             if (
//               invoice.customerName &&
//               invoice.customerName
//                 .toLowerCase()
//                 .includes(search)
//             ) {
//               return true
//             }

//             if (
//               invoice.customerCompany &&
//               invoice.customerCompany
//                 .toLowerCase()
//                 .includes(search)
//             ) {
//               return true
//             }

//             if (
//               invoice.date &&
//               formatDate(invoice.date)
//                 .toLowerCase()
//                 .includes(search)
//             ) {
//               return true
//             }

//             if (
//               invoice.poNumber &&
//               invoice.poNumber
//                 .toLowerCase()
//                 .includes(search)
//             ) {
//               return true
//             }

//             return false
//           }
//         )
//       }

//       const sorted = [...result]

//       const getAmount = (inv) => {
//         if (inv.netTotal !== undefined && inv.netTotal !== null) {
//           return Number(inv.netTotal) || 0
//         }
//         return Math.max(
//           0,
//           Number(inv.total || 0) - Number(inv.discount || 0)
//         )
//       }

//       switch (sortBy) {
//         case 'date-asc':
//           sorted.sort((a, b) => {
//             const dateA = new Date(a.date || 0).getTime()
//             const dateB = new Date(b.date || 0).getTime()
//             if (dateA !== dateB) return dateA - dateB
//             return (a.createdAt || 0) - (b.createdAt || 0)
//           })
//           break

//         case 'amount-desc':
//           sorted.sort((a, b) => {
//             const amountA = getAmount(a)
//             const amountB = getAmount(b)
//             if (amountB !== amountA) return amountB - amountA
//             return (b.createdAt || 0) - (a.createdAt || 0)
//           })
//           break

//         case 'amount-asc':
//           sorted.sort((a, b) => {
//             const amountA = getAmount(a)
//             const amountB = getAmount(b)
//             if (amountA !== amountB) return amountA - amountB
//             return (b.createdAt || 0) - (a.createdAt || 0)
//           })
//           break

//         case 'date-desc':
//         default:
//           sorted.sort((a, b) => {
//             const dateA = new Date(a.date || 0).getTime()
//             const dateB = new Date(b.date || 0).getTime()
//             if (dateA !== dateB) return dateB - dateA
//             return (b.createdAt || 0) - (a.createdAt || 0)
//           })
//           break
//       }

//       return sorted

//     }, [invoices, searchTerm, sortBy])


//   /* ============================================================
//      SELECT CUSTOMER
//      ============================================================ */

//   function selectCustomer(customer) {
//     setCustomerId(customer.id)
//     setCustomerSearch(
//       `${customer.name || ''}${customer.company ? ` — ${customer.company}` : ''}`
//     )
//     setShowCustomerDropdown(false)
//     setError('')
//   }


//   /* ============================================================
//      TOTAL
//      ============================================================ */

//   const total =
//     useMemo(() => {

//       return items.reduce(
//         (sum, item) => {

//           const qty =
//             Number(item.qty) || 0

//           const price =
//             Number(item.price) || 0

//           return (
//             sum +
//             qty * price
//           )

//         },
//         0
//       )

//     }, [items])


//   /* ============================================================
//      PRODUCT-ONLY TOTAL
//      ============================================================ */

//   const productTotal =
//     useMemo(() => {

//       return items.reduce(
//         (sum, item) => {

//           const type =
//             item.type || ITEM_TYPE_PRODUCT

//           if (type !== ITEM_TYPE_PRODUCT) return sum

//           const qty =
//             Number(item.qty) || 0

//           const price =
//             Number(item.price) || 0

//           return sum + qty * price

//         },
//         0
//       )

//     }, [items])


//   /* ============================================================
//      SERVICE-ONLY TOTAL (Service + Installation)
//      ============================================================ */

//   const serviceTotal =
//     useMemo(() => {

//       return items.reduce(
//         (sum, item) => {

//           const type =
//             item.type || ITEM_TYPE_PRODUCT

//           if (
//             type !== ITEM_TYPE_SERVICE &&
//             type !== ITEM_TYPE_INSTALLATION
//           ) {
//             return sum
//           }

//           const qty =
//             Number(item.qty) || 0

//           const price =
//             Number(item.price) || 0

//           return sum + qty * price

//         },
//         0
//       )

//     }, [items])


//   /* ============================================================
//      DISCOUNT VALUE
//      ============================================================ */

//   const discountValue =
//     useMemo(() => {

//       const value =
//         Number(discount) || 0

//       return Math.min(
//         Math.max(
//           value,
//           0
//         ),
//         total
//       )

//     }, [discount, total])


//   /* ============================================================
//      DISCOUNT PROPORTIONAL SPLIT
//      ============================================================ */

//   const productDiscountShare =
//     useMemo(() => {

//       if (!total) return 0

//       return (productTotal / total) * discountValue

//     }, [productTotal, total, discountValue])


//   const serviceDiscountShare =
//     useMemo(() => {

//       if (!total) return 0

//       return (serviceTotal / total) * discountValue

//     }, [serviceTotal, total, discountValue])


//   /* ============================================================
//      SUBTOTALS
//      ============================================================ */

//   const productSubTotal =
//     useMemo(() => {

//       return Math.max(
//         0,
//         productTotal - productDiscountShare
//       )

//     }, [productTotal, productDiscountShare])


//   const serviceSubTotal =
//     useMemo(() => {

//       return Math.max(
//         0,
//         serviceTotal - serviceDiscountShare
//       )

//     }, [serviceTotal, serviceDiscountShare])


//   const subTotal =
//     useMemo(() => {

//       return Math.max(
//         0,
//         total - discountValue
//       )

//     }, [total, discountValue])


//   /* ============================================================
//      GST AMOUNTS
//      ============================================================ */

//   const productGstAmount =
//     useMemo(() => {

//       if (!isGstCompany) return 0

//       const rate =
//         Math.max(
//           0,
//           Number(productGstRate) || 0
//         )

//       return (
//         productSubTotal *
//         rate /
//         100
//       )

//     }, [
//       isGstCompany,
//       productGstRate,
//       productSubTotal
//     ])


//   const serviceGstAmount =
//     useMemo(() => {

//       if (!isGstCompany) return 0

//       const rate =
//         Math.max(
//           0,
//           Number(serviceGstRate) || 0
//         )

//       return (
//         serviceSubTotal *
//         rate /
//         100
//       )

//     }, [
//       isGstCompany,
//       serviceGstRate,
//       serviceSubTotal
//     ])


//   const gstAmount =
//     useMemo(() => {

//       return (
//         productGstAmount +
//         serviceGstAmount
//       )

//     }, [productGstAmount, serviceGstAmount])


//   /* ============================================================
//      NET TOTAL
//      ============================================================ */

//   const netTotal =
//     useMemo(() => {

//       if (isGstCompany) {

//         return Math.max(
//           0,
//           subTotal + gstAmount
//         )

//       }

//       return subTotal

//     }, [isGstCompany, subTotal, gstAmount])


//   /* ============================================================
//      ADD PRODUCT / SERVICE
//      ============================================================ */

//   function addItem() {

//     if (!pick.name.trim()) {

//       return

//     }


//     const newItem = {

//       name:
//         pick.name.trim(),

//       qty:
//         Math.max(
//           1,
//           Number(pick.qty) || 1
//         ),

//       price:
//         Math.max(
//           0,
//           Number(pick.price) || 0
//         ),

//       unit:
//         pick.unit || 'PCS',

//       type:
//         isGstCompany
//           ? (pick.type || ITEM_TYPE_PRODUCT)
//           : ITEM_TYPE_PRODUCT

//     }


//     setItems(
//       previous => [
//         ...previous,
//         newItem
//       ]
//     )


//     setPick({
//       ...emptyItem
//     })

//   }


//   /* ============================================================
//      REMOVE PRODUCT
//      ============================================================ */

//   function removeItem(index) {

//     setItems(
//       previous =>
//         previous.filter(
//           (_, i) =>
//             i !== index
//         )
//     )

//   }


//   /* ============================================================
//      EDIT PRODUCT - OPEN
//      ============================================================ */

//   function openEditProduct(index) {

//     const item =
//       items[index]

//     if (!item) {

//       return

//     }

//     setEditingProductIndex(
//       index
//     )

//     setEditProduct({

//       name:
//         item.name,

//       qty:
//         item.qty,

//       price:
//         item.price,

//       unit:
//         item.unit || 'PCS',

//       type:
//         item.type || ITEM_TYPE_PRODUCT

//     })

//   }


//   /* ============================================================
//      EDIT PRODUCT - SAVE
//      ============================================================ */

//   function saveEditProduct() {

//     if (
//       !editProduct.name.trim()
//     ) {

//       return

//     }


//     if (
//       editingProductIndex === null
//     ) {

//       return

//     }


//     const updatedItems =
//       [...items]


//     updatedItems[
//       editingProductIndex
//     ] = {

//       name:
//         editProduct.name.trim(),

//       qty:
//         Math.max(
//           1,
//           Number(
//             editProduct.qty
//           ) || 1
//         ),

//       price:
//         Math.max(
//           0,
//           Number(
//             editProduct.price
//           ) || 0
//         ),

//       unit:
//         editProduct.unit || 'PCS',

//       type:
//         isGstCompany
//           ? (editProduct.type || ITEM_TYPE_PRODUCT)
//           : ITEM_TYPE_PRODUCT

//     }


//     setItems(
//       updatedItems
//     )


//     setEditingProductIndex(
//       null
//     )


//     setEditProduct({

//       name: '',
//       qty: 1,
//       price: 0,
//       unit: 'PCS',
//       type: ITEM_TYPE_PRODUCT

//     })

//   }


//   /* ============================================================
//      EDIT PRODUCT - CLOSE
//      ============================================================ */

//   function closeEditProduct() {

//     setEditingProductIndex(
//       null
//     )

//     setEditProduct({

//       name: '',
//       qty: 1,
//       price: 0,
//       unit: 'PCS',
//       type: ITEM_TYPE_PRODUCT

//     })

//   }


//   /* ============================================================
//      RESET FORM
//      ============================================================ */

//   function resetForm() {

//     setCustomerId('')
//     setCustomerSearch('')
//     setShowCustomerDropdown(false)

//     setInvoiceNumber('')

//     setInvoiceDate(
//       todayISO()
//     )

//     setPoNumber('')

//     setPoDate('')

//     setItems([])

//     setPick({
//       ...emptyItem
//     })

//     setDiscount(0)

//     setGstNumber('')
//     setProductGstRate(17)
//     setServiceGstRate(15)

//     setTermsAndConditions('')

//     setEditingInvoice(
//       null
//     )

//     setError('')

//     setEditingProductIndex(
//       null
//     )

//     setEditProduct({

//       name: '',
//       qty: 1,
//       price: 0,
//       unit: 'PCS',
//       type: ITEM_TYPE_PRODUCT

//     })

//   }


//   /* ============================================================
//      DELETE INVOICE
//      ============================================================ */

//   async function handleDeleteInvoice() {

//     if (
//       !companyId ||
//       !deleteConfirm
//     ) {

//       return

//     }


//     setDeleting(true)


//     try {

//       const invoiceRef =
//         ref(
//           db,
//           `companies/${companyId}/invoices/${deleteConfirm.id}`
//         )


//       await remove(
//         invoiceRef
//       )


//       setDeleteConfirm(
//         null
//       )

//     } catch (err) {

//       console.error(
//         'Invoice delete error:',
//         err
//       )

//       alert(
//         'Invoice delete nahi ho saka. Dobara koshish karein.'
//       )

//     } finally {

//       setDeleting(false)

//     }

//   }


//   /* ============================================================
//      OPEN NEW INVOICE
//      ============================================================ */

//   const openNewInvoice =
//     async () => {

//       resetForm()

//       setInvoiceDate(
//         todayISO()
//       )

//       setDiscount(0)

//       setTermsAndConditions('')


//       if (companyId) {

//         const number =
//           await getNextInvoiceNumber(
//             companyId
//           )

//         setInvoiceNumber(
//           number
//         )

//       }


//       setShowForm(
//         true
//       )

//     }


//   /* ============================================================
//      OPEN EDIT INVOICE
//      ============================================================ */

//   function openEditInvoice(invoice) {

//     setEditingInvoice(
//       invoice
//     )


//     setCustomerId(
//       invoice.customerId || ''
//     )

//     const editCustomer =
//       customers?.find(
//         customer =>
//           customer.id === invoice.customerId
//       )

//     setCustomerSearch(
//       editCustomer
//         ? `${editCustomer.name || ''}${editCustomer.company ? ` — ${editCustomer.company}` : ''}`
//         : invoice.customerName || invoice.customerCompany || ''
//     )

//     setShowCustomerDropdown(false)


//     setInvoiceNumber(
//       invoice.invoiceNumber || ''
//     )


//     setInvoiceDate(
//       invoice.date ||
//       todayISO()
//     )


//     setPoNumber(
//       invoice.poNumber || ''
//     )


//     setPoDate(
//       invoice.poDate || ''
//     )


//     setItems(
//       Array.isArray(
//         invoice.items
//       )
//         ? invoice.items.map(
//             item => ({

//               name:
//                 item.name || '',

//               qty:
//                 Number(
//                   item.qty
//                 ) || 1,

//               price:
//                 Number(
//                   item.price
//                 ) || 0,

//               unit:
//                 item.unit || 'PCS',

//               type:
//                 item.type || ITEM_TYPE_PRODUCT

//             })
//           )
//         : []
//     )


//     setDiscount(
//       Math.max(
//         0,
//         Number(
//           invoice.discount
//         ) || 0
//       )
//     )


//     setGstNumber(
//       invoice.gstNumber || ''
//     )


//     setProductGstRate(
//       invoice.productGstRate !== undefined
//         ? invoice.productGstRate
//         : (invoice.gstRate !== undefined
//             ? invoice.gstRate
//             : 17)
//     )


//     setServiceGstRate(
//       invoice.serviceGstRate !== undefined
//         ? invoice.serviceGstRate
//         : 15
//     )


//     setTermsAndConditions(
//       invoice.termsAndConditions || ''
//     )


//     setPick({
//       ...emptyItem
//     })


//     setError('')


//     setEditingProductIndex(
//       null
//     )


//     setShowForm(
//       true
//     )

//   }


//   /* ============================================================
//      CLOSE FORM
//      ============================================================ */

//   function closeForm() {

//     if (saving) {

//       return

//     }

//     setShowForm(false)

//     resetForm()

//   }


//   /* ============================================================
//      SAVE / UPDATE INVOICE
//      ============================================================ */

//   async function handleSubmit(e) {

//     e.preventDefault()

//     setError('')


//     if (!companyId) {

//       setError(
//         'Company ID nahi mila.'
//       )

//       return

//     }


//     if (!customerId) {

//       setError(
//         'Customer select karein.'
//       )

//       return

//     }


//     if (!invoiceDate) {

//       setError(
//         'Invoice date select karein.'
//       )

//       return

//     }


//     if (items.length === 0) {

//       setError(
//         'Kam az kam aik product add karein.'
//       )

//       return

//     }


//     const customer =
//       customers?.find(
//         c =>
//           c.id === customerId
//       )


//     if (!customer) {

//       setError(
//         'Customer nahi mila.'
//       )

//       return

//     }


//     const finalDiscount =
//       Math.min(
//         Math.max(
//           Number(discount) || 0,
//           0
//         ),
//         total
//       )


//     const finalSubTotal =
//       Math.max(
//         0,
//         total - finalDiscount
//       )


//     const finalProductDiscountShare =
//       total > 0
//         ? (productTotal / total) * finalDiscount
//         : 0

//     const finalServiceDiscountShare =
//       total > 0
//         ? (serviceTotal / total) * finalDiscount
//         : 0

//     const finalProductSubTotal =
//       Math.max(
//         0,
//         productTotal - finalProductDiscountShare
//       )

//     const finalServiceSubTotal =
//       Math.max(
//         0,
//         serviceTotal - finalServiceDiscountShare
//       )

//     const finalProductGstRate =
//       isGstCompany
//         ? Math.max(0, Number(productGstRate) || 0)
//         : 0

//     const finalServiceGstRate =
//       isGstCompany
//         ? Math.max(0, Number(serviceGstRate) || 0)
//         : 0

//     const finalProductGstAmount =
//       isGstCompany
//         ? (finalProductSubTotal * finalProductGstRate / 100)
//         : 0

//     const finalServiceGstAmount =
//       isGstCompany
//         ? (finalServiceSubTotal * finalServiceGstRate / 100)
//         : 0

//     const finalGstAmount =
//       finalProductGstAmount +
//       finalServiceGstAmount

//     const finalNetTotal =
//       isGstCompany
//         ? Math.max(0, finalSubTotal + finalGstAmount)
//         : finalSubTotal


//     setSaving(true)


//     try {

//       let finalInvoiceNumber =
//         invoiceNumber


//       if (!editingInvoice) {

//         await incrementInvoiceCounter(
//           companyId
//         )


//         if (
//           !finalInvoiceNumber ||
//           finalInvoiceNumber.trim() === ''
//         ) {

//           const dateStr =
//             getTodayDateString()

//           const timestamp =
//             Date.now()
//               .toString()
//               .slice(-6)


//           finalInvoiceNumber =
//             `INV-${dateStr}-${timestamp}`


//           setInvoiceNumber(
//             finalInvoiceNumber
//           )

//         }

//       }


//       const commonInvoicePayload = {

//         invoiceNumber:
//           finalInvoiceNumber,

//         date:
//           invoiceDate,

//         poNumber:
//           poNumber || '',

//         poDate:
//           poDate || '',

//         customerId:
//           customerId,

//         customerName:
//           customer.name || '',

//         customerCompany:
//           customer.company || '',

//         customerPhone:
//           customer.phone || '',

//         customerAddress:
//           customer.address || '',

//         companyName,
//         companyLogo,
//         companyAddress,
//         companyPhone,
//         companyEmail,
//         companyNTN,
//         companySTRN,

//         isGstInvoice:
//           isGstCompany,

//         gstNumber:
//           isGstCompany
//             ? gstNumber.trim()
//             : '',

//         productGstRate:
//           finalProductGstRate,

//         serviceGstRate:
//           finalServiceGstRate,

//         gstRate:
//           finalProductGstRate,

//         productSubTotal:
//           finalProductSubTotal,

//         serviceSubTotal:
//           finalServiceSubTotal,

//         productGstAmount:
//           finalProductGstAmount,

//         serviceGstAmount:
//           finalServiceGstAmount,

//         gstAmount:
//           finalGstAmount,

//         subTotal:
//           finalSubTotal,

//         items:
//           items,

//         total:
//           total,

//         discount:
//           finalDiscount,

//         netTotal:
//           finalNetTotal,

//         termsAndConditions:
//           termsAndConditions.trim()

//       }


//       if (editingInvoice) {

//         const invoiceRef =
//           ref(
//             db,
//             `companies/${companyId}/invoices/${editingInvoice.id}`
//           )


//         const updatedInvoice = {
//           ...commonInvoicePayload,
//           updatedAt: Date.now()
//         }


//         await update(
//           invoiceRef,
//           updatedInvoice
//         )


//         setShowForm(false)
//         resetForm()


//         setPreview({

//           id:
//             editingInvoice.id,

//           ...commonInvoicePayload,

//           customer: {

//             name:
//               commonInvoicePayload.customerName,

//             company:
//               commonInvoicePayload.customerCompany,

//             phone:
//               commonInvoicePayload.customerPhone,

//             address:
//               commonInvoicePayload.customerAddress

//           }

//         })


//         return

//       }


//       const invoiceData = {
//         ...commonInvoicePayload,
//         createdAt: Date.now()
//       }


//       const invoicesRef =
//         ref(
//           db,
//           `companies/${companyId}/invoices`
//         )


//       const newInvoice =
//         await push(
//           invoicesRef,
//           invoiceData
//         )


//       setPreview({

//         id:
//           newInvoice.key,

//         ...invoiceData,

//         customer: {

//           name:
//             invoiceData.customerName,

//           company:
//             invoiceData.customerCompany,

//           phone:
//             invoiceData.customerPhone,

//           address:
//             invoiceData.customerAddress

//         }

//       })


//       setShowForm(false)
//       resetForm()


//     } catch (err) {

//       console.error(
//         'Invoice save error:',
//         err
//       )

//       setError(
//         err?.message ||
//         'Invoice save nahi ho saka. Dobara koshish karein.'
//       )

//     } finally {

//       setSaving(false)

//     }

//   }


//   /* ============================================================
//      DOWNLOAD / PREVIEW PDF
//      ============================================================ */

//   function handleDownloadPdf(invoice) {

//     const previewInvoice =
//       convertInvoiceToPreview(
//         invoice
//       )

//     setPreview(
//       previewInvoice
//     )

//   }


//   /* ============================================================
//      PAGE
//      ============================================================ */

//   return (

//     <>

//       <div>

//         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">

//           <div>

//             <h1 className="font-display text-2xl font-semibold text-ink">
//               Invoice
//               {isGstCompany && (
//                 <span className="ml-2 text-xs font-medium text-teal-dark bg-teal-light px-2.5 py-1 rounded-full align-middle">
//                   GST
//                 </span>
//               )}
//             </h1>

//             <p className="text-sm text-slateink mt-0.5">
//               {isGstCompany
//                 ? 'Create a GST invoice — separate GST for products and services.'
//                 : 'Enter the product name, quantity, and price to create an invoice.'}
//             </p>

//           </div>


//           <button
//             onClick={openNewInvoice}
//             className="flex items-center gap-2 rounded-lg bg-ink text-white text-sm font-medium px-4 py-2.5 hover:bg-inkSoft transition-colors self-start"
//           >

//             <Plus size={16} />

//             New Invoice

//           </button>

//         </div>


//         <div className="mb-6 flex flex-col sm:flex-row gap-4">

//           <div className="flex-1">

//             <div className="relative max-w-md">

//               <input
//                 type="text"
//                 value={searchTerm}
//                 onChange={(e) =>
//                   setSearchTerm(e.target.value)
//                 }
//                 className="input w-full pl-9 pr-4"
//                 placeholder="Search by invoice #, customer, company, date..."
//               />

//               {searchTerm && (
//                 <button
//                   type="button"
//                   onClick={() => setSearchTerm('')}
//                   className="absolute right-3 top-1/2 -translate-y-1/2 text-slateink hover:text-ink"
//                 >
//                   <X size={14} />
//                 </button>
//               )}

//             </div>

//             <p className="text-xs text-slateink mt-1">
//               Search by invoice number, customer name, company name, or date
//             </p>

//           </div>

//           <div className="flex items-start gap-2">

//             <div className="flex items-center gap-2">

//               <ArrowUpDown size={14} className="text-slateink mt-1" />

//               <select
//                 value={sortBy}
//                 onChange={(e) => setSortBy(e.target.value)}
//                 className="input text-sm py-2 pr-8 min-w-[190px]"
//               >
//                 <option value="date-desc">Date (Newest First)</option>
//                 <option value="date-asc">Date (Oldest First)</option>
//                 <option value="amount-desc">Amount (High to Low)</option>
//                 <option value="amount-asc">Amount (Low to High)</option>
//               </select>

//             </div>

//           </div>

//         </div>


//         {invoices === null ? (

//           <Loader />

//         ) : filteredInvoices.length === 0 ? (

//           <div className="border border-dashed border-line rounded-2xl py-16 flex flex-col items-center justify-center text-center">

//             <Receipt
//               className="text-slateink mb-3"
//               size={28}
//             />

//             <p className="font-medium text-ink">
//               {searchTerm
//                 ? 'No matching invoices found'
//                 : 'No Invoice has been created yet.'}
//             </p>

//             {searchTerm && (
//               <p className="text-sm text-slateink mt-1">
//                 Try searching with different keywords
//               </p>
//             )}

//           </div>

//         ) : (

//           <div className="bg-surface rounded-2xl border border-line shadow-card overflow-hidden">

//             <div className="overflow-x-auto">

//               <table className="w-full text-sm">

//                 <thead>

//                   <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-slateink">

//                     <th className="px-4 py-3 font-medium">
//                       Invoice #
//                     </th>

//                     <th className="px-4 py-3 font-medium">
//                       Customer
//                     </th>

//                     <th className="px-4 py-3 font-medium">
//                       Total
//                     </th>

//                     <th className="px-4 py-3 font-medium">
//                       Date
//                     </th>

//                     <th className="px-4 py-3 font-medium text-right">
//                       Action
//                     </th>

//                   </tr>

//                 </thead>


//                 <tbody>

//                   {filteredInvoices.map(
//                     invoice => {

//                       const display = getCustomerDisplayInfo(invoice)

//                       return (

//                         <tr
//                           key={invoice.id}
//                           className="border-b border-line last:border-0 hover:bg-paper/60"
//                         >

//                           <td className="px-4 py-3 font-mono text-xs">
//                             {invoice.invoiceNumber}
//                             {invoice.isGstInvoice && (
//                               <span className="ml-2 text-[10px] font-medium text-teal-dark bg-teal-light px-1.5 py-0.5 rounded">
//                                 GST
//                               </span>
//                             )}
//                           </td>


//                           <td className="px-4 py-3">

//                             <p className="font-medium text-ink">
//                               {display.primary}
//                             </p>

//                             {display.secondary && (
//                               <p className="text-xs text-slateink">
//                                 {display.secondary}
//                               </p>
//                             )}

//                           </td>


//                           <td className="px-4 py-3 font-medium text-ink">

//                             Rs{' '}

//                             {currency(
//                               invoice.netTotal !== undefined
//                                 ? invoice.netTotal
//                                 : Math.max(
//                                     0,
//                                     Number(invoice.total || 0) -
//                                     Number(invoice.discount || 0)
//                                   )
//                             )}

//                           </td>


//                           <td className="px-4 py-3 text-xs font-mono text-slateink">

//                             {formatDate(
//                               invoice.date
//                             )}

//                           </td>


//                           <td className="px-4 py-3">

//                             <div className="flex items-center justify-end gap-2 flex-wrap">

//                               <button
//                                 onClick={() =>
//                                   setPreview(
//                                     convertInvoiceToPreview(
//                                       invoice
//                                     )
//                                   )
//                                 }
//                                 className="text-teal-dark text-xs font-medium hover:underline"
//                               >

//                                 View

//                               </button>


//                               <button
//                                 onClick={() =>
//                                   openEditInvoice(
//                                     invoice
//                                   )
//                                 }
//                                 className="inline-flex items-center gap-1.5 text-xs font-medium text-ink hover:text-teal-dark"
//                               >

//                                 <Pencil size={13} />

//                                 Edit

//                               </button>


//                               <button
//                                 onClick={() =>
//                                   handleDownloadPdf(
//                                     invoice
//                                   )
//                                 }
//                                 className="inline-flex items-center gap-1.5 text-xs font-medium text-red-600 hover:text-red-800"
//                               >

//                                 <Download size={13} />

//                                 PDF

//                               </button>


//                               <button
//                                 onClick={() =>
//                                   setDeleteConfirm(
//                                     invoice
//                                   )
//                                 }
//                                 className="inline-flex items-center gap-1.5 text-xs font-medium text-coral hover:text-red-700"
//                               >

//                                 <Trash2 size={13} />

//                                 Delete

//                               </button>

//                             </div>

//                           </td>

//                         </tr>

//                       )
//                     }
//                   )}

//                 </tbody>

//               </table>

//             </div>

//           </div>

//         )}


//         {showForm && (

//           <Modal
//             title={
//               editingInvoice
//                 ? `Edit Invoice ${editingInvoice.invoiceNumber}`
//                 : (isGstCompany ? 'New GST Invoice' : 'New Invoice')
//             }
//             onClose={closeForm}
//             wide
//           >

//             <form
//               onSubmit={handleSubmit}
//               className="space-y-5"
//             >

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

//                 <label className="block">

//                   <span className="text-xs font-medium text-slateink">
//                     Invoice Number *
//                   </span>

//                   <input
//                     type="text"
//                     value={invoiceNumber}
//                     onChange={(e) =>
//                       setInvoiceNumber(
//                         e.target.value
//                       )
//                     }
//                     className="input mt-1"
//                     placeholder="INV-YYYYMMDD-0001"
//                     required
//                   />

//                   <small className="text-xs text-slateink mt-1 block">
//                     Format: INV-YYYYMMDD-0001 (Auto-generated)
//                   </small>

//                 </label>


//                 <label className="block">

//                   <span className="text-xs font-medium text-slateink">
//                     Invoice Date *
//                   </span>

//                   <input
//                     type="date"
//                     value={invoiceDate}
//                     onChange={(e) =>
//                       setInvoiceDate(
//                         e.target.value
//                       )
//                     }
//                     className="input mt-1"
//                     required
//                   />

//                 </label>

//               </div>


//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

//                 <label className="block">

//                   <span className="text-xs font-medium text-slateink">
//                     Customer *
//                   </span>

//                   <div className="relative mt-1">

//                     <input
//                       type="text"
//                       value={customerSearch}
//                       onChange={(e) => {
//                         const value = e.target.value
//                         setCustomerSearch(value)

//                         if (customerId) {
//                           setCustomerId('')
//                         }

//                         setShowCustomerDropdown(true)
//                       }}
//                       onFocus={() =>
//                         setShowCustomerDropdown(true)
//                       }
//                       className="input w-full pr-10"
//                       placeholder="Search customer by name, company, phone..."
//                       autoComplete="off"
//                       required={!customerId}
//                     />

//                     {customerSearch && (
//                       <button
//                         type="button"
//                         onClick={() => {
//                           setCustomerId('')
//                           setCustomerSearch('')
//                           setShowCustomerDropdown(true)
//                         }}
//                         className="absolute right-3 top-1/2 -translate-y-1/2 text-slateink hover:text-ink"
//                         aria-label="Clear customer"
//                       >
//                         <X size={16} />
//                       </button>
//                     )}

//                     {showCustomerDropdown && (
//                       <div className="absolute z-[100] left-0 right-0 mt-1 max-h-64 overflow-y-auto rounded-lg border border-line bg-white shadow-lg">
//                         {filteredCustomers.length === 0 ? (
//                           <div className="px-3 py-3 text-sm text-slateink">
//                             No customer found.
//                           </div>
//                         ) : (
//                           filteredCustomers.map(customer => {

//                             const name = String(customer.name || '').trim()
//                             const company = String(customer.company || '').trim()

//                             return (

//                               <button
//                                 key={customer.id}
//                                 type="button"
//                                 onClick={() => selectCustomer(customer)}
//                                 className={`w-full text-left px-3 py-2.5 hover:bg-paper transition-colors border-b border-line last:border-b-0 ${customer.id === customerId ? 'bg-paper' : ''}`}
//                               >

//                                 {name ? (
//                                   <>
//                                     <p className="text-sm font-medium text-ink">
//                                       {name}
//                                     </p>
//                                     {company && (
//                                       <p className="text-xs text-slateink mt-0.5">
//                                         {company}
//                                       </p>
//                                     )}
//                                   </>
//                                 ) : (
//                                   company && (
//                                     <p className="text-sm font-medium text-ink">
//                                       {company}
//                                     </p>
//                                   )
//                                 )}

//                                 {customer.phone && (
//                                   <p className="text-xs text-slateink mt-0.5">
//                                     {customer.phone}
//                                   </p>
//                                 )}

//                               </button>

//                             )
//                           })
//                         )}
//                       </div>
//                     )}

//                   </div>

//                 </label>

//               </div>


//               {isGstCompany && (

//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border border-teal/30 bg-teal-light/20 rounded-xl p-4">

//                   <div className="md:col-span-3">

//                     <p className="text-xs font-semibold text-teal-dark mb-1">
//                       GST Details (Only for this company)
//                     </p>

//                     <p className="text-xs text-slateink">
//                       Products and Services have separate GST rates.
//                     </p>

//                   </div>


//                   <label className="block">

//                     <span className="text-xs font-medium text-slateink">
//                       GST / NTN Number
//                     </span>

//                     <input
//                       type="text"
//                       value={gstNumber}
//                       onChange={(e) =>
//                         setGstNumber(e.target.value)
//                       }
//                       className="input mt-1"
//                       placeholder="e.g. 1234567-8"
//                     />

//                   </label>


//                   <label className="block">

//                     <span className="text-xs font-medium text-slateink">
//                       GST on Products (%)
//                     </span>

//                     <input
//                       type="number"
//                       min={0}
//                       step="0.01"
//                       value={productGstRate}
//                       onChange={(e) =>
//                         setProductGstRate(e.target.value)
//                       }
//                       className="input mt-1"
//                       placeholder="17"
//                     />

//                   </label>


//                   <label className="block">

//                     <span className="text-xs font-medium text-slateink">
//                       GST on Services (%)
//                     </span>

//                     <input
//                       type="number"
//                       min={0}
//                       step="0.01"
//                       value={serviceGstRate}
//                       onChange={(e) =>
//                         setServiceGstRate(e.target.value)
//                       }
//                       className="input mt-1"
//                       placeholder="15"
//                     />

//                   </label>

//                 </div>

//               )}


//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

//                 <label className="block">

//                   <span className="text-xs font-medium text-slateink">
//                     P/Order No.
//                   </span>

//                   <input
//                     type="text"
//                     value={poNumber}
//                     onChange={(e) =>
//                       setPoNumber(
//                         e.target.value
//                       )
//                     }
//                     className="input mt-1"
//                     placeholder="P/Order No."
//                   />

//                 </label>


//                 <label className="block">

//                   <span className="text-xs font-medium text-slateink">
//                     P/Order Date
//                   </span>

//                   <input
//                     type="date"
//                     value={poDate}
//                     onChange={(e) =>
//                       setPoDate(
//                         e.target.value
//                       )
//                     }
//                     className="input mt-1"
//                   />

//                 </label>

//               </div>


//               <div className="border border-line rounded-xl p-4">

//                 <p className="text-xs font-medium text-slateink mb-3">
//                   Add Products / Services
//                 </p>


//                 <div className="flex flex-col lg:flex-row gap-2">

//                   {isGstCompany && (
//                     <select
//                       value={pick.type}
//                       onChange={(e) =>
//                         setPick({
//                           ...pick,
//                           type: e.target.value
//                         })
//                       }
//                       className="input lg:w-32 shrink-0"
//                     >
//                       {ITEM_TYPE_OPTIONS.map((opt) => (
//                         <option key={opt.value} value={opt.value}>
//                           {opt.label}
//                         </option>
//                       ))}
//                     </select>
//                   )}

//                   <input
//                     value={pick.name}
//                     onChange={(e) =>
//                       setPick({
//                         ...pick,
//                         name:
//                           e.target.value
//                       })
//                     }
//                     className="input flex-1 min-w-0"
//                     placeholder="Item name / model / service"
//                   />

//                   <input
//                     type="text"
//                     value={pick.unit}
//                     onChange={(e) =>
//                       setPick({
//                         ...pick,
//                         unit:
//                           e.target.value
//                       })
//                     }
//                     className="input lg:w-16 shrink-0"
//                     placeholder="Unit"
//                   />

//                   <input
//                     type="number"
//                     min={1}
//                     value={pick.qty}
//                     onChange={(e) =>
//                       setPick({
//                         ...pick,
//                         qty:
//                           e.target.value
//                       })
//                     }
//                     className="input lg:w-16 shrink-0"
//                     placeholder="Qty"
//                   />


//                   <input
//                     type="number"
//                     min={0}
//                     step="0.01"
//                     value={pick.price}
//                     onChange={(e) =>
//                       setPick({
//                         ...pick,
//                         price:
//                           e.target.value
//                       })
//                     }
//                     className="input lg:w-28 shrink-0"
//                     placeholder="Unit Price"
//                   />


//                   <button
//                     type="button"
//                     onClick={addItem}
//                     disabled={!pick.name.trim()}
//                     className="rounded-lg bg-teal text-white text-sm font-medium px-4 py-2.5 hover:bg-teal-dark disabled:opacity-50 shrink-0"
//                   >

//                     Add

//                   </button>

//                 </div>


//                 {items.length > 0 && (

//                   <div className="mt-4 space-y-2">

//                     {items.map(
//                       (
//                         item,
//                         index
//                       ) => {

//                         const itemType =
//                           item.type || ITEM_TYPE_PRODUCT

//                         const typeLabel =
//                           getItemTypeLabel(itemType)

//                         const typeBadgeClass =
//                           itemType === ITEM_TYPE_PRODUCT
//                             ? 'bg-blue-100 text-blue-700'
//                             : itemType === ITEM_TYPE_SERVICE
//                               ? 'bg-purple-100 text-purple-700'
//                               : 'bg-amber-light text-amber'

//                         return (

//                           <div
//                             key={index}
//                             className="flex items-center justify-between bg-paper rounded-lg px-3 py-2 text-sm"
//                           >

//                             <div>

//                               {isGstCompany && (
//                                 <span
//                                   className={`text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded mr-2 ${typeBadgeClass}`}
//                                 >
//                                   {typeLabel}
//                                 </span>
//                               )}

//                               <span className="font-medium text-ink">
//                                 {item.name}
//                               </span>

//                               <span className="text-xs text-slateink ml-2">
//                                 {item.unit || 'PCS'} x{item.qty}
//                               </span>

//                               <span className="text-xs text-slateink ml-2">
//                                 @ Rs{' '}
//                                 {currency(
//                                   item.price
//                                 )}
//                               </span>

//                             </div>


//                             <div className="flex items-center gap-2">

//                               <button
//                                 type="button"
//                                 onClick={() =>
//                                   openEditProduct(
//                                     index
//                                   )
//                                 }
//                                 className="text-blue-600 hover:text-blue-800"
//                               >

//                                 <Pencil size={15} />

//                               </button>


//                               <button
//                                 type="button"
//                                 onClick={() =>
//                                   removeItem(
//                                     index
//                                   )
//                                 }
//                                 className="text-coral hover:text-red-700"
//                               >

//                                 <Trash2 size={15} />

//                               </button>

//                             </div>

//                           </div>

//                         )

//                       }
//                     )}


//                     <div className="flex justify-end pt-3">

//                       <div className="w-full sm:w-72">

//                         <div className="flex justify-between py-1">

//                           <span className="text-xs text-slateink">
//                             Total
//                           </span>

//                           <span className="text-sm font-semibold text-ink">
//                             Rs {currency(total)}
//                           </span>

//                         </div>


//                         <div className="flex justify-between py-1">

//                           <span className="text-xs text-slateink">
//                             Discount
//                           </span>

//                           <span className="text-sm font-semibold text-red-600">
//                             Rs {currency(discountValue)}
//                           </span>

//                         </div>


//                         {isGstCompany && productTotal > 0 && (

//                           <div className="flex justify-between py-1">

//                             <span className="text-xs text-slateink">
//                               GST on Products ({productGstRate}%)
//                             </span>

//                             <span className="text-sm font-semibold text-ink">
//                               Rs {currency(productGstAmount)}
//                             </span>

//                           </div>

//                         )}


//                         {isGstCompany && serviceTotal > 0 && (

//                           <div className="flex justify-between py-1">

//                             <span className="text-xs text-slateink">
//                               GST on Services ({serviceGstRate}%)
//                             </span>

//                             <span className="text-sm font-semibold text-ink">
//                               Rs {currency(serviceGstAmount)}
//                             </span>

//                           </div>

//                         )}


//                         <div className="border-t border-line mt-1 pt-2 flex justify-between">

//                           <span className="text-sm font-bold text-ink">
//                             Net Total
//                           </span>

//                           <span className="text-lg font-bold text-ink">
//                             Rs {currency(netTotal)}
//                           </span>

//                         </div>

//                       </div>

//                     </div>

//                   </div>

//                 )}

//               </div>


//               <div className="border border-line rounded-xl p-4">

//                 <label className="block max-w-sm ml-auto">

//                   <span className="text-xs font-medium text-slateink">
//                     Discount
//                   </span>

//                   <div className="relative mt-1">

//                     <input
//                       type="number"
//                       min={0}
//                       max={total}
//                       step="0.01"
//                       value={discount}
//                       onChange={(e) =>
//                         setDiscount(
//                           e.target.value
//                         )
//                       }
//                       className="input pl-9 w-full"
//                       placeholder="0"
//                     />

//                   </div>

//                   <small className="text-xs text-slateink mt-1 block">
//                     Discount minus from total price. Split automatically between products & services.
//                   </small>

//                 </label>

//               </div>


//               <div className="border border-line rounded-xl p-4">

//                 <label className="block">

//                   <span className="text-xs font-medium text-slateink">
//                     Terms & Conditions
//                   </span>

//                   <textarea
//                     value={termsAndConditions}
//                     onChange={(e) =>
//                       setTermsAndConditions(
//                         e.target.value
//                       )
//                     }
//                     rows={5}
//                     className="input mt-1 w-full resize-y"
//                     placeholder={`Example:
// 1. Payment must be made within 30 days.
// 2. Goods once sold cannot be returned.
// 3. Prices are exclusive of applicable taxes.`}
//                   />

//                   <small className="text-xs text-slateink mt-1 block">
//                     Enter each term on a new line.
//                   </small>

//                 </label>

//               </div>


//               {error && (

//                 <p className="text-xs font-medium text-coral bg-coral-light rounded-lg px-3 py-2">
//                   {error}
//                 </p>

//               )}


//               <button
//                 type="submit"
//                 disabled={
//                   saving ||
//                   !customerId ||
//                   !invoiceDate ||
//                   items.length === 0
//                 }
//                 className="w-full rounded-lg bg-ink text-white text-sm font-medium py-2.5 hover:bg-inkSoft transition-colors disabled:opacity-60"
//               >

//                 {saving
//                   ? editingInvoice
//                     ? 'Updating…'
//                     : 'Saving…'
//                   : editingInvoice
//                     ? 'Update Invoice'
//                     : (isGstCompany
//                         ? 'Generate GST Invoice'
//                         : 'Generate Invoice')}

//               </button>

//             </form>

//           </Modal>

//         )}

//       </div>


//       {preview && (

//         <InvoicePreview
//           invoice={preview}
//           onClose={() =>
//             setPreview(null)
//           }
//         />

//       )}


//       {deleteConfirm && (

//         <div className="fixed inset-0 z-[99999] bg-black/60 flex items-center justify-center p-4">

//           <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">

//             <div className="flex items-center justify-between mb-4">

//               <h3 className="text-lg font-semibold text-ink">
//                 Delete Invoice
//               </h3>

//               <button
//                 onClick={() =>
//                   setDeleteConfirm(null)
//                 }
//                 className="text-slateink hover:text-ink"
//               >

//                 <X size={20} />

//               </button>

//             </div>


//             <div className="space-y-4">

//               <p className="text-sm text-ink">
//                 Are you sure to delete this invoice?
//               </p>


//               <div className="bg-paper rounded-lg p-3 text-sm">

//                 <p className="font-medium text-ink">
//                   {deleteConfirm.invoiceNumber}
//                 </p>

//                 <p className="text-slateink text-xs">
//                   {deleteConfirm.customerName || deleteConfirm.customerCompany || '-'}
//                 </p>


//                 <p className="text-slateink text-xs">
//                   Total: Rs{' '}
//                   {currency(
//                     deleteConfirm.total || 0
//                   )}
//                 </p>


//                 <p className="text-red-600 text-xs">
//                   Discount: Rs{' '}
//                   {currency(
//                     deleteConfirm.discount || 0
//                   )}
//                 </p>


//                 <p className="font-semibold text-ink text-xs">
//                   Net Total: Rs{' '}
//                   {currency(
//                     deleteConfirm.netTotal !== undefined
//                       ? deleteConfirm.netTotal
//                       : Math.max(
//                           0,
//                           Number(deleteConfirm.total || 0) -
//                           Number(deleteConfirm.discount || 0)
//                         )
//                   )}
//                 </p>

//               </div>


//               <div className="flex gap-3">

//                 <button
//                   onClick={() =>
//                     setDeleteConfirm(null)
//                   }
//                   className="flex-1 rounded-lg border border-line text-ink text-sm font-medium py-2.5 hover:bg-paper transition-colors"
//                 >
//                   Cancel
//                 </button>


//                 <button
//                   onClick={handleDeleteInvoice}
//                   disabled={deleting}
//                   className="flex-1 rounded-lg bg-coral text-white text-sm font-medium py-2.5 hover:bg-red-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
//                 >

//                   {deleting ? (

//                     'Deleting…'

//                   ) : (

//                     <>

//                       <Trash2 size={16} />

//                       Delete

//                     </>

//                   )}

//                 </button>

//               </div>

//             </div>

//           </div>

//         </div>

//       )}


//       {editingProductIndex !== null && (

//         <div className="fixed inset-0 z-[99999] bg-black/60 flex items-center justify-center p-4">

//           <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">

//             <div className="flex items-center justify-between mb-4">

//               <h3 className="text-lg font-semibold text-ink">
//                 Edit Item
//               </h3>

//               <button
//                 onClick={closeEditProduct}
//                 className="text-slateink hover:text-ink"
//               >

//                 <X size={20} />

//               </button>

//             </div>


//             <div className="space-y-3">

//               {isGstCompany && (
//                 <div>

//                   <label className="text-xs font-medium text-slateink">
//                     Type
//                   </label>

//                   <select
//                     value={editProduct.type}
//                     onChange={(e) =>
//                       setEditProduct({
//                         ...editProduct,
//                         type: e.target.value
//                       })
//                     }
//                     className="input mt-1 w-full"
//                   >
//                     {ITEM_TYPE_OPTIONS.map((opt) => (
//                       <option key={opt.value} value={opt.value}>
//                         {opt.label}
//                       </option>
//                     ))}
//                   </select>

//                 </div>
//               )}


//               <div>

//                 <label className="text-xs font-medium text-slateink">
//                   Name
//                 </label>

//                 <input
//                   type="text"
//                   value={editProduct.name}
//                   onChange={(e) =>
//                     setEditProduct({
//                       ...editProduct,
//                       name:
//                         e.target.value
//                     })
//                   }
//                   className="input mt-1 w-full"
//                   placeholder="Product / service name"
//                 />

//               </div>

//               <div>

//                 <label className="text-xs font-medium text-slateink">
//                   Unit
//                 </label>

//                 <input
//                   type="text"
//                   value={editProduct.unit}
//                   onChange={(e) =>
//                     setEditProduct({
//                       ...editProduct,
//                       unit:
//                         e.target.value
//                     })
//                   }
//                   className="input mt-1 w-full"
//                   placeholder="PCS, KG, MTR, etc."
//                 />

//               </div>


//               <div className="grid grid-cols-2 gap-3">

//                 <div>

//                   <label className="text-xs font-medium text-slateink">
//                     Quantity
//                   </label>

//                   <input
//                     type="number"
//                     min={1}
//                     value={editProduct.qty}
//                     onChange={(e) =>
//                       setEditProduct({
//                         ...editProduct,
//                         qty:
//                           Number(
//                             e.target.value
//                           ) || 1
//                       })
//                     }
//                     className="input mt-1 w-full"
//                   />

//                 </div>


//                 <div>

//                   <label className="text-xs font-medium text-slateink">
//                     Unit Price
//                   </label>

//                   <input
//                     type="number"
//                     min={0}
//                     step="0.01"
//                     value={editProduct.price}
//                     onChange={(e) =>
//                       setEditProduct({
//                         ...editProduct,
//                         price:
//                           Number(
//                             e.target.value
//                           ) || 0
//                       })
//                     }
//                     className="input mt-1 w-full"
//                   />

//                 </div>

//               </div>


//               <button
//                 type="button"
//                 onClick={saveEditProduct}
//                 disabled={
//                   !editProduct.name.trim()
//                 }
//                 className="w-full rounded-lg bg-blue-600 text-white text-sm font-medium py-2.5 hover:bg-blue-700 transition-colors disabled:opacity-50 mt-2 flex items-center justify-center gap-2"
//               >

//                 <Save size={16} />

//                 Save Item

//               </button>

//             </div>

//           </div>

//         </div>

//       )}

//     </>

//   )

// }


// /* ================================================================
//    CONVERT FIREBASE INVOICE TO PREVIEW
//    ================================================================ */

// function convertInvoiceToPreview(invoice) {

//   const total =
//     Number(
//       invoice.total || 0
//     )


//   const discount =
//     Math.min(
//       Math.max(
//         Number(
//           invoice.discount || 0
//         ),
//         0
//       ),
//       total
//     )


//   const subTotal =
//     invoice.subTotal !== undefined &&
//     invoice.subTotal !== null
//       ? Number(invoice.subTotal)
//       : Math.max(0, total - discount)


//   const isGstInvoice =
//     invoice.isGstInvoice === true


//   const items =
//     Array.isArray(invoice.items)
//       ? invoice.items
//       : []

//   let productTotal = 0
//   let serviceTotal = 0

//   items.forEach((item) => {
//     const type = item.type || 'product'
//     const qty = Number(item.qty) || 0
//     const price = Number(item.price) || 0
//     const amount = qty * price

//     if (type === 'product') productTotal += amount
//     else serviceTotal += amount
//   })

//   const productDiscountShare =
//     total > 0 ? (productTotal / total) * discount : 0

//   const serviceDiscountShare =
//     total > 0 ? (serviceTotal / total) * discount : 0

//   const productSubTotal =
//     invoice.productSubTotal !== undefined &&
//     invoice.productSubTotal !== null
//       ? Number(invoice.productSubTotal)
//       : Math.max(0, productTotal - productDiscountShare)

//   const serviceSubTotal =
//     invoice.serviceSubTotal !== undefined &&
//     invoice.serviceSubTotal !== null
//       ? Number(invoice.serviceSubTotal)
//       : Math.max(0, serviceTotal - serviceDiscountShare)

//   const productGstRate =
//     isGstInvoice
//       ? (
//           invoice.productGstRate !== undefined
//             ? Math.max(0, Number(invoice.productGstRate) || 0)
//             : (invoice.gstRate !== undefined
//                 ? Math.max(0, Number(invoice.gstRate) || 0)
//                 : 0)
//         )
//       : 0

//   const serviceGstRate =
//     isGstInvoice
//       ? (
//           invoice.serviceGstRate !== undefined
//             ? Math.max(0, Number(invoice.serviceGstRate) || 0)
//             : 0
//         )
//       : 0

//   const productGstAmount =
//     isGstInvoice
//       ? (
//           invoice.productGstAmount !== undefined &&
//           invoice.productGstAmount !== null
//             ? Number(invoice.productGstAmount)
//             : (productSubTotal * productGstRate / 100)
//         )
//       : 0

//   const serviceGstAmount =
//     isGstInvoice
//       ? (
//           invoice.serviceGstAmount !== undefined &&
//           invoice.serviceGstAmount !== null
//             ? Number(invoice.serviceGstAmount)
//             : (serviceSubTotal * serviceGstRate / 100)
//         )
//       : 0

//   const gstAmount =
//     isGstInvoice
//       ? (
//           invoice.gstAmount !== undefined &&
//           invoice.gstAmount !== null
//             ? Number(invoice.gstAmount)
//             : (productGstAmount + serviceGstAmount)
//         )
//       : 0

//   const netTotal =
//     invoice.netTotal !== undefined &&
//     invoice.netTotal !== null
//       ? Number(invoice.netTotal)
//       : (isGstInvoice
//           ? subTotal + gstAmount
//           : subTotal)


//   return {

//     id:
//       invoice.id,

//     invoiceNumber:
//       invoice.invoiceNumber,

//     date:
//       invoice.date,

//     poNumber:
//       invoice.poNumber || '',

//     poDate:
//       invoice.poDate || '',

//     items:
//       items,

//     total:
//       total,

//     discount:
//       discount,

//     subTotal:
//       subTotal,

//     productTotal:
//       productTotal,

//     serviceTotal:
//       serviceTotal,

//     productSubTotal:
//       productSubTotal,

//     serviceSubTotal:
//       serviceSubTotal,

//     isGstInvoice:
//       isGstInvoice,

//     gstNumber:
//       invoice.gstNumber || '',

//     productGstRate:
//       productGstRate,

//     serviceGstRate:
//       serviceGstRate,

//     productGstAmount:
//       productGstAmount,

//     serviceGstAmount:
//       serviceGstAmount,

//     gstRate:
//       productGstRate,

//     gstAmount:
//       gstAmount,

//     netTotal:
//       netTotal,

//     termsAndConditions:
//       invoice.termsAndConditions || '',

//     companyName:
//       invoice.companyName ||
//       FALLBACK_COMPANY_NAME,

//     companyLogo:
//       invoice.companyLogo ||
//       FALLBACK_COMPANY_LOGO,

//     companyAddress:
//       invoice.companyAddress ||
//       FALLBACK_COMPANY_ADDRESS,

//     companyPhone:
//       invoice.companyPhone ||
//       FALLBACK_COMPANY_PHONE,

//     companyEmail:
//       invoice.companyEmail || '',

//     companyNTN:
//       invoice.companyNTN ||
//       FALLBACK_COMPANY_NTN,

//     companySTRN:
//       invoice.companySTRN ||
//       FALLBACK_COMPANY_STRN,

//     customer: {

//       name:
//         invoice.customerName || '',

//       company:
//         invoice.customerCompany || '',

//       phone:
//         invoice.customerPhone || '',

//       address:
//         invoice.customerAddress || ''

//     }

//   }

// }


// /* ================================================================
//    INVOICE PREVIEW
//    ================================================================ */

// function InvoicePreview({
//   invoice,
//   onClose
// }) {

//   const { company } = useAuth()


//   function printInvoice() {
//     window.print()
//   }


//   const total =
//     Number(
//       invoice.total || 0
//     )


//   const discount =
//     Math.min(
//       Math.max(
//         Number(
//           invoice.discount || 0
//         ),
//         0
//       ),
//       total
//     )


//   const subTotal =
//     invoice.subTotal !== undefined &&
//     invoice.subTotal !== null
//       ? Number(invoice.subTotal)
//       : Math.max(0, total - discount)


//   const isGstInvoice =
//     invoice.isGstInvoice === true


//   const productTotal =
//     Number(invoice.productTotal || 0)

//   const serviceTotal =
//     Number(invoice.serviceTotal || 0)

//   const productGstRate =
//     Number(invoice.productGstRate || 0)

//   const serviceGstRate =
//     Number(invoice.serviceGstRate || 0)

//   const productGstAmount =
//     Number(invoice.productGstAmount || 0)

//   const serviceGstAmount =
//     Number(invoice.serviceGstAmount || 0)

//   const gstAmount =
//     Number(
//       invoice.gstAmount !== undefined
//         ? invoice.gstAmount
//         : (productGstAmount + serviceGstAmount)
//     )

//   const netTotal =
//     invoice.netTotal !== undefined &&
//     invoice.netTotal !== null
//       ? Number(invoice.netTotal)
//       : (isGstInvoice
//           ? subTotal + gstAmount
//           : subTotal)


//   const customerName = String(invoice.customer?.name || '').trim()
//   const customerCompany = String(invoice.customer?.company || '').trim()

//   const customerDisplayName = customerName || customerCompany || ''
//   const showCompanySeparately = customerName && customerCompany


//   const companyName =
//     invoice.companyName ||
//     company?.name ||
//     FALLBACK_COMPANY_NAME

//   const companyLogo =
//     invoice.companyLogo ||
//     company?.logoUrl ||
//     FALLBACK_COMPANY_LOGO

//   const companyAddress =
//     invoice.companyAddress ||
//     company?.address ||
//     FALLBACK_COMPANY_ADDRESS

//   const companyPhone =
//     invoice.companyPhone ||
//     company?.phone ||
//     FALLBACK_COMPANY_PHONE

//   const companyEmail =
//     invoice.companyEmail ||
//     company?.email ||
//     ''

//   const companyNTN =
//     invoice.companyNTN ||
//     company?.ntn ||
//     FALLBACK_COMPANY_NTN

//   const companySTRN =
//     invoice.companySTRN ||
//     company?.strn ||
//     FALLBACK_COMPANY_STRN


//   return (

//     <div className="invoice-preview-overlay fixed inset-0 z-[9999] bg-black/60 overflow-y-auto p-4 sm:p-8">


//       <div className="invoice-preview-controls max-w-[900px] mx-auto mb-4 flex items-center justify-between">

//         <div>

//           <p className="text-white font-semibold text-sm">
//             {isGstInvoice ? 'GST Invoice Preview' : 'Invoice Preview'}
//           </p>

//           <p className="text-white/70 text-xs">
//             {invoice.invoiceNumber}
//           </p>

//         </div>


//         <div className="flex items-center gap-2">

//           <button
//             onClick={printInvoice}
//             className="inline-flex items-center gap-2 rounded-lg bg-white text-ink px-4 py-2 text-sm font-medium hover:bg-gray-100"
//           >

//             <Printer size={16} />

//             Print / Save as PDF

//           </button>


//           <button
//             onClick={onClose}
//             className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-white/10 text-white hover:bg-white/20"
//           >

//             <X size={18} />

//           </button>

//         </div>

//       </div>


//       <div
//         className="invoice-print-area"
//         id="invoice-print-area"
//       >

//         <div className="invoice-sheet">


//           <div className="invoice-header">


//             <div className="invoice-company">

//               <img
//                 src={companyLogo}
//                 alt={companyName || 'Company Logo'}
//                 className="invoice-logo"
//                 onError={(e) => {
//                   if (e.currentTarget.src !== window.location.origin + FALLBACK_COMPANY_LOGO) {
//                     e.currentTarget.src = FALLBACK_COMPANY_LOGO
//                   }
//                 }}
//               />

//               <div className="invoice-company-address">
//                 {companyAddress}
//               </div>


//               {companyPhone && (
//                 <div className="invoice-company-address">
//                   {companyPhone}
//                 </div>
//               )}


//               {companyEmail && (
//                 <div className="invoice-company-address">
//                   {companyEmail}
//                 </div>
//               )}

//             </div>


//             <div className="invoice-right-header">

//               <div className="invoice-tax-box">

//                 <div>
//                   NTN # {companyNTN}
//                 </div>

//                 <div>
//                   STRN # {companySTRN}
//                 </div>


//                 {isGstInvoice && invoice.gstNumber && (
//                   <div>
//                     GST # {invoice.gstNumber}
//                   </div>
//                 )}


//                 <div className="invoice-title">
//                   {isGstInvoice ? 'GST INVOICE' : 'INVOICE'}
//                 </div>

//               </div>


//               <div className="invoice-meta-box">

//                 <div className="invoice-meta-title">
//                   Invoice No.
//                 </div>


//                 <div className="invoice-number">
//                   {invoice.invoiceNumber}
//                 </div>


//                 <div className="invoice-meta-row">

//                   <span>
//                     Date:
//                   </span>

//                   <span>
//                     {formatInvoiceDate(invoice.date)}
//                   </span>

//                 </div>


//                 <div className="invoice-meta-row">

//                   <span>
//                     P/Order No.
//                   </span>

//                   <span>
//                     {invoice.poNumber || ''}
//                   </span>

//                 </div>


//                 <div className="invoice-meta-row">

//                   <span>
//                     P/Order Date
//                   </span>

//                   <span>
//                     {invoice.poDate
//                       ? formatInvoiceDate(invoice.poDate)
//                       : ''}
//                   </span>

//                 </div>

//               </div>

//             </div>

//           </div>


//           <div className="invoice-buyer-box">

//             <div className="invoice-buyer-title">
//               Buyer's Name & Address
//             </div>


//             <div className="invoice-buyer-content">

//               {customerDisplayName && (
//                 <div className="invoice-buyer-name">
//                   {customerDisplayName}
//                 </div>
//               )}

//               {showCompanySeparately && (
//                 <div>
//                   {customerCompany}
//                 </div>
//               )}


//               {invoice.customer?.address && (
//                 <div>
//                   {invoice.customer.address}
//                 </div>
//               )}


//               {invoice.customer?.phone && (
//                 <div>
//                   {invoice.customer.phone}
//                 </div>
//               )}

//             </div>

//           </div>


//           <table className={`invoice-table ${isGstInvoice ? 'with-type' : 'without-type'}`}>

//             <colgroup>

//               {isGstInvoice && (
//                 <col className="type-col" />
//               )}

//               <col className="qty-col" />
//               <col className="unit-col" />
//               <col className="description-col" />
//               <col className="price-col" />
//               <col className="amount-col" />

//             </colgroup>


//             <thead>

//               <tr>

//                 {isGstInvoice && (
//                   <th>
//                     Type
//                   </th>
//                 )}

//                 <th>
//                   Quantity
//                 </th>

//                 <th>
//                   Unit
//                 </th>

//                 <th>
//                   Description Of Goods
//                 </th>

//                 <th>
//                   Unit Price
//                 </th>

//                 <th>
//                   Amount
//                 </th>

//               </tr>

//             </thead>


//             <tbody>

//               {(invoice.items || []).map(
//                 (
//                   item,
//                   index
//                 ) => {

//                   const qty =
//                     Number(item.qty || 0)

//                   const price =
//                     Number(item.price || 0)

//                   const amount =
//                     qty * price

//                   const itemType =
//                     item.type || ITEM_TYPE_PRODUCT

//                   const typeLabel =
//                     getItemTypeLabel(itemType)


//                   return (

//                     <tr key={index}>

//                       {isGstInvoice && (
//                         <td className="type-cell">
//                           {typeLabel}
//                         </td>
//                       )}

//                       <td className="quantity-cell">
//                         {qty}
//                       </td>

//                       <td className='unit-cell'>
//                         {item.unit || 'PCS'}
//                       </td>

//                       <td className="description-cell">
//                         {item.name}
//                       </td>

//                       <td className="number-cell">
//                         {currency(price)}
//                       </td>

//                       <td className="number-cell">
//                         {currency(amount)}
//                       </td>

//                     </tr>

//                   )

//                 }
//               )}


//               {Array.from({

//                 length:
//                   Math.max(
//                     3,
//                     8 -
//                       (
//                         invoice.items?.length ||
//                         0
//                       )
//                   )

//               }).map(
//                 (
//                   _,
//                   index
//                 ) => (

//                   <tr
//                     key={`empty-${index}`}
//                     className="invoice-empty-row"
//                   >

//                     {isGstInvoice && (
//                       <td></td>
//                     )}

//                     <td></td>
//                     <td></td>
//                     <td></td>
//                     <td></td>
//                     <td></td>

//                   </tr>

//                 )
//               )}

//             </tbody>

//           </table>


//           <div className="invoice-total-wrapper">

//             <div className="invoice-total-row">

//               <div className="invoice-total-label">
//                 Total
//               </div>

//               <div className="invoice-total-value">
//                 PKR: {currency(total)}
//               </div>

//             </div>


//             <div className="invoice-total-row">

//               <div className="invoice-total-label">
//                 Discount
//               </div>

//               <div className="invoice-total-value">
//                 PKR: {currency(discount)}
//               </div>

//             </div>


//             {isGstInvoice && productTotal > 0 && (

//               <div className="invoice-total-row">

//                 <div className="invoice-total-label">
//                   GST on Products ({productGstRate}%)
//                 </div>

//                 <div className="invoice-total-value">
//                   PKR: {currency(productGstAmount)}
//                 </div>

//               </div>

//             )}


//             {isGstInvoice && serviceTotal > 0 && (

//               <div className="invoice-total-row">

//                 <div className="invoice-total-label">
//                   GST on Services ({serviceGstRate}%)
//                 </div>

//                 <div className="invoice-total-value">
//                   PKR: {currency(serviceGstAmount)}
//                 </div>

//               </div>

//             )}


//             <div className="invoice-total-row invoice-total-row-final">

//               <div className="invoice-total-label">
//                 Net Total
//               </div>

//               <div className="invoice-total-value">
//                 PKR: {currency(netTotal)}
//               </div>

//             </div>

//           </div>


//           {invoice.termsAndConditions?.trim() && (

//             <div className="invoice-terms-box">

//               <div className="invoice-terms-title">
//                 Terms &amp; Condition
//               </div>


//               <div className="invoice-terms-content">

//                 {invoice.termsAndConditions
//                   .split(/\r?\n/)
//                   .map(
//                     (term, index) => {

//                       const cleanTerm =
//                         term.trim()

//                       if (!cleanTerm) {
//                         return null
//                       }


//                       return (

//                         <div
//                           key={index}
//                           className="invoice-term-item"
//                         >

//                           <span className="invoice-term-number">
//                             {index + 1}.
//                           </span>

//                           <span className="invoice-term-text">
//                             {cleanTerm}
//                           </span>

//                         </div>

//                       )

//                     }
//                   )}

//               </div>

//             </div>

//           )}


//           <div className="invoice-footer-note">

//             <p>
//               {isGstInvoice
//                 ? 'Note: This is a computer generated GST invoice, does not require any stamp or signature.'
//                 : 'Note: This is a computer generated invoice, does not require any stamp or signature.'}
//             </p>

//           </div>


//         </div>

//       </div>

//     </div>

//   )

// }


// /* ================================================================
//    DATE FORMAT
//    ================================================================ */

// function formatInvoiceDate(value) {

//   if (!value) {
//     return ''
//   }


//   const date =
//     new Date(value)


//   if (
//     Number.isNaN(
//       date.getTime()
//     )
//   ) {
//     return value
//   }


//   const day =
//     String(
//       date.getDate()
//     ).padStart(
//       2,
//       '0'
//     )


//   const month =
//     String(
//       date.getMonth() + 1
//     ).padStart(
//       2,
//       '0'
//     )


//   const year =
//     date.getFullYear()


//   return `${day}/${month}/${year}`

// }


// /* ================================================================
//    INVOICE CSS
//    ================================================================ */

// const invoicePrintStyles = `

// /* ============================================================
//    INVOICE SHEET
//    ============================================================ */

// .invoice-sheet {

//   width: 210mm;

//   min-height: 297mm;

//   background: #ffffff;

//   margin: 0 auto;

//   padding: 15mm 17mm;

//   box-sizing: border-box;

//   color: #111111;

//   font-family:
//     Arial,
//     Helvetica,
//     sans-serif;

// }


// /* ============================================================
//    HEADER
//    ============================================================ */

// .invoice-header {

//   display: flex;

//   justify-content: space-between;

//   align-items: flex-start;

//   min-height: 55mm;

// }


// .invoice-company {

//   width: 53%;

// }


// .invoice-logo {

//   width: 42mm;

//   height: 25mm;

//   object-fit: contain;

//   object-position: left center;

//   display: block;

//   margin-bottom: 1mm;

// }


// .invoice-company-address {

//   white-space: pre-line;

//   font-size: 10px;

//   line-height: 1.4;

//   padding-top: 0mm;

// }


// .invoice-right-header {

//   width: 40%;

//   padding-top: 2mm;

// }


// .invoice-tax-box {

//   border: 1px solid #222;

//   padding: 2.5mm 2mm;

//   font-size: 10px;

//   line-height: 1.5;

// }


// .invoice-title {

//   font-size: 14px;

//   font-weight: 700;

//   margin-top: 1mm;

// }


// .invoice-meta-box {

//   border: 1px solid #222;

//   margin-top: 5mm;

//   font-size: 10px;

// }


// .invoice-meta-title {

//   font-weight: 700;

//   padding: 1.8mm 2mm 0.5mm;

// }


// .invoice-number {

//   padding: 0 2mm 1.5mm;

//   font-size: 10px;

//   font-weight: 600;

// }


// .invoice-meta-row {

//   display: grid;

//   grid-template-columns: 1fr 1fr;

//   border-top: 1px solid #222;

//   min-height: 6mm;

// }


// .invoice-meta-row span {

//   padding: 1.1mm 1.5mm;

// }


// .invoice-meta-row span:first-child {

//   border-right: 1px solid #222;

//   text-align: right;

// }


// .invoice-meta-row span:last-child {

//   text-align: left;

// }


// /* ============================================================
//    BUYER
//    ============================================================ */

// .invoice-buyer-box {

//   width: 54%;

//   border: 1px solid #222;

//   margin-bottom: 18mm;

//   font-size: 10px;

// }


// .invoice-buyer-title {

//   font-weight: 700;

//   background: #f1f1f1;

//   border-bottom: 1px solid #222;

//   padding: 1.6mm 2mm;

// }


// .invoice-buyer-content {

//   min-height: 8mm;

//   padding: 1.6mm 2mm;

//   line-height: 1.4;

// }


// .invoice-buyer-name {

//   font-weight: 600;

// }


// /* ============================================================
//    PRODUCT TABLE
//    ============================================================ */

// .invoice-table {

//   width: 100%;

//   table-layout: fixed;

//   border-collapse: collapse;

//   border: 1px solid #222;

//   font-size: 10px;

// }


// /* ============================================================
//    WITH TYPE (GST company) — 6 columns
//    ============================================================ */

// .invoice-table.with-type .type-col {
//   width: 12%;
// }

// .invoice-table.with-type .qty-col {
//   width: 11%;
// }

// .invoice-table.with-type .unit-col {
//   width: 9%;
// }

// .invoice-table.with-type .description-col {
//   width: 38%;
// }

// .invoice-table.with-type .price-col {
//   width: 15%;
// }

// .invoice-table.with-type .amount-col {
//   width: 15%;
// }


// /* ============================================================
//    WITHOUT TYPE (Non-GST company) — 5 columns
//    ============================================================ */

// .invoice-table.without-type .qty-col {
//   width: 13%;
// }

// .invoice-table.without-type .unit-col {
//   width: 11%;
// }

// .invoice-table.without-type .description-col {
//   width: 44%;
// }

// .invoice-table.without-type .price-col {
//   width: 16%;
// }

// .invoice-table.without-type .amount-col {
//   width: 16%;
// }


// .invoice-table thead th {

//   padding: 2.8mm 1.8mm;

//   font-weight: 700;

//   text-align: center;

//   border-left: 1px solid #222;

//   border-right: 1px solid #222;

//   border-bottom: 1px solid #222;

//   border-top: 0;

// }


// .invoice-table tbody td:nth-child(3) {
//   text-align: center;
// }

// .invoice-table tbody td {

//   padding: 1.5mm 1.8mm;

//   height: 6mm;

//   vertical-align: top;

//   border-left: 1px solid #222;

//   border-right: 1px solid #222;

//   border-top: 0 !important;

//   border-bottom: 0 !important;

//   background: transparent !important;

// }


// .invoice-table .type-cell {

//   text-align: center;

//   font-weight: 600;

//   text-transform: uppercase;

//   font-size: 9px;

// }


// .invoice-table .quantity-cell {

//   text-align: center;

// }


// .invoice-table .unit-cell {
//   text-align: center;
// }


// .invoice-table .description-cell {

//   text-align: center;

// }


// .invoice-table .number-cell {

//   text-align: right;

//   white-space: nowrap;

// }


// .invoice-table tbody .invoice-empty-row td {

//   height: 1mm;

//   border-left: 1px solid #222 !important;

//   border-right: 1px solid #222 !important;

//   border-top: 0 !important;

//   border-bottom: 0 !important;

// }


// .invoice-table th:first-child,
// .invoice-table td:first-child {

//   border-left: 1px solid #222 !important;

// }


// .invoice-table th:last-child,
// .invoice-table td:last-child {

//   border-right: 1px solid #222 !important;

// }


// .invoice-table tbody tr:last-child td {

//   border-bottom: 1px solid #222 !important;

// }


// /* ============================================================
//    TOTAL SUMMARY — COMPACT
//    ============================================================ */

// .invoice-total-wrapper {

//   width: 42%;

//   margin-top: 4mm;

//   margin-left: auto;

//   display: flex;

//   flex-direction: column;

//   align-items: stretch;

// }


// .invoice-total-row {

//   width: 100%;

//   display: flex;

//   flex-direction: row;

//   margin: 0;

//   padding: 0;

//   min-height: 7mm;

// }


// .invoice-total-label {

//   width: 60%;

//   box-sizing: border-box;

//   border-left: 1px solid #222;

//   border-right: 1px solid #222;

//   border-top: 1px solid #222;

//   padding: 1.6mm 2.5mm;

//   font-size: 10px;

//   font-weight: 700;

//   text-align: left;

//   line-height: 1.2;

//   display: flex;

//   align-items: center;

// }


// .invoice-total-value {

//   width: 40%;

//   box-sizing: border-box;

//   border-right: 1px solid #222;

//   border-top: 1px solid #222;

//   padding: 1.6mm 2.5mm;

//   font-size: 10px;

//   font-weight: 700;

//   text-align: right;

//   line-height: 1.2;

//   display: flex;

//   align-items: center;

//   justify-content: flex-end;

// }


// .invoice-total-row-final
// .invoice-total-label,

// .invoice-total-row-final
// .invoice-total-value {

//   border-top: 1px solid #222;

//   border-bottom: 1px solid #222;

// }


// /* ============================================================
//    TERMS & CONDITIONS
//    ============================================================ */

// .invoice-terms-box {

//   width: 100%;

//   box-sizing: border-box;

//   border: 1px solid #222;

//   margin-top: 6mm;

//   font-size: 9.5px;

//   page-break-inside: avoid;

// }


// .invoice-terms-title {

//   display: block;

//   width: 100%;

//   box-sizing: border-box;

//   padding: 1.8mm 2.5mm;

//   background: #f1f1f1;

//   border-bottom: 1px solid #222;

//   font-size: 10px;

//   font-weight: 700;

//   text-align: left;

// }


// .invoice-terms-content {

//   width: 100%;

//   box-sizing: border-box;

//   padding: 2.5mm 3mm;

// }


// .invoice-term-item {

//   display: flex;

//   width: 100%;

//   box-sizing: border-box;

//   margin: 0;

//   padding: 0.8mm 0;

//   line-height: 1.00;

// }


// .invoice-term-number {

//   width: 7mm;

//   flex-shrink: 0;

//   font-weight: 600;

// }


// .invoice-term-text {

//   flex: 1;

//   min-width: 0;

//   white-space: normal;

//   overflow-wrap: break-word;

// }


// /* ============================================================
//    FOOTER
//    ============================================================ */

// .invoice-footer-note {

//   margin-top: 4mm;

//   padding-top: 2mm;

//   border-top: 1px solid #ccc;

// }


// .invoice-footer-note p {

//   text-align: center;

//   font-size: 9px;

//   color: #888;

//   margin: 0;

//   font-style: italic;

// }


// /* ============================================================
//    PRINT
//    ============================================================ */

// @media print {

//   @page {

//     size: A4 portrait;

//     margin: 0;

//   }


//   html,
//   body {

//     width: 210mm;

//     min-height: 297mm;

//     margin: 0 !important;

//     padding: 0 !important;

//     background: white !important;

//   }


//   body * {

//     visibility: hidden !important;

//   }


//   .invoice-print-area,
//   .invoice-print-area * {

//     visibility: visible !important;

//   }


//   .invoice-preview-overlay {

//     position: static !important;

//     width: 210mm !important;

//     min-height: 297mm !important;

//     padding: 0 !important;

//     margin: 0 !important;

//     overflow: visible !important;

//     background: white !important;

//   }


//   .invoice-preview-controls {

//     display: none !important;

//   }


//   .invoice-print-area {

//     position: absolute !important;

//     left: 0 !important;

//     top: 0 !important;

//     width: 210mm !important;

//     margin: 0 !important;

//     padding: 0 !important;

//   }


//   .invoice-sheet {

//     width: 210mm !important;

//     min-height: 297mm !important;

//     margin: 0 !important;

//     padding: 15mm 17mm !important;

//     box-sizing: border-box !important;

//     box-shadow: none !important;

//   }


//   .invoice-logo {

//     margin-bottom: 1mm !important;

//   }


//   .invoice-company-address {

//     padding-top: 0mm !important;

//   }


//   .invoice-table {

//     width: 100% !important;

//     border-collapse: collapse !important;

//     border: 1px solid #222 !important;

//   }


//   .invoice-table thead th {

//     border-left: 1px solid #222 !important;

//     border-right: 1px solid #222 !important;

//     border-top: 0 !important;

//     border-bottom: 1px solid #222 !important;

//   }


//   .invoice-table tbody td {

//     border-left: 1px solid #222 !important;

//     border-right: 1px solid #222 !important;

//     border-top: 0 !important;

//     border-bottom: 0 !important;

//     background: transparent !important;

//   }


//   .invoice-table tbody .invoice-empty-row td {

//     border-left: 1px solid #222 !important;

//     border-right: 1px solid #222 !important;

//     border-top: 0 !important;

//     border-bottom: 0 !important;

//   }


//   .invoice-table tbody tr:last-child td {

//     border-bottom: 1px solid #222 !important;

//   }


//   .invoice-total-wrapper {

//     width: 42% !important;

//     margin-top: 4mm !important;

//     margin-left: auto !important;

//     display: flex !important;

//     flex-direction: column !important;

//     align-items: stretch !important;

//   }


//   .invoice-total-row {

//     width: 100% !important;

//     display: flex !important;

//     flex-direction: row !important;

//     margin: 0 !important;

//     padding: 0 !important;

//     min-height: 7mm !important;

//   }


//   .invoice-total-label {

//     width: 60% !important;

//     box-sizing: border-box !important;

//     border-left: 1px solid #222 !important;

//     border-right: 1px solid #222 !important;

//     border-top: 1px solid #222 !important;

//     padding: 1.6mm 2.5mm !important;

//     font-size: 10px !important;

//     font-weight: 700 !important;

//     text-align: left !important;

//     line-height: 1.2 !important;

//     display: flex !important;

//     align-items: center !important;

//   }


//   .invoice-total-value {

//     width: 40% !important;

//     box-sizing: border-box !important;

//     border-right: 1px solid #222 !important;

//     border-top: 1px solid #222 !important;

//     padding: 1.6mm 2.5mm !important;

//     font-size: 10px !important;

//     font-weight: 700 !important;

//     text-align: right !important;

//     line-height: 1.2 !important;

//     display: flex !important;

//     align-items: center !important;

//     justify-content: flex-end !important;

//   }


//   .invoice-total-row-final
//   .invoice-total-label,

//   .invoice-total-row-final
//   .invoice-total-value {

//     border-top: 1px solid #222 !important;

//     border-bottom: 1px solid #222 !important;

//   }


//   .invoice-terms-box {

//     width: 100% !important;

//     box-sizing: border-box !important;

//     border: 1px solid #222 !important;

//     margin-top: 6mm !important;

//     page-break-inside: avoid !important;

//     break-inside: avoid !important;

//   }


//   .invoice-terms-title {

//     display: block !important;

//     width: 100% !important;

//     box-sizing: border-box !important;

//     padding: 1.8mm 2.5mm !important;

//     background: #f1f1f1 !important;

//     border-bottom: 1px solid #222 !important;

//     font-size: 10px !important;

//     font-weight: 700 !important;

//     text-align: left !important;

//     -webkit-print-color-adjust: exact !important;

//     print-color-adjust: exact !important;

//   }


//   .invoice-terms-content {

//     width: 100% !important;

//     box-sizing: border-box !important;

//     padding: 2.5mm 3mm !important;

//     -webkit-print-color-adjust: exact !important;

//     print-color-adjust: exact !important;

//   }


//   .invoice-term-item {

//     display: flex !important;

//     width: 100% !important;

//     box-sizing: border-box !important;

//     margin: 0 !important;

//     padding: 0.8mm 0 !important;

//     line-height: 1.45 !important;

//   }


//   .invoice-term-number {

//     width: 7mm !important;

//     flex-shrink: 0 !important;

//     font-weight: 600 !important;

//   }


//   .invoice-term-text {

//     flex: 1 !important;

//     min-width: 0 !important;

//     white-space: normal !important;

//     overflow-wrap: break-word !important;

//   }


//   .invoice-footer-note {

//     border-top: 1px solid #ccc !important;

//   }

// }

// `


// /* ================================================================
//    INSERT PRINT CSS
//    ================================================================ */

// if (
//   typeof document !== 'undefined'
// ) {

//   const styleId =
//     'invoice-print-styles'


//   const oldStyle =
//     document.getElementById(
//       styleId
//     )


//   if (!oldStyle) {

//     const style =
//       document.createElement(
//         'style'
//       )


//     style.id =
//       styleId


//     style.innerHTML =
//       invoicePrintStyles


//     document.head.appendChild(
//       style
//     )

//   }

// }





import { useEffect, useMemo, useState, useRef } from 'react'

import {
  ref,
  push,
  onValue,
  update,
  get,
  set,
  remove
} from 'firebase/database'

import {
  Plus,
  Trash2,
  Receipt,
  Pencil,
  Printer,
  X,
  Save,
  Download,
  Search,
  ArrowUpDown,
  ChevronDown
} from 'lucide-react'

import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'

import {
  formatDate,
  todayISO,
  currency
} from '../utils/helpers'

import { Modal } from './Customers'
import Loader from '../components/Loader'


/* ============================================================
   GST COMPANY ID
   ============================================================ */

const GST_COMPANY_ID = 'CxH9LmB84yWzn7x1lCVQAmPfvi63'


/* ============================================================
   CONFECTIONERY COMPANY ID
   ============================================================ */

const CONFECTIONERY_COMPANY_ID = 'fKxuXEaw4ihtBunMYEVRYdKRxsH2'


/* ============================================================
   FALLBACK COMPANY INFORMATION
   ============================================================ */

const FALLBACK_COMPANY_NAME = ''

const FALLBACK_COMPANY_LOGO = '/PN.png'

const FALLBACK_COMPANY_ADDRESS = `
KCHS, Gohar Chamber, Office # 304,
Shahra-e-Faisal, near Duty Free Shop,
Karachi, 75600
`

const FALLBACK_COMPANY_PHONE = '0341-1293604'

const FALLBACK_COMPANY_NTN = '-'

const FALLBACK_COMPANY_STRN = '-'


/* ============================================================
   ITEM TYPES
   ============================================================ */

const ITEM_TYPE_PRODUCT = 'product'

const ITEM_TYPE_SERVICE = 'service'

const ITEM_TYPE_INSTALLATION = 'installation'

const ITEM_TYPE_OPTIONS = [
  { value: ITEM_TYPE_PRODUCT, label: 'Product' },
  { value: ITEM_TYPE_SERVICE, label: 'Service' },
  { value: ITEM_TYPE_INSTALLATION, label: 'Installation' }
]


/* ============================================================
   INVOICE NUMBER GENERATOR
   ============================================================ */

function getTodayDateString() {

  const today = new Date()

  const year =
    today.getFullYear()

  const month =
    String(
      today.getMonth() + 1
    ).padStart(2, '0')

  const day =
    String(
      today.getDate()
    ).padStart(2, '0')

  return `${year}${month}${day}`

}


async function getNextInvoiceNumber(companyId) {

  try {

    const dateStr =
      getTodayDateString()

    const counterRef =
      ref(
        db,
        `companies/${companyId}/counters/invoice`
      )

    const snapshot =
      await get(counterRef)

    let lastNumber = 0
    let lastDate = ''

    if (snapshot.exists()) {

      const data =
        snapshot.val()

      lastNumber =
        data.number || 0

      lastDate =
        data.date || ''

    }

    let nextNumber =
      lastNumber + 1

    if (lastDate !== dateStr) {

      nextNumber = 1

    }

    const padded =
      String(
        nextNumber
      ).padStart(4, '0')

    return `INV-${dateStr}-${padded}`

  } catch (error) {

    console.error(
      'Error getting invoice number:',
      error
    )

    const dateStr =
      getTodayDateString()

    const timestamp =
      Date.now()
        .toString()
        .slice(-6)

    return `INV-${dateStr}-${timestamp}`

  }

}


async function incrementInvoiceCounter(companyId) {

  try {

    const dateStr =
      getTodayDateString()

    const counterRef =
      ref(
        db,
        `companies/${companyId}/counters/invoice`
      )

    const snapshot =
      await get(counterRef)

    let lastNumber = 0
    let lastDate = ''

    if (snapshot.exists()) {

      const data =
        snapshot.val()

      lastNumber =
        data.number || 0

      lastDate =
        data.date || ''

    }

    let newNumber =
      lastNumber + 1

    if (lastDate !== dateStr) {

      newNumber = 1

    }

    await set(
      counterRef,
      {
        date: dateStr,
        number: newNumber
      }
    )

    return {
      number: newNumber,
      date: dateStr
    }

  } catch (error) {

    console.error(
      'Error incrementing counter:',
      error
    )

    return null

  }

}


/* ============================================================
   EMPTY PRODUCT / SERVICE ITEM
   ============================================================ */

const emptyItem = {
  name: '',
  qty: 1,
  price: '',
  unit: 'PCS',
  type: ITEM_TYPE_PRODUCT
}


/* ============================================================
   HELPER: GET CUSTOMER DISPLAY NAME
   ============================================================ */

function getCustomerDisplayInfo(invoice) {
  const name = String(invoice.customerName || '').trim()
  const company = String(invoice.customerCompany || '').trim()

  return {
    primary: name || company || '-',
    secondary: name && company ? company : '',
    hasName: !!name,
    hasCompany: !!company
  }
}


/* ============================================================
   HELPER: Get Item Type Label
   ============================================================ */

function getItemTypeLabel(type) {
  if (type === ITEM_TYPE_SERVICE) return 'Service'
  if (type === ITEM_TYPE_INSTALLATION) return 'Installation'
  return 'Product'
}


/* ============================================================
   MAIN INVOICE COMPONENT
   ============================================================ */

export default function Invoice() {

  const { companyId, company } =
    useAuth()


  const isGstCompany = companyId === GST_COMPANY_ID

  const isConfectioneryCompany =
    companyId === CONFECTIONERY_COMPANY_ID


  /* ============================================================
     DYNAMIC COMPANY INFO
     ============================================================ */

  const companyName =
    company?.name ||
    FALLBACK_COMPANY_NAME

  const companyLogo =
    company?.logoUrl ||
    FALLBACK_COMPANY_LOGO

  const companyAddress =
    company?.address ||
    FALLBACK_COMPANY_ADDRESS

  const companyPhone =
    company?.phone ||
    FALLBACK_COMPANY_PHONE

  const companyEmail =
    company?.email ||
    ''

  const companyNTN =
    company?.ntn ||
    FALLBACK_COMPANY_NTN

  const companySTRN =
    company?.strn ||
    FALLBACK_COMPANY_STRN


  const [customers, setCustomers] =
    useState(null)

  const [invoices, setInvoices] =
    useState(null)

  const [showForm, setShowForm] =
    useState(false)

  const [preview, setPreview] =
    useState(null)

  const [editingInvoice, setEditingInvoice] =
    useState(null)

  const [customerId, setCustomerId] =
    useState('')

  const [customerSearch, setCustomerSearch] =
    useState('')

  const [showCustomerDropdown, setShowCustomerDropdown] =
    useState(false)

  const [invoiceNumber, setInvoiceNumber] =
    useState('')


  const [invoiceDate, setInvoiceDate] =
    useState(
      todayISO()
    )


  const [poNumber, setPoNumber] =
    useState('')

  const [poDate, setPoDate] =
    useState('')


  const [items, setItems] =
    useState([])


  const [pick, setPick] =
    useState({
      ...emptyItem
    })


  const [discount, setDiscount] =
    useState(0)


  /* ============================================================
     GST FIELDS
     ============================================================ */

  const [gstNumber, setGstNumber] =
    useState('')

  const [productGstRate, setProductGstRate] =
    useState(17)

  const [serviceGstRate, setServiceGstRate] =
    useState(15)


  const [termsAndConditions, setTermsAndConditions] =
    useState('')


  const [saving, setSaving] =
    useState(false)

  const [error, setError] =
    useState('')


  const [deleteConfirm, setDeleteConfirm] =
    useState(null)

  const [deleting, setDeleting] =
    useState(false)


  const [editingProductIndex, setEditingProductIndex] =
    useState(null)


  const [editProduct, setEditProduct] =
    useState({
      name: '',
      qty: 1,
      price: 0,
      unit: 'PCS',
      type: ITEM_TYPE_PRODUCT
    })


  const [searchTerm, setSearchTerm] =
    useState('')


  const [sortBy, setSortBy] =
    useState('date-desc')


  /* ============================================================
     CONFECTIONERY ITEM DROPDOWN
     ============================================================ */

  const [confectioneryItems, setConfectioneryItems] =
    useState([])

  const [showItemDropdown, setShowItemDropdown] =
    useState(false)

  const itemDropdownRef =
    useRef(null)


  /* ============================================================
     CLOSE ITEM DROPDOWN ON CLICK OUTSIDE
     ============================================================ */

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        itemDropdownRef.current &&
        !itemDropdownRef.current.contains(event.target)
      ) {
        setShowItemDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])


  /* ============================================================
     LOAD CUSTOMERS AND INVOICES
     ============================================================ */

  useEffect(() => {

    if (!companyId) {

      return

    }


    const customersRef =
      ref(
        db,
        `companies/${companyId}/customers`
      )


    const unsubscribeCustomers =
      onValue(
        customersRef,

        (snapshot) => {

          const value =
            snapshot.val() || {}

          const list =
            Object.entries(value)
              .map(
                ([id, customer]) => ({
                  id,
                  ...customer
                })
              )

          setCustomers(list)

        },

        (err) => {

          console.error(
            'Customers read failed:',
            err
          )

          setCustomers([])

        }
      )


    const invoicesRef =
      ref(
        db,
        `companies/${companyId}/invoices`
      )


    const unsubscribeInvoices =
      onValue(
        invoicesRef,

        (snapshot) => {

          const value =
            snapshot.val() || {}

          const list =
            Object.entries(value)
              .map(
                ([id, invoice]) => ({
                  id,
                  ...invoice
                })
              )

          setInvoices(list)

        },

        (err) => {

          console.error(
            'Invoices read failed:',
            err
          )

          setInvoices([])

        }
      )


    return () => {

      unsubscribeCustomers()

      unsubscribeInvoices()

    }

  }, [companyId])


  /* ============================================================
     LOAD CONFECTIONERY ITEMS
     ============================================================ */

  useEffect(() => {

    if (!companyId) return
    if (!isConfectioneryCompany) return


    const itemsRef =
      ref(
        db,
        `companies/${companyId}/confectionery-items`
      )


    const unsub = onValue(
      itemsRef,
      (snap) => {

        const value =
          snap.val() || {}

        const list =
          Object.entries(value)
            .map(([id, item]) => ({
              id,
              ...item
            }))
            .sort((a, b) => {
              const aName =
                String(a.name || '').toLowerCase()

              const bName =
                String(b.name || '').toLowerCase()

              return aName.localeCompare(bName)
            })

        setConfectioneryItems(list)

      },
      (err) => {

        console.error(
          'Confectionery items read failed:',
          err
        )

        setConfectioneryItems([])

      }
    )


    return () => unsub()

  }, [companyId, isConfectioneryCompany])


  /* ============================================================
     FILTERED CONFECTIONERY ITEMS
     ============================================================ */

  const filteredConfectioneryItems =
    useMemo(() => {

      if (!isConfectioneryCompany) return []

      const q =
        String(pick.name || '').trim().toLowerCase()

      if (!q) return confectioneryItems

      return confectioneryItems.filter((it) =>
        String(it.name || '').toLowerCase().includes(q)
      )

    }, [confectioneryItems, pick.name, isConfectioneryCompany])


  /* ============================================================
     FILTERED CUSTOMERS
     ============================================================ */

  const filteredCustomers =
    useMemo(() => {

      const search =
        customerSearch
          .trim()
          .toLowerCase()

      if (!search) {
        return customers || []
      }

      return (customers || []).filter(
        customer => {
          const name = String(customer.name || '').toLowerCase()
          const company = String(customer.company || '').toLowerCase()
          const phone = String(customer.phone || '').toLowerCase()
          const address = String(customer.address || '').toLowerCase()

          return (
            name.includes(search) ||
            company.includes(search) ||
            phone.includes(search) ||
            address.includes(search)
          )
        }
      )
    }, [customers, customerSearch])


  /* ============================================================
     FILTERED + SORTED INVOICES
     ============================================================ */

  const filteredInvoices =
    useMemo(() => {

      if (!invoices) return []

      const search =
        searchTerm
          .trim()
          .toLowerCase()

      let result = invoices

      if (search) {
        result = invoices.filter(
          invoice => {

            if (
              invoice.invoiceNumber &&
              invoice.invoiceNumber
                .toLowerCase()
                .includes(search)
            ) {
              return true
            }

            if (
              invoice.customerName &&
              invoice.customerName
                .toLowerCase()
                .includes(search)
            ) {
              return true
            }

            if (
              invoice.customerCompany &&
              invoice.customerCompany
                .toLowerCase()
                .includes(search)
            ) {
              return true
            }

            if (
              invoice.date &&
              formatDate(invoice.date)
                .toLowerCase()
                .includes(search)
            ) {
              return true
            }

            if (
              invoice.poNumber &&
              invoice.poNumber
                .toLowerCase()
                .includes(search)
            ) {
              return true
            }

            return false
          }
        )
      }

      const sorted = [...result]

      const getAmount = (inv) => {
        if (inv.netTotal !== undefined && inv.netTotal !== null) {
          return Number(inv.netTotal) || 0
        }
        return Math.max(
          0,
          Number(inv.total || 0) - Number(inv.discount || 0)
        )
      }

      switch (sortBy) {
        case 'date-asc':
          sorted.sort((a, b) => {
            const dateA = new Date(a.date || 0).getTime()
            const dateB = new Date(b.date || 0).getTime()
            if (dateA !== dateB) return dateA - dateB
            return (a.createdAt || 0) - (b.createdAt || 0)
          })
          break

        case 'amount-desc':
          sorted.sort((a, b) => {
            const amountA = getAmount(a)
            const amountB = getAmount(b)
            if (amountB !== amountA) return amountB - amountA
            return (b.createdAt || 0) - (a.createdAt || 0)
          })
          break

        case 'amount-asc':
          sorted.sort((a, b) => {
            const amountA = getAmount(a)
            const amountB = getAmount(b)
            if (amountA !== amountB) return amountA - amountB
            return (b.createdAt || 0) - (a.createdAt || 0)
          })
          break

        case 'date-desc':
        default:
          sorted.sort((a, b) => {
            const dateA = new Date(a.date || 0).getTime()
            const dateB = new Date(b.date || 0).getTime()
            if (dateA !== dateB) return dateB - dateA
            return (b.createdAt || 0) - (a.createdAt || 0)
          })
          break
      }

      return sorted

    }, [invoices, searchTerm, sortBy])


  /* ============================================================
     SELECT CUSTOMER
     ============================================================ */

  function selectCustomer(customer) {
    setCustomerId(customer.id)
    setCustomerSearch(
      `${customer.name || ''}${customer.company ? ` — ${customer.company}` : ''}`
    )
    setShowCustomerDropdown(false)
    setError('')
  }


  /* ============================================================
     TOTAL
     ============================================================ */

  const total =
    useMemo(() => {

      return items.reduce(
        (sum, item) => {

          const qty =
            Number(item.qty) || 0

          const price =
            Number(item.price) || 0

          return (
            sum +
            qty * price
          )

        },
        0
      )

    }, [items])


  /* ============================================================
     PRODUCT-ONLY TOTAL
     ============================================================ */

  const productTotal =
    useMemo(() => {

      return items.reduce(
        (sum, item) => {

          const type =
            item.type || ITEM_TYPE_PRODUCT

          if (type !== ITEM_TYPE_PRODUCT) return sum

          const qty =
            Number(item.qty) || 0

          const price =
            Number(item.price) || 0

          return sum + qty * price

        },
        0
      )

    }, [items])


  /* ============================================================
     SERVICE-ONLY TOTAL (Service + Installation)
     ============================================================ */

  const serviceTotal =
    useMemo(() => {

      return items.reduce(
        (sum, item) => {

          const type =
            item.type || ITEM_TYPE_PRODUCT

          if (
            type !== ITEM_TYPE_SERVICE &&
            type !== ITEM_TYPE_INSTALLATION
          ) {
            return sum
          }

          const qty =
            Number(item.qty) || 0

          const price =
            Number(item.price) || 0

          return sum + qty * price

        },
        0
      )

    }, [items])


  /* ============================================================
     DISCOUNT VALUE
     ============================================================ */

  const discountValue =
    useMemo(() => {

      const value =
        Number(discount) || 0

      return Math.min(
        Math.max(
          value,
          0
        ),
        total
      )

    }, [discount, total])


  /* ============================================================
     DISCOUNT PROPORTIONAL SPLIT
     ============================================================ */

  const productDiscountShare =
    useMemo(() => {

      if (!total) return 0

      return (productTotal / total) * discountValue

    }, [productTotal, total, discountValue])


  const serviceDiscountShare =
    useMemo(() => {

      if (!total) return 0

      return (serviceTotal / total) * discountValue

    }, [serviceTotal, total, discountValue])


  /* ============================================================
     SUBTOTALS
     ============================================================ */

  const productSubTotal =
    useMemo(() => {

      return Math.max(
        0,
        productTotal - productDiscountShare
      )

    }, [productTotal, productDiscountShare])


  const serviceSubTotal =
    useMemo(() => {

      return Math.max(
        0,
        serviceTotal - serviceDiscountShare
      )

    }, [serviceTotal, serviceDiscountShare])


  const subTotal =
    useMemo(() => {

      return Math.max(
        0,
        total - discountValue
      )

    }, [total, discountValue])


  /* ============================================================
     GST AMOUNTS
     ============================================================ */

  const productGstAmount =
    useMemo(() => {

      if (!isGstCompany) return 0

      const rate =
        Math.max(
          0,
          Number(productGstRate) || 0
        )

      return (
        productSubTotal *
        rate /
        100
      )

    }, [
      isGstCompany,
      productGstRate,
      productSubTotal
    ])


  const serviceGstAmount =
    useMemo(() => {

      if (!isGstCompany) return 0

      const rate =
        Math.max(
          0,
          Number(serviceGstRate) || 0
        )

      return (
        serviceSubTotal *
        rate /
        100
      )

    }, [
      isGstCompany,
      serviceGstRate,
      serviceSubTotal
    ])


  const gstAmount =
    useMemo(() => {

      return (
        productGstAmount +
        serviceGstAmount
      )

    }, [productGstAmount, serviceGstAmount])


  /* ============================================================
     NET TOTAL
     ============================================================ */

  const netTotal =
    useMemo(() => {

      if (isGstCompany) {

        return Math.max(
          0,
          subTotal + gstAmount
        )

      }

      return subTotal

    }, [isGstCompany, subTotal, gstAmount])


  /* ============================================================
     ADD PRODUCT / SERVICE
     ============================================================ */

  async function addItem() {

    if (!pick.name.trim()) {

      return

    }


    const name =
      pick.name.trim()


    /* ========================================================
       CONFECTIONERY: Auto-save new item to Items page
       ======================================================== */

    if (isConfectioneryCompany) {

      const existsAlready =
        confectioneryItems.some(
          (it) =>
            String(it.name || '')
              .toLowerCase()
              .trim() === name.toLowerCase()
        )

      if (!existsAlready) {
        try {
          await push(
            ref(
              db,
              `companies/${companyId}/confectionery-items`
            ),
            {
              name,
              createdAt: Date.now()
            }
          )
        } catch (err) {
          console.error(
            'Auto-save confectionery item failed:',
            err
          )
        }
      }

    }


    const newItem = {

      name,

      qty:
        Math.max(
          1,
          Number(pick.qty) || 1
        ),

      price:
        Math.max(
          0,
          Number(pick.price) || 0
        ),

      unit:
        pick.unit || 'PCS',

      type:
        isGstCompany
          ? (pick.type || ITEM_TYPE_PRODUCT)
          : ITEM_TYPE_PRODUCT

    }


    setItems(
      previous => [
        ...previous,
        newItem
      ]
    )


    setPick({
      ...emptyItem
    })

    setShowItemDropdown(false)

  }


  /* ============================================================
     SELECT CONFECTIONERY ITEM FROM DROPDOWN
     ============================================================ */

  function selectConfectioneryItem(name) {
    setPick((prev) => ({
      ...prev,
      name
    }))
    setShowItemDropdown(false)
  }


  /* ============================================================
     REMOVE PRODUCT
     ============================================================ */

  function removeItem(index) {

    setItems(
      previous =>
        previous.filter(
          (_, i) =>
            i !== index
        )
    )

  }


  /* ============================================================
     EDIT PRODUCT - OPEN
     ============================================================ */

  function openEditProduct(index) {

    const item =
      items[index]

    if (!item) {

      return

    }

    setEditingProductIndex(
      index
    )

    setEditProduct({

      name:
        item.name,

      qty:
        item.qty,

      price:
        item.price,

      unit:
        item.unit || 'PCS',

      type:
        item.type || ITEM_TYPE_PRODUCT

    })

  }


  /* ============================================================
     EDIT PRODUCT - SAVE
     ============================================================ */

  function saveEditProduct() {

    if (
      !editProduct.name.trim()
    ) {

      return

    }


    if (
      editingProductIndex === null
    ) {

      return

    }


    const updatedItems =
      [...items]


    updatedItems[
      editingProductIndex
    ] = {

      name:
        editProduct.name.trim(),

      qty:
        Math.max(
          1,
          Number(
            editProduct.qty
          ) || 1
        ),

      price:
        Math.max(
          0,
          Number(
            editProduct.price
          ) || 0
        ),

      unit:
        editProduct.unit || 'PCS',

      type:
        isGstCompany
          ? (editProduct.type || ITEM_TYPE_PRODUCT)
          : ITEM_TYPE_PRODUCT

    }


    setItems(
      updatedItems
    )


    setEditingProductIndex(
      null
    )


    setEditProduct({

      name: '',
      qty: 1,
      price: 0,
      unit: 'PCS',
      type: ITEM_TYPE_PRODUCT

    })

  }


  /* ============================================================
     EDIT PRODUCT - CLOSE
     ============================================================ */

  function closeEditProduct() {

    setEditingProductIndex(
      null
    )

    setEditProduct({

      name: '',
      qty: 1,
      price: 0,
      unit: 'PCS',
      type: ITEM_TYPE_PRODUCT

    })

  }


  /* ============================================================
     RESET FORM
     ============================================================ */

  function resetForm() {

    setCustomerId('')
    setCustomerSearch('')
    setShowCustomerDropdown(false)

    setInvoiceNumber('')

    setInvoiceDate(
      todayISO()
    )

    setPoNumber('')

    setPoDate('')

    setItems([])

    setPick({
      ...emptyItem
    })

    setShowItemDropdown(false)

    setDiscount(0)

    setGstNumber('')
    setProductGstRate(17)
    setServiceGstRate(15)

    setTermsAndConditions('')

    setEditingInvoice(
      null
    )

    setError('')

    setEditingProductIndex(
      null
    )

    setEditProduct({

      name: '',
      qty: 1,
      price: 0,
      unit: 'PCS',
      type: ITEM_TYPE_PRODUCT

    })

  }


  /* ============================================================
     DELETE INVOICE
     ============================================================ */

  async function handleDeleteInvoice() {

    if (
      !companyId ||
      !deleteConfirm
    ) {

      return

    }


    setDeleting(true)


    try {

      const invoiceRef =
        ref(
          db,
          `companies/${companyId}/invoices/${deleteConfirm.id}`
        )


      await remove(
        invoiceRef
      )


      setDeleteConfirm(
        null
      )

    } catch (err) {

      console.error(
        'Invoice delete error:',
        err
      )

      alert(
        'Invoice delete nahi ho saka. Dobara koshish karein.'
      )

    } finally {

      setDeleting(false)

    }

  }


  /* ============================================================
     OPEN NEW INVOICE
     ============================================================ */

  const openNewInvoice =
    async () => {

      resetForm()

      setInvoiceDate(
        todayISO()
      )

      setDiscount(0)

      setTermsAndConditions('')


      if (companyId) {

        const number =
          await getNextInvoiceNumber(
            companyId
          )

        setInvoiceNumber(
          number
        )

      }


      setShowForm(
        true
      )

    }


  /* ============================================================
     OPEN EDIT INVOICE
     ============================================================ */

  function openEditInvoice(invoice) {

    setEditingInvoice(
      invoice
    )


    setCustomerId(
      invoice.customerId || ''
    )

    const editCustomer =
      customers?.find(
        customer =>
          customer.id === invoice.customerId
      )

    setCustomerSearch(
      editCustomer
        ? `${editCustomer.name || ''}${editCustomer.company ? ` — ${editCustomer.company}` : ''}`
        : invoice.customerName || invoice.customerCompany || ''
    )

    setShowCustomerDropdown(false)


    setInvoiceNumber(
      invoice.invoiceNumber || ''
    )


    setInvoiceDate(
      invoice.date ||
      todayISO()
    )


    setPoNumber(
      invoice.poNumber || ''
    )


    setPoDate(
      invoice.poDate || ''
    )


    setItems(
      Array.isArray(
        invoice.items
      )
        ? invoice.items.map(
            item => ({

              name:
                item.name || '',

              qty:
                Number(
                  item.qty
                ) || 1,

              price:
                Number(
                  item.price
                ) || 0,

              unit:
                item.unit || 'PCS',

              type:
                item.type || ITEM_TYPE_PRODUCT

            })
          )
        : []
    )


    setDiscount(
      Math.max(
        0,
        Number(
          invoice.discount
        ) || 0
      )
    )


    setGstNumber(
      invoice.gstNumber || ''
    )


    setProductGstRate(
      invoice.productGstRate !== undefined
        ? invoice.productGstRate
        : (invoice.gstRate !== undefined
            ? invoice.gstRate
            : 17)
    )


    setServiceGstRate(
      invoice.serviceGstRate !== undefined
        ? invoice.serviceGstRate
        : 15
    )


    setTermsAndConditions(
      invoice.termsAndConditions || ''
    )


    setPick({
      ...emptyItem
    })

    setShowItemDropdown(false)


    setError('')


    setEditingProductIndex(
      null
    )


    setShowForm(
      true
    )

  }


  /* ============================================================
     CLOSE FORM
     ============================================================ */

  function closeForm() {

    if (saving) {

      return

    }

    setShowForm(false)

    resetForm()

  }


  /* ============================================================
     SAVE / UPDATE INVOICE
     ============================================================ */

  async function handleSubmit(e) {

    e.preventDefault()

    setError('')


    if (!companyId) {

      setError(
        'Company ID nahi mila.'
      )

      return

    }


    if (!customerId) {

      setError(
        'Customer select karein.'
      )

      return

    }


    if (!invoiceDate) {

      setError(
        'Invoice date select karein.'
      )

      return

    }


    if (items.length === 0) {

      setError(
        'Kam az kam aik product add karein.'
      )

      return

    }


    const customer =
      customers?.find(
        c =>
          c.id === customerId
      )


    if (!customer) {

      setError(
        'Customer nahi mila.'
      )

      return

    }


    const finalDiscount =
      Math.min(
        Math.max(
          Number(discount) || 0,
          0
        ),
        total
      )


    const finalSubTotal =
      Math.max(
        0,
        total - finalDiscount
      )


    const finalProductDiscountShare =
      total > 0
        ? (productTotal / total) * finalDiscount
        : 0

    const finalServiceDiscountShare =
      total > 0
        ? (serviceTotal / total) * finalDiscount
        : 0

    const finalProductSubTotal =
      Math.max(
        0,
        productTotal - finalProductDiscountShare
      )

    const finalServiceSubTotal =
      Math.max(
        0,
        serviceTotal - finalServiceDiscountShare
      )

    const finalProductGstRate =
      isGstCompany
        ? Math.max(0, Number(productGstRate) || 0)
        : 0

    const finalServiceGstRate =
      isGstCompany
        ? Math.max(0, Number(serviceGstRate) || 0)
        : 0

    const finalProductGstAmount =
      isGstCompany
        ? (finalProductSubTotal * finalProductGstRate / 100)
        : 0

    const finalServiceGstAmount =
      isGstCompany
        ? (finalServiceSubTotal * finalServiceGstRate / 100)
        : 0

    const finalGstAmount =
      finalProductGstAmount +
      finalServiceGstAmount

    const finalNetTotal =
      isGstCompany
        ? Math.max(0, finalSubTotal + finalGstAmount)
        : finalSubTotal


    setSaving(true)


    try {

      let finalInvoiceNumber =
        invoiceNumber


      if (!editingInvoice) {

        await incrementInvoiceCounter(
          companyId
        )


        if (
          !finalInvoiceNumber ||
          finalInvoiceNumber.trim() === ''
        ) {

          const dateStr =
            getTodayDateString()

          const timestamp =
            Date.now()
              .toString()
              .slice(-6)


          finalInvoiceNumber =
            `INV-${dateStr}-${timestamp}`


          setInvoiceNumber(
            finalInvoiceNumber
          )

        }

      }


      const commonInvoicePayload = {

        invoiceNumber:
          finalInvoiceNumber,

        date:
          invoiceDate,

        poNumber:
          poNumber || '',

        poDate:
          poDate || '',

        customerId:
          customerId,

        customerName:
          customer.name || '',

        customerCompany:
          customer.company || '',

        customerPhone:
          customer.phone || '',

        customerAddress:
          customer.address || '',

        companyName,
        companyLogo,
        companyAddress,
        companyPhone,
        companyEmail,
        companyNTN,
        companySTRN,

        isGstInvoice:
          isGstCompany,

        gstNumber:
          isGstCompany
            ? gstNumber.trim()
            : '',

        productGstRate:
          finalProductGstRate,

        serviceGstRate:
          finalServiceGstRate,

        gstRate:
          finalProductGstRate,

        productSubTotal:
          finalProductSubTotal,

        serviceSubTotal:
          finalServiceSubTotal,

        productGstAmount:
          finalProductGstAmount,

        serviceGstAmount:
          finalServiceGstAmount,

        gstAmount:
          finalGstAmount,

        subTotal:
          finalSubTotal,

        items:
          items,

        total:
          total,

        discount:
          finalDiscount,

        netTotal:
          finalNetTotal,

        termsAndConditions:
          termsAndConditions.trim()

      }


      if (editingInvoice) {

        const invoiceRef =
          ref(
            db,
            `companies/${companyId}/invoices/${editingInvoice.id}`
          )


        const updatedInvoice = {
          ...commonInvoicePayload,
          updatedAt: Date.now()
        }


        await update(
          invoiceRef,
          updatedInvoice
        )


        setShowForm(false)
        resetForm()


        setPreview({

          id:
            editingInvoice.id,

          ...commonInvoicePayload,

          customer: {

            name:
              commonInvoicePayload.customerName,

            company:
              commonInvoicePayload.customerCompany,

            phone:
              commonInvoicePayload.customerPhone,

            address:
              commonInvoicePayload.customerAddress

          }

        })


        return

      }


      const invoiceData = {
        ...commonInvoicePayload,
        createdAt: Date.now()
      }


      const invoicesRef =
        ref(
          db,
          `companies/${companyId}/invoices`
        )


      const newInvoice =
        await push(
          invoicesRef,
          invoiceData
        )


      setPreview({

        id:
          newInvoice.key,

        ...invoiceData,

        customer: {

          name:
            invoiceData.customerName,

          company:
            invoiceData.customerCompany,

          phone:
            invoiceData.customerPhone,

          address:
            invoiceData.customerAddress

        }

      })


      setShowForm(false)
      resetForm()


    } catch (err) {

      console.error(
        'Invoice save error:',
        err
      )

      setError(
        err?.message ||
        'Invoice save nahi ho saka. Dobara koshish karein.'
      )

    } finally {

      setSaving(false)

    }

  }


  /* ============================================================
     DOWNLOAD / PREVIEW PDF
     ============================================================ */

  function handleDownloadPdf(invoice) {

    const previewInvoice =
      convertInvoiceToPreview(
        invoice
      )

    setPreview(
      previewInvoice
    )

  }


  /* ============================================================
     PAGE
     ============================================================ */

  return (

    <>

      <div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">

          <div>

            <h1 className="font-display text-2xl font-semibold text-ink">
              Invoice
              {isGstCompany && (
                <span className="ml-2 text-xs font-medium text-teal-dark bg-teal-light px-2.5 py-1 rounded-full align-middle">
                  GST
                </span>
              )}
            </h1>

            <p className="text-sm text-slateink mt-0.5">
              {isGstCompany
                ? 'Create a GST invoice — separate GST for products and services.'
                : 'Enter the product name, quantity, and price to create an invoice.'}
            </p>

          </div>


          <button
            onClick={openNewInvoice}
            className="flex items-center gap-2 rounded-lg bg-ink text-white text-sm font-medium px-4 py-2.5 hover:bg-inkSoft transition-colors self-start"
          >

            <Plus size={16} />

            New Invoice

          </button>

        </div>


        <div className="mb-6 flex flex-col sm:flex-row gap-4">

          <div className="flex-1">

            <div className="relative max-w-md">

              <input
                type="text"
                value={searchTerm}
                onChange={(e) =>
                  setSearchTerm(e.target.value)
                }
                className="input w-full pl-9 pr-4"
                placeholder="Search by invoice #, customer, company, date..."
              />

              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slateink hover:text-ink"
                >
                  <X size={14} />
                </button>
              )}

            </div>

            <p className="text-xs text-slateink mt-1">
              Search by invoice number, customer name, company name, or date
            </p>

          </div>

          <div className="flex items-start gap-2">

            <div className="flex items-center gap-2">

              <ArrowUpDown size={14} className="text-slateink mt-1" />

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input text-sm py-2 pr-8 min-w-[190px]"
              >
                <option value="date-desc">Date (Newest First)</option>
                <option value="date-asc">Date (Oldest First)</option>
                <option value="amount-desc">Amount (High to Low)</option>
                <option value="amount-asc">Amount (Low to High)</option>
              </select>

            </div>

          </div>

        </div>


        {invoices === null ? (

          <Loader />

        ) : filteredInvoices.length === 0 ? (

          <div className="border border-dashed border-line rounded-2xl py-16 flex flex-col items-center justify-center text-center">

            <Receipt
              className="text-slateink mb-3"
              size={28}
            />

            <p className="font-medium text-ink">
              {searchTerm
                ? 'No matching invoices found'
                : 'No Invoice has been created yet.'}
            </p>

            {searchTerm && (
              <p className="text-sm text-slateink mt-1">
                Try searching with different keywords
              </p>
            )}

          </div>

        ) : (

          <div className="bg-surface rounded-2xl border border-line shadow-card overflow-hidden">

            <div className="overflow-x-auto">

              <table className="w-full text-sm">

                <thead>

                  <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-slateink">

                    <th className="px-4 py-3 font-medium">
                      Invoice #
                    </th>

                    <th className="px-4 py-3 font-medium">
                      Customer
                    </th>

                    <th className="px-4 py-3 font-medium">
                      Total
                    </th>

                    <th className="px-4 py-3 font-medium">
                      Date
                    </th>

                    <th className="px-4 py-3 font-medium text-right">
                      Action
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {filteredInvoices.map(
                    invoice => {

                      const display = getCustomerDisplayInfo(invoice)

                      return (

                        <tr
                          key={invoice.id}
                          className="border-b border-line last:border-0 hover:bg-paper/60"
                        >

                          <td className="px-4 py-3 font-mono text-xs">
                            {invoice.invoiceNumber}
                            {invoice.isGstInvoice && (
                              <span className="ml-2 text-[10px] font-medium text-teal-dark bg-teal-light px-1.5 py-0.5 rounded">
                                GST
                              </span>
                            )}
                          </td>


                          <td className="px-4 py-3">

                            <p className="font-medium text-ink">
                              {display.primary}
                            </p>

                            {display.secondary && (
                              <p className="text-xs text-slateink">
                                {display.secondary}
                              </p>
                            )}

                          </td>


                          <td className="px-4 py-3 font-medium text-ink">

                            Rs{' '}

                            {currency(
                              invoice.netTotal !== undefined
                                ? invoice.netTotal
                                : Math.max(
                                    0,
                                    Number(invoice.total || 0) -
                                    Number(invoice.discount || 0)
                                  )
                            )}

                          </td>


                          <td className="px-4 py-3 text-xs font-mono text-slateink">

                            {formatDate(
                              invoice.date
                            )}

                          </td>


                          <td className="px-4 py-3">

                            <div className="flex items-center justify-end gap-2 flex-wrap">

                              <button
                                onClick={() =>
                                  setPreview(
                                    convertInvoiceToPreview(
                                      invoice
                                    )
                                  )
                                }
                                className="text-teal-dark text-xs font-medium hover:underline"
                              >

                                View

                              </button>


                              <button
                                onClick={() =>
                                  openEditInvoice(
                                    invoice
                                  )
                                }
                                className="inline-flex items-center gap-1.5 text-xs font-medium text-ink hover:text-teal-dark"
                              >

                                <Pencil size={13} />

                                Edit

                              </button>


                              <button
                                onClick={() =>
                                  handleDownloadPdf(
                                    invoice
                                  )
                                }
                                className="inline-flex items-center gap-1.5 text-xs font-medium text-red-600 hover:text-red-800"
                              >

                                <Download size={13} />

                                PDF

                              </button>


                              <button
                                onClick={() =>
                                  setDeleteConfirm(
                                    invoice
                                  )
                                }
                                className="inline-flex items-center gap-1.5 text-xs font-medium text-coral hover:text-red-700"
                              >

                                <Trash2 size={13} />

                                Delete

                              </button>

                            </div>

                          </td>

                        </tr>

                      )
                    }
                  )}

                </tbody>

              </table>

            </div>

          </div>

        )}


        {showForm && (

          <Modal
            title={
              editingInvoice
                ? `Edit Invoice ${editingInvoice.invoiceNumber}`
                : (isGstCompany ? 'New GST Invoice' : 'New Invoice')
            }
            onClose={closeForm}
            wide
          >

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <label className="block">

                  <span className="text-xs font-medium text-slateink">
                    Invoice Number *
                  </span>

                  <input
                    type="text"
                    value={invoiceNumber}
                    onChange={(e) =>
                      setInvoiceNumber(
                        e.target.value
                      )
                    }
                    className="input mt-1"
                    placeholder="INV-YYYYMMDD-0001"
                    required
                  />

                  <small className="text-xs text-slateink mt-1 block">
                    Format: INV-YYYYMMDD-0001 (Auto-generated)
                  </small>

                </label>


                <label className="block">

                  <span className="text-xs font-medium text-slateink">
                    Invoice Date *
                  </span>

                  <input
                    type="date"
                    value={invoiceDate}
                    onChange={(e) =>
                      setInvoiceDate(
                        e.target.value
                      )
                    }
                    className="input mt-1"
                    required
                  />

                </label>

              </div>


              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <label className="block">

                  <span className="text-xs font-medium text-slateink">
                    Customer *
                  </span>

                  <div className="relative mt-1">

                    <input
                      type="text"
                      value={customerSearch}
                      onChange={(e) => {
                        const value = e.target.value
                        setCustomerSearch(value)

                        if (customerId) {
                          setCustomerId('')
                        }

                        setShowCustomerDropdown(true)
                      }}
                      onFocus={() =>
                        setShowCustomerDropdown(true)
                      }
                      className="input w-full pr-10"
                      placeholder="Search customer by name, company, phone..."
                      autoComplete="off"
                      required={!customerId}
                    />

                    {customerSearch && (
                      <button
                        type="button"
                        onClick={() => {
                          setCustomerId('')
                          setCustomerSearch('')
                          setShowCustomerDropdown(true)
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slateink hover:text-ink"
                        aria-label="Clear customer"
                      >
                        <X size={16} />
                      </button>
                    )}

                    {showCustomerDropdown && (
                      <div className="absolute z-[100] left-0 right-0 mt-1 max-h-64 overflow-y-auto rounded-lg border border-line bg-white shadow-lg">
                        {filteredCustomers.length === 0 ? (
                          <div className="px-3 py-3 text-sm text-slateink">
                            No customer found.
                          </div>
                        ) : (
                          filteredCustomers.map(customer => {

                            const name = String(customer.name || '').trim()
                            const company = String(customer.company || '').trim()

                            return (

                              <button
                                key={customer.id}
                                type="button"
                                onClick={() => selectCustomer(customer)}
                                className={`w-full text-left px-3 py-2.5 hover:bg-paper transition-colors border-b border-line last:border-b-0 ${customer.id === customerId ? 'bg-paper' : ''}`}
                              >

                                {name ? (
                                  <>
                                    <p className="text-sm font-medium text-ink">
                                      {name}
                                    </p>
                                    {company && (
                                      <p className="text-xs text-slateink mt-0.5">
                                        {company}
                                      </p>
                                    )}
                                  </>
                                ) : (
                                  company && (
                                    <p className="text-sm font-medium text-ink">
                                      {company}
                                    </p>
                                  )
                                )}

                                {customer.phone && (
                                  <p className="text-xs text-slateink mt-0.5">
                                    {customer.phone}
                                  </p>
                                )}

                              </button>

                            )
                          })
                        )}
                      </div>
                    )}

                  </div>

                </label>

              </div>


              {isGstCompany && (

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border border-teal/30 bg-teal-light/20 rounded-xl p-4">

                  <div className="md:col-span-3">

                    <p className="text-xs font-semibold text-teal-dark mb-1">
                      GST Details (Only for this company)
                    </p>

                    <p className="text-xs text-slateink">
                      Products and Services have separate GST rates.
                    </p>

                  </div>


                  <label className="block">

                    <span className="text-xs font-medium text-slateink">
                      GST / NTN Number
                    </span>

                    <input
                      type="text"
                      value={gstNumber}
                      onChange={(e) =>
                        setGstNumber(e.target.value)
                      }
                      className="input mt-1"
                      placeholder="e.g. 1234567-8"
                    />

                  </label>


                  <label className="block">

                    <span className="text-xs font-medium text-slateink">
                      GST on Products (%)
                    </span>

                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={productGstRate}
                      onChange={(e) =>
                        setProductGstRate(e.target.value)
                      }
                      className="input mt-1"
                      placeholder="17"
                    />

                  </label>


                  <label className="block">

                    <span className="text-xs font-medium text-slateink">
                      GST on Services (%)
                    </span>

                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={serviceGstRate}
                      onChange={(e) =>
                        setServiceGstRate(e.target.value)
                      }
                      className="input mt-1"
                      placeholder="15"
                    />

                  </label>

                </div>

              )}


              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <label className="block">

                  <span className="text-xs font-medium text-slateink">
                    P/Order No.
                  </span>

                  <input
                    type="text"
                    value={poNumber}
                    onChange={(e) =>
                      setPoNumber(
                        e.target.value
                      )
                    }
                    className="input mt-1"
                    placeholder="P/Order No."
                  />

                </label>


                <label className="block">

                  <span className="text-xs font-medium text-slateink">
                    P/Order Date
                  </span>

                  <input
                    type="date"
                    value={poDate}
                    onChange={(e) =>
                      setPoDate(
                        e.target.value
                      )
                    }
                    className="input mt-1"
                  />

                </label>

              </div>


              <div className="border border-line rounded-xl p-4">

                <p className="text-xs font-medium text-slateink mb-3">
                  Add Products / Services
                </p>


                <div className="flex flex-col lg:flex-row gap-2">

                  {isGstCompany && (
                    <select
                      value={pick.type}
                      onChange={(e) =>
                        setPick({
                          ...pick,
                          type: e.target.value
                        })
                      }
                      className="input lg:w-32 shrink-0"
                    >
                      {ITEM_TYPE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  )}

                  {isConfectioneryCompany ? (

                    <div
                      className="relative flex-1 min-w-0"
                      ref={itemDropdownRef}
                    >

                      <input
                        type="text"
                        value={pick.name}
                        onChange={(e) => {
                          setPick({
                            ...pick,
                            name: e.target.value
                          })
                          setShowItemDropdown(true)
                        }}
                        onFocus={() => setShowItemDropdown(true)}
                        className="input w-full pr-10"
                        placeholder="Search or type item name..."
                        autoComplete="off"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowItemDropdown(!showItemDropdown)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slateink hover:text-ink"
                      >
                        <ChevronDown size={16} />
                      </button>

                      {showItemDropdown && (

                        <div className="absolute z-[100] left-0 right-0 mt-1 max-h-64 overflow-y-auto rounded-lg border border-line bg-white shadow-lg">

                          {filteredConfectioneryItems.length === 0 ? (

                            pick.name.trim() ? (

                              <button
                                type="button"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => setShowItemDropdown(false)}
                                className="w-full text-left px-3 py-2.5 hover:bg-teal-light/50 transition-colors text-sm text-teal-dark font-medium"
                              >
                                + "{pick.name.trim()}" will be added as a new item when you press Add
                              </button>

                            ) : (

                              <div className="px-3 py-3 text-sm text-slateink">
                                Type to search item...
                              </div>

                            )

                          ) : (

                            filteredConfectioneryItems.map((it) => (

                              <button
                                key={it.id}
                                type="button"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() =>
                                  selectConfectioneryItem(it.name)
                                }
                                className="w-full text-left px-3 py-2.5 hover:bg-paper transition-colors border-b border-line last:border-b-0 text-sm text-ink"
                              >
                                {it.name}
                              </button>

                            ))

                          )}

                        </div>

                      )}

                    </div>

                  ) : (

                    <input
                      value={pick.name}
                      onChange={(e) =>
                        setPick({
                          ...pick,
                          name:
                            e.target.value
                        })
                      }
                      className="input flex-1 min-w-0"
                      placeholder="Item name / model / service"
                    />

                  )}

                  <input
                    type="text"
                    value={pick.unit}
                    onChange={(e) =>
                      setPick({
                        ...pick,
                        unit:
                          e.target.value
                      })
                    }
                    className="input lg:w-16 shrink-0"
                    placeholder="Unit"
                  />

                  <input
                    type="number"
                    min={1}
                    value={pick.qty}
                    onChange={(e) =>
                      setPick({
                        ...pick,
                        qty:
                          e.target.value
                      })
                    }
                    className="input lg:w-16 shrink-0"
                    placeholder="Qty"
                  />


                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={pick.price}
                    onChange={(e) =>
                      setPick({
                        ...pick,
                        price:
                          e.target.value
                      })
                    }
                    className="input lg:w-28 shrink-0"
                    placeholder="Unit Price"
                  />


                  <button
                    type="button"
                    onClick={addItem}
                    disabled={!pick.name.trim()}
                    className="rounded-lg bg-teal text-white text-sm font-medium px-4 py-2.5 hover:bg-teal-dark disabled:opacity-50 shrink-0"
                  >

                    Add

                  </button>

                </div>


                {items.length > 0 && (

                  <div className="mt-4 space-y-2">

                    {items.map(
                      (
                        item,
                        index
                      ) => {

                        const itemType =
                          item.type || ITEM_TYPE_PRODUCT

                        const typeLabel =
                          getItemTypeLabel(itemType)

                        const typeBadgeClass =
                          itemType === ITEM_TYPE_PRODUCT
                            ? 'bg-blue-100 text-blue-700'
                            : itemType === ITEM_TYPE_SERVICE
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-amber-light text-amber'

                        return (

                          <div
                            key={index}
                            className="flex items-center justify-between bg-paper rounded-lg px-3 py-2 text-sm"
                          >

                            <div>

                              {isGstCompany && (
                                <span
                                  className={`text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded mr-2 ${typeBadgeClass}`}
                                >
                                  {typeLabel}
                                </span>
                              )}

                              <span className="font-medium text-ink">
                                {item.name}
                              </span>

                              <span className="text-xs text-slateink ml-2">
                                {item.unit || 'PCS'} x{item.qty}
                              </span>

                              <span className="text-xs text-slateink ml-2">
                                @ Rs{' '}
                                {currency(
                                  item.price
                                )}
                              </span>

                            </div>


                            <div className="flex items-center gap-2">

                              <button
                                type="button"
                                onClick={() =>
                                  openEditProduct(
                                    index
                                  )
                                }
                                className="text-blue-600 hover:text-blue-800"
                              >

                                <Pencil size={15} />

                              </button>


                              <button
                                type="button"
                                onClick={() =>
                                  removeItem(
                                    index
                                  )
                                }
                                className="text-coral hover:text-red-700"
                              >

                                <Trash2 size={15} />

                              </button>

                            </div>

                          </div>

                        )

                      }
                    )}


                    <div className="flex justify-end pt-3">

                      <div className="w-full sm:w-72">

                        <div className="flex justify-between py-1">

                          <span className="text-xs text-slateink">
                            Total
                          </span>

                          <span className="text-sm font-semibold text-ink">
                            Rs {currency(total)}
                          </span>

                        </div>


                        <div className="flex justify-between py-1">

                          <span className="text-xs text-slateink">
                            Discount
                          </span>

                          <span className="text-sm font-semibold text-red-600">
                            Rs {currency(discountValue)}
                          </span>

                        </div>


                        {isGstCompany && productTotal > 0 && (

                          <div className="flex justify-between py-1">

                            <span className="text-xs text-slateink">
                              GST on Products ({productGstRate}%)
                            </span>

                            <span className="text-sm font-semibold text-ink">
                              Rs {currency(productGstAmount)}
                            </span>

                          </div>

                        )}


                        {isGstCompany && serviceTotal > 0 && (

                          <div className="flex justify-between py-1">

                            <span className="text-xs text-slateink">
                              GST on Services ({serviceGstRate}%)
                            </span>

                            <span className="text-sm font-semibold text-ink">
                              Rs {currency(serviceGstAmount)}
                            </span>

                          </div>

                        )}


                        <div className="border-t border-line mt-1 pt-2 flex justify-between">

                          <span className="text-sm font-bold text-ink">
                            Net Total
                          </span>

                          <span className="text-lg font-bold text-ink">
                            Rs {currency(netTotal)}
                          </span>

                        </div>

                      </div>

                    </div>

                  </div>

                )}

              </div>


              <div className="border border-line rounded-xl p-4">

                <label className="block max-w-sm ml-auto">

                  <span className="text-xs font-medium text-slateink">
                    Discount
                  </span>

                  <div className="relative mt-1">

                    <input
                      type="number"
                      min={0}
                      max={total}
                      step="0.01"
                      value={discount}
                      onChange={(e) =>
                        setDiscount(
                          e.target.value
                        )
                      }
                      className="input pl-9 w-full"
                      placeholder="0"
                    />

                  </div>

                  <small className="text-xs text-slateink mt-1 block">
                    Discount minus from total price. Split automatically between products & services.
                  </small>

                </label>

              </div>


              <div className="border border-line rounded-xl p-4">

                <label className="block">

                  <span className="text-xs font-medium text-slateink">
                    Terms & Conditions
                  </span>

                  <textarea
                    value={termsAndConditions}
                    onChange={(e) =>
                      setTermsAndConditions(
                        e.target.value
                      )
                    }
                    rows={5}
                    className="input mt-1 w-full resize-y"
                    placeholder={`Example:
1. Payment must be made within 30 days.
2. Goods once sold cannot be returned.
3. Prices are exclusive of applicable taxes.`}
                  />

                  <small className="text-xs text-slateink mt-1 block">
                    Enter each term on a new line.
                  </small>

                </label>

              </div>


              {error && (

                <p className="text-xs font-medium text-coral bg-coral-light rounded-lg px-3 py-2">
                  {error}
                </p>

              )}


              <button
                type="submit"
                disabled={
                  saving ||
                  !customerId ||
                  !invoiceDate ||
                  items.length === 0
                }
                className="w-full rounded-lg bg-ink text-white text-sm font-medium py-2.5 hover:bg-inkSoft transition-colors disabled:opacity-60"
              >

                {saving
                  ? editingInvoice
                    ? 'Updating…'
                    : 'Saving…'
                  : editingInvoice
                    ? 'Update Invoice'
                    : (isGstCompany
                        ? 'Generate GST Invoice'
                        : 'Generate Invoice')}

              </button>

            </form>

          </Modal>

        )}

      </div>


      {preview && (

        <InvoicePreview
          invoice={preview}
          onClose={() =>
            setPreview(null)
          }
        />

      )}


      {deleteConfirm && (

        <div className="fixed inset-0 z-[99999] bg-black/60 flex items-center justify-center p-4">

          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">

            <div className="flex items-center justify-between mb-4">

              <h3 className="text-lg font-semibold text-ink">
                Delete Invoice
              </h3>

              <button
                onClick={() =>
                  setDeleteConfirm(null)
                }
                className="text-slateink hover:text-ink"
              >

                <X size={20} />

              </button>

            </div>


            <div className="space-y-4">

              <p className="text-sm text-ink">
                Are you sure to delete this invoice?
              </p>


              <div className="bg-paper rounded-lg p-3 text-sm">

                <p className="font-medium text-ink">
                  {deleteConfirm.invoiceNumber}
                </p>

                <p className="text-slateink text-xs">
                  {deleteConfirm.customerName || deleteConfirm.customerCompany || '-'}
                </p>


                <p className="text-slateink text-xs">
                  Total: Rs{' '}
                  {currency(
                    deleteConfirm.total || 0
                  )}
                </p>


                <p className="text-red-600 text-xs">
                  Discount: Rs{' '}
                  {currency(
                    deleteConfirm.discount || 0
                  )}
                </p>


                <p className="font-semibold text-ink text-xs">
                  Net Total: Rs{' '}
                  {currency(
                    deleteConfirm.netTotal !== undefined
                      ? deleteConfirm.netTotal
                      : Math.max(
                          0,
                          Number(deleteConfirm.total || 0) -
                          Number(deleteConfirm.discount || 0)
                        )
                  )}
                </p>

              </div>


              <div className="flex gap-3">

                <button
                  onClick={() =>
                    setDeleteConfirm(null)
                  }
                  className="flex-1 rounded-lg border border-line text-ink text-sm font-medium py-2.5 hover:bg-paper transition-colors"
                >
                  Cancel
                </button>


                <button
                  onClick={handleDeleteInvoice}
                  disabled={deleting}
                  className="flex-1 rounded-lg bg-coral text-white text-sm font-medium py-2.5 hover:bg-red-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >

                  {deleting ? (

                    'Deleting…'

                  ) : (

                    <>

                      <Trash2 size={16} />

                      Delete

                    </>

                  )}

                </button>

              </div>

            </div>

          </div>

        </div>

      )}


      {editingProductIndex !== null && (

        <div className="fixed inset-0 z-[99999] bg-black/60 flex items-center justify-center p-4">

          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">

            <div className="flex items-center justify-between mb-4">

              <h3 className="text-lg font-semibold text-ink">
                Edit Item
              </h3>

              <button
                onClick={closeEditProduct}
                className="text-slateink hover:text-ink"
              >

                <X size={20} />

              </button>

            </div>


            <div className="space-y-3">

              {isGstCompany && (
                <div>

                  <label className="text-xs font-medium text-slateink">
                    Type
                  </label>

                  <select
                    value={editProduct.type}
                    onChange={(e) =>
                      setEditProduct({
                        ...editProduct,
                        type: e.target.value
                      })
                    }
                    className="input mt-1 w-full"
                  >
                    {ITEM_TYPE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>

                </div>
              )}


              <div>

                <label className="text-xs font-medium text-slateink">
                  Name
                </label>

                <input
                  type="text"
                  value={editProduct.name}
                  onChange={(e) =>
                    setEditProduct({
                      ...editProduct,
                      name:
                        e.target.value
                    })
                  }
                  className="input mt-1 w-full"
                  placeholder="Product / service name"
                />

              </div>

              <div>

                <label className="text-xs font-medium text-slateink">
                  Unit
                </label>

                <input
                  type="text"
                  value={editProduct.unit}
                  onChange={(e) =>
                    setEditProduct({
                      ...editProduct,
                      unit:
                        e.target.value
                    })
                  }
                  className="input mt-1 w-full"
                  placeholder="PCS, KG, MTR, etc."
                />

              </div>


              <div className="grid grid-cols-2 gap-3">

                <div>

                  <label className="text-xs font-medium text-slateink">
                    Quantity
                  </label>

                  <input
                    type="number"
                    min={1}
                    value={editProduct.qty}
                    onChange={(e) =>
                      setEditProduct({
                        ...editProduct,
                        qty:
                          Number(
                            e.target.value
                          ) || 1
                      })
                    }
                    className="input mt-1 w-full"
                  />

                </div>


                <div>

                  <label className="text-xs font-medium text-slateink">
                    Unit Price
                  </label>

                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={editProduct.price}
                    onChange={(e) =>
                      setEditProduct({
                        ...editProduct,
                        price:
                          Number(
                            e.target.value
                          ) || 0
                      })
                    }
                    className="input mt-1 w-full"
                  />

                </div>

              </div>


              <button
                type="button"
                onClick={saveEditProduct}
                disabled={
                  !editProduct.name.trim()
                }
                className="w-full rounded-lg bg-blue-600 text-white text-sm font-medium py-2.5 hover:bg-blue-700 transition-colors disabled:opacity-50 mt-2 flex items-center justify-center gap-2"
              >

                <Save size={16} />

                Save Item

              </button>

            </div>

          </div>

        </div>

      )}

    </>

  )

}


/* ================================================================
   CONVERT FIREBASE INVOICE TO PREVIEW
   ================================================================ */

function convertInvoiceToPreview(invoice) {

  const total =
    Number(
      invoice.total || 0
    )


  const discount =
    Math.min(
      Math.max(
        Number(
          invoice.discount || 0
        ),
        0
      ),
      total
    )


  const subTotal =
    invoice.subTotal !== undefined &&
    invoice.subTotal !== null
      ? Number(invoice.subTotal)
      : Math.max(0, total - discount)


  const isGstInvoice =
    invoice.isGstInvoice === true


  const items =
    Array.isArray(invoice.items)
      ? invoice.items
      : []

  let productTotal = 0
  let serviceTotal = 0

  items.forEach((item) => {
    const type = item.type || 'product'
    const qty = Number(item.qty) || 0
    const price = Number(item.price) || 0
    const amount = qty * price

    if (type === 'product') productTotal += amount
    else serviceTotal += amount
  })

  const productDiscountShare =
    total > 0 ? (productTotal / total) * discount : 0

  const serviceDiscountShare =
    total > 0 ? (serviceTotal / total) * discount : 0

  const productSubTotal =
    invoice.productSubTotal !== undefined &&
    invoice.productSubTotal !== null
      ? Number(invoice.productSubTotal)
      : Math.max(0, productTotal - productDiscountShare)

  const serviceSubTotal =
    invoice.serviceSubTotal !== undefined &&
    invoice.serviceSubTotal !== null
      ? Number(invoice.serviceSubTotal)
      : Math.max(0, serviceTotal - serviceDiscountShare)

  const productGstRate =
    isGstInvoice
      ? (
          invoice.productGstRate !== undefined
            ? Math.max(0, Number(invoice.productGstRate) || 0)
            : (invoice.gstRate !== undefined
                ? Math.max(0, Number(invoice.gstRate) || 0)
                : 0)
        )
      : 0

  const serviceGstRate =
    isGstInvoice
      ? (
          invoice.serviceGstRate !== undefined
            ? Math.max(0, Number(invoice.serviceGstRate) || 0)
            : 0
        )
      : 0

  const productGstAmount =
    isGstInvoice
      ? (
          invoice.productGstAmount !== undefined &&
          invoice.productGstAmount !== null
            ? Number(invoice.productGstAmount)
            : (productSubTotal * productGstRate / 100)
        )
      : 0

  const serviceGstAmount =
    isGstInvoice
      ? (
          invoice.serviceGstAmount !== undefined &&
          invoice.serviceGstAmount !== null
            ? Number(invoice.serviceGstAmount)
            : (serviceSubTotal * serviceGstRate / 100)
        )
      : 0

  const gstAmount =
    isGstInvoice
      ? (
          invoice.gstAmount !== undefined &&
          invoice.gstAmount !== null
            ? Number(invoice.gstAmount)
            : (productGstAmount + serviceGstAmount)
        )
      : 0

  const netTotal =
    invoice.netTotal !== undefined &&
    invoice.netTotal !== null
      ? Number(invoice.netTotal)
      : (isGstInvoice
          ? subTotal + gstAmount
          : subTotal)


  return {

    id:
      invoice.id,

    invoiceNumber:
      invoice.invoiceNumber,

    date:
      invoice.date,

    poNumber:
      invoice.poNumber || '',

    poDate:
      invoice.poDate || '',

    items:
      items,

    total:
      total,

    discount:
      discount,

    subTotal:
      subTotal,

    productTotal:
      productTotal,

    serviceTotal:
      serviceTotal,

    productSubTotal:
      productSubTotal,

    serviceSubTotal:
      serviceSubTotal,

    isGstInvoice:
      isGstInvoice,

    gstNumber:
      invoice.gstNumber || '',

    productGstRate:
      productGstRate,

    serviceGstRate:
      serviceGstRate,

    productGstAmount:
      productGstAmount,

    serviceGstAmount:
      serviceGstAmount,

    gstRate:
      productGstRate,

    gstAmount:
      gstAmount,

    netTotal:
      netTotal,

    termsAndConditions:
      invoice.termsAndConditions || '',

    companyName:
      invoice.companyName ||
      FALLBACK_COMPANY_NAME,

    companyLogo:
      invoice.companyLogo ||
      FALLBACK_COMPANY_LOGO,

    companyAddress:
      invoice.companyAddress ||
      FALLBACK_COMPANY_ADDRESS,

    companyPhone:
      invoice.companyPhone ||
      FALLBACK_COMPANY_PHONE,

    companyEmail:
      invoice.companyEmail || '',

    companyNTN:
      invoice.companyNTN ||
      FALLBACK_COMPANY_NTN,

    companySTRN:
      invoice.companySTRN ||
      FALLBACK_COMPANY_STRN,

    customer: {

      name:
        invoice.customerName || '',

      company:
        invoice.customerCompany || '',

      phone:
        invoice.customerPhone || '',

      address:
        invoice.customerAddress || ''

    }

  }

}


/* ================================================================
   INVOICE PREVIEW
   ================================================================ */

function InvoicePreview({
  invoice,
  onClose
}) {

  const { company } = useAuth()


  function printInvoice() {
    window.print()
  }


  const total =
    Number(
      invoice.total || 0
    )


  const discount =
    Math.min(
      Math.max(
        Number(
          invoice.discount || 0
        ),
        0
      ),
      total
    )


  const subTotal =
    invoice.subTotal !== undefined &&
    invoice.subTotal !== null
      ? Number(invoice.subTotal)
      : Math.max(0, total - discount)


  const isGstInvoice =
    invoice.isGstInvoice === true


  const productTotal =
    Number(invoice.productTotal || 0)

  const serviceTotal =
    Number(invoice.serviceTotal || 0)

  const productGstRate =
    Number(invoice.productGstRate || 0)

  const serviceGstRate =
    Number(invoice.serviceGstRate || 0)

  const productGstAmount =
    Number(invoice.productGstAmount || 0)

  const serviceGstAmount =
    Number(invoice.serviceGstAmount || 0)

  const gstAmount =
    Number(
      invoice.gstAmount !== undefined
        ? invoice.gstAmount
        : (productGstAmount + serviceGstAmount)
    )

  const netTotal =
    invoice.netTotal !== undefined &&
    invoice.netTotal !== null
      ? Number(invoice.netTotal)
      : (isGstInvoice
          ? subTotal + gstAmount
          : subTotal)


  const customerName = String(invoice.customer?.name || '').trim()
  const customerCompany = String(invoice.customer?.company || '').trim()

  const customerDisplayName = customerName || customerCompany || ''
  const showCompanySeparately = customerName && customerCompany


  const companyName =
    invoice.companyName ||
    company?.name ||
    FALLBACK_COMPANY_NAME

  const companyLogo =
    invoice.companyLogo ||
    company?.logoUrl ||
    FALLBACK_COMPANY_LOGO

  const companyAddress =
    invoice.companyAddress ||
    company?.address ||
    FALLBACK_COMPANY_ADDRESS

  const companyPhone =
    invoice.companyPhone ||
    company?.phone ||
    FALLBACK_COMPANY_PHONE

  const companyEmail =
    invoice.companyEmail ||
    company?.email ||
    ''

  const companyNTN =
    invoice.companyNTN ||
    company?.ntn ||
    FALLBACK_COMPANY_NTN

  const companySTRN =
    invoice.companySTRN ||
    company?.strn ||
    FALLBACK_COMPANY_STRN


  return (

    <div className="invoice-preview-overlay fixed inset-0 z-[9999] bg-black/60 overflow-y-auto p-4 sm:p-8">


      <div className="invoice-preview-controls max-w-[900px] mx-auto mb-4 flex items-center justify-between">

        <div>

          <p className="text-white font-semibold text-sm">
            {isGstInvoice ? 'GST Invoice Preview' : 'Invoice Preview'}
          </p>

          <p className="text-white/70 text-xs">
            {invoice.invoiceNumber}
          </p>

        </div>


        <div className="flex items-center gap-2">

          <button
            onClick={printInvoice}
            className="inline-flex items-center gap-2 rounded-lg bg-white text-ink px-4 py-2 text-sm font-medium hover:bg-gray-100"
          >

            <Printer size={16} />

            Print / Save as PDF

          </button>


          <button
            onClick={onClose}
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-white/10 text-white hover:bg-white/20"
          >

            <X size={18} />

          </button>

        </div>

      </div>


      <div
        className="invoice-print-area"
        id="invoice-print-area"
      >

        <div className="invoice-sheet">


          <div className="invoice-header">


            <div className="invoice-company">

              <img
                src={companyLogo}
                alt={companyName || 'Company Logo'}
                className="invoice-logo"
                onError={(e) => {
                  if (e.currentTarget.src !== window.location.origin + FALLBACK_COMPANY_LOGO) {
                    e.currentTarget.src = FALLBACK_COMPANY_LOGO
                  }
                }}
              />

              <div className="invoice-company-address">
                {companyAddress}
              </div>


              {companyPhone && (
                <div className="invoice-company-address">
                  {companyPhone}
                </div>
              )}


              {companyEmail && (
                <div className="invoice-company-address">
                  {companyEmail}
                </div>
              )}

            </div>


            <div className="invoice-right-header">

              <div className="invoice-tax-box">

                <div>
                  NTN # {companyNTN}
                </div>

                <div>
                  STRN # {companySTRN}
                </div>


                {isGstInvoice && invoice.gstNumber && (
                  <div>
                    GST # {invoice.gstNumber}
                  </div>
                )}


                <div className="invoice-title">
                  {isGstInvoice ? 'GST INVOICE' : 'INVOICE'}
                </div>

              </div>


              <div className="invoice-meta-box">

                <div className="invoice-meta-title">
                  Invoice No.
                </div>


                <div className="invoice-number">
                  {invoice.invoiceNumber}
                </div>


                <div className="invoice-meta-row">

                  <span>
                    Date:
                  </span>

                  <span>
                    {formatInvoiceDate(invoice.date)}
                  </span>

                </div>


                <div className="invoice-meta-row">

                  <span>
                    P/Order No.
                  </span>

                  <span>
                    {invoice.poNumber || ''}
                  </span>

                </div>


                <div className="invoice-meta-row">

                  <span>
                    P/Order Date
                  </span>

                  <span>
                    {invoice.poDate
                      ? formatInvoiceDate(invoice.poDate)
                      : ''}
                  </span>

                </div>

              </div>

            </div>

          </div>


          <div className="invoice-buyer-box">

            <div className="invoice-buyer-title">
              Buyer's Name & Address
            </div>


            <div className="invoice-buyer-content">

              {customerDisplayName && (
                <div className="invoice-buyer-name">
                  {customerDisplayName}
                </div>
              )}

              {showCompanySeparately && (
                <div>
                  {customerCompany}
                </div>
              )}


              {invoice.customer?.address && (
                <div>
                  {invoice.customer.address}
                </div>
              )}


              {invoice.customer?.phone && (
                <div>
                  {invoice.customer.phone}
                </div>
              )}

            </div>

          </div>


          <table className={`invoice-table ${isGstInvoice ? 'with-type' : 'without-type'}`}>

            <colgroup>

              {isGstInvoice && (
                <col className="type-col" />
              )}

              <col className="qty-col" />
              <col className="unit-col" />
              <col className="description-col" />
              <col className="price-col" />
              <col className="amount-col" />

            </colgroup>


            <thead>

              <tr>

                {isGstInvoice && (
                  <th>
                    Type
                  </th>
                )}

                <th>
                  Quantity
                </th>

                <th>
                  Unit
                </th>

                <th>
                  Description Of Goods
                </th>

                <th>
                  Unit Price
                </th>

                <th>
                  Amount
                </th>

              </tr>

            </thead>


            <tbody>

              {(invoice.items || []).map(
                (
                  item,
                  index
                ) => {

                  const qty =
                    Number(item.qty || 0)

                  const price =
                    Number(item.price || 0)

                  const amount =
                    qty * price

                  const itemType =
                    item.type || ITEM_TYPE_PRODUCT

                  const typeLabel =
                    getItemTypeLabel(itemType)


                  return (

                    <tr key={index}>

                      {isGstInvoice && (
                        <td className="type-cell">
                          {typeLabel}
                        </td>
                      )}

                      <td className="quantity-cell">
                        {qty}
                      </td>

                      <td className='unit-cell'>
                        {item.unit || 'PCS'}
                      </td>

                      <td className="description-cell">
                        {item.name}
                      </td>

                      <td className="number-cell">
                        {currency(price)}
                      </td>

                      <td className="number-cell">
                        {currency(amount)}
                      </td>

                    </tr>

                  )

                }
              )}


              {Array.from({

                length:
                  Math.max(
                    3,
                    8 -
                      (
                        invoice.items?.length ||
                        0
                      )
                  )

              }).map(
                (
                  _,
                  index
                ) => (

                  <tr
                    key={`empty-${index}`}
                    className="invoice-empty-row"
                  >

                    {isGstInvoice && (
                      <td></td>
                    )}

                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>

                  </tr>

                )
              )}

            </tbody>

          </table>


          <div className="invoice-total-wrapper">

            <div className="invoice-total-row">

              <div className="invoice-total-label">
                Total
              </div>

              <div className="invoice-total-value">
                PKR: {currency(total)}
              </div>

            </div>


            <div className="invoice-total-row">

              <div className="invoice-total-label">
                Discount
              </div>

              <div className="invoice-total-value">
                PKR: {currency(discount)}
              </div>

            </div>


            {isGstInvoice && productTotal > 0 && (

              <div className="invoice-total-row">

                <div className="invoice-total-label">
                  GST on Products ({productGstRate}%)
                </div>

                <div className="invoice-total-value">
                  PKR: {currency(productGstAmount)}
                </div>

              </div>

            )}


            {isGstInvoice && serviceTotal > 0 && (

              <div className="invoice-total-row">

                <div className="invoice-total-label">
                  GST on Services ({serviceGstRate}%)
                </div>

                <div className="invoice-total-value">
                  PKR: {currency(serviceGstAmount)}
                </div>

              </div>

            )}


            <div className="invoice-total-row invoice-total-row-final">

              <div className="invoice-total-label">
                Net Total
              </div>

              <div className="invoice-total-value">
                PKR: {currency(netTotal)}
              </div>

            </div>

          </div>


          {invoice.termsAndConditions?.trim() && (

            <div className="invoice-terms-box">

              <div className="invoice-terms-title">
                Terms &amp; Condition
              </div>


              <div className="invoice-terms-content">

                {invoice.termsAndConditions
                  .split(/\r?\n/)
                  .map(
                    (term, index) => {

                      const cleanTerm =
                        term.trim()

                      if (!cleanTerm) {
                        return null
                      }


                      return (

                        <div
                          key={index}
                          className="invoice-term-item"
                        >

                          <span className="invoice-term-number">
                            {index + 1}.
                          </span>

                          <span className="invoice-term-text">
                            {cleanTerm}
                          </span>

                        </div>

                      )

                    }
                  )}

              </div>

            </div>

          )}


          <div className="invoice-footer-note">

            <p>
              {isGstInvoice
                ? 'Note: This is a computer generated GST invoice, does not require any stamp or signature.'
                : 'Note: This is a computer generated invoice, does not require any stamp or signature.'}
            </p>

          </div>


        </div>

      </div>

    </div>

  )

}


/* ================================================================
   DATE FORMAT
   ================================================================ */

function formatInvoiceDate(value) {

  if (!value) {
    return ''
  }


  const date =
    new Date(value)


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value
  }


  const day =
    String(
      date.getDate()
    ).padStart(
      2,
      '0'
    )


  const month =
    String(
      date.getMonth() + 1
    ).padStart(
      2,
      '0'
    )


  const year =
    date.getFullYear()


  return `${day}/${month}/${year}`

}


/* ================================================================
   INVOICE CSS
   ================================================================ */

const invoicePrintStyles = `

/* ============================================================
   INVOICE SHEET
   ============================================================ */

.invoice-sheet {

  width: 210mm;

  min-height: 297mm;

  background: #ffffff;

  margin: 0 auto;

  padding: 15mm 17mm;

  box-sizing: border-box;

  color: #111111;

  font-family:
    Arial,
    Helvetica,
    sans-serif;

}


/* ============================================================
   HEADER
   ============================================================ */

.invoice-header {

  display: flex;

  justify-content: space-between;

  align-items: flex-start;

  min-height: 55mm;

}


.invoice-company {

  width: 53%;

}


.invoice-logo {

  width: 42mm;

  height: 25mm;

  object-fit: contain;

  object-position: left center;

  display: block;

  margin-bottom: 1mm;

}


.invoice-company-address {

  white-space: pre-line;

  font-size: 10px;

  line-height: 1.4;

  padding-top: 0mm;

}


.invoice-right-header {

  width: 40%;

  padding-top: 2mm;

}


.invoice-tax-box {

  border: 1px solid #222;

  padding: 2.5mm 2mm;

  font-size: 10px;

  line-height: 1.5;

}


.invoice-title {

  font-size: 14px;

  font-weight: 700;

  margin-top: 1mm;

}


.invoice-meta-box {

  border: 1px solid #222;

  margin-top: 5mm;

  font-size: 10px;

}


.invoice-meta-title {

  font-weight: 700;

  padding: 1.8mm 2mm 0.5mm;

}


.invoice-number {

  padding: 0 2mm 1.5mm;

  font-size: 10px;

  font-weight: 600;

}


.invoice-meta-row {

  display: grid;

  grid-template-columns: 1fr 1fr;

  border-top: 1px solid #222;

  min-height: 6mm;

}


.invoice-meta-row span {

  padding: 1.1mm 1.5mm;

}


.invoice-meta-row span:first-child {

  border-right: 1px solid #222;

  text-align: right;

}


.invoice-meta-row span:last-child {

  text-align: left;

}


/* ============================================================
   BUYER
   ============================================================ */

.invoice-buyer-box {

  width: 54%;

  border: 1px solid #222;

  margin-bottom: 18mm;

  font-size: 10px;

}


.invoice-buyer-title {

  font-weight: 700;

  background: #f1f1f1;

  border-bottom: 1px solid #222;

  padding: 1.6mm 2mm;

}


.invoice-buyer-content {

  min-height: 8mm;

  padding: 1.6mm 2mm;

  line-height: 1.4;

}


.invoice-buyer-name {

  font-weight: 600;

}


/* ============================================================
   PRODUCT TABLE
   ============================================================ */

.invoice-table {

  width: 100%;

  table-layout: fixed;

  border-collapse: collapse;

  border: 1px solid #222;

  font-size: 10px;

}


/* ============================================================
   WITH TYPE (GST company) — 6 columns
   ============================================================ */

.invoice-table.with-type .type-col {
  width: 12%;
}

.invoice-table.with-type .qty-col {
  width: 11%;
}

.invoice-table.with-type .unit-col {
  width: 9%;
}

.invoice-table.with-type .description-col {
  width: 38%;
}

.invoice-table.with-type .price-col {
  width: 15%;
}

.invoice-table.with-type .amount-col {
  width: 15%;
}


/* ============================================================
   WITHOUT TYPE (Non-GST company) — 5 columns
   ============================================================ */

.invoice-table.without-type .qty-col {
  width: 13%;
}

.invoice-table.without-type .unit-col {
  width: 11%;
}

.invoice-table.without-type .description-col {
  width: 44%;
}

.invoice-table.without-type .price-col {
  width: 16%;
}

.invoice-table.without-type .amount-col {
  width: 16%;
}


.invoice-table thead th {

  padding: 2.8mm 1.8mm;

  font-weight: 700;

  text-align: center;

  border-left: 1px solid #222;

  border-right: 1px solid #222;

  border-bottom: 1px solid #222;

  border-top: 0;

}


.invoice-table tbody td:nth-child(3) {
  text-align: center;
}

.invoice-table tbody td {

  padding: 1.5mm 1.8mm;

  height: 6mm;

  vertical-align: top;

  border-left: 1px solid #222;

  border-right: 1px solid #222;

  border-top: 0 !important;

  border-bottom: 0 !important;

  background: transparent !important;

}


.invoice-table .type-cell {

  text-align: center;

  font-weight: 600;

  text-transform: uppercase;

  font-size: 9px;

}


.invoice-table .quantity-cell {

  text-align: center;

}


.invoice-table .unit-cell {
  text-align: center;
}


.invoice-table .description-cell {

  text-align: center;

}


.invoice-table .number-cell {

  text-align: right;

  white-space: nowrap;

}


.invoice-table tbody .invoice-empty-row td {

  height: 1mm;

  border-left: 1px solid #222 !important;

  border-right: 1px solid #222 !important;

  border-top: 0 !important;

  border-bottom: 0 !important;

}


.invoice-table th:first-child,
.invoice-table td:first-child {

  border-left: 1px solid #222 !important;

}


.invoice-table th:last-child,
.invoice-table td:last-child {

  border-right: 1px solid #222 !important;

}


.invoice-table tbody tr:last-child td {

  border-bottom: 1px solid #222 !important;

}


/* ============================================================
   TOTAL SUMMARY — COMPACT
   ============================================================ */

.invoice-total-wrapper {

  width: 42%;

  margin-top: 4mm;

  margin-left: auto;

  display: flex;

  flex-direction: column;

  align-items: stretch;

}


.invoice-total-row {

  width: 100%;

  display: flex;

  flex-direction: row;

  margin: 0;

  padding: 0;

  min-height: 7mm;

}


.invoice-total-label {

  width: 60%;

  box-sizing: border-box;

  border-left: 1px solid #222;

  border-right: 1px solid #222;

  border-top: 1px solid #222;

  padding: 1.6mm 2.5mm;

  font-size: 10px;

  font-weight: 700;

  text-align: left;

  line-height: 1.2;

  display: flex;

  align-items: center;

}


.invoice-total-value {

  width: 40%;

  box-sizing: border-box;

  border-right: 1px solid #222;

  border-top: 1px solid #222;

  padding: 1.6mm 2.5mm;

  font-size: 10px;

  font-weight: 700;

  text-align: right;

  line-height: 1.2;

  display: flex;

  align-items: center;

  justify-content: flex-end;

}


.invoice-total-row-final
.invoice-total-label,

.invoice-total-row-final
.invoice-total-value {

  border-top: 1px solid #222;

  border-bottom: 1px solid #222;

}


/* ============================================================
   TERMS & CONDITIONS
   ============================================================ */

.invoice-terms-box {

  width: 100%;

  box-sizing: border-box;

  border: 1px solid #222;

  margin-top: 6mm;

  font-size: 9.5px;

  page-break-inside: avoid;

}


.invoice-terms-title {

  display: block;

  width: 100%;

  box-sizing: border-box;

  padding: 1.8mm 2.5mm;

  background: #f1f1f1;

  border-bottom: 1px solid #222;

  font-size: 10px;

  font-weight: 700;

  text-align: left;

}


.invoice-terms-content {

  width: 100%;

  box-sizing: border-box;

  padding: 2.5mm 3mm;

}


.invoice-term-item {

  display: flex;

  width: 100%;

  box-sizing: border-box;

  margin: 0;

  padding: 0.8mm 0;

  line-height: 1.00;

}


.invoice-term-number {

  width: 7mm;

  flex-shrink: 0;

  font-weight: 600;

}


.invoice-term-text {

  flex: 1;

  min-width: 0;

  white-space: normal;

  overflow-wrap: break-word;

}


/* ============================================================
   FOOTER
   ============================================================ */

.invoice-footer-note {

  margin-top: 4mm;

  padding-top: 2mm;

  border-top: 1px solid #ccc;

}


.invoice-footer-note p {

  text-align: center;

  font-size: 9px;

  color: #888;

  margin: 0;

  font-style: italic;

}


/* ============================================================
   PRINT
   ============================================================ */

@media print {

  @page {

    size: A4 portrait;

    margin: 0;

  }


  html,
  body {

    width: 210mm;

    min-height: 297mm;

    margin: 0 !important;

    padding: 0 !important;

    background: white !important;

  }


  body * {

    visibility: hidden !important;

  }


  .invoice-print-area,
  .invoice-print-area * {

    visibility: visible !important;

  }


  .invoice-preview-overlay {

    position: static !important;

    width: 210mm !important;

    min-height: 297mm !important;

    padding: 0 !important;

    margin: 0 !important;

    overflow: visible !important;

    background: white !important;

  }


  .invoice-preview-controls {

    display: none !important;

  }


  .invoice-print-area {

    position: absolute !important;

    left: 0 !important;

    top: 0 !important;

    width: 210mm !important;

    margin: 0 !important;

    padding: 0 !important;

  }


  .invoice-sheet {

    width: 210mm !important;

    min-height: 297mm !important;

    margin: 0 !important;

    padding: 15mm 17mm !important;

    box-sizing: border-box !important;

    box-shadow: none !important;

  }


  .invoice-logo {

    margin-bottom: 1mm !important;

  }


  .invoice-company-address {

    padding-top: 0mm !important;

  }


  .invoice-table {

    width: 100% !important;

    border-collapse: collapse !important;

    border: 1px solid #222 !important;

  }


  .invoice-table thead th {

    border-left: 1px solid #222 !important;

    border-right: 1px solid #222 !important;

    border-top: 0 !important;

    border-bottom: 1px solid #222 !important;

  }


  .invoice-table tbody td {

    border-left: 1px solid #222 !important;

    border-right: 1px solid #222 !important;

    border-top: 0 !important;

    border-bottom: 0 !important;

    background: transparent !important;

  }


  .invoice-table tbody .invoice-empty-row td {

    border-left: 1px solid #222 !important;

    border-right: 1px solid #222 !important;

    border-top: 0 !important;

    border-bottom: 0 !important;

  }


  .invoice-table tbody tr:last-child td {

    border-bottom: 1px solid #222 !important;

  }


  .invoice-total-wrapper {

    width: 42% !important;

    margin-top: 4mm !important;

    margin-left: auto !important;

    display: flex !important;

    flex-direction: column !important;

    align-items: stretch !important;

  }


  .invoice-total-row {

    width: 100% !important;

    display: flex !important;

    flex-direction: row !important;

    margin: 0 !important;

    padding: 0 !important;

    min-height: 7mm !important;

  }


  .invoice-total-label {

    width: 60% !important;

    box-sizing: border-box !important;

    border-left: 1px solid #222 !important;

    border-right: 1px solid #222 !important;

    border-top: 1px solid #222 !important;

    padding: 1.6mm 2.5mm !important;

    font-size: 10px !important;

    font-weight: 700 !important;

    text-align: left !important;

    line-height: 1.2 !important;

    display: flex !important;

    align-items: center !important;

  }


  .invoice-total-value {

    width: 40% !important;

    box-sizing: border-box !important;

    border-right: 1px solid #222 !important;

    border-top: 1px solid #222 !important;

    padding: 1.6mm 2.5mm !important;

    font-size: 10px !important;

    font-weight: 700 !important;

    text-align: right !important;

    line-height: 1.2 !important;

    display: flex !important;

    align-items: center !important;

    justify-content: flex-end !important;

  }


  .invoice-total-row-final
  .invoice-total-label,

  .invoice-total-row-final
  .invoice-total-value {

    border-top: 1px solid #222 !important;

    border-bottom: 1px solid #222 !important;

  }


  .invoice-terms-box {

    width: 100% !important;

    box-sizing: border-box !important;

    border: 1px solid #222 !important;

    margin-top: 6mm !important;

    page-break-inside: avoid !important;

    break-inside: avoid !important;

  }


  .invoice-terms-title {

    display: block !important;

    width: 100% !important;

    box-sizing: border-box !important;

    padding: 1.8mm 2.5mm !important;

    background: #f1f1f1 !important;

    border-bottom: 1px solid #222 !important;

    font-size: 10px !important;

    font-weight: 700 !important;

    text-align: left !important;

    -webkit-print-color-adjust: exact !important;

    print-color-adjust: exact !important;

  }


  .invoice-terms-content {

    width: 100% !important;

    box-sizing: border-box !important;

    padding: 2.5mm 3mm !important;

    -webkit-print-color-adjust: exact !important;

    print-color-adjust: exact !important;

  }


  .invoice-term-item {

    display: flex !important;

    width: 100% !important;

    box-sizing: border-box !important;

    margin: 0 !important;

    padding: 0.8mm 0 !important;

    line-height: 1.45 !important;

  }


  .invoice-term-number {

    width: 7mm !important;

    flex-shrink: 0 !important;

    font-weight: 600 !important;

  }


  .invoice-term-text {

    flex: 1 !important;

    min-width: 0 !important;

    white-space: normal !important;

    overflow-wrap: break-word !important;

  }


  .invoice-footer-note {

    border-top: 1px solid #ccc !important;

  }

}

`


/* ================================================================
   INSERT PRINT CSS
   ================================================================ */

if (
  typeof document !== 'undefined'
) {

  const styleId =
    'invoice-print-styles'


  const oldStyle =
    document.getElementById(
      styleId
    )


  if (!oldStyle) {

    const style =
      document.createElement(
        'style'
      )


    style.id =
      styleId


    style.innerHTML =
      invoicePrintStyles


    document.head.appendChild(
      style
    )

  }

}