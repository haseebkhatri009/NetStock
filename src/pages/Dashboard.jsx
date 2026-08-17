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
import { Users, Boxes, FileText, ShieldCheck } from 'lucide-react'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'
import StatCard from '../components/StatCard'
import Loader from '../components/Loader'
import { formatDate } from '../utils/helpers'

const PIE_COLORS = ['#0FA6A6', '#F5A524', '#E8574A', '#3B82F6', '#8B5CF6', '#64748B']

export default function Dashboard() {
  const { companyId, company } = useAuth()
  const [customers, setCustomers] = useState(null)
  const [stock, setStock] = useState(null)
  const [challans, setChallans] = useState(null)
  const [invoices, setInvoices] = useState(null)

  useEffect(() => {
    if (!companyId) return
    const onErr = (label) => (err) => {
      console.error(`${label} read failed:`, err)
    }
    const unsub1 = onValue(
      ref(db, `companies/${companyId}/customers`),
      (s) => setCustomers(Object.values(s.val() || {})),
      (err) => {
        onErr('customers')(err)
        setCustomers([])
      }
    )
    const unsub2 = onValue(
      ref(db, `companies/${companyId}/stock`),
      (s) => setStock(Object.values(s.val() || {})),
      (err) => {
        onErr('stock')(err)
        setStock([])
      }
    )
    const unsub3 = onValue(
      ref(db, `companies/${companyId}/challans`),
      (s) => setChallans(Object.values(s.val() || {})),
      (err) => {
        onErr('challans')(err)
        setChallans([])
      }
    )
    const unsub4 = onValue(
      ref(db, `companies/${companyId}/invoices`),
      (s) => setInvoices(Object.values(s.val() || {})),
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

  const loading = !stock || !customers || !challans || !invoices

  const categoryData = useMemo(() => {
    if (!stock) return []
    const map = {}
    stock.forEach((s) => {
      map[s.category] = (map[s.category] || 0) + Number(s.quantity || 0)
    })
    return Object.entries(map).map(([category, qty]) => ({ category, qty }))
  }, [stock])

  const statusData = useMemo(() => {
    if (!stock) return []
    let inStock = 0
    let sold = 0
    stock.forEach((s) => (s.status === 'sold' ? sold++ : inStock++))
    return [
      { name: 'In Stock', value: inStock },
      { name: 'Sold', value: sold }
    ]
  }, [stock])

  const salesTrend = useMemo(() => {
    const all = [...(challans || []), ...(invoices || [])]
    const map = {}
    all.forEach((d) => {
      if (!d.date) return
      map[d.date] = (map[d.date] || 0) + (d.items?.length || 0)
    })
    return Object.entries(map)
      .sort((a, b) => new Date(a[0]) - new Date(b[0]))
      .slice(-14)
      .map(([date, units]) => ({ date: formatDate(date).replace(/, \d{4}$/, ''), units }))
  }, [challans, invoices])

  const totalStockUnits = (stock || []).reduce((sum, s) => sum + Number(s.quantity || 0), 0)
  const recentDocs = [...(challans || []), ...(invoices || [])]
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
    .slice(0, 6)

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-ink">
          Welcome back{company?.name ? `, ${company.name}` : ''}
        </h1>
        <p className="text-sm text-slateink mt-0.5">Aapke business ka ek nazar mein overview.</p>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard icon={Users} label="Customers" value={customers.length} accent="teal" />
            <StatCard icon={Boxes} label="Stock Units" value={totalStockUnits} accent="ink" />
            <StatCard
              icon={FileText}
              label="Delivery Challans"
              value={challans.length}
              accent="amber"
            />
            <StatCard
              icon={ShieldCheck}
              label="Invoices"
              value={invoices.length}
              accent="coral"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            <div className="lg:col-span-2 bg-surface rounded-2xl border border-line shadow-card p-5">
              <p className="font-display font-semibold text-ink mb-4">Stock by Category</p>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E4E8F0" vertical={false} />
                  <XAxis dataKey="category" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #E4E8F0', fontSize: 12 }} />
                  <Bar dataKey="qty" fill="#0FA6A6" radius={[6, 6, 0, 0]} maxBarSize={48} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-surface rounded-2xl border border-line shadow-card p-5">
              <p className="font-display font-semibold text-ink mb-4">Stock Status</p>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                  >
                    {statusData.map((_, idx) => (
                      <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #E4E8F0', fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 mt-2">
                {statusData.map((s, idx) => (
                  <div key={s.name} className="flex items-center gap-1.5 text-xs text-slateink">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ background: PIE_COLORS[idx % PIE_COLORS.length] }}
                    />
                    {s.name}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 bg-surface rounded-2xl border border-line shadow-card p-5">
              <p className="font-display font-semibold text-ink mb-4">Units Dispatched (recent)</p>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={salesTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E4E8F0" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #E4E8F0', fontSize: 12 }} />
                  <Line type="monotone" dataKey="units" stroke="#F5A524" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-surface rounded-2xl border border-line shadow-card p-5">
              <p className="font-display font-semibold text-ink mb-4">Recent Activity</p>
              <div className="space-y-3">
                {recentDocs.length === 0 && (
                  <p className="text-sm text-slateink">Abhi tak koi DC ya invoice nahi bana.</p>
                )}
                {recentDocs.map((d, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium text-ink">{d.customerName}</p>
                      <p className="text-xs text-slateink font-mono">
                        {d.dcNumber || d.invoiceNumber}
                      </p>
                    </div>
                    <span className="text-xs text-slateink font-mono">{formatDate(d.date)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
