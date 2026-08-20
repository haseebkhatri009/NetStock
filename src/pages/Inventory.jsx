// import { useEffect, useMemo, useState } from 'react'
// import { ref, push, onValue, remove } from 'firebase/database'
// import { Plus, Boxes, Trash2, Search } from 'lucide-react'
// import { db } from '../firebase'
// import { useAuth } from '../context/AuthContext'
// import { CATEGORIES, formatDate, normalizeMac } from '../utils/helpers'
// import { Modal } from './Customers'
// import Loader from '../components/Loader'

// const emptyForm = {
//   category: CATEGORIES[0],
//   customCategory: '',
//   name: '',
//   mac: '',
//   serial: '',
//   description: '',
//   quantity: 1
// }

// export default function Inventory() {
//   const { companyId } = useAuth()
//   const [stock, setStock] = useState(null)
//   const [form, setForm] = useState(emptyForm)
//   const [showForm, setShowForm] = useState(false)
//   const [activeCat, setActiveCat] = useState('All')
//   const [search, setSearch] = useState('')
//   const [saving, setSaving] = useState(false)

//   useEffect(() => {
//     if (!companyId) return
//     const stockRef = ref(db, `companies/${companyId}/stock`)
//     const unsub = onValue(
//       stockRef,
//       (snap) => {
//         const val = snap.val() || {}
//         const list = Object.entries(val)
//           .map(([id, s]) => ({ id, ...s }))
//           .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
//         setStock(list)
//       },
//       (err) => {
//         console.error('stock read failed:', err)
//         setStock([])
//       }
//     )
//     return () => unsub()
//   }, [companyId])

//   const allCategories = useMemo(() => {
//     const dynamic = new Set(CATEGORIES)
//     ;(stock || []).forEach((s) => s.category && dynamic.add(s.category))
//     return ['All', ...Array.from(dynamic)]
//   }, [stock])

//   const filtered = useMemo(() => {
//     if (!stock) return []
//     return stock.filter((s) => {
//       const matchesCat = activeCat === 'All' || s.category === activeCat
//       const q = search.toLowerCase()
//       const matchesSearch =
//         !q ||
//         s.name?.toLowerCase().includes(q) ||
//         s.mac?.toLowerCase().includes(q) ||
//         s.serial?.toLowerCase().includes(q)
//       return matchesCat && matchesSearch
//     })
//   }, [stock, activeCat, search])

//   async function handleSubmit(e) {
//     e.preventDefault()
//     const category = form.category === 'Custom' ? form.customCategory.trim() : form.category
//     if (!category || !form.name.trim()) return
//     setSaving(true)
//     try {
//       const stockRef = ref(db, `companies/${companyId}/stock`)
//       const mac = normalizeMac(form.mac)
//       const qty = mac ? 1 : Math.max(1, Number(form.quantity) || 1)
//       await push(stockRef, {
//         category,
//         name: form.name.trim(),
//         mac: mac || null,
//         serial: form.serial.trim() || null,
//         description: form.description.trim() || null,
//         quantity: qty,
//         status: 'in-stock',
//         addedDate: new Date().toISOString().slice(0, 10),
//         createdAt: Date.now()
//       })
//       setForm(emptyForm)
//       setShowForm(false)
//     } finally {
//       setSaving(false)
//     }
//   }

//   async function handleDelete(id) {
//     if (!confirm('Ye stock item delete karna hai?')) return
//     await remove(ref(db, `companies/${companyId}/stock/${id}`))
//   }

//   return (
//     <div>
//       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
//         <div>
//           <h1 className="font-display text-2xl font-semibold text-ink">Inventory</h1>
//           <p className="text-sm text-slateink mt-0.5">Track your stock by category.</p>
//         </div>
//         <button
//           onClick={() => setShowForm(true)}
//           className="flex items-center gap-2 rounded-lg bg-ink text-white text-sm font-medium px-4 py-2.5 hover:bg-inkSoft transition-colors self-start"
//         >
//           <Plus size={16} /> Add Stock
//         </button>
//       </div>

//       <div className="flex flex-col sm:flex-row gap-3 mb-5">
//         <div className="relative max-w-sm w-full">
//           <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slateink" />
//           <input
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             placeholder="Search name, MAC, serial…"
//             className="input pl-9"
//           />
//         </div>
//         <div className="flex gap-2 overflow-x-auto scrollbar-thin pb-1">
//           {allCategories.map((cat) => (
//             <button
//               key={cat}
//               onClick={() => setActiveCat(cat)}
//               className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-medium border transition-colors ${
//                 activeCat === cat
//                   ? 'bg-ink text-white border-ink'
//                   : 'bg-surface text-slateink border-line hover:border-ink/30'
//               }`}
//             >
//               {cat}
//             </button>
//           ))}
//         </div>
//       </div>

//       {stock === null ? (
//         <Loader />
//       ) : filtered.length === 0 ? (
//         <div className="border border-dashed border-line rounded-2xl py-16 flex flex-col items-center justify-center text-center">
//           <Boxes className="text-slateink mb-3" size={28} />
//           <p className="font-medium text-ink">Koi stock item nahi mila</p>
//           <p className="text-sm text-slateink mt-1">Naya product add karein.</p>
//         </div>
//       ) : (
//         <div className="bg-surface rounded-2xl border border-line shadow-card overflow-hidden">
//           <div className="overflow-x-auto scrollbar-thin">
//             <table className="w-full text-sm">
//               <thead>
//                 <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-slateink">
//                   <th className="px-4 py-3 font-medium">Product</th>
//                   <th className="px-4 py-3 font-medium">Category</th>
//                   <th className="px-4 py-3 font-medium">MAC</th>
//                   <th className="px-4 py-3 font-medium">Serial</th>
//                   <th className="px-4 py-3 font-medium">Qty</th>
//                   <th className="px-4 py-3 font-medium">Status</th>
//                   <th className="px-4 py-3 font-medium">Added</th>
//                   <th className="px-4 py-3 font-medium"></th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {filtered.map((s) => (
//                   <tr key={s.id} className="border-b border-line last:border-0 hover:bg-paper/60">
//                     <td className="px-4 py-3">
//                       <p className="font-medium text-ink">{s.name}</p>
//                       {s.description && (
//                         <p className="text-xs text-slateink max-w-xs truncate">{s.description}</p>
//                       )}
//                     </td>
//                     <td className="px-4 py-3">
//                       <span className="rounded-full bg-teal-light text-teal-dark text-xs font-medium px-2.5 py-1">
//                         {s.category}
//                       </span>
//                     </td>
//                     <td className="px-4 py-3 font-mono text-xs text-ink/80">{s.mac || '—'}</td>
//                     <td className="px-4 py-3 font-mono text-xs text-ink/80">{s.serial || '—'}</td>
//                     <td className="px-4 py-3">{s.quantity}</td>
//                     <td className="px-4 py-3">
//                       <span
//                         className={`rounded-full text-xs font-medium px-2.5 py-1 ${
//                           s.status === 'sold'
//                             ? 'bg-coral-light text-coral'
//                             : 'bg-teal-light text-teal-dark'
//                         }`}
//                       >
//                         {s.status === 'sold' ? 'Sold' : 'In Stock'}
//                       </span>
//                     </td>
//                     <td className="px-4 py-3 text-xs text-slateink font-mono">
//                       {formatDate(s.addedDate)}
//                     </td>
//                     <td className="px-4 py-3 text-right">
//                       <button
//                         onClick={() => handleDelete(s.id)}
//                         className="text-slateink hover:text-coral"
//                         aria-label="Delete stock"
//                       >
//                         <Trash2 size={15} />
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}

