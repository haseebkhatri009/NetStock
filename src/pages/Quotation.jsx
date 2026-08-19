// import { useState, useEffect, useRef } from 'react'
// import { ref, push, onValue, update, remove, get, set } from 'firebase/database'
// import { useAuth } from '../context/AuthContext'
// import { db } from '../firebase'
// import { todayISO, currency } from '../utils/helpers'
// import { Modal } from './Customers'
// import Loader from '../components/Loader'

// /* ============================================================
//    COMPANY INFORMATION - LOGO SET
//    ============================================================ */

// const COMPANY_NAME = 'Pearl Networks'
// const COMPANY_LOGO = '/PN.png'
// const COMPANY_ADDRESS = 'KCHS, Gohar Chamber, Office # 304, Shahra-e-Faisal, near Duty Free Shop, Karachi, 75600'
// const COMPANY_PHONE = '0341-1293604'
// const COMPANY_EMAIL = 'info@globalonesystem.com'

// /* ============================================================
//    EMPTY ITEM
//    ============================================================ */

// const emptyItem = {
//   description: '',
//   uom: 'PCS',
//   qty: 1,
//   price: 0
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

// // Yeh function SIRF next number READ karega, INCREMENT nahi karega
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
    
//     // Agar date change ho gayi hai toh counter reset karo
//     let nextNumber = lastNumber + 1
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

// // Yeh function SIRF increment karega (save ke waqt)
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
    
//     // Agar date change ho gayi hai toh counter reset karo
//     let newNumber = lastNumber + 1
//     if (lastDate !== dateStr) {
//       newNumber = 1
//     }
    
//     // Counter update karo with date and number
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

//   const [loading, setLoading] = useState(true)
//   const [quotations, setQuotations] = useState([])
//   const [customers, setCustomers] = useState([])
  
//   // Form state
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
  
//   // Current item being added
//   const [currentItem, setCurrentItem] = useState({ ...emptyItem })
  
//   const [saving, setSaving] = useState(false)
//   const [error, setError] = useState('')
//   const [success, setSuccess] = useState('')

//   /* ============================================================
//      LOAD DATA
//      ============================================================ */

//   useEffect(() => {
//     if (!companyId) {
//       setLoading(false)
//       return
//     }

//     // Load customers
//     const customersRef = ref(db, `companies/${companyId}/customers`)
//     const unsubscribeCustomers = onValue(customersRef, (snapshot) => {
//       const data = snapshot.val() || {}
//       const list = Object.entries(data).map(([id, customer]) => ({
//         id,
//         ...customer
//       }))
//       setCustomers(list)
//     })

//     // Load quotations
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

//     return () => {
//       unsubscribeCustomers()
//       unsubscribeQuotations()
//     }
//   }, [companyId])

//   /* ============================================================
//      CALCULATE TOTALS - NO TAX
//      ============================================================ */

//   const calculateSubtotal = () => {
//     return items.reduce((sum, item) => {
//       const qty = Number(item.qty) || 0
//       const price = Number(item.price) || 0
//       return sum + (qty * price)
//     }, 0)
//   }

//   const calculateTotal = () => {
//     return calculateSubtotal()
//   }

//   /* ============================================================
//      ADD ITEM
//      ============================================================ */

//   const addItem = () => {
//     if (!currentItem.description.trim()) {
//       setError('Product description required')
//       return
//     }

//     const newItem = {
//       description: currentItem.description.trim(),
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
//   }

//   /* ============================================================
//      OPEN NEW QUOTATION - Sirf Number READ karega, INCREMENT nahi
//      ============================================================ */

//   const openNewQuotation = async () => {
//     resetForm()
    
//     // Sirf next number READ karega (increment nahi karega)
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
//      SAVE QUOTATION - Yahan counter INCREMENT hoga
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

//       // Agar editing nahi hai (new quotation) toh counter increment karo
//       if (!editingId) {
//         // Counter increment karo
//         const incremented = await incrementQuotationCounter(companyId)
        
//         if (incremented) {
//           const dateStr = incremented.date
//           const number = incremented.number
//           const padded = String(number).padStart(4, '0')
//           finalQuotationNumber = `QTN-${dateStr}-${padded}`
//           setQuotationNumber(finalQuotationNumber)
//         } else {
//           // Fallback: agar counter fail ho to timestamp use karo
//           const dateStr = getTodayDateString()
//           const timestamp = Date.now().toString().slice(-6)
//           finalQuotationNumber = `QTN-${dateStr}-${timestamp}`
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
//         // Update existing
//         const quotationRef = ref(db, `companies/${companyId}/quotations/${editingId}`)
//         await update(quotationRef, {
//           ...quotationData,
//           updatedAt: Date.now()
//         })
//         setSuccess('Quotation updated successfully!')
//       } else {
//         // Create new
//         const quotationsRef = ref(db, `companies/${companyId}/quotations`)
//         quotationData.createdAt = Date.now()
//         await push(quotationsRef, quotationData)
//         setSuccess('Quotation created successfully!')
//       }

//       // Show preview
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
//       setError('Failed to delete quotation')
//     }
//   }

//   /* ============================================================
//      PREVIEW / PRINT
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

//   const handlePrint = () => {
//     if (printRef.current) {
//       window.print()
//     }
//   }

//   /* ============================================================
//      RENDER
//      ============================================================ */

//   return (
//     <div className="quotation-page">

//       {/* ==========================================================
//           EDITOR (Form)
//           ========================================================== */}

//       <div className="quotation-editor no-print">
//         <div className="quotation-editor-header">
//           <div>
//             <h1>Quotations</h1>
//             <p>Create and manage quotations for your customers</p>
//           </div>
//           <div className="quotation-editor-actions">
//             <button
//               onClick={openNewQuotation}
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

//         {/* Quotation List */}
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
//                   <th style={{ padding: '10px' }}>#</th>
//                   <th style={{ padding: '10px' }}>Customer</th>
//                   <th style={{ padding: '10px' }}>Date</th>
//                   <th style={{ padding: '10px' }}>Validity</th>
//                   <th style={{ padding: '10px' }}>Total</th>
//                   <th style={{ padding: '10px', textAlign: 'right' }}>Actions</th>
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
//                     <td style={{ padding: '10px', fontWeight: 700 }}>
//                       Rs {currency(q.total || 0)}
//                     </td>
//                     <td style={{ padding: '10px', textAlign: 'right' }}>
//                       <button
//                         onClick={() => handlePreview(q)}
//                         style={{ marginRight: '8px', padding: '5px 12px', border: 'none', borderRadius: '4px', background: '#062d73', color: '#fff', cursor: 'pointer' }}
//                       >
//                         View
//                       </button>
//                       <button
//                         onClick={() => openEditQuotation(q)}
//                         style={{ marginRight: '8px', padding: '5px 12px', border: 'none', borderRadius: '4px', background: '#e5e7eb', color: '#111', cursor: 'pointer' }}
//                       >
//                         Edit
//                       </button>
//                       <button
//                         onClick={() => deleteQuotation(q.id)}
//                         style={{ padding: '5px 12px', border: 'none', borderRadius: '4px', background: '#fee2e2', color: '#dc2626', cursor: 'pointer' }}
//                       >
//                         Delete
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>

//       {/* ==========================================================
//           QUOTATION FORM MODAL
//           ========================================================== */}

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
            
//             {/* Modal Header */}
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
//               <button
//                 onClick={() => {
//                   setShowForm(false)
//                   resetForm()
//                 }}
//                 style={{
//                   background: 'none',
//                   border: 'none',
//                   fontSize: '24px',
//                   cursor: 'pointer',
//                   color: '#666',
//                   padding: '0 10px'
//                 }}
//               >
//                 ✕
//               </button>
//             </div>

//             {/* Modal Body */}
//             <div style={{
//               padding: '20px 25px',
//               overflowY: 'auto',
//               flex: 1,
//               backgroundColor: '#fafafa'
//             }}>
//               <form onSubmit={handleSubmit}>
                
//                 {/* Customer & Details */}
//                 <div className="editor-section" style={{ background: '#fff' }}>
//                   <div className="editor-grid">
//                     <div className="field">
//                       <label>Customer *</label>
//                       <select
//                         value={customerId}
//                         onChange={(e) => setCustomerId(e.target.value)}
//                         required
//                         style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }}
//                       >
//                         <option value="">Select customer...</option>
//                         {customers.map((c) => (
//                           <option key={c.id} value={c.id}>
//                             {c.name} {c.company ? `- ${c.company}` : ''}
//                           </option>
//                         ))}
//                       </select>
//                     </div>

//                     <div className="field">
//                       <label>Quotation #</label>
//                       <input
//                         type="text"
//                         value={quotationNumber}
//                         onChange={(e) => setQuotationNumber(e.target.value)}
//                         placeholder="Will be generated on save"
//                         style={{ background: '#f3f4f6', fontWeight: 'bold' }}
//                         readOnly
//                       />
//                       <small style={{ color: '#666', fontSize: '11px' }}>
//                         Format: QTN-YYYYMMDD-0001
//                       </small>
//                     </div>

//                     <div className="field">
//                       <label>Date *</label>
//                       <input
//                         type="date"
//                         value={date}
//                         onChange={(e) => setDate(e.target.value)}
//                         required
//                       />
//                     </div>

//                     <div className="field">
//                       <label>Validity (Days) *</label>
//                       <input
//                         type="number"
//                         min="1"
//                         max="365"
//                         value={validity}
//                         onChange={(e) => setValidity(e.target.value)}
//                         placeholder="e.g., 30"
//                         required
//                         style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }}
//                       />
//                       <small style={{ color: '#666', fontSize: '11px' }}>
//                         Number of days quotation is valid (e.g., 30, 60, 90)
//                       </small>
//                     </div>

//                     <div className="field field-full">
//                       <label>Project</label>
//                       <input
//                         type="text"
//                         value={project}
//                         onChange={(e) => setProject(e.target.value)}
//                         placeholder="Project name (optional)"
//                       />
//                     </div>
//                   </div>
//                 </div>

//                 {/* Items */}
//                 <div className="editor-section" style={{ background: '#fff' }}>
//                   <div className="items-heading">
//                     <h2>Items</h2>
//                     <span style={{ fontSize: '14px', color: '#666' }}>
//                       Total: Rs {currency(calculateTotal())}
//                     </span>
//                   </div>

//                   <div className="items-editor">
//                     <div className="item-editor-row" style={{
//                       display: 'grid',
//                       gridTemplateColumns: '35px 1fr 80px 70px 90px 120px 70px',
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
//                       <div className="field">
//                         <input
//                           value={currentItem.description}
//                           onChange={(e) => setCurrentItem({
//                             ...currentItem,
//                             description: e.target.value
//                           })}
//                           placeholder="Description"
//                           style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }}
//                         />
//                       </div>
//                       <div className="field">
//                         <input
//                           value={currentItem.uom}
//                           onChange={(e) => setCurrentItem({
//                             ...currentItem,
//                             uom: e.target.value
//                           })}
//                           placeholder="UOM"
//                           style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }}
//                         />
//                       </div>
//                       <div className="field">
//                         <input
//                           type="number"
//                           min="1"
//                           value={currentItem.qty}
//                           onChange={(e) => setCurrentItem({
//                             ...currentItem,
//                             qty: Number(e.target.value) || 1
//                           })}
//                           placeholder="Qty"
//                           style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }}
//                         />
//                       </div>
//                       <div className="field">
//                         <input
//                           type="number"
//                           min="0"
//                           step="0.01"
//                           value={currentItem.price}
//                           onChange={(e) => setCurrentItem({
//                             ...currentItem,
//                             price: Number(e.target.value) || 0
//                           })}
//                           placeholder="Price"
//                           style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }}
//                         />
//                       </div>
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
//                       <button
//                         type="button"
//                         onClick={addItem}
//                         className="btn btn-primary btn-small"
//                         style={{ height: '39px', minWidth: '60px', padding: '0 15px' }}
//                       >
//                         Add
//                       </button>
//                     </div>

//                     <div style={{ maxHeight: '250px', overflowY: 'auto', marginTop: '10px' }}>
//                       {items.length === 0 ? (
//                         <div style={{ textAlign: 'center', padding: '30px', color: '#999', fontSize: '14px' }}>
//                           No items added yet. Add products above.
//                         </div>
//                       ) : (
//                         items.map((item, index) => (
//                           <div key={index} className="item-editor-row" style={{
//                             display: 'grid',
//                             gridTemplateColumns: '35px 1fr 80px 70px 90px 120px 70px',
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
//                             <div className="field">
//                               <div style={{ padding: '8px 0', fontWeight: 500 }}>{item.description}</div>
//                             </div>
//                             <div className="field">
//                               <div style={{ padding: '8px 0' }}>{item.uom || 'PCS'}</div>
//                             </div>
//                             <div className="field">
//                               <div style={{ padding: '8px 0', textAlign: 'center' }}>{item.qty}</div>
//                             </div>
//                             <div className="field">
//                               <div style={{ padding: '8px 0', textAlign: 'right' }}>Rs {currency(item.price)}</div>
//                             </div>
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
//                             <button
//                               type="button"
//                               onClick={() => removeItem(index)}
//                               className="remove-item"
//                               style={{
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
//                               }}
//                             >
//                               ×
//                             </button>
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
//                     <textarea
//                       value={terms}
//                       onChange={(e) => setTerms(e.target.value)}
//                       rows="3"
//                       placeholder="Payment terms, delivery, warranty, etc."
//                       style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', resize: 'vertical' }}
//                     />
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
//                   <button
//                     type="submit"
//                     disabled={saving}
//                     className="btn btn-primary"
//                     style={{ flex: 1, padding: '12px 20px', fontSize: '15px' }}
//                   >
//                     {saving ? 'Saving...' : editingId ? 'Update Quotation' : 'Create Quotation'}
//                   </button>
//                   <button
//                     type="button"
//                     onClick={() => {
//                       setShowForm(false)
//                       resetForm()
//                     }}
//                     className="btn btn-secondary"
//                     style={{ padding: '12px 25px', fontSize: '15px' }}
//                   >
//                     Cancel
//                   </button>
//                 </div>
//               </form>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ==========================================================
//           QUOTATION PREVIEW / PRINT
//           ========================================================== */}

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
//             <div style={{
//               display: 'flex',
//               justifyContent: 'space-between',
//               alignItems: 'center',
//               marginBottom: '15px'
//             }}>
//               <div>
//                 <h3 style={{ color: '#fff', margin: 0 }}>Quotation Preview</h3>
//                 <p style={{ color: '#ccc', margin: '5px 0 0', fontSize: '13px' }}>
//                   {previewData.quotationNumber}
//                 </p>
//               </div>
//               <div style={{ display: 'flex', gap: '10px' }}>
//                 <button
//                   onClick={handlePrint}
//                   className="btn btn-dark"
//                   style={{ background: '#fff', color: '#111' }}
//                 >
//                   🖨 Print
//                 </button>
//                 <button
//                   onClick={() => setPreviewData(null)}
//                   className="btn"
//                   style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}
//                 >
//                   ✕ Close
//                 </button>
//               </div>
//             </div>

