//item or brand and desc show without description

// import { useState, useEffect, useRef } from 'react'
// import { ref, push, onValue, update, remove, get, set } from 'firebase/database'
// import { useAuth } from '../context/AuthContext'
// import { db } from '../firebase'
// import { todayISO, currency } from '../utils/helpers'
// import Loader from '../components/Loader'

// /* ============================================================
//    COMPANY INFORMATION - LOGO SET
//    ============================================================ */

// const COMPANY_NAME = 'Pearl Networks'
// const COMPANY_LOGO = '/PN.png'
// const COMPANY_ADDRESS =
//   'KCHS, Gohar Chamber, Office # 304, Shahra-e-Faisal, near Duty Free Shop, Karachi, 75600'
// const COMPANY_PHONE = '0341-1293604'
// const COMPANY_EMAIL = 'info@globalonesystem.com'

// /* ============================================================
//    EMPTY ITEM
//    ============================================================ */

// const emptyItem = {
//   item: '',
//   brand: '',
//   description: '',
//   uom: 'PCS',
//   qty: 1,
//   price: ''
// }

// /* ============================================================
//    SEQUENTIAL QUOTATION NUMBER GENERATOR - DATE BASED
//    ============================================================ */

// // Get today's date in YYYYMMDD format
// function getTodayDateString() {
//   const today = new Date()
//   const year = today.getFullYear()
//   const month = String(today.getMonth() + 1).padStart(2, '0')
//   const day = String(today.getDate()).padStart(2, '0')
//   return `${year}${month}${day}`
// }

// /* ============================================================
//    GET NEXT QUOTATION NUMBER
//    SIRF NUMBER READ KAREGA - INCREMENT NAHI KAREGA
//    ============================================================ */

// async function getNextQuotationNumber(companyId) {
//   try {
//     const dateStr = getTodayDateString()
//     const counterRef = ref(db, `companies/${companyId}/counters/quotation`)
//     const snapshot = await get(counterRef)

//     let lastNumber = 0
//     let lastDate = ''

//     if (snapshot.exists()) {
//       const data = snapshot.val()
//       lastNumber = data.number || 0
//       lastDate = data.date || ''
//     }

//     let nextNumber = lastNumber + 1

//     // New date -> counter reset
//     if (lastDate !== dateStr) {
//       nextNumber = 1
//     }

//     const padded = String(nextNumber).padStart(4, '0')
//     return `QTN-${dateStr}-${padded}`

//   } catch (error) {
//     console.error('Error getting quotation number:', error)
//     const dateStr = getTodayDateString()
//     const timestamp = Date.now().toString().slice(-6)
//     return `QTN-${dateStr}-${timestamp}`
//   }
// }

// /* ============================================================
//    INCREMENT QUOTATION COUNTER
//    SAVE KE WAQT INCREMENT HOGA
//    ============================================================ */

// async function incrementQuotationCounter(companyId) {
//   try {
//     const dateStr = getTodayDateString()
//     const counterRef = ref(db, `companies/${companyId}/counters/quotation`)
//     const snapshot = await get(counterRef)

//     let lastNumber = 0
//     let lastDate = ''

//     if (snapshot.exists()) {
//       const data = snapshot.val()
//       lastNumber = data.number || 0
//       lastDate = data.date || ''
//     }

//     let newNumber = lastNumber + 1

//     // New date -> reset
//     if (lastDate !== dateStr) {
//       newNumber = 1
//     }

//     await set(counterRef, {
//       date: dateStr,
//       number: newNumber
//     })

//     return {
//       number: newNumber,
//       date: dateStr
//     }

//   } catch (error) {
//     console.error('Error incrementing counter:', error)
//     return null
//   }
// }

// /* ============================================================
//    MAIN QUOTATION COMPONENT
//    ============================================================ */

// export default function Quotation() {

//   const { companyId } = useAuth()
//   const printRef = useRef(null)

//   /* ============================================================
//      BASIC STATE
//      ============================================================ */

//   const [loading, setLoading] = useState(true)
//   const [quotations, setQuotations] = useState([])
//   const [customers, setCustomers] = useState([])

//   /* ============================================================
//      FORM STATE
//      ============================================================ */

//   const [showForm, setShowForm] = useState(false)
//   const [editingId, setEditingId] = useState(null)
//   const [customerId, setCustomerId] = useState('')
//   const [quotationNumber, setQuotationNumber] = useState('')
//   const [date, setDate] = useState(todayISO())
//   const [validity, setValidity] = useState('')
//   const [project, setProject] = useState('')
//   const [items, setItems] = useState([])
//   const [terms, setTerms] = useState('')
//   const [previewData, setPreviewData] = useState(null)

//   /* ============================================================
//      CURRENT ITEM
//      ============================================================ */

//   const [currentItem, setCurrentItem] = useState({ ...emptyItem })

//   /* ============================================================
//      EDIT PRODUCT STATE
//      ============================================================ */

//   const [editingProductIndex, setEditingProductIndex] = useState(null)
//   const [editProduct, setEditProduct] = useState({
//     item: '',
//     brand: '',
//     description: '',
//     uom: 'PCS',
//     qty: 1,
//     price: ''
//   })

//   /* ============================================================
//      STATUS
//      ============================================================ */

//   const [saving, setSaving] = useState(false)
//   const [error, setError] = useState('')
//   const [success, setSuccess] = useState('')
//   const [generatingPdf, setGeneratingPdf] = useState(false)

//   /* ============================================================
//      LOAD DATA
//      ============================================================ */

//   useEffect(() => {

//     if (!companyId) {
//       setLoading(false)
//       return
//     }

//     /* ==========================================================
//        LOAD CUSTOMERS
//        ========================================================== */

//     const customersRef = ref(db, `companies/${companyId}/customers`)
//     const unsubscribeCustomers = onValue(customersRef, (snapshot) => {
//       const data = snapshot.val() || {}
//       const list = Object.entries(data).map(([id, customer]) => ({
//         id,
//         ...customer
//       }))
//       setCustomers(list)
//     })

//     /* ==========================================================
//        LOAD QUOTATIONS
//        ========================================================== */

//     const quotationsRef = ref(db, `companies/${companyId}/quotations`)
//     const unsubscribeQuotations = onValue(quotationsRef, (snapshot) => {
//       const data = snapshot.val() || {}
//       const list = Object.entries(data)
//         .map(([id, quotation]) => ({
//           id,
//           ...quotation
//         }))
//         .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
//       setQuotations(list)
//       setLoading(false)
//     })

//     /* ==========================================================
//        CLEANUP
//        ========================================================== */

//     return () => {
//       unsubscribeCustomers()
//       unsubscribeQuotations()
//     }

//   }, [companyId])

//   /* ============================================================
//      CALCULATE SUBTOTAL
//      ============================================================ */

//   const calculateSubtotal = () => {
//     return items.reduce((sum, item) => {
//       const qty = Number(item.qty) || 0
//       const price = Number(item.price) || 0
//       return sum + qty * price
//     }, 0)
//   }

//   /* ============================================================
//      CALCULATE TOTAL
//      NO TAX
//      ============================================================ */

//   const calculateTotal = () => {
//     return calculateSubtotal()
//   }

//   /* ============================================================
//      ADD ITEM
//      ============================================================ */

//   const addItem = () => {

//     if (!currentItem.item.trim() && !currentItem.description.trim()) {
//       setError('Either Item or Description is required')
//       return
//     }

//     const newItem = {
//       item: currentItem.item ? currentItem.item.trim() : '',
//       brand: currentItem.brand ? currentItem.brand.trim() : '',
//       description: currentItem.description ? currentItem.description.trim() : '',
//       uom: currentItem.uom || 'PCS',
//       qty: Math.max(1, Number(currentItem.qty) || 1),
//       price: Math.max(0, Number(currentItem.price) || 0)
//     }

//     setItems([...items, newItem])
//     setCurrentItem({ ...emptyItem })
//     setError('')
//   }

//   /* ============================================================
//      REMOVE ITEM
//      ============================================================ */

//   const removeItem = (index) => {
//     setItems(items.filter((_, i) => i !== index))
//   }

//   /* ============================================================
//      EDIT PRODUCT - OPEN
//      ============================================================ */

//   const openEditProduct = (index) => {
//     const item = items[index]
//     setEditingProductIndex(index)
//     setEditProduct({
//       item: item.item || '',
//       brand: item.brand || '',
//       description: item.description || '',
//       uom: item.uom || 'PCS',
//       qty: item.qty || 1,
//       price: item.price === 0 ? '' : item.price
//     })
//   }

//   /* ============================================================
//      EDIT PRODUCT - SAVE
//      ============================================================ */

//   const saveEditProduct = () => {

//     if (!editProduct.item.trim() && !editProduct.description.trim()) {
//       setError('Either Item or Description is required')
//       return
//     }

//     const updatedItems = [...items]
//     updatedItems[editingProductIndex] = {
//       item: editProduct.item ? editProduct.item.trim() : '',
//       brand: editProduct.brand ? editProduct.brand.trim() : '',
//       description: editProduct.description ? editProduct.description.trim() : '',
//       uom: editProduct.uom || 'PCS',
//       qty: Math.max(1, Number(editProduct.qty) || 1),
//       price: Math.max(0, Number(editProduct.price) || 0)
//     }

//     setItems(updatedItems)
//     setEditingProductIndex(null)
//     setEditProduct({
//       item: '',
//       brand: '',
//       description: '',
//       uom: 'PCS',
//       qty: 1,
//       price: ''
//     })
//     setError('')
//   }

//   /* ============================================================
//      EDIT PRODUCT - CLOSE
//      ============================================================ */

//   const closeEditProduct = () => {
//     setEditingProductIndex(null)
//     setEditProduct({
//       item: '',
//       brand: '',
//       description: '',
//       uom: 'PCS',
//       qty: 1,
//       price: ''
//     })
//   }

//   /* ============================================================
//      RESET FORM
//      ============================================================ */

//   const resetForm = () => {
//     setCustomerId('')
//     setQuotationNumber('')
//     setDate(todayISO())
//     setValidity('')
//     setProject('')
//     setItems([])
//     setTerms('')
//     setCurrentItem({ ...emptyItem })
//     setEditingId(null)
//     setError('')
//     setSuccess('')
//     setEditingProductIndex(null)
//     setEditProduct({
//       item: '',
//       brand: '',
//       description: '',
//       uom: 'PCS',
//       qty: 1,
//       price: ''
//     })
//   }

//   /* ============================================================
//      OPEN NEW QUOTATION
//      ============================================================ */

//   const openNewQuotation = async () => {
//     resetForm()
//     if (companyId) {
//       const number = await getNextQuotationNumber(companyId)
//       setQuotationNumber(number)
//     }
//     setShowForm(true)
//   }

//   /* ============================================================
//      OPEN EDIT QUOTATION
//      ============================================================ */

//   const openEditQuotation = (quotation) => {
//     setEditingId(quotation.id)
//     setCustomerId(quotation.customerId || '')
//     setQuotationNumber(quotation.quotationNumber || '')
//     setDate(quotation.date || todayISO())
//     setValidity(quotation.validity || '')
//     setProject(quotation.project || '')
//     setItems(quotation.items || [])
//     setTerms(quotation.terms || '')
//     setShowForm(true)
//     setError('')
//   }

//   /* ============================================================
//      SAVE QUOTATION
//      ============================================================ */

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     setError('')
//     setSuccess('')

//     if (!companyId) {
//       setError('Company ID not found')
//       return
//     }

//     if (!customerId) {
//       setError('Please select a customer')
//       return
//     }

//     if (items.length === 0) {
//       setError('Add at least one item')
//       return
//     }

//     const customer = customers.find(c => c.id === customerId)
//     if (!customer) {
//       setError('Customer not found')
//       return
//     }

//     setSaving(true)

//     try {
//       const subtotal = calculateSubtotal()
//       const total = calculateTotal()

//       let finalQuotationNumber = quotationNumber

//       if (!editingId) {
//         await incrementQuotationCounter(companyId)

//         if (!finalQuotationNumber || finalQuotationNumber.trim() === '') {
//           const dateStr = getTodayDateString()
//           const timestamp = Date.now().toString().slice(-6)
//           finalQuotationNumber = `QTN-${dateStr}-${timestamp}`
//           setQuotationNumber(finalQuotationNumber)
//         }
//       }

//       const quotationData = {
//         quotationNumber: finalQuotationNumber,
//         date: date || todayISO(),
//         validity: validity || '',
//         project: project || '',
//         customerId: customerId,
//         customerName: customer.name || '',
//         customerCompany: customer.company || '',
//         customerPhone: customer.phone || '',
//         customerAddress: customer.address || '',
//         companyName: COMPANY_NAME,
//         companyLogo: COMPANY_LOGO,
//         companyAddress: COMPANY_ADDRESS,
//         companyPhone: COMPANY_PHONE,
//         companyEmail: COMPANY_EMAIL,
//         items: items,
//         subtotal: subtotal,
//         total: total,
//         terms: terms || '',
//         updatedAt: Date.now()
//       }

//       if (editingId) {
//         const quotationRef = ref(db, `companies/${companyId}/quotations/${editingId}`)
//         await update(quotationRef, {
//           ...quotationData,
//           updatedAt: Date.now()
//         })
//         setSuccess('Quotation updated successfully!')
//       } else {
//         const quotationsRef = ref(db, `companies/${companyId}/quotations`)
//         quotationData.createdAt = Date.now()
//         await push(quotationsRef, quotationData)
//         setSuccess('Quotation created successfully!')
//       }

//       setPreviewData({
//         ...quotationData,
//         id: editingId || 'new',
//         customer: {
//           name: customer.name,
//           company: customer.company,
//           phone: customer.phone,
//           address: customer.address
//         }
//       })

//       setShowForm(false)
//       resetForm()

//     } catch (err) {
//       console.error('Save error:', err)
//       setError(err.message || 'Failed to save quotation')
//     } finally {
//       setSaving(false)
//     }
//   }

//   /* ============================================================
//      DELETE QUOTATION
//      ============================================================ */

//   const deleteQuotation = async (id) => {
//     if (!confirm('Are you sure you want to delete this quotation?')) return

//     try {
//       const quotationRef = ref(db, `companies/${companyId}/quotations/${id}`)
//       await remove(quotationRef)
//       setSuccess('Quotation deleted successfully!')
//     } catch (err) {
//       console.error('Delete error:', err)
//       setError('Failed to delete quotation')
//     }
//   }

//   /* ============================================================
//      PREVIEW
//      ============================================================ */

//   const handlePreview = (quotation) => {
//     setPreviewData({
//       ...quotation,
//       customer: {
//         name: quotation.customerName,
//         company: quotation.customerCompany,
//         phone: quotation.customerPhone,
//         address: quotation.customerAddress
//       }
//     })
//   }

//   /* ============================================================
//      SAVE AS PDF
//      ============================================================ */

//   const handleSavePdf = async (quotation) => {
//     setGeneratingPdf(true)

//     try {
//       const previewQuotation = {
//         ...quotation,
//         customer: {
//           name: quotation.customerName,
//           company: quotation.customerCompany,
//           phone: quotation.customerPhone,
//           address: quotation.customerAddress
//         }
//       }

//       setPreviewData(previewQuotation)

//       await new Promise(resolve => setTimeout(resolve, 500))

//       window.print()

//     } catch (error) {
//       console.error('Print error:', error)
//       alert('Print preview open nahi ho saka.')
//     } finally {
//       setGeneratingPdf(false)
//     }
//   }

//   /* ============================================================
//      RENDER
//      ============================================================ */

//   return (
//     <div className="quotation-page">

//       <div className="quotation-editor no-print">

//         <div className="quotation-editor-header">
//           <div>
//             <h1>Quotations</h1>
//             <p>Create and manage quotations for your customers</p>
//           </div>
//           <div className="quotation-editor-actions">
//             <button onClick={openNewQuotation} className="btn btn-primary">
//               + New Quotation
//             </button>
//           </div>
//         </div>

//         {success && (
//           <div className="quotation-alert quotation-success">
//             {success}
//           </div>
//         )}

//         {error && (
//           <div className="quotation-alert quotation-error">
//             {error}
//           </div>
//         )}

//         {loading ? (
//           <Loader />
//         ) : quotations.length === 0 ? (
//           <div style={{ textAlign: 'center', padding: '40px 0', color: '#666' }}>
//             <p>No quotations yet. Create your first quotation!</p>
//           </div>
//         ) : (
//           <div style={{ overflowX: 'auto', marginTop: '20px' }}>
//             <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
//               <thead>
//                 <tr style={{ borderBottom: '2px solid #e5e7eb', textAlign: 'left' }}>
//                   <th style={{ padding: '10px', width: '15%' }}>#</th>
//                   <th style={{ padding: '10px', width: '25%' }}>Customer</th>
//                   <th style={{ padding: '10px', width: '12%' }}>Date</th>
//                   <th style={{ padding: '10px', width: '10%' }}>Validity</th>
//                   <th style={{ padding: '10px', width: '13%' }}>Total</th>
//                   <th style={{ padding: '10px', width: '25%', textAlign: 'right' }}>Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {quotations.map((q, index) => (
//                   <tr key={q.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
//                     <td style={{ padding: '10px' }}>{q.quotationNumber}</td>
//                     <td style={{ padding: '10px' }}>
//                       <div style={{ fontWeight: 600 }}>{q.customerName}</div>
//                       <div style={{ fontSize: '12px', color: '#666' }}>{q.customerCompany}</div>
//                     </td>
//                     <td style={{ padding: '10px' }}>{q.date}</td>
//                     <td style={{ padding: '10px' }}>{q.validity || '-'}</td>
//                     <td style={{ padding: '10px', fontWeight: 700 }}>Rs {currency(q.total || 0)}</td>
//                     <td style={{ padding: '10px', textAlign: 'right', whiteSpace: 'nowrap' }}>
//                       <button onClick={() => handlePreview(q)} style={{ marginRight: '6px', padding: '5px 10px', border: 'none', borderRadius: '4px', background: '#062d73', color: '#fff', cursor: 'pointer', fontSize: '12px', display: 'inline-block' }}>
//                         View
//                       </button>
//                       <button onClick={() => openEditQuotation(q)} style={{ marginRight: '6px', padding: '5px 10px', border: 'none', borderRadius: '4px', background: '#e5e7eb', color: '#111', cursor: 'pointer', fontSize: '12px', display: 'inline-block' }}>
//                         Edit
//                       </button>
//                       <button onClick={() => deleteQuotation(q.id)} style={{ marginRight: '6px', padding: '5px 10px', border: 'none', borderRadius: '4px', background: '#fee2e2', color: '#dc2626', cursor: 'pointer', fontSize: '12px', display: 'inline-block' }}>
//                         Delete
//                       </button>
//                       <button onClick={() => handleSavePdf(q)} disabled={generatingPdf} style={{ padding: '5px 10px', border: 'none', borderRadius: '4px', background: '#dc2626', color: '#fff', cursor: generatingPdf ? 'not-allowed' : 'pointer', opacity: generatingPdf ? 0.6 : 1, fontSize: '12px', display: 'inline-block' }}>
//                         {generatingPdf ? '⏳' : '📄 PDF'}
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}

//       </div>

//       {/* ========================================================
//           QUOTATION FORM MODAL
//           ======================================================== */}

//       {showForm && (
//         <div className="quotation-modal-overlay" style={{
//           position: 'fixed',
//           inset: 0,
//           zIndex: 9999,
//           backgroundColor: 'rgba(0,0,0,0.5)',
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'center',
//           padding: '20px',
//           overflow: 'auto'
//         }}>
//           <div className="quotation-modal-content" style={{
//             backgroundColor: '#fff',
//             borderRadius: '12px',
//             maxWidth: '1000px',
//             width: '100%',
//             maxHeight: '90vh',
//             overflow: 'hidden',
//             display: 'flex',
//             flexDirection: 'column',
//             boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
//           }}>

//             <div style={{
//               padding: '20px 25px',
//               borderBottom: '1px solid #e5e7eb',
//               display: 'flex',
//               justifyContent: 'space-between',
//               alignItems: 'center',
//               flexShrink: 0,
//               backgroundColor: '#fff',
//               borderTopLeftRadius: '12px',
//               borderTopRightRadius: '12px'
//             }}>
//               <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>
//                 {editingId ? 'Edit Quotation' : 'New Quotation'}
//               </h2>
//               <button onClick={() => { setShowForm(false); resetForm() }} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#666', padding: '0 10px' }}>
//                 ✕
//               </button>
//             </div>

//             <div style={{
//               padding: '20px 25px',
//               overflowY: 'auto',
//               flex: 1,
//               backgroundColor: '#fafafa'
//             }}>
//               <form onSubmit={handleSubmit}>

//                 <div className="editor-section" style={{ background: '#fff' }}>
//                   <div className="editor-grid">
//                     <div className="field">
//                       <label>Customer *</label>
//                       <select value={customerId} onChange={e => setCustomerId(e.target.value)} required style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }}>
//                         <option value="">Select customer...</option>
//                         {customers.map(c => (
//                           <option key={c.id} value={c.id}>
//                             {c.name} {c.company ? `- ${c.company}` : ''}
//                           </option>
//                         ))}
//                       </select>
//                     </div>

//                     <div className="field">
//                       <label>Quotation #</label>
//                       <input type="text" value={quotationNumber} onChange={e => setQuotationNumber(e.target.value)} placeholder="Will be generated on save" style={{ background: '#f3f4f6', fontWeight: 'bold' }} />
//                       <small style={{ color: '#666', fontSize: '11px' }}>Format: QTN-YYYYMMDD-0001</small>
//                     </div>

//                     <div className="field">
//                       <label>Date *</label>
//                       <input type="date" value={date} onChange={e => setDate(e.target.value)} required />
//                     </div>

//                     <div className="field">
//                       <label>Validity (Days) *</label>
//                       <input type="number" min="1" max="365" value={validity} onChange={e => setValidity(e.target.value)} placeholder="e.g., 30" required style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }} />
//                       <small style={{ color: '#666', fontSize: '11px' }}>Number of days quotation is valid (e.g., 30, 60, 90)</small>
//                     </div>

//                     <div className="field field-full">
//                       <label>Project</label>
//                       <input type="text" value={project} onChange={e => setProject(e.target.value)} placeholder="Project name (optional)" />
//                     </div>
//                   </div>
//                 </div>

//                 {/* ==================================================
//                     ITEMS - WITH ITEM & BRAND (OPTIONAL)
//                     ================================================== */}

//                 <div className="editor-section" style={{ background: '#fff' }}>
//                   <div className="items-heading">
//                     <h2>Items</h2>
//                     <span style={{ fontSize: '14px', color: '#666' }}>Total: Rs {currency(calculateTotal())}</span>
//                   </div>

//                   <div className="items-editor">

//                     {/* ADD ITEM ROW - WITH ITEM & BRAND (OPTIONAL) */}

//                     <div className="item-editor-row" style={{
//                       display: 'grid',
//                       gridTemplateColumns: '35px 1fr 1fr 1fr 80px 70px 90px 120px 70px',
//                       gap: '8px',
//                       alignItems: 'end',
//                       padding: '12px',
//                       border: '1px solid #e5e7eb',
//                       borderRadius: '8px',
//                       background: '#f9fafb',
//                       width: '100%'
//                     }}>
//                       <div className="item-number" style={{ height: '39px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#555' }}>
//                         <span>#</span>
//                       </div>

//                       {/* ITEM - OPTIONAL */}
//                       <div className="field">
//                         <input
//                           value={currentItem.item}
//                           onChange={e => setCurrentItem({ ...currentItem, item: e.target.value })}
//                           placeholder="Item (Optional)"
//                           style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }}
//                         />
//                       </div>

//                       {/* BRAND - OPTIONAL */}
//                       <div className="field">
//                         <input
//                           value={currentItem.brand}
//                           onChange={e => setCurrentItem({ ...currentItem, brand: e.target.value })}
//                           placeholder="Brand (Optional)"
//                           style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }}
//                         />
//                       </div>

//                       {/* DESCRIPTION - OPTIONAL */}
//                       <div className="field">
//                         <textarea
//                           value={currentItem.description}
//                           onChange={e => setCurrentItem({ ...currentItem, description: e.target.value })}
//                           placeholder="Description (Optional)"
//                           rows="2"
//                           style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', resize: 'vertical' }}
//                         />
//                       </div>

//                       {/* UOM */}
//                       <div className="field">
//                         <input
//                           value={currentItem.uom}
//                           onChange={e => setCurrentItem({ ...currentItem, uom: e.target.value })}
//                           placeholder="UOM"
//                           style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }}
//                         />
//                       </div>

//                       {/* QTY */}
//                       <div className="field">
//                         <input
//                           type="number"
//                           min="1"
//                           value={currentItem.qty}
//                           onChange={e => setCurrentItem({ ...currentItem, qty: Number(e.target.value) || 1 })}
//                           placeholder="Qty"
//                           style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }}
//                         />
//                       </div>

//                       {/* PRICE */}
//                       <div className="field">
//                         <input
//                           type="number"
//                           min="0"
//                           step="0.01"
//                           value={currentItem.price === 0 ? '' : currentItem.price}
//                           onChange={e => setCurrentItem({
//                             ...currentItem,
//                             price: e.target.value === '' ? '' : Number(e.target.value)
//                           })}
//                           placeholder="Price"
//                           style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }}
//                         />
//                       </div>

//                       {/* CURRENT TOTAL */}
//                       <div className="item-total-editor" style={{
//                         height: '39px',
//                         padding: '5px 8px',
//                         display: 'flex',
//                         flexDirection: 'column',
//                         justifyContent: 'center',
//                         background: '#fff',
//                         border: '1px solid #d1d5db',
//                         borderRadius: '6px',
//                         minWidth: '80px'
//                       }}>
//                         <span style={{ fontSize: '9px', color: '#777' }}>Total</span>
//                         <strong style={{ fontSize: '12px' }}>
//                           Rs {currency((Number(currentItem.qty) || 0) * (Number(currentItem.price) || 0))}
//                         </strong>
//                       </div>

//                       <button type="button" onClick={addItem} className="btn btn-primary btn-small" style={{ height: '39px', minWidth: '60px', padding: '0 15px' }}>
//                         Add
//                       </button>
//                     </div>

//                     {/* ==================================================
//                         ITEMS LIST
//                         ================================================== */}

//                     <div style={{ maxHeight: '250px', overflowY: 'auto', marginTop: '10px' }}>
//                       {items.length === 0 ? (
//                         <div style={{ textAlign: 'center', padding: '30px', color: '#999', fontSize: '14px' }}>
//                           No items added yet. Add products above.
//                         </div>
//                       ) : (
//                         items.map((item, index) => (
//                           <div key={index} className="item-editor-row" style={{
//                             display: 'grid',
//                             gridTemplateColumns: '35px 1fr 1fr 1fr 80px 70px 90px 120px 70px',
//                             gap: '8px',
//                             alignItems: 'center',
//                             padding: '10px 12px',
//                             border: '1px solid #e5e7eb',
//                             borderRadius: '8px',
//                             background: '#f9fafb',
//                             marginBottom: '8px',
//                             width: '100%'
//                           }}>
//                             <div className="item-number" style={{ fontWeight: 700, color: '#555', textAlign: 'center' }}>
//                               {index + 1}
//                             </div>

//                             {/* ITEM */}
//                             <div className="field">
//                               <div style={{ padding: '8px 0', fontWeight: 500 }}>{item.item || '-'}</div>
//                             </div>

//                             {/* BRAND */}
//                             <div className="field">
//                               <div style={{ padding: '8px 0' }}>{item.brand || '-'}</div>
//                             </div>

//                             {/* DESCRIPTION */}
//                             <div className="field">
//                               <div style={{ padding: '8px 0', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{item.description || '-'}</div>
//                             </div>

//                             {/* UOM */}
//                             <div className="field">
//                               <div style={{ padding: '8px 0' }}>{item.uom || 'PCS'}</div>
//                             </div>

//                             {/* QTY */}
//                             <div className="field">
//                               <div style={{ padding: '8px 0', textAlign: 'center' }}>{item.qty}</div>
//                             </div>

//                             {/* PRICE */}
//                             <div className="field">
//                               <div style={{ padding: '8px 0', textAlign: 'right' }}>Rs {currency(item.price)}</div>
//                             </div>

//                             {/* TOTAL */}
//                             <div className="item-total-editor" style={{
//                               height: '39px',
//                               padding: '5px 8px',
//                               display: 'flex',
//                               flexDirection: 'column',
//                               justifyContent: 'center',
//                               background: '#fff',
//                               border: '1px solid #d1d5db',
//                               borderRadius: '6px'
//                             }}>
//                               <span style={{ fontSize: '9px', color: '#777' }}>Total</span>
//                               <strong style={{ fontSize: '12px' }}>Rs {currency((item.qty || 0) * (item.price || 0))}</strong>
//                             </div>

//                             <div style={{ display: 'flex', gap: '4px' }}>
//                               <button type="button" onClick={() => openEditProduct(index)} style={{
//                                 height: '39px',
//                                 width: '35px',
//                                 border: 'none',
//                                 borderRadius: '6px',
//                                 background: '#dbeafe',
//                                 color: '#1d4ed8',
//                                 fontSize: '16px',
//                                 cursor: 'pointer',
//                                 display: 'flex',
//                                 alignItems: 'center',
//                                 justifyContent: 'center'
//                               }}>
//                                 ✎
//                               </button>
//                               <button type="button" onClick={() => removeItem(index)} style={{
//                                 height: '39px',
//                                 width: '35px',
//                                 border: 'none',
//                                 borderRadius: '6px',
//                                 background: '#fee2e2',
//                                 color: '#dc2626',
//                                 fontSize: '20px',
//                                 cursor: 'pointer',
//                                 display: 'flex',
//                                 alignItems: 'center',
//                                 justifyContent: 'center'
//                               }}>
//                                 ×
//                               </button>
//                             </div>
//                           </div>
//                         ))
//                       )}
//                     </div>

//                   </div>
//                 </div>

//                 {/* Terms */}
//                 <div className="editor-section" style={{ background: '#fff' }}>
//                   <div className="field field-full">
//                     <label>Terms & Conditions</label>
//                     <textarea value={terms} onChange={e => setTerms(e.target.value)} rows="3" placeholder="Payment terms, delivery, warranty, etc." style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', resize: 'vertical' }} />
//                   </div>
//                 </div>

//                 {error && (
//                   <div className="quotation-alert quotation-error" style={{ marginBottom: '15px' }}>
//                     {error}
//                   </div>
//                 )}

//                 <div style={{
//                   display: 'flex',
//                   gap: '10px',
//                   marginTop: '20px',
//                   paddingTop: '15px',
//                   borderTop: '1px solid #e5e7eb',
//                   flexShrink: 0,
//                   backgroundColor: '#fff',
//                   position: 'sticky',
//                   bottom: 0,
//                   paddingBottom: '5px'
//                 }}>
//                   <button type="submit" disabled={saving} className="btn btn-primary" style={{ flex: 1, padding: '12px 20px', fontSize: '15px' }}>
//                     {saving ? 'Saving...' : editingId ? 'Update Quotation' : 'Create Quotation'}
//                   </button>
//                   <button type="button" onClick={() => { setShowForm(false); resetForm() }} className="btn btn-secondary" style={{ padding: '12px 25px', fontSize: '15px' }}>
//                     Cancel
//                   </button>
//                 </div>

//               </form>
//             </div>

//           </div>
//         </div>
//       )}

//       {/* ========================================================
//           EDIT PRODUCT MODAL - WITH ITEM & BRAND (OPTIONAL)
//           ======================================================== */}

//       {editingProductIndex !== null && (
//         <div className="edit-product-modal" style={{
//           position: 'fixed',
//           inset: 0,
//           zIndex: 99999,
//           backgroundColor: 'rgba(0,0,0,0.5)',
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'center',
//           padding: '20px'
//         }}>
//           <div style={{
//             backgroundColor: '#fff',
//             borderRadius: '12px',
//             padding: '25px',
//             maxWidth: '500px',
//             width: '100%',
//             boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
//           }}>
//             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
//               <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>Edit Product</h3>
//               <button onClick={closeEditProduct} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#666' }}>
//                 ✕
//               </button>
//             </div>

//             <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>

//               {/* ITEM - OPTIONAL */}
//               <div>
//                 <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '5px' }}>
//                   Item (Optional)
//                 </label>
//                 <input
//                   type="text"
//                   value={editProduct.item}
//                   onChange={e => setEditProduct({ ...editProduct, item: e.target.value })}
//                   style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }}
//                 />
//               </div>

//               {/* BRAND - OPTIONAL */}
//               <div>
//                 <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '5px' }}>
//                   Brand (Optional)
//                 </label>
//                 <input
//                   type="text"
//                   value={editProduct.brand}
//                   onChange={e => setEditProduct({ ...editProduct, brand: e.target.value })}
//                   style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }}
//                 />
//               </div>

//               {/* DESCRIPTION - OPTIONAL */}
//               <div>
//                 <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '5px' }}>
//                   Description (Optional)
//                 </label>
//                 <textarea
//                   value={editProduct.description}
//                   onChange={e => setEditProduct({ ...editProduct, description: e.target.value })}
//                   rows="2"
//                   placeholder="Product description"
//                   style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', resize: 'vertical' }}
//                 />
//               </div>

//               {/* UOM QTY PRICE */}
//               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
//                 <div>
//                   <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '5px' }}>
//                     UOM
//                   </label>
//                   <input type="text" value={editProduct.uom} onChange={e => setEditProduct({ ...editProduct, uom: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }} />
//                 </div>
//                 <div>
//                   <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '5px' }}>
//                     Qty
//                   </label>
//                   <input type="number" min="1" value={editProduct.qty} onChange={e => setEditProduct({ ...editProduct, qty: Number(e.target.value) || 1 })} style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }} />
//                 </div>
//                 <div>
//                   <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '5px' }}>
//                     Price
//                   </label>
//                   <input
//                     type="number"
//                     min="0"
//                     step="0.01"
//                     value={editProduct.price === 0 ? '' : editProduct.price}
//                     onChange={e => setEditProduct({
//                       ...editProduct,
//                       price: e.target.value === '' ? '' : Number(e.target.value)
//                     })}
//                     style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }}
//                   />
//                 </div>
//               </div>

//               <button onClick={saveEditProduct} disabled={!editProduct.item.trim() && !editProduct.description.trim()} style={{ width: '100%', padding: '12px', border: 'none', borderRadius: '6px', background: '#062d73', color: '#fff', fontSize: '15px', fontWeight: 600, cursor: 'pointer', marginTop: '10px' }}>
//                 Save Product
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ========================================================
//           QUOTATION PREVIEW - DYNAMIC COLUMNS (FIXED)
//           ======================================================== */}

//       {previewData && (
//         <div className="quotation-preview-overlay" style={{
//           position: 'fixed',
//           inset: 0,
//           zIndex: 99999,
//           background: 'rgba(0,0,0,0.6)',
//           overflow: 'auto',
//           padding: '20px'
//         }}>
//           <div style={{ maxWidth: '900px', margin: '0 auto' }}>
//             <div className="no-print" style={{
//               display: 'flex',
//               justifyContent: 'space-between',
//               alignItems: 'center',
//               marginBottom: '15px'
//             }}>
//               <div>
//                 <h3 style={{ color: '#fff', margin: 0 }}>Quotation Preview</h3>
//                 <p style={{ color: '#ccc', margin: '5px 0 0', fontSize: '13px' }}>{previewData.quotationNumber}</p>
//               </div>
//               <div style={{ display: 'flex', gap: '10px' }}>
//                 <button onClick={() => window.print()} style={{ background: '#fff', color: '#111', padding: '10px 20px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>
//                   🖨 Print
//                 </button>
//                 <button onClick={() => setPreviewData(null)} style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', padding: '10px 20px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
//                   ✕ Close
//                 </button>
//               </div>
//             </div>

//             {/* PDF CONTENT - DYNAMIC COLUMNS (FIXED) */}
//             <div id="quotation-pdf-content" ref={printRef} style={{
//               background: '#ffffff',
//               padding: '12mm 8mm 8mm',
//               position: 'relative',
//               width: '210mm',
//               minHeight: '297mm',
//               margin: '0 auto',
//               boxShadow: '0 3px 20px rgba(0,0,0,0.12)',
//               fontFamily: 'Arial, Helvetica, sans-serif',
//               color: '#111111',
//               boxSizing: 'border-box'
//             }}>

//               <div className="quote-heading" style={{
//                 textAlign: 'center',
//                 color: '#062d73',
//                 fontSize: '24px',
//                 fontWeight: 800,
//                 textDecoration: 'underline',
//                 marginBottom: '8mm'
//               }}>
//                 QUOTATION
//               </div>

//               <div className="quote-header" style={{
//                 display: 'grid',
//                 gridTemplateColumns: '1fr 1fr 1fr',
//                 gap: '5mm',
//                 alignItems: 'start',
//                 minHeight: '43mm'
//               }}>
//                 <div className="company-info" style={{ fontSize: '10px', lineHeight: '1.45' }}>
//                   <div className="company-name" style={{ fontWeight: 700, fontSize: '11px', marginBottom: '1mm' }}>
//                     {previewData.companyName || 'Your Company'}
//                   </div>
//                   <div className="company-address" style={{ whiteSpace: 'normal' }}>
//                     {previewData.companyAddress || 'Company Address'}
//                   </div>
//                   <div>Phone: {previewData.companyPhone || 'N/A'}</div>
//                   <div>Email: {previewData.companyEmail || '-'}</div>
//                 </div>

//                 <div className="quote-logo" style={{ textAlign: 'center', paddingTop: '2mm' }}>
//                   <img src={previewData.companyLogo || '/PN.png'} alt="Company Logo" style={{ width: '33mm', height: '33mm', objectFit: 'contain', display: 'block', margin: '0 auto' }} onError={e => { e.target.style.display = 'none' }} />
//                 </div>

//                 <div className="quote-info" style={{ fontSize: '10px', lineHeight: '1.8' }}>
//                   <div style={{ display: 'grid', gridTemplateColumns: '32mm 1fr', gap: '2mm' }}>
//                     <strong style={{ textAlign: 'right' }}>Quote #</strong>
//                     <span style={{ textAlign: 'left' }}>{previewData.quotationNumber}</span>
//                   </div>
//                   <div style={{ display: 'grid', gridTemplateColumns: '32mm 1fr', gap: '2mm' }}>
//                     <strong style={{ textAlign: 'right' }}>Date</strong>
//                     <span style={{ textAlign: 'left' }}>{previewData.date}</span>
//                   </div>
//                   <div style={{ display: 'grid', gridTemplateColumns: '32mm 1fr', gap: '2mm' }}>
//                     <strong style={{ textAlign: 'right' }}>Validity</strong>
//                     <span style={{ textAlign: 'left' }}>
//                       {previewData.validity ? `${previewData.validity} Days` : 'N/A'}
//                     </span>
//                   </div>
//                   {previewData.validity && previewData.date && (
//                     <div style={{ display: 'grid', gridTemplateColumns: '32mm 1fr', gap: '2mm' }}>
//                       <strong style={{ textAlign: 'right' }}>Valid Till</strong>
//                       <span style={{ textAlign: 'left' }}>
//                         {(() => {
//                           const dateObj = new Date(previewData.date)
//                           dateObj.setDate(dateObj.getDate() + Number(previewData.validity))
//                           return dateObj.toISOString().split('T')[0]
//                         })()}
//                       </span>
//                     </div>
//                   )}
//                 </div>
//               </div>

