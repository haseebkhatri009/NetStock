// import { useEffect, useMemo, useState } from 'react'
// import { ref, onValue } from 'firebase/database'
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   Tooltip,
//   ResponsiveContainer,
//   CartesianGrid,
//   PieChart,
//   Pie,
//   Cell,
//   LineChart,
//   Line
// } from 'recharts'
// import { Users, Boxes, FileText, ShieldCheck } from 'lucide-react'
// import { db } from '../firebase'
// import { useAuth } from '../context/AuthContext'
// import StatCard from '../components/StatCard'
// import Loader from '../components/Loader'
// import { formatDate } from '../utils/helpers'

// const PIE_COLORS = ['#0FA6A6', '#F5A524', '#E8574A', '#3B82F6', '#8B5CF6', '#64748B']

// export default function Dashboard() {
//   const { companyId, company } = useAuth()
//   const [customers, setCustomers] = useState(null)
//   const [stock, setStock] = useState(null)
//   const [challans, setChallans] = useState(null)
//   const [invoices, setInvoices] = useState(null)

//   useEffect(() => {
//     if (!companyId) return
//     const onErr = (label) => (err) => {
//       console.error(`${label} read failed:`, err)
//     }
//     const unsub1 = onValue(
//       ref(db, `companies/${companyId}/customers`),
//       (s) => setCustomers(Object.values(s.val() || {})),
//       (err) => {
//         onErr('customers')(err)
//         setCustomers([])
//       }
//     )
//     const unsub2 = onValue(
//       ref(db, `companies/${companyId}/stock`),
//       (s) => setStock(Object.values(s.val() || {})),
//       (err) => {
//         onErr('stock')(err)
//         setStock([])
//       }
//     )
//     const unsub3 = onValue(
//       ref(db, `companies/${companyId}/challans`),
//       (s) => setChallans(Object.values(s.val() || {})),
//       (err) => {
//         onErr('challans')(err)
//         setChallans([])
//       }
//     )
//     const unsub4 = onValue(
//       ref(db, `companies/${companyId}/invoices`),
//       (s) => setInvoices(Object.values(s.val() || {})),
//       (err) => {
//         onErr('invoices')(err)
//         setInvoices([])
//       }
//     )
//     return () => {
//       unsub1()
//       unsub2()
//       unsub3()
//       unsub4()
//     }
//   }, [companyId])

//   const loading = !stock || !customers || !challans || !invoices

//   const categoryData = useMemo(() => {
//     if (!stock) return []
//     const map = {}
//     stock.forEach((s) => {
//       map[s.category] = (map[s.category] || 0) + Number(s.quantity || 0)
//     })
//     return Object.entries(map).map(([category, qty]) => ({ category, qty }))
//   }, [stock])

//   const statusData = useMemo(() => {
//     if (!stock) return []
//     let inStock = 0
//     let sold = 0
//     stock.forEach((s) => (s.status === 'sold' ? sold++ : inStock++))
//     return [
//       { name: 'In Stock', value: inStock },
//       { name: 'Sold', value: sold }
//     ]
//   }, [stock])

//   const salesTrend = useMemo(() => {
//     const all = [...(challans || []), ...(invoices || [])]
//     const map = {}
//     all.forEach((d) => {
//       if (!d.date) return
//       map[d.date] = (map[d.date] || 0) + (d.items?.length || 0)
//     })
//     return Object.entries(map)
//       .sort((a, b) => new Date(a[0]) - new Date(b[0]))
//       .slice(-14)
//       .map(([date, units]) => ({ date: formatDate(date).replace(/, \d{4}$/, ''), units }))
//   }, [challans, invoices])

//   const totalStockUnits = (stock || []).reduce((sum, s) => sum + Number(s.quantity || 0), 0)
//   const recentDocs = [...(challans || []), ...(invoices || [])]
//     .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
//     .slice(0, 6)

//   return (
//     <div>
//       <div className="mb-6">
//         <h1 className="font-display text-2xl font-semibold text-ink">
//           Welcome back{company?.name ? `, ${company.name}` : ''}
//         </h1>
//         <p className="text-sm text-slateink mt-0.5">A quick overview of your business at a glance.</p>
//       </div>

//       {loading ? (
//         <Loader />
//       ) : (
//         <>
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
//             <StatCard icon={Users} label="Customers" value={customers.length} accent="teal" />
//             <StatCard icon={Boxes} label="Stock Units" value={totalStockUnits} accent="ink" />
//             <StatCard
//               icon={FileText}
//               label="Delivery Challans"
//               value={challans.length}
//               accent="amber"
//             />
//             <StatCard
//               icon={ShieldCheck}
//               label="Invoices"
//               value={invoices.length}
//               accent="coral"
//             />
//           </div>

//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
//             <div className="lg:col-span-2 bg-surface rounded-2xl border border-line shadow-card p-5">
//               <p className="font-display font-semibold text-ink mb-4">Stock by Category</p>
//               <ResponsiveContainer width="100%" height={260}>
//                 <BarChart data={categoryData}>
//                   <CartesianGrid strokeDasharray="3 3" stroke="#E4E8F0" vertical={false} />
//                   <XAxis dataKey="category" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
//                   <YAxis tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} allowDecimals={false} />
//                   <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #E4E8F0', fontSize: 12 }} />
//                   <Bar dataKey="qty" fill="#0FA6A6" radius={[6, 6, 0, 0]} maxBarSize={48} />
//                 </BarChart>
//               </ResponsiveContainer>
//             </div>

//             <div className="bg-surface rounded-2xl border border-line shadow-card p-5">
//               <p className="font-display font-semibold text-ink mb-4">Stock Status</p>
//               <ResponsiveContainer width="100%" height={260}>
//                 <PieChart>
//                   <Pie
//                     data={statusData}
//                     dataKey="value"
//                     nameKey="name"
//                     innerRadius={55}
//                     outerRadius={85}
//                     paddingAngle={3}
//                   >
//                     {statusData.map((_, idx) => (
//                       <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
//                     ))}
//                   </Pie>
//                   <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #E4E8F0', fontSize: 12 }} />
//                 </PieChart>
//               </ResponsiveContainer>
//               <div className="flex justify-center gap-4 mt-2">
//                 {statusData.map((s, idx) => (
//                   <div key={s.name} className="flex items-center gap-1.5 text-xs text-slateink">
//                     <span
//                       className="h-2 w-2 rounded-full"
//                       style={{ background: PIE_COLORS[idx % PIE_COLORS.length] }}
//                     />
//                     {s.name}
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>

//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
//             <div className="lg:col-span-2 bg-surface rounded-2xl border border-line shadow-card p-5">
//               <p className="font-display font-semibold text-ink mb-4">Units Dispatched (recent)</p>
//               <ResponsiveContainer width="100%" height={220}>
//                 <LineChart data={salesTrend}>
//                   <CartesianGrid strokeDasharray="3 3" stroke="#E4E8F0" vertical={false} />
//                   <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
//                   <YAxis tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} allowDecimals={false} />
//                   <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #E4E8F0', fontSize: 12 }} />
//                   <Line type="monotone" dataKey="units" stroke="#F5A524" strokeWidth={2.5} dot={false} />
//                 </LineChart>
//               </ResponsiveContainer>
//             </div>

//             <div className="bg-surface rounded-2xl border border-line shadow-card p-5">
//               <p className="font-display font-semibold text-ink mb-4">Recent Activity</p>
//               <div className="space-y-3">
//                 {recentDocs.length === 0 && (
//                   <p className="text-sm text-slateink">Abhi tak koi DC ya invoice nahi bana.</p>
//                 )}
//                 {recentDocs.map((d, idx) => (
//                   <div key={idx} className="flex items-center justify-between text-sm">
//                     <div>
//                       <p className="font-medium text-ink">{d.customerName}</p>
//                       <p className="text-xs text-slateink font-mono">
//                         {d.dcNumber || d.invoiceNumber}
//                       </p>
//                     </div>
//                     <span className="text-xs text-slateink font-mono">{formatDate(d.date)}</span>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </>
//       )}
//     </div>
//   )
// }


// import { useEffect, useMemo, useState } from 'react'
// import { ref, onValue } from 'firebase/database'

// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   Tooltip,
//   ResponsiveContainer,
//   CartesianGrid,
//   PieChart,
//   Pie,
//   Cell,
//   LineChart,
//   Line
// } from 'recharts'

// import {
//   Users,
//   Boxes,
//   FileText,
//   ShieldCheck,
//   PackageCheck,
//   X,
//   CalendarDays,
//   TrendingUp
// } from 'lucide-react'

// import { db } from '../firebase'
// import { useAuth } from '../context/AuthContext'
// import StatCard from '../components/StatCard'
// import Loader from '../components/Loader'
// import { formatDate } from '../utils/helpers'


