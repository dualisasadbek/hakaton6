export function Spinner({ size = 'md', className = '' }) {
  const sizeClass =
    size === 'sm' ? 'h-4 w-4 border-2' : size === 'lg' ? 'h-12 w-12 border-4' : 'h-9 w-9 border-[3px]'
  return (
    <span
      className={`inline-block animate-spin rounded-full border-line border-t-bronze-600 ${sizeClass} ${className}`}
      role="status"
      aria-label="Yuklanmoqda"
    />
  )
}

export default Spinner

export function SpinnerWrap({ label = 'Yuklanmoqda...' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <Spinner size="lg" />
      <p className="text-sm text-ink-500">{label}</p>
    </div>
  )
}