//               <div className="quote-to-title" style={{
//                 background: '#062d73',
//                 color: '#ffffff',
//                 fontSize: '11px',
//                 fontWeight: 700,
//                 padding: '2mm 4mm',
//                 marginTop: '2mm'
//               }}>
//                 QUOTE TO
//               </div>
//               <div className="quote-to-content" style={{
//                 padding: '3mm 4mm',
//                 minHeight: '18mm',
//                 fontSize: '10px',
//                 lineHeight: '1.7'
//               }}>
//                 <strong>{previewData.customer?.name || ''}</strong>
//                 {previewData.customer?.company && <div>{previewData.customer.company}</div>}
//                 {previewData.customer?.address && <div>{previewData.customer.address}</div>}
//                 {previewData.customer?.phone && <div>Phone: {previewData.customer.phone}</div>}
//               </div>

//               {previewData.project && (
//                 <div className="project-row" style={{
//                   padding: '2mm 4mm',
//                   fontSize: '9px',
//                   border: '0.35mm solid #062d73',
//                   marginTop: '2mm',
//                   backgroundColor: '#f8f9fa'
//                 }}>
//                   <strong>Project: </strong>
//                   <span>{previewData.project}</span>
//                 </div>
//               )}

//               {/* ==================================================
//                   DYNAMIC TABLE - FIXED
//                   ================================================== */}

//               {(() => {
//                 // CHECK PREVIEW DATA ITEMS
//                 const previewItems = previewData.items || []
                
//                 // Check if ANY item has item or brand
//                 const showItem = previewItems.some(item => item.item && item.item.trim() !== '')
//                 const showBrand = previewItems.some(item => item.brand && item.brand.trim() !== '')

//                 return (
//                   <table className="quote-table" style={{
//                     width: '100%',
//                     borderCollapse: 'collapse',
//                     tableLayout: 'fixed',
//                     fontSize: '9px',
//                     borderLeft: '0.35mm solid #111111',
//                     borderRight: '0.35mm solid #111111',
//                     marginTop: previewData.project ? '2mm' : '0'
//                   }}>
//                     <thead>
//                       <tr>
//                         <th style={{ width: showItem ? '4%' : showBrand ? '5%' : '5%', textAlign: 'center', borderLeft: '0.35mm solid #111111', borderRight: '0.35mm solid #111111', padding: '1.3mm 1mm', verticalAlign: 'middle', fontSize: '9px', fontWeight: 700, height: '9mm', backgroundColor: '#f5f5f5', borderTop: '0.35mm solid #111111', borderBottom: '0.35mm solid #111111' }}>#</th>
//                         {showItem && (
//                           <th style={{ width: '18%', textAlign: 'left', borderLeft: '0.35mm solid #111111', borderRight: '0.35mm solid #111111', padding: '1.3mm 1mm', verticalAlign: 'middle', fontSize: '9px', fontWeight: 700, height: '9mm', backgroundColor: '#f5f5f5', borderTop: '0.35mm solid #111111', borderBottom: '0.35mm solid #111111' }}>Item</th>
//                         )}
//                         {showBrand && (
//                           <th style={{ width: '14%', textAlign: 'left', borderLeft: '0.35mm solid #111111', borderRight: '0.35mm solid #111111', padding: '1.3mm 1mm', verticalAlign: 'middle', fontSize: '9px', fontWeight: 700, height: '9mm', backgroundColor: '#f5f5f5', borderTop: '0.35mm solid #111111', borderBottom: '0.35mm solid #111111' }}>Brand</th>
//                         )}
//                         <th style={{ width: showItem ? '24%' : showBrand ? '32%' : '40%', textAlign: 'left', borderLeft: '0.35mm solid #111111', borderRight: '0.35mm solid #111111', padding: '1.3mm 1mm', verticalAlign: 'middle', fontSize: '9px', fontWeight: 700, height: '9mm', backgroundColor: '#f5f5f5', borderTop: '0.35mm solid #111111', borderBottom: '0.35mm solid #111111' }}>Description</th>
//                         <th style={{ width: '6%', textAlign: 'center', borderLeft: '0.35mm solid #111111', borderRight: '0.35mm solid #111111', padding: '1.3mm 1mm', verticalAlign: 'middle', fontSize: '9px', fontWeight: 700, height: '9mm', backgroundColor: '#f5f5f5', borderTop: '0.35mm solid #111111', borderBottom: '0.35mm solid #111111' }}>UOM</th>
//                         <th style={{ width: '6%', textAlign: 'center', borderLeft: '0.35mm solid #111111', borderRight: '0.35mm solid #111111', padding: '1.3mm 1mm', verticalAlign: 'middle', fontSize: '9px', fontWeight: 700, height: '9mm', backgroundColor: '#f5f5f5', borderTop: '0.35mm solid #111111', borderBottom: '0.35mm solid #111111' }}>Qty</th>
//                         <th style={{ width: '12%', textAlign: 'center', borderLeft: '0.35mm solid #111111', borderRight: '0.35mm solid #111111', padding: '1.3mm 1mm', verticalAlign: 'middle', fontSize: '9px', fontWeight: 700, height: '9mm', backgroundColor: '#f5f5f5', borderTop: '0.35mm solid #111111', borderBottom: '0.35mm solid #111111' }}>Unit Price</th>
//                         <th style={{ width: '12%', textAlign: 'center', borderLeft: '0.35mm solid #111111', borderRight: '0.35mm solid #111111', padding: '1.3mm 1mm', verticalAlign: 'middle', fontSize: '9px', fontWeight: 700, height: '9mm', backgroundColor: '#f5f5f5', borderTop: '0.35mm solid #111111', borderBottom: '0.35mm solid #111111' }}>Total</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {previewItems.map((item, index) => {
//                         const qty = Number(item.qty) || 0
//                         const price = Number(item.price) || 0
//                         const total = qty * price
//                         return (
//                           <tr key={index}>
//                             <td style={{ textAlign: 'center', borderLeft: '0.35mm solid #111111', borderRight: '0.35mm solid #111111', padding: '1.3mm 1mm', verticalAlign: 'middle', height: '7mm', borderTop: 'none', borderBottom: 'none' }}>{index + 1}</td>
//                             {showItem && (
//                               <td style={{ textAlign: 'left', borderLeft: '0.35mm solid #111111', borderRight: '0.35mm solid #111111', padding: '1.3mm 1mm', verticalAlign: 'middle', height: '7mm', borderTop: 'none', borderBottom: 'none' }}>{item.item || '-'}</td>
//                             )}
//                             {showBrand && (
//                               <td style={{ textAlign: 'left', borderLeft: '0.35mm solid #111111', borderRight: '0.35mm solid #111111', padding: '1.3mm 1mm', verticalAlign: 'middle', height: '7mm', borderTop: 'none', borderBottom: 'none' }}>{item.brand || '-'}</td>
//                             )}
//                             <td style={{ textAlign: 'left', borderLeft: '0.35mm solid #111111', borderRight: '0.35mm solid #111111', padding: '1.3mm 1mm', verticalAlign: 'middle', height: '7mm', borderTop: 'none', borderBottom: 'none', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{item.description || '-'}</td>
//                             <td style={{ textAlign: 'center', borderLeft: '0.35mm solid #111111', borderRight: '0.35mm solid #111111', padding: '1.3mm 1mm', verticalAlign: 'middle', height: '7mm', borderTop: 'none', borderBottom: 'none' }}>{item.uom || 'PCS'}</td>
//                             <td style={{ textAlign: 'center', borderLeft: '0.35mm solid #111111', borderRight: '0.35mm solid #111111', padding: '1.3mm 1mm', verticalAlign: 'middle', height: '7mm', borderTop: 'none', borderBottom: 'none' }}>{qty}</td>
//                             <td className="number-cell" style={{ textAlign: 'right', paddingRight: '2mm', borderLeft: '0.35mm solid #111111', borderRight: '0.35mm solid #111111', padding: '1.3mm 1mm', verticalAlign: 'middle', height: '7mm', borderTop: 'none', borderBottom: 'none' }}>Rs {currency(price)}</td>
//                             <td className="number-cell" style={{ textAlign: 'right', paddingRight: '2mm', borderLeft: '0.35mm solid #111111', borderRight: '0.35mm solid #111111', padding: '1.3mm 1mm', verticalAlign: 'middle', height: '7mm', borderTop: 'none', borderBottom: 'none' }}>Rs {currency(total)}</td>
//                           </tr>
//                         )
//                       })}

//                       {Array.from({ length: Math.max(0, 8 - (previewItems.length || 0)) }).map((_, i) => (
//                         <tr key={`empty-${i}`} className="empty-item-row">
//                           <td style={{ height: '6.5mm', borderLeft: '0.35mm solid #111111', borderRight: '0.35mm solid #111111', padding: '1.3mm 1mm', verticalAlign: 'middle', borderTop: 'none', borderBottom: 'none' }}></td>
//                           {showItem && <td style={{ height: '6.5mm', borderLeft: '0.35mm solid #111111', borderRight: '0.35mm solid #111111', padding: '1.3mm 1mm', verticalAlign: 'middle', borderTop: 'none', borderBottom: 'none' }}></td>}
//                           {showBrand && <td style={{ height: '6.5mm', borderLeft: '0.35mm solid #111111', borderRight: '0.35mm solid #111111', padding: '1.3mm 1mm', verticalAlign: 'middle', borderTop: 'none', borderBottom: 'none' }}></td>}
//                           <td style={{ height: '6.5mm', borderLeft: '0.35mm solid #111111', borderRight: '0.35mm solid #111111', padding: '1.3mm 1mm', verticalAlign: 'middle', borderTop: 'none', borderBottom: 'none' }}></td>
//                           <td style={{ height: '6.5mm', borderLeft: '0.35mm solid #111111', borderRight: '0.35mm solid #111111', padding: '1.3mm 1mm', verticalAlign: 'middle', borderTop: 'none', borderBottom: 'none' }}></td>
//                           <td style={{ height: '6.5mm', borderLeft: '0.35mm solid #111111', borderRight: '0.35mm solid #111111', padding: '1.3mm 1mm', verticalAlign: 'middle', borderTop: 'none', borderBottom: 'none' }}></td>
//                           <td style={{ height: '6.5mm', borderLeft: '0.35mm solid #111111', borderRight: '0.35mm solid #111111', padding: '1.3mm 1mm', verticalAlign: 'middle', borderTop: 'none', borderBottom: 'none' }}></td>
//                           <td style={{ height: '6.5mm', borderLeft: '0.35mm solid #111111', borderRight: '0.35mm solid #111111', padding: '1.3mm 1mm', verticalAlign: 'middle', borderTop: 'none', borderBottom: 'none' }}></td>
//                         </tr>
//                       ))}

//                       <tr>
//                         <td style={{ height: '1mm', borderLeft: '0.35mm solid #111111', borderRight: '0.35mm solid #111111', borderBottom: '0.35mm solid #111111', padding: 0 }}></td>
//                         {showItem && <td style={{ height: '1mm', borderLeft: '0.35mm solid #111111', borderRight: '0.35mm solid #111111', borderBottom: '0.35mm solid #111111', padding: 0 }}></td>}
//                         {showBrand && <td style={{ height: '1mm', borderLeft: '0.35mm solid #111111', borderRight: '0.35mm solid #111111', borderBottom: '0.35mm solid #111111', padding: 0 }}></td>}
//                         <td style={{ height: '1mm', borderLeft: '0.35mm solid #111111', borderRight: '0.35mm solid #111111', borderBottom: '0.35mm solid #111111', padding: 0 }}></td>
//                         <td style={{ height: '1mm', borderLeft: '0.35mm solid #111111', borderRight: '0.35mm solid #111111', borderBottom: '0.35mm solid #111111', padding: 0 }}></td>
//                         <td style={{ height: '1mm', borderLeft: '0.35mm solid #111111', borderRight: '0.35mm solid #111111', borderBottom: '0.35mm solid #111111', padding: 0 }}></td>
//                         <td style={{ height: '1mm', borderLeft: '0.35mm solid #111111', borderRight: '0.35mm solid #111111', borderBottom: '0.35mm solid #111111', padding: 0 }}></td>
//                         <td style={{ height: '1mm', borderLeft: '0.35mm solid #111111', borderRight: '0.35mm solid #111111', borderBottom: '0.35mm solid #111111', padding: 0 }}></td>
//                       </tr>
//                     </tbody>
//                   </table>
//                 )
//               })()}

//               <div className="subtotal-row" style={{
//                 width: '100%',
//                 minHeight: '13mm',
//                 border: '0.35mm solid #062d73',
//                 borderTop: '0',
//                 display: 'grid',
//                 gridTemplateColumns: '1fr 45mm',
//                 alignItems: 'center',
//                 fontSize: '10px',
//                 fontWeight: 700,
//                 paddingLeft: '4mm',
//                 backgroundColor: '#f8f9fa'
//               }}>
//                 <span style={{ padding: '3mm 0', height: '100%', display: 'flex', alignItems: 'center', paddingLeft: '4mm' }}>TOTAL</span>
//                 <strong style={{ textAlign: 'right', paddingRight: '4mm', fontSize: '11px' }}>Rs {currency(previewData.total || 0)}</strong>
//               </div>

//               {previewData.terms && (
//                 <div className="terms-section" style={{
//                   minHeight: '58mm',
//                   border: '0.35mm solid #062d73',
//                   borderTop: '0',
//                   padding: '3mm 4mm',
//                   fontSize: '9px'
//                 }}>
//                   <strong style={{ fontSize: '10px' }}>Terms & Conditions</strong>
//                   <div className="terms-content" style={{ marginTop: '3mm', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>{previewData.terms}</div>
//                 </div>
//               )}

//               <div className="quote-bottom" style={{
//                 position: 'absolute',
//                 bottom: '8mm',
//                 left: '8mm',
//                 right: '8mm',
//                 height: '7mm',
//                 border: '0.35mm solid #062d73',
//                 display: 'flex',
//                 alignItems: 'center',
//                 justifyContent: 'center',
//                 color: '#c00000',
//                 fontSize: '11px',
//                 fontWeight: 700,
//                 backgroundColor: '#ffffff'
//               }}>
//                 Authorized Signatory
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* CSS */}
//       <style dangerouslySetInnerHTML={{ __html: `
//         * { box-sizing: border-box; }
//         .quotation-page { width: 100%; min-height: 100vh; background: #f3f4f6; padding: 30px; font-family: Arial, Helvetica, sans-serif; color: #111; }
//         .quotation-editor { max-width: 1100px; margin: 0 auto 35px; background: #ffffff; border-radius: 12px; padding: 25px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08); }
//         .quotation-editor-header { display: flex; align-items: center; justify-content: space-between; gap: 20px; margin-bottom: 25px; }
//         .quotation-editor-header h1 { margin: 0 0 5px; font-size: 28px; }
//         .quotation-editor-header p { margin: 0; color: #666; font-size: 14px; }
//         .quotation-editor-actions { display: flex; gap: 10px; flex-wrap: wrap; }
//         .btn { border: none; border-radius: 7px; padding: 11px 18px; cursor: pointer; font-size: 14px; font-weight: 600; }
//         .btn:disabled { opacity: 0.6; cursor: not-allowed; }
//         .btn-primary { background: #062d73; color: #fff; }
//         .btn-secondary { background: #e5e7eb; color: #111; }
//         .btn-dark { background: #111827; color: #fff; }
//         .btn-small { padding: 8px 14px; }
//         .quotation-alert { padding: 12px 15px; border-radius: 7px; margin-bottom: 20px; font-size: 14px; }
//         .quotation-success { background: #dcfce7; color: #166534; }
//         .quotation-error { background: #fee2e2; color: #991b1b; }
//         .editor-section { border: 1px solid #e5e7eb; border-radius: 9px; padding: 20px; margin-bottom: 20px; }
//         .editor-section h2 { margin: 0 0 18px; font-size: 17px; }
//         .editor-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
//         .field { display: flex; flex-direction: column; gap: 6px; }
//         .field-full { grid-column: 1 / -1; }
//         .field label { font-size: 13px; font-weight: 600; color: #374151; }
//         .field input, .field textarea, .field select { width: 100%; border: 1px solid #d1d5db; border-radius: 6px; padding: 10px 11px; outline: none; font-size: 14px; font-family: inherit; background: #fff; }
//         .field textarea { resize: vertical; }
//         .field input:focus, .field textarea:focus, .field select:focus { border-color: #062d73; box-shadow: 0 0 0 2px rgba(6, 45, 115, 0.08); }
//         .items-heading { display: flex; align-items: center; justify-content: space-between; margin-bottom: 15px; flex-wrap: wrap; gap: 10px; }
//         .items-heading h2 { margin: 0; }
//         .items-editor { display: flex; flex-direction: column; gap: 10px; }

//         @media print {
//           @page { size: A4; margin: 0; }
//           html, body { margin: 0 !important; padding: 0 !important; width: 210mm !important; min-width: 210mm !important; height: 297mm !important; min-height: 297mm !important; background: #ffffff !important; }
//           body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
//           body * { visibility: hidden !important; }
//           #quotation-pdf-content, #quotation-pdf-content * { visibility: visible !important; }
//           #quotation-pdf-content { position: absolute !important; left: 0 !important; top: 0 !important; width: 210mm !important; min-width: 210mm !important; max-width: 210mm !important; height: 297mm !important; min-height: 297mm !important; max-height: 297mm !important; margin: 0 !important; padding: 12mm 8mm 8mm !important; background: #ffffff !important; box-shadow: none !important; overflow: hidden !important; box-sizing: border-box !important; page-break-after: always !important; page-break-inside: avoid !important; }
//           .quotation-preview-overlay { position: static !important; display: block !important; width: 210mm !important; height: auto !important; margin: 0 !important; padding: 0 !important; background: transparent !important; overflow: visible !important; }
//           .quotation-preview-overlay > div { max-width: none !important; width: 210mm !important; margin: 0 !important; padding: 0 !important; }
//           .quotation-preview-overlay .no-print { display: none !important; }
//           .company-info, .quote-logo, .quote-info { visibility: visible !important; }
//           #quotation-pdf-content img { visibility: visible !important; display: block !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
//           .quote-to-title { background: #062d73 !important; color: #ffffff !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
//           .project-row { border: 0.35mm solid #062d73 !important; background-color: #f8f9fa !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
//           .quote-table { width: 100% !important; border-collapse: collapse !important; table-layout: fixed !important; }
//           .quote-table th { background: #f5f5f5 !important; border-left: 0.35mm solid #111111 !important; border-right: 0.35mm solid #111111 !important; border-top: 0.35mm solid #111111 !important; border-bottom: 0.35mm solid #111111 !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
//           .quote-table td { border-left: 0.35mm solid #111111 !important; border-right: 0.35mm solid #111111 !important; border-top: none !important; border-bottom: none !important; }
//           .quote-table tbody tr:last-child td { border-bottom: 0.35mm solid #111111 !important; }
//           .subtotal-row { border: 0.35mm solid #062d73 !important; border-top: 0 !important; background-color: #f8f9fa !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
//           .terms-section { border: 0.35mm solid #062d73 !important; border-top: 0 !important; }
//           .quote-bottom { color: #c00000 !important; border: 0.35mm solid #062d73 !important; background-color: #ffffff !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
//           .quotation-page { margin: 0 !important; padding: 0 !important; background: #ffffff !important; }
//         }

//         @media (max-width: 900px) {
//           .quotation-page { padding: 15px; }
//           #quotation-pdf-content { transform-origin: top center; width: 210mm; max-width: 100%; overflow-x: auto; }
//           .quotation-modal-content { max-width: 95% !important; max-height: 95vh !important; }
//           .item-editor-row { grid-template-columns: 35px 1fr 1fr !important; overflow-x: auto !important; }
//           .item-editor-row .field { min-width: 80px !important; }
//         }

//         @media (max-width: 650px) {
//           .quotation-editor-header { flex-direction: column; align-items: flex-start; }
//           .editor-grid { grid-template-columns: 1fr; }
//           .field-full { grid-column: auto; }
//           .item-editor-row { grid-template-columns: 1fr !important; overflow-x: auto !important; }
//           .item-number { justify-content: flex-start; }
//           .quotation-modal-content { max-width: 98% !important; max-height: 98vh !important; padding: 0 !important; }
//         }
//       `}} />

//     </div>
//   )
// }




//desc table column only show when desc available


// import { useState, useEffect, useRef } from 'react'
// import { ref, push, onValue, update, remove, get, set } from 'firebase/database'
// import { useAuth } from '../context/AuthContext'
// import { db } from '../firebase'
// import { todayISO, currency } from '../utils/helpers'
// import Loader from '../components/Loader'

// /* ============================================================
//    COMPANY INFORMATION - LOGO SET
//    ============================================================ */

// const COMPANY_NAME = 'Pearl Networks'
// const COMPANY_LOGO = '/PN.png'
// const COMPANY_ADDRESS =
//   'KCHS, Gohar Chamber, Office # 304, Shahra-e-Faisal, near Duty Free Shop, Karachi, 75600'
// const COMPANY_PHONE = '0341-1293604'
// const COMPANY_EMAIL = 'info@globalonesystem.com'

// /* ============================================================
//    EMPTY ITEM
//    ============================================================ */

// const emptyItem = {
//   item: '',
//   brand: '',
//   description: '',
//   uom: 'PCS',
//   qty: 1,
//   price: ''
// }

// /* ============================================================
//    SEQUENTIAL QUOTATION NUMBER GENERATOR - DATE BASED
//    ============================================================ */

// // Get today's date in YYYYMMDD format
// function getTodayDateString() {
//   const today = new Date()
//   const year = today.getFullYear()
//   const month = String(today.getMonth() + 1).padStart(2, '0')
//   const day = String(today.getDate()).padStart(2, '0')
//   return `${year}${month}${day}`
// }

// /* ============================================================
//    GET NEXT QUOTATION NUMBER
//    SIRF NUMBER READ KAREGA - INCREMENT NAHI KAREGA
//    ============================================================ */

// async function getNextQuotationNumber(companyId) {
//   try {
//     const dateStr = getTodayDateString()
//     const counterRef = ref(db, `companies/${companyId}/counters/quotation`)
//     const snapshot = await get(counterRef)

//     let lastNumber = 0
//     let lastDate = ''

//     if (snapshot.exists()) {
//       const data = snapshot.val()
//       lastNumber = data.number || 0
//       lastDate = data.date || ''
//     }

//     let nextNumber = lastNumber + 1

//     // New date -> counter reset
//     if (lastDate !== dateStr) {
//       nextNumber = 1
//     }

//     const padded = String(nextNumber).padStart(4, '0')
//     return `QTN-${dateStr}-${padded}`

//   } catch (error) {
//     console.error('Error getting quotation number:', error)
//     const dateStr = getTodayDateString()
//     const timestamp = Date.now().toString().slice(-6)
//     return `QTN-${dateStr}-${timestamp}`
//   }
// }

// /* ============================================================
//    INCREMENT QUOTATION COUNTER
//    SAVE KE WAQT INCREMENT HOGA
//    ============================================================ */

// async function incrementQuotationCounter(companyId) {
//   try {
//     const dateStr = getTodayDateString()
//     const counterRef = ref(db, `companies/${companyId}/counters/quotation`)
//     const snapshot = await get(counterRef)

//     let lastNumber = 0
//     let lastDate = ''

//     if (snapshot.exists()) {
//       const data = snapshot.val()
//       lastNumber = data.number || 0
//       lastDate = data.date || ''
//     }

//     let newNumber = lastNumber + 1

//     // New date -> reset
//     if (lastDate !== dateStr) {
//       newNumber = 1
//     }

//     await set(counterRef, {
//       date: dateStr,
//       number: newNumber
//     })

//     return {
//       number: newNumber,
//       date: dateStr
//     }

//   } catch (error) {
//     console.error('Error incrementing counter:', error)
//     return null
//   }
// }

// /* ============================================================
//    MAIN QUOTATION COMPONENT
//    ============================================================ */

// export default function Quotation() {

//   const { companyId } = useAuth()
//   const printRef = useRef(null)

//   /* ============================================================
//      BASIC STATE
//      ============================================================ */

//   const [loading, setLoading] = useState(true)
//   const [quotations, setQuotations] = useState([])
//   const [customers, setCustomers] = useState([])

//   /* ============================================================
//      FORM STATE
//      ============================================================ */

//   const [showForm, setShowForm] = useState(false)
//   const [editingId, setEditingId] = useState(null)
//   const [customerId, setCustomerId] = useState('')
//   const [quotationNumber, setQuotationNumber] = useState('')
//   const [date, setDate] = useState(todayISO())
//   const [validity, setValidity] = useState('')
//   const [project, setProject] = useState('')
//   const [items, setItems] = useState([])
//   const [terms, setTerms] = useState('')
//   const [previewData, setPreviewData] = useState(null)

//   /* ============================================================
//      CURRENT ITEM
//      ============================================================ */

//   const [currentItem, setCurrentItem] = useState({ ...emptyItem })

//   /* ============================================================
//      EDIT PRODUCT STATE
//      ============================================================ */

//   const [editingProductIndex, setEditingProductIndex] = useState(null)
//   const [editProduct, setEditProduct] = useState({
//     item: '',
//     brand: '',
//     description: '',
//     uom: 'PCS',
//     qty: 1,
//     price: ''
//   })

//   /* ============================================================
//      STATUS
//      ============================================================ */

//   const [saving, setSaving] = useState(false)
//   const [error, setError] = useState('')
//   const [success, setSuccess] = useState('')
//   const [generatingPdf, setGeneratingPdf] = useState(false)

//   /* ============================================================
//      LOAD DATA
//      ============================================================ */

//   useEffect(() => {

//     if (!companyId) {
//       setLoading(false)
//       return
//     }

//     /* ==========================================================
//        LOAD CUSTOMERS
//        ========================================================== */

//     const customersRef = ref(db, `companies/${companyId}/customers`)
//     const unsubscribeCustomers = onValue(customersRef, (snapshot) => {
//       const data = snapshot.val() || {}
//       const list = Object.entries(data).map(([id, customer]) => ({
//         id,
//         ...customer
//       }))
//       setCustomers(list)
//     })

//     /* ==========================================================
//        LOAD QUOTATIONS
//        ========================================================== */

//     const quotationsRef = ref(db, `companies/${companyId}/quotations`)
//     const unsubscribeQuotations = onValue(quotationsRef, (snapshot) => {
//       const data = snapshot.val() || {}
//       const list = Object.entries(data)
//         .map(([id, quotation]) => ({
//           id,
//           ...quotation
//         }))
//         .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
//       setQuotations(list)
//       setLoading(false)
//     })

//     /* ==========================================================
//        CLEANUP
//        ========================================================== */

//     return () => {
//       unsubscribeCustomers()
//       unsubscribeQuotations()
//     }

//   }, [companyId])

//   /* ============================================================
//      CALCULATE SUBTOTAL
//      ============================================================ */

//   const calculateSubtotal = () => {
//     return items.reduce((sum, item) => {
//       const qty = Number(item.qty) || 0
//       const price = Number(item.price) || 0
//       return sum + qty * price
//     }, 0)
//   }

//   /* ============================================================
//      CALCULATE TOTAL
//      NO TAX
//      ============================================================ */

//   const calculateTotal = () => {
//     return calculateSubtotal()
//   }

//   /* ============================================================
//      ADD ITEM
//      ============================================================ */

//   const addItem = () => {

//     if (!currentItem.item.trim() && !currentItem.description.trim()) {
//       setError('Either Item or Description is required')
//       return
//     }

//     const newItem = {
//       item: currentItem.item ? currentItem.item.trim() : '',
//       brand: currentItem.brand ? currentItem.brand.trim() : '',
//       description: currentItem.description ? currentItem.description.trim() : '',
//       uom: currentItem.uom || 'PCS',
//       qty: Math.max(1, Number(currentItem.qty) || 1),
//       price: Math.max(0, Number(currentItem.price) || 0)
//     }

//     setItems([...items, newItem])
//     setCurrentItem({ ...emptyItem })
//     setError('')
//   }

//   /* ============================================================
//      REMOVE ITEM
//      ============================================================ */

//   const removeItem = (index) => {
//     setItems(items.filter((_, i) => i !== index))
//   }

//   /* ============================================================
//      EDIT PRODUCT - OPEN
//      ============================================================ */

//   const openEditProduct = (index) => {
//     const item = items[index]
//     setEditingProductIndex(index)
//     setEditProduct({
//       item: item.item || '',
//       brand: item.brand || '',
//       description: item.description || '',
//       uom: item.uom || 'PCS',
//       qty: item.qty || 1,
//       price: item.price === 0 ? '' : item.price
//     })
//   }

//   /* ============================================================
//      EDIT PRODUCT - SAVE
//      ============================================================ */

//   const saveEditProduct = () => {

//     if (!editProduct.item.trim() && !editProduct.description.trim()) {
//       setError('Either Item or Description is required')
//       return
//     }

//     const updatedItems = [...items]
//     updatedItems[editingProductIndex] = {
//       item: editProduct.item ? editProduct.item.trim() : '',
//       brand: editProduct.brand ? editProduct.brand.trim() : '',
//       description: editProduct.description ? editProduct.description.trim() : '',
//       uom: editProduct.uom || 'PCS',
//       qty: Math.max(1, Number(editProduct.qty) || 1),
//       price: Math.max(0, Number(editProduct.price) || 0)
//     }

//     setItems(updatedItems)
//     setEditingProductIndex(null)
//     setEditProduct({
//       item: '',
//       brand: '',
//       description: '',
//       uom: 'PCS',
//       qty: 1,
//       price: ''
//     })
//     setError('')
//   }

//   /* ============================================================
//      EDIT PRODUCT - CLOSE
//      ============================================================ */

//   const closeEditProduct = () => {
//     setEditingProductIndex(null)
//     setEditProduct({
//       item: '',
//       brand: '',
//       description: '',
//       uom: 'PCS',
//       qty: 1,
//       price: ''
//     })
//   }

//   /* ============================================================
//      RESET FORM
//      ============================================================ */

//   const resetForm = () => {
//     setCustomerId('')
//     setQuotationNumber('')
//     setDate(todayISO())
//     setValidity('')
//     setProject('')
//     setItems([])
//     setTerms('')
//     setCurrentItem({ ...emptyItem })
//     setEditingId(null)
//     setError('')
//     setSuccess('')
//     setEditingProductIndex(null)
//     setEditProduct({
//       item: '',
//       brand: '',
//       description: '',
//       uom: 'PCS',
//       qty: 1,
//       price: ''
//     })
//   }

//   /* ============================================================
//      OPEN NEW QUOTATION
//      ============================================================ */

//   const openNewQuotation = async () => {
//     resetForm()
//     if (companyId) {
//       const number = await getNextQuotationNumber(companyId)
//       setQuotationNumber(number)
//     }
//     setShowForm(true)
//   }

//   /* ============================================================
//      OPEN EDIT QUOTATION
//      ============================================================ */

//   const openEditQuotation = (quotation) => {
//     setEditingId(quotation.id)
//     setCustomerId(quotation.customerId || '')
//     setQuotationNumber(quotation.quotationNumber || '')
//     setDate(quotation.date || todayISO())
//     setValidity(quotation.validity || '')
//     setProject(quotation.project || '')
//     setItems(quotation.items || [])
//     setTerms(quotation.terms || '')
//     setShowForm(true)
//     setError('')
//   }

//   /* ============================================================
//      SAVE QUOTATION
//      ============================================================ */

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     setError('')
//     setSuccess('')

//     if (!companyId) {
//       setError('Company ID not found')
//       return
//     }

//     if (!customerId) {
//       setError('Please select a customer')
//       return
//     }

//     if (items.length === 0) {
//       setError('Add at least one item')
//       return
//     }

//     const customer = customers.find(c => c.id === customerId)
//     if (!customer) {
//       setError('Customer not found')
//       return
//     }

//     setSaving(true)

//     try {
//       const subtotal = calculateSubtotal()
//       const total = calculateTotal()

//       let finalQuotationNumber = quotationNumber

//       if (!editingId) {
//         await incrementQuotationCounter(companyId)

//         if (!finalQuotationNumber || finalQuotationNumber.trim() === '') {
//           const dateStr = getTodayDateString()
//           const timestamp = Date.now().toString().slice(-6)
//           finalQuotationNumber = `QTN-${dateStr}-${timestamp}`
//           setQuotationNumber(finalQuotationNumber)
//         }
//       }

//       const quotationData = {
//         quotationNumber: finalQuotationNumber,
//         date: date || todayISO(),
//         validity: validity || '',
//         project: project || '',
//         customerId: customerId,
//         customerName: customer.name || '',
//         customerCompany: customer.company || '',
//         customerPhone: customer.phone || '',
//         customerAddress: customer.address || '',
//         companyName: COMPANY_NAME,
//         companyLogo: COMPANY_LOGO,
//         companyAddress: COMPANY_ADDRESS,
//         companyPhone: COMPANY_PHONE,
//         companyEmail: COMPANY_EMAIL,
//         items: items,
//         subtotal: subtotal,
//         total: total,
//         terms: terms || '',
//         updatedAt: Date.now()
//       }

//       if (editingId) {
//         const quotationRef = ref(db, `companies/${companyId}/quotations/${editingId}`)
//         await update(quotationRef, {
//           ...quotationData,
//           updatedAt: Date.now()
//         })
//         setSuccess('Quotation updated successfully!')
//       } else {
//         const quotationsRef = ref(db, `companies/${companyId}/quotations`)
//         quotationData.createdAt = Date.now()
//         await push(quotationsRef, quotationData)
//         setSuccess('Quotation created successfully!')
//       }

//       setPreviewData({
//         ...quotationData,
//         id: editingId || 'new',
//         customer: {
//           name: customer.name,
//           company: customer.company,
//           phone: customer.phone,
//           address: customer.address
//         }
//       })

//       setShowForm(false)
//       resetForm()

//     } catch (err) {
//       console.error('Save error:', err)
//       setError(err.message || 'Failed to save quotation')
//     } finally {
//       setSaving(false)
//     }
//   }

//   /* ============================================================
//      DELETE QUOTATION
//      ============================================================ */

//   const deleteQuotation = async (id) => {
//     if (!confirm('Are you sure you want to delete this quotation?')) return

//     try {
//       const quotationRef = ref(db, `companies/${companyId}/quotations/${id}`)
//       await remove(quotationRef)
//       setSuccess('Quotation deleted successfully!')
//     } catch (err) {
//       console.error('Delete error:', err)
//       setError('Failed to delete quotation')
//     }
//   }

//   /* ============================================================
//      PREVIEW
//      ============================================================ */

//   const handlePreview = (quotation) => {
//     setPreviewData({
//       ...quotation,
//       customer: {
//         name: quotation.customerName,
//         company: quotation.customerCompany,
//         phone: quotation.customerPhone,
//         address: quotation.customerAddress
//       }
//     })
//   }

//   /* ============================================================
//      SAVE AS PDF
//      ============================================================ */

//   const handleSavePdf = async (quotation) => {
//     setGeneratingPdf(true)

//     try {
//       const previewQuotation = {
//         ...quotation,
//         customer: {
//           name: quotation.customerName,
//           company: quotation.customerCompany,
//           phone: quotation.customerPhone,
//           address: quotation.customerAddress
//         }
//       }

//       setPreviewData(previewQuotation)

//       await new Promise(resolve => setTimeout(resolve, 500))

//       window.print()

//     } catch (error) {
//       console.error('Print error:', error)
//       alert('Print preview open nahi ho saka.')
//     } finally {
//       setGeneratingPdf(false)
//     }
//   }

//   /* ============================================================
//      RENDER
//      ============================================================ */

//   return (
//     <div className="quotation-page">

//       <div className="quotation-editor no-print">

//         <div className="quotation-editor-header">
//           <div>
//             <h1>Quotations</h1>
//             <p>Create and manage quotations for your customers</p>
//           </div>
//           <div className="quotation-editor-actions">
//             <button onClick={openNewQuotation} className="btn btn-primary">
//               + New Quotation
//             </button>
//           </div>
//         </div>

//         {success && (
//           <div className="quotation-alert quotation-success">
//             {success}
//           </div>
//         )}

//         {error && (
//           <div className="quotation-alert quotation-error">
//             {error}
//           </div>
//         )}

//         {loading ? (
//           <Loader />
//         ) : quotations.length === 0 ? (
//           <div style={{ textAlign: 'center', padding: '40px 0', color: '#666' }}>
//             <p>No quotations yet. Create your first quotation!</p>
//           </div>
//         ) : (
//           <div style={{ overflowX: 'auto', marginTop: '20px' }}>
//             <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
//               <thead>
//                 <tr style={{ borderBottom: '2px solid #e5e7eb', textAlign: 'left' }}>
//                   <th style={{ padding: '10px', width: '15%' }}>#</th>
//                   <th style={{ padding: '10px', width: '25%' }}>Customer</th>
//                   <th style={{ padding: '10px', width: '12%' }}>Date</th>
//                   <th style={{ padding: '10px', width: '10%' }}>Validity</th>
//                   <th style={{ padding: '10px', width: '13%' }}>Total</th>
//                   <th style={{ padding: '10px', width: '25%', textAlign: 'right' }}>Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {quotations.map((q, index) => (
//                   <tr key={q.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
//                     <td style={{ padding: '10px' }}>{q.quotationNumber}</td>
//                     <td style={{ padding: '10px' }}>
//                       <div style={{ fontWeight: 600 }}>{q.customerName}</div>
//                       <div style={{ fontSize: '12px', color: '#666' }}>{q.customerCompany}</div>
//                     </td>
//                     <td style={{ padding: '10px' }}>{q.date}</td>
//                     <td style={{ padding: '10px' }}>{q.validity || '-'}</td>
//                     <td style={{ padding: '10px', fontWeight: 700 }}>Rs {currency(q.total || 0)}</td>
//                     <td style={{ padding: '10px', textAlign: 'right', whiteSpace: 'nowrap' }}>
//                       <button onClick={() => handlePreview(q)} style={{ marginRight: '6px', padding: '5px 10px', border: 'none', borderRadius: '4px', background: '#062d73', color: '#fff', cursor: 'pointer', fontSize: '12px', display: 'inline-block' }}>
//                         View
//                       </button>
//                       <button onClick={() => openEditQuotation(q)} style={{ marginRight: '6px', padding: '5px 10px', border: 'none', borderRadius: '4px', background: '#e5e7eb', color: '#111', cursor: 'pointer', fontSize: '12px', display: 'inline-block' }}>
//                         Edit
//                       </button>
//                       <button onClick={() => deleteQuotation(q.id)} style={{ marginRight: '6px', padding: '5px 10px', border: 'none', borderRadius: '4px', background: '#fee2e2', color: '#dc2626', cursor: 'pointer', fontSize: '12px', display: 'inline-block' }}>
//                         Delete
//                       </button>
//                       <button onClick={() => handleSavePdf(q)} disabled={generatingPdf} style={{ padding: '5px 10px', border: 'none', borderRadius: '4px', background: '#dc2626', color: '#fff', cursor: generatingPdf ? 'not-allowed' : 'pointer', opacity: generatingPdf ? 0.6 : 1, fontSize: '12px', display: 'inline-block' }}>
//                         {generatingPdf ? '⏳' : '📄 PDF'}
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}