//             <div ref={printRef} className="quotation-paper" style={{
//               background: '#fff',
//               padding: '12mm 8mm 8mm',
//               position: 'relative'
//             }}>
              
//               <div className="quote-heading">QUOTATION</div>

//               <div className="quote-header">
//                 <div className="company-info">
//                   <div className="company-name">
//                     {previewData.companyName || 'Your Company'}
//                   </div>
//                   <div className="company-address" style={{ maxWidth: '200px' }}>
//                     {previewData.companyAddress || 'Company Address'}
//                   </div>
//                   <div>Phone: {previewData.companyPhone || 'N/A'}</div>
//                   <div>Email: {previewData.companyEmail || '-'}</div>
//                 </div>

//                 <div className="quote-logo">
//                   <img 
//                     src={previewData.companyLogo || '/PN.png'}
//                     alt="Company Logo"
//                     style={{
//                       width: '33mm',
//                       height: '33mm',
//                       objectFit: 'contain',
//                       display: 'block',
//                       margin: '0 auto'
//                     }}
//                     onError={(e) => {
//                       e.target.style.display = 'none'
//                       const parent = e.target.parentNode
//                       const fallback = document.createElement('div')
//                       fallback.className = 'logo-mark'
//                       fallback.textContent = previewData.companyName ? previewData.companyName.charAt(0) : 'C'
//                       parent.appendChild(fallback)
//                     }}
//                   />
//                 </div>

//                 <div className="quote-info">
//                   <div>
//                     <strong>Quote #</strong>
//                     <span>{previewData.quotationNumber}</span>
//                   </div>
//                   <div>
//                     <strong>Date</strong>
//                     <span>{previewData.date}</span>
//                   </div>
//                   <div>
//                     <strong>Validity</strong>
//                     <span>
//                       {previewData.validity 
//                         ? `${previewData.validity} Days` 
//                         : 'N/A'}
//                     </span>
//                   </div>
//                   {previewData.validity && previewData.date && (
//                     <div>
//                       <strong>Valid Till</strong>
//                       <span>
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

//               <div className="quote-to-title">QUOTE TO</div>
//               <div className="quote-to-content">
//                 <strong>{previewData.customer?.name || ''}</strong>
//                 {previewData.customer?.company && (
//                   <div>{previewData.customer.company}</div>
//                 )}
//                 {previewData.customer?.address && (
//                   <div>{previewData.customer.address}</div>
//                 )}
//                 {previewData.customer?.phone && (
//                   <div>Phone: {previewData.customer.phone}</div>
//                 )}
//               </div>

//               {previewData.project && (
//                 <div className="project-row">
//                   <strong>Project: </strong>
//                   <span>{previewData.project}</span>
//                 </div>
//               )}

//               <table className="quote-table">
//                 <thead>
//                   <tr>
//                     <th style={{ width: '6%', textAlign: 'center' }}>#</th>
//                     <th className="description-col">Description</th>
//                     <th className="uom-col">UOM</th>
//                     <th className="qty-col">Qty</th>
//                     <th className="price-col">Unit Price</th>
//                     <th className="total-col">Total</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {(previewData.items || []).map((item, index) => {
//                     const qty = Number(item.qty) || 0
//                     const price = Number(item.price) || 0
//                     const total = qty * price
//                     return (
//                       <tr key={index}>
//                         <td style={{ textAlign: 'center' }}>{index + 1}</td>
//                         <td className="description-col">{item.description}</td>
//                         <td style={{ textAlign: 'center' }}>{item.uom || 'PCS'}</td>
//                         <td style={{ textAlign: 'center' }}>{qty}</td>
//                         <td className="number-cell">Rs {currency(price)}</td>
//                         <td className="number-cell">Rs {currency(total)}</td>
//                       </tr>
//                     )
//                   })}
                  
//                   {Array.from({ length: Math.max(0, 8 - (previewData.items?.length || 0)) }).map((_, i) => (
//                     <tr key={`empty-${i}`} className="empty-item-row">
//                       <td></td>
//                       <td></td>
//                       <td></td>
//                       <td></td>
//                       <td></td>
//                       <td></td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>

//               <div className="subtotal-row">
//                 <span>TOTAL</span>
//                 <strong>Rs {currency(previewData.total || 0)}</strong>
//               </div>

//               {previewData.terms && (
//                 <div className="terms-section">
//                   <strong>Terms & Conditions</strong>
//                   <div className="terms-content">{previewData.terms}</div>
//                 </div>
//               )}

//               <div className="quote-bottom">
//                 Authorized Signatory
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* CSS */}
//       <style dangerouslySetInnerHTML={{ __html: `
//         /* =========================================================
//            QUOTATION PAGE
//         ========================================================= */

//         * {
//           box-sizing: border-box;
//         }

//         .quotation-page {
//           width: 100%;
//           min-height: 100vh;
//           background: #f3f4f6;
//           padding: 30px;
//           font-family: Arial, Helvetica, sans-serif;
//           color: #111;
//         }

//         .quotation-editor {
//           max-width: 1100px;
//           margin: 0 auto 35px;
//           background: #ffffff;
//           border-radius: 12px;
//           padding: 25px;
//           box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
//         }

//         .quotation-editor-header {
//           display: flex;
//           align-items: center;
//           justify-content: space-between;
//           gap: 20px;
//           margin-bottom: 25px;
//         }

//         .quotation-editor-header h1 {
//           margin: 0 0 5px;
//           font-size: 28px;
//         }

//         .quotation-editor-header p {
//           margin: 0;
//           color: #666;
//           font-size: 14px;
//         }

//         .quotation-editor-actions {
//           display: flex;
//           gap: 10px;
//           flex-wrap: wrap;
//         }

//         .btn {
//           border: none;
//           border-radius: 7px;
//           padding: 11px 18px;
//           cursor: pointer;
//           font-size: 14px;
//           font-weight: 600;
//         }

//         .btn:disabled {
//           opacity: 0.6;
//           cursor: not-allowed;
//         }

//         .btn-primary {
//           background: #062d73;
//           color: #fff;
//         }

//         .btn-secondary {
//           background: #e5e7eb;
//           color: #111;
//         }

//         .btn-dark {
//           background: #111827;
//           color: #fff;
//         }

//         .btn-small {
//           padding: 8px 14px;
//         }

//         .quotation-alert {
//           padding: 12px 15px;
//           border-radius: 7px;
//           margin-bottom: 20px;
//           font-size: 14px;
//         }

//         .quotation-success {
//           background: #dcfce7;
//           color: #166534;
//         }

//         .quotation-error {
//           background: #fee2e2;
//           color: #991b1b;
//         }

//         .editor-section {
//           border: 1px solid #e5e7eb;
//           border-radius: 9px;
//           padding: 20px;
//           margin-bottom: 20px;
//         }

//         .editor-section h2 {
//           margin: 0 0 18px;
//           font-size: 17px;
//         }

//         .editor-grid {
//           display: grid;
//           grid-template-columns: repeat(2, minmax(0, 1fr));
//           gap: 16px;
//         }

//         .field {
//           display: flex;
//           flex-direction: column;
//           gap: 6px;
//         }

//         .field-full {
//           grid-column: 1 / -1;
//         }

//         .field label {
//           font-size: 13px;
//           font-weight: 600;
//           color: #374151;
//         }

//         .field input,
//         .field textarea,
//         .field select {
//           width: 100%;
//           border: 1px solid #d1d5db;
//           border-radius: 6px;
//           padding: 10px 11px;
//           outline: none;
//           font-size: 14px;
//           font-family: inherit;
//           background: #fff;
//         }

//         .field textarea {
//           resize: vertical;
//         }

//         .field input:focus,
//         .field textarea:focus,
//         .field select:focus {
//           border-color: #062d73;
//           box-shadow: 0 0 0 2px rgba(6, 45, 115, 0.08);
//         }

//         .items-heading {
//           display: flex;
//           align-items: center;
//           justify-content: space-between;
//           margin-bottom: 15px;
//           flex-wrap: wrap;
//           gap: 10px;
//         }

//         .items-heading h2 {
//           margin: 0;
//         }

//         .items-editor {
//           display: flex;
//           flex-direction: column;
//           gap: 10px;
//         }

//         .quotation-paper {
//           width: 210mm;
//           min-height: 297mm;
//           margin: 0 auto;
//           background: white;
//           padding: 12mm 8mm 8mm;
//           box-shadow: 0 3px 20px rgba(0, 0, 0, 0.12);
//           position: relative;
//           font-family: Arial, Helvetica, sans-serif;
//         }

//         .quote-heading {
//           text-align: center;
//           color: #062d73;
//           font-size: 24px;
//           font-weight: 800;
//           text-decoration: underline;
//           margin-bottom: 8mm;
//         }

//         .quote-header {
//           display: grid;
//           grid-template-columns: 1fr 1fr 1fr;
//           gap: 5mm;
//           align-items: start;
//           min-height: 43mm;
//         }

//         .company-info {
//           font-size: 10px;
//           line-height: 1.45;
//         }

//         .company-info strong {
//           display: block;
//           font-size: 10px;
//           margin-bottom: 1mm;
//         }

//         .company-name {
//           font-weight: 700;
//           font-size: 11px;
//           margin-bottom: 1mm;
//         }

//         .company-address {
//           white-space: normal;
//         }

//         .quote-logo {
//           text-align: center;
//           padding-top: 2mm;
//         }

//         .logo-mark {
//           margin: 0 auto;
//           width: 27mm;
//           height: 27mm;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           font-size: 27px;
//           font-weight: 900;
//           color: #fff;
//           background: #062d73;
//           clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
//         }

//         .logo-text {
//           color: #062d73;
//           font-size: 10px;
//           font-weight: 600;
//           margin-top: 1mm;
//           letter-spacing: 0.4px;
//           text-transform: uppercase;
//         }

//         .logo-tagline {
//           font-size: 7px;
//           color: #777;
//           margin-top: 1mm;
//         }

//         .quote-info {
//           font-size: 10px;
//           line-height: 1.8;
//         }

//         .quote-info > div {
//           display: grid;
//           grid-template-columns: 32mm 1fr;
//           gap: 2mm;
//         }

//         .quote-info strong {
//           text-align: right;
//         }

//         .quote-info span {
//           text-align: left;
//           word-break: break-word;
//         }

//         .quote-to-title {
//           background: #062d73;
//           color: #fff;
//           font-size: 11px;
//           font-weight: 700;
//           padding: 2mm 4mm;
//           margin-top: 2mm;
//         }

//         .quote-to-content {
//           padding: 3mm 4mm;
//           min-height: 18mm;
//           font-size: 10px;
//           line-height: 1.7;
//         }

//         .quote-table {
//           width: 100%;
//           border-collapse: collapse;
//           table-layout: fixed;
//           font-size: 9px;
//         }

//         .quote-table th,
//         .quote-table td {
//           border-left: 0.35mm solid #111;
//           border-right: 0.35mm solid #111;
//           padding: 1.3mm 1mm;
//           vertical-align: middle;
//         }

//         .quote-table th {
//           font-size: 9px;
//           font-weight: 700;
//           text-align: center;
//           height: 9mm;
//           border-top: 0.35mm solid #111;
//           border-bottom: 0.35mm solid #111;
//         }

//         .quote-table td {
//           height: 7mm;
//           border-top: none;
//           border-bottom: none;
//         }

//         .quote-table tbody tr:last-child td {
//           border-bottom: 0.35mm solid #111;
//         }

//         .description-col {
//           width: 55%;
//           text-align: left !important;
//         }

//         .uom-col {
//           width: 9%;
//         }

//         .qty-col {
//           width: 10%;
//         }

//         .price-col {
//           width: 13%;
//         }

//         .total-col {
//           width: 13%;
//         }

//         .quote-table td:nth-child(2),
//         .quote-table td:nth-child(3) {
//           text-align: center;
//         }

//         .number-cell {
//           text-align: right;
//           padding-right: 2mm !important;
//         }

//         .empty-item-row td {
//           height: 6.5mm;
//         }

//         .subtotal-row {
//           width: 100%;
//           min-height: 13mm;
//           border: 0.35mm solid #062d73;
//           border-top: 0;
//           display: grid;
//           grid-template-columns: 1fr 45mm;
//           align-items: center;
//           font-size: 10px;
//           font-weight: 700;
//           padding-left: 4mm;
//         }

//         .subtotal-row strong {
//           text-align: right;
//           padding-right: 4mm;
//           font-size: 11px;
//         }

//         .terms-section {
//           min-height: 58mm;
//           border: 0.35mm solid #062d73;
//           border-top: 0;
//           padding: 3mm 4mm;
//           font-size: 9px;
//         }

//         .terms-section > strong {
//           font-size: 10px;
//         }

