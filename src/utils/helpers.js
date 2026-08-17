export const CATEGORIES = ['IP Phone', 'UCM', 'Camera', 'Access Point']

export const WARRANTY_MONTHS = 12 // default warranty period, tweak as needed

export function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

export function formatDate(value) {
  if (!value) return '—'
  const d = typeof value === 'number' ? new Date(value) : new Date(value)
  if (Number.isNaN(d.getTime())) return String(value)
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function addMonths(dateStr, months) {
  const d = new Date(dateStr)
  d.setMonth(d.getMonth() + months)
  return d
}

export function normalizeMac(mac) {
  return (mac || '').trim().toUpperCase().replace(/[\s:-]/g, ':').replace(/^:|:$/g, '')
}

export function docNumber(prefix) {
  const now = new Date()
  const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(
    now.getDate()
  ).padStart(2, '0')}`
  const rand = Math.floor(1000 + Math.random() * 9000)
  return `${prefix}-${stamp}-${rand}`
}

export function currency(n) {
  const num = Number(n || 0)
  return num.toLocaleString('en-PK', { maximumFractionDigits: 0 })
}