//       </div>

//       {/* ========================================================
//           QUOTATION FORM MODAL
//           ======================================================== */}

//       {showForm && (
//         <div className="quotation-modal-overlay" style={{
//           position: 'fixed',
//           inset: 0,
//           zIndex: 9999,
//           backgroundColor: 'rgba(0,0,0,0.5)',
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'center',
//           padding: '20px',
//           overflow: 'auto'
//         }}>
//           <div className="quotation-modal-content" style={{
//             backgroundColor: '#fff',
//             borderRadius: '12px',
//             maxWidth: '1000px',
//             width: '100%',
//             maxHeight: '90vh',
//             overflow: 'hidden',
//             display: 'flex',
//             flexDirection: 'column',
//             boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
//           }}>

//             <div style={{
//               padding: '20px 25px',
//               borderBottom: '1px solid #e5e7eb',
//               display: 'flex',
//               justifyContent: 'space-between',
//               alignItems: 'center',
//               flexShrink: 0,
//               backgroundColor: '#fff',
//               borderTopLeftRadius: '12px',
//               borderTopRightRadius: '12px'
//             }}>
//               <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>
//                 {editingId ? 'Edit Quotation' : 'New Quotation'}
//               </h2>
//               <button onClick={() => { setShowForm(false); resetForm() }} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#666', padding: '0 10px' }}>
//                 ✕
//               </button>
//             </div>

//             <div style={{
//               padding: '20px 25px',
//               overflowY: 'auto',
//               flex: 1,
//               backgroundColor: '#fafafa'
//             }}>
//               <form onSubmit={handleSubmit}>

//                 <div className="editor-section" style={{ background: '#fff' }}>
//                   <div className="editor-grid">
//                     <div className="field">
//                       <label>Customer *</label>
//                       <select value={customerId} onChange={e => setCustomerId(e.target.value)} required style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }}>
//                         <option value="">Select customer...</option>
//                         {customers.map(c => (
//                           <option key={c.id} value={c.id}>
//                             {c.name} {c.company ? `- ${c.company}` : ''}
//                           </option>
//                         ))}
//                       </select>
//                     </div>

//                     <div className="field">
//                       <label>Quotation #</label>
//                       <input type="text" value={quotationNumber} onChange={e => setQuotationNumber(e.target.value)} placeholder="Will be generated on save" style={{ background: '#f3f4f6', fontWeight: 'bold' }} />
//                       <small style={{ color: '#666', fontSize: '11px' }}>Format: QTN-YYYYMMDD-0001</small>
//                     </div>

//                     <div className="field">
//                       <label>Date *</label>
//                       <input type="date" value={date} onChange={e => setDate(e.target.value)} required />
//                     </div>

//                     <div className="field">
//                       <label>Validity (Days) *</label>
//                       <input type="number" min="1" max="365" value={validity} onChange={e => setValidity(e.target.value)} placeholder="e.g., 30" required style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }} />
//                       <small style={{ color: '#666', fontSize: '11px' }}>Number of days quotation is valid (e.g., 30, 60, 90)</small>
//                     </div>

//                     <div className="field field-full">
//                       <label>Project</label>
//                       <input type="text" value={project} onChange={e => setProject(e.target.value)} placeholder="Project name (optional)" />
//                     </div>
//                   </div>
//                 </div>

//                 {/* ==================================================
//                     ITEMS - WITH ITEM & BRAND (OPTIONAL)
//                     ================================================== */}

//                 <div className="editor-section" style={{ background: '#fff' }}>
//                   <div className="items-heading">
//                     <h2>Items</h2>
//                     <span style={{ fontSize: '14px', color: '#666' }}>Total: Rs {currency(calculateTotal())}</span>
//                   </div>

//                   <div className="items-editor">

//                     {/* ADD ITEM ROW - WITH ITEM & BRAND (OPTIONAL) */}

//                     <div className="item-editor-row" style={{
//                       display: 'grid',
//                       gridTemplateColumns: '35px 1fr 1fr 1fr 80px 70px 90px 120px 70px',
//                       gap: '8px',
//                       alignItems: 'end',
//                       padding: '12px',
//                       border: '1px solid #e5e7eb',
//                       borderRadius: '8px',
//                       background: '#f9fafb',
//                       width: '100%'
//                     }}>
//                       <div className="item-number" style={{ height: '39px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#555' }}>
//                         <span>#</span>
//                       </div>

//                       {/* ITEM - OPTIONAL */}
//                       <div className="field">
//                         <input
//                           value={currentItem.item}
//                           onChange={e => setCurrentItem({ ...currentItem, item: e.target.value })}
//                           placeholder="Item (Optional)"
//                           style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }}
//                         />
//                       </div>

//                       {/* BRAND - OPTIONAL */}
//                       <div className="field">
//                         <input
//                           value={currentItem.brand}
//                           onChange={e => setCurrentItem({ ...currentItem, brand: e.target.value })}
//                           placeholder="Brand (Optional)"
//                           style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }}
//                         />
//                       </div>

//                       {/* DESCRIPTION - OPTIONAL */}
//                       <div className="field">
//                         <textarea
//                           value={currentItem.description}
//                           onChange={e => setCurrentItem({ ...currentItem, description: e.target.value })}
//                           placeholder="Description (Optional)"
//                           rows="2"
//                           style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', resize: 'vertical' }}
//                         />
//                       </div>

//                       {/* UOM */}
//                       <div className="field">
//                         <input
//                           value={currentItem.uom}
//                           onChange={e => setCurrentItem({ ...currentItem, uom: e.target.value })}
//                           placeholder="UOM"
//                           style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }}
//                         />
//                       </div>

//                       {/* QTY */}
//                       <div className="field">
//                         <input
//                           type="number"
//                           min="1"
//                           value={currentItem.qty}
//                           onChange={e => setCurrentItem({ ...currentItem, qty: Number(e.target.value) || 1 })}
//                           placeholder="Qty"
//                           style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }}
//                         />
//                       </div>

//                       {/* PRICE */}
//                       <div className="field">
//                         <input
//                           type="number"
//                           min="0"
//                           step="0.01"
//                           value={currentItem.price === 0 ? '' : currentItem.price}
//                           onChange={e => setCurrentItem({
//                             ...currentItem,
//                             price: e.target.value === '' ? '' : Number(e.target.value)
//                           })}
//                           placeholder="Price"
//                           style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }}
//                         />
//                       </div>

//                       {/* CURRENT TOTAL */}
//                       <div className="item-total-editor" style={{
//                         height: '39px',
//                         padding: '5px 8px',
//                         display: 'flex',
//                         flexDirection: 'column',
//                         justifyContent: 'center',
//                         background: '#fff',
//                         border: '1px solid #d1d5db',
//                         borderRadius: '6px',
//                         minWidth: '80px'
//                       }}>
//                         <span style={{ fontSize: '9px', color: '#777' }}>Total</span>
//                         <strong style={{ fontSize: '12px' }}>
//                           Rs {currency((Number(currentItem.qty) || 0) * (Number(currentItem.price) || 0))}
//                         </strong>
//                       </div>

//                       <button type="button" onClick={addItem} className="btn btn-primary btn-small" style={{ height: '39px', minWidth: '60px', padding: '0 15px' }}>
//                         Add
//                       </button>
//                     </div>

//                     {/* ==================================================
//                         ITEMS LIST
//                         ================================================== */}

//                     <div style={{ maxHeight: '250px', overflowY: 'auto', marginTop: '10px' }}>
//                       {items.length === 0 ? (
//                         <div style={{ textAlign: 'center', padding: '30px', color: '#999', fontSize: '14px' }}>
//                           No items added yet. Add products above.
//                         </div>
//                       ) : (
//                         items.map((item, index) => (
//                           <div key={index} className="item-editor-row" style={{
//                             display: 'grid',
//                             gridTemplateColumns: '35px 1fr 1fr 1fr 80px 70px 90px 120px 70px',
//                             gap: '8px',
//                             alignItems: 'center',
//                             padding: '10px 12px',
//                             border: '1px solid #e5e7eb',
//                             borderRadius: '8px',
//                             background: '#f9fafb',
//                             marginBottom: '8px',
//                             width: '100%'
//                           }}>
//                             <div className="item-number" style={{ fontWeight: 700, color: '#555', textAlign: 'center' }}>
//                               {index + 1}
//                             </div>

//                             {/* ITEM */}
//                             <div className="field">
//                               <div style={{ padding: '8px 0', fontWeight: 500 }}>{item.item || '-'}</div>
//                             </div>

//                             {/* BRAND */}
//                             <div className="field">
//                               <div style={{ padding: '8px 0' }}>{item.brand || '-'}</div>
//                             </div>

//                             {/* DESCRIPTION */}
//                             <div className="field">
//                               <div style={{ padding: '8px 0', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{item.description || '-'}</div>
//                             </div>

//                             {/* UOM */}
//                             <div className="field">
//                               <div style={{ padding: '8px 0' }}>{item.uom || 'PCS'}</div>
//                             </div>

//                             {/* QTY */}
//                             <div className="field">
//                               <div style={{ padding: '8px 0', textAlign: 'center' }}>{item.qty}</div>
//                             </div>

//                             {/* PRICE */}
//                             <div className="field">
//                               <div style={{ padding: '8px 0', textAlign: 'right' }}>Rs {currency(item.price)}</div>
//                             </div>

//                             {/* TOTAL */}
//                             <div className="item-total-editor" style={{
//                               height: '39px',
//                               padding: '5px 8px',
//                               display: 'flex',
//                               flexDirection: 'column',
//                               justifyContent: 'center',
//                               background: '#fff',
//                               border: '1px solid #d1d5db',
//                               borderRadius: '6px'
//                             }}>
//                               <span style={{ fontSize: '9px', color: '#777' }}>Total</span>
//                               <strong style={{ fontSize: '12px' }}>Rs {currency((item.qty || 0) * (item.price || 0))}</strong>
//                             </div>

//                             <div style={{ display: 'flex', gap: '4px' }}>
//                               <button type="button" onClick={() => openEditProduct(index)} style={{
//                                 height: '39px',
//                                 width: '35px',
//                                 border: 'none',
//                                 borderRadius: '6px',
//                                 background: '#dbeafe',
//                                 color: '#1d4ed8',
//                                 fontSize: '16px',
//                                 cursor: 'pointer',
//                                 display: 'flex',
//                                 alignItems: 'center',
//                                 justifyContent: 'center'
//                               }}>
//                                 ✎
//                               </button>
//                               <button type="button" onClick={() => removeItem(index)} style={{
//                                 height: '39px',
//                                 width: '35px',
//                                 border: 'none',
//                                 borderRadius: '6px',
//                                 background: '#fee2e2',
//                                 color: '#dc2626',
//                                 fontSize: '20px',
//                                 cursor: 'pointer',
//                                 display: 'flex',
//                                 alignItems: 'center',
//                                 justifyContent: 'center'
//                               }}>
//                                 ×
//                               </button>
//                             </div>
//                           </div>
//                         ))
//                       )}
//                     </div>

//                   </div>
//                 </div>

//                 {/* Terms */}
//                 <div className="editor-section" style={{ background: '#fff' }}>
//                   <div className="field field-full">
//                     <label>Terms & Conditions</label>
//                     <textarea value={terms} onChange={e => setTerms(e.target.value)} rows="3" placeholder="Payment terms, delivery, warranty, etc." style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', resize: 'vertical' }} />
//                   </div>
//                 </div>

//                 {error && (
//                   <div className="quotation-alert quotation-error" style={{ marginBottom: '15px' }}>
//                     {error}
//                   </div>
//                 )}

//                 <div style={{
//                   display: 'flex',
//                   gap: '10px',
//                   marginTop: '20px',
//                   paddingTop: '15px',
//                   borderTop: '1px solid #e5e7eb',
//                   flexShrink: 0,
//                   backgroundColor: '#fff',
//                   position: 'sticky',
//                   bottom: 0,
//                   paddingBottom: '5px'
//                 }}>
//                   <button type="submit" disabled={saving} className="btn btn-primary" style={{ flex: 1, padding: '12px 20px', fontSize: '15px' }}>
//                     {saving ? 'Saving...' : editingId ? 'Update Quotation' : 'Create Quotation'}
//                   </button>
//                   <button type="button" onClick={() => { setShowForm(false); resetForm() }} className="btn btn-secondary" style={{ padding: '12px 25px', fontSize: '15px' }}>
//                     Cancel
//                   </button>
//                 </div>

//               </form>
//             </div>

//           </div>
//         </div>
//       )}

//       {/* ========================================================
//           EDIT PRODUCT MODAL - WITH ITEM & BRAND (OPTIONAL)
//           ======================================================== */}

//       {editingProductIndex !== null && (
//         <div className="edit-product-modal" style={{
//           position: 'fixed',
//           inset: 0,
//           zIndex: 99999,
//           backgroundColor: 'rgba(0,0,0,0.5)',
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'center',
//           padding: '20px'
//         }}>
//           <div style={{
//             backgroundColor: '#fff',
//             borderRadius: '12px',
//             padding: '25px',
//             maxWidth: '500px',
//             width: '100%',
//             boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
//           }}>
//             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
//               <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>Edit Product</h3>
//               <button onClick={closeEditProduct} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#666' }}>
//                 ✕
//               </button>
//             </div>

//             <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>

//               {/* ITEM - OPTIONAL */}
//               <div>
//                 <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '5px' }}>
//                   Item (Optional)
//                 </label>
//                 <input
//                   type="text"
//                   value={editProduct.item}
//                   onChange={e => setEditProduct({ ...editProduct, item: e.target.value })}
//                   style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }}
//                 />
//               </div>

//               {/* BRAND - OPTIONAL */}
//               <div>
//                 <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '5px' }}>
//                   Brand (Optional)
//                 </label>
//                 <input
//                   type="text"
//                   value={editProduct.brand}
//                   onChange={e => setEditProduct({ ...editProduct, brand: e.target.value })}
//                   style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }}
//                 />
//               </div>

//               {/* DESCRIPTION - OPTIONAL */}
//               <div>
//                 <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '5px' }}>
//                   Description (Optional)
//                 </label>
//                 <textarea
//                   value={editProduct.description}
//                   onChange={e => setEditProduct({ ...editProduct, description: e.target.value })}
//                   rows="2"
//                   placeholder="Product description"
//                   style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', resize: 'vertical' }}
//                 />
//               </div>

//               {/* UOM QTY PRICE */}
//               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
//                 <div>
//                   <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '5px' }}>
//                     UOM
//                   </label>
//                   <input type="text" value={editProduct.uom} onChange={e => setEditProduct({ ...editProduct, uom: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }} />
//                 </div>
//                 <div>
//                   <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '5px' }}>
//                     Qty
//                   </label>
//                   <input type="number" min="1" value={editProduct.qty} onChange={e => setEditProduct({ ...editProduct, qty: Number(e.target.value) || 1 })} style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }} />
//                 </div>
//                 <div>
//                   <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '5px' }}>
//                     Price
//                   </label>
//                   <input
//                     type="number"
//                     min="0"
//                     step="0.01"
//                     value={editProduct.price === 0 ? '' : editProduct.price}
//                     onChange={e => setEditProduct({
//                       ...editProduct,
//                       price: e.target.value === '' ? '' : Number(e.target.value)
//                     })}
//                     style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }}
//                   />
//                 </div>
//               </div>

//               <button onClick={saveEditProduct} disabled={!editProduct.item.trim() && !editProduct.description.trim()} style={{ width: '100%', padding: '12px', border: 'none', borderRadius: '6px', background: '#062d73', color: '#fff', fontSize: '15px', fontWeight: 600, cursor: 'pointer', marginTop: '10px' }}>
//                 Save Product
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ========================================================
//           QUOTATION PREVIEW - DYNAMIC COLUMNS (FIXED)
//           ======================================================== */}

//       {previewData && (
//         <div className="quotation-preview-overlay" style={{
//           position: 'fixed',
//           inset: 0,
//           zIndex: 99999,
//           background: 'rgba(0,0,0,0.6)',
//           overflow: 'auto',
//           padding: '20px'
//         }}>
//           <div style={{ maxWidth: '900px', margin: '0 auto' }}>
//             <div className="no-print" style={{
//               display: 'flex',
//               justifyContent: 'space-between',
//               alignItems: 'center',
//               marginBottom: '15px'
//             }}>
//               <div>
//                 <h3 style={{ color: '#fff', margin: 0 }}>Quotation Preview</h3>
//                 <p style={{ color: '#ccc', margin: '5px 0 0', fontSize: '13px' }}>{previewData.quotationNumber}</p>
//               </div>
//               <div style={{ display: 'flex', gap: '10px' }}>
//                 <button onClick={() => window.print()} style={{ background: '#fff', color: '#111', padding: '10px 20px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>
//                   🖨 Print
//                 </button>
//                 <button onClick={() => setPreviewData(null)} style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', padding: '10px 20px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
//                   ✕ Close
//                 </button>
//               </div>
//             </div>

//             {/* PDF CONTENT - DYNAMIC COLUMNS (FIXED) */}
//             <div id="quotation-pdf-content" ref={printRef} style={{
//               background: '#ffffff',
//               padding: '12mm 8mm 8mm',
//               position: 'relative',
//               width: '210mm',
//               minHeight: '297mm',
//               margin: '0 auto',
//               boxShadow: '0 3px 20px rgba(0,0,0,0.12)',
//               fontFamily: 'Arial, Helvetica, sans-serif',
//               color: '#111111',
//               boxSizing: 'border-box'
//             }}>

//               <div className="quote-heading" style={{
//                 textAlign: 'center',
//                 color: '#062d73',
//                 fontSize: '24px',
//                 fontWeight: 800,
//                 textDecoration: 'underline',
//                 marginBottom: '8mm'
//               }}>
//                 QUOTATION
//               </div>

//               <div className="quote-header" style={{
//                 display: 'grid',
//                 gridTemplateColumns: '1fr 1fr 1fr',
//                 gap: '5mm',
//                 alignItems: 'start',
//                 minHeight: '43mm'
//               }}>
//                 <div className="company-info" style={{ fontSize: '10px', lineHeight: '1.45' }}>
//                   <div className="company-name" style={{ fontWeight: 700, fontSize: '11px', marginBottom: '1mm' }}>
//                     {previewData.companyName || 'Your Company'}
//                   </div>
//                   <div className="company-address" style={{ whiteSpace: 'normal' }}>
//                     {previewData.companyAddress || 'Company Address'}
//                   </div>
//                   <div>Phone: {previewData.companyPhone || 'N/A'}</div>
//                   <div>Email: {previewData.companyEmail || '-'}</div>
//                 </div>

//                 <div className="quote-logo" style={{ textAlign: 'center', paddingTop: '2mm' }}>
//                   <img src={previewData.companyLogo || '/PN.png'} alt="Company Logo" style={{ width: '33mm', height: '33mm', objectFit: 'contain', display: 'block', margin: '0 auto' }} onError={e => { e.target.style.display = 'none' }} />
//                 </div>

//                 <div className="quote-info" style={{ fontSize: '10px', lineHeight: '1.8' }}>
//                   <div style={{ display: 'grid', gridTemplateColumns: '32mm 1fr', gap: '2mm' }}>
//                     <strong style={{ textAlign: 'right' }}>Quote #</strong>
//                     <span style={{ textAlign: 'left' }}>{previewData.quotationNumber}</span>
//                   </div>
//                   <div style={{ display: 'grid', gridTemplateColumns: '32mm 1fr', gap: '2mm' }}>
//                     <strong style={{ textAlign: 'right' }}>Date</strong>
//                     <span style={{ textAlign: 'left' }}>{previewData.date}</span>
//                   </div>
//                   <div style={{ display: 'grid', gridTemplateColumns: '32mm 1fr', gap: '2mm' }}>
//                     <strong style={{ textAlign: 'right' }}>Validity</strong>
//                     <span style={{ textAlign: 'left' }}>
//                       {previewData.validity ? `${previewData.validity} Days` : 'N/A'}
//                     </span>
//                   </div>
//                   {previewData.validity && previewData.date && (
//                     <div style={{ display: 'grid', gridTemplateColumns: '32mm 1fr', gap: '2mm' }}>
//                       <strong style={{ textAlign: 'right' }}>Valid Till</strong>
//                       <span style={{ textAlign: 'left' }}>
//                         {(() => {
//                           const dateObj = new Date(previewData.date)
//                           dateObj.setDate(dateObj.getDate() + Number(previewData.validity))
//                           return dateObj.toISOString().split('T')[0]
//                         })()}
//                       </span>
//                     </div>
//                   )}
//                 </div>
//               </div>

//               <div className="quote-to-title" style={{
//                 background: '#062d73',
//                 color: '#ffffff',
//                 fontSize: '11px',
//                 fontWeight: 700,
//                 padding: '2mm 4mm',
//                 marginTop: '2mm'
//               }}>
//                 QUOTE TO
//               </div>
//               <div className="quote-to-content" style={{
//                 padding: '3mm 4mm',
//                 minHeight: '18mm',
//                 fontSize: '10px',
//                 lineHeight: '1.7'
//               }}>
//                 <strong>{previewData.customer?.name || ''}</strong>
//                 {previewData.customer?.company && <div>{previewData.customer.company}</div>}
//                 {previewData.customer?.address && <div>{previewData.customer.address}</div>}
//                 {previewData.customer?.phone && <div>Phone: {previewData.customer.phone}</div>}
//               </div>

//               {previewData.project && (
//                 <div className="project-row" style={{
//                   padding: '2mm 4mm',
//                   fontSize: '9px',
//                   border: '0.35mm solid #062d73',
//                   marginTop: '2mm',
//                   backgroundColor: '#f8f9fa'
//                 }}>
//                   <strong>Project: </strong>
//                   <span>{previewData.project}</span>
//                 </div>
//               )}

//               {/* ==================================================
//                   DYNAMIC TABLE - FIXED (Description column ONLY if any item has description)
//                   ================================================== */}

//               {(() => {
//                 // CHECK PREVIEW DATA ITEMS
//                 const previewItems = previewData.items || []
                
//                 // Check if ANY item has item or brand or description
//                 const showItem = previewItems.some(item => item.item && item.item.trim() !== '')
//                 const showBrand = previewItems.some(item => item.brand && item.brand.trim() !== '')
//                 const showDescription = previewItems.some(item => item.description && item.description.trim() !== '')

//                 // Calculate column widths based on what to show
//                 let itemCol = 0
//                 let brandCol = 0
//                 let descCol = 0
        
//                 if (showItem && showBrand && showDescription) {
//                   itemCol = 16; brandCol = 12; descCol = 20
//                 } else if (showItem && showBrand && !showDescription) {
//                   itemCol = 22; brandCol = 16; descCol = 0
//                 } else if (showItem && !showBrand && showDescription) {
//                   itemCol = 18; brandCol = 0; descCol = 22
//                 } else if (!showItem && showBrand && showDescription) {
//                   itemCol = 0; brandCol = 16; descCol = 24
//                 } else if (showItem && !showBrand && !showDescription) {
//                   itemCol = 30; brandCol = 0; descCol = 0
//                 } else if (!showItem && showBrand && !showDescription) {
//                   itemCol = 0; brandCol = 28; descCol = 0
//                 } else if (!showItem && !showBrand && showDescription) {
//                   itemCol = 0; brandCol = 0; descCol = 32
//                 } else {
//                   // All empty - hide description column
//                   itemCol = 0; brandCol = 0; descCol = 0
//                 }

//                 // If description is not shown, hide column entirely
//                 if (!showDescription) {
//                   descCol = 0
//                 }

//                 return (
//                   <table className="quote-table" style={{
//                     width: '100%',
//                     borderCollapse: 'collapse',
//                     tableLayout: 'fixed',
//                     fontSize: '9px',
//                     borderLeft: '0.35mm solid #111111',
//                     borderRight: '0.35mm solid #111111',
//                     marginTop: previewData.project ? '2mm' : '0'
//                   }}>
//                     <thead>
//                       <tr>
//                         <th style={{ width: '5%', textAlign: 'center', borderLeft: '0.35mm solid #111111', borderRight: '0.35mm solid #111111', padding: '1.3mm 1mm', verticalAlign: 'middle', fontSize: '9px', fontWeight: 700, height: '9mm', backgroundColor: '#f5f5f5', borderTop: '0.35mm solid #111111', borderBottom: '0.35mm solid #111111' }}>#</th>
//                         {showItem && (
//                           <th style={{ width: `${itemCol}%`, textAlign: 'left', borderLeft: '0.35mm solid #111111', borderRight: '0.35mm solid #111111', padding: '1.3mm 1mm', verticalAlign: 'middle', fontSize: '9px', fontWeight: 700, height: '9mm', backgroundColor: '#f5f5f5', borderTop: '0.35mm solid #111111', borderBottom: '0.35mm solid #111111' }}>Item</th>
//                         )}
//                         {showBrand && (
//                           <th style={{ width: `${brandCol}%`, textAlign: 'left', borderLeft: '0.35mm solid #111111', borderRight: '0.35mm solid #111111', padding: '1.3mm 1mm', verticalAlign: 'middle', fontSize: '9px', fontWeight: 700, height: '9mm', backgroundColor: '#f5f5f5', borderTop: '0.35mm solid #111111', borderBottom: '0.35mm solid #111111' }}>Brand</th>
//                         )}
//                         {showDescription && (
//                           <th style={{ width: `${descCol}%`, textAlign: 'left', borderLeft: '0.35mm solid #111111', borderRight: '0.35mm solid #111111', padding: '1.3mm 1mm', verticalAlign: 'middle', fontSize: '9px', fontWeight: 700, height: '9mm', backgroundColor: '#f5f5f5', borderTop: '0.35mm solid #111111', borderBottom: '0.35mm solid #111111' }}>Description</th>
//                         )}
//                         <th style={{ width: '8%', textAlign: 'center', borderLeft: '0.35mm solid #111111', borderRight: '0.35mm solid #111111', padding: '1.3mm 1mm', verticalAlign: 'middle', fontSize: '9px', fontWeight: 700, height: '9mm', backgroundColor: '#f5f5f5', borderTop: '0.35mm solid #111111', borderBottom: '0.35mm solid #111111' }}>UOM</th>
//                         <th style={{ width: '6%', textAlign: 'center', borderLeft: '0.35mm solid #111111', borderRight: '0.35mm solid #111111', padding: '1.3mm 1mm', verticalAlign: 'middle', fontSize: '9px', fontWeight: 700, height: '9mm', backgroundColor: '#f5f5f5', borderTop: '0.35mm solid #111111', borderBottom: '0.35mm solid #111111' }}>Qty</th>
//                         <th style={{ width: '13%', textAlign: 'center', borderLeft: '0.35mm solid #111111', borderRight: '0.35mm solid #111111', padding: '1.3mm 1mm', verticalAlign: 'middle', fontSize: '9px', fontWeight: 700, height: '9mm', backgroundColor: '#f5f5f5', borderTop: '0.35mm solid #111111', borderBottom: '0.35mm solid #111111' }}>Unit Price</th>
//                         <th style={{ width: '14%', textAlign: 'center', borderLeft: '0.35mm solid #111111', borderRight: '0.35mm solid #111111', padding: '1.3mm 1mm', verticalAlign: 'middle', fontSize: '9px', fontWeight: 700, height: '9mm', backgroundColor: '#f5f5f5', borderTop: '0.35mm solid #111111', borderBottom: '0.35mm solid #111111' }}>Total</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {previewItems.map((item, index) => {
//                         const qty = Number(item.qty) || 0
//                         const price = Number(item.price) || 0
//                         const total = qty * price
//                         return (
//                           <tr key={index}>
//                             <td style={{ textAlign: 'center', borderLeft: '0.35mm solid #111111', borderRight: '0.35mm solid #111111', padding: '1.3mm 1mm', verticalAlign: 'middle', height: '7mm', borderTop: 'none', borderBottom: 'none' }}>{index + 1}</td>
//                             {showItem && (
//                               <td style={{ textAlign: 'left', borderLeft: '0.35mm solid #111111', borderRight: '0.35mm solid #111111', padding: '1.3mm 1mm', verticalAlign: 'middle', height: '7mm', borderTop: 'none', borderBottom: 'none' }}>{item.item || '-'}</td>
//                             )}
//                             {showBrand && (
//                               <td style={{ textAlign: 'left', borderLeft: '0.35mm solid #111111', borderRight: '0.35mm solid #111111', padding: '1.3mm 1mm', verticalAlign: 'middle', height: '7mm', borderTop: 'none', borderBottom: 'none' }}>{item.brand || '-'}</td>
//                             )}
//                             {showDescription && (
//                               <td style={{ textAlign: 'left', borderLeft: '0.35mm solid #111111', borderRight: '0.35mm solid #111111', padding: '1.3mm 1mm', verticalAlign: 'middle', height: '7mm', borderTop: 'none', borderBottom: 'none', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{item.description || '-'}</td>
//                             )}
//                             <td style={{ textAlign: 'center', borderLeft: '0.35mm solid #111111', borderRight: '0.35mm solid #111111', padding: '1.3mm 1mm', verticalAlign: 'middle', height: '7mm', borderTop: 'none', borderBottom: 'none' }}>{item.uom || 'PCS'}</td>
//                             <td style={{ textAlign: 'center', borderLeft: '0.35mm solid #111111', borderRight: '0.35mm solid #111111', padding: '1.3mm 1mm', verticalAlign: 'middle', height: '7mm', borderTop: 'none', borderBottom: 'none' }}>{qty}</td>
//                             <td className="number-cell" style={{ textAlign: 'right', paddingRight: '2mm', borderLeft: '0.35mm solid #111111', borderRight: '0.35mm solid #111111', padding: '1.3mm 1mm', verticalAlign: 'middle', height: '7mm', borderTop: 'none', borderBottom: 'none' }}>Rs {currency(price)}</td>
//                             <td className="number-cell" style={{ textAlign: 'right', paddingRight: '2mm', borderLeft: '0.35mm solid #111111', borderRight: '0.35mm solid #111111', padding: '1.3mm 1mm', verticalAlign: 'middle', height: '7mm', borderTop: 'none', borderBottom: 'none' }}>Rs {currency(total)}</td>
//                           </tr>
//                         )
//                       })}

//                       {Array.from({ length: Math.max(0, 8 - (previewItems.length || 0)) }).map((_, i) => (
//                         <tr key={`empty-${i}`} className="empty-item-row">
//                           <td style={{ height: '6.5mm', borderLeft: '0.35mm solid #111111', borderRight: '0.35mm solid #111111', padding: '1.3mm 1mm', verticalAlign: 'middle', borderTop: 'none', borderBottom: 'none' }}></td>
//                           {showItem && <td style={{ height: '6.5mm', borderLeft: '0.35mm solid #111111', borderRight: '0.35mm solid #111111', padding: '1.3mm 1mm', verticalAlign: 'middle', borderTop: 'none', borderBottom: 'none' }}></td>}
//                           {showBrand && <td style={{ height: '6.5mm', borderLeft: '0.35mm solid #111111', borderRight: '0.35mm solid #111111', padding: '1.3mm 1mm', verticalAlign: 'middle', borderTop: 'none', borderBottom: 'none' }}></td>}
//                           {showDescription && <td style={{ height: '6.5mm', borderLeft: '0.35mm solid #111111', borderRight: '0.35mm solid #111111', padding: '1.3mm 1mm', verticalAlign: 'middle', borderTop: 'none', borderBottom: 'none' }}></td>}
//                           <td style={{ height: '6.5mm', borderLeft: '0.35mm solid #111111', borderRight: '0.35mm solid #111111', padding: '1.3mm 1mm', verticalAlign: 'middle', borderTop: 'none', borderBottom: 'none' }}></td>
//                           <td style={{ height: '6.5mm', borderLeft: '0.35mm solid #111111', borderRight: '0.35mm solid #111111', padding: '1.3mm 1mm', verticalAlign: 'middle', borderTop: 'none', borderBottom: 'none' }}></td>
//                           <td style={{ height: '6.5mm', borderLeft: '0.35mm solid #111111', borderRight: '0.35mm solid #111111', padding: '1.3mm 1mm', verticalAlign: 'middle', borderTop: 'none', borderBottom: 'none' }}></td>
//                           <td style={{ height: '6.5mm', borderLeft: '0.35mm solid #111111', borderRight: '0.35mm solid #111111', padding: '1.3mm 1mm', verticalAlign: 'middle', borderTop: 'none', borderBottom: 'none' }}></td>
//                         </tr>
//                       ))}

//                       <tr>
//                         <td style={{ height: '1mm', borderLeft: '0.35mm solid #111111', borderRight: '0.35mm solid #111111', borderBottom: '0.35mm solid #111111', padding: 0 }}></td>
//                         {showItem && <td style={{ height: '1mm', borderLeft: '0.35mm solid #111111', borderRight: '0.35mm solid #111111', borderBottom: '0.35mm solid #111111', padding: 0 }}></td>}
//                         {showBrand && <td style={{ height: '1mm', borderLeft: '0.35mm solid #111111', borderRight: '0.35mm solid #111111', borderBottom: '0.35mm solid #111111', padding: 0 }}></td>}
//                         {showDescription && <td style={{ height: '1mm', borderLeft: '0.35mm solid #111111', borderRight: '0.35mm solid #111111', borderBottom: '0.35mm solid #111111', padding: 0 }}></td>}
//                         <td style={{ height: '1mm', borderLeft: '0.35mm solid #111111', borderRight: '0.35mm solid #111111', borderBottom: '0.35mm solid #111111', padding: 0 }}></td>
//                         <td style={{ height: '1mm', borderLeft: '0.35mm solid #111111', borderRight: '0.35mm solid #111111', borderBottom: '0.35mm solid #111111', padding: 0 }}></td>
//                         <td style={{ height: '1mm', borderLeft: '0.35mm solid #111111', borderRight: '0.35mm solid #111111', borderBottom: '0.35mm solid #111111', padding: 0 }}></td>
//                         <td style={{ height: '1mm', borderLeft: '0.35mm solid #111111', borderRight: '0.35mm solid #111111', borderBottom: '0.35mm solid #111111', padding: 0 }}></td>
//                       </tr>
//                     </tbody>
//                   </table>
//                 )
//               })()}

//               <div className="subtotal-row" style={{
//                 width: '100%',
//                 minHeight: '13mm',
//                 border: '0.35mm solid #062d73',
//                 borderTop: '0',
//                 display: 'grid',
//                 gridTemplateColumns: '1fr 45mm',
//                 alignItems: 'center',
//                 fontSize: '10px',
//                 fontWeight: 700,
//                 paddingLeft: '4mm',
//                 backgroundColor: '#f8f9fa'
//               }}>
//                 <span style={{ padding: '3mm 0', height: '100%', display: 'flex', alignItems: 'center', paddingLeft: '4mm' }}>TOTAL</span>
//                 <strong style={{ textAlign: 'right', paddingRight: '4mm', fontSize: '11px' }}>Rs {currency(previewData.total || 0)}</strong>
//               </div>

//               {previewData.terms && (
//                 <div className="terms-section" style={{
//                   minHeight: '58mm',
//                   border: '0.35mm solid #062d73',
//                   borderTop: '0',
//                   padding: '3mm 4mm',
//                   fontSize: '9px'
//                 }}>
//                   <strong style={{ fontSize: '10px' }}>Terms & Conditions</strong>
//                   <div className="terms-content" style={{ marginTop: '3mm', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>{previewData.terms}</div>
//                 </div>
//               )}

//               <div className="quote-bottom" style={{
//                 position: 'absolute',
//                 bottom: '8mm',
//                 left: '8mm',
//                 right: '8mm',
//                 height: '7mm',
//                 border: '0.35mm solid #062d73',
//                 display: 'flex',
//                 alignItems: 'center',
//                 justifyContent: 'center',
//                 color: '#c00000',
//                 fontSize: '11px',
//                 fontWeight: 700,
//                 backgroundColor: '#ffffff'
//               }}>
//                 Authorized Signatory
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* CSS */}
//       <style dangerouslySetInnerHTML={{ __html: `
//         * { box-sizing: border-box; }
//         .quotation-page { width: 100%; min-height: 100vh; background: #f3f4f6; padding: 30px; font-family: Arial, Helvetica, sans-serif; color: #111; }
//         .quotation-editor { max-width: 1100px; margin: 0 auto 35px; background: #ffffff; border-radius: 12px; padding: 25px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08); }
//         .quotation-editor-header { display: flex; align-items: center; justify-content: space-between; gap: 20px; margin-bottom: 25px; }
//         .quotation-editor-header h1 { margin: 0 0 5px; font-size: 28px; }
//         .quotation-editor-header p { margin: 0; color: #666; font-size: 14px; }
//         .quotation-editor-actions { display: flex; gap: 10px; flex-wrap: wrap; }
//         .btn { border: none; border-radius: 7px; padding: 11px 18px; cursor: pointer; font-size: 14px; font-weight: 600; }
//         .btn:disabled { opacity: 0.6; cursor: not-allowed; }
//         .btn-primary { background: #062d73; color: #fff; }
//         .btn-secondary { background: #e5e7eb; color: #111; }
//         .btn-dark { background: #111827; color: #fff; }
//         .btn-small { padding: 8px 14px; }
//         .quotation-alert { padding: 12px 15px; border-radius: 7px; margin-bottom: 20px; font-size: 14px; }
//         .quotation-success { background: #dcfce7; color: #166534; }
//         .quotation-error { background: #fee2e2; color: #991b1b; }
//         .editor-section { border: 1px solid #e5e7eb; border-radius: 9px; padding: 20px; margin-bottom: 20px; }
//         .editor-section h2 { margin: 0 0 18px; font-size: 17px; }
//         .editor-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
//         .field { display: flex; flex-direction: column; gap: 6px; }
//         .field-full { grid-column: 1 / -1; }
//         .field label { font-size: 13px; font-weight: 600; color: #374151; }
//         .field input, .field textarea, .field select { width: 100%; border: 1px solid #d1d5db; border-radius: 6px; padding: 10px 11px; outline: none; font-size: 14px; font-family: inherit; background: #fff; }
//         .field textarea { resize: vertical; }
//         .field input:focus, .field textarea:focus, .field select:focus { border-color: #062d73; box-shadow: 0 0 0 2px rgba(6, 45, 115, 0.08); }
//         .items-heading { display: flex; align-items: center; justify-content: space-between; margin-bottom: 15px; flex-wrap: wrap; gap: 10px; }
//         .items-heading h2 { margin: 0; }
//         .items-editor { display: flex; flex-direction: column; gap: 10px; }