//         .terms-content {
//           margin-top: 3mm;
//           white-space: pre-wrap;
//           line-height: 1.5;
//         }

//         .project-row {
//           padding: 2mm 4mm;
//           font-size: 9px;
//           border-left: 0.35mm solid #062d73;
//           border-right: 0.35mm solid #062d73;
//         }

//         .quote-bottom {
//           position: absolute;
//           bottom: 8mm;
//           left: 8mm;
//           right: 8mm;
//           height: 7mm;
//           border: 0.35mm solid #062d73;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           color: #c00000;
//           font-size: 11px;
//           font-weight: 700;
//         }

//         @media (max-width: 900px) {
//           .quotation-page {
//             padding: 15px;
//           }

//           .quotation-paper {
//             transform-origin: top center;
//             width: 210mm;
//             max-width: 100%;
//             overflow-x: auto;
//           }

//           .quotation-modal-content {
//             max-width: 95% !important;
//             max-height: 95vh !important;
//           }

//           .item-editor-row {
//             grid-template-columns: 35px 1fr 1fr !important;
//             overflow-x: auto !important;
//           }

//           .item-editor-row .field {
//             min-width: 80px !important;
//           }
//         }

//         @media (max-width: 650px) {
//           .quotation-editor-header {
//             flex-direction: column;
//             align-items: flex-start;
//           }

//           .editor-grid {
//             grid-template-columns: 1fr;
//           }

//           .field-full {
//             grid-column: auto;
//           }

//           .item-editor-row {
//             grid-template-columns: 1fr !important;
//             overflow-x: auto !important;
//           }

//           .item-number {
//             justify-content: flex-start;
//           }

//           .quotation-modal-content {
//             max-width: 98% !important;
//             max-height: 98vh !important;
//             padding: 0 !important;
//           }
//         }

//         @media print {
//           @page {
//             size: A4;
//             margin: 0;
//           }

//           html,
//           body {
//             margin: 0 !important;
//             padding: 0 !important;
//             background: #fff !important;
//           }

//           body {
//             -webkit-print-color-adjust: exact !important;
//             print-color-adjust: exact !important;
//           }

//           .quotation-page {
//             margin: 0;
//             padding: 0;
//             background: #fff;
//           }

//           .no-print,
//           .quotation-editor {
//             display: none !important;
//           }

//           .quotation-preview-overlay {
//             position: static !important;
//             background: none !important;
//             padding: 0 !important;
//           }

//           .quotation-paper {
//             width: 210mm;
//             min-height: 297mm;
//             margin: 0;
//             padding: 12mm 8mm 8mm;
//             box-shadow: none;
//             page-break-after: always;
//           }

//           .quote-to-title {
//             background: #062d73 !important;
//             color: white !important;
//           }

//           .quote-bottom {
//             color: #c00000 !important;
//           }
//         }
//       `}} />

//     </div>
//   )
// }


//qtn editable

// import { useState, useEffect, useRef } from 'react'
// import { ref, push, onValue, update, remove, get, set } from 'firebase/database'
// import { useAuth } from '../context/AuthContext'
// import { db } from '../firebase'
// import { todayISO, currency } from '../utils/helpers'
// import { Modal } from './Customers'
// import Loader from '../components/Loader'
// import html2canvas from 'html2canvas'
// import jsPDF from 'jspdf'

// /* ============================================================
//    COMPANY INFORMATION - LOGO SET
//    ============================================================ */

// const COMPANY_NAME = 'Pearl Networks'
// const COMPANY_LOGO = '/PN.png'
// const COMPANY_ADDRESS = 'KCHS, Gohar Chamber, Office # 304, Shahra-e-Faisal, near Duty Free Shop, Karachi, 75600'
// const COMPANY_PHONE = '0341-1293604'
// const COMPANY_EMAIL = 'info@globalonesystem.com'

// /* ============================================================
//    EMPTY ITEM
//    ============================================================ */

// const emptyItem = {
//   description: '',
//   uom: 'PCS',
//   qty: 1,
//   price: 0
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

// // Yeh function SIRF next number READ karega, INCREMENT nahi karega
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
    
//     // Agar date change ho gayi hai toh counter reset karo
//     let nextNumber = lastNumber + 1
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

// // Yeh function SIRF increment karega (save ke waqt)
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
    
//     // Agar date change ho gayi hai toh counter reset karo
//     let newNumber = lastNumber + 1
//     if (lastDate !== dateStr) {
//       newNumber = 1
//     }
    
//     // Counter update karo with date and number
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

//   const [loading, setLoading] = useState(true)
//   const [quotations, setQuotations] = useState([])
//   const [customers, setCustomers] = useState([])
  
//   // Form state
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
  
//   // Current item being added
//   const [currentItem, setCurrentItem] = useState({ ...emptyItem })
  
//   /* ============================================================
//      EDIT PRODUCT STATE
//      ============================================================ */
  
//   const [editingProductIndex, setEditingProductIndex] = useState(null)
//   const [editProduct, setEditProduct] = useState({
//     description: '',
//     uom: 'PCS',
//     qty: 1,
//     price: 0
//   })
  
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

//     // Load customers
//     const customersRef = ref(db, `companies/${companyId}/customers`)
//     const unsubscribeCustomers = onValue(customersRef, (snapshot) => {
//       const data = snapshot.val() || {}
//       const list = Object.entries(data).map(([id, customer]) => ({
//         id,
//         ...customer
//       }))
//       setCustomers(list)
//     })

//     // Load quotations
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

//     return () => {
//       unsubscribeCustomers()
//       unsubscribeQuotations()
//     }
//   }, [companyId])

//   /* ============================================================
//      CALCULATE TOTALS - NO TAX
//      ============================================================ */

//   const calculateSubtotal = () => {
//     return items.reduce((sum, item) => {
//       const qty = Number(item.qty) || 0
//       const price = Number(item.price) || 0
//       return sum + (qty * price)
//     }, 0)
//   }

//   const calculateTotal = () => {
//     return calculateSubtotal()
//   }

//   /* ============================================================
//      ADD ITEM
//      ============================================================ */

//   const addItem = () => {
//     if (!currentItem.description.trim()) {
//       setError('Product description required')
//       return
//     }

//     const newItem = {
//       description: currentItem.description.trim(),
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
//       description: item.description || '',
//       uom: item.uom || 'PCS',
//       qty: item.qty || 1,
//       price: item.price || 0
//     })
//   }

//   /* ============================================================
//      EDIT PRODUCT - SAVE
//      ============================================================ */

//   const saveEditProduct = () => {
//     if (!editProduct.description.trim()) {
//       setError('Product description required')
//       return
//     }

//     const updatedItems = [...items]
//     updatedItems[editingProductIndex] = {
//       description: editProduct.description.trim(),
//       uom: editProduct.uom || 'PCS',
//       qty: Math.max(1, Number(editProduct.qty) || 1),
//       price: Math.max(0, Number(editProduct.price) || 0)
//     }

//     setItems(updatedItems)
//     setEditingProductIndex(null)
//     setEditProduct({
//       description: '',
//       uom: 'PCS',
//       qty: 1,
//       price: 0
//     })
//     setError('')
//   }

//   /* ============================================================
//      EDIT PRODUCT - CLOSE
//      ============================================================ */

//   const closeEditProduct = () => {
//     setEditingProductIndex(null)
//     setEditProduct({
//       description: '',
//       uom: 'PCS',
//       qty: 1,
//       price: 0
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
//       description: '',
//       uom: 'PCS',
//       qty: 1,
//       price: 0
//     })
//   }

//   /* ============================================================
//      OPEN NEW QUOTATION - Number generate karega (editable)
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
//      SAVE QUOTATION - User ka entered number save hoga
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

//       // Agar editing nahi hai (new quotation) toh counter increment karo
//       if (!editingId) {
//         // Counter increment karo (tracking ke liye)
//         await incrementQuotationCounter(companyId)
        
//         // Agar user ne number empty chhoda hai toh fallback generate karo
//         if (!finalQuotationNumber || finalQuotationNumber.trim() === '') {
//           const dateStr = getTodayDateString()
//           const timestamp = Date.now().toString().slice(-6)
//           finalQuotationNumber = `QTN-${dateStr}-${timestamp}`
//           setQuotationNumber(finalQuotationNumber)
//         }
//         // ✅ User ka entered number use hoga (override nahi hoga)
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
//      SAVE AS PDF - FIXED WHITE BACKGROUND
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
      
//       await new Promise(resolve => setTimeout(resolve, 600))
      
//       const element = document.getElementById('quotation-pdf-content')
      
//       if (!element) {
//         alert('PDF content not found!')
//         setGeneratingPdf(false)
//         return
//       }
      
//       const canvas = await html2canvas(element, {
//         scale: 1.2,
//         useCORS: true,
//         logging: false,
//         backgroundColor: '#ffffff',
//         width: 794,
//         height: 1123,
//         windowWidth: 794,
//         windowHeight: 1123,
//         onclone: (clonedDoc) => {
//           const clonedElement = clonedDoc.getElementById('quotation-pdf-content')
//           if (clonedElement) {
//             clonedElement.style.background = '#ffffff'
//             clonedElement.style.backgroundColor = '#ffffff'
//           }
//         }
//       })
      
//       const imgData = canvas.toDataURL('image/png', 0.85)
//       const pdf = new jsPDF('p', 'mm', 'a4')
//       const pdfWidth = 210
//       const pdfHeight = (canvas.height * pdfWidth) / canvas.width
      
//       pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
//       pdf.save(`Quotation-${quotation.quotationNumber}.pdf`)
      
//       setPreviewData(null)
      
//     } catch (error) {
//       console.error('PDF generation error:', error)
//       alert('PDF generate nahi ho saka. Error: ' + error.message)
//     } finally {
//       setGeneratingPdf(false)
//     }
//   }

//   /* ============================================================
//      RENDER
//      ============================================================ */

//   return (
//     <div className="quotation-page">

//       {/* ==========================================================
//           EDITOR (Form)
//           ========================================================== */}

//       <div className="quotation-editor no-print">
//         <div className="quotation-editor-header">
//           <div>
//             <h1>Quotations</h1>
//             <p>Create and manage quotations for your customers</p>
//           </div>
//           <div className="quotation-editor-actions">
//             <button
//               onClick={openNewQuotation}
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

//         {/* Quotation List */}
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
//                   <th style={{ padding: '10px' }}>#</th>
//                   <th style={{ padding: '10px' }}>Customer</th>
//                   <th style={{ padding: '10px' }}>Date</th>
//                   <th style={{ padding: '10px' }}>Validity</th>
//                   <th style={{ padding: '10px' }}>Total</th>
//                   <th style={{ padding: '10px', textAlign: 'right' }}>Actions</th>
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
//                     <td style={{ padding: '10px', fontWeight: 700 }}>
//                       Rs {currency(q.total || 0)}
//                     </td>
//                     <td style={{ padding: '10px', textAlign: 'right' }}>
//                       <button
//                         onClick={() => handlePreview(q)}
//                         style={{ marginRight: '8px', padding: '5px 12px', border: 'none', borderRadius: '4px', background: '#062d73', color: '#fff', cursor: 'pointer' }}
//                       >
//                         View
//                       </button>
//                       <button
//                         onClick={() => openEditQuotation(q)}
//                         style={{ marginRight: '8px', padding: '5px 12px', border: 'none', borderRadius: '4px', background: '#e5e7eb', color: '#111', cursor: 'pointer' }}
//                       >
//                         Edit
//                       </button>
//                       <button
//                         onClick={() => deleteQuotation(q.id)}
//                         style={{ marginRight: '8px', padding: '5px 12px', border: 'none', borderRadius: '4px', background: '#fee2e2', color: '#dc2626', cursor: 'pointer' }}
//                       >
//                         Delete
//                       </button>
//                       {/* SAVE AS PDF BUTTON */}
//                       <button
//                         onClick={() => handleSavePdf(q)}
//                         disabled={generatingPdf}
//                         style={{ 
//                           padding: '5px 12px', 
//                           border: 'none', 
//                           borderRadius: '4px', 
//                           background: '#dc2626', 
//                           color: '#fff', 
//                           cursor: 'pointer',
//                           opacity: generatingPdf ? 0.6 : 1
//                         }}
//                       >
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

//       {/* ==========================================================
//           QUOTATION FORM MODAL
//           ========================================================== */}

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
            
//             {/* Modal Header */}
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
//               <button
//                 onClick={() => {
//                   setShowForm(false)
//                   resetForm()
//                 }}
//                 style={{
//                   background: 'none',
//                   border: 'none',
//                   fontSize: '24px',
//                   cursor: 'pointer',
//                   color: '#666',
//                   padding: '0 10px'
//                 }}
//               >
//                 ✕
//               </button>
//             </div>

//             {/* Modal Body */}
//             <div style={{
//               padding: '20px 25px',
//               overflowY: 'auto',
//               flex: 1,
//               backgroundColor: '#fafafa'
//             }}>
//               <form onSubmit={handleSubmit}>
                
//                 {/* Customer & Details */}
//                 <div className="editor-section" style={{ background: '#fff' }}>
//                   <div className="editor-grid">
//                     <div className="field">
//                       <label>Customer *</label>
//                       <select
//                         value={customerId}
//                         onChange={(e) => setCustomerId(e.target.value)}
//                         required
//                         style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }}
//                       >
//                         <option value="">Select customer...</option>
//                         {customers.map((c) => (
//                           <option key={c.id} value={c.id}>
//                             {c.name} {c.company ? `- ${c.company}` : ''}
//                           </option>
//                         ))}
//                       </select>
//                     </div>

//                     <div className="field">
//                       <label>Quotation #</label>
//                       <input
//                         type="text"
//                         value={quotationNumber}
//                         onChange={(e) => setQuotationNumber(e.target.value)}
//                         placeholder="Will be generated on save"
//                         style={{ background: '#f3f4f6', fontWeight: 'bold' }}
//                       />
//                       <small style={{ color: '#666', fontSize: '11px' }}>
//                         Format: QTN-YYYYMMDD-0001
//                       </small>
//                     </div>

