export default function Loader({ label = 'Loading…' }) {
  return (
    <div className="flex h-full min-h-[200px] w-full items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="relative h-10 w-10">
          <div className="absolute inset-0 rounded-full border-2 border-teal-light" />
          <div className="absolute inset-0 rounded-full border-2 border-teal border-t-transparent animate-spin" />
        </div>
        <span className="text-sm text-slateink font-medium">{label}</span>
      </div>
    </div>
  )
}