// /* ============================================================
//    PIE COLORS
//    ============================================================ */

// const PIE_COLORS = [
//   '#0FA6A6',
//   '#F5A524',
//   '#E8574A'
// ]


// /* ============================================================
//    MAIN DASHBOARD
//    ============================================================ */

// export default function Dashboard() {

//   const {
//     companyId,
//     company,
//     currentUser
//   } = useAuth()


//   /* ============================================================
//      STATES
//      ============================================================ */

//   const [customers, setCustomers] =
//     useState(null)

//   const [stock, setStock] =
//     useState(null)

//   const [challans, setChallans] =
//     useState(null)

//   const [invoices, setInvoices] =
//     useState(null)

//   const [userRole, setUserRole] =
//     useState(null)

//   const [showMonthlyReport, setShowMonthlyReport] =
//     useState(false)


//   /* ============================================================
//      SELECTED REPORT MONTH

//      Default = Current Month
     
//      Format:
//      YYYY-MM
//      ============================================================ */

//   const [selectedReportMonth, setSelectedReportMonth] =
//     useState(() => {

//       const now = new Date()

//       return `${now.getFullYear()}-${String(
//         now.getMonth() + 1
//       ).padStart(2, '0')}`

//     })


//   /* ============================================================
//      LOAD USER ROLE

//      Firebase Path:

//      companies/{companyId}/team/{currentUser.uid}/role
//      ============================================================ */

//   useEffect(() => {

//     if (
//       !companyId ||
//       !currentUser?.uid
//     ) {

//       setUserRole(null)

//       return

//     }


//     const roleRef = ref(
//       db,
//       `companies/${companyId}/team/${currentUser.uid}/role`
//     )


//     const unsubscribe =
//       onValue(

//         roleRef,

//         (snapshot) => {

//           const role =
//             snapshot.val()


//           console.log(
//             'USER ROLE:',
//             role
//           )


//           setUserRole(
//             String(
//               role || ''
//             )
//               .trim()
//               .toLowerCase()
//           )

//         },

//         (error) => {

//           console.error(
//             'Role read failed:',
//             error
//           )

//           setUserRole(null)

//         }

//       )


//     return () => {

//       unsubscribe()

//     }

//   }, [
//     companyId,
//     currentUser?.uid
//   ])


//   /* ============================================================
//      OWNER CHECK
//      ============================================================ */

//   const isOwner =
//     userRole === 'owner'


//   /* ============================================================
//      LOAD COMPANY DATA
//      ============================================================ */

//   useEffect(() => {

//     if (!companyId) return


//     const onErr =
//       (label) =>
//       (err) => {

//         console.error(
//           `${label} read failed:`,
//           err
//         )

//       }


//     /* ==========================================================
//        CUSTOMERS
//        ========================================================== */

//     const unsub1 =
//       onValue(

//         ref(
//           db,
//           `companies/${companyId}/customers`
//         ),

//         (snapshot) => {

//           const value =
//             snapshot.val() || {}


//           const list =
//             Object.values(value)


//           setCustomers(list)

//         },

//         (err) => {

//           onErr('customers')(err)

//           setCustomers([])

//         }

//       )


//     /* ==========================================================
//        STOCK
//        ========================================================== */

//     const unsub2 =
//       onValue(

//         ref(
//           db,
//           `companies/${companyId}/stock`
//         ),

//         (snapshot) => {

//           const value =
//             snapshot.val() || {}


//           const list =
//             Object.values(value)


//           setStock(list)

//         },

//         (err) => {

//           onErr('stock')(err)

//           setStock([])

//         }

//       )


//     /* ==========================================================
//        CHALLANS
//        ========================================================== */

//     const unsub3 =
//       onValue(

//         ref(
//           db,
//           `companies/${companyId}/challans`
//         ),

//         (snapshot) => {

//           const value =
//             snapshot.val() || {}


//           const list =
//             Object.values(value)


//           setChallans(list)

//         },

//         (err) => {

//           onErr('challans')(err)

//           setChallans([])

//         }

//       )


//     /* ==========================================================
//        INVOICES
//        ========================================================== */

//     const unsub4 =
//       onValue(

//         ref(
//           db,
//           `companies/${companyId}/invoices`
//         ),

//         (snapshot) => {

//           const value =
//             snapshot.val() || {}


//           const list =
//             Object.values(value)


//           setInvoices(list)

//         },

//         (err) => {

//           onErr('invoices')(err)

//           setInvoices([])

//         }

//       )


//     /* ==========================================================
//        CLEANUP
//        ========================================================== */

//     return () => {

//       unsub1()
//       unsub2()
//       unsub3()
//       unsub4()

//     }

//   }, [companyId])


//   /* ============================================================
//      LOADING
//      ============================================================ */

//   const loading =
//     !stock ||
//     !customers ||
//     !challans ||
//     !invoices


//   /* ============================================================
//      STOCK STATUS NORMALIZER
//      ============================================================ */

//   function getStockStatus(item) {

//     return String(
//       item?.status || ''
//     )
//       .trim()
//       .toLowerCase()

//   }


//   /* ============================================================
//      STOCK QUANTITY
//      ============================================================ */

//   function getStockQuantity(item) {

//     return Math.max(

//       0,

//       Number(
//         item?.quantity ??
//         item?.qty ??
//         0
//       ) || 0

//     )

//   }


//   /* ============================================================
//      IN STOCK UNITS
//      ============================================================ */

//   const inStockUnits =
//     useMemo(() => {

//       if (!stock) return 0


//       return stock.reduce(

//         (sum, item) => {

//           const status =
//             getStockStatus(item)


//           const qty =
//             getStockQuantity(item)


//           if (
//             status === 'sold' ||
//             status === 'demo'
//           ) {

//             return sum

//           }


//           return (
//             sum +
//             qty
//           )

//         },

//         0

//       )

//     }, [stock])


//   /* ============================================================
//      DEMO UNITS
//      ============================================================ */

//   const demoUnits =
//     useMemo(() => {

//       if (!stock) return 0


//       return stock.reduce(

//         (sum, item) => {

//           const status =
//             getStockStatus(item)


//           const qty =
//             getStockQuantity(item)


//           if (
//             status === 'demo'
//           ) {

//             return (
//               sum +
//               qty
//             )

//           }


//           return sum

//         },

//         0

//       )

//     }, [stock])


//   /* ============================================================
//      SOLD UNITS
//      ============================================================ */

//   const soldUnits =
//     useMemo(() => {

//       if (!stock) return 0


//       return stock.reduce(

//         (sum, item) => {

//           const status =
//             getStockStatus(item)


//           const qty =
//             getStockQuantity(item)


//           if (
//             status === 'sold'
//           ) {

//             return (
//               sum +
//               qty
//             )

//           }


//           return sum

//         },

//         0

//       )

//     }, [stock])


//   /* ============================================================
//      STOCK BY CATEGORY

//      ONLY IN STOCK
//      ============================================================ */

//   const categoryData =
//     useMemo(() => {

//       if (!stock) return []


//       const map = {}


//       stock.forEach((item) => {

//         const status =
//           getStockStatus(item)


//         if (
//           status === 'sold' ||
//           status === 'demo'
//         ) {

//           return

//         }


//         const category =
//           String(
//             item?.category ||
//             'Uncategorized'
//           )
//             .trim()


//         const qty =
//           getStockQuantity(item)


//         if (
//           qty <= 0
//         ) {

//           return

//         }


//         map[category] =
//           (
//             map[category] ||
//             0
//           ) +
//           qty

//       })


//       return Object.entries(map)

//         .map(
//           (
//             [
//               category,
//               qty
//             ]
//           ) => ({

//             category,

//             qty

//           })
//         )

//         .sort(
//           (a, b) =>
//             b.qty -
//             a.qty
//         )

//     }, [stock])


//   /* ============================================================
//      STOCK STATUS
//      ============================================================ */

//   const statusData =
//     useMemo(() => {

//       return [

//         {
//           name: 'In Stock',
//           value: inStockUnits
//         },

//         {
//           name: 'Demo',
//           value: demoUnits
//         },

//         {
//           name: 'Sold',
//           value: soldUnits
//         }

//       ]

//     }, [
//       inStockUnits,
//       demoUnits,
//       soldUnits
//     ])


//   /* ============================================================
//      SALES / DISPATCH TREND
//      ============================================================ */

//   const salesTrend =
//     useMemo(() => {

//       const all = [

//         ...(challans || []),

//         ...(invoices || [])

//       ]


//       const map = {}


//       all.forEach((doc) => {

//         if (!doc.date) return


//         let units = 0


//         if (
//           Array.isArray(
//             doc.items
//           )
//         ) {