//       {showForm && (
//         <Modal title="Add Stock" onClose={() => setShowForm(false)}>
//           <form onSubmit={handleSubmit} className="space-y-4">
//             <label className="block">
//               <span className="text-xs font-medium text-slateink">Category *</span>
//               <select
//                 value={form.category}
//                 onChange={(e) => setForm({ ...form, category: e.target.value })}
//                 className="input mt-1"
//               >
//                 {CATEGORIES.map((c) => (
//                   <option key={c} value={c}>
//                     {c}
//                   </option>
//                 ))}
//                 <option value="Custom">Custom…</option>
//               </select>
//             </label>
//             {form.category === 'Custom' && (
//               <label className="block">
//                 <span className="text-xs font-medium text-slateink">Custom Category Name *</span>
//                 <input
//                   required
//                   value={form.customCategory}
//                   onChange={(e) => setForm({ ...form, customCategory: e.target.value })}
//                   className="input mt-1"
//                   placeholder="e.g. Router"
//                 />
//               </label>
//             )}
//             <label className="block">
//               <span className="text-xs font-medium text-slateink">Product Name *</span>
//               <input
//                 required
//                 value={form.name}
//                 onChange={(e) => setForm({ ...form, name: e.target.value })}
//                 className="input mt-1"
//                 placeholder="e.g. Yealink T31G"
//               />
//             </label>
//             <label className="block">
//               <span className="text-xs font-medium text-slateink">MAC Address (optional)</span>
//               <input
//                 value={form.mac}
//                 onChange={(e) => setForm({ ...form, mac: e.target.value })}
//                 className="input mt-1 font-mono"
//                 placeholder="AA:BB:CC:DD:EE:FF"
//               />
//             </label>
//             <label className="block">
//               <span className="text-xs font-medium text-slateink">Serial Number (optional)</span>
//               <input
//                 value={form.serial}
//                 onChange={(e) => setForm({ ...form, serial: e.target.value })}
//                 className="input mt-1 font-mono"
//                 placeholder="SN-000123"
//               />
//             </label>
//             {!form.mac && (
//               <label className="block">
//                 <span className="text-xs font-medium text-slateink">Quantity</span>
//                 <input
//                   type="number"
//                   min={1}
//                   value={form.quantity}
//                   onChange={(e) => setForm({ ...form, quantity: e.target.value })}
//                   className="input mt-1"
//                 />
//               </label>
//             )}
//             <label className="block">
//               <span className="text-xs font-medium text-slateink">Description (optional)</span>
//               <textarea
//                 value={form.description}
//                 onChange={(e) => setForm({ ...form, description: e.target.value })}
//                 className="input min-h-[70px] mt-1"
//                 placeholder="Notes about this product…"
//               />
//             </label>
//             <button
//               type="submit"
//               disabled={saving}
//               className="w-full rounded-lg bg-teal text-white text-sm font-medium py-2.5 hover:bg-teal-dark transition-colors disabled:opacity-60"
//             >
//               {saving ? 'Saving…' : 'Add to Stock'}
//             </button>
//           </form>
//         </Modal>
//       )}
//     </div>
//   )
// }






// import { useEffect, useMemo, useState, useRef } from 'react'
// import { ref, push, onValue, remove } from 'firebase/database'
// import { Plus, Boxes, Trash2, Search, ChevronDown, X, Package, PackageCheck, PackageX, Layers } from 'lucide-react'
// import { db } from '../firebase'
// import { useAuth } from '../context/AuthContext'
// import { CATEGORIES, formatDate, normalizeMac } from '../utils/helpers'
// import { Modal } from './Customers'
// import Loader from '../components/Loader'

// /* ============================================================
//    HARDCODED PRODUCT NAMES
//    ============================================================ */

// const PRODUCT_NAMES = [
//   'GXP1610',
//   'GXP1610P',
//   'GXP1615',
//   'GXP1625',
//   'GXP1630',
//   'GXP2130',
//   'GXP2140',
//   'GXP2160',
//   'GXP2170',
//   'GXP2200',
//   'GBX20',
//   'GRP2601P',
//   'GRP2602P',
//   'GRP2603P',
//   'GRP2604P',
//   'GRP2612P',
//   'GRP2613P',
//   'GRP2614P',
//   'GRP2615',
//   'GRP2616P',
//   'GRP2624P',
//   'GRP2634P',
//   'GWN7600',
//   'GWN7605',
//   'GWN7630',
//   'GWN7630LR',  
//   'GWN7660',
//   'GWN7660LR',  
//   'GWN7660e',
//   'GWN7664',
//   'GWN7664e',        
//   'GSC3510',
//   'GSC3505',
//   'GSC3516',
//   'GAC2500',
//   'GAC2500E',
//   'GVC3200',
//   'GVC3202',
//   'GVC3210',
//   'GVC3212',
//   'GVC3220',
//   'DP750',
//   'DP752',
//   'DP760',
//   'DP720',
//   'DP730',
//   'WP820',
//   'WP822',
//   'WP825',
//   'WF720',
//   'HT802',
//   'HT812',
//   'HT813',
//   'HT814',
//   'HT818',
//   'HT841',
//   'UCM6300',
//   'UCM6300A',
//   'UCM6302',
//   'UCM6302A',
//   'UCM6304', 
//   'UCM6304A',
//   'UCM6308',
//   'UCM6308A'
// ]

// const emptyForm = {
//   category: CATEGORIES[0],
//   customCategory: '',
//   productName: '',
//   customProductName: '',
//   mac: '',
//   serial: '',
//   description: '',
//   quantity: 1
// }

// export default function Inventory() {
//   const { companyId } = useAuth()
//   const [stock, setStock] = useState(null)
//   const [form, setForm] = useState(emptyForm)
//   const [showForm, setShowForm] = useState(false)
//   const [activeCat, setActiveCat] = useState('All')
//   const [statusFilter, setStatusFilter] = useState('All')
//   const [search, setSearch] = useState('')
//   const [saving, setSaving] = useState(false)
//   const [showGroupedModal, setShowGroupedModal] = useState(false)
  
//   // Searchable dropdown states
//   const [productSearch, setProductSearch] = useState('')
//   const [showDropdown, setShowDropdown] = useState(false)
//   const [isCustomSelected, setIsCustomSelected] = useState(false)
//   const dropdownRef = useRef(null)
//   const inputRef = useRef(null)

//   // Filter products based on search
//   const filteredProducts = useMemo(() => {
//     if (!productSearch.trim()) return PRODUCT_NAMES
//     const q = productSearch.toLowerCase().trim()
//     return PRODUCT_NAMES.filter(p => p.toLowerCase().includes(q))
//   }, [productSearch])

//   // Close dropdown when clicking outside
//   useEffect(() => {
//     function handleClickOutside(event) {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//         setShowDropdown(false)
//       }
//     }
//     document.addEventListener('mousedown', handleClickOutside)
//     return () => document.removeEventListener('mousedown', handleClickOutside)
//   }, [])

//   useEffect(() => {
//     if (!companyId) return
//     const stockRef = ref(db, `companies/${companyId}/stock`)
//     const unsub = onValue(
//       stockRef,
//       (snap) => {
//         const val = snap.val() || {}
//         const list = Object.entries(val)
//           .map(([id, s]) => ({ id, ...s }))
//           .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
//         setStock(list)
//       },
//       (err) => {
//         console.error('stock read failed:', err)
//         setStock([])
//       }
//     )
//     return () => unsub()
//   }, [companyId])