//         @media print {
//           @page { size: A4; margin: 0; }
//           html, body { margin: 0 !important; padding: 0 !important; width: 210mm !important; min-width: 210mm !important; height: 297mm !important; min-height: 297mm !important; background: #ffffff !important; }
//           body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
//           body * { visibility: hidden !important; }
//           #quotation-pdf-content, #quotation-pdf-content * { visibility: visible !important; }
//           #quotation-pdf-content { position: absolute !important; left: 0 !important; top: 0 !important; width: 210mm !important; min-width: 210mm !important; max-width: 210mm !important; height: 297mm !important; min-height: 297mm !important; max-height: 297mm !important; margin: 0 !important; padding: 12mm 8mm 8mm !important; background: #ffffff !important; box-shadow: none !important; overflow: hidden !important; box-sizing: border-box !important; page-break-after: always !important; page-break-inside: avoid !important; }
//           .quotation-preview-overlay { position: static !important; display: block !important; width: 210mm !important; height: auto !important; margin: 0 !important; padding: 0 !important; background: transparent !important; overflow: visible !important; }
//           .quotation-preview-overlay > div { max-width: none !important; width: 210mm !important; margin: 0 !important; padding: 0 !important; }
//           .quotation-preview-overlay .no-print { display: none !important; }
//           .company-info, .quote-logo, .quote-info { visibility: visible !important; }
//           #quotation-pdf-content img { visibility: visible !important; display: block !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
//           .quote-to-title { background: #062d73 !important; color: #ffffff !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
//           .project-row { border: 0.35mm solid #062d73 !important; background-color: #f8f9fa !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
//           .quote-table { width: 100% !important; border-collapse: collapse !important; table-layout: fixed !important; }
//           .quote-table th { background: #f5f5f5 !important; border-left: 0.35mm solid #111111 !important; border-right: 0.35mm solid #111111 !important; border-top: 0.35mm solid #111111 !important; border-bottom: 0.35mm solid #111111 !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
//           .quote-table td { border-left: 0.35mm solid #111111 !important; border-right: 0.35mm solid #111111 !important; border-top: none !important; border-bottom: none !important; }
//           .quote-table tbody tr:last-child td { border-bottom: 0.35mm solid #111111 !important; }
//           .subtotal-row { border: 0.35mm solid #062d73 !important; border-top: 0 !important; background-color: #f8f9fa !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
//           .terms-section { border: 0.35mm solid #062d73 !important; border-top: 0 !important; }
//           .quote-bottom { color: #c00000 !important; border: 0.35mm solid #062d73 !important; background-color: #ffffff !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
//           .quotation-page { margin: 0 !important; padding: 0 !important; background: #ffffff !important; }
//         }

//         @media (max-width: 900px) {
//           .quotation-page { padding: 15px; }
//           #quotation-pdf-content { transform-origin: top center; width: 210mm; max-width: 100%; overflow-x: auto; }
//           .quotation-modal-content { max-width: 95% !important; max-height: 95vh !important; }
//           .item-editor-row { grid-template-columns: 35px 1fr 1fr !important; overflow-x: auto !important; }
//           .item-editor-row .field { min-width: 80px !important; }
//         }

//         @media (max-width: 650px) {
//           .quotation-editor-header { flex-direction: column; align-items: flex-start; }
//           .editor-grid { grid-template-columns: 1fr; }
//           .field-full { grid-column: auto; }
//           .item-editor-row { grid-template-columns: 1fr !important; overflow-x: auto !important; }
//           .item-number { justify-content: flex-start; }
//           .quotation-modal-content { max-width: 98% !important; max-height: 98vh !important; padding: 0 !important; }
//         }
//       `}} />

//     </div>
//   )
// }















// import { useState, useEffect, useRef, useMemo } from 'react'
// import { ref, push, onValue, update, remove, get, set } from 'firebase/database'
// import { useAuth } from '../context/AuthContext'
// import { db } from '../firebase'
// import { todayISO, currency } from '../utils/helpers'
// import Loader from '../components/Loader'

// /* ============================================================
//    COMPANY INFORMATION - LOGO SET
//    ============================================================ */

// const COMPANY_NAME = 'Pearl Networks'
// const COMPANY_LOGO = '/PN.png'
// const COMPANY_ADDRESS =
//   'KCHS, Gohar Chamber, Office # 304, Shahra-e-Faisal, near Duty Free Shop, Karachi, 75600'
// const COMPANY_PHONE = '0341-1293604'
// const COMPANY_EMAIL = 'info@globalonesystem.com'

// /* ============================================================
//    EMPTY ITEM
//    ============================================================ */

// const emptyItem = {
//   item: '',
//   brand: '',
//   description: '',
//   uom: 'PCS',
//   qty: 1,
//   price: ''
// }

// /* ============================================================
//    SEQUENTIAL QUOTATION NUMBER GENERATOR - DATE BASED
//    ============================================================ */

// // Get today's date in YYYYMMDD format
// function getTodayDateString() {
//   const today = new Date()
//   const year = today.getFullYear()
//   const month = String(today.getMonth() + 1).padStart(2, '0')
//   const day = String(today.getDate()).padStart(2, '0')

//   return `${year}${month}${day}`
// }

// /* ============================================================
//    GET NEXT QUOTATION NUMBER
//    SIRF NUMBER READ KAREGA - INCREMENT NAHI KAREGA
//    ============================================================ */

// async function getNextQuotationNumber(companyId) {
//   try {
//     const dateStr = getTodayDateString()
//     const counterRef = ref(db, `companies/${companyId}/counters/quotation`)
//     const snapshot = await get(counterRef)

//     let lastNumber = 0
//     let lastDate = ''

//     if (snapshot.exists()) {
//       const data = snapshot.val()
//       lastNumber = data.number || 0
//       lastDate = data.date || ''
//     }

//     let nextNumber = lastNumber + 1

//     // New date -> counter reset
//     if (lastDate !== dateStr) {
//       nextNumber = 1
//     }

//     const padded = String(nextNumber).padStart(4, '0')

//     return `QTN-${dateStr}-${padded}`
//   } catch (error) {
//     console.error('Error getting quotation number:', error)

//     const dateStr = getTodayDateString()
//     const timestamp = Date.now().toString().slice(-6)

//     return `QTN-${dateStr}-${timestamp}`
//   }
// }

// /* ============================================================
//    INCREMENT QUOTATION COUNTER
//    SAVE KE WAQT INCREMENT HOGA
//    ============================================================ */

// async function incrementQuotationCounter(companyId) {
//   try {
//     const dateStr = getTodayDateString()
//     const counterRef = ref(db, `companies/${companyId}/counters/quotation`)
//     const snapshot = await get(counterRef)

//     let lastNumber = 0
//     let lastDate = ''

//     if (snapshot.exists()) {
//       const data = snapshot.val()
//       lastNumber = data.number || 0
//       lastDate = data.date || ''
//     }

//     let newNumber = lastNumber + 1

//     // New date -> reset
//     if (lastDate !== dateStr) {
//       newNumber = 1
//     }

//     await set(counterRef, {
//       date: dateStr,
//       number: newNumber
//     })

//     return {
//       number: newNumber,
//       date: dateStr
//     }
//   } catch (error) {
//     console.error('Error incrementing counter:', error)
//     return null
//   }
// }

// /* ============================================================
//    MAIN QUOTATION COMPONENT
//    ============================================================ */

// export default function Quotation() {
//   const { companyId } = useAuth()
//   const printRef = useRef(null)

//   /* ============================================================
//      BASIC STATE
//      ============================================================ */

//   const [loading, setLoading] = useState(true)
//   const [quotations, setQuotations] = useState([])
//   const [customers, setCustomers] = useState([])

//   /* ============================================================
//      FORM STATE
//      ============================================================ */

//   const [showForm, setShowForm] = useState(false)
//   const [editingId, setEditingId] = useState(null)
//   const [customerId, setCustomerId] = useState('')
//   const [quotationNumber, setQuotationNumber] = useState('')
//   const [date, setDate] = useState(todayISO())
//   const [validity, setValidity] = useState('')
//   const [project, setProject] = useState('')
//   const [items, setItems] = useState([])
//   const [terms, setTerms] = useState('')
//   const [previewData, setPreviewData] = useState(null)

//   /* ============================================================
//      CUSTOMER SEARCH STATE
//      ============================================================ */

//   const [customerSearch, setCustomerSearch] = useState('')
//   const [showCustomerDropdown, setShowCustomerDropdown] = useState(false)

//   /* ============================================================
//      CURRENT ITEM
//      ============================================================ */

//   const [currentItem, setCurrentItem] = useState({ ...emptyItem })

//   /* ============================================================
//      EDIT PRODUCT STATE
//      ============================================================ */

//   const [editingProductIndex, setEditingProductIndex] = useState(null)

//   const [editProduct, setEditProduct] = useState({
//     item: '',
//     brand: '',
//     description: '',
//     uom: 'PCS',
//     qty: 1,
//     price: ''
//   })

//   /* ============================================================
//      STATUS
//      ============================================================ */

//   const [saving, setSaving] = useState(false)
//   const [error, setError] = useState('')
//   const [success, setSuccess] = useState('')
//   const [generatingPdf, setGeneratingPdf] = useState(false)

//   /* ============================================================
//      LOAD DATA
//      ============================================================ */

//   useEffect(() => {
//     if (!companyId) {
//       setLoading(false)
//       return
//     }

//     /* ==========================================================
//        LOAD CUSTOMERS
//        ========================================================== */

//     const customersRef = ref(
//       db,
//       `companies/${companyId}/customers`
//     )

//     const unsubscribeCustomers = onValue(
//       customersRef,
//       (snapshot) => {
//         const data = snapshot.val() || {}

//         const list = Object.entries(data).map(
//           ([id, customer]) => ({
//             id,
//             ...customer
//           })
//         )

//         setCustomers(list)
//       }
//     )

//     /* ==========================================================
//        LOAD QUOTATIONS
//        ========================================================== */

//     const quotationsRef = ref(
//       db,
//       `companies/${companyId}/quotations`
//     )

//     const unsubscribeQuotations = onValue(
//       quotationsRef,
//       (snapshot) => {
//         const data = snapshot.val() || {}

//         const list = Object.entries(data)
//           .map(([id, quotation]) => ({
//             id,
//             ...quotation
//           }))
//           .sort(
//             (a, b) =>
//               (b.createdAt || 0) -
//               (a.createdAt || 0)
//           )

//         setQuotations(list)
//         setLoading(false)
//       }
//     )

//     /* ==========================================================
//        CLEANUP
//        ========================================================== */

//     return () => {
//       unsubscribeCustomers()
//       unsubscribeQuotations()
//     }
//   }, [companyId])

//   /* ============================================================
//      FILTERED CUSTOMERS
//      SEARCH:
//      - NAME
//      - COMPANY
//      - PHONE
//      - ADDRESS
//      ============================================================ */

//   const filteredCustomers = useMemo(() => {
//     if (!customers) return []

//     const search = customerSearch
//       .trim()
//       .toLowerCase()

//     if (!search) {
//       return customers
//     }

//     return customers.filter((customer) => {
//       const name = String(
//         customer.name || ''
//       ).toLowerCase()

//       const company = String(
//         customer.company || ''
//       ).toLowerCase()

//       const phone = String(
//         customer.phone || ''
//       ).toLowerCase()

//       const address = String(
//         customer.address || ''
//       ).toLowerCase()

//       return (
//         name.includes(search) ||
//         company.includes(search) ||
//         phone.includes(search) ||
//         address.includes(search)
//       )
//     })
//   }, [customers, customerSearch])

//   /* ============================================================
//      SELECT CUSTOMER
//      ============================================================ */

//   const selectCustomer = (customer) => {
//     setCustomerId(customer.id)

//     setCustomerSearch(
//       `${customer.name || ''}${
//         customer.company
//           ? ` - ${customer.company}`
//           : ''
//       }`
//     )

//     setShowCustomerDropdown(false)
//     setError('')
//   }

//   /* ============================================================
//      CLEAR CUSTOMER
//      ============================================================ */

//   const clearCustomer = () => {
//     setCustomerId('')
//     setCustomerSearch('')
//     setShowCustomerDropdown(true)
//   }

//   /* ============================================================
//      CUSTOMER SEARCH CHANGE
//      ============================================================ */

//   const handleCustomerSearchChange = (e) => {
//     const value = e.target.value

//     setCustomerSearch(value)
//     setShowCustomerDropdown(true)

//     /*
//      * Agar user selected customer ka naam edit/delete
//      * kare to customer selection remove kar do.
//      */
//     setCustomerId('')
//   }

//   /* ============================================================
//      CALCULATE SUBTOTAL
//      ============================================================ */

//   const calculateSubtotal = () => {
//     return items.reduce((sum, item) => {
//       const qty = Number(item.qty) || 0
//       const price = Number(item.price) || 0

//       return sum + qty * price
//     }, 0)
//   }

//   /* ============================================================
//      CALCULATE TOTAL
//      NO TAX
//      ============================================================ */

//   const calculateTotal = () => {
//     return calculateSubtotal()
//   }

//   /* ============================================================
//      ADD ITEM
//      ============================================================ */

//   const addItem = () => {
//     if (
//       !currentItem.item.trim() &&
//       !currentItem.description.trim()
//     ) {
//       setError(
//         'Either Item or Description is required'
//       )
//       return
//     }

//     const newItem = {
//       item: currentItem.item
//         ? currentItem.item.trim()
//         : '',

//       brand: currentItem.brand
//         ? currentItem.brand.trim()
//         : '',

//       description: currentItem.description
//         ? currentItem.description.trim()
//         : '',

//       uom: currentItem.uom || 'PCS',

//       qty: Math.max(
//         1,
//         Number(currentItem.qty) || 1
//       ),

//       price: Math.max(
//         0,
//         Number(currentItem.price) || 0
//       )
//     }

//     setItems([
//       ...items,
//       newItem
//     ])

//     setCurrentItem({
//       ...emptyItem
//     })

//     setError('')
//   }

//   /* ============================================================
//      REMOVE ITEM
//      ============================================================ */

//   const removeItem = (index) => {
//     setItems(
//       items.filter(
//         (_, i) => i !== index
//       )
//     )
//   }

//   /* ============================================================
//      EDIT PRODUCT - OPEN
//      ============================================================ */

//   const openEditProduct = (index) => {
//     const item = items[index]

//     setEditingProductIndex(index)

//     setEditProduct({
//       item: item.item || '',
//       brand: item.brand || '',
//       description:
//         item.description || '',
//       uom: item.uom || 'PCS',
//       qty: item.qty || 1,
//       price:
//         item.price === 0
//           ? ''
//           : item.price
//     })
//   }

//   /* ============================================================
//      EDIT PRODUCT - SAVE
//      ============================================================ */

//   const saveEditProduct = () => {
//     if (
//       !editProduct.item.trim() &&
//       !editProduct.description.trim()
//     ) {
//       setError(
//         'Either Item or Description is required'
//       )
//       return
//     }

//     const updatedItems = [
//       ...items
//     ]

//     updatedItems[
//       editingProductIndex
//     ] = {
//       item: editProduct.item
//         ? editProduct.item.trim()
//         : '',

//       brand: editProduct.brand
//         ? editProduct.brand.trim()
//         : '',

//       description:
//         editProduct.description
//           ? editProduct.description.trim()
//           : '',

//       uom:
//         editProduct.uom ||
//         'PCS',

//       qty: Math.max(
//         1,
//         Number(editProduct.qty) || 1
//       ),

//       price: Math.max(
//         0,
//         Number(editProduct.price) || 0
//       )
//     }

//     setItems(updatedItems)

//     setEditingProductIndex(null)

//     setEditProduct({
//       item: '',
//       brand: '',
//       description: '',
//       uom: 'PCS',
//       qty: 1,
//       price: ''
//     })

//     setError('')
//   }

//   /* ============================================================
//      EDIT PRODUCT - CLOSE
//      ============================================================ */

//   const closeEditProduct = () => {
//     setEditingProductIndex(null)

//     setEditProduct({
//       item: '',
//       brand: '',
//       description: '',
//       uom: 'PCS',
//       qty: 1,
//       price: ''
//     })
//   }

//   /* ============================================================
//      RESET FORM
//      ============================================================ */

//   const resetForm = () => {
//     setCustomerId('')
//     setCustomerSearch('')
//     setShowCustomerDropdown(false)

//     setQuotationNumber('')
//     setDate(todayISO())
//     setValidity('')
//     setProject('')
//     setItems([])
//     setTerms('')

//     setCurrentItem({
//       ...emptyItem
//     })

//     setEditingId(null)

//     setError('')
//     setSuccess('')

//     setEditingProductIndex(null)

//     setEditProduct({
//       item: '',
//       brand: '',
//       description: '',
//       uom: 'PCS',
//       qty: 1,
//       price: ''
//     })
//   }

//   /* ============================================================
//      OPEN NEW QUOTATION
//      ============================================================ */

//   const openNewQuotation = async () => {
//     resetForm()

//     if (companyId) {
//       const number =
//         await getNextQuotationNumber(
//           companyId
//         )

//       setQuotationNumber(number)
//     }

//     setShowForm(true)
//   }

//   /* ============================================================
//      OPEN EDIT QUOTATION
//      ============================================================ */

//   const openEditQuotation = (
//     quotation
//   ) => {
//     setEditingId(quotation.id)

//     setCustomerId(
//       quotation.customerId || ''
//     )

//     setQuotationNumber(
//       quotation.quotationNumber || ''
//     )

//     setDate(
//       quotation.date ||
//         todayISO()
//     )

//     setValidity(
//       quotation.validity || ''
//     )

//     setProject(
//       quotation.project || ''
//     )

//     setItems(
//       quotation.items || []
//     )

//     setTerms(
//       quotation.terms || ''
//     )

//     /*
//      * Existing quotation ka customer
//      * search field me show hoga.
//      */

//     const existingCustomer =
//       customers.find(
//         (customer) =>
//           customer.id ===
//           quotation.customerId
//       )

//     if (existingCustomer) {
//       setCustomerSearch(
//         `${existingCustomer.name || ''}${
//           existingCustomer.company
//             ? ` - ${existingCustomer.company}`
//             : ''
//         }`
//       )
//     } else {
//       setCustomerSearch(
//         `${quotation.customerName || ''}${
//           quotation.customerCompany
//             ? ` - ${quotation.customerCompany}`
//             : ''
//         }`
//       )
//     }

//     setShowCustomerDropdown(false)

//     setShowForm(true)
//     setError('')
//   }

//   /* ============================================================
//      SAVE QUOTATION
//      ============================================================ */

//   const handleSubmit = async (e) => {
//     e.preventDefault()

//     setError('')
//     setSuccess('')

//     if (!companyId) {
//       setError(
//         'Company ID not found'
//       )
//       return
//     }

//     if (!customerId) {
//       setError(
//         'Please select a customer'
//       )
//       return
//     }

//     if (items.length === 0) {
//       setError(
//         'Add at least one item'
//       )
//       return
//     }

//     const customer =
//       customers.find(
//         (c) =>
//           c.id === customerId
//       )

//     if (!customer) {
//       setError(
//         'Customer not found'
//       )
//       return
//     }

//     setSaving(true)

//     try {
//       const subtotal =
//         calculateSubtotal()

//       const total =
//         calculateTotal()

//       let finalQuotationNumber =
//         quotationNumber

//       if (!editingId) {
//         await incrementQuotationCounter(
//           companyId
//         )

//         if (
//           !finalQuotationNumber ||
//           finalQuotationNumber.trim() === ''
//         ) {
//           const dateStr =
//             getTodayDateString()

//           const timestamp =
//             Date.now()
//               .toString()
//               .slice(-6)

//           finalQuotationNumber =
//             `QTN-${dateStr}-${timestamp}`

//           setQuotationNumber(
//             finalQuotationNumber
//           )
//         }
//       }

//       const quotationData = {
//         quotationNumber:
//           finalQuotationNumber,

//         date:
//           date ||
//           todayISO(),

//         validity:
//           validity || '',

//         project:
//           project || '',

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

//         companyEmail:
//           COMPANY_EMAIL,

//         items:
//           items,

//         subtotal:
//           subtotal,

//         total:
//           total,

//         terms:
//           terms || '',

//         updatedAt:
//           Date.now()
//       }

//       if (editingId) {
//         const quotationRef =
//           ref(
//             db,
//             `companies/${companyId}/quotations/${editingId}`
//           )

//         await update(
//           quotationRef,
//           {
//             ...quotationData,
//             updatedAt:
//               Date.now()
//           }
//         )

//         setSuccess(
//           'Quotation updated successfully!'
//         )
//       } else {
//         const quotationsRef =
//           ref(
//             db,
//             `companies/${companyId}/quotations`
//           )

//         quotationData.createdAt =
//           Date.now()

//         await push(
//           quotationsRef,
//           quotationData
//         )

//         setSuccess(
//           'Quotation created successfully!'
//         )
//       }

//       setPreviewData({
//         ...quotationData,

//         id:
//           editingId ||
//           'new',

//         customer: {
//           name:
//             customer.name,

//           company:
//             customer.company,

//           phone:
//             customer.phone,

//           address:
//             customer.address
//         }
//       })

//       setShowForm(false)

//       resetForm()

//     } catch (err) {
//       console.error(
//         'Save error:',
//         err
//       )

//       setError(
//         err.message ||
//           'Failed to save quotation'
//       )
//     } finally {
//       setSaving(false)
//     }
//   }

//   /* ============================================================
//      DELETE QUOTATION
//      ============================================================ */

//   const deleteQuotation = async (
//     id
//   ) => {
//     if (
//       !confirm(
//         'Are you sure you want to delete this quotation?'
//       )
//     ) {
//       return
//     }

//     try {
//       const quotationRef =
//         ref(
//           db,
//           `companies/${companyId}/quotations/${id}`
//         )

//       await remove(
//         quotationRef
//       )

//       setSuccess(
//         'Quotation deleted successfully!'
//       )
//     } catch (err) {
//       console.error(
//         'Delete error:',
//         err
//       )

//       setError(
//         'Failed to delete quotation'
//       )
//     }
//   }

//   /* ============================================================
//      PREVIEW
//      ============================================================ */

//   const handlePreview = (
//     quotation
//   ) => {
//     setPreviewData({
//       ...quotation,

//       customer: {
//         name:
//           quotation.customerName,

//         company:
//           quotation.customerCompany,

//         phone:
//           quotation.customerPhone,

//         address:
//           quotation.customerAddress
//       }
//     })
//   }

//   /* ============================================================
//      SAVE AS PDF
//      ============================================================ */

//   const handleSavePdf = async (
//     quotation
//   ) => {
//     setGeneratingPdf(true)

//     try {
//       const previewQuotation = {
//         ...quotation,

//         customer: {
//           name:
//             quotation.customerName,

//           company:
//             quotation.customerCompany,

//           phone:
//             quotation.customerPhone,

//           address:
//             quotation.customerAddress
//         }
//       }

//       setPreviewData(
//         previewQuotation
//       )

//       await new Promise(
//         resolve =>
//           setTimeout(
//             resolve,
//             500
//           )
//       )

//       window.print()

//     } catch (error) {
//       console.error(
//         'Print error:',
//         error
//       )

//       alert(
//         'Print preview open nahi ho saka.'
//       )
//     } finally {
//       setGeneratingPdf(false)
//     }
//   }

//   /* ============================================================
//      RENDER
//      ============================================================ */

//   return (
//     <div className="quotation-page">

//       <div className="quotation-editor no-print">

//         <div className="quotation-editor-header">

//           <div>
//             <h1>
//               Quotations
//             </h1>

//             <p>
//               Create and manage quotations for your customers
//             </p>
//           </div>

//           <div className="quotation-editor-actions">

//             <button
//               onClick={
//                 openNewQuotation
//               }
//               className="btn btn-primary"
//             >
//               + New Quotation
//             </button>

//           </div>
//         </div>

//         {success && (
//           <div className="quotation-alert quotation-success">
//             {success}
//           </div>
//         )}

//         {error && (
//           <div className="quotation-alert quotation-error">
//             {error}
//           </div>
//         )}

//         {loading ? (
//           <Loader />
//         ) : quotations.length === 0 ? (

//           <div
//             style={{
//               textAlign:
//                 'center',
//               padding:
//                 '40px 0',
//               color:
//                 '#666'
//             }}
//           >
//             <p>
//               No quotations yet. Create your first quotation!
//             </p>
//           </div>

//         ) : (

//           <div
//             style={{
//               overflowX:
//                 'auto',
//               marginTop:
//                 '20px'
//             }}
//           >

//             <table
//               style={{
//                 width:
//                   '100%',
//                 borderCollapse:
//                   'collapse',
//                 fontSize:
//                   '14px'
//               }}
//             >

//               <thead>

//                 <tr
//                   style={{
//                     borderBottom:
//                       '2px solid #e5e7eb',
//                     textAlign:
//                       'left'
//                   }}
//                 >

//                   <th
//                     style={{
//                       padding:
//                         '10px',
//                       width:
//                         '15%'
//                     }}
//                   >
//                     #
//                   </th>

//                   <th
//                     style={{
//                       padding:
//                         '10px',
//                       width:
//                         '25%'
//                     }}
//                   >
//                     Customer
//                   </th>

//                   <th
//                     style={{
//                       padding:
//                         '10px',
//                       width:
//                         '12%'
//                     }}
//                   >
//                     Date
//                   </th>

//                   <th
//                     style={{
//                       padding:
//                         '10px',
//                       width:
//                         '10%'
//                     }}
//                   >
//                     Validity
//                   </th>

//                   <th
//                     style={{
//                       padding:
//                         '10px',
//                       width:
//                         '13%'
//                     }}
//                   >
//                     Total
//                   </th>

//                   <th
//                     style={{
//                       padding:
//                         '10px',
//                       width:
//                         '25%',
//                       textAlign:
//                         'right'
//                     }}
//                   >
//                     Actions
//                   </th>

//                 </tr>

//               </thead>

//               <tbody>

//                 {quotations.map(
//                   (
//                     q,
//                     index
//                   ) => (

//                     <tr
//                       key={
//                         q.id
//                       }
//                       style={{
//                         borderBottom:
//                           '1px solid #e5e7eb'
//                       }}
//                     >

//                       <td
//                         style={{
//                           padding:
//                             '10px'
//                         }}
//                       >
//                         {
//                           q.quotationNumber
//                         }
//                       </td>

//                       <td
//                         style={{
//                           padding:
//                             '10px'
//                         }}
//                       >

//                         <div
//                           style={{
//                             fontWeight:
//                               600
//                           }}
//                         >
//                           {
//                             q.customerName
//                           }
//                         </div>

//                         <div
//                           style={{
//                             fontSize:
//                               '12px',
//                             color:
//                               '#666'
//                           }}
//                         >
//                           {
//                             q.customerCompany
//                           }
//                         </div>

//                       </td>

//                       <td
//                         style={{
//                           padding:
//                             '10px'
//                         }}
//                       >
//                         {
//                           q.date
//                         }
//                       </td>

//                       <td
//                         style={{
//                           padding:
//                             '10px'
//                         }}
//                       >
//                         {
//                           q.validity ||
//                           '-'
//                         }
//                       </td>

//                       <td
//                         style={{
//                           padding:
//                             '10px',
//                           fontWeight:
//                             700
//                         }}
//                       >
//                         Rs{' '}
//                         {
//                           currency(
//                             q.total ||
//                               0
//                           )
//                         }
//                       </td>

//                       <td
//                         style={{
//                           padding:
//                             '10px',
//                           textAlign:
//                             'right',
//                           whiteSpace:
//                             'nowrap'
//                         }}
//                       >

//                         <button
//                           onClick={() =>
//                             handlePreview(
//                               q
//                             )
//                           }
//                           style={{
//                             marginRight:
//                               '6px',
//                             padding:
//                               '5px 10px',
//                             border:
//                               'none',
//                             borderRadius:
//                               '4px',
//                             background:
//                               '#062d73',
//                             color:
//                               '#fff',
//                             cursor:
//                               'pointer',
//                             fontSize:
//                               '12px',
//                             display:
//                               'inline-block'
//                           }}
//                         >
//                           View
//                         </button>

//                         <button
//                           onClick={() =>
//                             openEditQuotation(
//                               q
//                             )
//                           }
//                           style={{
//                             marginRight:
//                               '6px',
//                             padding:
//                               '5px 10px',
//                             border:
//                               'none',
//                             borderRadius:
//                               '4px',
//                             background:
//                               '#e5e7eb',
//                             color:
//                               '#111',
//                             cursor:
//                               'pointer',
//                             fontSize:
//                               '12px',
//                             display:
//                               'inline-block'
//                           }}
//                         >
//                           Edit
//                         </button>

//                         <button
//                           onClick={() =>
//                             deleteQuotation(
//                               q.id
//                             )
//                           }
//                           style={{
//                             marginRight:
//                               '6px',
//                             padding:
//                               '5px 10px',
//                             border:
//                               'none',
//                             borderRadius:
//                               '4px',
//                             background:
//                               '#fee2e2',
//                             color:
//                               '#dc2626',
//                             cursor:
//                               'pointer',
//                             fontSize:
//                               '12px',
//                             display:
//                               'inline-block'
//                           }}
//                         >
//                           Delete
//                         </button>

//                         <button
//                           onClick={() =>
//                             handleSavePdf(
//                               q
//                             )
//                           }
//                           disabled={
//                             generatingPdf
//                           }
//                           style={{
//                             padding:
//                               '5px 10px',
//                             border:
//                               'none',
//                             borderRadius:
//                               '4px',
//                             background:
//                               '#dc2626',
//                             color:
//                               '#fff',
//                             cursor:
//                               generatingPdf
//                                 ? 'not-allowed'
//                                 : 'pointer',
//                             opacity:
//                               generatingPdf
//                                 ? 0.6
//                                 : 1,
//                             fontSize:
//                               '12px',
//                             display:
//                               'inline-block'
//                           }}
//                         >
//                           {
//                             generatingPdf
//                               ? '⏳'
//                               : '📄 PDF'
//                           }
//                         </button>

//                       </td>

//                     </tr>

//                   )
//                 )}

//               </tbody>

//             </table>

//           </div>

//         )}

//       </div>

//       {/* ========================================================
//           QUOTATION FORM MODAL
//           ======================================================== */}

//       {showForm && (

//         <div
//           className="quotation-modal-overlay"
//           style={{
//             position:
//               'fixed',
//             inset: 0,
//             zIndex:
//               9999,
//             backgroundColor:
//               'rgba(0,0,0,0.5)',
//             display:
//               'flex',
//             alignItems:
//               'center',
//             justifyContent:
//               'center',
//             padding:
//               '20px',
//             overflow:
//               'auto'
//           }}
//         >

//           <div
//             className="quotation-modal-content"
//             style={{
//               backgroundColor:
//                 '#fff',
//               borderRadius:
//                 '12px',
//               maxWidth:
//                 '1000px',
//               width:
//                 '100%',
//               maxHeight:
//                 '90vh',
//               overflow:
//                 'hidden',
//               display:
//                 'flex',
//               flexDirection:
//                 'column',
//               boxShadow:
//                 '0 20px 60px rgba(0,0,0,0.3)'
//             }}
//           >

//             <div
//               style={{
//                 padding:
//                   '20px 25px',
//                 borderBottom:
//                   '1px solid #e5e7eb',
//                 display:
//                   'flex',
//                 justifyContent:
//                   'space-between',
//                 alignItems:
//                   'center',
//                 flexShrink:
//                   0,
//                 backgroundColor:
//                   '#fff',
//                 borderTopLeftRadius:
//                   '12px',
//                 borderTopRightRadius:
//                   '12px'
//               }}
//             >

//               <h2
//                 style={{
//                   margin:
//                     0,
//                   fontSize:
//                     '20px',
//                   fontWeight:
//                     700
//                 }}
//               >
//                 {
//                   editingId
//                     ? 'Edit Quotation'
//                     : 'New Quotation'
//                 }
//               </h2>

//               <button
//                 onClick={() => {
//                   setShowForm(
//                     false
//                   )
//                   resetForm()
//                 }}
//                 style={{
//                   background:
//                     'none',
//                   border:
//                     'none',
//                   fontSize:
//                     '24px',
//                   cursor:
//                     'pointer',
//                   color:
//                     '#666',
//                   padding:
//                     '0 10px'
//                 }}
//               >
//                 ✕
//               </button>

//             </div>

//             <div
//               style={{
//                 padding:
//                   '20px 25px',
//                 overflowY:
//                   'auto',
//                 flex: 1,
//                 backgroundColor:
//                   '#fafafa'
//               }}
//             >

//               <form
//                 onSubmit={
//                   handleSubmit
//                 }
//               >

//                 <div
//                   className="editor-section"
//                   style={{
//                     background:
//                       '#fff'
//                   }}
//                 >

//                   <div className="editor-grid">

//                     {/* ==================================================
//                         SEARCHABLE CUSTOMER DROPDOWN
//                         ================================================== */}

//                     <div
//                       className="field"
//                       style={{
//                         position:
//                           'relative'
//                       }}
//                     >

//                       <label>
//                         Customer *
//                       </label>

//                       <div
//                         style={{
//                           position:
//                             'relative'
//                         }}
//                       >

//                         <input
//                           type="text"
//                           value={
//                             customerSearch
//                           }
//                           onChange={
//                             handleCustomerSearchChange
//                           }
//                           onFocus={() =>
//                             setShowCustomerDropdown(
//                               true
//                             )
//                           }
//                           placeholder="Search customer by name, company or phone..."
//                           required={
//                             !!customerId
//                           }
//                           autoComplete="off"
//                           style={{
//                             width:
//                               '100%',
//                             padding:
//                               '10px 38px 10px 11px',
//                             border:
//                               '1px solid #d1d5db',
//                             borderRadius:
//                               '6px',
//                             outline:
//                               'none',
//                             fontSize:
//                               '14px',
//                             background:
//                               '#fff'
//                           }}
//                         />

//                         {customerSearch && (

//                           <button
//                             type="button"
//                             onClick={
//                               clearCustomer
//                             }
//                             style={{
//                               position:
//                                 'absolute',
//                               right:
//                                 '10px',
//                               top:
//                                 '50%',
//                               transform:
//                                 'translateY(-50%)',
//                               border:
//                                 'none',
//                               background:
//                                 'transparent',
//                               color:
//                                 '#6b7280',
//                               cursor:
//                                 'pointer',
//                               fontSize:
//                                 '18px',
//                               lineHeight:
//                                 1,
//                               padding:
//                                 '2px 4px'
//                             }}
//                             title="Clear customer"
//                           >
//                             ×
//                           </button>

//                         )}

//                       </div>

                  

//                       {showCustomerDropdown && (

//   <div
//     style={{
//       position: 'absolute',
//       zIndex: 10000,
//       left: 0,
//       right: 0,
//       top: '100%',
//       marginTop: '4px',
//       background: '#fff',
//       border: '1px solid #d1d5db',
//       borderRadius: '8px',
//       boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
//       overflow: 'hidden'
//     }}
//   >

//     <div
//       style={{
//         maxHeight: '280px',
//         overflowY: 'auto'
//       }}
//     >

//       {customers === null ? (

//         <div
//           style={{
//             padding: '15px',
//             textAlign: 'center',
//             color: '#666',
//             fontSize: '13px'
//           }}
//         >
//           Loading customers...
//         </div>

//       ) : filteredCustomers.length === 0 ? (

//         <div
//           style={{
//             padding: '15px',
//             textAlign: 'center',
//             color: '#666',
//             fontSize: '13px'
//           }}
//         >
//           {customerSearch.trim()
//             ? 'No customer found.'
//             : 'No customers available.'}
//         </div>

//       ) : (

//         filteredCustomers.map(
//           (customer) => (

//             <button
//               key={customer.id}
//               type="button"
//               onClick={() =>
//                 selectCustomer(customer)
//               }
//               style={{
//                 display: 'block',
//                 width: '100%',
//                 textAlign: 'left',
//                 padding: '11px 13px',
//                 border: 'none',
//                 borderBottom: '1px solid #f0f0f0',
//                 background: '#fff',
//                 cursor: 'pointer'
//               }}
//               onMouseEnter={e => {
//                 e.currentTarget.style.background = '#f3f4f6'
//               }}
//               onMouseLeave={e => {
//                 e.currentTarget.style.background = '#fff'
//               }}
//             >

//               {/* COMPANY NAME PEHLE - BOLD ME */}
//               <div
//                 style={{
//                   fontWeight: 600,
//                   color: '#111827',
//                   fontSize: '14px'
//                 }}
//               >
//                 {customer.company || customer.name || 'Unnamed Customer'}
//               </div>

//               {/* CUSTOMER NAME NEECHE - AGAR COMPANY AUR NAME DONO HO TO */}
//               {customer.company && customer.name && customer.company !== customer.name && (
//                 <div
//                   style={{
//                     color: '#4b5563',
//                     fontSize: '12px',
//                     marginTop: '2px'
//                   }}
//                 >
//                   {customer.name}
//                 </div>
//               )}

//               {/* AGAR SIRF NAME HO AUR COMPANY NA HO TO NAME NEECHE SHOW KARO */}
//               {!customer.company && customer.name && (
//                 <div
//                   style={{
//                     color: '#4b5563',
//                     fontSize: '12px',
//                     marginTop: '2px'
//                   }}
//                 >
//                   {customer.name}
//                 </div>
//               )}

//               {customer.phone && (
//                 <div
//                   style={{
//                     color: '#6b7280',
//                     fontSize: '11px',
//                     marginTop: '2px'
//                   }}
//                 >
//                   {customer.phone}
//                 </div>
//               )}

//             </button>

//           )
//         )

//       )}

//     </div>

//   </div>

// )}

//                     </div>

//                     {/* ==================================================
//                         QUOTATION NUMBER
//                         ================================================== */}

//                     <div className="field">

//                       <label>
//                         Quotation #
//                       </label>

//                       <input
//                         type="text"
//                         value={
//                           quotationNumber
//                         }
//                         onChange={e =>
//                           setQuotationNumber(
//                             e.target.value
//                           )
//                         }
//                         placeholder="Will be generated on save"
//                         style={{
//                           background:
//                             '#f3f4f6',
//                           fontWeight:
//                             'bold'
//                         }}
//                       />

//                       <small
//                         style={{
//                           color:
//                             '#666',
//                           fontSize:
//                             '11px'
//                         }}
//                       >
//                         Format:
//                         {' '}
//                         QTN-YYYYMMDD-0001
//                       </small>

//                     </div>

//                     {/* ==================================================
//                         DATE
//                         ================================================== */}

//                     <div className="field">

//                       <label>
//                         Date *
//                       </label>

//                       <input
//                         type="date"
//                         value={
//                           date
//                         }
//                         onChange={e =>
//                           setDate(
//                             e.target.value
//                           )
//                         }
//                         required
//                       />

//                     </div>

//                     {/* ==================================================
//                         VALIDITY
//                         ================================================== */}

//                     <div className="field">

//                       <label>
//                         Validity (Days) *
//                       </label>

//                       <input
//                         type="number"
//                         min="1"
//                         max="365"
//                         value={
//                           validity
//                         }
//                         onChange={e =>
//                           setValidity(
//                             e.target.value
//                           )
//                         }
//                         placeholder="e.g., 30"
//                         required
//                         style={{
//                           width:
//                             '100%',
//                           padding:
//                             '10px',
//                           border:
//                             '1px solid #d1d5db',
//                           borderRadius:
//                             '6px'
//                         }}
//                       />

//                       <small
//                         style={{
//                           color:
//                             '#666',
//                           fontSize:
//                             '11px'
//                         }}
//                       >
//                         Number of days quotation is valid
//                         {' '}
//                         (e.g., 30, 60, 90)
//                       </small>