//           units =
//             doc.items.reduce(

//               (
//                 sum,
//                 item
//               ) => {

//                 const qty =
//                   Number(
//                     item?.qty ??
//                     item?.quantity ??
//                     1
//                   ) || 0


//                 return (
//                   sum +
//                   qty
//                 )

//               },

//               0

//             )

//         }


//         map[doc.date] =
//           (
//             map[doc.date] ||
//             0
//           ) +
//           units

//       })


//       return Object.entries(map)

//         .sort(
//           (
//             a,
//             b
//           ) =>
//             new Date(a[0]) -
//             new Date(b[0])
//         )

//         .slice(-14)

//         .map(
//           (
//             [
//               date,
//               units
//             ]
//           ) => ({

//             date:
//               formatDate(
//                 date
//               ).replace(
//                 /, \d{4}$/,
//                 ''
//               ),

//             units

//           })
//         )

//     }, [
//       challans,
//       invoices
//     ])


//   /* ============================================================
//      AVAILABLE REPORT MONTHS

//      Creates months from invoice dates.

//      Current month is always included.
//      ============================================================ */

//   const reportMonths =
//     useMemo(() => {

//       const months = new Set()


//       const now =
//         new Date()


//       const currentMonth =
//         `${now.getFullYear()}-${String(
//           now.getMonth() + 1
//         ).padStart(2, '0')}`


//       months.add(
//         currentMonth
//       )


//       if (invoices) {

//         invoices.forEach(
//           (invoice) => {

//             if (
//               !invoice?.date
//             ) {

//               return

//             }


//             const date =
//               new Date(
//                 invoice.date
//               )


//             if (
//               Number.isNaN(
//                 date.getTime()
//               )
//             ) {

//               return

//             }


//             const month =
//               `${date.getFullYear()}-${String(
//                 date.getMonth() + 1
//               ).padStart(2, '0')}`


//             months.add(month)

//           }
//         )

//       }


//       return Array.from(months)
//         .sort()
//         .reverse()

//     }, [invoices])


//   /* ============================================================
//      REPORT MONTH LABEL
//      ============================================================ */

//   function formatReportMonth(
//     monthValue
//   ) {

//     if (!monthValue) {
//       return ''
//     }


//     const [
//       year,
//       month
//     ] =
//       monthValue.split('-')


//     const date =
//       new Date(
//         Number(year),
//         Number(month) - 1,
//         1
//       )


//     return date.toLocaleString(
//       'en-US',
//       {
//         month: 'long',
//         year: 'numeric'
//       }
//     )

//   }


//   /* ============================================================
//      SELECTED MONTH REPORT
//      ============================================================ */

//   const monthlyReport =
//     useMemo(() => {

//       if (!invoices) {

//         return {

//           count: 0,

//           total: 0,

//           invoices: []

//         }

//       }


//       const thisMonthInvoices =
//         invoices.filter(
//           (invoice) => {

//             if (
//               !invoice?.date
//             ) {

//               return false

//             }


//             const invoiceDate =
//               new Date(
//                 invoice.date
//               )


//             if (
//               Number.isNaN(
//                 invoiceDate.getTime()
//               )
//             ) {

//               return false

//             }


//             const invoiceMonth =
//               `${invoiceDate.getFullYear()}-${String(
//                 invoiceDate.getMonth() + 1
//               ).padStart(2, '0')}`


//             return (
//               invoiceMonth ===
//               selectedReportMonth
//             )

//           }
//         )


//       const total =
//         thisMonthInvoices.reduce(

//           (
//             sum,
//             invoice
//           ) => {

//             const amount =
//               Number(

//                 invoice?.total ??
//                 invoice?.netTotal ??
//                 invoice?.net_total ??
//                 invoice?.grandTotal ??
//                 invoice?.amount ??
//                 0

//               ) || 0


//             return (
//               sum +
//               amount
//             )

//           },

//           0

//         )


//       return {

//         count:
//           thisMonthInvoices.length,

//         total,

//         invoices:
//           thisMonthInvoices

//       }

//     }, [
//       invoices,
//       selectedReportMonth
//     ])


//   /* ============================================================
//      RECENT DOCUMENTS
//      ============================================================ */

//   const recentDocs =
//     [
//       ...(challans || []),

//       ...(invoices || [])

//     ]

//       .sort(
//         (
//           a,
//           b
//         ) =>
//           (
//             b.createdAt ||
//             b.updatedAt ||
//             0
//           ) -
//           (
//             a.createdAt ||
//             a.updatedAt ||
//             0
//           )
//       )

//       .slice(
//         0,
//         6
//       )


//   /* ============================================================
//      RETURN
//      ============================================================ */

//   return (

//     <div>

//       {/* ========================================================
//           HEADER
//           ======================================================== */}

//       <div className="mb-6">

//         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

//           <div>

//             <h1 className="font-display text-2xl font-semibold text-ink">

//               Welcome back

//               {company?.name
//                 ? `, ${company.name}`
//                 : ''}

//             </h1>


//             <p className="text-sm text-slateink mt-0.5">

//               A quick overview of your business at a glance.

//             </p>

//           </div>


//           {/* ====================================================
//               OWNER MONTHLY REPORT BUTTON

//               ONLY OWNER CAN SEE THIS
//               ==================================================== */}

//           {isOwner && (

//             <button
//               type="button"
//               onClick={() => {

//                 const now =
//                   new Date()


//                 const currentMonth =
//                   `${now.getFullYear()}-${String(
//                     now.getMonth() + 1
//                   ).padStart(2, '0')}`


//                 setSelectedReportMonth(
//                   currentMonth
//                 )

//                 setShowMonthlyReport(
//                   true
//                 )

//               }}
//               className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-ink text-white text-sm font-medium hover:opacity-90 transition shadow-sm"
//             >

//               <CalendarDays
//                 size={18}
//               />

//               Monthly Report

//             </button>

//           )}

//         </div>

//       </div>


//       {/* ========================================================
//           LOADING
//           ======================================================== */}

//       {loading ? (

//         <Loader />

//       ) : (

//         <>

//           {/* ====================================================
//               STAT CARDS
//               ==================================================== */}

//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">

//             {/* CUSTOMERS */}

//             <StatCard
//               icon={Users}
//               label="Customers"
//               value={customers.length}
//               accent="teal"
//             />


//             {/* IN STOCK */}

//             <StatCard
//               icon={Boxes}
//               label="In Stock Units"
//               value={inStockUnits}
//               accent="ink"
//             />


//             {/* DEMO */}

//             <StatCard
//               icon={PackageCheck}
//               label="Demo Units"
//               value={demoUnits}
//               accent="amber"
//             />


//             {/* SOLD */}

//             <StatCard
//               icon={ShieldCheck}
//               label="Sold Units"
//               value={soldUnits}
//               accent="coral"
//             />


//             {/* INVOICES */}

//             <StatCard
//               icon={FileText}
//               label="Invoices"
//               value={invoices.length}
//               accent="teal"
//             />

//           </div>


//           {/* ====================================================
//               DELIVERY CHALLANS
//               ==================================================== */}

//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">

//             <StatCard
//               icon={FileText}
//               label="Delivery Challans"
//               value={challans.length}
//               accent="amber"
//             />

//           </div>


//           {/* ====================================================
//               STOCK CHARTS
//               ==================================================== */}

//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">

//             {/* ==================================================
//                 STOCK BY CATEGORY
//                 ================================================== */}

//             <div className="lg:col-span-2 bg-surface rounded-2xl border border-line shadow-card p-5">

//               <p className="font-display font-semibold text-ink mb-4">

//                 Stock by Category

//               </p>


//               {categoryData.length === 0 ? (

//                 <div className="h-[260px] flex items-center justify-center">

//                   <p className="text-sm text-slateink">

//                     Abhi koi stock available nahi hai.

//                   </p>

//                 </div>

//               ) : (

//                 <ResponsiveContainer
//                   width="100%"
//                   height={260}
//                 >

//                   <BarChart
//                     data={categoryData}
//                     margin={{
//                       top: 5,
//                       right: 10,
//                       left: 0,
//                       bottom: 5
//                     }}
//                   >

//                     <CartesianGrid
//                       strokeDasharray="3 3"
//                       stroke="#E4E8F0"
//                       vertical={false}
//                     />


//                     <XAxis
//                       dataKey="category"
//                       tick={{
//                         fontSize: 12,
//                         fill: '#64748B'
//                       }}
//                       axisLine={false}
//                       tickLine={false}
//                     />


//                     <YAxis
//                       tick={{
//                         fontSize: 12,
//                         fill: '#64748B'
//                       }}
//                       axisLine={false}
//                       tickLine={false}
//                       allowDecimals={false}
//                     />