//   const allCategories = useMemo(() => {
//     const dynamic = new Set(CATEGORIES)
//     ;(stock || []).forEach((s) => s.category && dynamic.add(s.category))
//     return ['All', ...Array.from(dynamic)]
//   }, [stock])

//   const filtered = useMemo(() => {
//     if (!stock) return []
//     return stock.filter((s) => {
//       const matchesCat = activeCat === 'All' || s.category === activeCat
      
//       let matchesStatus = true
//       if (statusFilter === 'In Stock') {
//         matchesStatus = s.status !== 'sold'
//       } else if (statusFilter === 'Sold') {
//         matchesStatus = s.status === 'sold'
//       }
      
//       const q = search.toLowerCase()
//       const matchesSearch =
//         !q ||
//         s.name?.toLowerCase().includes(q) ||
//         s.mac?.toLowerCase().includes(q) ||
//         s.serial?.toLowerCase().includes(q)
      
//       return matchesCat && matchesStatus && matchesSearch
//     })
//   }, [stock, activeCat, statusFilter, search])

//   // GROUPED DATA - All, In Stock, Sold combined
//   const groupedData = useMemo(() => {
//     if (!stock) return []
    
//     const grouped = {}
//     stock.forEach((s) => {
//       const name = s.name || 'Unnamed'
//       if (!grouped[name]) {
//         grouped[name] = {
//           name: name,
//           totalQty: 0,
//           inStockQty: 0,
//           soldQty: 0,
//           categories: new Set(),
//           items: []
//         }
//       }
//       const qty = Number(s.quantity) || 0
//       grouped[name].totalQty += qty
//       if (s.status !== 'sold') {
//         grouped[name].inStockQty += qty
//       } else {
//         grouped[name].soldQty += qty
//       }
//       grouped[name].categories.add(s.category)
//       grouped[name].items.push(s)
//     })
    
//     return Object.values(grouped).sort((a, b) => b.totalQty - a.totalQty)
//   }, [stock])

//   // Stats
//   const stats = useMemo(() => {
//     if (!stock) return { total: 0, inStock: 0, sold: 0 }
//     const total = stock.length
//     const inStock = stock.filter(s => s.status !== 'sold').length
//     const sold = stock.filter(s => s.status === 'sold').length
//     return { total, inStock, sold }
//   }, [stock])

//   async function handleSubmit(e) {
//     e.preventDefault()
    
//     let finalProductName = ''
//     if (form.productName && form.productName !== 'Custom') {
//       finalProductName = form.productName
//     } else if (form.customProductName.trim()) {
//       finalProductName = form.customProductName.trim()
//     }
    
//     const category = form.category === 'Custom' ? form.customCategory.trim() : form.category
    
//     if (!category || !finalProductName) {
//       alert('Please select a product name and category')
//       return
//     }
    
//     setSaving(true)
//     try {
//       const stockRef = ref(db, `companies/${companyId}/stock`)
//       const mac = normalizeMac(form.mac)
//       const qty = mac ? 1 : Math.max(1, Number(form.quantity) || 1)
      
//       await push(stockRef, {
//         category,
//         name: finalProductName,
//         mac: mac || null,
//         serial: form.serial.trim() || null,
//         description: form.description.trim() || null,
//         quantity: qty,
//         status: 'in-stock',
//         addedDate: new Date().toISOString().slice(0, 10),
//         createdAt: Date.now()
//       })
//       setForm(emptyForm)
//       setProductSearch('')
//       setShowDropdown(false)
//       setIsCustomSelected(false)
//       setShowForm(false)
//     } finally {
//       setSaving(false)
//     }
//   }

//   async function handleDelete(id) {
//     if (!confirm('Are You sure to delete this')) return
//     await remove(ref(db, `companies/${companyId}/stock/${id}`))
//   }

//   function selectProduct(name) {
//     setForm({ ...form, productName: name, customProductName: '' })
//     setProductSearch(name)
//     setIsCustomSelected(false)
//     setShowDropdown(false)
//   }

//   function selectCustomProduct(searchTerm) {
//     const customName = searchTerm.trim() || 'Custom'
//     setForm({ ...form, productName: 'Custom', customProductName: customName })
//     setProductSearch(customName)
//     setIsCustomSelected(true)
//     setShowDropdown(false)
//   }

//   function clearProduct() {
//     setForm({ ...form, productName: '', customProductName: '' })
//     setProductSearch('')
//     setIsCustomSelected(false)
//     setShowDropdown(false)
//     if (inputRef.current) {
//       inputRef.current.focus()
//     }
//   }

//   function handleInputChange(e) {
//     const value = e.target.value
//     setProductSearch(value)
    
//     if (isCustomSelected) {
//       setIsCustomSelected(false)
//       setForm({ ...form, productName: '', customProductName: '' })
//     }
    
//     if (form.productName && form.productName !== 'Custom') {
//       setForm({ ...form, productName: '', customProductName: '' })
//     }
    
//     setShowDropdown(true)
//   }

//   return (
//     <div>
//       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
//         <div>
//           <h1 className="font-display text-2xl font-semibold text-ink">Inventory</h1>
//           <p className="text-sm text-slateink mt-0.5">Track your stock by category.</p>
//         </div>
//         <div className="flex gap-2">
//           {/* GROUP BUTTON */}
//           <button
//             onClick={() => setShowGroupedModal(true)}
//             className="flex items-center gap-2 rounded-lg bg-teal/10 text-teal-dark border border-teal/20 text-sm font-medium px-4 py-2.5 hover:bg-teal/20 transition-colors"
//           >
//             <Layers size={16} />
//             Group by Product
//           </button>
//           <button
//             onClick={() => setShowForm(true)}
//             className="flex items-center gap-2 rounded-lg bg-ink text-white text-sm font-medium px-4 py-2.5 hover:bg-inkSoft transition-colors self-start"
//           >
//             <Plus size={16} /> Add Stock
//           </button>
//         </div>
//       </div>

//       {/* STATUS FILTER BUTTONS */}
//       <div className="flex flex-wrap gap-2 mb-4">
//         <button
//           onClick={() => setStatusFilter('All')}
//           className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium border transition-colors ${
//             statusFilter === 'All'
//               ? 'bg-ink text-white border-ink'
//               : 'bg-surface text-slateink border-line hover:border-ink/30'
//           }`}
//         >
//           <Package size={15} />
//           All
//           <span className={`text-xs ${statusFilter === 'All' ? 'text-white/70' : 'text-slateink/70'}`}>
//             ({stats.total})
//           </span>
//         </button>
        
//         <button
//           onClick={() => setStatusFilter('In Stock')}
//           className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium border transition-colors ${
//             statusFilter === 'In Stock'
//               ? 'bg-teal text-white border-teal'
//               : 'bg-surface text-slateink border-line hover:border-teal/30'
//           }`}
//         >
//           <PackageCheck size={15} />
//           In Stock
//           <span className={`text-xs ${statusFilter === 'In Stock' ? 'text-white/70' : 'text-slateink/70'}`}>
//             ({stats.inStock})
//           </span>
//         </button>
        
//         <button
//           onClick={() => setStatusFilter('Sold')}
//           className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium border transition-colors ${
//             statusFilter === 'Sold'
//               ? 'bg-coral text-white border-coral'
//               : 'bg-surface text-slateink border-line hover:border-coral/30'
//           }`}
//         >
//           <PackageX size={15} />
//           Sold
//           <span className={`text-xs ${statusFilter === 'Sold' ? 'text-white/70' : 'text-slateink/70'}`}>
//             ({stats.sold})
//           </span>
//         </button>
//       </div>