//                     <div className="field">
//                       <label>Date *</label>
//                       <input
//                         type="date"
//                         value={date}
//                         onChange={(e) => setDate(e.target.value)}
//                         required
//                       />
//                     </div>

//                     <div className="field">
//                       <label>Validity (Days) *</label>
//                       <input
//                         type="number"
//                         min="1"
//                         max="365"
//                         value={validity}
//                         onChange={(e) => setValidity(e.target.value)}
//                         placeholder="e.g., 30"
//                         required
//                         style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }}
//                       />
//                       <small style={{ color: '#666', fontSize: '11px' }}>
//                         Number of days quotation is valid (e.g., 30, 60, 90)
//                       </small>
//                     </div>

//                     <div className="field field-full">
//                       <label>Project</label>
//                       <input
//                         type="text"
//                         value={project}
//                         onChange={(e) => setProject(e.target.value)}
//                         placeholder="Project name (optional)"
//                       />
//                     </div>
//                   </div>
//                 </div>

//                 {/* Items */}
//                 <div className="editor-section" style={{ background: '#fff' }}>
//                   <div className="items-heading">
//                     <h2>Items</h2>
//                     <span style={{ fontSize: '14px', color: '#666' }}>
//                       Total: Rs {currency(calculateTotal())}
//                     </span>
//                   </div>

//                   <div className="items-editor">
//                     <div className="item-editor-row" style={{
//                       display: 'grid',
//                       gridTemplateColumns: '35px 1fr 1fr 80px 70px 90px 120px 70px',
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
//                       <div className="field">
//                         <textarea
//                           value={currentItem.description}
//                           onChange={(e) => setCurrentItem({
//                             ...currentItem,
//                             description: e.target.value
//                           })}
//                           placeholder="Description (press Enter for new line)"
//                           rows="2"
//                           style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', resize: 'vertical' }}
//                         />
//                       </div>
//                       <div className="field">
//                         <input
//                           value={currentItem.uom}
//                           onChange={(e) => setCurrentItem({
//                             ...currentItem,
//                             uom: e.target.value
//                           })}
//                           placeholder="UOM"
//                           style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }}
//                         />
//                       </div>
//                       <div className="field">
//                         <input
//                           type="number"
//                           min="1"
//                           value={currentItem.qty}
//                           onChange={(e) => setCurrentItem({
//                             ...currentItem,
//                             qty: Number(e.target.value) || 1
//                           })}
//                           placeholder="Qty"
//                           style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }}
//                         />
//                       </div>
//                       <div className="field">
//                         <input
//                           type="number"
//                           min="0"
//                           step="0.01"
//                           value={currentItem.price}
//                           onChange={(e) => setCurrentItem({
//                             ...currentItem,
//                             price: Number(e.target.value) || 0
//                           })}
//                           placeholder="Price"
//                           style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }}
//                         />
//                       </div>
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
//                       <button
//                         type="button"
//                         onClick={addItem}
//                         className="btn btn-primary btn-small"
//                         style={{ height: '39px', minWidth: '60px', padding: '0 15px' }}
//                       >
//                         Add
//                       </button>
//                     </div>

//                     <div style={{ maxHeight: '250px', overflowY: 'auto', marginTop: '10px' }}>
//                       {items.length === 0 ? (
//                         <div style={{ textAlign: 'center', padding: '30px', color: '#999', fontSize: '14px' }}>
//                           No items added yet. Add products above.
//                         </div>
//                       ) : (
//                         items.map((item, index) => (
//                           <div key={index} className="item-editor-row" style={{
//                             display: 'grid',
//                             gridTemplateColumns: '35px 1fr 1fr 80px 70px 90px 120px 70px',
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
//                             <div className="field">
//                               <div style={{ 
//                                 padding: '8px 0', 
//                                 fontWeight: 500,
//                                 whiteSpace: 'pre-wrap',
//                                 wordBreak: 'break-word'
//                               }}>
//                                 {item.description}
//                               </div>
//                             </div>
//                             <div className="field">
//                               <div style={{ padding: '8px 0' }}>{item.uom || 'PCS'}</div>
//                             </div>
//                             <div className="field">
//                               <div style={{ padding: '8px 0', textAlign: 'center' }}>{item.qty}</div>
//                             </div>
//                             <div className="field">
//                               <div style={{ padding: '8px 0', textAlign: 'right' }}>Rs {currency(item.price)}</div>
//                             </div>
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
//                               {/* EDIT BUTTON */}
//                               <button
//                                 type="button"
//                                 onClick={() => openEditProduct(index)}
//                                 style={{
//                                   height: '39px',
//                                   width: '35px',
//                                   border: 'none',
//                                   borderRadius: '6px',
//                                   background: '#dbeafe',
//                                   color: '#1d4ed8',
//                                   fontSize: '16px',
//                                   cursor: 'pointer',
//                                   display: 'flex',
//                                   alignItems: 'center',
//                                   justifyContent: 'center'
//                                 }}
//                               >
//                                 ✎
//                               </button>
//                               {/* DELETE BUTTON */}
//                               <button
//                                 type="button"
//                                 onClick={() => removeItem(index)}
//                                 style={{
//                                   height: '39px',
//                                   width: '35px',
//                                   border: 'none',
//                                   borderRadius: '6px',
//                                   background: '#fee2e2',
//                                   color: '#dc2626',
//                                   fontSize: '20px',
//                                   cursor: 'pointer',
//                                   display: 'flex',
//                                   alignItems: 'center',
//                                   justifyContent: 'center'
//                                 }}
//                               >
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
//                     <textarea
//                       value={terms}
//                       onChange={(e) => setTerms(e.target.value)}
//                       rows="3"
//                       placeholder="Payment terms, delivery, warranty, etc."
//                       style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', resize: 'vertical' }}
//                     />
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
//                   <button
//                     type="submit"
//                     disabled={saving}
//                     className="btn btn-primary"
//                     style={{ flex: 1, padding: '12px 20px', fontSize: '15px' }}
//                   >
//                     {saving ? 'Saving...' : editingId ? 'Update Quotation' : 'Create Quotation'}
//                   </button>
//                   <button
//                     type="button"
//                     onClick={() => {
//                       setShowForm(false)
//                       resetForm()
//                     }}
//                     className="btn btn-secondary"
//                     style={{ padding: '12px 25px', fontSize: '15px' }}
//                   >
//                     Cancel
//                   </button>
//                 </div>
//               </form>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ==========================================================
//           EDIT PRODUCT MODAL
//           ========================================================== */}

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
//             <div style={{
//               display: 'flex',
//               justifyContent: 'space-between',
//               alignItems: 'center',
//               marginBottom: '20px'
//             }}>
//               <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>Edit Product</h3>
//               <button
//                 onClick={closeEditProduct}
//                 style={{
//                   background: 'none',
//                   border: 'none',
//                   fontSize: '24px',
//                   cursor: 'pointer',
//                   color: '#666'
//                 }}
//               >
//                 ✕
//               </button>
//             </div>

//             <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
//               <div>
//                 <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '5px' }}>
//                   Description *
//                 </label>
//                 <textarea
//                   value={editProduct.description}
//                   onChange={(e) => setEditProduct({
//                     ...editProduct,
//                     description: e.target.value
//                   })}
//                   rows="3"
//                   placeholder="Product description (multi-line)"
//                   style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', resize: 'vertical' }}
//                 />
//               </div>

//               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
//                 <div>
//                   <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '5px' }}>
//                     UOM
//                   </label>
//                   <input
//                     type="text"
//                     value={editProduct.uom}
//                     onChange={(e) => setEditProduct({
//                       ...editProduct,
//                       uom: e.target.value
//                     })}
//                     style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }}
//                   />
//                 </div>
//                 <div>
//                   <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '5px' }}>
//                     Qty
//                   </label>
//                   <input
//                     type="number"
//                     min="1"
//                     value={editProduct.qty}
//                     onChange={(e) => setEditProduct({
//                       ...editProduct,
//                       qty: Number(e.target.value) || 1
//                     })}
//                     style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }}
//                   />
//                 </div>
//                 <div>
//                   <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '5px' }}>
//                     Price
//                   </label>
//                   <input
//                     type="number"
//                     min="0"
//                     step="0.01"
//                     value={editProduct.price}
//                     onChange={(e) => setEditProduct({
//                       ...editProduct,
//                       price: Number(e.target.value) || 0
//                     })}
//                     style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }}
//                   />
//                 </div>
//               </div>

//               <button
//                 onClick={saveEditProduct}
//                 disabled={!editProduct.description.trim()}
//                 style={{
//                   width: '100%',
//                   padding: '12px',
//                   border: 'none',
//                   borderRadius: '6px',
//                   background: '#062d73',
//                   color: '#fff',
//                   fontSize: '15px',
//                   fontWeight: 600,
//                   cursor: 'pointer',
//                   marginTop: '10px'
//                 }}
//               >
//                 Save Product
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ==========================================================
//           QUOTATION PREVIEW / PDF - WITH FIXES
//           ========================================================== */}

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
//                 <p style={{ color: '#ccc', margin: '5px 0 0', fontSize: '13px' }}>
//                   {previewData.quotationNumber}
//                 </p>
//               </div>
//               <div style={{ display: 'flex', gap: '10px' }}>
//                 <button
//                   onClick={() => {
//                     const element = document.getElementById('quotation-pdf-content')
//                     if (element) {
//                       window.print()
//                     }
//                   }}
//                   style={{ background: '#fff', color: '#111', padding: '10px 20px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
//                 >
//                   🖨 Print
//                 </button>
//                 <button
//                   onClick={() => setPreviewData(null)}
//                   style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', padding: '10px 20px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
//                 >
//                   ✕ Close
//                 </button>
//               </div>
//             </div>

//             {/* PDF CONTENT - FIXED */}
//             <div id="quotation-pdf-content" style={{
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
//                 <div className="company-info" style={{
//                   fontSize: '10px',
//                   lineHeight: '1.45'
//                 }}>
//                   <div className="company-name" style={{
//                     fontWeight: 700,
//                     fontSize: '11px',
//                     marginBottom: '1mm'
//                   }}>
//                     {previewData.companyName || 'Your Company'}
//                   </div>
//                   <div className="company-address" style={{ whiteSpace: 'normal' }}>
//                     {previewData.companyAddress || 'Company Address'}
//                   </div>
//                   <div>Phone: {previewData.companyPhone || 'N/A'}</div>
//                   <div>Email: {previewData.companyEmail || '-'}</div>
//                 </div>

//                 <div className="quote-logo" style={{
//                   textAlign: 'center',
//                   paddingTop: '2mm'
//                 }}>
//                   <img 
//                     src={previewData.companyLogo || '/PN.png'}
//                     alt="Company Logo"
//                     style={{
//                       width: '33mm',
//                       height: '33mm',
//                       objectFit: 'contain',
//                       display: 'block',
//                       margin: '0 auto'
//                     }}
//                     onError={(e) => {
//                       e.target.style.display = 'none'
//                     }}
//                   />
//                 </div>

//                 <div className="quote-info" style={{
//                   fontSize: '10px',
//                   lineHeight: '1.8'
//                 }}>
//                   <div style={{
//                     display: 'grid',
//                     gridTemplateColumns: '32mm 1fr',
//                     gap: '2mm'
//                   }}>
//                     <strong style={{ textAlign: 'right' }}>Quote #</strong>
//                     <span style={{ textAlign: 'left' }}>{previewData.quotationNumber}</span>
//                   </div>
//                   <div style={{
//                     display: 'grid',
//                     gridTemplateColumns: '32mm 1fr',
//                     gap: '2mm'
//                   }}>
//                     <strong style={{ textAlign: 'right' }}>Date</strong>
//                     <span style={{ textAlign: 'left' }}>{previewData.date}</span>
//                   </div>
//                   <div style={{
//                     display: 'grid',
//                     gridTemplateColumns: '32mm 1fr',
//                     gap: '2mm'
//                   }}>
//                     <strong style={{ textAlign: 'right' }}>Validity</strong>
//                     <span style={{ textAlign: 'left' }}>
//                       {previewData.validity 
//                         ? `${previewData.validity} Days` 
//                         : 'N/A'}
//                     </span>
//                   </div>
//                   {previewData.validity && previewData.date && (
//                     <div style={{
//                       display: 'grid',
//                       gridTemplateColumns: '32mm 1fr',
//                       gap: '2mm'
//                     }}>
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
//                 {previewData.customer?.company && (
//                   <div>{previewData.customer.company}</div>
//                 )}
//                 {previewData.customer?.address && (
//                   <div>{previewData.customer.address}</div>
//                 )}
//                 {previewData.customer?.phone && (
//                   <div>Phone: {previewData.customer.phone}</div>
//                 )}
//               </div>

//               {/* PROJECT WITH 4 SIDE BORDER */}
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

