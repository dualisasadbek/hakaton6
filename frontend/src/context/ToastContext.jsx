import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'

const ToastContext = createContext(null)

const ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const idRef = useRef(0)

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const push = useCallback(
    (type, message) => {
      const id = ++idRef.current
      setToasts((prev) => [...prev, { id, type, message }])
      setTimeout(() => remove(id), 4200)
    },
    [remove]
  )

  const api = useMemo(
    () => ({
      success: (m) => push('success', m),
      error: (m) => push('error', m),
      info: (m) => push('info', m),
    }),
    [push]
  )

  return (
    <ToastContext.Provider value={api}>
      {children}

      {/* Toast stack */}
      <div className="toast-stack fixed right-5 top-24 z-[2000] flex w-[min(92vw,380px)] flex-col gap-2.5">
        <AnimatePresence>
          {toasts.map((t) => {
            const Icon = ICONS[t.type]
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 40 }}
                transition={{ duration: 0.25 }}
                className={`pointer-events-auto flex items-start gap-3 rounded-xl border border-line bg-surface px-4 py-3.5 shadow-card-lg ${
                  t.type === 'success'
                    ? 'border-l-4 border-l-success'
                    : t.type === 'error'
                      ? 'border-l-4 border-l-danger'
                      : 'border-l-4 border-l-info'
                }`}
              >
                <Icon
                  size={20}
                  className={`mt-0.5 shrink-0 ${
                    t.type === 'success'
                      ? 'text-success'
                      : t.type === 'error'
                        ? 'text-danger'
                        : 'text-info'
                  }`}
                />
                <p className="flex-1 text-sm text-ink-700">{t.message}</p>
                <button
                  onClick={() => remove(t.id)}
                  className="rounded-md p-1 text-ink-400 transition hover:bg-surface-2 hover:text-ink-900"
                  aria-label="Yopish"
                >
                  <X size={16} />
                </button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast ToastProvider ichida ishlatilishi kerak')
  return ctx
}