//                     <Tooltip
//                       contentStyle={{
//                         borderRadius: 10,
//                         border:
//                           '1px solid #E4E8F0',
//                         fontSize: 12
//                       }}
//                       formatter={(value) => [
//                         value,
//                         'In Stock'
//                       ]}
//                     />


//                     <Bar
//                       dataKey="qty"
//                       name="In Stock"
//                       fill="#0FA6A6"
//                       radius={[
//                         6,
//                         6,
//                         0,
//                         0
//                       ]}
//                       maxBarSize={48}
//                     />

//                   </BarChart>

//                 </ResponsiveContainer>

//               )}

//             </div>


//             {/* ==================================================
//                 STOCK STATUS
//                 ================================================== */}

//             <div className="bg-surface rounded-2xl border border-line shadow-card p-5">

//               <p className="font-display font-semibold text-ink mb-4">

//                 Stock Status

//               </p>


//               {statusData.every(
//                 (item) =>
//                   Number(
//                     item.value
//                   ) === 0
//               ) ? (

//                 <div className="h-[260px] flex items-center justify-center">

//                   <p className="text-sm text-slateink">

//                     No stock data available.

//                   </p>

//                 </div>

//               ) : (

//                 <ResponsiveContainer
//                   width="100%"
//                   height={260}
//                 >

//                   <PieChart>

//                     <Pie
//                       data={statusData}
//                       dataKey="value"
//                       nameKey="name"
//                       innerRadius={55}
//                       outerRadius={85}
//                       paddingAngle={3}
//                     >

//                       {statusData.map(
//                         (
//                           entry,
//                           idx
//                         ) => (

//                           <Cell
//                             key={
//                               entry.name
//                             }
//                             fill={
//                               PIE_COLORS[
//                                 idx %
//                                 PIE_COLORS.length
//                               ]
//                             }
//                           />

//                         )
//                       )}

//                     </Pie>


//                     <Tooltip
//                       contentStyle={{
//                         borderRadius: 10,
//                         border:
//                           '1px solid #E4E8F0',
//                         fontSize: 12
//                       }}
//                       formatter={(value) => [
//                         value,
//                         'Units'
//                       ]}
//                     />

//                   </PieChart>

//                 </ResponsiveContainer>

//               )}


//               {/* LEGEND */}

//               <div className="flex justify-center gap-4 mt-2 flex-wrap">

//                 {statusData.map(
//                   (
//                     item,
//                     idx
//                   ) => (

//                     <div
//                       key={
//                         item.name
//                       }
//                       className="flex items-center gap-1.5 text-xs text-slateink"
//                     >

//                       <span
//                         className="h-2 w-2 rounded-full"
//                         style={{
//                           background:
//                             PIE_COLORS[
//                               idx %
//                               PIE_COLORS.length
//                             ]
//                         }}
//                       />


//                       <span>

//                         {item.name}

//                       </span>


//                       <span className="font-semibold text-ink">

//                         {item.value}

//                       </span>

//                     </div>

//                   )
//                 )}

//               </div>

//             </div>

//           </div>


//           {/* ====================================================
//               SALES TREND + RECENT ACTIVITY
//               ==================================================== */}

//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

//             {/* ==================================================
//                 UNITS DISPATCHED
//                 ================================================== */}

//             <div className="lg:col-span-2 bg-surface rounded-2xl border border-line shadow-card p-5">

//               <p className="font-display font-semibold text-ink mb-4">

//                 Units Dispatched (recent)

//               </p>


//               {salesTrend.length === 0 ? (

//                 <div className="h-[220px] flex items-center justify-center">

//                   <p className="text-sm text-slateink">

//                     Abhi tak koi dispatch nahi hua.

//                   </p>

//                 </div>

//               ) : (

//                 <ResponsiveContainer
//                   width="100%"
//                   height={220}
//                 >

//                   <LineChart
//                     data={salesTrend}
//                   >

//                     <CartesianGrid
//                       strokeDasharray="3 3"
//                       stroke="#E4E8F0"
//                       vertical={false}
//                     />


//                     <XAxis
//                       dataKey="date"
//                       tick={{
//                         fontSize: 11,
//                         fill: '#64748B'
//                       }}
//                       axisLine={false}
//                       tickLine={false}
//                     />


//                     <YAxis
//                       tick={{
//                         fontSize: 12,
//                         fill: '#64748B'
//                       }}
//                       axisLine={false}
//                       tickLine={false}
//                       allowDecimals={false}
//                     />


//                     <Tooltip
//                       contentStyle={{
//                         borderRadius: 10,
//                         border:
//                           '1px solid #E4E8F0',
//                         fontSize: 12
//                       }}
//                       formatter={(value) => [
//                         value,
//                         'Units'
//                       ]}
//                     />


//                     <Line
//                       type="monotone"
//                       dataKey="units"
//                       name="Units"
//                       stroke="#F5A524"
//                       strokeWidth={2.5}
//                       dot={false}
//                     />

//                   </LineChart>

//                 </ResponsiveContainer>

//               )}

//             </div>


//             {/* ==================================================
//                 RECENT ACTIVITY
//                 ================================================== */}

//             <div className="bg-surface rounded-2xl border border-line shadow-card p-5">

//               <p className="font-display font-semibold text-ink mb-4">

//                 Recent Activity

//               </p>


//               <div className="space-y-3">

//                 {recentDocs.length === 0 && (

//                   <p className="text-sm text-slateink">

//                     Abhi tak koi DC ya invoice nahi bana.

//                   </p>

//                 )}


//                 {recentDocs.map(
//                   (
//                     doc,
//                     index
//                   ) => (

//                     <div
//                       key={
//                         doc.id ||
//                         index
//                       }
//                       className="flex items-center justify-between text-sm"
//                     >

//                       <div>

//                         <p className="font-medium text-ink">

//                           {doc.customerName ||
//                             'Unknown Customer'}

//                         </p>


//                         <p className="text-xs text-slateink font-mono">

//                           {doc.dcNumber ||
//                             doc.invoiceNumber ||
//                             'Document'}

//                         </p>

//                       </div>


//                       <span className="text-xs text-slateink font-mono">

//                         {formatDate(
//                           doc.date
//                         )}

//                       </span>

//                     </div>

//                   )
//                 )}

//               </div>

//             </div>

//           </div>


//           {/* ====================================================
//               OWNER MONTHLY REPORT MODAL

//               ONLY OWNER
//               ==================================================== */}

//           {isOwner &&
//             showMonthlyReport && (

//               <div
//                 className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
//                 onClick={() =>
//                   setShowMonthlyReport(false)
//                 }
//               >

//                 <div
//                   className="w-full max-w-2xl max-h-[90vh] bg-surface rounded-2xl border border-line shadow-2xl overflow-hidden flex flex-col"
//                   onClick={(e) =>
//                     e.stopPropagation()
//                   }
//                 >

//                   {/* =================================================
//                       MODAL HEADER
//                       ================================================= */}

//                   <div className="flex items-center justify-between px-5 py-4 border-b border-line shrink-0">

//                     <div className="flex items-center gap-3">

//                       <div className="h-10 w-10 rounded-xl bg-teal-50 flex items-center justify-center">

//                         <CalendarDays
//                           size={20}
//                           className="text-teal-600"
//                         />

//                       </div>


//                       <div>

//                         <h2 className="font-display font-semibold text-ink">

//                           Monthly Report

//                         </h2>


//                         <p className="text-xs text-slateink">

//                           {formatReportMonth(
//                             selectedReportMonth
//                           )}

//                         </p>

//                       </div>

//                     </div>


//                     <button
//                       type="button"
//                       onClick={() =>
//                         setShowMonthlyReport(false)
//                       }
//                       className="h-9 w-9 rounded-lg flex items-center justify-center text-slateink hover:bg-slate-100 hover:text-ink transition"
//                     >

//                       <X size={19} />

//                     </button>

//                   </div>


//                   {/* =================================================
//                       MODAL BODY
//                       ================================================= */}

//                   <div className="p-5 overflow-y-auto">

//                     {/* =================================================
//                         MONTH DROPDOWN
//                         ================================================= */}

//                     <div className="mb-5">

//                       <label className="block text-sm font-medium text-ink mb-2">

//                         Select Month

//                       </label>


//                       <div className="relative">

//                         <CalendarDays
//                           size={17}
//                           className="absolute left-3 top-1/2 -translate-y-1/2 text-slateink pointer-events-none"
//                         />


//                         <select
//                           value={
//                             selectedReportMonth
//                           }
//                           onChange={(e) =>
//                             setSelectedReportMonth(
//                               e.target.value
//                             )
//                           }
//                           className="w-full appearance-none pl-10 pr-4 py-2.5 rounded-xl border border-line bg-surface text-sm text-ink outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 cursor-pointer"
//                         >