//       <div className="flex flex-col sm:flex-row gap-3 mb-5">
//         <div className="relative max-w-sm w-full">
//           {/* <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slateink" /> */}
//           <input
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             placeholder="Search name, MAC, serial…"
//             className="input pl-9"
//           />
//         </div>
//         <div className="flex gap-2 overflow-x-auto scrollbar-thin pb-1">
//           {allCategories.map((cat) => (
//             <button
//               key={cat}
//               onClick={() => setActiveCat(cat)}
//               className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-medium border transition-colors ${
//                 activeCat === cat
//                   ? 'bg-ink text-white border-ink'
//                   : 'bg-surface text-slateink border-line hover:border-ink/30'
//               }`}
//             >
//               {cat}
//             </button>
//           ))}
//         </div>
//       </div>

//       {stock === null ? (
//         <Loader />
//       ) : filtered.length === 0 ? (
//         <div className="border border-dashed border-line rounded-2xl py-16 flex flex-col items-center justify-center text-center">
//           <Boxes className="text-slateink mb-3" size={28} />
//           <p className="font-medium text-ink">No stock items found.</p>
//           <p className="text-sm text-slateink mt-1">Add new Product.</p>
//         </div>
//       ) : (
//         <div className="bg-surface rounded-2xl border border-line shadow-card overflow-hidden">
//           <div className="overflow-x-auto scrollbar-thin">
//             <table className="w-full text-sm">
//               <thead>
//                 <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-slateink">
//                   <th className="px-4 py-3 font-medium">Product</th>
//                   <th className="px-4 py-3 font-medium">Category</th>
//                   <th className="px-4 py-3 font-medium">MAC</th>
//                   <th className="px-4 py-3 font-medium">Serial</th>
//                   <th className="px-4 py-3 font-medium">Qty</th>
//                   <th className="px-4 py-3 font-medium">Status</th>
//                   <th className="px-4 py-3 font-medium">Added</th>
//                   <th className="px-4 py-3 font-medium"></th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {filtered.map((s) => (
//                   <tr key={s.id} className="border-b border-line last:border-0 hover:bg-paper/60">
//                     <td className="px-4 py-3">
//                       <p className="font-medium text-ink">{s.name}</p>
//                       {s.description && (
//                         <p className="text-xs text-slateink max-w-xs truncate">{s.description}</p>
//                       )}
//                     </td>
//                     <td className="px-4 py-3">
//                       <span className="rounded-full bg-teal-light text-teal-dark text-xs font-medium px-2.5 py-1">
//                         {s.category}
//                       </span>
//                     </td>
//                     <td className="px-4 py-3 font-mono text-xs text-ink/80">{s.mac || '—'}</td>
//                     <td className="px-4 py-3 font-mono text-xs text-ink/80">{s.serial || '—'}</td>
//                     <td className="px-4 py-3">{s.quantity}</td>
//                     <td className="px-4 py-3">
//                       <span
//                         className={`rounded-full text-xs font-medium px-2.5 py-1 ${
//                           s.status === 'sold'
//                             ? 'bg-coral-light text-coral'
//                             : 'bg-teal-light text-teal-dark'
//                         }`}
//                       >
//                         {s.status === 'sold' ? 'Sold' : 'In Stock'}
//                       </span>
//                     </td>
//                     <td className="px-4 py-3 text-xs text-slateink font-mono">
//                       {formatDate(s.addedDate)}
//                     </td>
//                     <td className="px-4 py-3 text-right">
//                       <button
//                         onClick={() => handleDelete(s.id)}
//                         className="text-slateink hover:text-coral"
//                         aria-label="Delete stock"
//                       >
//                         <Trash2 size={15} />
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}

//       {/* ============================================================
//           GROUPED PRODUCT MODAL
//           ============================================================ */}

//       {showGroupedModal && (
//         <Modal title="Products Grouped by Name" onClose={() => setShowGroupedModal(false)} wide>
//           <div className="overflow-x-auto">
//             <table className="w-full text-sm">
//               <thead>
//                 <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-slateink">
//                   <th className="px-4 py-3 font-medium">#</th>
//                   <th className="px-4 py-3 font-medium">Product Name</th>
//                   <th className="px-4 py-3 font-medium text-center">Total Qty</th>
//                   <th className="px-4 py-3 font-medium text-center text-teal-dark">In Stock</th>
//                   <th className="px-4 py-3 font-medium text-center text-coral">Sold</th>
//                   <th className="px-4 py-3 font-medium">Categories</th>
//                   <th className="px-4 py-3 font-medium">Action</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {groupedData.length === 0 ? (
//                   <tr>
//                     <td colSpan={7} className="text-center py-8 text-slateink">
//                       No products found
//                     </td>
//                   </tr>
//                 ) : (
//                   groupedData.map((group, index) => (
//                     <tr key={index} className="border-b border-line last:border-0 hover:bg-paper/60">
//                       <td className="px-4 py-3 text-center">{index + 1}</td>
//                       <td className="px-4 py-3">
//                         <p className="font-medium text-ink">{group.name}</p>
//                       </td>
//                       <td className="px-4 py-3 text-center">
//                         <span className="font-bold text-ink text-lg">{group.totalQty}</span>
//                       </td>
//                       <td className="px-4 py-3 text-center">
//                         <span className="font-medium text-teal-dark">{group.inStockQty}</span>
//                       </td>
//                       <td className="px-4 py-3 text-center">
//                         <span className="font-medium text-coral">{group.soldQty}</span>
//                       </td>
//                       <td className="px-4 py-3">
//                         <div className="flex flex-wrap gap-1">
//                           {Array.from(group.categories).map((cat) => (
//                             <span key={cat} className="rounded-full bg-teal-light text-teal-dark text-xs font-medium px-2.5 py-1">
//                               {cat}
//                             </span>
//                           ))}
//                         </div>
//                       </td>
//                       <td className="px-4 py-3">
//                         <button
//                           onClick={() => {
//                             setSearch(group.name)
//                             setShowGroupedModal(false)
//                           }}
//                           className="text-teal-dark text-xs font-medium hover:underline"
//                         >
//                           View Items
//                         </button>
//                       </td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//               {groupedData.length > 0 && (
//                 <tfoot>
//                   <tr className="border-t-2 border-line bg-paper">
//                     <td colSpan={2} className="px-4 py-3 font-semibold text-ink">Total</td>
//                     <td className="px-4 py-3 text-center font-bold text-ink">
//                       {groupedData.reduce((sum, g) => sum + g.totalQty, 0)}
//                     </td>
//                     <td className="px-4 py-3 text-center font-bold text-teal-dark">
//                       {groupedData.reduce((sum, g) => sum + g.inStockQty, 0)}
//                     </td>
//                     <td className="px-4 py-3 text-center font-bold text-coral">
//                       {groupedData.reduce((sum, g) => sum + g.soldQty, 0)}
//                     </td>
//                     <td colSpan={2}></td>
//                   </tr>
//                 </tfoot>
//               )}
//             </table>
//           </div>
//         </Modal>
//       )}

//       {showForm && (
//         <Modal title="Add Stock" onClose={() => setShowForm(false)}>
//           <form onSubmit={handleSubmit} className="space-y-4">
            
//             {/* Category */}
//             <label className="block">
//               <span className="text-xs font-medium text-slateink">Category *</span>
//               <select
//                 value={form.category}
//                 onChange={(e) => setForm({ ...form, category: e.target.value })}
//                 className="input mt-1"
//               >
//                 {CATEGORIES.map((c) => (
//                   <option key={c} value={c}>
//                     {c}
//                   </option>
//                 ))}
//                 <option value="Custom">Custom…</option>
//               </select>
//             </label>
            
