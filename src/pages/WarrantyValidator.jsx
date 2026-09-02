// import { useState } from 'react'
// import { ref, get } from 'firebase/database'
// import { ShieldCheck, ShieldAlert, ShieldX, Search, ChevronDown, ChevronUp } from 'lucide-react'
// import { db } from '../firebase'
// import { useAuth } from '../context/AuthContext'
// import { formatDate, normalizeMac, addMonths, WARRANTY_MONTHS } from '../utils/helpers'

// export default function WarrantyValidator() {
//   const { companyId } = useAuth()
//   const [mac, setMac] = useState('')
//   const [results, setResults] = useState([])
//   const [notFound, setNotFound] = useState(false)
//   const [loading, setLoading] = useState(false)
//   const [expanded, setExpanded] = useState(null)

//   async function handleSearch(e) {
//     e.preventDefault()
//     setResults([])
//     setNotFound(false)
    
//     const searchTerm = mac.trim()
//     if (!searchTerm) return
    
//     setLoading(true)
    
//     try {
//       // First, get all stock items
//       const stockSnap = await get(ref(db, `companies/${companyId}/stock`))
//       const stockVal = stockSnap.val() || {}
      
//       // Get all customers with their details
//       const customersSnap = await get(ref(db, `companies/${companyId}/customers`))
//       const customersVal = customersSnap.val() || {}
      
//       // Create customer lookup map with full details
//       const customerMap = {}
//       Object.entries(customersVal).forEach(([id, customer]) => {
//         customerMap[id] = {
//           name: customer.name || '',
//           company: customer.company || '',
//           phone: customer.phone || '',
//           address: customer.address || ''
//         }
//       })
      
//       // Also create a map by name for legacy data
//       const customerByNameMap = {}
//       Object.entries(customersVal).forEach(([id, customer]) => {
//         if (customer.name) {
//           customerByNameMap[customer.name.toLowerCase().trim()] = {
//             id: id,
//             name: customer.name || '',
//             company: customer.company || ''
//           }
//         }
//       })
      
//       // Normalize the search term
//       const normalizedSearch = normalizeMac(searchTerm)
//       const lastFour = searchTerm.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(-4)
      
//       // Find all matching devices and enrich with customer data
//       const matches = Object.entries(stockVal)
//         .map(([id, s]) => {
//           let soldToName = ''
//           let soldToCompany = ''
//           let soldToPhone = ''
//           let soldToAddress = ''
          
//           // CASE 1: soldTo is a customer ID (e.g., "customer_123")
//           if (s.soldTo && customerMap[s.soldTo]) {
//             soldToName = customerMap[s.soldTo].name || ''
//             soldToCompany = customerMap[s.soldTo].company || ''
//             soldToPhone = customerMap[s.soldTo].phone || ''
//             soldToAddress = customerMap[s.soldTo].address || ''
//           }
//           // CASE 2: soldTo is a name and we need to find matching customer
//           else if (s.soldTo && typeof s.soldTo === 'string' && !s.soldTo.startsWith('soldTo_')) {
//             const trimmedName = s.soldTo.toLowerCase().trim()
//             if (customerByNameMap[trimmedName]) {
//               soldToName = customerByNameMap[trimmedName].name || s.soldTo
//               soldToCompany = customerByNameMap[trimmedName].company || ''
//             } else {
//               soldToName = s.soldTo
//               soldToCompany = s.soldToCompany || '' // Fallback to direct field
//             }
//           }
//           // CASE 3: No soldTo data
//           else {
//             soldToName = s.soldTo || ''
//             soldToCompany = s.soldToCompany || ''
//           }
          
//           return {
//             id,
//             ...s,
//             soldToName,
//             soldToCompany,
//             soldToPhone,
//             soldToAddress
//           }
//         })
//         .filter((s) => {
//           if (!s.mac) return false
          
//           const normalizedMac = normalizeMac(s.mac)
          
//           // Check if full MAC matches
//           if (normalizedMac === normalizedSearch) return true
          