//                           {reportMonths.map(
//                             (month) => (

//                               <option
//                                 key={
//                                   month
//                                 }
//                                 value={
//                                   month
//                                 }
//                               >

//                                 {formatReportMonth(
//                                   month
//                                 )}

//                               </option>

//                             )
//                           )}

//                         </select>

//                       </div>

//                     </div>


//                     {/* =================================================
//                         SUMMARY CARDS
//                         ================================================= */}

//                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

//                       {/* =================================================
//                           INVOICES
//                           ================================================= */}

//                       <div className="rounded-2xl border border-line p-5">

//                         <div className="flex items-center justify-between mb-3">

//                           <p className="text-sm text-slateink">

//                             Invoices

//                           </p>


//                           <FileText
//                             size={19}
//                             className="text-teal-600"
//                           />

//                         </div>


//                         <p className="text-3xl font-semibold text-ink">

//                           {monthlyReport.count}

//                         </p>


//                         <p className="text-xs text-slateink mt-1">

//                           Invoices created in selected month

//                         </p>

//                       </div>


//                       {/* =================================================
//                           TOTAL EARNED
//                           ================================================= */}

//                       <div className="rounded-2xl border border-line p-5">

//                         <div className="flex items-center justify-between mb-3">

//                           <p className="text-sm text-slateink">

//                             Total Earned

//                           </p>


//                           <TrendingUp
//                             size={19}
//                             className="text-emerald-600"
//                           />

//                         </div>


//                         <p className="text-3xl font-semibold text-ink break-words">

//                           {monthlyReport.total.toLocaleString()}

//                         </p>


//                         <p className="text-xs text-slateink mt-1">

//                           Total invoice amount

//                         </p>

//                       </div>

//                     </div>


//                     {/* =================================================
//                         SELECTED MONTH TITLE
//                         ================================================= */}

//                     <div className="mt-6 mb-3 flex items-center justify-between">

//                       <p className="font-display font-semibold text-ink">

//                         {formatReportMonth(
//                           selectedReportMonth
//                         )} Invoices

//                       </p>


//                       <span className="text-xs text-slateink">

//                         {monthlyReport.count} total

//                       </span>

//                     </div>


//                     {/* =================================================
//                         INVOICE LIST
//                         ================================================= */}

//                     {monthlyReport.invoices.length === 0 ? (

//                       <div className="rounded-xl border border-dashed border-line p-8 text-center">

//                         <div className="mx-auto h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center mb-3">

//                           <FileText
//                             size={19}
//                             className="text-slateink"
//                           />

//                         </div>


//                         <p className="text-sm text-slateink">

//                           Is month abhi tak koi invoice nahi bana.

//                         </p>

//                       </div>

//                     ) : (

//                       <div className="space-y-2">

//                         {monthlyReport.invoices
//                           .slice()
//                           .sort(
//                             (
//                               a,
//                               b
//                             ) =>
//                               new Date(
//                                 b.date
//                               ) -
//                               new Date(
//                                 a.date
//                               )
//                           )
//                           .map(
//                             (
//                               invoice,
//                               index
//                             ) => {

//                               const amount =
//                                 Number(
//                                   invoice?.total ??
//                                   invoice?.netTotal ??
//                                   invoice?.net_total ??
//                                   invoice?.grandTotal ??
//                                   invoice?.amount ??
//                                   0
//                                 ) || 0


//                               return (

//                                 <div
//                                   key={
//                                     invoice.id ||
//                                     invoice.invoiceNumber ||
//                                     index
//                                   }
//                                   className="flex items-center justify-between gap-3 rounded-xl border border-line px-4 py-3 hover:bg-slate-50 transition"
//                                 >

//                                   <div className="min-w-0">

//                                     <p className="text-sm font-medium text-ink truncate">

//                                       {invoice.invoiceNumber ||
//                                         'Invoice'}

//                                     </p>


//                                     <p className="text-xs text-slateink mt-0.5">

//                                       {invoice.customerName ||
//                                         'Unknown Customer'}

//                                     </p>

//                                   </div>


//                                   <div className="text-right shrink-0">

//                                     <p className="text-sm font-semibold text-ink">

//                                       {amount.toLocaleString()}

//                                     </p>


//                                     <p className="text-xs text-slateink">

//                                       {invoice.date
//                                         ? formatDate(
//                                             invoice.date
//                                           )
//                                         : ''}

//                                     </p>

//                                   </div>

//                                 </div>

//                               )

//                             }
//                           )}

//                       </div>

//                     )}

//                   </div>


//                   {/* =================================================
//                       MODAL FOOTER
//                       ================================================= */}

//                   <div className="px-5 py-4 border-t border-line flex justify-end shrink-0">

//                     <button
//                       type="button"
//                       onClick={() =>
//                         setShowMonthlyReport(false)
//                       }
//                       className="px-4 py-2 rounded-xl border border-line text-sm font-medium text-ink hover:bg-slate-50 transition"
//                     >

//                       Close

//                     </button>

//                   </div>

//                 </div>

//               </div>

//             )}

//         </>

//       )}

//     </div>

//   )

// }








import { useEffect, useMemo, useState } from 'react'
import { ref, onValue } from 'firebase/database'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts'

import {
  Users,
  Boxes,
  FileText,
  ShieldCheck,
  PackageCheck,
  X,
  CalendarDays,
  TrendingUp
} from 'lucide-react'

import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'
import StatCard from '../components/StatCard'
import Loader from '../components/Loader'
import { formatDate } from '../utils/helpers'


/* ============================================================
   PIE COLORS
   ============================================================ */

const PIE_COLORS = [
  '#0FA6A6',
  '#F5A524',
  '#E8574A'
]


/* ============================================================
   HELPER
   GET FINAL INVOICE AMOUNT AFTER DISCOUNT
   ============================================================ */

function getInvoiceFinalAmount(invoice) {

  if (!invoice) return 0


  /*
   * First check if your invoice already stores
   * the final/net amount.
   *
   * This prevents discount from being applied twice.
   */

  const savedNetTotal =
    invoice?.netTotal ??
    invoice?.net_total ??
    invoice?.grandTotal


  if (
    savedNetTotal !== undefined &&
    savedNetTotal !== null &&
    savedNetTotal !== ''
  ) {

    const value =
      Number(savedNetTotal)

    if (
      Number.isFinite(value)
    ) {

      return Math.max(
        0,
        value
      )

    }

  }


  /*
   * Otherwise calculate:
   *
   * Total - Discount
   */

  const total =
    Number(
      invoice?.total ??
      invoice?.amount ??
      0
    ) || 0


  /*
   * Support different possible
   * discount field names.
   */

  const discountRaw =
    invoice?.discountAmount ??
    invoice?.discount_amount ??
    invoice?.discount ??
    invoice?.discountValue ??
    invoice?.discount_value ??
    0


  const discount =
    Number(
      discountRaw
    ) || 0


  /*
   * If discount is percentage based
   */

  const discountPercentage =
    Number(
      invoice?.discountPercentage ??
      invoice?.discount_percentage ??
      0
    ) || 0


  /*
   * If discountPercentage exists,
   * calculate percentage discount.
   */

  if (
    discountPercentage > 0
  ) {

    const percentageDiscount =
      (
        total *
        discountPercentage
      ) / 100


    return Math.max(
      0,
      total -
      percentageDiscount
    )

  }


  /*
   * Normal fixed discount
   */

  return Math.max(
    0,
    total -
    discount
  )

}


/* ============================================================
   HELPER
   GET ITEM QUANTITY SAFELY
   ============================================================ */

function getItemQuantity(item) {
  if (!item) return 0

  // Try different possible quantity field names
  const qty = 
    item?.qty ??
    item?.quantity ??
    item?.itemQty ??
    item?.itemQuantity ??
    item?.qtyOrdered ??
    0

  return Math.max(0, Number(qty) || 0)
}


/* ============================================================
   HELPER
   GET TOTAL UNITS FROM DOCUMENT ITEMS
   ============================================================ */

function getTotalUnitsFromDocument(doc) {
  if (!doc) return 0

  const items = doc?.items || []
  
  if (!Array.isArray(items) || items.length === 0) {
    return 0
  }

  let totalUnits = 0

  items.forEach((item) => {
    const qty = getItemQuantity(item)
    totalUnits += qty
  })

  return totalUnits
}


/* ============================================================
   MAIN DASHBOARD
   ============================================================ */

