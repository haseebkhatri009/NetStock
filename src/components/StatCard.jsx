export default function StatCard({ icon: Icon, label, value, accent = 'teal', hint }) {
  const accents = {
    teal: 'bg-teal-light text-teal-dark',
    amber: 'bg-amber-light text-amber',
    coral: 'bg-coral-light text-coral',
    ink: 'bg-ink/5 text-ink'
  }
  return (
    <div className="bg-surface rounded-2xl border border-line shadow-card p-5 flex items-start justify-between">
      <div>
        <p className="text-xs font-medium text-slateink uppercase tracking-wide">{label}</p>
        <p className="mt-2 text-2xl font-display font-semibold text-ink">{value}</p>
        {hint && <p className="mt-1 text-xs text-slateink">{hint}</p>}
      </div>
      <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${accents[accent]}`}>
        <Icon size={18} />
      </div>
    </div>
  )
}