//             {form.category === 'Custom' && (
//               <label className="block">
//                 <span className="text-xs font-medium text-slateink">Custom Category Name *</span>
//                 <input
//                   required
//                   value={form.customCategory}
//                   onChange={(e) => setForm({ ...form, customCategory: e.target.value })}
//                   className="input mt-1"
//                   placeholder="e.g. Router"
//                 />
//               </label>
//             )}

//             {/* Product Name - SEARCHABLE DROPDOWN */}
//             <label className="block">
//               <span className="text-xs font-medium text-slateink">Product Name *</span>
//               <div className="relative mt-1" ref={dropdownRef}>
//                 <div className="relative">
//                   <input
//                     ref={inputRef}
//                     type="text"
//                     value={productSearch}
//                     onChange={handleInputChange}
//                     onFocus={() => {
//                       if (!isCustomSelected) {
//                         setShowDropdown(true)
//                       }
//                     }}
//                     placeholder="Search or type product name…"
//                     className="input w-full pr-10"
//                   />
//                   {productSearch && (
//                     <button
//                       type="button"
//                       onClick={clearProduct}
//                       className="absolute right-9 top-1/2 -translate-y-1/2 text-slateink hover:text-coral"
//                     >
//                       <X size={14} />
//                     </button>
//                   )}
//                   <button
//                     type="button"
//                     onClick={() => {
//                       if (!isCustomSelected) {
//                         setShowDropdown(!showDropdown)
//                       }
//                     }}
//                     className="absolute right-3 top-1/2 -translate-y-1/2 text-slateink hover:text-ink"
//                   >
//                     <ChevronDown size={16} />
//                   </button>
//                 </div>

//                 {/* Selected product display */}
//                 {form.productName && form.productName !== 'Custom' && (
//                   <p className="text-xs text-teal-dark mt-1">
//                     Selected: <strong>{form.productName}</strong>
//                   </p>
//                 )}
//                 {form.productName === 'Custom' && form.customProductName && (
//                   <p className="text-xs text-teal-dark mt-1">
//                     Custom product: <strong>{form.customProductName}</strong>
//                   </p>
//                 )}

//                 {/* Dropdown */}
//                 {showDropdown && !isCustomSelected && (
//                   <div className="absolute z-50 w-full mt-1 bg-white border border-line rounded-lg shadow-lg max-h-60 overflow-y-auto">
//                     {filteredProducts.length > 0 ? (
//                       <>
//                         {filteredProducts.map((p) => (
//                           <div
//                             key={p}
//                             onClick={() => selectProduct(p)}
//                             className="px-4 py-2.5 hover:bg-teal-light cursor-pointer text-sm text-ink transition-colors"
//                           >
//                             {p}
//                           </div>
//                         ))}
//                         {!PRODUCT_NAMES.includes(productSearch.trim()) && productSearch.trim() && !isCustomSelected && (
//                           <div
//                             onClick={() => selectCustomProduct(productSearch)}
//                             className="px-4 py-2.5 hover:bg-teal-light cursor-pointer text-sm text-teal-dark border-t border-line font-medium"
//                           >
//                             + Add "{productSearch.trim()}" as new product
//                           </div>
//                         )}
//                       </>
//                     ) : (
//                       !isCustomSelected && (
//                         <div
//                           onClick={() => selectCustomProduct(productSearch)}
//                           className="px-4 py-3 hover:bg-teal-light cursor-pointer text-sm text-teal-dark"
//                         >
//                           + Add "{productSearch.trim() || 'Custom'}" as new product
//                         </div>
//                       )
//                     )}
//                   </div>
//                 )}
//               </div>
//             </label>

//             <label className="block">
//               <span className="text-xs font-medium text-slateink">MAC Address (optional)</span>
//               <input
//                 value={form.mac}
//                 onChange={(e) => setForm({ ...form, mac: e.target.value })}
//                 className="input mt-1 font-mono"
//                 placeholder="AA:BB:CC:DD:EE:FF"
//               />
//             </label>

//             <label className="block">
//               <span className="text-xs font-medium text-slateink">Serial Number (optional)</span>
//               <input
//                 value={form.serial}
//                 onChange={(e) => setForm({ ...form, serial: e.target.value })}
//                 className="input mt-1 font-mono"
//                 placeholder="SN-000123"
//               />
//             </label>

//             {!form.mac && (
//               <label className="block">
//                 <span className="text-xs font-medium text-slateink">Quantity</span>
//                 <input
//                   type="number"
//                   min={1}
//                   value={form.quantity}
//                   onChange={(e) => setForm({ ...form, quantity: e.target.value })}
//                   className="input mt-1"
//                 />
//               </label>
//             )}

//             <label className="block">
//               <span className="text-xs font-medium text-slateink">Description (optional)</span>
//               <textarea
//                 value={form.description}
//                 onChange={(e) => setForm({ ...form, description: e.target.value })}
//                 className="input min-h-[70px] mt-1"
//                 placeholder="Notes about this product…"
//               />
//             </label>

//             <button
//               type="submit"
//               disabled={saving}
//               className="w-full rounded-lg bg-teal text-white text-sm font-medium py-2.5 hover:bg-teal-dark transition-colors disabled:opacity-60"
//             >
//               {saving ? 'Saving…' : 'Add to Stock'}
//             </button>
//           </form>
//         </Modal>
//       )}
//     </div>
//   )
// }









import { useEffect, useMemo, useState, useRef } from 'react'
import { ref, push, onValue, remove } from 'firebase/database'
import { Plus, Boxes, Trash2, Search, ChevronDown, X, Package, PackageCheck, PackageX, Layers } from 'lucide-react'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'
import { CATEGORIES, formatDate, normalizeMac } from '../utils/helpers'
import { Modal } from './Customers'
import Loader from '../components/Loader'

/* ============================================================
   HARDCODED PRODUCT NAMES
   ============================================================ */

const PRODUCT_NAMES = [
  'GXP1610',
  'GXP1610P',
  'GXP1615',
  'GXP1625',
  'GXP1630',
  'GXP2130',
  'GXP2140',
  'GXP2160',
  'GXP2170',
  'GXP2200',
  'GBX20',
  'GRP2601P',
  'GRP2602P',
  'GRP2603P',
  'GRP2604P',
  'GRP2612P',
  'GRP2613P',
  'GRP2614P',
  'GRP2615',
  'GRP2616P',
  'GRP2624P',
  'GRP2634P',
  'GWN7600',
  'GWN7605',
  'GWN7630',
  'GWN7630LR',  
  'GWN7660',
  'GWN7660LR',  
  'GWN7660e',
  'GWN7664',
  'GWN7664e',        
  'GSC3510',
  'GSC3505',
  'GSC3516',
  'GAC2500',
  'GAC2500E',
  'GVC3200',
  'GVC3202',
  'GVC3210',
  'GVC3212',
  'GVC3220',
  'DP750',
  'DP752',
  'DP760',
  'DP720',
  'DP730',
  'WP820',
  'WP822',
  'WP825',
  'WF720',
  'HT802',
  'HT812',
  'HT813',
  'HT814',
  'HT818',
  'HT841',
  'UCM6300',
  'UCM6300A',
  'UCM6302',
  'UCM6302A',
  'UCM6304', 
  'UCM6304A',
  'UCM6308',
  'UCM6308A'
]