//           // Check if last 4 digits match
//           const macLastFour = s.mac.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(-4)
//           if (macLastFour === lastFour && lastFour.length === 4) return true
          
//           return false
//         })
      
//       if (matches.length === 0) {
//         setNotFound(true)
//       } else {
//         setResults(matches)
//         // Auto expand first result
//         if (matches.length === 1) {
//           setExpanded(matches[0].id)
//         } else {
//           setExpanded(null)
//         }
//       }
      
//     } catch (error) {
//       console.error('Search error:', error)
//       setNotFound(true)
//     } finally {
//       setLoading(false)
//     }
//   }

//   function toggleExpand(id) {
//     setExpanded(expanded === id ? null : id)
//   }

//   // Function to format sold to with name and company
//   function formatSoldTo(result) {
//     if (!result.soldTo && !result.soldToName) {
//       return '—'
//     }
    
//     const name = result.soldToName || ''
//     const company = result.soldToCompany || ''
    
//     if (name && company) {
//       return `${name} (${company})`
//     } else if (name) {
//       return name
//     } else if (company) {
//       return company
//     }
    
//     return '—'
//   }

//   return (
//     <div className="max-w-3xl">
//       <h1 className="font-display text-2xl font-semibold text-ink">Warranty Validator</h1>
//       <p className="text-sm text-slateink mt-0.5 mb-6">
//         Enter full MAC address or last 4 digits to search. Multiple devices with same last 4 digits will show all results.
//       </p>

//       <form onSubmit={handleSearch} className="flex gap-2 mb-8">
//         <div className="relative flex-1">
//           {/* <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slateink" /> */}
//           <input
//             value={mac}
//             onChange={(e) => setMac(e.target.value)}
//             placeholder="AA:BB:CC:DD:EE:FF or last 4 digits (e.g., EE:FF)"
//             className="input pl-9 font-mono"
//           />
//         </div>
//         <button
//           type="submit"
//           disabled={loading}
//           className="rounded-lg bg-ink text-white text-sm font-medium px-5 py-2.5 hover:bg-inkSoft transition-colors disabled:opacity-60"
//         >
//           {loading ? 'Searching...' : 'Check'}
//         </button>
//       </form>

//       {notFound && (
//         <div className="bg-surface border border-line rounded-2xl shadow-card p-6 flex items-center gap-4">
//           <div className="h-11 w-11 rounded-xl bg-coral-light text-coral flex items-center justify-center">
//             <ShieldX size={20} />
//           </div>
//           <div>
//             <p className="font-medium text-ink">No device found</p>
//             <p className="text-sm text-slateink">This MAC address or last 4 digits did not match any record.</p>
//           </div>
//         </div>
//       )}

//       {results.length > 1 && (
//         <div className="mb-4 bg-amber-light/20 border border-amber/30 rounded-xl p-3">
//           <p className="text-sm text-amber-dark font-medium">
//             🔍 Found {results.length} device(s) matching your search
//           </p>
//           <p className="text-xs text-slateink mt-1">
//             Click on each device to view details
//           </p>
//         </div>
//       )}

//       {results.map((result) => {
//         const warrantyEnd = result?.soldDate ? addMonths(result.soldDate, WARRANTY_MONTHS) : null
//         const isActive = warrantyEnd ? warrantyEnd.getTime() >= Date.now() : null
//         const isExpanded = expanded === result.id
//         const soldToDisplay = formatSoldTo(result)

