import { STATUS_META } from '../utils/constants.js'

export default function StatusBadge({ status, size = 'sm' }) {
  const meta = STATUS_META[status] || { label: status, color: '#7c7468' }
  const color = meta.color

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full font-semibold tracking-wide"
      style={{
        color,
        background: `color-mix(in srgb, ${color} 12%, #FFFFFF)`,
        border: `1.5px solid color-mix(in srgb, ${color} 28%, transparent)`,
        padding: size === 'lg' ? '6px 14px' : '4px 11px',
        fontSize: size === 'lg' ? '13px' : '11.5px',
      }}
    >
      <span
        className="rounded-full"
        style={{ width: size === 'lg' ? 8 : 6, height: size === 'lg' ? 8 : 6, background: color }}
      />
      {meta.label}
    </span>
  )
}