export default function Dashboard() {

  const {
    companyId,
    company,
    currentUser
  } = useAuth()


  /* ============================================================
     STATES
     ============================================================ */

  const [customers, setCustomers] =
    useState(null)

  const [stock, setStock] =
    useState(null)

  const [challans, setChallans] =
    useState(null)

  const [invoices, setInvoices] =
    useState(null)

  const [userRole, setUserRole] =
    useState(null)

  const [showMonthlyReport, setShowMonthlyReport] =
    useState(false)


  /* ============================================================
     SELECTED REPORT MONTH
     DEFAULT = CURRENT MONTH
     ============================================================ */

  const [selectedReportMonth, setSelectedReportMonth] =
    useState(() => {

      const now =
        new Date()

      return (
        `${now.getFullYear()}-` +
        `${String(
          now.getMonth() + 1
        ).padStart(2, '0')}`
      )

    })


  /* ============================================================
     LOAD USER ROLE
     ============================================================ */

  useEffect(() => {

    if (
      !companyId ||
      !currentUser?.uid
    ) {

      setUserRole(null)

      return

    }


    const roleRef =
      ref(
        db,
        `companies/${companyId}/team/${currentUser.uid}/role`
      )


    const unsubscribe =
      onValue(

        roleRef,

        (snapshot) => {

          const role =
            snapshot.val()


          console.log(
            'USER ROLE:',
            role
          )


          setUserRole(
            String(
              role || ''
            )
              .trim()
              .toLowerCase()
          )

        },

        (error) => {

          console.error(
            'Role read failed:',
            error
          )

          setUserRole(null)

        }

      )


    return () => {

      unsubscribe()

    }

  }, [
    companyId,
    currentUser?.uid
  ])


  /* ============================================================
     OWNER CHECK
     ============================================================ */

  const isOwner =
    userRole === 'owner'


  /* ============================================================
     LOAD COMPANY DATA
     ============================================================ */

  useEffect(() => {

    if (!companyId) return


    const onErr =
      (label) =>
      (err) => {

        console.error(
          `${label} read failed:`,
          err
        )

      }


    /* ==========================================================
       CUSTOMERS
       ========================================================== */

    const unsub1 =
      onValue(

        ref(
          db,
          `companies/${companyId}/customers`
        ),

        (snapshot) => {

          const value =
            snapshot.val() || {}


          const list =
            Object.values(value)


          setCustomers(list)

        },

        (err) => {

          onErr('customers')(err)

          setCustomers([])

        }

      )


    /* ==========================================================
       STOCK
       ========================================================== */

    const unsub2 =
      onValue(

        ref(
          db,
          `companies/${companyId}/stock`
        ),

        (snapshot) => {

          const value =
            snapshot.val() || {}


          const list =
            Object.values(value)


          setStock(list)

        },

        (err) => {

          onErr('stock')(err)

          setStock([])

        }

      )


    /* ==========================================================
       CHALLANS
       ========================================================== */

    const unsub3 =
      onValue(

        ref(
          db,
          `companies/${companyId}/challans`
        ),

        (snapshot) => {

          const value =
            snapshot.val() || {}


          const list =
            Object.values(value)


          setChallans(list)

        },

        (err) => {

          onErr('challans')(err)

          setChallans([])

        }

      )


    /* ==========================================================
       INVOICES
       ========================================================== */

    const unsub4 =
      onValue(

        ref(
          db,
          `companies/${companyId}/invoices`
        ),

        (snapshot) => {

          const value =
            snapshot.val() || {}


          const list =
            Object.values(value)


          setInvoices(list)

        },

        (err) => {

          onErr('invoices')(err)

          setInvoices([])

        }

      )


    return () => {

      unsub1()
      unsub2()
      unsub3()
      unsub4()

    }

  }, [companyId])


  /* ============================================================
     LOADING
     ============================================================ */

  const loading =
    !stock ||
    !customers ||
    !challans ||
    !invoices


  /* ============================================================
     STOCK STATUS NORMALIZER
     ============================================================ */

  function getStockStatus(item) {

    return String(
      item?.status || ''
    )
      .trim()
      .toLowerCase()

  }


  /* ============================================================
     STOCK QUANTITY
     ============================================================ */

  function getStockQuantity(item) {

    return Math.max(

      0,

      Number(
        item?.quantity ??
        item?.qty ??
        0
      ) || 0

    )

  }


  /* ============================================================
     IN STOCK UNITS
     ============================================================ */

  const inStockUnits =
    useMemo(() => {

      if (!stock) return 0


      return stock.reduce(

        (sum, item) => {

          const status =
            getStockStatus(item)


          const qty =
            getStockQuantity(item)


          if (
            status === 'sold' ||
            status === 'demo'
          ) {

            return sum

          }


          return (
            sum +
            qty
          )

        },

        0

      )

    }, [stock])


  /* ============================================================
     DEMO UNITS
     ============================================================ */

  const demoUnits =
    useMemo(() => {

      if (!stock) return 0


      return stock.reduce(

        (sum, item) => {

          const status =
            getStockStatus(item)


          const qty =
            getStockQuantity(item)


          if (
            status === 'demo'
          ) {

            return (
              sum +
              qty
            )

          }


          return sum

        },

        0

      )

    }, [stock])


  /* ============================================================
     SOLD UNITS
     ============================================================ */

  const soldUnits =
    useMemo(() => {

      if (!stock) return 0


      return stock.reduce(

        (sum, item) => {

          const status =
            getStockStatus(item)


          const qty =
            getStockQuantity(item)


          if (
            status === 'sold'
          ) {

            return (
              sum +
              qty
            )

          }


          return sum

        },

        0

      )

    }, [stock])


  /* ============================================================
     STOCK BY CATEGORY
     ONLY IN STOCK
     ============================================================ */

  const categoryData =
    useMemo(() => {

      if (!stock) return []


      const map = {}


      stock.forEach((item) => {

        const status =
          getStockStatus(item)


        if (
          status === 'sold' ||
          status === 'demo'
        ) {

          return

        }


        const category =
          String(
            item?.category ||
            'Uncategorized'
          )
            .trim()


        const qty =
          getStockQuantity(item)


        if (
          qty <= 0
        ) {

          return

        }


        map[category] =
          (
            map[category] ||
            0
          ) +
          qty

      })


      return Object.entries(map)

        .map(
          (
            [
              category,
              qty
            ]
          ) => ({

            category,

            qty

          })
        )

        .sort(
          (a, b) =>
            b.qty -
            a.qty
        )

    }, [stock])


  /* ============================================================
     STOCK STATUS
     ============================================================ */

  const statusData =
    useMemo(() => {

      return [

        {
          name: 'In Stock',
          value: inStockUnits
        },

        {
          name: 'Demo',
          value: demoUnits
        },

        {
          name: 'Sold',
          value: soldUnits
        }

      ]

    }, [
      inStockUnits,
      demoUnits,
      soldUnits
    ])


  /* ============================================================
     SALES / DISPATCH TREND - ONLY FROM DELIVERY CHALLANS
     ============================================================ */

  const salesTrend =
    useMemo(() => {

      // Only use Delivery Challans, NOT invoices
      if (!challans || challans.length === 0) {
        return []
      }

      const map = {}

      challans.forEach((challan) => {
        // Skip if no date
        if (!challan?.date) return

        // Get total units from this challan using the helper function
        const units = getTotalUnitsFromDocument(challan)

        // Skip if zero units (shouldn't happen but just in case)
        if (units <= 0) return

        // Add to map
        map[challan.date] = (map[challan.date] || 0) + units
      })

      // Convert to array and sort by date
      const result = Object.entries(map)
        .sort((a, b) => new Date(a[0]) - new Date(b[0]))
        .slice(-14) // Last 14 days
        .map(([date, units]) => ({
          date: formatDate(date).replace(/, \d{4}$/, ''),
          units: units
        }))

      return result

    }, [challans])


  /* ============================================================
     AVAILABLE REPORT MONTHS
     ============================================================ */

  const reportMonths =
    useMemo(() => {

      const months =
        new Set()


      const now =
        new Date()


      const currentMonth =
        `${now.getFullYear()}-` +
        `${String(
          now.getMonth() + 1
        ).padStart(2, '0')}`


      months.add(
        currentMonth
      )


      if (invoices) {

        invoices.forEach(
          (invoice) => {

            if (
              !invoice?.date
            ) {

              return

            }


            const date =
              new Date(
                invoice.date
              )


            if (
              Number.isNaN(
                date.getTime()
              )
            ) {

              return

            }


            const month =
              `${date.getFullYear()}-` +
              `${String(
                date.getMonth() + 1
              ).padStart(2, '0')}`


            months.add(month)

          }
        )

      }


      return Array.from(months)
        .sort()
        .reverse()

    }, [invoices])


  /* ============================================================
     REPORT MONTH LABEL
     ============================================================ */

  function formatReportMonth(
    monthValue
  ) {

    if (!monthValue) {
      return ''
    }


    const [
      year,
      month
    ] =
      monthValue.split('-')


    const date =
      new Date(
        Number(year),
        Number(month) - 1,
        1
      )


    return date.toLocaleString(
      'en-US',
      {
        month: 'long',
        year: 'numeric'
      }
    )

  }


  /* ============================================================
     SELECTED MONTH REPORT
     ============================================================ */

  const monthlyReport =
    useMemo(() => {

      if (!invoices) {

        return {

          count: 0,

          total: 0,

          invoices: []

        }

      }


      const thisMonthInvoices =
        invoices.filter(
          (invoice) => {

            if (
              !invoice?.date
            ) {

              return false

            }


            const invoiceDate =
              new Date(
                invoice.date
              )


            if (
              Number.isNaN(
                invoiceDate.getTime()
              )
            ) {

              return false

            }


            const invoiceMonth =
              `${invoiceDate.getFullYear()}-` +
              `${String(
                invoiceDate.getMonth() + 1
              ).padStart(2, '0')}`


            return (
              invoiceMonth ===
              selectedReportMonth
            )

          }
        )


      /*
       * IMPORTANT:
       *
       * Use getInvoiceFinalAmount()
       * instead of invoice.total.
       *
       * This makes the monthly report
       * show amount AFTER discount.
       */

      const total =
        thisMonthInvoices.reduce(

          (
            sum,
            invoice
          ) => {

            const amount =
              getInvoiceFinalAmount(
                invoice
              )


            return (
              sum +
              amount
            )

          },

          0

        )


      return {

        count:
          thisMonthInvoices.length,

        total,

        invoices:
          thisMonthInvoices

      }

    }, [
      invoices,
      selectedReportMonth
    ])


  /* ============================================================
     RECENT DOCUMENTS
     ============================================================ */

  const recentDocs =
    [
      ...(challans || []),

      ...(invoices || [])

    ]

      .sort(
        (
          a,
          b
        ) =>
          (
            b.createdAt ||
            b.updatedAt ||
            0
          ) -
          (
            a.createdAt ||
            a.updatedAt ||
            0
          )
      )

      .slice(
        0,
        6
      )


  /* ============================================================
     RETURN
     ============================================================ */

  return (

    <div>

      {/* ========================================================
          HEADER
          ======================================================== */}

      <div className="mb-6">

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

          <div>

            <h1 className="font-display text-2xl font-semibold text-ink">

              Welcome back

              {company?.name
                ? `, ${company.name}`
                : ''}

            </h1>


            <p className="text-sm text-slateink mt-0.5">

              A quick overview of your business at a glance.

            </p>

          </div>


          {/* ====================================================
              OWNER MONTHLY REPORT BUTTON
              ==================================================== */}

          {isOwner && (

            <button
              type="button"
              onClick={() => {

                const now =
                  new Date()


                const currentMonth =
                  `${now.getFullYear()}-` +
                  `${String(
                    now.getMonth() + 1
                  ).padStart(2, '0')}`


                setSelectedReportMonth(
                  currentMonth
                )


                setShowMonthlyReport(
                  true
                )

              }}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-ink text-white text-sm font-medium hover:opacity-90 transition shadow-sm"
            >

              <CalendarDays
                size={18}
              />

              Monthly Report

            </button>

          )}

        </div>

      </div>


      {/* ========================================================
          LOADING
          ======================================================== */}

      {loading ? (

        <Loader />

      ) : (

        <>

          {/* ====================================================
              STAT CARDS
              ==================================================== */}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">

            <StatCard
              icon={Users}
              label="Customers"
              value={customers.length}
              accent="teal"
            />


            <StatCard
              icon={Boxes}
              label="In Stock Units"
              value={inStockUnits}
              accent="ink"
            />


            <StatCard
              icon={PackageCheck}
              label="Demo Units"
              value={demoUnits}
              accent="amber"
            />


            <StatCard
              icon={ShieldCheck}
              label="Sold Units"
              value={soldUnits}
              accent="coral"
            />


            <StatCard
              icon={FileText}
              label="Invoices"
              value={invoices.length}
              accent="teal"
            />

          </div>


          {/* ====================================================
              DELIVERY CHALLANS
              ==================================================== */}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">

            <StatCard
              icon={FileText}
              label="Delivery Challans"
              value={challans.length}
              accent="amber"
            />

          </div>


          {/* ====================================================
              STOCK CHARTS
              ==================================================== */}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">

            {/* ==================================================
                STOCK BY CATEGORY
                ================================================== */}

            <div className="lg:col-span-2 bg-surface rounded-2xl border border-line shadow-card p-5">

              <p className="font-display font-semibold text-ink mb-4">

                Stock by Category

              </p>


              {categoryData.length === 0 ? (

                <div className="h-[260px] flex items-center justify-center">

                  <p className="text-sm text-slateink">

                    Abhi koi stock available nahi hai.

                  </p>

                </div>

              ) : (

                <ResponsiveContainer
                  width="100%"
                  height={260}
                >

                  <BarChart
                    data={categoryData}
                    margin={{
                      top: 5,
                      right: 10,
                      left: 0,
                      bottom: 5
                    }}
                  >

                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#E4E8F0"
                      vertical={false}
                    />


                    <XAxis
                      dataKey="category"
                      tick={{
                        fontSize: 12,
                        fill: '#64748B'
                      }}
                      axisLine={false}
                      tickLine={false}
                    />


                    <YAxis
                      tick={{
                        fontSize: 12,
                        fill: '#64748B'
                      }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />


                    <Tooltip
                      contentStyle={{
                        borderRadius: 10,
                        border:
                          '1px solid #E4E8F0',
                        fontSize: 12
                      }}
                      formatter={(value) => [
                        value,
                        'In Stock'
                      ]}
                    />


                    <Bar
                      dataKey="qty"
                      name="In Stock"
                      fill="#0FA6A6"
                      radius={[
                        6,
                        6,
                        0,
                        0
                      ]}
                      maxBarSize={48}
                    />

                  </BarChart>

                </ResponsiveContainer>

              )}

            </div>


            {/* ==================================================
                STOCK STATUS
                ================================================== */}

            <div className="bg-surface rounded-2xl border border-line shadow-card p-5">

              <p className="font-display font-semibold text-ink mb-4">

                Stock Status

              </p>


              {statusData.every(
                (item) =>
                  Number(
                    item.value
                  ) === 0
              ) ? (

                <div className="h-[260px] flex items-center justify-center">

                  <p className="text-sm text-slateink">

                    No stock data available.

                  </p>

                </div>

              ) : (

                <ResponsiveContainer
                  width="100%"
                  height={260}
                >

                  <PieChart>

                    <Pie
                      data={statusData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                    >

                      {statusData.map(
                        (
                          entry,
                          idx
                        ) => (

                          <Cell
                            key={
                              entry.name
                            }
                            fill={
                              PIE_COLORS[
                                idx %
                                PIE_COLORS.length
                              ]
                            }
                          />

                        )
                      )}

                    </Pie>


                    <Tooltip
                      contentStyle={{
                        borderRadius: 10,
                        border:
                          '1px solid #E4E8F0',
                        fontSize: 12
                      }}
                      formatter={(value) => [
                        value,
                        'Units'
                      ]}
                    />

                  </PieChart>

                </ResponsiveContainer>

              )}


              {/* LEGEND */}

              <div className="flex justify-center gap-4 mt-2 flex-wrap">

                {statusData.map(
                  (
                    item,
                    idx
                  ) => (

                    <div
                      key={
                        item.name
                      }
                      className="flex items-center gap-1.5 text-xs text-slateink"
                    >

                      <span
                        className="h-2 w-2 rounded-full"
                        style={{
                          background:
                            PIE_COLORS[
                              idx %
                              PIE_COLORS.length
                            ]
                        }}
                      />


                      <span>

                        {item.name}

                      </span>


                      <span className="font-semibold text-ink">

                        {item.value}

                      </span>

                    </div>

                  )
                )}

              </div>

            </div>

          </div>


          {/* ====================================================
              SALES TREND + RECENT ACTIVITY
              ==================================================== */}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

            {/* ==================================================
                UNITS DISPATCHED - ONLY FROM DELIVERY CHALLANS
                ================================================== */}

            <div className="lg:col-span-2 bg-surface rounded-2xl border border-line shadow-card p-5">

              <p className="font-display font-semibold text-ink mb-4">

                Units Dispatched (from Delivery Challans)

              </p>


              {salesTrend.length === 0 ? (

                <div className="h-[220px] flex items-center justify-center">

                  <p className="text-sm text-slateink">

                    Abhi tak koi Delivery Challan nahi bana.

                  </p>

                </div>

              ) : (

                <ResponsiveContainer
                  width="100%"
                  height={220}
                >

                  <LineChart
                    data={salesTrend}
                  >

                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#E4E8F0"
                      vertical={false}
                    />


                    <XAxis
                      dataKey="date"
                      tick={{
                        fontSize: 11,
                        fill: '#64748B'
                      }}
                      axisLine={false}
                      tickLine={false}
                    />


                    <YAxis
                      tick={{
                        fontSize: 12,
                        fill: '#64748B'
                      }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />


                    <Tooltip
                      contentStyle={{
                        borderRadius: 10,
                        border:
                          '1px solid #E4E8F0',
                        fontSize: 12
                      }}
                      formatter={(value) => [
                        value,
                        'Units'
                      ]}
                    />


                    <Line
                      type="monotone"
                      dataKey="units"
                      name="Units"
                      stroke="#F5A524"
                      strokeWidth={2.5}
                      dot={false}
                    />

                  </LineChart>

                </ResponsiveContainer>

              )}

            </div>


            {/* ==================================================
                RECENT ACTIVITY
                ================================================== */}

            <div className="bg-surface rounded-2xl border border-line shadow-card p-5">

              <p className="font-display font-semibold text-ink mb-4">

                Recent Activity

              </p>


              <div className="space-y-3">

                {recentDocs.length === 0 && (

                  <p className="text-sm text-slateink">

                    Abhi tak koi DC ya invoice nahi bana.

                  </p>

                )}


                {recentDocs.map(
                  (
                    doc,
                    index
                  ) => (

                    <div
                      key={
                        doc.id ||
                        index
                      }
                      className="flex items-center justify-between text-sm"
                    >

                      <div>

                        <p className="font-medium text-ink">

                          {doc.customerName ||
                            'Unknown Customer'}

                        </p>


                        <p className="text-xs text-slateink font-mono">

                          {doc.dcNumber ||
                            doc.invoiceNumber ||
                            'Document'}

                        </p>

                      </div>


                      <span className="text-xs text-slateink font-mono">

                        {formatDate(
                          doc.date
                        )}

                      </span>

                    </div>

                  )
                )}

              </div>

            </div>

          </div>


          {/* ====================================================
              OWNER MONTHLY REPORT MODAL
              ==================================================== */}

          {isOwner &&
            showMonthlyReport && (

              <div
                className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
                onClick={() =>
                  setShowMonthlyReport(false)
                }
              >

                <div
                  className="w-full max-w-2xl max-h-[90vh] bg-surface rounded-2xl border border-line shadow-2xl overflow-hidden flex flex-col"
                  onClick={(e) =>
                    e.stopPropagation()
                  }
                >

                  {/* =================================================
                      MODAL HEADER
                      ================================================= */}

                  <div className="flex items-center justify-between px-5 py-4 border-b border-line shrink-0">

                    <div className="flex items-center gap-3">

                      <div className="h-10 w-10 rounded-xl bg-teal-50 flex items-center justify-center">

                        <CalendarDays
                          size={20}
                          className="text-teal-600"
                        />

                      </div>


                      <div>

                        <h2 className="font-display font-semibold text-ink">

                          Monthly Report

                        </h2>


                        <p className="text-xs text-slateink">

                          {formatReportMonth(
                            selectedReportMonth
                          )}

                        </p>

                      </div>

                    </div>


                    <button
                      type="button"
                      onClick={() =>
                        setShowMonthlyReport(false)
                      }
                      className="h-9 w-9 rounded-lg flex items-center justify-center text-slateink hover:bg-slate-100 hover:text-ink transition"
                    >

                      <X size={19} />

                    </button>

                  </div>


                  {/* =================================================
                      MODAL BODY
                      ================================================= */}

                  <div className="p-5 overflow-y-auto">

                    {/* MONTH DROPDOWN */}

                    <div className="mb-5">

                      <label className="block text-sm font-medium text-ink mb-2">

                        Select Month

                      </label>


                      <div className="relative">

                        <CalendarDays
                          size={17}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-slateink pointer-events-none"
                        />


                        <select
                          value={
                            selectedReportMonth
                          }
                          onChange={(e) =>
                            setSelectedReportMonth(
                              e.target.value
                            )
                          }
                          className="w-full appearance-none pl-10 pr-4 py-2.5 rounded-xl border border-line bg-surface text-sm text-ink outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 cursor-pointer"
                        >

                          {reportMonths.map(
                            (month) => (

                              <option
                                key={
                                  month
                                }
                                value={
                                  month
                                }
                              >

                                {formatReportMonth(
                                  month
                                )}

                              </option>

                            )
                          )}

                        </select>

                      </div>

                    </div>


                    {/* =================================================
                        SUMMARY CARDS
                        ================================================= */}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                      {/* INVOICES */}

                      <div className="rounded-2xl border border-line p-5">

                        <div className="flex items-center justify-between mb-3">

                          <p className="text-sm text-slateink">

                            Invoices

                          </p>


                          <FileText
                            size={19}
                            className="text-teal-600"
                          />

                        </div>


                        <p className="text-3xl font-semibold text-ink">

                          {monthlyReport.count}

                        </p>


                        <p className="text-xs text-slateink mt-1">

                          Invoices created in selected month

                        </p>

                      </div>


                      {/* TOTAL AFTER DISCOUNT */}

                      <div className="rounded-2xl border border-line p-5">

                        <div className="flex items-center justify-between mb-3">

                          <p className="text-sm text-slateink">

                            Total Earned

                          </p>


                          <TrendingUp
                            size={19}
                            className="text-emerald-600"
                          />

                        </div>


                        <p className="text-3xl font-semibold text-ink break-words">

                          {monthlyReport.total.toLocaleString()}

                        </p>


                        <p className="text-xs text-slateink mt-1">

                          Total after discount

                        </p>

                      </div>

                    </div>


                    {/* =================================================
                        SELECTED MONTH TITLE
                        ================================================= */}

                    <div className="mt-6 mb-3 flex items-center justify-between">

                      <p className="font-display font-semibold text-ink">

                        {formatReportMonth(
                          selectedReportMonth
                        )} Invoices

                      </p>


                      <span className="text-xs text-slateink">

                        {monthlyReport.count} total

                      </span>

                    </div>


                    {/* =================================================
                        INVOICE LIST
                        ================================================= */}

                    {monthlyReport.invoices.length === 0 ? (

                      <div className="rounded-xl border border-dashed border-line p-8 text-center">

                        <div className="mx-auto h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center mb-3">

                          <FileText
                            size={19}
                            className="text-slateink"
                          />

                        </div>


                        <p className="text-sm text-slateink">

                          Is month abhi tak koi invoice nahi bana.

                        </p>

                      </div>

                    ) : (

                      <div className="space-y-2">

                        {monthlyReport.invoices
                          .slice()
                          .sort(
                            (
                              a,
                              b
                            ) =>
                              new Date(
                                b.date
                              ) -
                              new Date(
                                a.date
                              )
                          )
                          .map(
                            (
                              invoice,
                              index
                            ) => {

                              /*
                               * IMPORTANT:
                               *
                               * Individual invoice amount
                               * is also AFTER DISCOUNT.
                               */

                              const amount =
                                getInvoiceFinalAmount(
                                  invoice
                                )


                              return (

                                <div
                                  key={
                                    invoice.id ||
                                    invoice.invoiceNumber ||
                                    index
                                  }
                                  className="flex items-center justify-between gap-3 rounded-xl border border-line px-4 py-3 hover:bg-slate-50 transition"
                                >

                                  <div className="min-w-0">

                                    <p className="text-sm font-medium text-ink truncate">

                                      {invoice.invoiceNumber ||
                                        'Invoice'}

                                    </p>


                                    <p className="text-xs text-slateink mt-0.5">

                                      {invoice.customerName ||
                                        'Unknown Customer'}

                                    </p>

                                  </div>


                                  <div className="text-right shrink-0">

                                    <p className="text-sm font-semibold text-ink">

                                      {amount.toLocaleString()}

                                    </p>


                                    <p className="text-xs text-slateink">

                                      {invoice.date
                                        ? formatDate(
                                            invoice.date
                                          )
                                        : ''}

                                    </p>

                                  </div>

                                </div>

                              )

                            }
                          )}

                      </div>

                    )}

                  </div>


                  {/* =================================================
                      MODAL FOOTER
                      ================================================= */}

                  <div className="px-5 py-4 border-t border-line flex justify-end shrink-0">

                    <button
                      type="button"
                      onClick={() =>
                        setShowMonthlyReport(false)
                      }
                      className="px-4 py-2 rounded-xl border border-line text-sm font-medium text-ink hover:bg-slate-50 transition"
                    >

                      Close

                    </button>

                  </div>

                </div>

              </div>

            )}

        </>

      )}

    </div>

  )

}