//                     </div>

//                     {/* ==================================================
//                         PROJECT
//                         ================================================== */}

//                     <div
//                       className="field field-full"
//                     >

//                       <label>
//                         Project
//                       </label>

//                       <input
//                         type="text"
//                         value={
//                           project
//                         }
//                         onChange={e =>
//                           setProject(
//                             e.target.value
//                           )
//                         }
//                         placeholder="Project name (optional)"
//                       />

//                     </div>

//                   </div>

//                 </div>

//                 {/* ==================================================
//                     ITEMS - WITH ITEM & BRAND (OPTIONAL)
//                     ================================================== */}

//                 <div
//                   className="editor-section"
//                   style={{
//                     background:
//                       '#fff'
//                   }}
//                 >

//                   <div className="items-heading">

//                     <h2>
//                       Items
//                     </h2>

//                     <span
//                       style={{
//                         fontSize:
//                           '14px',
//                         color:
//                           '#666'
//                       }}
//                     >
//                       Total: Rs{' '}
//                       {
//                         currency(
//                           calculateTotal()
//                         )
//                       }
//                     </span>

//                   </div>

//                   <div className="items-editor">

//                     {/* ==================================================
//                         ADD ITEM ROW
//                         ================================================== */}

//                     <div
//                       className="item-editor-row"
//                       style={{
//                         display:
//                           'grid',
//                         gridTemplateColumns:
//                           '35px 1fr 1fr 1fr 80px 70px 90px 120px 70px',
//                         gap:
//                           '8px',
//                         alignItems:
//                           'end',
//                         padding:
//                           '12px',
//                         border:
//                           '1px solid #e5e7eb',
//                         borderRadius:
//                           '8px',
//                         background:
//                           '#f9fafb',
//                         width:
//                           '100%'
//                       }}
//                     >

//                       <div
//                         className="item-number"
//                         style={{
//                           height:
//                             '39px',
//                           display:
//                             'flex',
//                           alignItems:
//                             'center',
//                           justifyContent:
//                             'center',
//                           fontWeight:
//                             700,
//                           color:
//                             '#555'
//                         }}
//                       >
//                         <span>
//                           #
//                         </span>
//                       </div>

//                       {/* ITEM */}

//                       <div className="field">

//                         <input
//                           value={
//                             currentItem.item
//                           }
//                           onChange={e =>
//                             setCurrentItem({
//                               ...currentItem,
//                               item:
//                                 e.target.value
//                             })
//                           }
//                           placeholder="Item (Optional)"
//                           style={{
//                             width:
//                               '100%',
//                             padding:
//                               '10px',
//                             border:
//                               '1px solid #d1d5db',
//                             borderRadius:
//                               '6px'
//                           }}
//                         />

//                       </div>

//                       {/* BRAND */}

//                       <div className="field">

//                         <input
//                           value={
//                             currentItem.brand
//                           }
//                           onChange={e =>
//                             setCurrentItem({
//                               ...currentItem,
//                               brand:
//                                 e.target.value
//                             })
//                           }
//                           placeholder="Brand (Optional)"
//                           style={{
//                             width:
//                               '100%',
//                             padding:
//                               '10px',
//                             border:
//                               '1px solid #d1d5db',
//                             borderRadius:
//                               '6px'
//                           }}
//                         />

//                       </div>

//                       {/* DESCRIPTION */}

//                       <div className="field">

//                         <textarea
//                           value={
//                             currentItem.description
//                           }
//                           onChange={e =>
//                             setCurrentItem({
//                               ...currentItem,
//                               description:
//                                 e.target.value
//                             })
//                           }
//                           placeholder="Description (Optional)"
//                           rows="2"
//                           style={{
//                             width:
//                               '100%',
//                             padding:
//                               '10px',
//                             border:
//                               '1px solid #d1d5db',
//                             borderRadius:
//                               '6px',
//                             resize:
//                               'vertical'
//                           }}
//                         />

//                       </div>

//                       {/* UOM */}

//                       <div className="field">

//                         <input
//                           value={
//                             currentItem.uom
//                           }
//                           onChange={e =>
//                             setCurrentItem({
//                               ...currentItem,
//                               uom:
//                                 e.target.value
//                             })
//                           }
//                           placeholder="UOM"
//                           style={{
//                             width:
//                               '100%',
//                             padding:
//                               '10px',
//                             border:
//                               '1px solid #d1d5db',
//                             borderRadius:
//                               '6px'
//                           }}
//                         />

//                       </div>

//                       {/* QTY */}

//                       <div className="field">

//                         <input
//                           type="number"
//                           min="1"
//                           value={
//                             currentItem.qty
//                           }
//                           onChange={e =>
//                             setCurrentItem({
//                               ...currentItem,
//                               qty:
//                                 Number(
//                                   e.target.value
//                                 ) || 1
//                             })
//                           }
//                           placeholder="Qty"
//                           style={{
//                             width:
//                               '100%',
//                             padding:
//                               '10px',
//                             border:
//                               '1px solid #d1d5db',
//                             borderRadius:
//                               '6px'
//                           }}
//                         />

//                       </div>

//                       {/* PRICE */}

//                       <div className="field">

//                         <input
//                           type="number"
//                           min="0"
//                           step="0.01"
//                           value={
//                             currentItem.price ===
//                             0
//                               ? ''
//                               : currentItem.price
//                           }
//                           onChange={e =>
//                             setCurrentItem({
//                               ...currentItem,
//                               price:
//                                 e.target.value ===
//                                 ''
//                                   ? ''
//                                   : Number(
//                                       e.target.value
//                                     )
//                             })
//                           }
//                           placeholder="Price"
//                           style={{
//                             width:
//                               '100%',
//                             padding:
//                               '10px',
//                             border:
//                               '1px solid #d1d5db',
//                             borderRadius:
//                               '6px'
//                           }}
//                         />

//                       </div>

//                       {/* CURRENT TOTAL */}

//                       <div
//                         className="item-total-editor"
//                         style={{
//                           height:
//                             '39px',
//                           padding:
//                             '5px 8px',
//                           display:
//                             'flex',
//                           flexDirection:
//                             'column',
//                           justifyContent:
//                             'center',
//                           background:
//                             '#fff',
//                           border:
//                             '1px solid #d1d5db',
//                           borderRadius:
//                             '6px',
//                           minWidth:
//                             '80px'
//                         }}
//                       >

//                         <span
//                           style={{
//                             fontSize:
//                               '9px',
//                             color:
//                               '#777'
//                           }}
//                         >
//                           Total
//                         </span>

//                         <strong
//                           style={{
//                             fontSize:
//                               '12px'
//                           }}
//                         >
//                           Rs{' '}
//                           {
//                             currency(
//                               (Number(
//                                 currentItem.qty
//                               ) || 0) *
//                                 (Number(
//                                   currentItem.price
//                                 ) || 0)
//                             )
//                           }
//                         </strong>

//                       </div>

//                       {/* ADD */}

//                       <button
//                         type="button"
//                         onClick={
//                           addItem
//                         }
//                         className="btn btn-primary btn-small"
//                         style={{
//                           height:
//                             '39px',
//                           minWidth:
//                             '60px',
//                           padding:
//                             '0 15px'
//                         }}
//                       >
//                         Add
//                       </button>

//                     </div>

//                     {/* ==================================================
//                         ITEMS LIST
//                         ================================================== */}

//                     <div
//                       style={{
//                         maxHeight:
//                           '250px',
//                         overflowY:
//                           'auto',
//                         marginTop:
//                           '10px'
//                       }}
//                     >

//                       {items.length === 0 ? (

//                         <div
//                           style={{
//                             textAlign:
//                               'center',
//                             padding:
//                               '30px',
//                             color:
//                               '#999',
//                             fontSize:
//                               '14px'
//                           }}
//                         >
//                           No items added yet. Add products above.
//                         </div>

//                       ) : (

//                         items.map(
//                           (
//                             item,
//                             index
//                           ) => (

//                             <div
//                               key={
//                                 index
//                               }
//                               className="item-editor-row"
//                               style={{
//                                 display:
//                                   'grid',
//                                 gridTemplateColumns:
//                                   '35px 1fr 1fr 1fr 80px 70px 90px 120px 70px',
//                                 gap:
//                                   '8px',
//                                 alignItems:
//                                   'center',
//                                 padding:
//                                   '10px 12px',
//                                 border:
//                                   '1px solid #e5e7eb',
//                                 borderRadius:
//                                   '8px',
//                                 background:
//                                   '#f9fafb',
//                                 marginBottom:
//                                   '8px',
//                                 width:
//                                   '100%'
//                               }}
//                             >

//                               <div
//                                 className="item-number"
//                                 style={{
//                                   fontWeight:
//                                     700,
//                                   color:
//                                     '#555',
//                                   textAlign:
//                                     'center'
//                                 }}
//                               >
//                                 {
//                                   index +
//                                   1
//                                 }
//                               </div>

//                               {/* ITEM */}

//                               <div className="field">

//                                 <div
//                                   style={{
//                                     padding:
//                                       '8px 0',
//                                     fontWeight:
//                                       500
//                                   }}
//                                 >
//                                   {
//                                     item.item ||
//                                     '-'
//                                   }
//                                 </div>

//                               </div>

//                               {/* BRAND */}

//                               <div className="field">

//                                 <div
//                                   style={{
//                                     padding:
//                                       '8px 0'
//                                   }}
//                                 >
//                                   {
//                                     item.brand ||
//                                     '-'
//                                   }
//                                 </div>

//                               </div>

//                               {/* DESCRIPTION */}

//                               <div className="field">

//                                 <div
//                                   style={{
//                                     padding:
//                                       '8px 0',
//                                     whiteSpace:
//                                       'pre-wrap',
//                                     wordBreak:
//                                       'break-word'
//                                   }}
//                                 >
//                                   {
//                                     item.description ||
//                                     '-'
//                                   }
//                                 </div>

//                               </div>

//                               {/* UOM */}

//                               <div className="field">

//                                 <div
//                                   style={{
//                                     padding:
//                                       '8px 0'
//                                   }}
//                                 >
//                                   {
//                                     item.uom ||
//                                     'PCS'
//                                   }
//                                 </div>

//                               </div>

//                               {/* QTY */}

//                               <div className="field">

//                                 <div
//                                   style={{
//                                     padding:
//                                       '8px 0',
//                                     textAlign:
//                                       'center'
//                                   }}
//                                 >
//                                   {
//                                     item.qty
//                                   }
//                                 </div>

//                               </div>

//                               {/* PRICE */}

//                               <div className="field">

//                                 <div
//                                   style={{
//                                     padding:
//                                       '8px 0',
//                                     textAlign:
//                                       'right'
//                                   }}
//                                 >
//                                   Rs{' '}
//                                   {
//                                     currency(
//                                       item.price
//                                     )
//                                   }
//                                 </div>

//                               </div>

//                               {/* TOTAL */}

//                               <div
//                                 className="item-total-editor"
//                                 style={{
//                                   height:
//                                     '39px',
//                                   padding:
//                                     '5px 8px',
//                                   display:
//                                     'flex',
//                                   flexDirection:
//                                     'column',
//                                   justifyContent:
//                                     'center',
//                                   background:
//                                     '#fff',
//                                   border:
//                                     '1px solid #d1d5db',
//                                   borderRadius:
//                                     '6px'
//                                 }}
//                               >

//                                 <span
//                                   style={{
//                                     fontSize:
//                                       '9px',
//                                     color:
//                                       '#777'
//                                   }}
//                                 >
//                                   Total
//                                 </span>

//                                 <strong
//                                   style={{
//                                     fontSize:
//                                       '12px'
//                                   }}
//                                 >
//                                   Rs{' '}
//                                   {
//                                     currency(
//                                       (item.qty ||
//                                         0) *
//                                         (item.price ||
//                                           0)
//                                     )
//                                   }
//                                 </strong>

//                               </div>

//                               {/* ACTIONS */}

//                               <div
//                                 style={{
//                                   display:
//                                     'flex',
//                                   gap:
//                                     '4px'
//                                 }}
//                               >

//                                 <button
//                                   type="button"
//                                   onClick={() =>
//                                     openEditProduct(
//                                       index
//                                     )
//                                   }
//                                   style={{
//                                     height:
//                                       '39px',
//                                     width:
//                                       '35px',
//                                     border:
//                                       'none',
//                                     borderRadius:
//                                       '6px',
//                                     background:
//                                       '#dbeafe',
//                                     color:
//                                       '#1d4ed8',
//                                     fontSize:
//                                       '16px',
//                                     cursor:
//                                       'pointer',
//                                     display:
//                                       'flex',
//                                     alignItems:
//                                       'center',
//                                     justifyContent:
//                                       'center'
//                                   }}
//                                 >
//                                   ✎
//                                 </button>

//                                 <button
//                                   type="button"
//                                   onClick={() =>
//                                     removeItem(
//                                       index
//                                     )
//                                   }
//                                   style={{
//                                     height:
//                                       '39px',
//                                     width:
//                                       '35px',
//                                     border:
//                                       'none',
//                                     borderRadius:
//                                       '6px',
//                                     background:
//                                       '#fee2e2',
//                                     color:
//                                       '#dc2626',
//                                     fontSize:
//                                       '20px',
//                                     cursor:
//                                       'pointer',
//                                     display:
//                                       'flex',
//                                     alignItems:
//                                       'center',
//                                     justifyContent:
//                                       'center'
//                                   }}
//                                 >
//                                   ×
//                                 </button>

//                               </div>

//                             </div>

//                           )
//                         )

//                       )}

//                     </div>

//                   </div>

//                 </div>

//                 {/* ==================================================
//                     TERMS
//                     ================================================== */}

//                 <div
//                   className="editor-section"
//                   style={{
//                     background:
//                       '#fff'
//                   }}
//                 >

//                   <div
//                     className="field field-full"
//                   >

//                     <label>
//                       Terms & Conditions
//                     </label>

//                     <textarea
//                       value={
//                         terms
//                       }
//                       onChange={e =>
//                         setTerms(
//                           e.target.value
//                         )
//                       }
//                       rows="3"
//                       placeholder="Payment terms, delivery, warranty, etc."
//                       style={{
//                         width:
//                           '100%',
//                         padding:
//                           '10px',
//                         border:
//                           '1px solid #d1d5db',
//                         borderRadius:
//                           '6px',
//                         resize:
//                           'vertical'
//                       }}
//                     />

//                   </div>

//                 </div>

//                 {error && (

//                   <div
//                     className="quotation-alert quotation-error"
//                     style={{
//                       marginBottom:
//                         '15px'
//                     }}
//                   >
//                     {
//                       error
//                     }
//                   </div>

//                 )}

//                 {/* ==================================================
//                     FORM BUTTONS
//                     ================================================== */}

//                 <div
//                   style={{
//                     display:
//                       'flex',
//                     gap:
//                       '10px',
//                     marginTop:
//                       '20px',
//                     paddingTop:
//                       '15px',
//                     borderTop:
//                       '1px solid #e5e7eb',
//                     flexShrink:
//                       0,
//                     backgroundColor:
//                       '#fff',
//                     position:
//                       'sticky',
//                     bottom:
//                       0,
//                     paddingBottom:
//                       '5px'
//                   }}
//                 >

//                   <button
//                     type="submit"
//                     disabled={
//                       saving
//                     }
//                     className="btn btn-primary"
//                     style={{
//                       flex:
//                         1,
//                       padding:
//                         '12px 20px',
//                       fontSize:
//                         '15px'
//                     }}
//                   >
//                     {
//                       saving
//                         ? 'Saving...'
//                         : editingId
//                           ? 'Update Quotation'
//                           : 'Create Quotation'
//                     }
//                   </button>

//                   <button
//                     type="button"
//                     onClick={() => {
//                       setShowForm(
//                         false
//                       )
//                       resetForm()
//                     }}
//                     className="btn btn-secondary"
//                     style={{
//                       padding:
//                         '12px 25px',
//                       fontSize:
//                         '15px'
//                     }}
//                   >
//                     Cancel
//                   </button>

//                 </div>

//               </form>

//             </div>

//           </div>

//         </div>

//       )}

//       {/* ========================================================
//           EDIT PRODUCT MODAL
//           ======================================================== */}

//       {editingProductIndex !== null && (

//         <div
//           className="edit-product-modal"
//           style={{
//             position:
//               'fixed',
//             inset: 0,
//             zIndex:
//               99999,
//             backgroundColor:
//               'rgba(0,0,0,0.5)',
//             display:
//               'flex',
//             alignItems:
//               'center',
//             justifyContent:
//               'center',
//             padding:
//               '20px'
//           }}
//         >

//           <div
//             style={{
//               backgroundColor:
//                 '#fff',
//               borderRadius:
//                 '12px',
//               padding:
//                 '25px',
//               maxWidth:
//                 '500px',
//               width:
//                 '100%',
//               boxShadow:
//                 '0 20px 60px rgba(0,0,0,0.3)'
//             }}
//           >

//             <div
//               style={{
//                 display:
//                   'flex',
//                 justifyContent:
//                   'space-between',
//                 alignItems:
//                   'center',
//                 marginBottom:
//                   '20px'
//               }}
//             >

//               <h3
//                 style={{
//                   margin:
//                     0,
//                   fontSize:
//                     '18px',
//                   fontWeight:
//                     700
//                 }}
//               >
//                 Edit Product
//               </h3>

//               <button
//                 onClick={
//                   closeEditProduct
//                 }
//                 style={{
//                   background:
//                     'none',
//                   border:
//                     'none',
//                   fontSize:
//                     '24px',
//                   cursor:
//                     'pointer',
//                   color:
//                     '#666'
//                 }}
//               >
//                 ✕
//               </button>

//             </div>

//             <div
//               style={{
//                 display:
//                   'flex',
//                 flexDirection:
//                   'column',
//                 gap:
//                   '15px'
//               }}
//             >

//               {/* ITEM */}

//               <div>

//                 <label
//                   style={{
//                     fontSize:
//                       '13px',
//                     fontWeight:
//                       600,
//                     color:
//                       '#374151',
//                     display:
//                       'block',
//                     marginBottom:
//                       '5px'
//                   }}
//                 >
//                   Item (Optional)
//                 </label>

//                 <input
//                   type="text"
//                   value={
//                     editProduct.item
//                   }
//                   onChange={e =>
//                     setEditProduct({
//                       ...editProduct,
//                       item:
//                         e.target.value
//                     })
//                   }
//                   style={{
//                     width:
//                       '100%',
//                     padding:
//                       '10px',
//                     border:
//                       '1px solid #d1d5db',
//                     borderRadius:
//                       '6px'
//                   }}
//                 />

//               </div>

//               {/* BRAND */}

//               <div>

//                 <label
//                   style={{
//                     fontSize:
//                       '13px',
//                     fontWeight:
//                       600,
//                     color:
//                       '#374151',
//                     display:
//                       'block',
//                     marginBottom:
//                       '5px'
//                   }}
//                 >
//                   Brand (Optional)
//                 </label>

//                 <input
//                   type="text"
//                   value={
//                     editProduct.brand
//                   }
//                   onChange={e =>
//                     setEditProduct({
//                       ...editProduct,
//                       brand:
//                         e.target.value
//                     })
//                   }
//                   style={{
//                     width:
//                       '100%',
//                     padding:
//                       '10px',
//                     border:
//                       '1px solid #d1d5db',
//                     borderRadius:
//                       '6px'
//                   }}
//                 />

//               </div>

//               {/* DESCRIPTION */}

//               <div>

//                 <label
//                   style={{
//                     fontSize:
//                       '13px',
//                     fontWeight:
//                       600,
//                     color:
//                       '#374151',
//                     display:
//                       'block',
//                     marginBottom:
//                       '5px'
//                   }}
//                 >
//                   Description (Optional)
//                 </label>

//                 <textarea
//                   value={
//                     editProduct.description
//                   }
//                   onChange={e =>
//                     setEditProduct({
//                       ...editProduct,
//                       description:
//                         e.target.value
//                     })
//                   }
//                   rows="2"
//                   placeholder="Product description"
//                   style={{
//                     width:
//                       '100%',
//                     padding:
//                       '10px',
//                     border:
//                       '1px solid #d1d5db',
//                     borderRadius:
//                       '6px',
//                     resize:
//                       'vertical'
//                   }}
//                 />

//               </div>

//               {/* UOM QTY PRICE */}

//               <div
//                 style={{
//                   display:
//                     'grid',
//                   gridTemplateColumns:
//                     '1fr 1fr 1fr',
//                   gap:
//                     '10px'
//                 }}
//               >

//                 <div>

//                   <label
//                     style={{
//                       fontSize:
//                         '13px',
//                       fontWeight:
//                         600,
//                       color:
//                         '#374151',
//                       display:
//                         'block',
//                       marginBottom:
//                         '5px'
//                     }}
//                   >
//                     UOM
//                   </label>

//                   <input
//                     type="text"
//                     value={
//                       editProduct.uom
//                     }
//                     onChange={e =>
//                       setEditProduct({
//                         ...editProduct,
//                         uom:
//                           e.target.value
//                       })
//                     }
//                     style={{
//                       width:
//                         '100%',
//                       padding:
//                         '10px',
//                       border:
//                         '1px solid #d1d5db',
//                       borderRadius:
//                         '6px'
//                     }}
//                   />

//                 </div>

//                 <div>

//                   <label
//                     style={{
//                       fontSize:
//                         '13px',
//                       fontWeight:
//                         600,
//                       color:
//                         '#374151',
//                       display:
//                         'block',
//                       marginBottom:
//                         '5px'
//                     }}
//                   >
//                     Qty
//                   </label>

//                   <input
//                     type="number"
//                     min="1"
//                     value={
//                       editProduct.qty
//                     }
//                     onChange={e =>
//                       setEditProduct({
//                         ...editProduct,
//                         qty:
//                           Number(
//                             e.target.value
//                           ) || 1
//                       })
//                     }
//                     style={{
//                       width:
//                         '100%',
//                       padding:
//                         '10px',
//                       border:
//                         '1px solid #d1d5db',
//                       borderRadius:
//                         '6px'
//                     }}
//                   />

//                 </div>

//                 <div>

//                   <label
//                     style={{
//                       fontSize:
//                         '13px',
//                       fontWeight:
//                         600,
//                       color:
//                         '#374151',
//                       display:
//                         'block',
//                       marginBottom:
//                         '5px'
//                     }}
//                   >
//                     Price
//                   </label>

//                   <input
//                     type="number"
//                     min="0"
//                     step="0.01"
//                     value={
//                       editProduct.price ===
//                       0
//                         ? ''
//                         : editProduct.price
//                     }
//                     onChange={e =>
//                       setEditProduct({
//                         ...editProduct,
//                         price:
//                           e.target.value ===
//                           ''
//                             ? ''
//                             : Number(
//                                 e.target.value
//                               )
//                       })
//                     }
//                     style={{
//                       width:
//                         '100%',
//                       padding:
//                         '10px',
//                       border:
//                         '1px solid #d1d5db',
//                       borderRadius:
//                         '6px'
//                     }}
//                   />

//                 </div>

//               </div>

//               <button
//                 onClick={
//                   saveEditProduct
//                 }
//                 disabled={
//                   !editProduct.item.trim() &&
//                   !editProduct.description.trim()
//                 }
//                 style={{
//                   width:
//                     '100%',
//                   padding:
//                     '12px',
//                   border:
//                     'none',
//                   borderRadius:
//                     '6px',
//                   background:
//                     '#062d73',
//                   color:
//                     '#fff',
//                   fontSize:
//                     '15px',
//                   fontWeight:
//                     600,
//                   cursor:
//                     'pointer',
//                   marginTop:
//                     '10px'
//                 }}
//               >
//                 Save Product
//               </button>

//             </div>

//           </div>

//         </div>

//       )}

//       {/* ========================================================
//           QUOTATION PREVIEW
//           ======================================================== */}

//       {previewData && (

//         <div
//           className="quotation-preview-overlay"
//           style={{
//             position:
//               'fixed',
//             inset: 0,
//             zIndex:
//               99999,
//             background:
//               'rgba(0,0,0,0.6)',
//             overflow:
//               'auto',
//             padding:
//               '20px'
//           }}
//         >

//           <div
//             style={{
//               maxWidth:
//                 '900px',
//               margin:
//                 '0 auto'
//             }}
//           >

//             <div
//               className="no-print"
//               style={{
//                 display:
//                   'flex',
//                 justifyContent:
//                   'space-between',
//                 alignItems:
//                   'center',
//                 marginBottom:
//                   '15px'
//               }}
//             >

//               <div>

//                 <h3
//                   style={{
//                     color:
//                       '#fff',
//                     margin:
//                       0
//                   }}
//                 >
//                   Quotation Preview
//                 </h3>

//                 <p
//                   style={{
//                     color:
//                       '#ccc',
//                     margin:
//                       '5px 0 0',
//                     fontSize:
//                       '13px'
//                   }}
//                 >
//                   {
//                     previewData.quotationNumber
//                   }
//                 </p>

//               </div>

//               <div
//                 style={{
//                   display:
//                     'flex',
//                   gap:
//                     '10px'
//                 }}
//               >

//                 <button
//                   onClick={() =>
//                     window.print()
//                   }
//                   style={{
//                     background:
//                       '#fff',
//                     color:
//                       '#111',
//                     padding:
//                       '10px 20px',
//                     border:
//                       'none',
//                     borderRadius:
//                       '6px',
//                     cursor:
//                       'pointer',
//                     fontWeight:
//                       600
//                   }}
//                 >
//                   🖨 Print
//                 </button>

//                 <button
//                   onClick={() =>
//                     setPreviewData(
//                       null
//                     )
//                   }
//                   style={{
//                     background:
//                       'rgba(255,255,255,0.2)',
//                     color:
//                       '#fff',
//                     padding:
//                       '10px 20px',
//                     border:
//                       'none',
//                     borderRadius:
//                       '6px',
//                     cursor:
//                       'pointer'
//                   }}
//                 >
//                   ✕ Close
//                 </button>

//               </div>

//             </div>

//             {/* ==================================================
//                 PDF CONTENT
//                 ================================================== */}

//             <div
//               id="quotation-pdf-content"
//               ref={
//                 printRef
//               }
//               style={{
//                 background:
//                   '#ffffff',
//                 padding:
//                   '12mm 8mm 8mm',
//                 position:
//                   'relative',
//                 width:
//                   '210mm',
//                 minHeight:
//                   '297mm',
//                 margin:
//                   '0 auto',
//                 boxShadow:
//                   '0 3px 20px rgba(0,0,0,0.12)',
//                 fontFamily:
//                   'Arial, Helvetica, sans-serif',
//                 color:
//                   '#111111',
//                 boxSizing:
//                   'border-box'
//               }}
//             >

//               <div
//                 className="quote-heading"
//                 style={{
//                   textAlign:
//                     'center',
//                   color:
//                     '#062d73',
//                   fontSize:
//                     '24px',
//                   fontWeight:
//                     800,
//                   textDecoration:
//                     'underline',
//                   marginBottom:
//                     '8mm'
//                 }}
//               >
//                 QUOTATION
//               </div>

//               <div
//                 className="quote-header"
//                 style={{
//                   display:
//                     'grid',
//                   gridTemplateColumns:
//                     '1fr 1fr 1fr',
//                   gap:
//                     '5mm',
//                   alignItems:
//                     'start',
//                   minHeight:
//                     '43mm'
//                 }}
//               >

//                 <div
//                   className="company-info"
//                   style={{
//                     fontSize:
//                       '10px',
//                     lineHeight:
//                       '1.45'
//                   }}
//                 >

//                   <div
//                     className="company-name"
//                     style={{
//                       fontWeight:
//                         700,
//                       fontSize:
//                         '11px',
//                       marginBottom:
//                         '1mm'
//                     }}
//                   >
//                     {
//                       previewData.companyName ||
//                       'Your Company'
//                     }
//                   </div>

//                   <div
//                     className="company-address"
//                     style={{
//                       whiteSpace:
//                         'normal'
//                     }}
//                   >
//                     {
//                       previewData.companyAddress ||
//                       'Company Address'
//                     }
//                   </div>

//                   <div>
//                     Phone:{' '}
//                     {
//                       previewData.companyPhone ||
//                       'N/A'
//                     }
//                   </div>

//                   <div>
//                     Email:{' '}
//                     {
//                       previewData.companyEmail ||
//                       '-'
//                     }
//                   </div>

//                 </div>

//                 <div
//                   className="quote-logo"
//                   style={{
//                     textAlign:
//                       'center',
//                     paddingTop:
//                       '2mm'
//                   }}
//                 >

//                   <img
//                     src={
//                       previewData.companyLogo ||
//                       '/PN.png'
//                     }
//                     alt="Company Logo"
//                     style={{
//                       width:
//                         '33mm',
//                       height:
//                         '33mm',
//                       objectFit:
//                         'contain',
//                       display:
//                         'block',
//                       margin:
//                         '0 auto'
//                     }}
//                     onError={e => {
//                       e.target.style.display =
//                         'none'
//                     }}
//                   />

//                 </div>

//                 <div
//                   className="quote-info"
//                   style={{
//                     fontSize:
//                       '10px',
//                     lineHeight:
//                       '1.8'
//                   }}
//                 >

//                   <div
//                     style={{
//                       display:
//                         'grid',
//                       gridTemplateColumns:
//                         '32mm 1fr',
//                       gap:
//                         '2mm'
//                     }}
//                   >
//                     <strong
//                       style={{
//                         textAlign:
//                           'right'
//                       }}
//                     >
//                       Quote #
//                     </strong>

//                     <span
//                       style={{
//                         textAlign:
//                           'left'
//                       }}
//                     >
//                       {
//                         previewData.quotationNumber
//                       }
//                     </span>
//                   </div>

//                   <div
//                     style={{
//                       display:
//                         'grid',
//                       gridTemplateColumns:
//                         '32mm 1fr',
//                       gap:
//                         '2mm'
//                     }}
//                   >
//                     <strong
//                       style={{
//                         textAlign:
//                           'right'
//                       }}
//                     >
//                       Date
//                     </strong>

//                     <span
//                       style={{
//                         textAlign:
//                           'left'
//                       }}
//                     >
//                       {
//                         previewData.date
//                       }
//                     </span>
//                   </div>

//                   <div
//                     style={{
//                       display:
//                         'grid',
//                       gridTemplateColumns:
//                         '32mm 1fr',
//                       gap:
//                         '2mm'
//                     }}
//                   >
//                     <strong
//                       style={{
//                         textAlign:
//                           'right'
//                       }}
//                     >
//                       Validity
//                     </strong>

//                     <span
//                       style={{
//                         textAlign:
//                           'left'
//                       }}
//                     >
//                       {
//                         previewData.validity
//                           ? `${previewData.validity} Days`
//                           : 'N/A'
//                       }
//                     </span>
//                   </div>

//                   {previewData.validity &&
//                     previewData.date && (

//                       <div
//                         style={{
//                           display:
//                             'grid',
//                           gridTemplateColumns:
//                             '32mm 1fr',
//                           gap:
//                             '2mm'
//                         }}
//                       >

//                         <strong
//                           style={{
//                             textAlign:
//                               'right'
//                           }}
//                         >
//                           Valid Till
//                         </strong>

//                         <span
//                           style={{
//                             textAlign:
//                               'left'
//                           }}
//                         >
//                           {(() => {
//                             const dateObj =
//                               new Date(
//                                 previewData.date
//                               )

//                             dateObj.setDate(
//                               dateObj.getDate() +
//                                 Number(
//                                   previewData.validity
//                                 )
//                             )

//                             return dateObj
//                               .toISOString()
//                               .split(
//                                 'T'
//                               )[0]
//                           })()}
//                         </span>

//                       </div>

//                     )}

//                 </div>

//               </div>

//               {/* QUOTE TO */}

//               <div
//                 className="quote-to-title"
//                 style={{
//                   background:
//                     '#062d73',
//                   color:
//                     '#ffffff',
//                   fontSize:
//                     '11px',
//                   fontWeight:
//                     700,
//                   padding:
//                     '2mm 4mm',
//                   marginTop:
//                     '2mm'
//                 }}
//               >
//                 QUOTE TO
//               </div>

//               <div
//                 className="quote-to-content"
//                 style={{
//                   padding:
//                     '3mm 4mm',
//                   minHeight:
//                     '18mm',
//                   fontSize:
//                     '10px',
//                   lineHeight:
//                     '1.7'
//                 }}
//               >

//                 <strong>
//                   {
//                     previewData.customer?.name ||
//                     ''
//                   }
//                 </strong>

//                 {previewData.customer?.company && (
//                   <div>
//                     {
//                       previewData.customer.company
//                     }
//                   </div>
//                 )}

//                 {previewData.customer?.address && (
//                   <div>
//                     {
//                       previewData.customer.address
//                     }
//                   </div>
//                 )}

//                 {previewData.customer?.phone && (
//                   <div>
//                     Phone:{' '}
//                     {
//                       previewData.customer.phone
//                     }
//                   </div>
//                 )}

//               </div>

//               {/* PROJECT */}

//               {previewData.project && (

//                 <div
//                   className="project-row"
//                   style={{
//                     padding:
//                       '2mm 4mm',
//                     fontSize:
//                       '9px',
//                     border:
//                       '0.35mm solid #062d73',
//                     marginTop:
//                       '2mm',
//                     backgroundColor:
//                       '#f8f9fa'
//                   }}
//                 >

//                   <strong>
//                     Project:{' '}
//                   </strong>

//                   <span>
//                     {
//                       previewData.project
//                     }
//                   </span>

//                 </div>

//               )}

//               {/* ==================================================
//                   DYNAMIC TABLE
//                   ================================================== */}

//               {(() => {

//                 const previewItems =
//                   previewData.items ||
//                   []

//                 const showItem =
//                   previewItems.some(
//                     item =>
//                       item.item &&
//                       item.item.trim() !== ''
//                   )

//                 const showBrand =
//                   previewItems.some(
//                     item =>
//                       item.brand &&
//                       item.brand.trim() !== ''
//                   )

//                 const showDescription =
//                   previewItems.some(
//                     item =>
//                       item.description &&
//                       item.description.trim() !== ''
//                   )

//                 let itemCol = 0
//                 let brandCol = 0
//                 let descCol = 0

//                 if (
//                   showItem &&
//                   showBrand &&
//                   showDescription
//                 ) {
//                   itemCol = 16
//                   brandCol = 12
//                   descCol = 20
//                 } else if (
//                   showItem &&
//                   showBrand &&
//                   !showDescription
//                 ) {
//                   itemCol = 22
//                   brandCol = 16
//                   descCol = 0
//                 } else if (
//                   showItem &&
//                   !showBrand &&
//                   showDescription
//                 ) {
//                   itemCol = 18
//                   brandCol = 0
//                   descCol = 22
//                 } else if (
//                   !showItem &&
//                   showBrand &&
//                   showDescription
//                 ) {
//                   itemCol = 0
//                   brandCol = 16
//                   descCol = 24
//                 } else if (
//                   showItem &&
//                   !showBrand &&
//                   !showDescription
//                 ) {
//                   itemCol = 30
//                   brandCol = 0
//                   descCol = 0
//                 } else if (
//                   !showItem &&
//                   showBrand &&
//                   !showDescription
//                 ) {
//                   itemCol = 0
//                   brandCol = 28
//                   descCol = 0
//                 } else if (
//                   !showItem &&
//                   !showBrand &&
//                   showDescription
//                 ) {
//                   itemCol = 0
//                   brandCol = 0
//                   descCol = 32
//                 } else {
//                   itemCol = 0
//                   brandCol = 0
//                   descCol = 0
//                 }

//                 if (!showDescription) {
//                   descCol = 0
//                 }

//                 return (

//                   <table
//                     className="quote-table"
//                     style={{
//                       width:
//                         '100%',
//                       borderCollapse:
//                         'collapse',
//                       tableLayout:
//                         'fixed',
//                       fontSize:
//                         '9px',
//                       borderLeft:
//                         '0.35mm solid #111111',
//                       borderRight:
//                         '0.35mm solid #111111',
//                       marginTop:
//                         previewData.project
//                           ? '2mm'
//                           : '0'
//                     }}
//                   >

//                     <thead>

//                       <tr>

//                         <th
//                           style={{
//                             width:
//                               '5%',
//                             textAlign:
//                               'center',
//                             borderLeft:
//                               '0.35mm solid #111111',
//                             borderRight:
//                               '0.35mm solid #111111',
//                             padding:
//                               '1.3mm 1mm',
//                             verticalAlign:
//                               'middle',
//                             fontSize:
//                               '9px',
//                             fontWeight:
//                               700,
//                             height:
//                               '9mm',
//                             backgroundColor:
//                               '#f5f5f5',
//                             borderTop:
//                               '0.35mm solid #111111',
//                             borderBottom:
//                               '0.35mm solid #111111'
//                           }}
//                         >
//                           #
//                         </th>

//                         {showItem && (

//                           <th
//                             style={{
//                               width:
//                                 `${itemCol}%`,
//                               textAlign:
//                                 'left',
//                               borderLeft:
//                                 '0.35mm solid #111111',
//                               borderRight:
//                                 '0.35mm solid #111111',
//                               padding:
//                                 '1.3mm 1mm',
//                               verticalAlign:
//                                 'middle',
//                               fontSize:
//                                 '9px',
//                               fontWeight:
//                                 700,
//                               height:
//                                 '9mm',
//                               backgroundColor:
//                                 '#f5f5f5',
//                               borderTop:
//                                 '0.35mm solid #111111',
//                               borderBottom:
//                                 '0.35mm solid #111111'
//                             }}
//                           >
//                             Item
//                           </th>

//                         )}

//                         {showBrand && (

//                           <th
//                             style={{
//                               width:
//                                 `${brandCol}%`,
//                               textAlign:
//                                 'left',
//                               borderLeft:
//                                 '0.35mm solid #111111',
//                               borderRight:
//                                 '0.35mm solid #111111',
//                               padding:
//                                 '1.3mm 1mm',
//                               verticalAlign:
//                                 'middle',
//                               fontSize:
//                                 '9px',
//                               fontWeight:
//                                 700,
//                               height:
//                                 '9mm',
//                               backgroundColor:
//                                 '#f5f5f5',
//                               borderTop:
//                                 '0.35mm solid #111111',
//                               borderBottom:
//                                 '0.35mm solid #111111'
//                             }}
//                           >
//                             Brand
//                           </th>

//                         )}

//                         {showDescription && (

//                           <th
//                             style={{
//                               width:
//                                 `${descCol}%`,
//                               textAlign:
//                                 'left',
//                               borderLeft:
//                                 '0.35mm solid #111111',
//                               borderRight:
//                                 '0.35mm solid #111111',
//                               padding:
//                                 '1.3mm 1mm',
//                               verticalAlign:
//                                 'middle',
//                               fontSize:
//                                 '9px',
//                               fontWeight:
//                                 700,
//                               height:
//                                 '9mm',
//                               backgroundColor:
//                                 '#f5f5f5',
//                               borderTop:
//                                 '0.35mm solid #111111',
//                               borderBottom:
//                                 '0.35mm solid #111111'
//                             }}
//                           >
//                             Description
//                           </th>

//                         )}