//               <table className="quote-table" style={{
//                 width: '100%',
//                 borderCollapse: 'collapse',
//                 tableLayout: 'fixed',
//                 fontSize: '9px',
//                 borderLeft: '0.35mm solid #111111',
//                 borderRight: '0.35mm solid #111111',
//                 marginTop: previewData.project ? '2mm' : '0'
//               }}>
//                 <thead>
//                   <tr>
//                     <th style={{
//                       width: '6%',
//                       textAlign: 'center',
//                       borderLeft: '0.35mm solid #111111',
//                       borderRight: '0.35mm solid #111111',
//                       padding: '1.3mm 1mm',
//                       verticalAlign: 'middle',
//                       fontSize: '9px',
//                       fontWeight: 700,
//                       height: '9mm',
//                       backgroundColor: '#f5f5f5',
//                       borderTop: '0.35mm solid #111111',
//                       borderBottom: '0.35mm solid #111111'
//                     }}>#</th>
//                     <th className="description-col" style={{
//                       width: '55%',
//                       textAlign: 'left',
//                       borderLeft: '0.35mm solid #111111',
//                       borderRight: '0.35mm solid #111111',
//                       padding: '1.3mm 1mm',
//                       verticalAlign: 'middle',
//                       fontSize: '9px',
//                       fontWeight: 700,
//                       height: '9mm',
//                       backgroundColor: '#f5f5f5',
//                       borderTop: '0.35mm solid #111111',
//                       borderBottom: '0.35mm solid #111111'
//                     }}>Description</th>
//                     <th className="uom-col" style={{
//                       width: '9%',
//                       textAlign: 'center',
//                       borderLeft: '0.35mm solid #111111',
//                       borderRight: '0.35mm solid #111111',
//                       padding: '1.3mm 1mm',
//                       verticalAlign: 'middle',
//                       fontSize: '9px',
//                       fontWeight: 700,
//                       height: '9mm',
//                       backgroundColor: '#f5f5f5',
//                       borderTop: '0.35mm solid #111111',
//                       borderBottom: '0.35mm solid #111111'
//                     }}>UOM</th>
//                     <th className="qty-col" style={{
//                       width: '10%',
//                       textAlign: 'center',
//                       borderLeft: '0.35mm solid #111111',
//                       borderRight: '0.35mm solid #111111',
//                       padding: '1.3mm 1mm',
//                       verticalAlign: 'middle',
//                       fontSize: '9px',
//                       fontWeight: 700,
//                       height: '9mm',
//                       backgroundColor: '#f5f5f5',
//                       borderTop: '0.35mm solid #111111',
//                       borderBottom: '0.35mm solid #111111'
//                     }}>Qty</th>
//                     <th className="price-col" style={{
//                       width: '13%',
//                       textAlign: 'center',
//                       borderLeft: '0.35mm solid #111111',
//                       borderRight: '0.35mm solid #111111',
//                       padding: '1.3mm 1mm',
//                       verticalAlign: 'middle',
//                       fontSize: '9px',
//                       fontWeight: 700,
//                       height: '9mm',
//                       backgroundColor: '#f5f5f5',
//                       borderTop: '0.35mm solid #111111',
//                       borderBottom: '0.35mm solid #111111'
//                     }}>Unit Price</th>
//                     <th className="total-col" style={{
//                       width: '13%',
//                       textAlign: 'center',
//                       borderLeft: '0.35mm solid #111111',
//                       borderRight: '0.35mm solid #111111',
//                       padding: '1.3mm 1mm',
//                       verticalAlign: 'middle',
//                       fontSize: '9px',
//                       fontWeight: 700,
//                       height: '9mm',
//                       backgroundColor: '#f5f5f5',
//                       borderTop: '0.35mm solid #111111',
//                       borderBottom: '0.35mm solid #111111'
//                     }}>Total</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {(previewData.items || []).map((item, index) => {
//                     const qty = Number(item.qty) || 0
//                     const price = Number(item.price) || 0
//                     const total = qty * price
//                     return (
//                       <tr key={index}>
//                         <td style={{
//                           textAlign: 'center',
//                           borderLeft: '0.35mm solid #111111',
//                           borderRight: '0.35mm solid #111111',
//                           padding: '1.3mm 1mm',
//                           verticalAlign: 'middle',
//                           height: '7mm',
//                           borderTop: 'none',
//                           borderBottom: 'none'
//                         }}>{index + 1}</td>
//                         <td className="description-col" style={{
//                           textAlign: 'left',
//                           borderLeft: '0.35mm solid #111111',
//                           borderRight: '0.35mm solid #111111',
//                           padding: '1.3mm 1mm',
//                           verticalAlign: 'middle',
//                           height: '7mm',
//                           borderTop: 'none',
//                           borderBottom: 'none',
//                           whiteSpace: 'pre-wrap',
//                           wordBreak: 'break-word'
//                         }}>{item.description}</td>
//                         <td style={{
//                           textAlign: 'center',
//                           borderLeft: '0.35mm solid #111111',
//                           borderRight: '0.35mm solid #111111',
//                           padding: '1.3mm 1mm',
//                           verticalAlign: 'middle',
//                           height: '7mm',
//                           borderTop: 'none',
//                           borderBottom: 'none'
//                         }}>{item.uom || 'PCS'}</td>
//                         <td style={{
//                           textAlign: 'center',
//                           borderLeft: '0.35mm solid #111111',
//                           borderRight: '0.35mm solid #111111',
//                           padding: '1.3mm 1mm',
//                           verticalAlign: 'middle',
//                           height: '7mm',
//                           borderTop: 'none',
//                           borderBottom: 'none'
//                         }}>{qty}</td>
//                         <td className="number-cell" style={{
//                           textAlign: 'right',
//                           paddingRight: '2mm',
//                           borderLeft: '0.35mm solid #111111',
//                           borderRight: '0.35mm solid #111111',
//                           padding: '1.3mm 1mm',
//                           verticalAlign: 'middle',
//                           height: '7mm',
//                           borderTop: 'none',
//                           borderBottom: 'none'
//                         }}>Rs {currency(price)}</td>
//                         <td className="number-cell" style={{
//                           textAlign: 'right',
//                           paddingRight: '2mm',
//                           borderLeft: '0.35mm solid #111111',
//                           borderRight: '0.35mm solid #111111',
//                           padding: '1.3mm 1mm',
//                           verticalAlign: 'middle',
//                           height: '7mm',
//                           borderTop: 'none',
//                           borderBottom: 'none'
//                         }}>Rs {currency(total)}</td>
//                       </tr>
//                     )
//                   })}
                  
//                   {Array.from({ length: Math.max(0, 8 - (previewData.items?.length || 0)) }).map((_, i) => (
//                     <tr key={`empty-${i}`} className="empty-item-row">
//                       <td style={{
//                         height: '6.5mm',
//                         borderLeft: '0.35mm solid #111111',
//                         borderRight: '0.35mm solid #111111',
//                         padding: '1.3mm 1mm',
//                         verticalAlign: 'middle',
//                         borderTop: 'none',
//                         borderBottom: 'none'
//                       }}></td>
//                       <td style={{
//                         height: '6.5mm',
//                         borderLeft: '0.35mm solid #111111',
//                         borderRight: '0.35mm solid #111111',
//                         padding: '1.3mm 1mm',
//                         verticalAlign: 'middle',
//                         borderTop: 'none',
//                         borderBottom: 'none'
//                       }}></td>
//                       <td style={{
//                         height: '6.5mm',
//                         borderLeft: '0.35mm solid #111111',
//                         borderRight: '0.35mm solid #111111',
//                         padding: '1.3mm 1mm',
//                         verticalAlign: 'middle',
//                         borderTop: 'none',
//                         borderBottom: 'none'
//                       }}></td>
//                       <td style={{
//                         height: '6.5mm',
//                         borderLeft: '0.35mm solid #111111',
//                         borderRight: '0.35mm solid #111111',
//                         padding: '1.3mm 1mm',
//                         verticalAlign: 'middle',
//                         borderTop: 'none',
//                         borderBottom: 'none'
//                       }}></td>
//                       <td style={{
//                         height: '6.5mm',
//                         borderLeft: '0.35mm solid #111111',
//                         borderRight: '0.35mm solid #111111',
//                         padding: '1.3mm 1mm',
//                         verticalAlign: 'middle',
//                         borderTop: 'none',
//                         borderBottom: 'none'
//                       }}></td>
//                       <td style={{
//                         height: '6.5mm',
//                         borderLeft: '0.35mm solid #111111',
//                         borderRight: '0.35mm solid #111111',
//                         padding: '1.3mm 1mm',
//                         verticalAlign: 'middle',
//                         borderTop: 'none',
//                         borderBottom: 'none'
//                       }}></td>
//                     </tr>
//                   ))}
                  
//                   {/* LAST ROW - BOTTOM BORDER */}
//                   <tr>
//                     <td style={{
//                       height: '1mm',
//                       borderLeft: '0.35mm solid #111111',
//                       borderRight: '0.35mm solid #111111',
//                       borderBottom: '0.35mm solid #111111',
//                       padding: 0
//                     }}></td>
//                     <td style={{
//                       height: '1mm',
//                       borderLeft: '0.35mm solid #111111',
//                       borderRight: '0.35mm solid #111111',
//                       borderBottom: '0.35mm solid #111111',
//                       padding: 0
//                     }}></td>
//                     <td style={{
//                       height: '1mm',
//                       borderLeft: '0.35mm solid #111111',
//                       borderRight: '0.35mm solid #111111',
//                       borderBottom: '0.35mm solid #111111',
//                       padding: 0
//                     }}></td>
//                     <td style={{
//                       height: '1mm',
//                       borderLeft: '0.35mm solid #111111',
//                       borderRight: '0.35mm solid #111111',
//                       borderBottom: '0.35mm solid #111111',
//                       padding: 0
//                     }}></td>
//                     <td style={{
//                       height: '1mm',
//                       borderLeft: '0.35mm solid #111111',
//                       borderRight: '0.35mm solid #111111',
//                       borderBottom: '0.35mm solid #111111',
//                       padding: 0
//                     }}></td>
//                     <td style={{
//                       height: '1mm',
//                       borderLeft: '0.35mm solid #111111',
//                       borderRight: '0.35mm solid #111111',
//                       borderBottom: '0.35mm solid #111111',
//                       padding: 0
//                     }}></td>
//                   </tr>
//                 </tbody>
//               </table>

//               {/* TOTAL ROW - NO VERTICAL LINE */}
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
//                 <span style={{
//                   padding: '3mm 0',
//                   height: '100%',
//                   display: 'flex',
//                   alignItems: 'center',
//                   paddingLeft: '4mm'
//                 }}>TOTAL</span>
//                 <strong style={{
//                   textAlign: 'right',
//                   paddingRight: '4mm',
//                   fontSize: '11px'
//                 }}>Rs {currency(previewData.total || 0)}</strong>
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
//                   <div className="terms-content" style={{
//                     marginTop: '3mm',
//                     whiteSpace: 'pre-wrap',
//                     lineHeight: '1.5'
//                   }}>{previewData.terms}</div>
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
//         /* =========================================================
//            QUOTATION PAGE
//         ========================================================= */

//         * {
//           box-sizing: border-box;
//         }

//         .quotation-page {
//           width: 100%;
//           min-height: 100vh;
//           background: #f3f4f6;
//           padding: 30px;
//           font-family: Arial, Helvetica, sans-serif;
//           color: #111;
//         }

//         .quotation-editor {
//           max-width: 1100px;
//           margin: 0 auto 35px;
//           background: #ffffff;
//           border-radius: 12px;
//           padding: 25px;
//           box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
//         }

//         .quotation-editor-header {
//           display: flex;
//           align-items: center;
//           justify-content: space-between;
//           gap: 20px;
//           margin-bottom: 25px;
//         }

//         .quotation-editor-header h1 {
//           margin: 0 0 5px;
//           font-size: 28px;
//         }

//         .quotation-editor-header p {
//           margin: 0;
//           color: #666;
//           font-size: 14px;
//         }

//         .quotation-editor-actions {
//           display: flex;
//           gap: 10px;
//           flex-wrap: wrap;
//         }

//         .btn {
//           border: none;
//           border-radius: 7px;
//           padding: 11px 18px;
//           cursor: pointer;
//           font-size: 14px;
//           font-weight: 600;
//         }

//         .btn:disabled {
//           opacity: 0.6;
//           cursor: not-allowed;
//         }

//         .btn-primary {
//           background: #062d73;
//           color: #fff;
//         }

//         .btn-secondary {
//           background: #e5e7eb;
//           color: #111;
//         }

//         .btn-dark {
//           background: #111827;
//           color: #fff;
//         }

//         .btn-small {
//           padding: 8px 14px;
//         }

//         .quotation-alert {
//           padding: 12px 15px;
//           border-radius: 7px;
//           margin-bottom: 20px;
//           font-size: 14px;
//         }

//         .quotation-success {
//           background: #dcfce7;
//           color: #166534;
//         }

//         .quotation-error {
//           background: #fee2e2;
//           color: #991b1b;
//         }

//         .editor-section {
//           border: 1px solid #e5e7eb;
//           border-radius: 9px;
//           padding: 20px;
//           margin-bottom: 20px;
//         }

//         .editor-section h2 {
//           margin: 0 0 18px;
//           font-size: 17px;
//         }

//         .editor-grid {
//           display: grid;
//           grid-template-columns: repeat(2, minmax(0, 1fr));
//           gap: 16px;
//         }

//         .field {
//           display: flex;
//           flex-direction: column;
//           gap: 6px;
//         }

//         .field-full {
//           grid-column: 1 / -1;
//         }

//         .field label {
//           font-size: 13px;
//           font-weight: 600;
//           color: #374151;
//         }

//         .field input,
//         .field textarea,
//         .field select {
//           width: 100%;
//           border: 1px solid #d1d5db;
//           border-radius: 6px;
//           padding: 10px 11px;
//           outline: none;
//           font-size: 14px;
//           font-family: inherit;
//           background: #fff;
//         }

//         .field textarea {
//           resize: vertical;
//         }

//         .field input:focus,
//         .field textarea:focus,
//         .field select:focus {
//           border-color: #062d73;
//           box-shadow: 0 0 0 2px rgba(6, 45, 115, 0.08);
//         }

//         .items-heading {
//           display: flex;
//           align-items: center;
//           justify-content: space-between;
//           margin-bottom: 15px;
//           flex-wrap: wrap;
//           gap: 10px;
//         }

//         .items-heading h2 {
//           margin: 0;
//         }

//         .items-editor {
//           display: flex;
//           flex-direction: column;
//           gap: 10px;
//         }

//         /* =========================================================
//            PRINT - FIXED
//         ========================================================= */

//         @media print {
//           @page {
//             size: A4;
//             margin: 0;
//           }

//           html,
//           body {
//             margin: 0 !important;
//             padding: 0 !important;
//             background: #ffffff !important;
//           }

//           body {
//             -webkit-print-color-adjust: exact !important;
//             print-color-adjust: exact !important;
//           }