//         return (
//           <div
//             key={result.id}
//             className="bg-surface border border-line rounded-2xl shadow-card mb-4 overflow-hidden"
//           >
//             {/* Header - Always visible */}
//             <div
//               className="p-4 cursor-pointer hover:bg-paper/50 transition-colors flex items-center justify-between"
//               onClick={() => toggleExpand(result.id)}
//             >
//               <div className="flex items-center gap-4 flex-1 min-w-0">
//                 <div
//                   className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
//                     result.status !== 'sold'
//                       ? 'bg-teal-light text-teal-dark'
//                       : isActive
//                       ? 'bg-teal-light text-teal-dark'
//                       : 'bg-amber-light text-amber'
//                   }`}
//                 >
//                   {result.status !== 'sold' ? (
//                     <ShieldCheck size={18} />
//                   ) : isActive ? (
//                     <ShieldCheck size={18} />
//                   ) : (
//                     <ShieldAlert size={18} />
//                   )}
//                 </div>
//                 <div className="flex-1 min-w-0">
//                   <p className="font-display font-semibold text-ink text-sm truncate">{result.name}</p>
//                   <p className="text-xs text-slateink truncate">
//                     {result.category || 'Uncategorized'} · MAC {result.mac}
//                     {result.status === 'sold' && (
//                       <span className={`ml-2 ${isActive ? 'text-teal-dark' : 'text-coral'}`}>
//                         · {isActive ? 'Active' : 'Expired'}
//                       </span>
//                     )}
//                     {result.status !== 'sold' && (
//                       <span className="ml-2 text-teal-dark">· In Stock</span>
//                     )}
//                   </p>
//                 </div>
//               </div>
//               <div className="shrink-0 ml-2">
//                 {isExpanded ? (
//                   <ChevronUp size={18} className="text-slateink" />
//                 ) : (
//                   <ChevronDown size={18} className="text-slateink" />
//                 )}
//               </div>
//             </div>

//             {/* Expanded Details */}
//             {isExpanded && (
//               <div className="px-4 pb-4 pt-1 border-t border-line">
//                 <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
//                   <Detail label="Stock Entry Date" value={formatDate(result.addedDate)} />
//                   <Detail label="Serial Number" value={result.serial || '—'} />
//                   <Detail
//                     label="Status"
//                     value={
//                       result.status === 'sold' 
//                         ? 'Sold to customer' 
//                         : result.quantity > 0 
//                           ? `In stock (${result.quantity} available)` 
//                           : 'In stock (not yet sold)'
//                     }
//                   />
//                   {result.status === 'sold' && (
//                     <>
//                       <Detail label="Sold To" value={soldToDisplay} />
//                       <Detail label="Sale Date" value={formatDate(result.soldDate)} />
//                       <Detail
//                         label="Warranty Status"
//                         value={
//                           isActive
//                             ? `Active till ${formatDate(warrantyEnd)}`
//                             : `Expired on ${formatDate(warrantyEnd)}`
//                         }
//                         highlight={isActive ? 'good' : 'bad'}
//                       />
//                       {result.dcNumber && <Detail label="Document #" value={result.dcNumber} />}
//                     </>
//                   )}
//                   {result.status !== 'sold' && result.quantity > 0 && (
//                     <Detail label="Available Quantity" value={result.quantity} />
//                   )}
//                 </div>

//                 {result.description && (
//                   <p className="mt-4 text-xs text-slateink border-t border-line pt-4">
//                     {result.description}
//                   </p>
//                 )}
//               </div>
//             )}
//           </div>
//         )
//       })}
//     </div>
//   )
// }

// function Detail({ label, value, highlight }) {
//   const color =
//     highlight === 'good' ? 'text-teal-dark' : highlight === 'bad' ? 'text-coral' : 'text-ink'
//   return (
//     <div>
//       <p className="text-xs text-slateink">{label}</p>
//       <p className={`font-medium ${color} break-words`}>{value || '—'}</p>
//     </div>
//   )
// }





//with img
import { useState } from 'react'
import { ref, get } from 'firebase/database'
import {
  ShieldCheck,
  ShieldX,
  ChevronDown,
  ChevronUp,
  Package
} from 'lucide-react'

