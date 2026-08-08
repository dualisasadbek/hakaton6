import { MapPin, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

// Mustaqil auth sahifasi (Layoutdan tashqarida, to'liq ekran)
export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-bone-50 px-6 py-12">
      {/* fon */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(circle at 15% 20%, rgba(44,62,80,0.10), transparent 40%), radial-gradient(circle at 85% 85%, rgba(71,85,105,0.10), transparent 40%)',
        }}
      />

      {/* Bosh sahifaga qaytish */}
      <Link
        to="/"
        className="absolute left-5 top-5 inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-ink-500 transition hover:bg-surface-2 hover:text-ink-900"
      >
        <ArrowLeft size={16} />
        Bosh sahifa
      </Link>

      <div className="relative grid w-full max-w-[1100px] items-center gap-12 lg:grid-cols-2">
        {/* Brand paneli */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="hidden lg:block"
        >
          <div className="relative overflow-hidden rounded-[28px] bg-charcoal p-10 shadow-card-lg">
            <div
              className="pointer-events-none absolute inset-0 opacity-70"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 15% 20%, rgba(44,62,80,0.5), transparent 45%), radial-gradient(circle at 85% 85%, rgba(71,85,105,0.4), transparent 40%)',
              }}
            />
            <div className="relative">
              <span className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white shadow-card">
                <MapPin size={28} />
              </span>
              <h2 className="font-display text-3xl font-bold leading-tight tracking-tight text-bone-50">
                FixMyCity
              </h2>
              <p className="mt-3 max-w-sm text-bone-100/70">
                Shahar muammolarini kuzatish, ovoz berish va ularning hal etilishini bir joyda kuzatish.
              </p>

              <div className="mt-10 space-y-4">
                {[
                  ['128', "ovoz bilan eng ko'p qo'llab-quvvatlangan shikoyat"],
                  ['3', 'qadamda muammoni yetkazish'],
                  ['AI', 'tekshiruv — avtomatik moderatsiya'],
                ].map(([v, l]) => (
                  <div key={l} className="flex items-center gap-4 rounded-2xl border border-bone-50/10 bg-bone-50/5 px-5 py-3.5">
                    <span className="font-display text-xl font-bold text-primary">{v}</span>
                    <span className="text-sm text-bone-100/80">{l}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Forma */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mx-auto w-full max-w-md"
        >
          <Link to="/" className="mb-6 flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white">
              <MapPin size={20} />
            </span>
            <span className="font-display text-lg font-bold tracking-tight text-ink-900">
              FixMy<span className="text-primary">City</span>
            </span>
          </Link>

          <h1 className="text-2xl font-bold text-ink-900 sm:text-3xl">{title}</h1>
          {subtitle && <p className="mt-2 text-ink-500">{subtitle}</p>}

          <div className="mt-8">{children}</div>
          {footer && <div className="mt-6 text-center text-sm text-ink-500">{footer}</div>}
        </motion.div>
      </div>
    </div>
  )
}
