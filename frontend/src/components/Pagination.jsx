import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null

  // Sahifa raqamlarini hosil qilish (1 ... 3 4 5 ... 9)
  const pages = []
  const add = (p) => pages.push(p)

  add(1)
  for (let p = Math.max(2, page - 1); p <= Math.min(totalPages - 1, page + 1); p++) add(p)
  if (totalPages > 1) add(totalPages)

  const unique = [...new Set(pages)]
  const items = []
  let prev = 0
  for (const p of unique) {
    if (p - prev > 1) items.push('...')
    items.push(p)
    prev = p
  }

  return (
    <nav className="flex items-center justify-center gap-1.5 pt-6" aria-label="Sahifalash">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="flex h-10 w-10 items-center justify-center rounded-lg border border-line bg-surface text-ink-700 transition hover:border-bronze-600 hover:text-bronze-700 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Oldingi"
      >
        <ChevronLeft size={18} />
      </button>

      {items.map((it, i) =>
        it === '...' ? (
          <span key={`d${i}`} className="px-1 text-ink-400">
            …
          </span>
        ) : (
          <button
            key={it}
            onClick={() => onPageChange(it)}
            className={`h-10 min-w-10 rounded-lg px-2 text-sm font-semibold transition ${
              it === page
                ? 'bg-charcoal text-bone-50 shadow-card'
                : 'border border-line bg-surface text-ink-700 hover:border-bronze-600 hover:text-bronze-700'
            }`}
          >
            {it}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="flex h-10 w-10 items-center justify-center rounded-lg border border-line bg-surface text-ink-700 transition hover:border-bronze-600 hover:text-bronze-700 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Keyingi"
      >
        <ChevronRight size={18} />
      </button>
    </nav>
  )
}