//           .quotation-page {
//             margin: 0;
//             padding: 0;
//             background: #ffffff;
//           }

//           .no-print {
//             display: none !important;
//           }

//           #quotation-pdf-content {
//             display: block !important;
//             width: 210mm !important;
//             min-height: 297mm !important;
//             margin: 0 auto !important;
//             padding: 12mm 8mm 8mm !important;
//             box-shadow: none !important;
//             page-break-after: always !important;
//             background: #ffffff !important;
//           }

//           .quote-to-title {
//             background: #062d73 !important;
//             color: #ffffff !important;
//           }

//           .quote-bottom {
//             color: #c00000 !important;
//             border: 0.35mm solid #062d73 !important;
//           }

//           .quote-table th {
//             background: #f5f5f5 !important;
//             border-left: 0.35mm solid #111111 !important;
//             border-right: 0.35mm solid #111111 !important;
//             border-top: 0.35mm solid #111111 !important;
//             border-bottom: 0.35mm solid #111111 !important;
//           }

//           .quote-table td {
//             border-left: 0.35mm solid #111111 !important;
//             border-right: 0.35mm solid #111111 !important;
//             border-top: none !important;
//             border-bottom: none !important;
//           }

//           .quote-table tbody tr:last-child td {
//             border-bottom: 0.35mm solid #111111 !important;
//           }

//           .subtotal-row {
//             border: 0.35mm solid #062d73 !important;
//             border-top: 0 !important;
//           }

//           .terms-section {
//             border: 0.35mm solid #062d73 !important;
//             border-top: 0 !important;
//           }

//           .project-row {
//             border: 0.35mm solid #062d73 !important;
//           }
//         }

//         @media (max-width: 900px) {
//           .quotation-page {
//             padding: 15px;
//           }

//           #quotation-pdf-content {
//             transform-origin: top center;
//             width: 210mm;
//             max-width: 100%;
//             overflow-x: auto;
//           }

//           .quotation-modal-content {
//             max-width: 95% !important;
//             max-height: 95vh !important;
//           }

//           .item-editor-row {
//             grid-template-columns: 35px 1fr 1fr !important;
//             overflow-x: auto !important;
//           }

//           .item-editor-row .field {
//             min-width: 80px !important;
//           }
//         }

//         @media (max-width: 650px) {
//           .quotation-editor-header {
//             flex-direction: column;
//             align-items: flex-start;
//           }

//           .editor-grid {
//             grid-template-columns: 1fr;
//           }

//           .field-full {
//             grid-column: auto;
//           }

//           .item-editor-row {
//             grid-template-columns: 1fr !important;
//             overflow-x: auto !important;
//           }

//           .item-number {
//             justify-content: flex-start;
//           }

//           .quotation-modal-content {
//             max-width: 98% !important;
//             max-height: 98vh !important;
//             padding: 0 !important;
//           }
//         }
//       `}} />

//     </div>
//   )
// }





//file in kb

