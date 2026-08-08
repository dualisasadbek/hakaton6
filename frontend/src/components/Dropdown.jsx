import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Check } from 'lucide-react'

// Native select o'rniga foydalaniladigan custom dropdown
export default function Dropdown({
  value,
  onChange,
  options = [],
  placeholder = 'Tanlang',
  className = '',
  disabled = false,
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  const current = options.find((o) => o.value === value)
  const Icon = current?.icon

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`flex h-10 w-full items-center justify-between gap-2 rounded-xl border bg-surface px-3.5 text-sm font-medium transition ${
          open ? 'border-bronze-600 ring-4 ring-bronze-glow' : 'border-line hover:border-bronze-600'
        } ${current ? 'text-ink-900' : 'text-ink-400'} ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
      >
        <span className="flex min-w-0 items-center gap-2">
          {Icon && <Icon size={15} className="shrink-0 text-bronze-600" />}
          <span className="truncate">{current ? current.label : placeholder}</span>
        </span>
        <ChevronDown
          size={16}
          className={`shrink-0 text-ink-400 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            role="listbox"
            className="absolute z-[1200] mt-2 max-h-64 w-full min-w-[170px] overflow-auto rounded-xl border border-line bg-surface p-1.5 shadow-card-lg"
          >
            {options.map((o) => {
              const OIcon = o.icon
              const active = o.value === value
              return (
                <li key={o.value}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => {
                      onChange(o.value)
                      setOpen(false)
                    }}
                    className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium transition ${
                      active ? 'bg-bronze-600 text-white' : 'text-ink-700 hover:bg-bone-100'
                    }`}
                  >
                    {OIcon && <OIcon size={15} className={active ? 'text-white' : 'text-bronze-600'} />}
                    <span className="flex-1 truncate">{o.label}</span>
                    {active && <Check size={15} className="shrink-0" />}
                  </button>
                </li>
              )
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}