/* ============================================================
   PRODUCT IMAGES MAPPING
   ============================================================ */

const PRODUCT_IMAGES = {
  'GXP1610': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQhSd0SRaS7ZtX1nzZ3LxekNFxVfQM_Z-sA4_NO-KNTiw&s',
  'GXP1610P': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQhSd0SRaS7ZtX1nzZ3LxekNFxVfQM_Z-sA4_NO-KNTiw&s',
  'GXP1615': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQhSd0SRaS7ZtX1nzZ3LxekNFxVfQM_Z-sA4_NO-KNTiw&s',
  'GXP1625': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQhSd0SRaS7ZtX1nzZ3LxekNFxVfQM_Z-sA4_NO-KNTiw&s',
  'GXP1630': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRjgSA65ZdqSPQl5atmKQzjUz2c8ayQbYXP1U8qwvHkCw&s=10',
  'GXP2130': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTzN3qyIxCBQ43HxhGtR6h81HtuXqZsF47SxoCfThzo2Q&s=10',
  'GXP2140': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRS3SbhslyL-S0klXQNQMFxLsyEUWexhIZMk2KvguLA3A&s=10',
  'GXP2160': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4TV9sKCidvSqTFDHBrMQojvdmi4oYdBsoxWR5k-z1Pw&s=10',
  'GXP2170': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRWQGmiDiHgdCxHtVNo9lNPTje4H2qBQ3LfvMNDHkiKAQ&s=10',
  'GXP2200': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTnH0sgPzAgRvjL_aCkl6pjvQHagUnJ3V6Q8oKUlAPkMw&s',
  'GBX20': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSZysabNyHr8cnEN-vyvJzKBNszdtU0V1tO67hsky_JIA&s',
  'GRP2601P': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSIQsz_pSIKsZ753LoC-_bjHW4dUxI9E3yPgOadLwLOPA&s=10',
  'GRP2602P': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT-EY1nPb7QvxbUBj1aalJDgwaip1-e66yIphKi7p5jpA&s=10',
  'GRP2603P': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSYAPPu7jjyOa7mQ8PBTXJ7KMM0vYlxFZlg2INCDinYoQ&s=10',
  'GRP2604P': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSExtN8GudHcvN2juwCJY74c-eUXtmo9r9YzBvmPgX9lA&s=10',
  'GRP2612P': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRULPF9teoDAwkSM3CAaURW9jfcJTiAvFubBBZ2PpxG2w&s=10',
  'GRP2613P': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRwZLwZVF-VyE_WdrdJ3nc7HeHLOcnAobSJi8XNHNV7Zw&s=10',
  'GRP2614P': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRw4vD0OPlts9cavrSBZ1wqYVu7Nw7UKXrwBITFjt9Tfg&s=10',
  'GRP2615': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRmha9Tr1hQXhT0gtAW6P9CtJeoevtwjODIwTjZzWqfSw&s=10',
  'GRP2616P': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTdGCuPvZycn4cC5fT7XVOoGGq8HkCsTKfBenkolb47AQ&s=10',
  'GRP2624P': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTKNU81e5b0sqm6Tj1-D-95A_ttt1hWZsjNFEDi3OjGIQ&s=10',
  'GRP2634P': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQEEcSxPoUZnQ-w6bKaaxR8bbQ8CrL60C7bNV3VQlxlIA&s=10',
  'GWN7600': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ64VKR6Ih5Kp044lyJewroCh2NQA2OMq2TKf-Zi2t6Gw&s',
  'GWN7605': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS0uGSmdSQdmP_Dy89IIs3L55wXAkGBLhqSpG_LuZjRKg&s=10',
  'GWN7630': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR4wL_SbkGYml03wz9XkvshYqNjJRQbvBJfVIo_O2dYJA&s=10',
  'GWN7630LR': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSvMZu3WyY7G37ZM85d6w9E0wEBae2UlyOY0qFMM4IyQQ&s=10',
  'GWN7660': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQhnAvYE-RTQpT5xDoMOfQ37hWcAAqaQ51ClgeY-GRVsg&s=10',
  'GWN7660LR': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcREA9LYVNBjrD3rzKHxibjnzFCT92Low2MYspPbhMfrsg&s=10',
  'GWN7660e': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQtw_Y4gB8WPc0wgqlkupaFYMgTDqT2BsbMpABkW6vdVw&s=10',
  'GWN7664': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTIGeh0z7oVPvJl7t7-lEIuAQ_R5Mqyue962mw3YSldPw&s=10',
  'GWN7664e': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTIGeh0z7oVPvJl7t7-lEIuAQ_R5Mqyue962mw3YSldPw&s=10',
  'GSC3510': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ18SYzM1U_RQRfIQ3anPlROU_9edx16v1XAXvl8VLWug&s',
  'GSC3505': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ18SYzM1U_RQRfIQ3anPlROU_9edx16v1XAXvl8VLWug&s',
  'GSC3516': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ4IpfpFFfWEwRkd9oMOLojVChRsjIJemSbBBRjC9XyKw&s=10',
  'GAC2500': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ6oKxeycdy-bDkgnnhjtG1ZDXE4j9UT_5yOcd71KMeqA&s',
  'GAC2500E': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ6oKxeycdy-bDkgnnhjtG1ZDXE4j9UT_5yOcd71KMeqA&s',
  'GVC3200': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRTEmIXXEyVFEVmbb8mz6m20t7Fwo0_mJxf0Psua4IDig&s=10',
  'GVC3202': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRQ7xnG1ferjfpbeyo31U7TPV-Fo1M4rbz-wdarGrqPHA&s=10',
  'GVC3210': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTYaw67rJ-7tno4ShEVpTF-OLt__lFvpIwWFcE1TZb9bg&s=10',
  'GVC3212': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcThnzqFhbPxNalHUg8aqV-G13bdE5ws-QfU97t6hmKdfg&s=10',
  'GVC3220': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTIB3dh2xuc81atqSwj4cqIWSTB9D6Dv1hm3h9YUDkv-w&s',
  'DP750': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ0jY7DkzHufp2GzajGI5JF1nyCZ7NaSTTiHSxGWXGC-w&s',
  'DP752': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT33RPZO_HZv69-boUqFqfJw3lez85EvGnAGWmsa41uYA&s=10',
  'DP760': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSrfmipQdoCRmXWoO2Lef07AeMezsPxMAd6VLX2l-R9vw&s=10',
  'DP720': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcThTYjm_H3sQosXpG4T-X6prR3sOkcQQRoOzh4uDB1zPA&s',
  'DP730': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR8qXucUPdcOasO6pGl4EJIIpXnrtzaAms-VA7kLDPwzw&s',
  'WP810': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ2GGWflZwa0SqSOQrGEvQq3ou0essqC0HL7IbW0POtIA&s=10',
  'WP820': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSVBhSwnJlwhpUesYK_q27i2Ib_CmTTzhVnrCF9fLFbbw&s=10',
  'WP822': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTCzu7yLCtO8Qn33pZzLwkMCmGfrqXqmHMJMFWMlNwDjw&s=10',
  'WP825': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQnEuNFLOWN35x3_3Hr-3MO701DiLhSwfysm4GXrzw2xA&s=10',
  'WF720': '/images/wf720.png',
  'HT802': '/images/ht802.png',
  'HT812': '/images/ht812.png',
  'HT813': '/images/ht813.png',
  'HT814': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRbm2YhMLJOFfdC92ik2F1nUVUp5QTNHk2YktVrl6LmNQ&s=10',
  'HT818': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRCdolCIWQqCnddufBDMF3PS2WvYpT9tGr_RFG7rxXQgA&s=10',
  'HT841': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSy9dGPNebgY0QQfLtWZOvVJ_0qMz5iZk71AS0NEGmJrA&s=10',
  'HT881': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQnjh3yNg8gqg2rkC_1Lu1k4lVeNedpir97oBTpfECtuQ&s=10',
  'UCM6300': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRrqxvgj28FqoJA0dH-NVdUDVmPmSB9hKKIy_aMj5ml_g&s',
  'UCM6300A': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRrqxvgj28FqoJA0dH-NVdUDVmPmSB9hKKIy_aMj5ml_g&s',
  'UCM6302': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRrqxvgj28FqoJA0dH-NVdUDVmPmSB9hKKIy_aMj5ml_g&s',
  'UCM6302A': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRrqxvgj28FqoJA0dH-NVdUDVmPmSB9hKKIy_aMj5ml_g&s',
  'UCM6304': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS8HfUlIFaUdm5vO_GMg4lK0sskQH1C546nYOSemA46AQ&s=10',
  'UCM6304A': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQJdvfL06Jz-uIk8gyN_B7ssJXgAB3DHpytIXqe8aTZlg&s=10',
  'UCM6308': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS8HfUlIFaUdm5vO_GMg4lK0sskQH1C546nYOSemA46AQ&s=10',
  'UCM6308A': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS8HfUlIFaUdm5vO_GMg4lK0sskQH1C546nYOSemA46AQ&s=10'
}