import { useState, useEffect, useRef } from 'react'
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

    const counterRef = ref(
      db,
      `companies/${companyId}/counters/quotation`
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

    const counterRef = ref(
      db,
      `companies/${companyId}/counters/quotation`
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
     CURRENT ITEM
     ============================================================ */

  const [currentItem, setCurrentItem] = useState({
    ...emptyItem
  })

  /* ============================================================
     EDIT PRODUCT STATE
     ============================================================ */

  const [editingProductIndex, setEditingProductIndex] =
    useState(null)

  const [editProduct, setEditProduct] = useState({
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
     CALCULATE SUBTOTAL
     ============================================================ */

  const calculateSubtotal = () => {

    return items.reduce(
      (sum, item) => {

        const qty =
          Number(item.qty) || 0

        const price =
          Number(item.price) || 0

        return sum + qty * price

      },
      0
    )
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

    if (!currentItem.description.trim()) {

      setError(
        'Product description required'
      )

      return
    }

    const newItem = {

      description:
        currentItem.description.trim(),

      uom:
        currentItem.uom || 'PCS',

      qty:
        Math.max(
          1,
          Number(currentItem.qty) || 1
        ),

      price:
        Math.max(
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

      description:
        item.description || '',

      uom:
        item.uom || 'PCS',

      qty:
        item.qty || 1,

      price:
        item.price === 0 ? '' : item.price
    })
  }

  /* ============================================================
     EDIT PRODUCT - SAVE
     ============================================================ */

  const saveEditProduct = () => {

    if (!editProduct.description.trim()) {

      setError(
        'Product description required'
      )

      return
    }

    const updatedItems = [
      ...items
    ]

    updatedItems[
      editingProductIndex
    ] = {

      description:
        editProduct.description.trim(),

      uom:
        editProduct.uom || 'PCS',

      qty:
        Math.max(
          1,
          Number(editProduct.qty) || 1
        ),

      price:
        Math.max(
          0,
          Number(editProduct.price) || 0
        )
    }

    setItems(updatedItems)

    setEditingProductIndex(null)

    setEditProduct({
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

    setEditingId(
      quotation.id
    )

    setCustomerId(
      quotation.customerId || ''
    )

    setQuotationNumber(
      quotation.quotationNumber || ''
    )

    setDate(
      quotation.date || todayISO()
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

    /* ==========================================================
       COMPANY CHECK
       ========================================================== */

    if (!companyId) {

      setError(
        'Company ID not found'
      )

      return
    }

    /* ==========================================================
       CUSTOMER CHECK
       ========================================================== */

    if (!customerId) {

      setError(
        'Please select a customer'
      )

      return
    }

    /* ==========================================================
       ITEM CHECK
       ========================================================== */

    if (items.length === 0) {

      setError(
        'Add at least one item'
      )

      return
    }

    /* ==========================================================
       CUSTOMER FIND
       ========================================================== */

    const customer =
      customers.find(
        c => c.id === customerId
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

      /* ========================================================
         NEW QUOTATION
         ======================================================== */

      if (!editingId) {

        // Counter increment
        await incrementQuotationCounter(
          companyId
        )

        /* ======================================================
           FALLBACK NUMBER
           ====================================================== */

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

      /* ========================================================
         QUOTATION DATA
         ======================================================== */

      const quotationData = {

        quotationNumber:
          finalQuotationNumber,

        date:
          date || todayISO(),

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

      /* ========================================================
         UPDATE EXISTING
         ======================================================== */

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
            updatedAt: Date.now()
          }
        )

        setSuccess(
          'Quotation updated successfully!'
        )

      } else {

        /* ======================================================
           CREATE NEW
           ====================================================== */

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

      /* ========================================================
         PREVIEW DATA
         ======================================================== */

      setPreviewData({

        ...quotationData,

        id:
          editingId || 'new',

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

      {/* ========================================================
          QUOTATION EDITOR
          ======================================================== */}

      <div className="quotation-editor no-print">

        {/* ======================================================
            HEADER
            ====================================================== */}

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

        {/* ======================================================
            SUCCESS
            ====================================================== */}

        {success && (

          <div className="quotation-alert quotation-success">

            {success}

          </div>

        )}

        {/* ======================================================
            ERROR
            ====================================================== */}

        {error && (

          <div className="quotation-alert quotation-error">

            {error}

          </div>

        )}

        {/* ======================================================
            QUOTATION LIST
            ====================================================== */}

        {loading ? (

          <Loader />

        ) : quotations.length === 0 ? (

          <div
            style={{
              textAlign: 'center',
              padding: '40px 0',
              color: '#666'
            }}
          >

            <p>
              No quotations yet. Create your first quotation!
            </p>

          </div>

        ) : (

          <div
            style={{
              overflowX: 'auto',
              marginTop: '20px'
            }}
          >

            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '14px'
              }}
            >

              <thead>

                <tr
                  style={{
                    borderBottom:
                      '2px solid #e5e7eb',
                    textAlign: 'left'
                  }}
                >

                  <th
                    style={{
                      padding: '10px',
                      width: '15%'
                    }}
                  >
                    #
                  </th>

                  <th
                    style={{
                      padding: '10px',
                      width: '25%'
                    }}
                  >
                    Customer
                  </th>

                  <th
                    style={{
                      padding: '10px',
                      width: '12%'
                    }}
                  >
                    Date
                  </th>

                  <th
                    style={{
                      padding: '10px',
                      width: '10%'
                    }}
                  >
                    Validity
                  </th>

                  <th
                    style={{
                      padding: '10px',
                      width: '13%'
                    }}
                  >
                    Total
                  </th>

                  <th
                    style={{
                      padding: '10px',
                      width: '25%',
                      textAlign: 'right'
                    }}
                  >
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody>

                {quotations.map(
                  (q, index) => (

                    <tr
                      key={q.id}
                      style={{
                        borderBottom:
                          '1px solid #e5e7eb'
                      }}
                    >

                      <td
                        style={{
                          padding: '10px'
                        }}
                      >
                        {q.quotationNumber}
                      </td>

                      <td
                        style={{
                          padding: '10px'
                        }}
                      >

                        <div
                          style={{
                            fontWeight: 600
                          }}
                        >
                          {q.customerName}
                        </div>

                        <div
                          style={{
                            fontSize: '12px',
                            color: '#666'
                          }}
                        >
                          {q.customerCompany}
                        </div>

                      </td>

                      <td
                        style={{
                          padding: '10px'
                        }}
                      >
                        {q.date}
                      </td>

                      <td
                        style={{
                          padding: '10px'
                        }}
                      >
                        {q.validity || '-'}
                      </td>

                      <td
                        style={{
                          padding: '10px',
                          fontWeight: 700
                        }}
                      >
                        Rs {currency(q.total || 0)}
                      </td>

                      <td
                        style={{
                          padding: '10px',
                          textAlign: 'right',
                          whiteSpace: 'nowrap'
                        }}
                      >

                        <button
                          onClick={() =>
                            handlePreview(q)
                          }
                          style={{
                            marginRight: '6px',
                            padding: '5px 10px',
                            border: 'none',
                            borderRadius: '4px',
                            background: '#062d73',
                            color: '#fff',
                            cursor: 'pointer',
                            fontSize: '12px',
                            display: 'inline-block'
                          }}
                        >
                          View
                        </button>

                        <button
                          onClick={() =>
                            openEditQuotation(q)
                          }
                          style={{
                            marginRight: '6px',
                            padding: '5px 10px',
                            border: 'none',
                            borderRadius: '4px',
                            background: '#e5e7eb',
                            color: '#111',
                            cursor: 'pointer',
                            fontSize: '12px',
                            display: 'inline-block'
                          }}
                        >
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            deleteQuotation(q.id)
                          }
                          style={{
                            marginRight: '6px',
                            padding: '5px 10px',
                            border: 'none',
                            borderRadius: '4px',
                            background: '#fee2e2',
                            color: '#dc2626',
                            cursor: 'pointer',
                            fontSize: '12px',
                            display: 'inline-block'
                          }}
                        >
                          Delete
                        </button>

                        <button
                          onClick={() =>
                            handleSavePdf(q)
                          }
                          disabled={
                            generatingPdf
                          }
                          style={{
                            padding: '5px 10px',
                            border: 'none',
                            borderRadius: '4px',
                            background: '#dc2626',
                            color: '#fff',
                            cursor:
                              generatingPdf
                                ? 'not-allowed'
                                : 'pointer',
                            opacity:
                              generatingPdf
                                ? 0.6
                                : 1,
                            fontSize: '12px',
                            display: 'inline-block'
                          }}
                        >
                          {generatingPdf
                            ? '⏳'
                            : '📄 PDF'}
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
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor:
              'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            overflow: 'auto'
          }}
        >

          <div
            className="quotation-modal-content"
            style={{
              backgroundColor: '#fff',
              borderRadius: '12px',
              maxWidth: '1000px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow:
                '0 20px 60px rgba(0,0,0,0.3)'
            }}
          >

            {/* ==================================================
                MODAL HEADER
                ================================================== */}

            <div
              style={{
                padding: '20px 25px',
                borderBottom:
                  '1px solid #e5e7eb',
                display: 'flex',
                justifyContent:
                  'space-between',
                alignItems: 'center',
                flexShrink: 0,
                backgroundColor: '#fff',
                borderTopLeftRadius: '12px',
                borderTopRightRadius: '12px'
              }}
            >

              <h2
                style={{
                  margin: 0,
                  fontSize: '20px',
                  fontWeight: 700
                }}
              >
                {editingId
                  ? 'Edit Quotation'
                  : 'New Quotation'}
              </h2>

              <button
                onClick={() => {
                  setShowForm(false)
                  resetForm()
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#666',
                  padding: '0 10px'
                }}
              >
                ✕
              </button>

            </div>

            {/* ==================================================
                MODAL BODY
                ================================================== */}

            <div
              style={{
                padding: '20px 25px',
                overflowY: 'auto',
                flex: 1,
                backgroundColor: '#fafafa'
              }}
            >

              <form
                onSubmit={handleSubmit}
              >

                {/* ==================================================
                    CUSTOMER & DETAILS
                    ================================================== */}

                <div
                  className="editor-section"
                  style={{
                    background: '#fff'
                  }}
                >

                  <div className="editor-grid">

                    {/* CUSTOMER */}

                    <div className="field">

                      <label>
                        Customer *
                      </label>

                      <select
                        value={customerId}
                        onChange={e =>
                          setCustomerId(
                            e.target.value
                          )
                        }
                        required
                        style={{
                          width: '100%',
                          padding: '10px',
                          border:
                            '1px solid #d1d5db',
                          borderRadius: '6px'
                        }}
                      >

                        <option value="">
                          Select customer...
                        </option>

                        {customers.map(
                          c => (

                            <option
                              key={c.id}
                              value={c.id}
                            >
                              {c.name}{' '}
                              {c.company
                                ? `- ${c.company}`
                                : ''}
                            </option>

                          )
                        )}

                      </select>

                    </div>

                    {/* QUOTATION NUMBER */}

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
                          background: '#f3f4f6',
                          fontWeight: 'bold'
                        }}
                      />

                      <small
                        style={{
                          color: '#666',
                          fontSize: '11px'
                        }}
                      >
                        Format:
                        QTN-YYYYMMDD-0001
                      </small>

                    </div>

                    {/* DATE */}

                    <div className="field">

                      <label>
                        Date *
                      </label>

                      <input
                        type="date"
                        value={date}
                        onChange={e =>
                          setDate(
                            e.target.value
                          )
                        }
                        required
                      />

                    </div>

                    {/* VALIDITY */}

                    <div className="field">

                      <label>
                        Validity (Days) *
                      </label>

                      <input
                        type="number"
                        min="1"
                        max="365"
                        value={validity}
                        onChange={e =>
                          setValidity(
                            e.target.value
                          )
                        }
                        placeholder="e.g., 30"
                        required
                        style={{
                          width: '100%',
                          padding: '10px',
                          border:
                            '1px solid #d1d5db',
                          borderRadius: '6px'
                        }}
                      />

                      <small
                        style={{
                          color: '#666',
                          fontSize: '11px'
                        }}
                      >
                        Number of days quotation
                        is valid
                        (e.g., 30, 60, 90)
                      </small>

                    </div>

                    {/* PROJECT */}

                    <div
                      className="field field-full"
                    >

                      <label>
                        Project
                      </label>

                      <input
                        type="text"
                        value={project}
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
                    ITEMS
                    ================================================== */}

                <div
                  className="editor-section"
                  style={{
                    background: '#fff'
                  }}
                >

                  <div className="items-heading">

                    <h2>
                      Items
                    </h2>

                    <span
                      style={{
                        fontSize: '14px',
                        color: '#666'
                      }}
                    >
                      Total: Rs{' '}
                      {currency(
                        calculateTotal()
                      )}
                    </span>

                  </div>

                  <div className="items-editor">

                    {/* ADD ITEM ROW */}

                    <div
                      className="item-editor-row"
                      style={{
                        display: 'grid',
                        gridTemplateColumns:
                          '35px 1fr 1fr 80px 70px 90px 120px 70px',
                        gap: '8px',
                        alignItems: 'end',
                        padding: '12px',
                        border:
                          '1px solid #e5e7eb',
                        borderRadius: '8px',
                        background:
                          '#f9fafb',
                        width: '100%'
                      }}
                    >

                      {/* NUMBER */}

                      <div
                        className="item-number"
                        style={{
                          height: '39px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent:
                            'center',
                          fontWeight: 700,
                          color: '#555'
                        }}
                      >
                        <span>
                          #
                        </span>
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
                          placeholder="Description (press Enter for new line)"
                          rows="2"
                          style={{
                            width: '100%',
                            padding: '10px',
                            border:
                              '1px solid #d1d5db',
                            borderRadius: '6px',
                            resize: 'vertical'
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
                            width: '100%',
                            padding: '10px',
                            border:
                              '1px solid #d1d5db',
                            borderRadius: '6px'
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
                            width: '100%',
                            padding: '10px',
                            border:
                              '1px solid #d1d5db',
                            borderRadius: '6px'
                          }}
                        />

                      </div>

                      {/* PRICE - FIXED: No leading zero */}

                      <div className="field">

                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={
                            currentItem.price === 0 ? '' : currentItem.price
                          }
                          onChange={e =>
                            setCurrentItem({
                              ...currentItem,
                              price:
                                e.target.value === '' ? '' : Number(e.target.value)
                            })
                          }
                          placeholder="Price"
                          style={{
                            width: '100%',
                            padding: '10px',
                            border:
                              '1px solid #d1d5db',
                            borderRadius: '6px'
                          }}
                        />

                      </div>

                      {/* CURRENT TOTAL */}

                      <div
                        className="item-total-editor"
                        style={{
                          height: '39px',
                          padding:
                            '5px 8px',
                          display: 'flex',
                          flexDirection:
                            'column',
                          justifyContent:
                            'center',
                          background: '#fff',
                          border:
                            '1px solid #d1d5db',
                          borderRadius: '6px',
                          minWidth: '80px'
                        }}
                      >

                        <span
                          style={{
                            fontSize: '9px',
                            color: '#777'
                          }}
                        >
                          Total
                        </span>

                        <strong
                          style={{
                            fontSize: '12px'
                          }}
                        >
                          Rs{' '}
                          {currency(
                            (
                              Number(
                                currentItem.qty
                              ) || 0
                            ) *
                            (
                              Number(
                                currentItem.price
                              ) || 0
                            )
                          )}
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
                          height: '39px',
                          minWidth: '60px',
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
                        maxHeight: '250px',
                        overflowY: 'auto',
                        marginTop: '10px'
                      }}
                    >

                      {items.length === 0 ? (

                        <div
                          style={{
                            textAlign: 'center',
                            padding: '30px',
                            color: '#999',
                            fontSize: '14px'
                          }}
                        >
                          No items added yet.
                          Add products above.
                        </div>

                      ) : (

                        items.map(
                          (item, index) => (

                            <div
                              key={index}
                              className="item-editor-row"
                              style={{
                                display: 'grid',
                                gridTemplateColumns:
                                  '35px 1fr 1fr 80px 70px 90px 120px 70px',
                                gap: '8px',
                                alignItems: 'center',
                                padding:
                                  '10px 12px',
                                border:
                                  '1px solid #e5e7eb',
                                borderRadius: '8px',
                                background:
                                  '#f9fafb',
                                marginBottom:
                                  '8px',
                                width: '100%'
                              }}
                            >

                              {/* NUMBER */}

                              <div
                                className="item-number"
                                style={{
                                  fontWeight: 700,
                                  color: '#555',
                                  textAlign:
                                    'center'
                                }}
                              >
                                {index + 1}
                              </div>

                              {/* DESCRIPTION */}

                              <div className="field">

                                <div
                                  style={{
                                    padding:
                                      '8px 0',
                                    fontWeight: 500,
                                    whiteSpace:
                                      'pre-wrap',
                                    wordBreak:
                                      'break-word'
                                  }}
                                >
                                  {
                                    item.description
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
                                  {currency(
                                    item.price
                                  )}
                                </div>

                              </div>

                              {/* TOTAL */}

                              <div
                                className="item-total-editor"
                                style={{
                                  height: '39px',
                                  padding:
                                    '5px 8px',
                                  display: 'flex',
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
                                  {currency(
                                    (
                                      item.qty ||
                                      0
                                    ) *
                                    (
                                      item.price ||
                                      0
                                    )
                                  )}
                                </strong>

                              </div>

                              {/* ACTIONS */}

                              <div
                                style={{
                                  display:
                                    'flex',
                                  gap: '4px'
                                }}
                              >

                                {/* EDIT */}

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

                                {/* DELETE */}

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
                    background: '#fff'
                  }}
                >

                  <div
                    className="field field-full"
                  >

                    <label>
                      Terms & Conditions
                    </label>

                    <textarea
                      value={terms}
                      onChange={e =>
                        setTerms(
                          e.target.value
                        )
                      }
                      rows="3"
                      placeholder="Payment terms, delivery, warranty, etc."
                      style={{
                        width: '100%',
                        padding: '10px',
                        border:
                          '1px solid #d1d5db',
                        borderRadius: '6px',
                        resize: 'vertical'
                      }}
                    />

                  </div>

                </div>

                {/* ==================================================
                    ERROR
                    ================================================== */}

                {error && (

                  <div
                    className="quotation-alert quotation-error"
                    style={{
                      marginBottom: '15px'
                    }}
                  >
                    {error}
                  </div>

                )}

                {/* ==================================================
                    FORM BUTTONS
                    ================================================== */}

                <div
                  style={{
                    display: 'flex',
                    gap: '10px',
                    marginTop: '20px',
                    paddingTop: '15px',
                    borderTop:
                      '1px solid #e5e7eb',
                    flexShrink: 0,
                    backgroundColor:
                      '#fff',
                    position: 'sticky',
                    bottom: 0,
                    paddingBottom: '5px'
                  }}
                >

                  <button
                    type="submit"
                    disabled={saving}
                    className="btn btn-primary"
                    style={{
                      flex: 1,
                      padding:
                        '12px 20px',
                      fontSize: '15px'
                    }}
                  >
                    {saving
                      ? 'Saving...'
                      : editingId
                      ? 'Update Quotation'
                      : 'Create Quotation'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false)
                      resetForm()
                    }}
                    className="btn btn-secondary"
                    style={{
                      padding:
                        '12px 25px',
                      fontSize: '15px'
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
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            backgroundColor:
              'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >

          <div
            style={{
              backgroundColor: '#fff',
              borderRadius: '12px',
              padding: '25px',
              maxWidth: '500px',
              width: '100%',
              boxShadow:
                '0 20px 60px rgba(0,0,0,0.3)'
            }}
          >

            {/* HEADER */}

            <div
              style={{
                display: 'flex',
                justifyContent:
                  'space-between',
                alignItems: 'center',
                marginBottom: '20px'
              }}
            >

              <h3
                style={{
                  margin: 0,
                  fontSize: '18px',
                  fontWeight: 700
                }}
              >
                Edit Product
              </h3>

              <button
                onClick={
                  closeEditProduct
                }
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#666'
                }}
              >
                ✕
              </button>

            </div>

            <div
              style={{
                display: 'flex',
                flexDirection:
                  'column',
                gap: '15px'
              }}
            >

              {/* DESCRIPTION */}

              <div>

                <label
                  style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#374151',
                    display: 'block',
                    marginBottom: '5px'
                  }}
                >
                  Description *
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
                  rows="3"
                  placeholder="Product description (multi-line)"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border:
                      '1px solid #d1d5db',
                    borderRadius: '6px',
                    resize: 'vertical'
                  }}
                />

              </div>

              {/* UOM QTY PRICE */}

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    '1fr 1fr 1fr',
                  gap: '10px'
                }}
              >

                {/* UOM */}

                <div>

                  <label
                    style={{
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#374151',
                      display: 'block',
                      marginBottom: '5px'
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
                      width: '100%',
                      padding: '10px',
                      border:
                        '1px solid #d1d5db',
                      borderRadius: '6px'
                    }}
                  />

                </div>

                {/* QTY */}

                <div>

                  <label
                    style={{
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#374151',
                      display: 'block',
                      marginBottom: '5px'
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
                      width: '100%',
                      padding: '10px',
                      border:
                        '1px solid #d1d5db',
                      borderRadius: '6px'
                    }}
                  />

                </div>

                {/* PRICE - FIXED: No leading zero */}

                <div>

                  <label
                    style={{
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#374151',
                      display: 'block',
                      marginBottom: '5px'
                    }}
                  >
                    Price
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={
                      editProduct.price === 0 ? '' : editProduct.price
                    }
                    onChange={e =>
                      setEditProduct({
                        ...editProduct,
                        price:
                          e.target.value === '' ? '' : Number(e.target.value)
                      })
                    }
                    style={{
                      width: '100%',
                      padding: '10px',
                      border:
                        '1px solid #d1d5db',
                      borderRadius: '6px'
                    }}
                  />

                </div>

              </div>

              {/* SAVE PRODUCT */}

              <button
                onClick={
                  saveEditProduct
                }
                disabled={
                  !editProduct.description.trim()
                }
                style={{
                  width: '100%',
                  padding: '12px',
                  border: 'none',
                  borderRadius: '6px',
                  background: '#062d73',
                  color: '#fff',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  marginTop: '10px'
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
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            background:
              'rgba(0,0,0,0.6)',
            overflow: 'auto',
            padding: '20px'
          }}
        >

          <div
            style={{
              maxWidth: '900px',
              margin: '0 auto'
            }}
          >

            {/* ==================================================
                PREVIEW HEADER
                ================================================== */}

            <div
              className="no-print"
              style={{
                display: 'flex',
                justifyContent:
                  'space-between',
                alignItems: 'center',
                marginBottom: '15px'
              }}
            >

              <div>

                <h3
                  style={{
                    color: '#fff',
                    margin: 0
                  }}
                >
                  Quotation Preview
                </h3>

                <p
                  style={{
                    color: '#ccc',
                    margin:
                      '5px 0 0',
                    fontSize: '13px'
                  }}
                >
                  {
                    previewData.quotationNumber
                  }
                </p>

              </div>

              <div
                style={{
                  display: 'flex',
                  gap: '10px'
                }}
              >

                {/* PRINT */}

                <button
                  onClick={() =>
                    window.print()
                  }
                  style={{
                    background: '#fff',
                    color: '#111',
                    padding:
                      '10px 20px',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  🖨 Print
                </button>

                {/* CLOSE */}

                <button
                  onClick={() =>
                    setPreviewData(null)
                  }
                  style={{
                    background:
                      'rgba(255,255,255,0.2)',
                    color: '#fff',
                    padding:
                      '10px 20px',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  ✕ Close
                </button>

              </div>

            </div>

            {/* ==================================================
                A4 QUOTATION CONTENT
                ================================================== */}

            <div
              id="quotation-pdf-content"
              ref={printRef}
              style={{
                background: '#ffffff',
                padding:
                  '12mm 8mm 8mm',
                position: 'relative',
                width: '210mm',
                minHeight: '297mm',
                margin: '0 auto',
                boxShadow:
                  '0 3px 20px rgba(0,0,0,0.12)',
                fontFamily:
                  'Arial, Helvetica, sans-serif',
                color: '#111111',
                boxSizing: 'border-box'
              }}
            >

              {/* ==================================================
                  TITLE
                  ================================================== */}

              <div
                className="quote-heading"
                style={{
                  textAlign: 'center',
                  color: '#062d73',
                  fontSize: '24px',
                  fontWeight: 800,
                  textDecoration:
                    'underline',
                  marginBottom:
                    '8mm'
                }}
              >
                QUOTATION
              </div>

              {/* ==================================================
                  HEADER
                  ================================================== */}

              <div
                className="quote-header"
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    '1fr 1fr 1fr',
                  gap: '5mm',
                  alignItems: 'start',
                  minHeight: '43mm'
                }}
              >

                {/* COMPANY INFO */}

                <div
                  className="company-info"
                  style={{
                    fontSize: '10px',
                    lineHeight: '1.45'
                  }}
                >

                  <div
                    className="company-name"
                    style={{
                      fontWeight: 700,
                      fontSize: '11px',
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

                {/* LOGO */}

                <div
                  className="quote-logo"
                  style={{
                    textAlign: 'center',
                    paddingTop: '2mm'
                  }}
                >

                  <img
                    src={
                      previewData.companyLogo ||
                      '/PN.png'
                    }
                    alt="Company Logo"
                    style={{
                      width: '33mm',
                      height: '33mm',
                      objectFit:
                        'contain',
                      display: 'block',
                      margin: '0 auto'
                    }}
                    onError={e => {
                      e.target.style.display =
                        'none'
                    }}
                  />

                </div>

                {/* QUOTATION INFO */}

                <div
                  className="quote-info"
                  style={{
                    fontSize: '10px',
                    lineHeight: '1.8'
                  }}
                >

                  {/* QUOTE NUMBER */}

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns:
                        '32mm 1fr',
                      gap: '2mm'
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

                  {/* DATE */}

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns:
                        '32mm 1fr',
                      gap: '2mm'
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

                  {/* VALIDITY */}

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns:
                        '32mm 1fr',
                      gap: '2mm'
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
                      {previewData.validity
                        ? `${previewData.validity} Days`
                        : 'N/A'}
                    </span>

                  </div>

                  {/* VALID TILL */}

                  {previewData.validity &&
                    previewData.date && (

                      <div
                        style={{
                          display:
                            'grid',
                          gridTemplateColumns:
                            '32mm 1fr',
                          gap: '2mm'
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

              {/* ==================================================
                  QUOTE TO TITLE
                  ================================================== */}

              <div
                className="quote-to-title"
                style={{
                  background:
                    '#062d73',
                  color:
                    '#ffffff',
                  fontSize: '11px',
                  fontWeight: 700,
                  padding:
                    '2mm 4mm',
                  marginTop:
                    '2mm'
                }}
              >
                QUOTE TO
              </div>

              {/* ==================================================
                  CUSTOMER
                  ================================================== */}

              <div
                className="quote-to-content"
                style={{
                  padding:
                    '3mm 4mm',
                  minHeight:
                    '18mm',
                  fontSize: '10px',
                  lineHeight:
                    '1.7'
                }}
              >

                <strong>
                  {
                    previewData.customer?.name ||
                    ''
                  }
                </strong>

                {previewData.customer?.company && (

                  <div>
                    {
                      previewData.customer.company
                    }
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

              {/* ==================================================
                  PROJECT
                  ================================================== */}

              {previewData.project && (

                <div
                  className="project-row"
                  style={{
                    padding:
                      '2mm 4mm',
                    fontSize: '9px',
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
                  ITEMS TABLE
                  ================================================== */}

              <table
                className="quote-table"
                style={{
                  width: '100%',
                  borderCollapse:
                    'collapse',
                  tableLayout:
                    'fixed',
                  fontSize: '9px',
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

                    {/* # */}

                    <th
                      style={{
                        width: '6%',
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
                        fontSize: '9px',
                        fontWeight: 700,
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

                    {/* DESCRIPTION */}

                    <th
                      className="description-col"
                      style={{
                        width: '55%',
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
                        fontSize: '9px',
                        fontWeight: 700,
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

                    {/* UOM */}

                    <th
                      className="uom-col"
                      style={{
                        width: '9%',
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
                        fontSize: '9px',
                        fontWeight: 700,
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

                    {/* QTY */}

                    <th
                      className="qty-col"
                      style={{
                        width: '10%',
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
                        fontSize: '9px',
                        fontWeight: 700,
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

                    {/* UNIT PRICE */}

                    <th
                      className="price-col"
                      style={{
                        width: '13%',
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
                        fontSize: '9px',
                        fontWeight: 700,
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

                    {/* TOTAL */}

                    <th
                      className="total-col"
                      style={{
                        width: '13%',
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
                        fontSize: '9px',
                        fontWeight: 700,
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

                  {/* ==================================================
                      ACTUAL ITEMS
                      ================================================== */}

                  {(previewData.items || []).map(
                    (item, index) => {

                      const qty =
                        Number(
                          item.qty
                        ) || 0

                      const price =
                        Number(
                          item.price
                        ) || 0

                      const total =
                        qty * price

                      return (

                        <tr key={index}>

                          {/* NUMBER */}

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
                            {index + 1}
                          </td>

                          {/* DESCRIPTION */}

                          <td
                            className="description-col"
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
                              item.description
                            }
                          </td>

                          {/* UOM */}

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

                          {/* QTY */}

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
                            {qty}
                          </td>

                          {/* PRICE */}

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

                          {/* TOTAL */}

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

                  {/* ==================================================
                      EMPTY ROWS
                      ================================================== */}

                  {Array.from({
                    length: Math.max(
                      0,
                      8 -
                        (
                          previewData.items
                            ?.length ||
                          0
                        )
                    )
                  }).map(
                    (_, i) => (

                      <tr
                        key={`empty-${i}`}
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

                  {/* ==================================================
                      LAST ROW - BOTTOM BORDER
                      ================================================== */}

                  <tr>

                    <td
                      style={{
                        height: '1mm',
                        borderLeft:
                          '0.35mm solid #111111',
                        borderRight:
                          '0.35mm solid #111111',
                        borderBottom:
                          '0.35mm solid #111111',
                        padding: 0
                      }}
                    />

                    <td
                      style={{
                        height: '1mm',
                        borderLeft:
                          '0.35mm solid #111111',
                        borderRight:
                          '0.35mm solid #111111',
                        borderBottom:
                          '0.35mm solid #111111',
                        padding: 0
                      }}
                    />

                    <td
                      style={{
                        height: '1mm',
                        borderLeft:
                          '0.35mm solid #111111',
                        borderRight:
                          '0.35mm solid #111111',
                        borderBottom:
                          '0.35mm solid #111111',
                        padding: 0
                      }}
                    />

                    <td
                      style={{
                        height: '1mm',
                        borderLeft:
                          '0.35mm solid #111111',
                        borderRight:
                          '0.35mm solid #111111',
                        borderBottom:
                          '0.35mm solid #111111',
                        padding: 0
                      }}
                    />

                    <td
                      style={{
                        height: '1mm',
                        borderLeft:
                          '0.35mm solid #111111',
                        borderRight:
                          '0.35mm solid #111111',
                        borderBottom:
                          '0.35mm solid #111111',
                        padding: 0
                      }}
                    />

                    <td
                      style={{
                        height: '1mm',
                        borderLeft:
                          '0.35mm solid #111111',
                        borderRight:
                          '0.35mm solid #111111',
                        borderBottom:
                          '0.35mm solid #111111',
                        padding: 0
                      }}
                    />

                  </tr>

                </tbody>

              </table>

              {/* ==================================================
                  TOTAL ROW
                  ================================================== */}

              <div
                className="subtotal-row"
                style={{
                  width: '100%',
                  minHeight: '13mm',
                  border:
                    '0.35mm solid #062d73',
                  borderTop: '0',
                  display: 'grid',
                  gridTemplateColumns:
                    '1fr 45mm',
                  alignItems:
                    'center',
                  fontSize: '10px',
                  fontWeight: 700,
                  paddingLeft: '4mm',
                  backgroundColor:
                    '#f8f9fa'
                }}
              >

                <span
                  style={{
                    padding:
                      '3mm 0',
                    height: '100%',
                    display: 'flex',
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

              {/* ==================================================
                  TERMS
                  ================================================== */}

              {previewData.terms && (

                <div
                  className="terms-section"
                  style={{
                    minHeight:
                      '58mm',
                    border:
                      '0.35mm solid #062d73',
                    borderTop: '0',
                    padding:
                      '3mm 4mm',
                    fontSize: '9px'
                  }}
                >

                  <strong
                    style={{
                      fontSize: '10px'
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

              {/* ==================================================
                  AUTHORIZED SIGNATORY
                  ================================================== */}

              <div
                className="quote-bottom"
                style={{
                  position:
                    'absolute',
                  bottom: '8mm',
                  left: '8mm',
                  right: '8mm',
                  height: '7mm',
                  border:
                    '0.35mm solid #062d73',
                  display: 'flex',
                  alignItems:
                    'center',
                  justifyContent:
                    'center',
                  color: '#c00000',
                  fontSize: '11px',
                  fontWeight: 700,
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

/* =========================================================
   QUOTATION PAGE
   ========================================================= */

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
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.08);
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
  grid-template-columns:
    repeat(2, minmax(0, 1fr));
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
  box-shadow:
    0 0 0 2px rgba(6, 45, 115, 0.08);
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

/* =========================================================
   SCREEN PREVIEW
   ========================================================= */

#quotation-pdf-content {
  background: #ffffff;
}

/* =========================================================
   PRINT
   ========================================================= */

@media print {

  /* -------------------------------------------------------
     A4 PAGE
     ------------------------------------------------------- */

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

  /* -------------------------------------------------------
     HIDE EVERYTHING
     ------------------------------------------------------- */

  body * {
    visibility: hidden !important;
  }

  /* -------------------------------------------------------
     SHOW ONLY QUOTATION
     ------------------------------------------------------- */

  #quotation-pdf-content,
  #quotation-pdf-content * {
    visibility: visible !important;
  }

  /* -------------------------------------------------------
     QUOTATION PAGE
     ------------------------------------------------------- */

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

    padding:
      12mm 8mm 8mm !important;

    background: #ffffff !important;

    box-shadow: none !important;

    overflow: hidden !important;

    box-sizing: border-box !important;

    page-break-after: always !important;
    page-break-inside: avoid !important;
  }

  /* -------------------------------------------------------
     PREVIEW OVERLAY
     ------------------------------------------------------- */

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

  /* -------------------------------------------------------
     OUTER WRAPPER
     ------------------------------------------------------- */

  .quotation-preview-overlay > div {
    max-width: none !important;

    width: 210mm !important;

    margin: 0 !important;

    padding: 0 !important;
  }

  /* -------------------------------------------------------
     HIDE PREVIEW HEADER
     ------------------------------------------------------- */

  .quotation-preview-overlay .no-print {
    display: none !important;
  }

  /* -------------------------------------------------------
     COMPANY / LOGO / INFO
     ------------------------------------------------------- */

  .company-info,
  .quote-logo,
  .quote-info {
    visibility: visible !important;
  }

  /* -------------------------------------------------------
     LOGO
     ------------------------------------------------------- */

  #quotation-pdf-content img {
    visibility: visible !important;

    display: block !important;

    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  /* -------------------------------------------------------
     QUOTE TO
     ------------------------------------------------------- */

  .quote-to-title {
    background: #062d73 !important;

    color: #ffffff !important;

    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  /* -------------------------------------------------------
     PROJECT
     ------------------------------------------------------- */

  .project-row {
    border:
      0.35mm solid #062d73 !important;

    background-color:
      #f8f9fa !important;

    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  /* -------------------------------------------------------
     TABLE
     ------------------------------------------------------- */

  .quote-table {
    width: 100% !important;

    border-collapse:
      collapse !important;

    table-layout:
      fixed !important;
  }

  .quote-table th {
    background:
      #f5f5f5 !important;

    border-left:
      0.35mm solid #111111 !important;

    border-right:
      0.35mm solid #111111 !important;

    border-top:
      0.35mm solid #111111 !important;

    border-bottom:
      0.35mm solid #111111 !important;

    -webkit-print-color-adjust:
      exact !important;

    print-color-adjust:
      exact !important;
  }

  .quote-table td {
    border-left:
      0.35mm solid #111111 !important;

    border-right:
      0.35mm solid #111111 !important;

    border-top:
      none !important;

    border-bottom:
      none !important;
  }

  .quote-table tbody tr:last-child td {
    border-bottom:
      0.35mm solid #111111 !important;
  }

  /* -------------------------------------------------------
     TOTAL
     ------------------------------------------------------- */

  .subtotal-row {
    border:
      0.35mm solid #062d73 !important;

    border-top:
      0 !important;

    background-color:
      #f8f9fa !important;

    -webkit-print-color-adjust:
      exact !important;

    print-color-adjust:
      exact !important;
  }

  /* -------------------------------------------------------
     TERMS
     ------------------------------------------------------- */

  .terms-section {
    border:
      0.35mm solid #062d73 !important;

    border-top:
      0 !important;
  }

  /* -------------------------------------------------------
     AUTHORIZED SIGNATORY
     ------------------------------------------------------- */

  .quote-bottom {
    color:
      #c00000 !important;

    border:
      0.35mm solid #062d73 !important;

    background-color:
      #ffffff !important;

    -webkit-print-color-adjust:
      exact !important;

    print-color-adjust:
      exact !important;
  }

  /* -------------------------------------------------------
     NO EXTRA PAGE
     ------------------------------------------------------- */

  .quotation-page {
    margin: 0 !important;
    padding: 0 !important;
    background: #ffffff !important;
  }
}

/* =========================================================
   TABLET
   ========================================================= */

@media (max-width: 900px) {

  .quotation-page {
    padding: 15px;
  }

  #quotation-pdf-content {
    transform-origin:
      top center;

    width: 210mm;

    max-width: 100%;

    overflow-x: auto;
  }

  .quotation-modal-content {
    max-width: 95% !important;
    max-height: 95vh !important;
  }

  .item-editor-row {
    grid-template-columns:
      35px 1fr 1fr !important;

    overflow-x: auto !important;
  }

  .item-editor-row .field {
    min-width: 80px !important;
  }
}

/* =========================================================
   MOBILE
   ========================================================= */

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
    grid-template-columns:
      1fr !important;

    overflow-x: auto !important;
  }

  .item-number {
    justify-content:
      flex-start;
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