import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'
import {
  formatDate,
  normalizeMac,
  addMonths,
  WARRANTY_MONTHS
} from '../utils/helpers'


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

  'GXP2160': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4TV9sKCidvSqTFBrMQojvdmi4oYdBsoxWR5k-z1Pw&s=10',

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

  'GWN7062E': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQFoc3CUvYRNWBfM4i6kA_b0zomlvAdeIwmS5AwPFmfYQ&s=10', 

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

  'UCM6308A': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS8HfUlIFaUdm5vO_GMg4lK0sskQH1C546nYOSeldPw&s=10',

  'ZKTecoK40': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTa1_PrQFpqmmc4GTpAOrsOMoJfbnAYa2PfMo8tkg6_1g&s=10'  
}


/* ============================================================
   GET PRODUCT IMAGE
   ============================================================ */

function getProductImage(productName) {

  if (!productName) {
    return null
  }

  return PRODUCT_IMAGES[productName] || null
}


/* ============================================================
   MAIN COMPONENT
   ============================================================ */

export default function WarrantyValidator() {

  const { companyId } = useAuth()

  const [mac, setMac] =
    useState('')

  const [results, setResults] =
    useState([])

  const [notFound, setNotFound] =
    useState(false)

  const [loading, setLoading] =
    useState(false)

  const [expanded, setExpanded] =
    useState(null)


  /* ============================================================
     SEARCH
     ============================================================ */

  async function handleSearch(e) {

    e.preventDefault()

    setResults([])

    setNotFound(false)

    setExpanded(null)


    const searchTerm =
      mac.trim()


    if (!searchTerm) {
      return
    }


    if (!companyId) {
      setNotFound(true)
      return
    }


    setLoading(true)


    try {

      /* ========================================================
         GET STOCK
         ======================================================== */

      const stockSnap =
        await get(
          ref(
            db,
            `companies/${companyId}/stock`
          )
        )


      const stockVal =
        stockSnap.val() || {}


      /* ========================================================
         GET CUSTOMERS
         ======================================================== */

      const customersSnap =
        await get(
          ref(
            db,
            `companies/${companyId}/customers`
          )
        )


      const customersVal =
        customersSnap.val() || {}


      /* ========================================================
         CUSTOMER MAP BY ID
         ======================================================== */

      const customerMap = {}


      Object.entries(
        customersVal
      ).forEach(
        ([id, customer]) => {

          customerMap[id] = {

            name:
              customer?.name || '',

            company:
              customer?.company || '',

            phone:
              customer?.phone || '',

            address:
              customer?.address || ''

          }

        }
      )


      /* ========================================================
         CUSTOMER MAP BY NAME
         Legacy support
         ======================================================== */

      const customerByNameMap = {}


      Object.entries(
        customersVal
      ).forEach(
        ([id, customer]) => {

          if (
            customer?.name
          ) {

            customerByNameMap[
              customer.name
                .toLowerCase()
                .trim()
            ] = {

              id,

              name:
                customer.name || '',

              company:
                customer.company || '',

              phone:
                customer.phone || '',

              address:
                customer.address || ''

            }

          }

        }
      )


      /* ========================================================
         NORMALIZE SEARCH
         ======================================================== */

      const normalizedSearch =
        normalizeMac(
          searchTerm
        )


      const lastFour =
        searchTerm
          .replace(
            /[^a-zA-Z0-9]/g,
            ''
          )
          .toUpperCase()
          .slice(-4)


      /* ========================================================
         FIND MATCHES
         ======================================================== */

      const matches =
        Object.entries(
          stockVal
        )

          .map(
            ([id, s]) => {

              let soldToName = ''
              let soldToCompany = ''
              let soldToPhone = ''
              let soldToAddress = ''


              /* ==============================================
                 CUSTOMER ID
                 ============================================== */

              if (
                s?.soldTo &&
                customerMap[
                  s.soldTo
                ]
              ) {

                soldToName =
                  customerMap[
                    s.soldTo
                  ].name || ''


                soldToCompany =
                  customerMap[
                    s.soldTo
                  ].company || ''


                soldToPhone =
                  customerMap[
                    s.soldTo
                  ].phone || ''


                soldToAddress =
                  customerMap[
                    s.soldTo
                  ].address || ''

              }


              /* ==============================================
                 CUSTOMER NAME
                 ============================================== */

              else if (
                s?.soldTo &&
                typeof s.soldTo ===
                  'string' &&
                !s.soldTo.startsWith(
                  'soldTo_'
                )
              ) {

                const trimmedName =
                  s.soldTo
                    .toLowerCase()
                    .trim()


                if (
                  customerByNameMap[
                    trimmedName
                  ]
                ) {

                  soldToName =
                    customerByNameMap[
                      trimmedName
                    ].name ||
                    s.soldTo


                  soldToCompany =
                    customerByNameMap[
                      trimmedName
                    ].company || ''


                  soldToPhone =
                    customerByNameMap[
                      trimmedName
                    ].phone || ''


                  soldToAddress =
                    customerByNameMap[
                      trimmedName
                    ].address || ''

                }

                else {

                  soldToName =
                    s.soldTo


                  soldToCompany =
                    s.soldToCompany ||
                    ''

                }

              }


              /* ==============================================
                 FALLBACK
                 ============================================== */

              else {

                soldToName =
                  s?.soldTo || ''


                soldToCompany =
                  s?.soldToCompany ||
                  ''

              }


              /* ==============================================
                 DEMO CUSTOMER SUPPORT
                 
                 Some existing records may use:
                 demoTo
                 demoToName
                 demoCustomer
                 demoCustomerName
                 ============================================== */

              let demoToName = ''
              let demoToCompany = ''
              let demoToPhone = ''
              let demoToAddress = ''


              const demoCustomerId =
                s?.demoTo ||
                s?.demoCustomerId ||
                s?.demoCustomer


              if (
                demoCustomerId &&
                customerMap[
                  demoCustomerId
                ]
              ) {

                demoToName =
                  customerMap[
                    demoCustomerId
                  ].name || ''


                demoToCompany =
                  customerMap[
                    demoCustomerId
                  ].company || ''


                demoToPhone =
                  customerMap[
                    demoCustomerId
                  ].phone || ''


                demoToAddress =
                  customerMap[
                    demoCustomerId
                  ].address || ''

              }


              /* ==============================================
                 DEMO NAME FALLBACK
                 ============================================== */

              if (!demoToName) {

                demoToName =
                  s?.demoToName ||
                  s?.demoCustomerName ||
                  s?.demoCustomerPerson ||
                  s?.demoPersonName ||
                  ''

              }


              /* ==============================================
                 DEMO COMPANY FALLBACK
                 ============================================== */

              if (!demoToCompany) {

                demoToCompany =
                  s?.demoToCompany ||
                  s?.demoCustomerCompany ||
                  s?.demoCompany ||
                  ''

              }


              /* ==============================================
                 DEMO PHONE FALLBACK
                 ============================================== */

              if (!demoToPhone) {

                demoToPhone =
                  s?.demoToPhone ||
                  s?.demoCustomerPhone ||
                  ''

              }


              /* ==============================================
                 DEMO ADDRESS FALLBACK
                 ============================================== */

              if (!demoToAddress) {

                demoToAddress =
                  s?.demoToAddress ||
                  s?.demoCustomerAddress ||
                  ''

              }


              return {

                id,

                ...s,

                soldToName,

                soldToCompany,

                soldToPhone,

                soldToAddress,

                demoToName,

                demoToCompany,

                demoToPhone,

                demoToAddress

              }

            }
          )

          .filter(
            (s) => {

              if (!s?.mac) {
                return false
              }


              const normalizedMac =
                normalizeMac(
                  s.mac
                )


              /* ============================================
                 FULL MAC MATCH
                 ============================================ */

              if (
                normalizedMac ===
                normalizedSearch
              ) {

                return true

              }


              /* ============================================
                 LAST 4 MATCH
                 ============================================ */

              const macLastFour =
                s.mac
                  .replace(
                    /[^a-zA-Z0-9]/g,
                    ''
                  )
                  .toUpperCase()
                  .slice(-4)


              if (
                macLastFour ===
                  lastFour &&
                lastFour.length === 4
              ) {

                return true

              }


              return false

            }
          )


      /* ========================================================
         RESULT
         ======================================================== */

      if (
        matches.length === 0
      ) {

        setNotFound(true)

      }

      else {

        setResults(
          matches
        )


        if (
          matches.length === 1
        ) {

          setExpanded(
            matches[0].id
          )

        }

        else {

          setExpanded(
            null
          )

        }

      }

    }

    catch (error) {

      console.error(
        'Search error:',
        error
      )

      setNotFound(true)

    }

    finally {

      setLoading(false)

    }

  }


  /* ============================================================
     TOGGLE
     ============================================================ */

  function toggleExpand(id) {

    setExpanded(
      expanded === id
        ? null
        : id
    )

  }


  /* ============================================================
     FORMAT SOLD TO
     ============================================================ */

  function formatSoldTo(result) {

    if (
      !result?.soldTo &&
      !result?.soldToName
    ) {

      return '—'

    }


    const name =
      result.soldToName || ''


    const company =
      result.soldToCompany || ''


    if (
      name &&
      company
    ) {

      return `${name} (${company})`

    }


    if (name) {

      return name

    }


    if (company) {

      return company

    }


    return '—'

  }


  /* ============================================================
     FORMAT DEMO TO
     ============================================================ */

  function formatDemoTo(result) {

    const name =
      result?.demoToName || ''


    const company =
      result?.demoToCompany || ''


    if (
      name &&
      company
    ) {

      return `${name} (${company})`

    }


    if (name) {

      return name

    }


    if (company) {

      return company

    }


    return '—'

  }


  /* ============================================================
     RETURN
     ============================================================ */

  return (

    <div className="max-w-3xl">

      {/* ======================================================
          PAGE HEADER
          ====================================================== */}

      <h1 className="font-display text-2xl font-semibold text-ink">

        Warranty Validator

      </h1>


      <p className="text-sm text-slateink mt-0.5 mb-6">

        Enter full MAC address or last 4 digits to search.
        Multiple devices with same last 4 digits will show all results.

      </p>


      {/* ======================================================
          SEARCH FORM
          ====================================================== */}

      <form
        onSubmit={handleSearch}
        className="flex gap-2 mb-8"
      >

        <div className="relative flex-1">

          <input
            value={mac}
            onChange={(e) =>
              setMac(
                e.target.value
              )
            }
            placeholder="AA:BB:CC:DD:EE:FF or last 4 digits (e.g., EE:FF)"
            className="input pl-9 font-mono"
          />

        </div>


        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-ink text-white text-sm font-medium px-5 py-2.5 hover:bg-inkSoft transition-colors disabled:opacity-60"
        >

          {loading
            ? 'Searching...'
            : 'Check'}

        </button>

      </form>


      {/* ======================================================
          NOT FOUND
          ====================================================== */}

      {notFound && (

        <div className="bg-surface border border-line rounded-2xl shadow-card p-6 flex items-center gap-4">

          <div className="h-11 w-11 rounded-xl bg-coral-light text-coral flex items-center justify-center">

            <ShieldX size={20} />

          </div>


          <div>

            <p className="font-medium text-ink">

              No device found

            </p>


            <p className="text-sm text-slateink">

              This MAC address or last 4 digits did not match any record.

            </p>

          </div>

        </div>

      )}


      {/* ======================================================
          MULTIPLE RESULTS
          ====================================================== */}

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


      {/* ======================================================
          RESULTS
          ====================================================== */}

      {results.map(
        (result) => {

          const normalizedStatus =
            String(
              result?.status || ''
            )
              .trim()
              .toLowerCase()


          const isSold =
            normalizedStatus ===
            'sold'


          const isDemo =
            normalizedStatus ===
            'demo'


          const isInStock =
            !isSold &&
            !isDemo


          /* ==================================================
             WARRANTY
             ================================================== */

          const warrantyEnd =
            isSold &&
            result?.soldDate
              ? addMonths(
                  result.soldDate,
                  WARRANTY_MONTHS
                )
              : null


          const isActive =
            warrantyEnd
              ? warrantyEnd.getTime() >=
                Date.now()
              : null


          const isExpanded =
            expanded ===
            result.id


          const soldToDisplay =
            formatSoldTo(
              result
            )


          const demoToDisplay =
            formatDemoTo(
              result
            )


          const imageUrl =
            getProductImage(
              result.name
            )


          return (

            <div
              key={result.id}
              className="bg-surface border border-line rounded-2xl shadow-card mb-4 overflow-hidden"
            >

              {/* ==================================================
                  HEADER
                  ================================================== */}

              <div
                className="p-4 cursor-pointer hover:bg-paper/50 transition-colors flex items-center justify-between"
                onClick={() =>
                  toggleExpand(
                    result.id
                  )
                }
              >

                <div className="flex items-center gap-4 flex-1 min-w-0">

                  {/* ==================================================
                      PRODUCT IMAGE
                      ================================================== */}

                  <div className="h-12 w-12 rounded-xl flex items-center justify-center shrink-0 bg-white border border-line overflow-hidden">

                    {imageUrl ? (

                      <img
                        src={imageUrl}
                        alt={result.name}
                        className="w-full h-full object-contain p-1"
                        onError={(e) => {

                          e.target.style.display =
                            'none'


                          const parent =
                            e.target.parentElement


                          if (parent) {

                            const fallback =
                              document.createElement(
                                'div'
                              )


                            fallback.className =
                              'h-10 w-10 rounded-xl flex items-center justify-center bg-teal-light text-teal-dark'


                            fallback.innerHTML =
                              '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>'


                            parent.appendChild(
                              fallback
                            )


                            e.target.remove()

                          }

                        }}
                      />

                    ) : (

                      <div className="h-10 w-10 rounded-xl flex items-center justify-center bg-teal-light text-teal-dark">

                        <Package size={18} />

                      </div>

                    )}

                  </div>


                  {/* ==================================================
                      PRODUCT INFORMATION
                      ================================================== */}

                  <div className="flex-1 min-w-0">

                    <p className="font-display font-semibold text-ink text-sm truncate">

                      {result.name}

                    </p>


                    <p className="text-xs text-slateink truncate">

                      {result.category ||
                        'Uncategorized'}

                      {' · '}

                      MAC {result.mac}


                      {/* ==============================================
                          SOLD
                          ============================================== */}

                      {isSold && (

                        <span
                          className={`ml-2 ${
                            isActive
                              ? 'text-teal-dark'
                              : 'text-coral'
                          }`}
                        >

                          · {isActive
                            ? 'Warranty Active'
                            : 'Warranty Expired'}

                        </span>

                      )}


                      {/* ==============================================
                          DEMO
                          ============================================== */}

                      {isDemo && (

                        <span className="ml-2 text-amber-dark font-medium">

                          · Demo

                        </span>

                      )}


                      {/* ==============================================
                          IN STOCK
                          ============================================== */}

                      {isInStock && (

                        <span className="ml-2 text-teal-dark">

                          · In Stock

                        </span>

                      )}

                    </p>

                  </div>

                </div>


                {/* ==================================================
                    EXPAND ICON
                    ================================================== */}

                <div className="shrink-0 ml-2">

                  {isExpanded ? (

                    <ChevronUp
                      size={18}
                      className="text-slateink"
                    />

                  ) : (

                    <ChevronDown
                      size={18}
                      className="text-slateink"
                    />

                  )}

                </div>

              </div>


              {/* ==================================================
                  EXPANDED DETAILS
                  ================================================== */}

              {isExpanded && (

                <div className="px-4 pb-4 pt-1 border-t border-line">

                  <div className="grid grid-cols-2 gap-4 mt-4 text-sm">

                    {/* ==================================================
                        STOCK ENTRY
                        ================================================== */}

                    <Detail
                      label="Stock Entry Date"
                      value={
                        result.addedDate
                          ? formatDate(
                              result.addedDate
                            )
                          : '—'
                      }
                    />


                    {/* ==================================================
                        SERIAL
                        ================================================== */}

                    <Detail
                      label="Serial Number"
                      value={
                        result.serial ||
                        '—'
                      }
                    />


                    {/* ==================================================
                        SOLD
                        ================================================== */}

                    {isSold && (

                      <>

                        <Detail
                          label="Status"
                          value="Sold to customer"
                        />


                        <Detail
                          label="Sold To"
                          value={
                            soldToDisplay
                          }
                        />


                        <Detail
                          label="Sale Date"
                          value={
                            result.soldDate
                              ? formatDate(
                                  result.soldDate
                                )
                              : '—'
                          }
                        />


                        <Detail
                          label="Warranty Status"
                          value={
                            isActive
                              ? `Active till ${formatDate(
                                  warrantyEnd
                                )}`
                              : `Expired on ${formatDate(
                                  warrantyEnd
                                )}`
                          }
                          highlight={
                            isActive
                              ? 'good'
                              : 'bad'
                          }
                        />


                        {result.dcNumber && (

                          <Detail
                            label="Document #"
                            value={
                              result.dcNumber
                            }
                          />

                        )}

                      </>

                    )}


                    {/* ==================================================
                        DEMO
                        ================================================== */}

                    {isDemo && (

                      <>

                        <Detail
                          label="Status"
                          value="Demo"
                          highlight="demo"
                        />


                        <Detail
                          label="Demo Date"
                          value={
                            result.demoDate ||
                            result.demoStartDate ||
                            result.demoIssuedDate ||
                            result.issuedDate ||
                            result.soldDate
                              ? formatDate(
                                  result.demoDate ||
                                  result.demoStartDate ||
                                  result.demoIssuedDate ||
                                  result.issuedDate ||
                                  result.soldDate
                                )
                              : '—'
                          }
                        />


                        <Detail
                          label="Demo To"
                          value={
                            demoToDisplay
                          }
                        />


                        {result.demoToPhone && (

                          <Detail
                            label="Phone"
                            value={
                              result.demoToPhone
                            }
                          />

                        )}


                        {result.demoToAddress && (

                          <Detail
                            label="Address"
                            value={
                              result.demoToAddress
                            }
                          />

                        )}


                        {(
                          result.demoDcNumber ||
                          result.demoDCNumber ||
                          result.dcNumber
                        ) && (

                          <Detail
                            label="Document #"
                            value={
                              result.demoDcNumber ||
                              result.demoDCNumber ||
                              result.dcNumber
                            }
                          />

                        )}

                      </>

                    )}


                    {/* ==================================================
                        IN STOCK
                        ================================================== */}

                    {isInStock && (

                      <>

                        <Detail
                          label="Status"
                          value={
                            Number(
                              result.quantity
                            ) > 0
                              ? `In stock (${result.quantity} available)`
                              : 'In stock (not yet sold)'
                          }
                        />


                        {Number(
                          result.quantity
                        ) > 0 && (

                          <Detail
                            label="Available Quantity"
                            value={
                              result.quantity
                            }
                          />

                        )}

                      </>

                    )}

                  </div>


                  {/* ==================================================
                      DESCRIPTION
                      ================================================== */}

                  {result.description && (

                    <p className="mt-4 text-xs text-slateink border-t border-line pt-4">

                      {result.description}

                    </p>

                  )}

                </div>

              )}

            </div>

          )

        }
      )}

    </div>

  )

}


/* ============================================================
   DETAIL COMPONENT
   ============================================================ */

function Detail({
  label,
  value,
  highlight
}) {

  const color =
    highlight === 'good'
      ? 'text-teal-dark'
      : highlight === 'bad'
        ? 'text-coral'
        : highlight === 'demo'
          ? 'text-amber-dark'
          : 'text-ink'


  return (

    <div>

      <p className="text-xs text-slateink">

        {label}

      </p>


      <p
        className={`font-medium ${color} break-words`}
      >

        {value || '—'}

      </p>

    </div>

  )

}