// Helper function to get product image
function getProductImage(productName) {
  return PRODUCT_IMAGES[productName] || null
}

const emptyForm = {
  category: CATEGORIES[0],
  customCategory: '',
  productName: '',
  customProductName: '',
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
  const [statusFilter, setStatusFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState(false)
  const [showGroupedModal, setShowGroupedModal] = useState(false)
  
  // Searchable dropdown states
  const [productSearch, setProductSearch] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [isCustomSelected, setIsCustomSelected] = useState(false)
  const dropdownRef = useRef(null)
  const inputRef = useRef(null)

  // Filter products based on search
  const filteredProducts = useMemo(() => {
    if (!productSearch.trim()) return PRODUCT_NAMES
    const q = productSearch.toLowerCase().trim()
    return PRODUCT_NAMES.filter(p => p.toLowerCase().includes(q))
  }, [productSearch])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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
      
      let matchesStatus = true
      if (statusFilter === 'In Stock') {
        matchesStatus = s.status !== 'sold'
      } else if (statusFilter === 'Sold') {
        matchesStatus = s.status === 'sold'
      }
      
      const q = search.toLowerCase()
      const matchesSearch =
        !q ||
        s.name?.toLowerCase().includes(q) ||
        s.mac?.toLowerCase().includes(q) ||
        s.serial?.toLowerCase().includes(q)
      
      return matchesCat && matchesStatus && matchesSearch
    })
  }, [stock, activeCat, statusFilter, search])

  // GROUPED DATA - All, In Stock, Sold combined
  const groupedData = useMemo(() => {
    if (!stock) return []
    
    const grouped = {}
    stock.forEach((s) => {
      const name = s.name || 'Unnamed'
      if (!grouped[name]) {
        grouped[name] = {
          name: name,
          totalQty: 0,
          inStockQty: 0,
          soldQty: 0,
          categories: new Set(),
          items: []
        }
      }
      const qty = Number(s.quantity) || 0
      grouped[name].totalQty += qty
      if (s.status !== 'sold') {
        grouped[name].inStockQty += qty
      } else {
        grouped[name].soldQty += qty
      }
      grouped[name].categories.add(s.category)
      grouped[name].items.push(s)
    })
    
    return Object.values(grouped).sort((a, b) => b.totalQty - a.totalQty)
  }, [stock])

  // Stats
  const stats = useMemo(() => {
    if (!stock) return { total: 0, inStock: 0, sold: 0 }
    const total = stock.length
    const inStock = stock.filter(s => s.status !== 'sold').length
    const sold = stock.filter(s => s.status === 'sold').length
    return { total, inStock, sold }
  }, [stock])

  async function handleSubmit(e) {
    e.preventDefault()
    
    let finalProductName = ''
    if (form.productName && form.productName !== 'Custom') {
      finalProductName = form.productName
    } else if (form.customProductName.trim()) {
      finalProductName = form.customProductName.trim()
    }
    
    const category = form.category === 'Custom' ? form.customCategory.trim() : form.category
    
    if (!category || !finalProductName) {
      alert('Please select a product name and category')
      return
    }
    
    setSaving(true)
    try {
      const stockRef = ref(db, `companies/${companyId}/stock`)
      const mac = normalizeMac(form.mac)
      const qty = mac ? 1 : Math.max(1, Number(form.quantity) || 1)
      
      await push(stockRef, {
        category,
        name: finalProductName,
        mac: mac || null,
        serial: form.serial.trim() || null,
        description: form.description.trim() || null,
        quantity: qty,
        status: 'in-stock',
        addedDate: new Date().toISOString().slice(0, 10),
        createdAt: Date.now()
      })
      setForm(emptyForm)
      setProductSearch('')
      setShowDropdown(false)
      setIsCustomSelected(false)
      setShowForm(false)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Are You sure to delete this')) return
    await remove(ref(db, `companies/${companyId}/stock/${id}`))
  }

  function selectProduct(name) {
    setForm({ ...form, productName: name, customProductName: '' })
    setProductSearch(name)
    setIsCustomSelected(false)
    setShowDropdown(false)
  }

  function selectCustomProduct(searchTerm) {
    const customName = searchTerm.trim() || 'Custom'
    setForm({ ...form, productName: 'Custom', customProductName: customName })
    setProductSearch(customName)
    setIsCustomSelected(true)
    setShowDropdown(false)
  }

  function clearProduct() {
    setForm({ ...form, productName: '', customProductName: '' })
    setProductSearch('')
    setIsCustomSelected(false)
    setShowDropdown(false)
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  function handleInputChange(e) {
    const value = e.target.value
    setProductSearch(value)
    
    if (isCustomSelected) {
      setIsCustomSelected(false)
      setForm({ ...form, productName: '', customProductName: '' })
    }
    
    if (form.productName && form.productName !== 'Custom') {
      setForm({ ...form, productName: '', customProductName: '' })
    }
    
    setShowDropdown(true)
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Inventory</h1>
          <p className="text-sm text-slateink mt-0.5">Track your stock by category.</p>
        </div>
        <div className="flex gap-2">
          {/* GROUP BUTTON */}
          <button
            onClick={() => setShowGroupedModal(true)}
            className="flex items-center gap-2 rounded-lg bg-teal/10 text-teal-dark border border-teal/20 text-sm font-medium px-4 py-2.5 hover:bg-teal/20 transition-colors"
          >
            <Layers size={16} />
            Group by Product
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 rounded-lg bg-ink text-white text-sm font-medium px-4 py-2.5 hover:bg-inkSoft transition-colors self-start"
          >
            <Plus size={16} /> Add Stock
          </button>
        </div>
      </div>

      {/* STATUS FILTER BUTTONS */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setStatusFilter('All')}
          className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium border transition-colors ${
            statusFilter === 'All'
              ? 'bg-ink text-white border-ink'
              : 'bg-surface text-slateink border-line hover:border-ink/30'
          }`}
        >
          <Package size={15} />
          All
          <span className={`text-xs ${statusFilter === 'All' ? 'text-white/70' : 'text-slateink/70'}`}>
            ({stats.total})
          </span>
        </button>
        
        <button
          onClick={() => setStatusFilter('In Stock')}
          className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium border transition-colors ${
            statusFilter === 'In Stock'
              ? 'bg-teal text-white border-teal'
              : 'bg-surface text-slateink border-line hover:border-teal/30'
          }`}
        >
          <PackageCheck size={15} />
          In Stock
          <span className={`text-xs ${statusFilter === 'In Stock' ? 'text-white/70' : 'text-slateink/70'}`}>
            ({stats.inStock})
          </span>
        </button>
        
        <button
          onClick={() => setStatusFilter('Sold')}
          className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium border transition-colors ${
            statusFilter === 'Sold'
              ? 'bg-coral text-white border-coral'
              : 'bg-surface text-slateink border-line hover:border-coral/30'
          }`}
        >
          <PackageX size={15} />
          Sold
          <span className={`text-xs ${statusFilter === 'Sold' ? 'text-white/70' : 'text-slateink/70'}`}>
            ({stats.sold})
          </span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative max-w-sm w-full">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, MAC, serial…"
            className="input pl-9"
          />
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slateink" />
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
          <p className="font-medium text-ink">No stock items found.</p>
          <p className="text-sm text-slateink mt-1">Add new Product.</p>
        </div>
      ) : (
        <div className="bg-surface rounded-2xl border border-line shadow-card overflow-hidden">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-slateink">
                  <th className="px-4 py-3 font-medium">Image</th>
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
                {filtered.map((s) => {
                  const imageUrl = getProductImage(s.name)
                  return (
                    <tr key={s.id} className="border-b border-line last:border-0 hover:bg-paper/60">
                      <td className="px-4 py-3">
                        {imageUrl ? (
                          <img 
                            src={imageUrl} 
                            alt={s.name}
                            className="w-12 h-12 object-contain rounded-lg border border-line bg-white"
                            onError={(e) => {
                              e.target.style.display = 'none'
                            }}
                          />
                        ) : (
                          <div className="w-12 h-12 flex items-center justify-center bg-paper rounded-lg border border-line">
                            <Package size={20} className="text-slateink" />
                          </div>
                        )}
                      </td>
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
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================
          GROUPED PRODUCT MODAL WITH IMAGES
          ============================================================ */}

      {showGroupedModal && (
        <Modal title="Products Grouped by Name" onClose={() => setShowGroupedModal(false)} wide>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-slateink">
                  <th className="px-4 py-3 font-medium">#</th>
                  <th className="px-4 py-3 font-medium">Image</th>
                  <th className="px-4 py-3 font-medium">Product Name</th>
                  <th className="px-4 py-3 font-medium text-center">Total Qty</th>
                  <th className="px-4 py-3 font-medium text-center text-teal-dark">In Stock</th>
                  <th className="px-4 py-3 font-medium text-center text-coral">Sold</th>
                  <th className="px-4 py-3 font-medium">Categories</th>
                  <th className="px-4 py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {groupedData.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-slateink">
                      No products found
                    </td>
                  </tr>
                ) : (
                  groupedData.map((group, index) => {
                    const imageUrl = getProductImage(group.name)
                    return (
                      <tr key={index} className="border-b border-line last:border-0 hover:bg-paper/60">
                        <td className="px-4 py-3 text-center">{index + 1}</td>
                        <td className="px-4 py-3">
                          {imageUrl ? (
                            <img 
                              src={imageUrl} 
                              alt={group.name}
                              className="w-12 h-12 object-contain rounded-lg border border-line bg-white"
                              onError={(e) => {
                                e.target.style.display = 'none'
                              }}
                            />
                          ) : (
                            <div className="w-12 h-12 flex items-center justify-center bg-paper rounded-lg border border-line">
                              <Package size={20} className="text-slateink" />
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-ink">{group.name}</p>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="font-bold text-ink text-lg">{group.totalQty}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="font-medium text-teal-dark">{group.inStockQty}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="font-medium text-coral">{group.soldQty}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {Array.from(group.categories).map((cat) => (
                              <span key={cat} className="rounded-full bg-teal-light text-teal-dark text-xs font-medium px-2.5 py-1">
                                {cat}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => {
                              setSearch(group.name)
                              setShowGroupedModal(false)
                            }}
                            className="text-teal-dark text-xs font-medium hover:underline"
                          >
                            View Items
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
              {groupedData.length > 0 && (
                <tfoot>
                  <tr className="border-t-2 border-line bg-paper">
                    <td colSpan={3} className="px-4 py-3 font-semibold text-ink">Total</td>
                    <td className="px-4 py-3 text-center font-bold text-ink">
                      {groupedData.reduce((sum, g) => sum + g.totalQty, 0)}
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-teal-dark">
                      {groupedData.reduce((sum, g) => sum + g.inStockQty, 0)}
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-coral">
                      {groupedData.reduce((sum, g) => sum + g.soldQty, 0)}
                    </td>
                    <td colSpan={2}></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </Modal>
      )}

      {showForm && (
        <Modal title="Add Stock" onClose={() => setShowForm(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Category */}
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

            {/* Product Name - SEARCHABLE DROPDOWN */}
            <label className="block">
              <span className="text-xs font-medium text-slateink">Product Name *</span>
              <div className="relative mt-1" ref={dropdownRef}>
                <div className="relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={productSearch}
                    onChange={handleInputChange}
                    onFocus={() => {
                      if (!isCustomSelected) {
                        setShowDropdown(true)
                      }
                    }}
                    placeholder="Search or type product name…"
                    className="input w-full pr-10"
                  />
                  {productSearch && (
                    <button
                      type="button"
                      onClick={clearProduct}
                      className="absolute right-9 top-1/2 -translate-y-1/2 text-slateink hover:text-coral"
                    >
                      <X size={14} />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      if (!isCustomSelected) {
                        setShowDropdown(!showDropdown)
                      }
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slateink hover:text-ink"
                  >
                    <ChevronDown size={16} />
                  </button>
                </div>

                {/* Selected product display */}
                {form.productName && form.productName !== 'Custom' && (
                  <p className="text-xs text-teal-dark mt-1">
                    Selected: <strong>{form.productName}</strong>
                  </p>
                )}
                {form.productName === 'Custom' && form.customProductName && (
                  <p className="text-xs text-teal-dark mt-1">
                    Custom product: <strong>{form.customProductName}</strong>
                  </p>
                )}

                {/* Dropdown */}
                {showDropdown && !isCustomSelected && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-line rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredProducts.length > 0 ? (
                      <>
                        {filteredProducts.map((p) => (
                          <div
                            key={p}
                            onClick={() => selectProduct(p)}
                            className="px-4 py-2.5 hover:bg-teal-light cursor-pointer text-sm text-ink transition-colors"
                          >
                            {p}
                          </div>
                        ))}
                        {!PRODUCT_NAMES.includes(productSearch.trim()) && productSearch.trim() && !isCustomSelected && (
                          <div
                            onClick={() => selectCustomProduct(productSearch)}
                            className="px-4 py-2.5 hover:bg-teal-light cursor-pointer text-sm text-teal-dark border-t border-line font-medium"
                          >
                            + Add "{productSearch.trim()}" as new product
                          </div>
                        )}
                      </>
                    ) : (
                      !isCustomSelected && (
                        <div
                          onClick={() => selectCustomProduct(productSearch)}
                          className="px-4 py-3 hover:bg-teal-light cursor-pointer text-sm text-teal-dark"
                        >
                          + Add "{productSearch.trim() || 'Custom'}" as new product
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
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