//                         <th
//                           style={{
//                             width:
//                               '8%',
//                             textAlign:
//                               'center',
//                             borderLeft:
//                               '0.35mm solid #111111',
//                             borderRight:
//                               '0.35mm solid #111111',
//                             padding:
//                               '1.3mm 1mm',
//                             verticalAlign:
//                               'middle',
//                             fontSize:
//                               '9px',
//                             fontWeight:
//                               700,
//                             height:
//                               '9mm',
//                             backgroundColor:
//                               '#f5f5f5',
//                             borderTop:
//                               '0.35mm solid #111111',
//                             borderBottom:
//                               '0.35mm solid #111111'
//                           }}
//                         >
//                           UOM
//                         </th>

//                         <th
//                           style={{
//                             width:
//                               '6%',
//                             textAlign:
//                               'center',
//                             borderLeft:
//                               '0.35mm solid #111111',
//                             borderRight:
//                               '0.35mm solid #111111',
//                             padding:
//                               '1.3mm 1mm',
//                             verticalAlign:
//                               'middle',
//                             fontSize:
//                               '9px',
//                             fontWeight:
//                               700,
//                             height:
//                               '9mm',
//                             backgroundColor:
//                               '#f5f5f5',
//                             borderTop:
//                               '0.35mm solid #111111',
//                             borderBottom:
//                               '0.35mm solid #111111'
//                           }}
//                         >
//                           Qty
//                         </th>

//                         <th
//                           style={{
//                             width:
//                               '13%',
//                             textAlign:
//                               'center',
//                             borderLeft:
//                               '0.35mm solid #111111',
//                             borderRight:
//                               '0.35mm solid #111111',
//                             padding:
//                               '1.3mm 1mm',
//                             verticalAlign:
//                               'middle',
//                             fontSize:
//                               '9px',
//                             fontWeight:
//                               700,
//                             height:
//                               '9mm',
//                             backgroundColor:
//                               '#f5f5f5',
//                             borderTop:
//                               '0.35mm solid #111111',
//                             borderBottom:
//                               '0.35mm solid #111111'
//                           }}
//                         >
//                           Unit Price
//                         </th>

//                         <th
//                           style={{
//                             width:
//                               '14%',
//                             textAlign:
//                               'center',
//                             borderLeft:
//                               '0.35mm solid #111111',
//                             borderRight:
//                               '0.35mm solid #111111',
//                             padding:
//                               '1.3mm 1mm',
//                             verticalAlign:
//                               'middle',
//                             fontSize:
//                               '9px',
//                             fontWeight:
//                               700,
//                             height:
//                               '9mm',
//                             backgroundColor:
//                               '#f5f5f5',
//                             borderTop:
//                               '0.35mm solid #111111',
//                             borderBottom:
//                               '0.35mm solid #111111'
//                           }}
//                         >
//                           Total
//                         </th>

//                       </tr>

//                     </thead>

//                     <tbody>

//                       {previewItems.map(
//                         (
//                           item,
//                           index
//                         ) => {

//                           const qty =
//                             Number(
//                               item.qty
//                             ) || 0

//                           const price =
//                             Number(
//                               item.price
//                             ) || 0

//                           const total =
//                             qty *
//                             price

//                           return (

//                             <tr
//                               key={
//                                 index
//                               }
//                             >

//                               <td
//                                 style={{
//                                   textAlign:
//                                     'center',
//                                   borderLeft:
//                                     '0.35mm solid #111111',
//                                   borderRight:
//                                     '0.35mm solid #111111',
//                                   padding:
//                                     '1.3mm 1mm',
//                                   verticalAlign:
//                                     'middle',
//                                   height:
//                                     '7mm',
//                                   borderTop:
//                                     'none',
//                                   borderBottom:
//                                     'none'
//                                 }}
//                               >
//                                 {
//                                   index +
//                                   1
//                                 }
//                               </td>

//                               {showItem && (

//                                 <td
//                                   style={{
//                                     textAlign:
//                                       'left',
//                                     borderLeft:
//                                       '0.35mm solid #111111',
//                                     borderRight:
//                                       '0.35mm solid #111111',
//                                     padding:
//                                       '1.3mm 1mm',
//                                     verticalAlign:
//                                       'middle',
//                                     height:
//                                       '7mm',
//                                     borderTop:
//                                       'none',
//                                     borderBottom:
//                                       'none'
//                                   }}
//                                 >
//                                   {
//                                     item.item ||
//                                     '-'
//                                   }
//                                 </td>

//                               )}

//                               {showBrand && (

//                                 <td
//                                   style={{
//                                     textAlign:
//                                       'left',
//                                     borderLeft:
//                                       '0.35mm solid #111111',
//                                     borderRight:
//                                       '0.35mm solid #111111',
//                                     padding:
//                                       '1.3mm 1mm',
//                                     verticalAlign:
//                                       'middle',
//                                     height:
//                                       '7mm',
//                                     borderTop:
//                                       'none',
//                                     borderBottom:
//                                       'none'
//                                   }}
//                                 >
//                                   {
//                                     item.brand ||
//                                     '-'
//                                   }
//                                 </td>

//                               )}

//                               {showDescription && (

//                                 <td
//                                   style={{
//                                     textAlign:
//                                       'left',
//                                     borderLeft:
//                                       '0.35mm solid #111111',
//                                     borderRight:
//                                       '0.35mm solid #111111',
//                                     padding:
//                                       '1.3mm 1mm',
//                                     verticalAlign:
//                                       'middle',
//                                     height:
//                                       '7mm',
//                                     borderTop:
//                                       'none',
//                                     borderBottom:
//                                       'none',
//                                     whiteSpace:
//                                       'pre-wrap',
//                                     wordBreak:
//                                       'break-word'
//                                   }}
//                                 >
//                                   {
//                                     item.description ||
//                                     '-'
//                                   }
//                                 </td>

//                               )}

//                               <td
//                                 style={{
//                                   textAlign:
//                                     'center',
//                                   borderLeft:
//                                     '0.35mm solid #111111',
//                                   borderRight:
//                                     '0.35mm solid #111111',
//                                   padding:
//                                     '1.3mm 1mm',
//                                   verticalAlign:
//                                     'middle',
//                                   height:
//                                     '7mm',
//                                   borderTop:
//                                     'none',
//                                   borderBottom:
//                                     'none'
//                                 }}
//                               >
//                                 {
//                                   item.uom ||
//                                   'PCS'
//                                 }
//                               </td>

//                               <td
//                                 style={{
//                                   textAlign:
//                                     'center',
//                                   borderLeft:
//                                     '0.35mm solid #111111',
//                                   borderRight:
//                                     '0.35mm solid #111111',
//                                   padding:
//                                     '1.3mm 1mm',
//                                   verticalAlign:
//                                     'middle',
//                                   height:
//                                     '7mm',
//                                   borderTop:
//                                     'none',
//                                   borderBottom:
//                                     'none'
//                                 }}
//                               >
//                                 {
//                                   qty
//                                 }
//                               </td>

//                               <td
//                                 className="number-cell"
//                                 style={{
//                                   textAlign:
//                                     'right',
//                                   paddingRight:
//                                     '2mm',
//                                   borderLeft:
//                                     '0.35mm solid #111111',
//                                   borderRight:
//                                     '0.35mm solid #111111',
//                                   padding:
//                                     '1.3mm 1mm',
//                                   verticalAlign:
//                                     'middle',
//                                   height:
//                                     '7mm',
//                                   borderTop:
//                                     'none',
//                                   borderBottom:
//                                     'none'
//                                 }}
//                               >
//                                 Rs{' '}
//                                 {
//                                   currency(
//                                     price
//                                   )
//                                 }
//                               </td>

//                               <td
//                                 className="number-cell"
//                                 style={{
//                                   textAlign:
//                                     'right',
//                                   paddingRight:
//                                     '2mm',
//                                   borderLeft:
//                                     '0.35mm solid #111111',
//                                   borderRight:
//                                     '0.35mm solid #111111',
//                                   padding:
//                                     '1.3mm 1mm',
//                                   verticalAlign:
//                                     'middle',
//                                   height:
//                                     '7mm',
//                                   borderTop:
//                                     'none',
//                                   borderBottom:
//                                     'none'
//                                 }}
//                               >
//                                 Rs{' '}
//                                 {
//                                   currency(
//                                     total
//                                   )
//                                 }
//                               </td>

//                             </tr>

//                           )
//                         }
//                       )}

//                       {Array.from({
//                         length:
//                           Math.max(
//                             0,
//                             8 -
//                               (
//                                 previewItems.length ||
//                                 0
//                               )
//                           )
//                       }).map(
//                         (
//                           _,
//                           i
//                         ) => (

//                           <tr
//                             key={
//                               `empty-${i}`
//                             }
//                             className="empty-item-row"
//                           >

//                             <td
//                               style={{
//                                 height:
//                                   '6.5mm',
//                                 borderLeft:
//                                   '0.35mm solid #111111',
//                                 borderRight:
//                                   '0.35mm solid #111111',
//                                 padding:
//                                   '1.3mm 1mm',
//                                 verticalAlign:
//                                   'middle',
//                                 borderTop:
//                                   'none',
//                                 borderBottom:
//                                   'none'
//                               }}
//                             />

//                             {showItem && (
//                               <td
//                                 style={{
//                                   height:
//                                     '6.5mm',
//                                   borderLeft:
//                                     '0.35mm solid #111111',
//                                   borderRight:
//                                     '0.35mm solid #111111',
//                                   padding:
//                                     '1.3mm 1mm',
//                                   verticalAlign:
//                                     'middle',
//                                   borderTop:
//                                     'none',
//                                   borderBottom:
//                                     'none'
//                                 }}
//                               />
//                             )}

//                             {showBrand && (
//                               <td
//                                 style={{
//                                   height:
//                                     '6.5mm',
//                                   borderLeft:
//                                     '0.35mm solid #111111',
//                                   borderRight:
//                                     '0.35mm solid #111111',
//                                   padding:
//                                     '1.3mm 1mm',
//                                   verticalAlign:
//                                     'middle',
//                                   borderTop:
//                                     'none',
//                                   borderBottom:
//                                     'none'
//                                 }}
//                               />
//                             )}

//                             {showDescription && (
//                               <td
//                                 style={{
//                                   height:
//                                     '6.5mm',
//                                   borderLeft:
//                                     '0.35mm solid #111111',
//                                   borderRight:
//                                     '0.35mm solid #111111',
//                                   padding:
//                                     '1.3mm 1mm',
//                                   verticalAlign:
//                                     'middle',
//                                   borderTop:
//                                     'none',
//                                   borderBottom:
//                                     'none'
//                                 }}
//                               />
//                             )}

//                             <td
//                               style={{
//                                 height:
//                                   '6.5mm',
//                                 borderLeft:
//                                   '0.35mm solid #111111',
//                                 borderRight:
//                                   '0.35mm solid #111111',
//                                 padding:
//                                   '1.3mm 1mm',
//                                 verticalAlign:
//                                   'middle',
//                                 borderTop:
//                                   'none',
//                                 borderBottom:
//                                   'none'
//                               }}
//                             />

//                             <td
//                               style={{
//                                 height:
//                                   '6.5mm',
//                                 borderLeft:
//                                   '0.35mm solid #111111',
//                                 borderRight:
//                                   '0.35mm solid #111111',
//                                 padding:
//                                   '1.3mm 1mm',
//                                 verticalAlign:
//                                   'middle',
//                                 borderTop:
//                                   'none',
//                                 borderBottom:
//                                   'none'
//                               }}
//                             />

//                             <td
//                               style={{
//                                 height:
//                                   '6.5mm',
//                                 borderLeft:
//                                   '0.35mm solid #111111',
//                                 borderRight:
//                                   '0.35mm solid #111111',
//                                 padding:
//                                   '1.3mm 1mm',
//                                 verticalAlign:
//                                   'middle',
//                                 borderTop:
//                                   'none',
//                                 borderBottom:
//                                   'none'
//                               }}
//                             />

//                             <td
//                               style={{
//                                 height:
//                                   '6.5mm',
//                                 borderLeft:
//                                   '0.35mm solid #111111',
//                                 borderRight:
//                                   '0.35mm solid #111111',
//                                 padding:
//                                   '1.3mm 1mm',
//                                 verticalAlign:
//                                   'middle',
//                                 borderTop:
//                                   'none',
//                                 borderBottom:
//                                   'none'
//                               }}
//                             />

//                           </tr>

//                         )
//                       )}

//                       <tr>

//                         <td
//                           style={{
//                             height:
//                               '1mm',
//                             borderLeft:
//                               '0.35mm solid #111111',
//                             borderRight:
//                               '0.35mm solid #111111',
//                             borderBottom:
//                               '0.35mm solid #111111',
//                             padding:
//                               0
//                           }}
//                         />

//                         {showItem && (
//                           <td
//                             style={{
//                               height:
//                                 '1mm',
//                               borderLeft:
//                                 '0.35mm solid #111111',
//                               borderRight:
//                                 '0.35mm solid #111111',
//                               borderBottom:
//                                 '0.35mm solid #111111',
//                               padding:
//                                 0
//                             }}
//                           />
//                         )}

//                         {showBrand && (
//                           <td
//                             style={{
//                               height:
//                                 '1mm',
//                               borderLeft:
//                                 '0.35mm solid #111111',
//                               borderRight:
//                                 '0.35mm solid #111111',
//                               borderBottom:
//                                 '0.35mm solid #111111',
//                               padding:
//                                 0
//                             }}
//                           />
//                         )}

//                         {showDescription && (
//                           <td
//                             style={{
//                               height:
//                                 '1mm',
//                               borderLeft:
//                                 '0.35mm solid #111111',
//                               borderRight:
//                                 '0.35mm solid #111111',
//                               borderBottom:
//                                 '0.35mm solid #111111',
//                               padding:
//                                 0
//                             }}
//                           />
//                         )}

//                         <td
//                           style={{
//                             height:
//                               '1mm',
//                             borderLeft:
//                               '0.35mm solid #111111',
//                             borderRight:
//                               '0.35mm solid #111111',
//                             borderBottom:
//                               '0.35mm solid #111111',
//                             padding:
//                               0
//                           }}
//                         />

//                         <td
//                           style={{
//                             height:
//                               '1mm',
//                             borderLeft:
//                               '0.35mm solid #111111',
//                             borderRight:
//                               '0.35mm solid #111111',
//                             borderBottom:
//                               '0.35mm solid #111111',
//                             padding:
//                               0
//                           }}
//                         />

//                         <td
//                           style={{
//                             height:
//                               '1mm',
//                             borderLeft:
//                               '0.35mm solid #111111',
//                             borderRight:
//                               '0.35mm solid #111111',
//                             borderBottom:
//                               '0.35mm solid #111111',
//                             padding:
//                               0
//                           }}
//                         />

//                         <td
//                           style={{
//                             height:
//                               '1mm',
//                             borderLeft:
//                               '0.35mm solid #111111',
//                             borderRight:
//                               '0.35mm solid #111111',
//                             borderBottom:
//                               '0.35mm solid #111111',
//                             padding:
//                               0
//                           }}
//                         />

//                       </tr>

//                     </tbody>

//                   </table>

//                 )
//               })()}

//               {/* TOTAL */}

//               <div
//                 className="subtotal-row"
//                 style={{
//                   width:
//                     '100%',
//                   minHeight:
//                     '13mm',
//                   border:
//                     '0.35mm solid #062d73',
//                   borderTop:
//                     '0',
//                   display:
//                     'grid',
//                   gridTemplateColumns:
//                     '1fr 45mm',
//                   alignItems:
//                     'center',
//                   fontSize:
//                     '10px',
//                   fontWeight:
//                     700,
//                   paddingLeft:
//                     '4mm',
//                   backgroundColor:
//                     '#f8f9fa'
//                 }}
//               >

//                 <span
//                   style={{
//                     padding:
//                       '3mm 0',
//                     height:
//                       '100%',
//                     display:
//                       'flex',
//                     alignItems:
//                       'center',
//                     paddingLeft:
//                       '4mm'
//                   }}
//                 >
//                   TOTAL
//                 </span>

//                 <strong
//                   style={{
//                     textAlign:
//                       'right',
//                     paddingRight:
//                       '4mm',
//                     fontSize:
//                       '11px'
//                   }}
//                 >
//                   Rs{' '}
//                   {
//                     currency(
//                       previewData.total ||
//                         0
//                     )
//                   }
//                 </strong>

//               </div>

//               {/* TERMS */}

//               {previewData.terms && (

//                 <div
//                   className="terms-section"
//                   style={{
//                     minHeight:
//                       '58mm',
//                     border:
//                       '0.35mm solid #062d73',
//                     borderTop:
//                       '0',
//                     padding:
//                       '3mm 4mm',
//                     fontSize:
//                       '9px'
//                   }}
//                 >

//                   <strong
//                     style={{
//                       fontSize:
//                         '10px'
//                     }}
//                   >
//                     Terms & Conditions
//                   </strong>

//                   <div
//                     className="terms-content"
//                     style={{
//                       marginTop:
//                         '3mm',
//                       whiteSpace:
//                         'pre-wrap',
//                       lineHeight:
//                         '1.5'
//                     }}
//                   >
//                     {
//                       previewData.terms
//                     }
//                   </div>

//                 </div>

//               )}

//               {/* AUTHORIZED SIGNATORY */}

//               <div
//                 className="quote-bottom"
//                 style={{
//                   position:
//                     'absolute',
//                   bottom:
//                     '8mm',
//                   left:
//                     '8mm',
//                   right:
//                     '8mm',
//                   height:
//                     '7mm',
//                   border:
//                     '0.35mm solid #062d73',
//                   display:
//                     'flex',
//                   alignItems:
//                     'center',
//                   justifyContent:
//                     'center',
//                   color:
//                     '#c00000',
//                   fontSize:
//                     '11px',
//                   fontWeight:
//                     700,
//                   backgroundColor:
//                     '#ffffff'
//                 }}
//               >
//                 Authorized Signatory
//               </div>

//             </div>

//           </div>

//         </div>

//       )}

//       {/* ========================================================
//           CSS
//           ======================================================== */}

//       <style
//         dangerouslySetInnerHTML={{
//           __html: `

//             * {
//               box-sizing: border-box;
//             }

//             .quotation-page {
//               width: 100%;
//               min-height: 100vh;
//               background: #f3f4f6;
//               padding: 30px;
//               font-family: Arial, Helvetica, sans-serif;
//               color: #111;
//             }

//             .quotation-editor {
//               max-width: 1100px;
//               margin: 0 auto 35px;
//               background: #ffffff;
//               border-radius: 12px;
//               padding: 25px;
//               box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
//             }

//             .quotation-editor-header {
//               display: flex;
//               align-items: center;
//               justify-content: space-between;
//               gap: 20px;
//               margin-bottom: 25px;
//             }

//             .quotation-editor-header h1 {
//               margin: 0 0 5px;
//               font-size: 28px;
//             }

//             .quotation-editor-header p {
//               margin: 0;
//               color: #666;
//               font-size: 14px;
//             }

//             .quotation-editor-actions {
//               display: flex;
//               gap: 10px;
//               flex-wrap: wrap;
//             }

//             .btn {
//               border: none;
//               border-radius: 7px;
//               padding: 11px 18px;
//               cursor: pointer;
//               font-size: 14px;
//               font-weight: 600;
//             }

//             .btn:disabled {
//               opacity: 0.6;
//               cursor: not-allowed;
//             }

//             .btn-primary {
//               background: #062d73;
//               color: #fff;
//             }

//             .btn-secondary {
//               background: #e5e7eb;
//               color: #111;
//             }

//             .btn-dark {
//               background: #111827;
//               color: #fff;
//             }

//             .btn-small {
//               padding: 8px 14px;
//             }

//             .quotation-alert {
//               padding: 12px 15px;
//               border-radius: 7px;
//               margin-bottom: 20px;
//               font-size: 14px;
//             }

//             .quotation-success {
//               background: #dcfce7;
//               color: #166534;
//             }

//             .quotation-error {
//               background: #fee2e2;
//               color: #991b1b;
//             }

//             .editor-section {
//               border: 1px solid #e5e7eb;
//               border-radius: 9px;
//               padding: 20px;
//               margin-bottom: 20px;
//             }

//             .editor-section h2 {
//               margin: 0 0 18px;
//               font-size: 17px;
//             }

//             .editor-grid {
//               display: grid;
//               grid-template-columns: repeat(2, minmax(0, 1fr));
//               gap: 16px;
//             }

//             .field {
//               display: flex;
//               flex-direction: column;
//               gap: 6px;
//             }

//             .field-full {
//               grid-column: 1 / -1;
//             }

//             .field label {
//               font-size: 13px;
//               font-weight: 600;
//               color: #374151;
//             }

//             .field input,
//             .field textarea,
//             .field select {
//               width: 100%;
//               border: 1px solid #d1d5db;
//               border-radius: 6px;
//               padding: 10px 11px;
//               outline: none;
//               font-size: 14px;
//               font-family: inherit;
//               background: #fff;
//             }

//             .field textarea {
//               resize: vertical;
//             }

//             .field input:focus,
//             .field textarea:focus,
//             .field select:focus {
//               border-color: #062d73;
//               box-shadow: 0 0 0 2px rgba(6, 45, 115, 0.08);
//             }

//             .items-heading {
//               display: flex;
//               align-items: center;
//               justify-content: space-between;
//               margin-bottom: 15px;
//               flex-wrap: wrap;
//               gap: 10px;
//             }

//             .items-heading h2 {
//               margin: 0;
//             }

//             .items-editor {
//               display: flex;
//               flex-direction: column;
//               gap: 10px;
//             }

//             @media print {

//               @page {
//                 size: A4;
//                 margin: 0;
//               }

//               html,
//               body {
//                 margin: 0 !important;
//                 padding: 0 !important;
//                 width: 210mm !important;
//                 min-width: 210mm !important;
//                 height: 297mm !important;
//                 min-height: 297mm !important;
//                 background: #ffffff !important;
//               }

//               body {
//                 -webkit-print-color-adjust: exact !important;
//                 print-color-adjust: exact !important;
//               }

//               body * {
//                 visibility: hidden !important;
//               }

//               #quotation-pdf-content,
//               #quotation-pdf-content * {
//                 visibility: visible !important;
//               }

//               #quotation-pdf-content {
//                 position: absolute !important;
//                 left: 0 !important;
//                 top: 0 !important;
//                 width: 210mm !important;
//                 min-width: 210mm !important;
//                 max-width: 210mm !important;
//                 height: 297mm !important;
//                 min-height: 297mm !important;
//                 max-height: 297mm !important;
//                 margin: 0 !important;
//                 padding: 12mm 8mm 8mm !important;
//                 background: #ffffff !important;
//                 box-shadow: none !important;
//                 overflow: hidden !important;
//                 box-sizing: border-box !important;
//                 page-break-after: always !important;
//                 page-break-inside: avoid !important;
//               }

//               .quotation-preview-overlay {
//                 position: static !important;
//                 display: block !important;
//                 width: 210mm !important;
//                 height: auto !important;
//                 margin: 0 !important;
//                 padding: 0 !important;
//                 background: transparent !important;
//                 overflow: visible !important;
//               }

//               .quotation-preview-overlay > div {
//                 max-width: none !important;
//                 width: 210mm !important;
//                 margin: 0 !important;
//                 padding: 0 !important;
//               }

//               .quotation-preview-overlay .no-print {
//                 display: none !important;
//               }

//               .company-info,
//               .quote-logo,
//               .quote-info {
//                 visibility: visible !important;
//               }

//               #quotation-pdf-content img {
//                 visibility: visible !important;
//                 display: block !important;
//                 -webkit-print-color-adjust: exact !important;
//                 print-color-adjust: exact !important;
//               }

//               .quote-to-title {
//                 background: #062d73 !important;
//                 color: #ffffff !important;
//                 -webkit-print-color-adjust: exact !important;
//                 print-color-adjust: exact !important;
//               }

//               .project-row {
//                 border: 0.35mm solid #062d73 !important;
//                 background-color: #f8f9fa !important;
//                 -webkit-print-color-adjust: exact !important;
//                 print-color-adjust: exact !important;
//               }

//               .quote-table {
//                 width: 100% !important;
//                 border-collapse: collapse !important;
//                 table-layout: fixed !important;
//               }

//               .quote-table th {
//                 background: #f5f5f5 !important;
//                 border-left: 0.35mm solid #111111 !important;
//                 border-right: 0.35mm solid #111111 !important;
//                 border-top: 0.35mm solid #111111 !important;
//                 border-bottom: 0.35mm solid #111111 !important;
//                 -webkit-print-color-adjust: exact !important;
//                 print-color-adjust: exact !important;
//               }

//               .quote-table td {
//                 border-left: 0.35mm solid #111111 !important;
//                 border-right: 0.35mm solid #111111 !important;
//                 border-top: none !important;
//                 border-bottom: none !important;
//               }

//               .quote-table tbody tr:last-child td {
//                 border-bottom: 0.35mm solid #111111 !important;
//               }

//               .subtotal-row {
//                 border: 0.35mm solid #062d73 !important;
//                 border-top: 0 !important;
//                 background-color: #f8f9fa !important;
//                 -webkit-print-color-adjust: exact !important;
//                 print-color-adjust: exact !important;
//               }

//               .terms-section {
//                 border: 0.35mm solid #062d73 !important;
//                 border-top: 0 !important;
//               }

//               .quote-bottom {
//                 color: #c00000 !important;
//                 border: 0.35mm solid #062d73 !important;
//                 background-color: #ffffff !important;
//                 -webkit-print-color-adjust: exact !important;
//                 print-color-adjust: exact !important;
//               }

//               .quotation-page {
//                 margin: 0 !important;
//                 padding: 0 !important;
//                 background: #ffffff !important;
//               }

//             }

//             @media (max-width: 900px) {

//               .quotation-page {
//                 padding: 15px;
//               }

//               #quotation-pdf-content {
//                 transform-origin: top center;
//                 width: 210mm;
//                 max-width: 100%;
//                 overflow-x: auto;
//               }

//               .quotation-modal-content {
//                 max-width: 95% !important;
//                 max-height: 95vh !important;
//               }

//               .item-editor-row {
//                 grid-template-columns: 35px 1fr 1fr !important;
//                 overflow-x: auto !important;
//               }

//               .item-editor-row .field {
//                 min-width: 80px !important;
//               }

//             }

//             @media (max-width: 650px) {

//               .quotation-editor-header {
//                 flex-direction: column;
//                 align-items: flex-start;
//               }

//               .editor-grid {
//                 grid-template-columns: 1fr;
//               }

//               .field-full {
//                 grid-column: auto;
//               }

//               .item-editor-row {
//                 grid-template-columns: 1fr !important;
//                 overflow-x: auto !important;
//               }

//               .item-number {
//                 justify-content: flex-start;
//               }

//               .quotation-modal-content {
//                 max-width: 98% !important;
//                 max-height: 98vh !important;
//                 padding: 0 !important;
//               }

//             }

//           `
//         }}
//       />

//     </div>
//   )
// }





//search bar

import { useState, useEffect, useRef, useMemo } from 'react'
import { ref, push, onValue, update, remove, get, set } from 'firebase/database'
import { useAuth } from '../context/AuthContext'
import { db } from '../firebase'
import { todayISO, currency } from '../utils/helpers'
import Loader from '../components/Loader'

/* ============================================================
   COMPANY INFORMATION - LOGO SET
   ============================================================ */

const COMPANY_NAME = 'Pearl Networks'
const COMPANY_LOGO = '/PN.png'
const COMPANY_ADDRESS =
  'KCHS, Gohar Chamber, Office # 304, Shahra-e-Faisal, near Duty Free Shop, Karachi, 75600'
const COMPANY_PHONE = '0341-1293604'
const COMPANY_EMAIL = 'info@globalonesystem.com'

/* ============================================================
   EMPTY ITEM
   ============================================================ */

const emptyItem = {
  item: '',
  brand: '',
  description: '',
  uom: 'PCS',
  qty: 1,
  price: ''
}

/* ============================================================
   SEQUENTIAL QUOTATION NUMBER GENERATOR - DATE BASED
   ============================================================ */

// Get today's date in YYYYMMDD format
function getTodayDateString() {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')

  return `${year}${month}${day}`
}

/* ============================================================
   GET NEXT QUOTATION NUMBER
   SIRF NUMBER READ KAREGA - INCREMENT NAHI KAREGA
   ============================================================ */

async function getNextQuotationNumber(companyId) {
  try {
    const dateStr = getTodayDateString()
    const counterRef = ref(db, `companies/${companyId}/counters/quotation`)
    const snapshot = await get(counterRef)

    let lastNumber = 0
    let lastDate = ''

    if (snapshot.exists()) {
      const data = snapshot.val()
      lastNumber = data.number || 0
      lastDate = data.date || ''
    }

    let nextNumber = lastNumber + 1

    // New date -> counter reset
    if (lastDate !== dateStr) {
      nextNumber = 1
    }

    const padded = String(nextNumber).padStart(4, '0')

    return `QTN-${dateStr}-${padded}`
  } catch (error) {
    console.error('Error getting quotation number:', error)

    const dateStr = getTodayDateString()
    const timestamp = Date.now().toString().slice(-6)

    return `QTN-${dateStr}-${timestamp}`
  }
}

/* ============================================================
   INCREMENT QUOTATION COUNTER
   SAVE KE WAQT INCREMENT HOGA
   ============================================================ */

async function incrementQuotationCounter(companyId) {
  try {
    const dateStr = getTodayDateString()
    const counterRef = ref(db, `companies/${companyId}/counters/quotation`)
    const snapshot = await get(counterRef)

    let lastNumber = 0
    let lastDate = ''

    if (snapshot.exists()) {
      const data = snapshot.val()
      lastNumber = data.number || 0
      lastDate = data.date || ''
    }

    let newNumber = lastNumber + 1

    // New date -> reset
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
   MAIN QUOTATION COMPONENT
   ============================================================ */

export default function Quotation() {
  const { companyId } = useAuth()
  const printRef = useRef(null)

  /* ============================================================
     BASIC STATE
     ============================================================ */

  const [loading, setLoading] = useState(true)
  const [quotations, setQuotations] = useState([])
  const [customers, setCustomers] = useState([])

  /* ============================================================
     SEARCH STATE FOR QUOTATIONS LIST
     ============================================================ */

  const [searchTerm, setSearchTerm] = useState('')

  /* ============================================================
     FORM STATE
     ============================================================ */

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [customerId, setCustomerId] = useState('')
  const [quotationNumber, setQuotationNumber] = useState('')
  const [date, setDate] = useState(todayISO())
  const [validity, setValidity] = useState('')
  const [project, setProject] = useState('')
  const [items, setItems] = useState([])
  const [terms, setTerms] = useState('')
  const [previewData, setPreviewData] = useState(null)

  /* ============================================================
     CUSTOMER SEARCH STATE
     ============================================================ */

  const [customerSearch, setCustomerSearch] = useState('')
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false)

  /* ============================================================
     CURRENT ITEM
     ============================================================ */

  const [currentItem, setCurrentItem] = useState({ ...emptyItem })

  /* ============================================================
     EDIT PRODUCT STATE
     ============================================================ */

  const [editingProductIndex, setEditingProductIndex] = useState(null)

  const [editProduct, setEditProduct] = useState({
    item: '',
    brand: '',
    description: '',
    uom: 'PCS',
    qty: 1,
    price: ''
  })

  /* ============================================================
     STATUS
     ============================================================ */

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [generatingPdf, setGeneratingPdf] = useState(false)

  /* ============================================================
     LOAD DATA
     ============================================================ */

  useEffect(() => {
    if (!companyId) {
      setLoading(false)
      return
    }

    /* ==========================================================
       LOAD CUSTOMERS
       ========================================================== */

    const customersRef = ref(
      db,
      `companies/${companyId}/customers`
    )

    const unsubscribeCustomers = onValue(
      customersRef,
      (snapshot) => {
        const data = snapshot.val() || {}

        const list = Object.entries(data).map(
          ([id, customer]) => ({
            id,
            ...customer
          })
        )

        setCustomers(list)
      }
    )

    /* ==========================================================
       LOAD QUOTATIONS
       ========================================================== */

    const quotationsRef = ref(
      db,
      `companies/${companyId}/quotations`
    )

    const unsubscribeQuotations = onValue(
      quotationsRef,
      (snapshot) => {
        const data = snapshot.val() || {}

        const list = Object.entries(data)
          .map(([id, quotation]) => ({
            id,
            ...quotation
          }))
          .sort(
            (a, b) =>
              (b.createdAt || 0) -
              (a.createdAt || 0)
          )

        setQuotations(list)
        setLoading(false)
      }
    )

    /* ==========================================================
       CLEANUP
       ========================================================== */

    return () => {
      unsubscribeCustomers()
      unsubscribeQuotations()
    }
  }, [companyId])

  /* ============================================================
     FILTERED CUSTOMERS
     SEARCH:
     - NAME
     - COMPANY
     - PHONE
     - ADDRESS
     ============================================================ */

  const filteredCustomers = useMemo(() => {
    if (!customers) return []

    const search = customerSearch
      .trim()
      .toLowerCase()

    if (!search) {
      return customers
    }

    return customers.filter((customer) => {
      const name = String(
        customer.name || ''
      ).toLowerCase()

      const company = String(
        customer.company || ''
      ).toLowerCase()

      const phone = String(
        customer.phone || ''
      ).toLowerCase()

      const address = String(
        customer.address || ''
      ).toLowerCase()

      return (
        name.includes(search) ||
        company.includes(search) ||
        phone.includes(search) ||
        address.includes(search)
      )
    })
  }, [customers, customerSearch])

  /* ============================================================
     FILTERED QUOTATIONS FOR SEARCH
     ============================================================ */

  const filteredQuotations = useMemo(() => {
    if (!quotations) return []

    const search = searchTerm.trim().toLowerCase()

    if (!search) {
      return quotations
    }

    return quotations.filter((q) => {
      // Search by quotation number
      if (
        q.quotationNumber &&
        q.quotationNumber.toLowerCase().includes(search)
      ) {
        return true
      }

      // Search by customer name
      if (
        q.customerName &&
        q.customerName.toLowerCase().includes(search)
      ) {
        return true
      }

      // Search by customer company
      if (
        q.customerCompany &&
        q.customerCompany.toLowerCase().includes(search)
      ) {
        return true
      }

      // Search by project
      if (
        q.project &&
        q.project.toLowerCase().includes(search)
      ) {
        return true
      }

      // Search by date
      if (
        q.date &&
        q.date.includes(search)
      ) {
        return true
      }

      return false
    })
  }, [quotations, searchTerm])

  /* ============================================================
     SELECT CUSTOMER
     ============================================================ */

  const selectCustomer = (customer) => {
    setCustomerId(customer.id)

    setCustomerSearch(
      `${customer.name || ''}${
        customer.company
          ? ` - ${customer.company}`
          : ''
      }`
    )

    setShowCustomerDropdown(false)
    setError('')
  }

  /* ============================================================
     CLEAR CUSTOMER
     ============================================================ */

  const clearCustomer = () => {
    setCustomerId('')
    setCustomerSearch('')
    setShowCustomerDropdown(true)
  }

  /* ============================================================
     CUSTOMER SEARCH CHANGE
     ============================================================ */

  const handleCustomerSearchChange = (e) => {
    const value = e.target.value

    setCustomerSearch(value)
    setShowCustomerDropdown(true)

    /*
     * Agar user selected customer ka naam edit/delete
     * kare to customer selection remove kar do.
     */
    setCustomerId('')
  }

  /* ============================================================
     CALCULATE SUBTOTAL
     ============================================================ */

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => {
      const qty = Number(item.qty) || 0
      const price = Number(item.price) || 0

      return sum + qty * price
    }, 0)
  }

  /* ============================================================
     CALCULATE TOTAL
     NO TAX
     ============================================================ */

  const calculateTotal = () => {
    return calculateSubtotal()
  }

  /* ============================================================
     ADD ITEM
     ============================================================ */

  const addItem = () => {
    if (
      !currentItem.item.trim() &&
      !currentItem.description.trim()
    ) {
      setError(
        'Either Item or Description is required'
      )
      return
    }

    const newItem = {
      item: currentItem.item
        ? currentItem.item.trim()
        : '',

      brand: currentItem.brand
        ? currentItem.brand.trim()
        : '',

      description: currentItem.description
        ? currentItem.description.trim()
        : '',

      uom: currentItem.uom || 'PCS',

      qty: Math.max(
        1,
        Number(currentItem.qty) || 1
      ),

      price: Math.max(
        0,
        Number(currentItem.price) || 0
      )
    }

    setItems([
      ...items,
      newItem
    ])

    setCurrentItem({
      ...emptyItem
    })

    setError('')
  }

  /* ============================================================
     REMOVE ITEM
     ============================================================ */

  const removeItem = (index) => {
    setItems(
      items.filter(
        (_, i) => i !== index
      )
    )
  }

  /* ============================================================
     EDIT PRODUCT - OPEN
     ============================================================ */

  const openEditProduct = (index) => {
    const item = items[index]

    setEditingProductIndex(index)

    setEditProduct({
      item: item.item || '',
      brand: item.brand || '',
      description:
        item.description || '',
      uom: item.uom || 'PCS',
      qty: item.qty || 1,
      price:
        item.price === 0
          ? ''
          : item.price
    })
  }

  /* ============================================================
     EDIT PRODUCT - SAVE
     ============================================================ */

  const saveEditProduct = () => {
    if (
      !editProduct.item.trim() &&
      !editProduct.description.trim()
    ) {
      setError(
        'Either Item or Description is required'
      )
      return
    }

    const updatedItems = [
      ...items
    ]

    updatedItems[
      editingProductIndex
    ] = {
      item: editProduct.item
        ? editProduct.item.trim()
        : '',

      brand: editProduct.brand
        ? editProduct.brand.trim()
        : '',

      description:
        editProduct.description
          ? editProduct.description.trim()
          : '',

      uom:
        editProduct.uom ||
        'PCS',

      qty: Math.max(
        1,
        Number(editProduct.qty) || 1
      ),

      price: Math.max(
        0,
        Number(editProduct.price) || 0
      )
    }

    setItems(updatedItems)

    setEditingProductIndex(null)

    setEditProduct({
      item: '',
      brand: '',
      description: '',
      uom: 'PCS',
      qty: 1,
      price: ''
    })

    setError('')
  }

  /* ============================================================
     EDIT PRODUCT - CLOSE
     ============================================================ */

  const closeEditProduct = () => {
    setEditingProductIndex(null)

    setEditProduct({
      item: '',
      brand: '',
      description: '',
      uom: 'PCS',
      qty: 1,
      price: ''
    })
  }

  /* ============================================================
     RESET FORM
     ============================================================ */

  const resetForm = () => {
    setCustomerId('')
    setCustomerSearch('')
    setShowCustomerDropdown(false)

    setQuotationNumber('')
    setDate(todayISO())
    setValidity('')
    setProject('')
    setItems([])
    setTerms('')

    setCurrentItem({
      ...emptyItem
    })

    setEditingId(null)

    setError('')
    setSuccess('')

    setEditingProductIndex(null)

    setEditProduct({
      item: '',
      brand: '',
      description: '',
      uom: 'PCS',
      qty: 1,
      price: ''
    })
  }

  /* ============================================================
     OPEN NEW QUOTATION
     ============================================================ */

  const openNewQuotation = async () => {
    resetForm()

    if (companyId) {
      const number =
        await getNextQuotationNumber(
          companyId
        )

      setQuotationNumber(number)
    }

    setShowForm(true)
  }

  /* ============================================================
     OPEN EDIT QUOTATION
     ============================================================ */

  const openEditQuotation = (
    quotation
  ) => {
    setEditingId(quotation.id)

    setCustomerId(
      quotation.customerId || ''
    )

    setQuotationNumber(
      quotation.quotationNumber || ''
    )

    setDate(
      quotation.date ||
        todayISO()
    )

    setValidity(
      quotation.validity || ''
    )

    setProject(
      quotation.project || ''
    )

    setItems(
      quotation.items || []
    )

    setTerms(
      quotation.terms || ''
    )

    /*
     * Existing quotation ka customer
     * search field me show hoga.
     */

    const existingCustomer =
      customers.find(
        (customer) =>
          customer.id ===
          quotation.customerId
      )

    if (existingCustomer) {
      setCustomerSearch(
        `${existingCustomer.name || ''}${
          existingCustomer.company
            ? ` - ${existingCustomer.company}`
            : ''
        }`
      )
    } else {
      setCustomerSearch(
        `${quotation.customerName || ''}${
          quotation.customerCompany
            ? ` - ${quotation.customerCompany}`
            : ''
        }`
      )
    }

    setShowCustomerDropdown(false)

    setShowForm(true)
    setError('')
  }

  /* ============================================================
     SAVE QUOTATION
     ============================================================ */

  const handleSubmit = async (e) => {
    e.preventDefault()

    setError('')
    setSuccess('')

    if (!companyId) {
      setError(
        'Company ID not found'
      )
      return
    }

    if (!customerId) {
      setError(
        'Please select a customer'
      )
      return
    }

    if (items.length === 0) {
      setError(
        'Add at least one item'
      )
      return
    }

    const customer =
      customers.find(
        (c) =>
          c.id === customerId
      )

    if (!customer) {
      setError(
        'Customer not found'
      )
      return
    }

    setSaving(true)

    try {
      const subtotal =
        calculateSubtotal()

      const total =
        calculateTotal()

      let finalQuotationNumber =
        quotationNumber

      if (!editingId) {
        await incrementQuotationCounter(
          companyId
        )

        if (
          !finalQuotationNumber ||
          finalQuotationNumber.trim() === ''
        ) {
          const dateStr =
            getTodayDateString()

          const timestamp =
            Date.now()
              .toString()
              .slice(-6)

          finalQuotationNumber =
            `QTN-${dateStr}-${timestamp}`

          setQuotationNumber(
            finalQuotationNumber
          )
        }
      }

      const quotationData = {
        quotationNumber:
          finalQuotationNumber,

        date:
          date ||
          todayISO(),

        validity:
          validity || '',

        project:
          project || '',

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

        companyName:
          COMPANY_NAME,

        companyLogo:
          COMPANY_LOGO,

        companyAddress:
          COMPANY_ADDRESS,

        companyPhone:
          COMPANY_PHONE,

        companyEmail:
          COMPANY_EMAIL,

        items:
          items,

        subtotal:
          subtotal,

        total:
          total,

        terms:
          terms || '',

        updatedAt:
          Date.now()
      }

      if (editingId) {
        const quotationRef =
          ref(
            db,
            `companies/${companyId}/quotations/${editingId}`
          )

        await update(
          quotationRef,
          {
            ...quotationData,
            updatedAt:
              Date.now()
          }
        )

        setSuccess(
          'Quotation updated successfully!'
        )
      } else {
        const quotationsRef =
          ref(
            db,
            `companies/${companyId}/quotations`
          )

        quotationData.createdAt =
          Date.now()

        await push(
          quotationsRef,
          quotationData
        )

        setSuccess(
          'Quotation created successfully!'
        )
      }

      setPreviewData({
        ...quotationData,

        id:
          editingId ||
          'new',

        customer: {
          name:
            customer.name,

          company:
            customer.company,

          phone:
            customer.phone,

          address:
            customer.address
        }
      })

      setShowForm(false)

      resetForm()

    } catch (err) {
      console.error(
        'Save error:',
        err
      )

      setError(
        err.message ||
          'Failed to save quotation'
      )
    } finally {
      setSaving(false)
    }
  }

  /* ============================================================
     DELETE QUOTATION
     ============================================================ */

  const deleteQuotation = async (
    id
  ) => {
    if (
      !confirm(
        'Are you sure you want to delete this quotation?'
      )
    ) {
      return
    }

    try {
      const quotationRef =
        ref(
          db,
          `companies/${companyId}/quotations/${id}`
        )

      await remove(
        quotationRef
      )

      setSuccess(
        'Quotation deleted successfully!'
      )
    } catch (err) {
      console.error(
        'Delete error:',
        err
      )

      setError(
        'Failed to delete quotation'
      )
    }
  }

  /* ============================================================
     PREVIEW
     ============================================================ */

  const handlePreview = (
    quotation
  ) => {
    setPreviewData({
      ...quotation,

      customer: {
        name:
          quotation.customerName,

        company:
          quotation.customerCompany,

        phone:
          quotation.customerPhone,

        address:
          quotation.customerAddress
      }
    })
  }

  /* ============================================================
     SAVE AS PDF
     ============================================================ */

  const handleSavePdf = async (
    quotation
  ) => {
    setGeneratingPdf(true)

    try {
      const previewQuotation = {
        ...quotation,

        customer: {
          name:
            quotation.customerName,

          company:
            quotation.customerCompany,

          phone:
            quotation.customerPhone,

          address:
            quotation.customerAddress
        }
      }

      setPreviewData(
        previewQuotation
      )

      await new Promise(
        resolve =>
          setTimeout(
            resolve,
            500
          )
      )

      window.print()

    } catch (error) {
      console.error(
        'Print error:',
        error
      )

      alert(
        'Print preview open nahi ho saka.'
      )
    } finally {
      setGeneratingPdf(false)
    }
  }

  /* ============================================================
     RENDER
     ============================================================ */

  return (
    <div className="quotation-page">

      <div className="quotation-editor no-print">

        <div className="quotation-editor-header">

          <div>
            <h1>
              Quotations
            </h1>

            <p>
              Create and manage quotations for your customers
            </p>
          </div>

          <div className="quotation-editor-actions">

            <button
              onClick={
                openNewQuotation
              }
              className="btn btn-primary"
            >
              + New Quotation
            </button>

          </div>
        </div>

        {success && (
          <div className="quotation-alert quotation-success">
            {success}
          </div>
        )}

        {error && (
          <div className="quotation-alert quotation-error">
            {error}
          </div>
        )}

        {/* ======================================================
            SEARCH BAR FOR QUOTATIONS LIST - ADDED
            ====================================================== */}

        <div style={{ marginBottom: '20px' }}>

          <input
            type="text"
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(e.target.value)
            }
            placeholder="Search by quotation #, customer, company, project, date..."
            style={{
              width: '100%',
              maxWidth: '400px',
              padding: '10px 15px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none'
            }}
          />

          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              style={{
                marginLeft: '8px',
                padding: '10px 15px',
                border: 'none',
                borderRadius: '8px',
                background: '#e5e7eb',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              ✕ Clear
            </button>
          )}

          <p style={{
            fontSize: '12px',
            color: '#666',
            marginTop: '5px'
          }}>
            Search by quotation number, customer name, company name, project, or date
          </p>

        </div>

        {loading ? (
          <Loader />
        ) : filteredQuotations.length === 0 ? (

          <div
            style={{
              textAlign:
                'center',
              padding:
                '40px 0',
              color:
                '#666'
            }}
          >
            <p>
              {searchTerm
                ? 'No matching quotations found'
                : 'No quotations yet. Create your first quotation!'}
            </p>
          </div>

        ) : (

          <div
            style={{
              overflowX:
                'auto',
              marginTop:
                '20px'
            }}
          >

            <table
              style={{
                width:
                  '100%',
                borderCollapse:
                  'collapse',
                fontSize:
                  '14px'
              }}
            >

              <thead>

                <tr
                  style={{
                    borderBottom:
                      '2px solid #e5e7eb',
                    textAlign:
                      'left'
                  }}
                >

                  <th
                    style={{
                      padding:
                        '10px',
                      width:
                        '15%'
                    }}
                  >
                    #
                  </th>

                  <th
                    style={{
                      padding:
                        '10px',
                      width:
                        '25%'
                    }}
                  >
                    Customer
                  </th>

                  <th
                    style={{
                      padding:
                        '10px',
                      width:
                        '12%'
                    }}
                  >
                    Date
                  </th>

                  <th
                    style={{
                      padding:
                        '10px',
                      width:
                        '10%'
                    }}
                  >
                    Validity
                  </th>

                  <th
                    style={{
                      padding:
                        '10px',
                      width:
                        '13%'
                    }}
                  >
                    Total
                  </th>

                  <th
                    style={{
                      padding:
                        '10px',
                      width:
                        '25%',
                      textAlign:
                        'right'
                    }}
                  >
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody>

                {filteredQuotations.map(
                  (
                    q,
                    index
                  ) => (

                    <tr
                      key={
                        q.id
                      }
                      style={{
                        borderBottom:
                          '1px solid #e5e7eb'
                      }}
                    >

                      <td
                        style={{
                          padding:
                            '10px'
                        }}
                      >
                        {
                          q.quotationNumber
                        }
                      </td>

                      {/* ==========================================
                          CUSTOMER COLUMN - COMPANY UPAR, NAME NEECHE
                          ========================================== */}

                      <td
                        style={{
                          padding:
                            '10px'
                        }}
                      >

                        {/* COMPANY NAME UPAR - BOLD */}
                        <div
                          style={{
                            fontWeight:
                              600
                          }}
                        >
                          {q.customerCompany || q.customerName || 'Unknown'}
                        </div>

                        {/* CUSTOMER NAME NEECHE - ONLY IF COMPANY EXISTS AND DIFFERENT */}
                        {q.customerCompany && q.customerName && q.customerCompany !== q.customerName && (
                          <div
                            style={{
                              fontSize:
                                '12px',
                              color:
                                '#666'
                            }}
                          >
                            {q.customerName}
                          </div>
                        )}

                        {/* AGAR SIRF NAME HO AUR COMPANY NA HO TO NAME NEECHE */}
                        {!q.customerCompany && q.customerName && (
                          <div
                            style={{
                              fontSize:
                                '12px',
                              color:
                                '#666'
                            }}
                          >
                            {q.customerName}
                          </div>
                        )}

                      </td>

                      <td
                        style={{
                          padding:
                            '10px'
                        }}
                      >
                        {
                          q.date
                        }
                      </td>

                      <td
                        style={{
                          padding:
                            '10px'
                        }}
                      >
                        {
                          q.validity ||
                          '-'
                        }
                      </td>

                      <td
                        style={{
                          padding:
                            '10px',
                          fontWeight:
                            700
                        }}
                      >
                        Rs{' '}
                        {
                          currency(
                            q.total ||
                              0
                          )
                        }
                      </td>

                      <td
                        style={{
                          padding:
                            '10px',
                          textAlign:
                            'right',
                          whiteSpace:
                            'nowrap'
                        }}
                      >

                        <button
                          onClick={() =>
                            handlePreview(
                              q
                            )
                          }
                          style={{
                            marginRight:
                              '6px',
                            padding:
                              '5px 10px',
                            border:
                              'none',
                            borderRadius:
                              '4px',
                            background:
                              '#062d73',
                            color:
                              '#fff',
                            cursor:
                              'pointer',
                            fontSize:
                              '12px',
                            display:
                              'inline-block'
                          }}
                        >
                          View
                        </button>

                        <button
                          onClick={() =>
                            openEditQuotation(
                              q
                            )
                          }
                          style={{
                            marginRight:
                              '6px',
                            padding:
                              '5px 10px',
                            border:
                              'none',
                            borderRadius:
                              '4px',
                            background:
                              '#e5e7eb',
                            color:
                              '#111',
                            cursor:
                              'pointer',
                            fontSize:
                              '12px',
                            display:
                              'inline-block'
                          }}
                        >
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            deleteQuotation(
                              q.id
                            )
                          }
                          style={{
                            marginRight:
                              '6px',
                            padding:
                              '5px 10px',
                            border:
                              'none',
                            borderRadius:
                              '4px',
                            background:
                              '#fee2e2',
                            color:
                              '#dc2626',
                            cursor:
                              'pointer',
                            fontSize:
                              '12px',
                            display:
                              'inline-block'
                          }}
                        >
                          Delete
                        </button>

                        <button
                          onClick={() =>
                            handleSavePdf(
                              q
                            )
                          }
                          disabled={
                            generatingPdf
                          }
                          style={{
                            padding:
                              '5px 10px',
                            border:
                              'none',
                            borderRadius:
                              '4px',
                            background:
                              '#dc2626',
                            color:
                              '#fff',
                            cursor:
                              generatingPdf
                                ? 'not-allowed'
                                : 'pointer',
                            opacity:
                              generatingPdf
                                ? 0.6
                                : 1,
                            fontSize:
                              '12px',
                            display:
                              'inline-block'
                          }}
                        >
                          {
                            generatingPdf
                              ? '⏳'
                              : '📄 PDF'
                          }
                        </button>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

      {/* ========================================================
          QUOTATION FORM MODAL
          ======================================================== */}

      {showForm && (

        <div
          className="quotation-modal-overlay"
          style={{
            position:
              'fixed',
            inset: 0,
            zIndex:
              9999,
            backgroundColor:
              'rgba(0,0,0,0.5)',
            display:
              'flex',
            alignItems:
              'center',
            justifyContent:
              'center',
            padding:
              '20px',
            overflow:
              'auto'
          }}
        >

          <div
            className="quotation-modal-content"
            style={{
              backgroundColor:
                '#fff',
              borderRadius:
                '12px',
              maxWidth:
                '1000px',
              width:
                '100%',
              maxHeight:
                '90vh',
              overflow:
                'hidden',
              display:
                'flex',
              flexDirection:
                'column',
              boxShadow:
                '0 20px 60px rgba(0,0,0,0.3)'
            }}
          >

            <div
              style={{
                padding:
                  '20px 25px',
                borderBottom:
                  '1px solid #e5e7eb',
                display:
                  'flex',
                justifyContent:
                  'space-between',
                alignItems:
                  'center',
                flexShrink:
                  0,
                backgroundColor:
                  '#fff',
                borderTopLeftRadius:
                  '12px',
                borderTopRightRadius:
                  '12px'
              }}
            >

              <h2
                style={{
                  margin:
                    0,
                  fontSize:
                    '20px',
                  fontWeight:
                    700
                }}
              >
                {
                  editingId
                    ? 'Edit Quotation'
                    : 'New Quotation'
                }
              </h2>

              <button
                onClick={() => {
                  setShowForm(
                    false
                  )
                  resetForm()
                }}
                style={{
                  background:
                    'none',
                  border:
                    'none',
                  fontSize:
                    '24px',
                  cursor:
                    'pointer',
                  color:
                    '#666',
                  padding:
                    '0 10px'
                }}
              >
                ✕
              </button>

            </div>

            <div
              style={{
                padding:
                  '20px 25px',
                overflowY:
                  'auto',
                flex: 1,
                backgroundColor:
                  '#fafafa'
              }}
            >

              <form
                onSubmit={
                  handleSubmit
                }
              >

                <div
                  className="editor-section"
                  style={{
                    background:
                      '#fff'
                  }}
                >

                  <div className="editor-grid">

                    {/* ==================================================
                        SEARCHABLE CUSTOMER DROPDOWN
                        ================================================== */}

                    <div
                      className="field"
                      style={{
                        position:
                          'relative'
                      }}
                    >

                      <label>
                        Customer *
                      </label>

                      <div
                        style={{
                          position:
                            'relative'
                        }}
                      >

                        <input
                          type="text"
                          value={
                            customerSearch
                          }
                          onChange={
                            handleCustomerSearchChange
                          }
                          onFocus={() =>
                            setShowCustomerDropdown(
                              true
                            )
                          }
                          placeholder="Search customer by name, company or phone..."
                          required={
                            !!customerId
                          }
                          autoComplete="off"
                          style={{
                            width:
                              '100%',
                            padding:
                              '10px 38px 10px 11px',
                            border:
                              '1px solid #d1d5db',
                            borderRadius:
                              '6px',
                            outline:
                              'none',
                            fontSize:
                              '14px',
                            background:
                              '#fff'
                          }}
                        />

                        {customerSearch && (

                          <button
                            type="button"
                            onClick={
                              clearCustomer
                            }
                            style={{
                              position:
                                'absolute',
                              right:
                                '10px',
                              top:
                                '50%',
                              transform:
                                'translateY(-50%)',
                              border:
                                'none',
                              background:
                                'transparent',
                              color:
                                '#6b7280',
                              cursor:
                                'pointer',
                              fontSize:
                                '18px',
                              lineHeight:
                                1,
                              padding:
                                '2px 4px'
                            }}
                            title="Clear customer"
                          >
                            ×
                          </button>

                        )}

                      </div>

                      {showCustomerDropdown && (

                        <div
                          style={{
                            position: 'absolute',
                            zIndex: 10000,
                            left: 0,
                            right: 0,
                            top: '100%',
                            marginTop: '4px',
                            background: '#fff',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                            overflow: 'hidden'
                          }}
                        >

                          <div
                            style={{
                              maxHeight: '280px',
                              overflowY: 'auto'
                            }}
                          >

                            {customers === null ? (

                              <div
                                style={{
                                  padding: '15px',
                                  textAlign: 'center',
                                  color: '#666',
                                  fontSize: '13px'
                                }}
                              >
                                Loading customers...
                              </div>

                            ) : filteredCustomers.length === 0 ? (

                              <div
                                style={{
                                  padding: '15px',
                                  textAlign: 'center',
                                  color: '#666',
                                  fontSize: '13px'
                                }}
                              >
                                {customerSearch.trim()
                                  ? 'No customer found.'
                                  : 'No customers available.'}
                              </div>

                            ) : (

                              filteredCustomers.map(
                                (customer) => (

                                  <button
                                    key={customer.id}
                                    type="button"
                                    onClick={() =>
                                      selectCustomer(customer)
                                    }
                                    style={{
                                      display: 'block',
                                      width: '100%',
                                      textAlign: 'left',
                                      padding: '11px 13px',
                                      border: 'none',
                                      borderBottom: '1px solid #f0f0f0',
                                      background: '#fff',
                                      cursor: 'pointer'
                                    }}
                                    onMouseEnter={e => {
                                      e.currentTarget.style.background = '#f3f4f6'
                                    }}
                                    onMouseLeave={e => {
                                      e.currentTarget.style.background = '#fff'
                                    }}
                                  >

                                    {/* COMPANY NAME PEHLE - BOLD ME */}
                                    <div
                                      style={{
                                        fontWeight: 600,
                                        color: '#111827',
                                        fontSize: '14px'
                                      }}
                                    >
                                      {customer.company || customer.name || 'Unnamed Customer'}
                                    </div>

                                    {/* CUSTOMER NAME NEECHE - AGAR COMPANY AUR NAME DONO HO TO */}
                                    {customer.company && customer.name && customer.company !== customer.name && (
                                      <div
                                        style={{
                                          color: '#4b5563',
                                          fontSize: '12px',
                                          marginTop: '2px'
                                        }}
                                      >
                                        {customer.name}
                                      </div>
                                    )}

                                    {/* AGAR SIRF NAME HO AUR COMPANY NA HO TO NAME NEECHE SHOW KARO */}
                                    {!customer.company && customer.name && (
                                      <div
                                        style={{
                                          color: '#4b5563',
                                          fontSize: '12px',
                                          marginTop: '2px'
                                        }}
                                      >
                                        {customer.name}
                                      </div>
                                    )}

                                    {customer.phone && (
                                      <div
                                        style={{
                                          color: '#6b7280',
                                          fontSize: '11px',
                                          marginTop: '2px'
                                        }}
                                      >
                                        {customer.phone}
                                      </div>
                                    )}

                                  </button>

                                )
                              )

                            )}

                          </div>

                        </div>

                      )}

                    </div>

                    {/* ==================================================
                        QUOTATION NUMBER
                        ================================================== */}

                    <div className="field">

                      <label>
                        Quotation #
                      </label>

                      <input
                        type="text"
                        value={
                          quotationNumber
                        }
                        onChange={e =>
                          setQuotationNumber(
                            e.target.value
                          )
                        }
                        placeholder="Will be generated on save"
                        style={{
                          background:
                            '#f3f4f6',
                          fontWeight:
                            'bold'
                        }}
                      />

                      <small
                        style={{
                          color:
                            '#666',
                          fontSize:
                            '11px'
                        }}
                      >
                        Format:
                        {' '}
                        QTN-YYYYMMDD-0001
                      </small>

                    </div>

                    {/* ==================================================
                        DATE
                        ================================================== */}

                    <div className="field">

                      <label>
                        Date *
                      </label>

                      <input
                        type="date"
                        value={
                          date
                        }
                        onChange={e =>
                          setDate(
                            e.target.value
                          )
                        }
                        required
                      />

                    </div>

                    {/* ==================================================
                        VALIDITY
                        ================================================== */}

                    <div className="field">

                      <label>
                        Validity (Days) *
                      </label>

                      <input
                        type="number"
                        min="1"
                        max="365"
                        value={
                          validity
                        }
                        onChange={e =>
                          setValidity(
                            e.target.value
                          )
                        }
                        placeholder="e.g., 30"
                        required
                        style={{
                          width:
                            '100%',
                          padding:
                            '10px',
                          border:
                            '1px solid #d1d5db',
                          borderRadius:
                            '6px'
                        }}
                      />

                      <small
                        style={{
                          color:
                            '#666',
                          fontSize:
                            '11px'
                        }}
                      >
                        Number of days quotation is valid
                        {' '}
                        (e.g., 30, 60, 90)
                      </small>

                    </div>

                    {/* ==================================================
                        PROJECT
                        ================================================== */}

                    <div
                      className="field field-full"
                    >

                      <label>
                        Project
                      </label>

                      <input
                        type="text"
                        value={
                          project
                        }
                        onChange={e =>
                          setProject(
                            e.target.value
                          )
                        }
                        placeholder="Project name (optional)"
                      />

                    </div>

                  </div>

                </div>

                {/* ==================================================
                    ITEMS - WITH ITEM & BRAND (OPTIONAL)
                    ================================================== */}

                <div
                  className="editor-section"
                  style={{
                    background:
                      '#fff'
                  }}
                >

                  <div className="items-heading">

                    <h2>
                      Items
                    </h2>

                    <span
                      style={{
                        fontSize:
                          '14px',
                        color:
                          '#666'
                      }}
                    >
                      Total: Rs{' '}
                      {
                        currency(
                          calculateTotal()
                        )
                      }
                    </span>

                  </div>

                  <div className="items-editor">

                    {/* ==================================================
                        ADD ITEM ROW
                        ================================================== */}

                    <div
                      className="item-editor-row"
                      style={{
                        display:
                          'grid',
                        gridTemplateColumns:
                          '35px 1fr 1fr 1fr 80px 70px 90px 120px 70px',
                        gap:
                          '8px',
                        alignItems:
                          'end',
                        padding:
                          '12px',
                        border:
                          '1px solid #e5e7eb',
                        borderRadius:
                          '8px',
                        background:
                          '#f9fafb',
                        width:
                          '100%'
                      }}
                    >

                      <div
                        className="item-number"
                        style={{
                          height:
                            '39px',
                          display:
                            'flex',
                          alignItems:
                            'center',
                          justifyContent:
                            'center',
                          fontWeight:
                            700,
                          color:
                            '#555'
                        }}
                      >
                        <span>
                          #
                        </span>
                      </div>

                      {/* ITEM */}

                      <div className="field">

                        <input
                          value={
                            currentItem.item
                          }
                          onChange={e =>
                            setCurrentItem({
                              ...currentItem,
                              item:
                                e.target.value
                            })
                          }
                          placeholder="Item (Optional)"
                          style={{
                            width:
                              '100%',
                            padding:
                              '10px',
                            border:
                              '1px solid #d1d5db',
                            borderRadius:
                              '6px'
                          }}
                        />

                      </div>

                      {/* BRAND */}

                      <div className="field">

                        <input
                          value={
                            currentItem.brand
                          }
                          onChange={e =>
                            setCurrentItem({
                              ...currentItem,
                              brand:
                                e.target.value
                            })
                          }
                          placeholder="Brand (Optional)"
                          style={{
                            width:
                              '100%',
                            padding:
                              '10px',
                            border:
                              '1px solid #d1d5db',
                            borderRadius:
                              '6px'
                          }}
                        />

                      </div>

                      {/* DESCRIPTION */}

                      <div className="field">

                        <textarea
                          value={
                            currentItem.description
                          }
                          onChange={e =>
                            setCurrentItem({
                              ...currentItem,
                              description:
                                e.target.value
                            })
                          }
                          placeholder="Description (Optional)"
                          rows="2"
                          style={{
                            width:
                              '100%',
                            padding:
                              '10px',
                            border:
                              '1px solid #d1d5db',
                            borderRadius:
                              '6px',
                            resize:
                              'vertical'
                          }}
                        />

                      </div>

                      {/* UOM */}

                      <div className="field">

                        <input
                          value={
                            currentItem.uom
                          }
                          onChange={e =>
                            setCurrentItem({
                              ...currentItem,
                              uom:
                                e.target.value
                            })
                          }
                          placeholder="UOM"
                          style={{
                            width:
                              '100%',
                            padding:
                              '10px',
                            border:
                              '1px solid #d1d5db',
                            borderRadius:
                              '6px'
                          }}
                        />

                      </div>

                      {/* QTY */}

                      <div className="field">

                        <input
                          type="number"
                          min="1"
                          value={
                            currentItem.qty
                          }
                          onChange={e =>
                            setCurrentItem({
                              ...currentItem,
                              qty:
                                Number(
                                  e.target.value
                                ) || 1
                            })
                          }
                          placeholder="Qty"
                          style={{
                            width:
                              '100%',
                            padding:
                              '10px',
                            border:
                              '1px solid #d1d5db',
                            borderRadius:
                              '6px'
                          }}
                        />

                      </div>

                      {/* PRICE */}

                      <div className="field">

                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={
                            currentItem.price ===
                            0
                              ? ''
                              : currentItem.price
                          }
                          onChange={e =>
                            setCurrentItem({
                              ...currentItem,
                              price:
                                e.target.value ===
                                ''
                                  ? ''
                                  : Number(
                                      e.target.value
                                    )
                            })
                          }
                          placeholder="Price"
                          style={{
                            width:
                              '100%',
                            padding:
                              '10px',
                            border:
                              '1px solid #d1d5db',
                            borderRadius:
                              '6px'
                          }}
                        />

                      </div>

                      {/* CURRENT TOTAL */}

                      <div
                        className="item-total-editor"
                        style={{
                          height:
                            '39px',
                          padding:
                            '5px 8px',
                          display:
                            'flex',
                          flexDirection:
                            'column',
                          justifyContent:
                            'center',
                          background:
                            '#fff',
                          border:
                            '1px solid #d1d5db',
                          borderRadius:
                            '6px',
                          minWidth:
                            '80px'
                        }}
                      >

                        <span
                          style={{
                            fontSize:
                              '9px',
                            color:
                              '#777'
                          }}
                        >
                          Total
                        </span>

                        <strong
                          style={{
                            fontSize:
                              '12px'
                          }}
                        >
                          Rs{' '}
                          {
                            currency(
                              (Number(
                                currentItem.qty
                              ) || 0) *
                                (Number(
                                  currentItem.price
                                ) || 0)
                            )
                          }
                        </strong>

                      </div>

                      {/* ADD */}

                      <button
                        type="button"
                        onClick={
                          addItem
                        }
                        className="btn btn-primary btn-small"
                        style={{
                          height:
                            '39px',
                          minWidth:
                            '60px',
                          padding:
                            '0 15px'
                        }}
                      >
                        Add
                      </button>

                    </div>

                    {/* ==================================================
                        ITEMS LIST
                        ================================================== */}

                    <div
                      style={{
                        maxHeight:
                          '250px',
                        overflowY:
                          'auto',
                        marginTop:
                          '10px'
                      }}
                    >

                      {items.length === 0 ? (

                        <div
                          style={{
                            textAlign:
                              'center',
                            padding:
                              '30px',
                            color:
                              '#999',
                            fontSize:
                              '14px'
                          }}
                        >
                          No items added yet. Add products above.
                        </div>

                      ) : (

                        items.map(
                          (
                            item,
                            index
                          ) => (

                            <div
                              key={
                                index
                              }
                              className="item-editor-row"
                              style={{
                                display:
                                  'grid',
                                gridTemplateColumns:
                                  '35px 1fr 1fr 1fr 80px 70px 90px 120px 70px',
                                gap:
                                  '8px',
                                alignItems:
                                  'center',
                                padding:
                                  '10px 12px',
                                border:
                                  '1px solid #e5e7eb',
                                borderRadius:
                                  '8px',
                                background:
                                  '#f9fafb',
                                marginBottom:
                                  '8px',
                                width:
                                  '100%'
                              }}
                            >

                              <div
                                className="item-number"
                                style={{
                                  fontWeight:
                                    700,
                                  color:
                                    '#555',
                                  textAlign:
                                    'center'
                                }}
                              >
                                {
                                  index +
                                  1
                                }
                              </div>

                              {/* ITEM */}

                              <div className="field">

                                <div
                                  style={{
                                    padding:
                                      '8px 0',
                                    fontWeight:
                                      500
                                  }}
                                >
                                  {
                                    item.item ||
                                    '-'
                                  }
                                </div>

                              </div>

                              {/* BRAND */}

                              <div className="field">

                                <div
                                  style={{
                                    padding:
                                      '8px 0'
                                  }}
                                >
                                  {
                                    item.brand ||
                                    '-'
                                  }
                                </div>

                              </div>

                              {/* DESCRIPTION */}

                              <div className="field">

                                <div
                                  style={{
                                    padding:
                                      '8px 0',
                                    whiteSpace:
                                      'pre-wrap',
                                    wordBreak:
                                      'break-word'
                                  }}
                                >
                                  {
                                    item.description ||
                                    '-'
                                  }
                                </div>

                              </div>

                              {/* UOM */}

                              <div className="field">

                                <div
                                  style={{
                                    padding:
                                      '8px 0'
                                  }}
                                >
                                  {
                                    item.uom ||
                                    'PCS'
                                  }
                                </div>

                              </div>

                              {/* QTY */}

                              <div className="field">

                                <div
                                  style={{
                                    padding:
                                      '8px 0',
                                    textAlign:
                                      'center'
                                  }}
                                >
                                  {
                                    item.qty
                                  }
                                </div>

                              </div>

                              {/* PRICE */}

                              <div className="field">

                                <div
                                  style={{
                                    padding:
                                      '8px 0',
                                    textAlign:
                                      'right'
                                  }}
                                >
                                  Rs{' '}
                                  {
                                    currency(
                                      item.price
                                    )
                                  }
                                </div>

                              </div>

                              {/* TOTAL */}

                              <div
                                className="item-total-editor"
                                style={{
                                  height:
                                    '39px',
                                  padding:
                                    '5px 8px',
                                  display:
                                    'flex',
                                  flexDirection:
                                    'column',
                                  justifyContent:
                                    'center',
                                  background:
                                    '#fff',
                                  border:
                                    '1px solid #d1d5db',
                                  borderRadius:
                                    '6px'
                                }}
                              >

                                <span
                                  style={{
                                    fontSize:
                                      '9px',
                                    color:
                                      '#777'
                                  }}
                                >
                                  Total
                                </span>

                                <strong
                                  style={{
                                    fontSize:
                                      '12px'
                                  }}
                                >
                                  Rs{' '}
                                  {
                                    currency(
                                      (item.qty ||
                                        0) *
                                        (item.price ||
                                          0)
                                    )
                                  }
                                </strong>

                              </div>

                              {/* ACTIONS */}

                              <div
                                style={{
                                  display:
                                    'flex',
                                  gap:
                                    '4px'
                                }}
                              >

                                <button
                                  type="button"
                                  onClick={() =>
                                    openEditProduct(
                                      index
                                    )
                                  }
                                  style={{
                                    height:
                                      '39px',
                                    width:
                                      '35px',
                                    border:
                                      'none',
                                    borderRadius:
                                      '6px',
                                    background:
                                      '#dbeafe',
                                    color:
                                      '#1d4ed8',
                                    fontSize:
                                      '16px',
                                    cursor:
                                      'pointer',
                                    display:
                                      'flex',
                                    alignItems:
                                      'center',
                                    justifyContent:
                                      'center'
                                  }}
                                >
                                  ✎
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    removeItem(
                                      index
                                    )
                                  }
                                  style={{
                                    height:
                                      '39px',
                                    width:
                                      '35px',
                                    border:
                                      'none',
                                    borderRadius:
                                      '6px',
                                    background:
                                      '#fee2e2',
                                    color:
                                      '#dc2626',
                                    fontSize:
                                      '20px',
                                    cursor:
                                      'pointer',
                                    display:
                                      'flex',
                                    alignItems:
                                      'center',
                                    justifyContent:
                                      'center'
                                  }}
                                >
                                  ×
                                </button>

                              </div>

                            </div>

                          )
                        )

                      )}

                    </div>

                  </div>

                </div>

                {/* ==================================================
                    TERMS
                    ================================================== */}

                <div
                  className="editor-section"
                  style={{
                    background:
                      '#fff'
                  }}
                >

                  <div
                    className="field field-full"
                  >

                    <label>
                      Terms & Conditions
                    </label>

                    <textarea
                      value={
                        terms
                      }
                      onChange={e =>
                        setTerms(
                          e.target.value
                        )
                      }
                      rows="3"
                      placeholder="Payment terms, delivery, warranty, etc."
                      style={{
                        width:
                          '100%',
                        padding:
                          '10px',
                        border:
                          '1px solid #d1d5db',
                        borderRadius:
                          '6px',
                        resize:
                          'vertical'
                      }}
                    />

                  </div>

                </div>

                {error && (

                  <div
                    className="quotation-alert quotation-error"
                    style={{
                      marginBottom:
                        '15px'
                    }}
                  >
                    {
                      error
                    }
                  </div>

                )}

                {/* ==================================================
                    FORM BUTTONS
                    ================================================== */}

                <div
                  style={{
                    display:
                      'flex',
                    gap:
                      '10px',
                    marginTop:
                      '20px',
                    paddingTop:
                      '15px',
                    borderTop:
                      '1px solid #e5e7eb',
                    flexShrink:
                      0,
                    backgroundColor:
                      '#fff',
                    position:
                      'sticky',
                    bottom:
                      0,
                    paddingBottom:
                      '5px'
                  }}
                >

                  <button
                    type="submit"
                    disabled={
                      saving
                    }
                    className="btn btn-primary"
                    style={{
                      flex:
                        1,
                      padding:
                        '12px 20px',
                      fontSize:
                        '15px'
                    }}
                  >
                    {
                      saving
                        ? 'Saving...'
                        : editingId
                          ? 'Update Quotation'
                          : 'Create Quotation'
                    }
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(
                        false
                      )
                      resetForm()
                    }}
                    className="btn btn-secondary"
                    style={{
                      padding:
                        '12px 25px',
                      fontSize:
                        '15px'
                    }}
                  >
                    Cancel
                  </button>

                </div>

              </form>

            </div>

          </div>

        </div>

      )}

      {/* ========================================================
          EDIT PRODUCT MODAL
          ======================================================== */}

      {editingProductIndex !== null && (

        <div
          className="edit-product-modal"
          style={{
            position:
              'fixed',
            inset: 0,
            zIndex:
              99999,
            backgroundColor:
              'rgba(0,0,0,0.5)',
            display:
              'flex',
            alignItems:
              'center',
            justifyContent:
              'center',
            padding:
              '20px'
          }}
        >

          <div
            style={{
              backgroundColor:
                '#fff',
              borderRadius:
                '12px',
              padding:
                '25px',
              maxWidth:
                '500px',
              width:
                '100%',
              boxShadow:
                '0 20px 60px rgba(0,0,0,0.3)'
            }}
          >

            <div
              style={{
                display:
                  'flex',
                justifyContent:
                  'space-between',
                alignItems:
                  'center',
                marginBottom:
                  '20px'
              }}
            >

              <h3
                style={{
                  margin:
                    0,
                  fontSize:
                    '18px',
                  fontWeight:
                    700
                }}
              >
                Edit Product
              </h3>

              <button
                onClick={
                  closeEditProduct
                }
                style={{
                  background:
                    'none',
                  border:
                    'none',
                  fontSize:
                    '24px',
                  cursor:
                    'pointer',
                  color:
                    '#666'
                }}
              >
                ✕
              </button>

            </div>

            <div
              style={{
                display:
                  'flex',
                flexDirection:
                  'column',
                gap:
                  '15px'
              }}
            >

              {/* ITEM */}

              <div>

                <label
                  style={{
                    fontSize:
                      '13px',
                    fontWeight:
                      600,
                    color:
                      '#374151',
                    display:
                      'block',
                    marginBottom:
                      '5px'
                  }}
                >
                  Item (Optional)
                </label>

                <input
                  type="text"
                  value={
                    editProduct.item
                  }
                  onChange={e =>
                    setEditProduct({
                      ...editProduct,
                      item:
                        e.target.value
                    })
                  }
                  style={{
                    width:
                      '100%',
                    padding:
                      '10px',
                    border:
                      '1px solid #d1d5db',
                    borderRadius:
                      '6px'
                  }}
                />

              </div>

              {/* BRAND */}

              <div>

                <label
                  style={{
                    fontSize:
                      '13px',
                    fontWeight:
                      600,
                    color:
                      '#374151',
                    display:
                      'block',
                    marginBottom:
                      '5px'
                  }}
                >
                  Brand (Optional)
                </label>

                <input
                  type="text"
                  value={
                    editProduct.brand
                  }
                  onChange={e =>
                    setEditProduct({
                      ...editProduct,
                      brand:
                        e.target.value
                    })
                  }
                  style={{
                    width:
                      '100%',
                    padding:
                      '10px',
                    border:
                      '1px solid #d1d5db',
                    borderRadius:
                      '6px'
                  }}
                />

              </div>

              {/* DESCRIPTION */}

              <div>

                <label
                  style={{
                    fontSize:
                      '13px',
                    fontWeight:
                      600,
                    color:
                      '#374151',
                    display:
                      'block',
                    marginBottom:
                      '5px'
                  }}
                >
                  Description (Optional)
                </label>

                <textarea
                  value={
                    editProduct.description
                  }
                  onChange={e =>
                    setEditProduct({
                      ...editProduct,
                      description:
                        e.target.value
                    })
                  }
                  rows="2"
                  placeholder="Product description"
                  style={{
                    width:
                      '100%',
                    padding:
                      '10px',
                    border:
                      '1px solid #d1d5db',
                    borderRadius:
                      '6px',
                    resize:
                      'vertical'
                  }}
                />

              </div>

              {/* UOM QTY PRICE */}

              <div
                style={{
                  display:
                    'grid',
                  gridTemplateColumns:
                    '1fr 1fr 1fr',
                  gap:
                    '10px'
                }}
              >

                <div>

                  <label
                    style={{
                      fontSize:
                        '13px',
                      fontWeight:
                        600,
                      color:
                        '#374151',
                      display:
                        'block',
                      marginBottom:
                        '5px'
                    }}
                  >
                    UOM
                  </label>

                  <input
                    type="text"
                    value={
                      editProduct.uom
                    }
                    onChange={e =>
                      setEditProduct({
                        ...editProduct,
                        uom:
                          e.target.value
                      })
                    }
                    style={{
                      width:
                        '100%',
                      padding:
                        '10px',
                      border:
                        '1px solid #d1d5db',
                      borderRadius:
                        '6px'
                    }}
                  />

                </div>

                <div>

                  <label
                    style={{
                      fontSize:
                        '13px',
                      fontWeight:
                        600,
                      color:
                        '#374151',
                      display:
                        'block',
                      marginBottom:
                        '5px'
                    }}
                  >
                    Qty
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={
                      editProduct.qty
                    }
                    onChange={e =>
                      setEditProduct({
                        ...editProduct,
                        qty:
                          Number(
                            e.target.value
                          ) || 1
                      })
                    }
                    style={{
                      width:
                        '100%',
                      padding:
                        '10px',
                      border:
                        '1px solid #d1d5db',
                      borderRadius:
                        '6px'
                    }}
                  />

                </div>

                <div>

                  <label
                    style={{
                      fontSize:
                        '13px',
                      fontWeight:
                        600,
                      color:
                        '#374151',
                      display:
                        'block',
                      marginBottom:
                        '5px'
                    }}
                  >
                    Price
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={
                      editProduct.price ===
                      0
                        ? ''
                        : editProduct.price
                    }
                    onChange={e =>
                      setEditProduct({
                        ...editProduct,
                        price:
                          e.target.value ===
                          ''
                            ? ''
                            : Number(
                                e.target.value
                              )
                      })
                    }
                    style={{
                      width:
                        '100%',
                      padding:
                        '10px',
                      border:
                        '1px solid #d1d5db',
                      borderRadius:
                        '6px'
                    }}
                  />

                </div>

              </div>

              <button
                onClick={
                  saveEditProduct
                }
                disabled={
                  !editProduct.item.trim() &&
                  !editProduct.description.trim()
                }
                style={{
                  width:
                    '100%',
                  padding:
                    '12px',
                  border:
                    'none',
                  borderRadius:
                    '6px',
                  background:
                    '#062d73',
                  color:
                    '#fff',
                  fontSize:
                    '15px',
                  fontWeight:
                    600,
                  cursor:
                    'pointer',
                  marginTop:
                    '10px'
                }}
              >
                Save Product
              </button>

            </div>

          </div>

        </div>

      )}

      {/* ========================================================
          QUOTATION PREVIEW
          ======================================================== */}

      {previewData && (

        <div
          className="quotation-preview-overlay"
          style={{
            position:
              'fixed',
            inset: 0,
            zIndex:
              99999,
            background:
              'rgba(0,0,0,0.6)',
            overflow:
              'auto',
            padding:
              '20px'
          }}
        >

          <div
            style={{
              maxWidth:
                '900px',
              margin:
                '0 auto'
            }}
          >

            <div
              className="no-print"
              style={{
                display:
                  'flex',
                justifyContent:
                  'space-between',
                alignItems:
                  'center',
                marginBottom:
                  '15px'
              }}
            >

              <div>

                <h3
                  style={{
                    color:
                      '#fff',
                    margin:
                      0
                  }}
                >
                  Quotation Preview
                </h3>

                <p
                  style={{
                    color:
                      '#ccc',
                    margin:
                      '5px 0 0',
                    fontSize:
                      '13px'
                  }}
                >
                  {
                    previewData.quotationNumber
                  }
                </p>

              </div>

              <div
                style={{
                  display:
                    'flex',
                  gap:
                    '10px'
                }}
              >

                <button
                  onClick={() =>
                    window.print()
                  }
                  style={{
                    background:
                      '#fff',
                    color:
                      '#111',
                    padding:
                      '10px 20px',
                    border:
                      'none',
                    borderRadius:
                      '6px',
                    cursor:
                      'pointer',
                    fontWeight:
                      600
                  }}
                >
                  🖨 Print
                </button>

                <button
                  onClick={() =>
                    setPreviewData(
                      null
                    )
                  }
                  style={{
                    background:
                      'rgba(255,255,255,0.2)',
                    color:
                      '#fff',
                    padding:
                      '10px 20px',
                    border:
                      'none',
                    borderRadius:
                      '6px',
                    cursor:
                      'pointer'
                  }}
                >
                  ✕ Close
                </button>

              </div>

            </div>

            {/* ==================================================
                PDF CONTENT
                ================================================== */}

            <div
              id="quotation-pdf-content"
              ref={
                printRef
              }
              style={{
                background:
                  '#ffffff',
                padding:
                  '12mm 8mm 8mm',
                position:
                  'relative',
                width:
                  '210mm',
                minHeight:
                  '297mm',
                margin:
                  '0 auto',
                boxShadow:
                  '0 3px 20px rgba(0,0,0,0.12)',
                fontFamily:
                  'Arial, Helvetica, sans-serif',
                color:
                  '#111111',
                boxSizing:
                  'border-box'
              }}
            >

              <div
                className="quote-heading"
                style={{
                  textAlign:
                    'center',
                  color:
                    '#062d73',
                  fontSize:
                    '24px',
                  fontWeight:
                    800,
                  textDecoration:
                    'underline',
                  marginBottom:
                    '8mm'
                }}
              >
                QUOTATION
              </div>

              <div
                className="quote-header"
                style={{
                  display:
                    'grid',
                  gridTemplateColumns:
                    '1fr 1fr 1fr',
                  gap:
                    '5mm',
                  alignItems:
                    'start',
                  minHeight:
                    '43mm'
                }}
              >

                <div
                  className="company-info"
                  style={{
                    fontSize:
                      '10px',
                    lineHeight:
                      '1.45'
                  }}
                >

                  <div
                    className="company-name"
                    style={{
                      fontWeight:
                        700,
                      fontSize:
                        '11px',
                      marginBottom:
                        '1mm'
                    }}
                  >
                    {
                      previewData.companyName ||
                      'Your Company'
                    }
                  </div>

                  <div
                    className="company-address"
                    style={{
                      whiteSpace:
                        'normal'
                    }}
                  >
                    {
                      previewData.companyAddress ||
                      'Company Address'
                    }
                  </div>

                  <div>
                    Phone:{' '}
                    {
                      previewData.companyPhone ||
                      'N/A'
                    }
                  </div>

                  <div>
                    Email:{' '}
                    {
                      previewData.companyEmail ||
                      '-'
                    }
                  </div>

                </div>

                <div
                  className="quote-logo"
                  style={{
                    textAlign:
                      'center',
                    paddingTop:
                      '2mm'
                  }}
                >

                  <img
                    src={
                      previewData.companyLogo ||
                      '/PN.png'
                    }
                    alt="Company Logo"
                    style={{
                      width:
                        '33mm',
                      height:
                        '33mm',
                      objectFit:
                        'contain',
                      display:
                        'block',
                      margin:
                        '0 auto'
                    }}
                    onError={e => {
                      e.target.style.display =
                        'none'
                    }}
                  />

                </div>

                <div
                  className="quote-info"
                  style={{
                    fontSize:
                      '10px',
                    lineHeight:
                      '1.8'
                  }}
                >

                  <div
                    style={{
                      display:
                        'grid',
                      gridTemplateColumns:
                        '32mm 1fr',
                      gap:
                        '2mm'
                    }}
                  >
                    <strong
                      style={{
                        textAlign:
                          'right'
                      }}
                    >
                      Quote #
                    </strong>

                    <span
                      style={{
                        textAlign:
                          'left'
                      }}
                    >
                      {
                        previewData.quotationNumber
                      }
                    </span>
                  </div>

                  <div
                    style={{
                      display:
                        'grid',
                      gridTemplateColumns:
                        '32mm 1fr',
                      gap:
                        '2mm'
                    }}
                  >
                    <strong
                      style={{
                        textAlign:
                          'right'
                      }}
                    >
                      Date
                    </strong>

                    <span
                      style={{
                        textAlign:
                          'left'
                      }}
                    >
                      {
                        previewData.date
                      }
                    </span>
                  </div>

                  <div
                    style={{
                      display:
                        'grid',
                      gridTemplateColumns:
                        '32mm 1fr',
                      gap:
                        '2mm'
                    }}
                  >
                    <strong
                      style={{
                        textAlign:
                          'right'
                      }}
                    >
                      Validity
                    </strong>

                    <span
                      style={{
                        textAlign:
                          'left'
                      }}
                    >
                      {
                        previewData.validity
                          ? `${previewData.validity} Days`
                          : 'N/A'
                      }
                    </span>
                  </div>

                  {previewData.validity &&
                    previewData.date && (

                      <div
                        style={{
                          display:
                            'grid',
                          gridTemplateColumns:
                            '32mm 1fr',
                          gap:
                            '2mm'
                        }}
                      >

                        <strong
                          style={{
                            textAlign:
                              'right'
                          }}
                        >
                          Valid Till
                        </strong>

                        <span
                          style={{
                            textAlign:
                              'left'
                          }}
                        >
                          {(() => {
                            const dateObj =
                              new Date(
                                previewData.date
                              )

                            dateObj.setDate(
                              dateObj.getDate() +
                                Number(
                                  previewData.validity
                                )
                            )

                            return dateObj
                              .toISOString()
                              .split(
                                'T'
                              )[0]
                          })()}
                        </span>

                      </div>

                    )}

                </div>

              </div>

              {/* QUOTE TO */}

              <div
                className="quote-to-title"
                style={{
                  background:
                    '#062d73',
                  color:
                    '#ffffff',
                  fontSize:
                    '11px',
                  fontWeight:
                    700,
                  padding:
                    '2mm 4mm',
                  marginTop:
                    '2mm'
                }}
              >
                QUOTE TO
              </div>

              <div
                className="quote-to-content"
                style={{
                  padding:
                    '3mm 4mm',
                  minHeight:
                    '18mm',
                  fontSize:
                    '10px',
                  lineHeight:
                    '1.7'
                }}
              >

                <strong>
                  {previewData.customer?.company || previewData.customer?.name || ''}
                </strong>

                {previewData.customer?.company && previewData.customer?.name && previewData.customer?.company !== previewData.customer?.name && (
                  <div>
                    {previewData.customer.name}
                  </div>
                )}

                {!previewData.customer?.company && previewData.customer?.name && (
                  <div>
                    {previewData.customer.name}
                  </div>
                )}

                {previewData.customer?.address && (
                  <div>
                    {
                      previewData.customer.address
                    }
                  </div>
                )}

                {previewData.customer?.phone && (
                  <div>
                    Phone:{' '}
                    {
                      previewData.customer.phone
                    }
                  </div>
                )}

              </div>

              {/* PROJECT */}

              {previewData.project && (

                <div
                  className="project-row"
                  style={{
                    padding:
                      '2mm 4mm',
                    fontSize:
                      '9px',
                    border:
                      '0.35mm solid #062d73',
                    marginTop:
                      '2mm',
                    backgroundColor:
                      '#f8f9fa'
                  }}
                >

                  <strong>
                    Project:{' '}
                  </strong>

                  <span>
                    {
                      previewData.project
                    }
                  </span>

                </div>

              )}

              {/* ==================================================
                  DYNAMIC TABLE
                  ================================================== */}

              {(() => {

                const previewItems =
                  previewData.items ||
                  []

                const showItem =
                  previewItems.some(
                    item =>
                      item.item &&
                      item.item.trim() !== ''
                  )

                const showBrand =
                  previewItems.some(
                    item =>
                      item.brand &&
                      item.brand.trim() !== ''
                  )

                const showDescription =
                  previewItems.some(
                    item =>
                      item.description &&
                      item.description.trim() !== ''
                  )

                let itemCol = 0
                let brandCol = 0
                let descCol = 0

                if (
                  showItem &&
                  showBrand &&
                  showDescription
                ) {
                  itemCol = 16
                  brandCol = 12
                  descCol = 20
                } else if (
                  showItem &&
                  showBrand &&
                  !showDescription
                ) {
                  itemCol = 22
                  brandCol = 16
                  descCol = 0
                } else if (
                  showItem &&
                  !showBrand &&
                  showDescription
                ) {
                  itemCol = 18
                  brandCol = 0
                  descCol = 22
                } else if (
                  !showItem &&
                  showBrand &&
                  showDescription
                ) {
                  itemCol = 0
                  brandCol = 16
                  descCol = 24
                } else if (
                  showItem &&
                  !showBrand &&
                  !showDescription
                ) {
                  itemCol = 30
                  brandCol = 0
                  descCol = 0
                } else if (
                  !showItem &&
                  showBrand &&
                  !showDescription
                ) {
                  itemCol = 0
                  brandCol = 28
                  descCol = 0
                } else if (
                  !showItem &&
                  !showBrand &&
                  showDescription
                ) {
                  itemCol = 0
                  brandCol = 0
                  descCol = 32
                } else {
                  itemCol = 0
                  brandCol = 0
                  descCol = 0
                }

                if (!showDescription) {
                  descCol = 0
                }

                return (

                  <table
                    className="quote-table"
                    style={{
                      width:
                        '100%',
                      borderCollapse:
                        'collapse',
                      tableLayout:
                        'fixed',
                      fontSize:
                        '9px',
                      borderLeft:
                        '0.35mm solid #111111',
                      borderRight:
                        '0.35mm solid #111111',
                      marginTop:
                        previewData.project
                          ? '2mm'
                          : '0'
                    }}
                  >

                    <thead>

                      <tr>

                        <th
                          style={{
                            width:
                              '5%',
                            textAlign:
                              'center',
                            borderLeft:
                              '0.35mm solid #111111',
                            borderRight:
                              '0.35mm solid #111111',
                            padding:
                              '1.3mm 1mm',
                            verticalAlign:
                              'middle',
                            fontSize:
                              '9px',
                            fontWeight:
                              700,
                            height:
                              '9mm',
                            backgroundColor:
                              '#f5f5f5',
                            borderTop:
                              '0.35mm solid #111111',
                            borderBottom:
                              '0.35mm solid #111111'
                          }}
                        >
                          #
                        </th>

                        {showItem && (

                          <th
                            style={{
                              width:
                                `${itemCol}%`,
                              textAlign:
                                'left',
                              borderLeft:
                                '0.35mm solid #111111',
                              borderRight:
                                '0.35mm solid #111111',
                              padding:
                                '1.3mm 1mm',
                              verticalAlign:
                                'middle',
                              fontSize:
                                '9px',
                              fontWeight:
                                700,
                              height:
                                '9mm',
                              backgroundColor:
                                '#f5f5f5',
                              borderTop:
                                '0.35mm solid #111111',
                              borderBottom:
                                '0.35mm solid #111111'
                            }}
                          >
                            Item
                          </th>

                        )}

                        {showBrand && (

                          <th
                            style={{
                              width:
                                `${brandCol}%`,
                              textAlign:
                                'left',
                              borderLeft:
                                '0.35mm solid #111111',
                              borderRight:
                                '0.35mm solid #111111',
                              padding:
                                '1.3mm 1mm',
                              verticalAlign:
                                'middle',
                              fontSize:
                                '9px',
                              fontWeight:
                                700,
                              height:
                                '9mm',
                              backgroundColor:
                                '#f5f5f5',
                              borderTop:
                                '0.35mm solid #111111',
                              borderBottom:
                                '0.35mm solid #111111'
                            }}
                          >
                            Brand
                          </th>

                        )}

                        {showDescription && (

                          <th
                            style={{
                              width:
                                `${descCol}%`,
                              textAlign:
                                'left',
                              borderLeft:
                                '0.35mm solid #111111',
                              borderRight:
                                '0.35mm solid #111111',
                              padding:
                                '1.3mm 1mm',
                              verticalAlign:
                                'middle',
                              fontSize:
                                '9px',
                              fontWeight:
                                700,
                              height:
                                '9mm',
                              backgroundColor:
                                '#f5f5f5',
                              borderTop:
                                '0.35mm solid #111111',
                              borderBottom:
                                '0.35mm solid #111111'
                            }}
                          >
                            Description
                          </th>

                        )}

                        <th
                          style={{
                            width:
                              '8%',
                            textAlign:
                              'center',
                            borderLeft:
                              '0.35mm solid #111111',
                            borderRight:
                              '0.35mm solid #111111',
                            padding:
                              '1.3mm 1mm',
                            verticalAlign:
                              'middle',
                            fontSize:
                              '9px',
                            fontWeight:
                              700,
                            height:
                              '9mm',
                            backgroundColor:
                              '#f5f5f5',
                            borderTop:
                              '0.35mm solid #111111',
                            borderBottom:
                              '0.35mm solid #111111'
                          }}
                        >
                          UOM
                        </th>

                        <th
                          style={{
                            width:
                              '6%',
                            textAlign:
                              'center',
                            borderLeft:
                              '0.35mm solid #111111',
                            borderRight:
                              '0.35mm solid #111111',
                            padding:
                              '1.3mm 1mm',
                            verticalAlign:
                              'middle',
                            fontSize:
                              '9px',
                            fontWeight:
                              700,
                            height:
                              '9mm',
                            backgroundColor:
                              '#f5f5f5',
                            borderTop:
                              '0.35mm solid #111111',
                            borderBottom:
                              '0.35mm solid #111111'
                          }}
                        >
                          Qty
                        </th>

                        <th
                          style={{
                            width:
                              '13%',
                            textAlign:
                              'center',
                            borderLeft:
                              '0.35mm solid #111111',
                            borderRight:
                              '0.35mm solid #111111',
                            padding:
                              '1.3mm 1mm',
                            verticalAlign:
                              'middle',
                            fontSize:
                              '9px',
                            fontWeight:
                              700,
                            height:
                              '9mm',
                            backgroundColor:
                              '#f5f5f5',
                            borderTop:
                              '0.35mm solid #111111',
                            borderBottom:
                              '0.35mm solid #111111'
                          }}
                        >
                          Unit Price
                        </th>

                        <th
                          style={{
                            width:
                              '14%',
                            textAlign:
                              'center',
                            borderLeft:
                              '0.35mm solid #111111',
                            borderRight:
                              '0.35mm solid #111111',
                            padding:
                              '1.3mm 1mm',
                            verticalAlign:
                              'middle',
                            fontSize:
                              '9px',
                            fontWeight:
                              700,
                            height:
                              '9mm',
                            backgroundColor:
                              '#f5f5f5',
                            borderTop:
                              '0.35mm solid #111111',
                            borderBottom:
                              '0.35mm solid #111111'
                          }}
                        >
                          Total
                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      {previewItems.map(
                        (
                          item,
                          index
                        ) => {

                          const qty =
                            Number(
                              item.qty
                            ) || 0

                          const price =
                            Number(
                              item.price
                            ) || 0

                          const total =
                            qty *
                            price

                          return (

                            <tr
                              key={
                                index
                              }
                            >

                              <td
                                style={{
                                  textAlign:
                                    'center',
                                  borderLeft:
                                    '0.35mm solid #111111',
                                  borderRight:
                                    '0.35mm solid #111111',
                                  padding:
                                    '1.3mm 1mm',
                                  verticalAlign:
                                    'middle',
                                  height:
                                    '7mm',
                                  borderTop:
                                    'none',
                                  borderBottom:
                                    'none'
                                }}
                              >
                                {
                                  index +
                                  1
                                }
                              </td>

                              {showItem && (

                                <td
                                  style={{
                                    textAlign:
                                      'left',
                                    borderLeft:
                                      '0.35mm solid #111111',
                                    borderRight:
                                      '0.35mm solid #111111',
                                    padding:
                                      '1.3mm 1mm',
                                    verticalAlign:
                                      'middle',
                                    height:
                                      '7mm',
                                    borderTop:
                                      'none',
                                    borderBottom:
                                      'none'
                                  }}
                                >
                                  {
                                    item.item ||
                                    '-'
                                  }
                                </td>

                              )}

                              {showBrand && (

                                <td
                                  style={{
                                    textAlign:
                                      'left',
                                    borderLeft:
                                      '0.35mm solid #111111',
                                    borderRight:
                                      '0.35mm solid #111111',
                                    padding:
                                      '1.3mm 1mm',
                                    verticalAlign:
                                      'middle',
                                    height:
                                      '7mm',
                                    borderTop:
                                      'none',
                                    borderBottom:
                                      'none'
                                  }}
                                >
                                  {
                                    item.brand ||
                                    '-'
                                  }
                                </td>

                              )}

                              {showDescription && (

                                <td
                                  style={{
                                    textAlign:
                                      'left',
                                    borderLeft:
                                      '0.35mm solid #111111',
                                    borderRight:
                                      '0.35mm solid #111111',
                                    padding:
                                      '1.3mm 1mm',
                                    verticalAlign:
                                      'middle',
                                    height:
                                      '7mm',
                                    borderTop:
                                      'none',
                                    borderBottom:
                                      'none',
                                    whiteSpace:
                                      'pre-wrap',
                                    wordBreak:
                                      'break-word'
                                  }}
                                >
                                  {
                                    item.description ||
                                    '-'
                                  }
                                </td>

                              )}

                              <td
                                style={{
                                  textAlign:
                                    'center',
                                  borderLeft:
                                    '0.35mm solid #111111',
                                  borderRight:
                                    '0.35mm solid #111111',
                                  padding:
                                    '1.3mm 1mm',
                                  verticalAlign:
                                    'middle',
                                  height:
                                    '7mm',
                                  borderTop:
                                    'none',
                                  borderBottom:
                                    'none'
                                }}
                              >
                                {
                                  item.uom ||
                                  'PCS'
                                }
                              </td>

                              <td
                                style={{
                                  textAlign:
                                    'center',
                                  borderLeft:
                                    '0.35mm solid #111111',
                                  borderRight:
                                    '0.35mm solid #111111',
                                  padding:
                                    '1.3mm 1mm',
                                  verticalAlign:
                                    'middle',
                                  height:
                                    '7mm',
                                  borderTop:
                                    'none',
                                  borderBottom:
                                    'none'
                                }}
                              >
                                {
                                  qty
                                }
                              </td>

                              <td
                                className="number-cell"
                                style={{
                                  textAlign:
                                    'right',
                                  paddingRight:
                                    '2mm',
                                  borderLeft:
                                    '0.35mm solid #111111',
                                  borderRight:
                                    '0.35mm solid #111111',
                                  padding:
                                    '1.3mm 1mm',
                                  verticalAlign:
                                    'middle',
                                  height:
                                    '7mm',
                                  borderTop:
                                    'none',
                                  borderBottom:
                                    'none'
                                }}
                              >
                                Rs{' '}
                                {
                                  currency(
                                    price
                                  )
                                }
                              </td>

                              <td
                                className="number-cell"
                                style={{
                                  textAlign:
                                    'right',
                                  paddingRight:
                                    '2mm',
                                  borderLeft:
                                    '0.35mm solid #111111',
                                  borderRight:
                                    '0.35mm solid #111111',
                                  padding:
                                    '1.3mm 1mm',
                                  verticalAlign:
                                    'middle',
                                  height:
                                    '7mm',
                                  borderTop:
                                    'none',
                                  borderBottom:
                                    'none'
                                }}
                              >
                                Rs{' '}
                                {
                                  currency(
                                    total
                                  )
                                }
                              </td>

                            </tr>

                          )
                        }
                      )}

                      {Array.from({
                        length:
                          Math.max(
                            0,
                            8 -
                              (
                                previewItems.length ||
                                0
                              )
                          )
                      }).map(
                        (
                          _,
                          i
                        ) => (

                          <tr
                            key={
                              `empty-${i}`
                            }
                            className="empty-item-row"
                          >

                            <td
                              style={{
                                height:
                                  '6.5mm',
                                borderLeft:
                                  '0.35mm solid #111111',
                                borderRight:
                                  '0.35mm solid #111111',
                                padding:
                                  '1.3mm 1mm',
                                verticalAlign:
                                  'middle',
                                borderTop:
                                  'none',
                                borderBottom:
                                  'none'
                              }}
                            />

                            {showItem && (
                              <td
                                style={{
                                  height:
                                    '6.5mm',
                                  borderLeft:
                                    '0.35mm solid #111111',
                                  borderRight:
                                    '0.35mm solid #111111',
                                  padding:
                                    '1.3mm 1mm',
                                  verticalAlign:
                                    'middle',
                                  borderTop:
                                    'none',
                                  borderBottom:
                                    'none'
                                }}
                              />
                            )}

                            {showBrand && (
                              <td
                                style={{
                                  height:
                                    '6.5mm',
                                  borderLeft:
                                    '0.35mm solid #111111',
                                  borderRight:
                                    '0.35mm solid #111111',
                                  padding:
                                    '1.3mm 1mm',
                                  verticalAlign:
                                    'middle',
                                  borderTop:
                                    'none',
                                  borderBottom:
                                    'none'
                                }}
                              />
                            )}

                            {showDescription && (
                              <td
                                style={{
                                  height:
                                    '6.5mm',
                                  borderLeft:
                                    '0.35mm solid #111111',
                                  borderRight:
                                    '0.35mm solid #111111',
                                  padding:
                                    '1.3mm 1mm',
                                  verticalAlign:
                                    'middle',
                                  borderTop:
                                    'none',
                                  borderBottom:
                                    'none'
                                }}
                              />
                            )}

                            <td
                              style={{
                                height:
                                  '6.5mm',
                                borderLeft:
                                  '0.35mm solid #111111',
                                borderRight:
                                  '0.35mm solid #111111',
                                padding:
                                  '1.3mm 1mm',
                                verticalAlign:
                                  'middle',
                                borderTop:
                                  'none',
                                borderBottom:
                                  'none'
                              }}
                            />

                            <td
                              style={{
                                height:
                                  '6.5mm',
                                borderLeft:
                                  '0.35mm solid #111111',
                                borderRight:
                                  '0.35mm solid #111111',
                                padding:
                                  '1.3mm 1mm',
                                verticalAlign:
                                  'middle',
                                borderTop:
                                  'none',
                                borderBottom:
                                  'none'
                              }}
                            />

                            <td
                              style={{
                                height:
                                  '6.5mm',
                                borderLeft:
                                  '0.35mm solid #111111',
                                borderRight:
                                  '0.35mm solid #111111',
                                padding:
                                  '1.3mm 1mm',
                                verticalAlign:
                                  'middle',
                                borderTop:
                                  'none',
                                borderBottom:
                                  'none'
                              }}
                            />

                            <td
                              style={{
                                height:
                                  '6.5mm',
                                borderLeft:
                                  '0.35mm solid #111111',
                                borderRight:
                                  '0.35mm solid #111111',
                                padding:
                                  '1.3mm 1mm',
                                verticalAlign:
                                  'middle',
                                borderTop:
                                  'none',
                                borderBottom:
                                  'none'
                              }}
                            />

                          </tr>

                        )
                      )}

                      <tr>

                        <td
                          style={{
                            height:
                              '1mm',
                            borderLeft:
                              '0.35mm solid #111111',
                            borderRight:
                              '0.35mm solid #111111',
                            borderBottom:
                              '0.35mm solid #111111',
                            padding:
                              0
                          }}
                        />

                        {showItem && (
                          <td
                            style={{
                              height:
                                '1mm',
                              borderLeft:
                                '0.35mm solid #111111',
                              borderRight:
                                '0.35mm solid #111111',
                              borderBottom:
                                '0.35mm solid #111111',
                              padding:
                                0
                            }}
                          />
                        )}

                        {showBrand && (
                          <td
                            style={{
                              height:
                                '1mm',
                              borderLeft:
                                '0.35mm solid #111111',
                              borderRight:
                                '0.35mm solid #111111',
                              borderBottom:
                                '0.35mm solid #111111',
                              padding:
                                0
                            }}
                          />
                        )}

                        {showDescription && (
                          <td
                            style={{
                              height:
                                '1mm',
                              borderLeft:
                                '0.35mm solid #111111',
                              borderRight:
                                '0.35mm solid #111111',
                              borderBottom:
                                '0.35mm solid #111111',
                              padding:
                                0
                            }}
                          />
                        )}

                        <td
                          style={{
                            height:
                              '1mm',
                            borderLeft:
                              '0.35mm solid #111111',
                            borderRight:
                              '0.35mm solid #111111',
                            borderBottom:
                              '0.35mm solid #111111',
                            padding:
                              0
                          }}
                        />

                        <td
                          style={{
                            height:
                              '1mm',
                            borderLeft:
                              '0.35mm solid #111111',
                            borderRight:
                              '0.35mm solid #111111',
                            borderBottom:
                              '0.35mm solid #111111',
                            padding:
                              0
                          }}
                        />

                        <td
                          style={{
                            height:
                              '1mm',
                            borderLeft:
                              '0.35mm solid #111111',
                            borderRight:
                              '0.35mm solid #111111',
                            borderBottom:
                              '0.35mm solid #111111',
                            padding:
                              0
                          }}
                        />

                        <td
                          style={{
                            height:
                              '1mm',
                            borderLeft:
                              '0.35mm solid #111111',
                            borderRight:
                              '0.35mm solid #111111',
                            borderBottom:
                              '0.35mm solid #111111',
                            padding:
                              0
                          }}
                        />

                      </tr>

                    </tbody>

                  </table>

                )
              })()}

              {/* TOTAL */}

              <div
                className="subtotal-row"
                style={{
                  width:
                    '100%',
                  minHeight:
                    '13mm',
                  border:
                    '0.35mm solid #062d73',
                  borderTop:
                    '0',
                  display:
                    'grid',
                  gridTemplateColumns:
                    '1fr 45mm',
                  alignItems:
                    'center',
                  fontSize:
                    '10px',
                  fontWeight:
                    700,
                  paddingLeft:
                    '4mm',
                  backgroundColor:
                    '#f8f9fa'
                }}
              >

                <span
                  style={{
                    padding:
                      '3mm 0',
                    height:
                      '100%',
                    display:
                      'flex',
                    alignItems:
                      'center',
                    paddingLeft:
                      '4mm'
                  }}
                >
                  TOTAL
                </span>

                <strong
                  style={{
                    textAlign:
                      'right',
                    paddingRight:
                      '4mm',
                    fontSize:
                      '11px'
                  }}
                >
                  Rs{' '}
                  {
                    currency(
                      previewData.total ||
                        0
                    )
                  }
                </strong>

              </div>

              {/* TERMS */}

              {previewData.terms && (

                <div
                  className="terms-section"
                  style={{
                    minHeight:
                      '58mm',
                    border:
                      '0.35mm solid #062d73',
                    borderTop:
                      '0',
                    padding:
                      '3mm 4mm',
                    fontSize:
                      '9px'
                  }}
                >

                  <strong
                    style={{
                      fontSize:
                        '10px'
                    }}
                  >
                    Terms & Conditions
                  </strong>

                  <div
                    className="terms-content"
                    style={{
                      marginTop:
                        '3mm',
                      whiteSpace:
                        'pre-wrap',
                      lineHeight:
                        '1.5'
                    }}
                  >
                    {
                      previewData.terms
                    }
                  </div>

                </div>

              )}

              {/* AUTHORIZED SIGNATORY */}

              <div
                className="quote-bottom"
                style={{
                  position:
                    'absolute',
                  bottom:
                    '8mm',
                  left:
                    '8mm',
                  right:
                    '8mm',
                  height:
                    '7mm',
                  border:
                    '0.35mm solid #062d73',
                  display:
                    'flex',
                  alignItems:
                    'center',
                  justifyContent:
                    'center',
                  color:
                    '#c00000',
                  fontSize:
                    '11px',
                  fontWeight:
                    700,
                  backgroundColor:
                    '#ffffff'
                }}
              >
                Authorized Signatory
              </div>

            </div>

          </div>

        </div>

      )}

      {/* ========================================================
          CSS
          ======================================================== */}

      <style
        dangerouslySetInnerHTML={{
          __html: `

            * {
              box-sizing: border-box;
            }

            .quotation-page {
              width: 100%;
              min-height: 100vh;
              background: #f3f4f6;
              padding: 30px;
              font-family: Arial, Helvetica, sans-serif;
              color: #111;
            }

            .quotation-editor {
              max-width: 1100px;
              margin: 0 auto 35px;
              background: #ffffff;
              border-radius: 12px;
              padding: 25px;
              box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
            }

            .quotation-editor-header {
              display: flex;
              align-items: center;
              justify-content: space-between;
              gap: 20px;
              margin-bottom: 25px;
            }

            .quotation-editor-header h1 {
              margin: 0 0 5px;
              font-size: 28px;
            }

            .quotation-editor-header p {
              margin: 0;
              color: #666;
              font-size: 14px;
            }

            .quotation-editor-actions {
              display: flex;
              gap: 10px;
              flex-wrap: wrap;
            }

            .btn {
              border: none;
              border-radius: 7px;
              padding: 11px 18px;
              cursor: pointer;
              font-size: 14px;
              font-weight: 600;
            }

            .btn:disabled {
              opacity: 0.6;
              cursor: not-allowed;
            }

            .btn-primary {
              background: #062d73;
              color: #fff;
            }

            .btn-secondary {
              background: #e5e7eb;
              color: #111;
            }

            .btn-dark {
              background: #111827;
              color: #fff;
            }

            .btn-small {
              padding: 8px 14px;
            }

            .quotation-alert {
              padding: 12px 15px;
              border-radius: 7px;
              margin-bottom: 20px;
              font-size: 14px;
            }

            .quotation-success {
              background: #dcfce7;
              color: #166534;
            }

            .quotation-error {
              background: #fee2e2;
              color: #991b1b;
            }

            .editor-section {
              border: 1px solid #e5e7eb;
              border-radius: 9px;
              padding: 20px;
              margin-bottom: 20px;
            }

            .editor-section h2 {
              margin: 0 0 18px;
              font-size: 17px;
            }

            .editor-grid {
              display: grid;
              grid-template-columns: repeat(2, minmax(0, 1fr));
              gap: 16px;
            }

            .field {
              display: flex;
              flex-direction: column;
              gap: 6px;
            }

            .field-full {
              grid-column: 1 / -1;
            }

            .field label {
              font-size: 13px;
              font-weight: 600;
              color: #374151;
            }

            .field input,
            .field textarea,
            .field select {
              width: 100%;
              border: 1px solid #d1d5db;
              border-radius: 6px;
              padding: 10px 11px;
              outline: none;
              font-size: 14px;
              font-family: inherit;
              background: #fff;
            }

            .field textarea {
              resize: vertical;
            }

            .field input:focus,
            .field textarea:focus,
            .field select:focus {
              border-color: #062d73;
              box-shadow: 0 0 0 2px rgba(6, 45, 115, 0.08);
            }

            .items-heading {
              display: flex;
              align-items: center;
              justify-content: space-between;
              margin-bottom: 15px;
              flex-wrap: wrap;
              gap: 10px;
            }

            .items-heading h2 {
              margin: 0;
            }

            .items-editor {
              display: flex;
              flex-direction: column;
              gap: 10px;
            }

            @media print {

              @page {
                size: A4;
                margin: 0;
              }

              html,
              body {
                margin: 0 !important;
                padding: 0 !important;
                width: 210mm !important;
                min-width: 210mm !important;
                height: 297mm !important;
                min-height: 297mm !important;
                background: #ffffff !important;
              }

              body {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }

              body * {
                visibility: hidden !important;
              }

              #quotation-pdf-content,
              #quotation-pdf-content * {
                visibility: visible !important;
              }

              #quotation-pdf-content {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 210mm !important;
                min-width: 210mm !important;
                max-width: 210mm !important;
                height: 297mm !important;
                min-height: 297mm !important;
                max-height: 297mm !important;
                margin: 0 !important;
                padding: 12mm 8mm 8mm !important;
                background: #ffffff !important;
                box-shadow: none !important;
                overflow: hidden !important;
                box-sizing: border-box !important;
                page-break-after: always !important;
                page-break-inside: avoid !important;
              }

              .quotation-preview-overlay {
                position: static !important;
                display: block !important;
                width: 210mm !important;
                height: auto !important;
                margin: 0 !important;
                padding: 0 !important;
                background: transparent !important;
                overflow: visible !important;
              }

              .quotation-preview-overlay > div {
                max-width: none !important;
                width: 210mm !important;
                margin: 0 !important;
                padding: 0 !important;
              }

              .quotation-preview-overlay .no-print {
                display: none !important;
              }

              .company-info,
              .quote-logo,
              .quote-info {
                visibility: visible !important;
              }

              #quotation-pdf-content img {
                visibility: visible !important;
                display: block !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }

              .quote-to-title {
                background: #062d73 !important;
                color: #ffffff !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }

              .project-row {
                border: 0.35mm solid #062d73 !important;
                background-color: #f8f9fa !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }

              .quote-table {
                width: 100% !important;
                border-collapse: collapse !important;
                table-layout: fixed !important;
              }

              .quote-table th {
                background: #f5f5f5 !important;
                border-left: 0.35mm solid #111111 !important;
                border-right: 0.35mm solid #111111 !important;
                border-top: 0.35mm solid #111111 !important;
                border-bottom: 0.35mm solid #111111 !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }

              .quote-table td {
                border-left: 0.35mm solid #111111 !important;
                border-right: 0.35mm solid #111111 !important;
                border-top: none !important;
                border-bottom: none !important;
              }

              .quote-table tbody tr:last-child td {
                border-bottom: 0.35mm solid #111111 !important;
              }

              .subtotal-row {
                border: 0.35mm solid #062d73 !important;
                border-top: 0 !important;
                background-color: #f8f9fa !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }

              .terms-section {
                border: 0.35mm solid #062d73 !important;
                border-top: 0 !important;
              }

              .quote-bottom {
                color: #c00000 !important;
                border: 0.35mm solid #062d73 !important;
                background-color: #ffffff !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }

              .quotation-page {
                margin: 0 !important;
                padding: 0 !important;
                background: #ffffff !important;
              }

            }

            @media (max-width: 900px) {

              .quotation-page {
                padding: 15px;
              }

              #quotation-pdf-content {
                transform-origin: top center;
                width: 210mm;
                max-width: 100%;
                overflow-x: auto;
              }

              .quotation-modal-content {
                max-width: 95% !important;
                max-height: 95vh !important;
              }

              .item-editor-row {
                grid-template-columns: 35px 1fr 1fr !important;
                overflow-x: auto !important;
              }

              .item-editor-row .field {
                min-width: 80px !important;
              }

            }

            @media (max-width: 650px) {

              .quotation-editor-header {
                flex-direction: column;
                align-items: flex-start;
              }

              .editor-grid {
                grid-template-columns: 1fr;
              }

              .field-full {
                grid-column: auto;
              }

              .item-editor-row {
                grid-template-columns: 1fr !important;
                overflow-x: auto !important;
              }

              .item-number {
                justify-content: flex-start;
              }

              .quotation-modal-content {
                max-width: 98% !important;
                max-height: 98vh !important;
                padding: 0 !important;
              }

            }

          `
        }}
      />

    </div>
  )
}