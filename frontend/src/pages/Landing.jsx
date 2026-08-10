import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  MapPin,
  Camera,
  Send,
  ArrowRight,
  Map,
  ThumbsUp,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from 'lucide-react'
import api from '../api/client.js'
import { useAuth } from '../context/AuthContext.jsx'
import { STATUS_META } from '../utils/constants.js'
import Spinner from '../components/Spinner.jsx'
import StatusBadge from '../components/StatusBadge.jsx'

const STEPS = [
  {
    icon: MapPin,
    title: 'Joyni tanlang',
    text: "Xaritada muammo turgan joyni belgilang — qaysi ko'chada, qayerda ekanini aniqlang.",
  },
  {
    icon: Camera,
    title: 'Rasm yuklang',
    text: 'Muammoning rasmini yuklang, qisqacha tavsif bering va kategoriyasini tanlang.',
  },
  {
    icon: Send,
    title: 'Yuboring va kuzating',
    text: 'Shikoyatingiz tasdiqlansin, boshqalar ovoz bersin va hal qilinishini kuzating.',
  },
]

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 26 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.55, delay },
})

// Hero grafikasidagi stylize xarita (SVG)
function MiniMap() {
  return (
    <div className="relative h-44 overflow-hidden bg-bone-100">
      <svg viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
        <rect width="400" height="200" fill="#E8EBF0" />
        <path d="M20 20 Q60 0 100 22 T150 18 Q160 60 120 75 T40 70 Q25 45 20 20Z" fill="#DCE6DE" />
        <path d="M330 20 Q360 50 345 85 Q330 120 350 160 Q320 185 300 165 Q280 130 295 95 Q310 60 330 20Z" fill="#D6E2EC" />
        <path d="M0 55 H400" stroke="#FFFFFF" strokeWidth="14" />
        <path d="M0 130 H400" stroke="#FFFFFF" strokeWidth="10" />
        <path d="M75 0 V200" stroke="#FFFFFF" strokeWidth="12" />
        <path d="M235 0 V200" stroke="#FFFFFF" strokeWidth="16" />
        <path d="M340 0 V200" stroke="#FFFFFF" strokeWidth="8" />
        <path d="M0 175 H400" stroke="#FFFFFF" strokeWidth="6" />
        <path d="M235 0 V200" stroke="#2C3E50" strokeWidth="3" strokeDasharray="8 10" opacity="0.25" />
      </svg>
      <motion.div
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, type: 'spring', stiffness: 300, damping: 18 }}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full"
      >
        <span className="relative block">
          <span className="absolute -inset-3 rounded-full bg-primary/20 blur-md" />
          <span className="relative block h-10 w-10 rounded-full border-4 border-white bg-primary shadow-card-lg">
            <MapPin size={18} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white" />
          </span>
        </span>
        <span className="mx-auto block h-2 w-6 rounded-full bg-primary/25 blur-[2px]" />
      </motion.div>
      <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-lg border border-line bg-white/90 px-2.5 py-1 text-xs font-semibold text-ink-900 shadow-card">
        <MapPin size={12} className="text-primary" />
        Chorsu ko'chasi, 12
      </span>
    </div>
  )
}

export default function Landing() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)

  useEffect(() => {
    api
      .get('/stats', { skipRefresh: true })
      .then((res) => setStats(res?.data || null))
      .catch(() => setStats(null))
  }, [])

  const statCards = stats
    ? [
        { label: 'Shikoyatlar', value: stats.totalComplaints, icon: Map },
        { label: 'Ovozlar', value: stats.totalVotes, icon: ThumbsUp },
        { label: 'Hal qilingan', value: stats.resolvedComplaints, icon: ShieldCheck },
        { label: 'Kutilayotgan', value: stats.pendingComplaints, icon: TrendingUp },
      ]
    : null

  return (
    <div className="overflow-hidden">
      {/* ===== HERO ===== */}
      <section className="relative border-b border-line bg-bone-50">
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              'radial-gradient(circle at 12% 20%, rgba(44,62,80,0.10), transparent 40%), radial-gradient(circle at 88% 10%, rgba(71,85,105,0.10), transparent 40%)',
          }}
        />
        <div className="relative mx-auto grid max-w-[1200px] items-center gap-14 px-6 py-20 md:grid-cols-[1.05fr_0.95fr] md:py-28">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-1.5 text-xs font-semibold text-bronze-700 shadow-sm">
              <Sparkles size={14} />
              Shahar muammolarini birgalikda hal qilamiz
            </span>

            <h1 className="font-display text-balance text-4xl font-bold leading-[1.08] tracking-tight text-ink-900 sm:text-5xl lg:text-6xl">
              Shaharingizdagi muammoni <em className="text-bronze-700 not-italic underline decoration-bronze-100 decoration-8">birgina surat</em> bilan yetkazing
            </h1>

            <p className="mt-6 max-w-lg text-lg leading-relaxed text-ink-500">
              FixMyCity — yo'l, yoritish, chiqindi va boshqa shahar muammolarini xaritada kuzatish,
              ovoz berish va ularning hal etilishini kuzatish platformasi.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link to={user ? '/home' : '/login'} className="btn btn-primary btn-lg">
                <Send size={18} />
                {user ? 'Bosh sahifaga o\'tish' : 'Boshlash — bepul'}
              </Link>
              <Link to="/map" className="btn btn-outline btn-lg">
                <Map size={18} />
                Xaritani ko'rish
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-10 flex flex-wrap gap-8">
              {statCards ? (
                statCards.map((s, i) => (
                  <motion.div key={s.label} {...fade(i * 0.08)}>
                    <p className="font-display text-3xl font-bold text-ink-900">{s.value}</p>
                    <p className="text-sm text-ink-500">{s.label}</p>
                  </motion.div>
                ))
              ) : (
                <div className="flex items-center gap-3 text-sm text-ink-500">
                  <Spinner size="sm" />
                  Statistika yuklanmoqda...
                </div>
              )}
            </div>
          </motion.div>

          {/* Hero grafikasi — muammo kartasi maketi */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="relative hidden md:block"
          >
            <div className="pointer-events-none absolute -inset-10 rounded-[40px] bg-gradient-to-br from-primary/10 via-transparent to-bronze-600/10 blur-2xl" />

            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -right-4 -top-5 z-10 flex items-center gap-2 rounded-2xl border border-line bg-surface px-4 py-2.5 shadow-card-lg"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-success-bg text-success">
                <Sparkles size={16} />
              </span>
              <div>
                <p className="text-xs font-bold text-ink-900">AI kuzatuvi</p>
                <p className="text-[11px] text-ink-500">Avtomatik tekshiriladi</p>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 4.6, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
              className="absolute -bottom-5 -left-4 z-10 flex items-center gap-2 rounded-2xl border border-line bg-surface px-4 py-2.5 shadow-card-lg"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-bone-100 text-bronze-700">
                <ThumbsUp size={16} />
              </span>
              <div>
                <p className="text-xs font-bold text-ink-900">24 ta ovoz</p>
                <p className="text-[11px] text-ink-500">Hal qilinishini kuzatilmoqda</p>
              </div>
            </motion.div>

            <div className="relative mx-auto w-full max-w-[420px] overflow-hidden rounded-3xl border border-line bg-surface shadow-card-lg">
              <div className="flex items-center justify-between gap-2 border-b border-line px-5 py-4">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-bone-100 px-3 py-1 text-xs font-semibold text-ink-700">
                  <ShieldCheck size={13} className="text-bronze-600" />
                  Yo'l infratuzilmasi
                </span>
                <StatusBadge status="VERIFIED" />
              </div>

              <MiniMap />

              <div className="p-5">
                <h3 className="font-display text-lg font-bold leading-snug text-ink-900">
                  Chorsu ko'chasi yaqinidagi yo'l qoplamasi yemirilgan
                </h3>
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-500">
                  <span className="inline-flex items-center gap-1">
                    <ThumbsUp size={13} className="text-bronze-600" />
                    <b className="text-ink-700">24</b> ovoz
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin size={13} />
                    Xaritada belgilangan
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-line bg-bone-50 px-5 py-3.5">
                <span className="flex items-center gap-1.5 text-xs font-bold text-ink-700">
                  <TrendingUp size={14} className="text-bronze-600" />
                  {STATUS_META.VERIFIED.label}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-success-bg px-3 py-1 text-xs font-bold text-success">
                  <Sparkles size={12} />
                  AI tomonidan tasdiqlangan
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== QANDAY ISHLAYDI ===== */}
      <section className="mx-auto max-w-[1200px] px-6 py-20">
        <motion.div {...fade()} className="mx-auto mb-12 max-w-2xl text-center">
          <span className="mb-3 inline-block text-sm font-bold uppercase tracking-widest text-bronze-700">
            Qanday ishlaydi
          </span>
          <h2 className="font-display text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
            Uch qadamda muammoni yetkazing
          </h2>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.title}
              {...fade(i * 0.1)}
              className="group relative rounded-3xl border border-line bg-surface p-7 shadow-card transition hover:-translate-y-1 hover:border-bronze-600 hover:shadow-card-lg"
            >
              <span className="absolute right-6 top-5 font-display text-5xl font-bold text-bone-100">
                0{i + 1}
              </span>
              <span className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-charcoal text-bronze-600 shadow-card transition group-hover:bg-bronze-600 group-hover:text-white">
                <s.icon size={26} />
              </span>
              <h3 className="text-lg font-bold text-ink-900">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-500">{s.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="mx-auto max-w-[1200px] px-6 pb-24">
        <motion.div
          {...fade()}
          className="relative overflow-hidden rounded-[28px] bg-charcoal px-8 py-14 text-center shadow-card-lg sm:px-16"
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-70"
            style={{
              backgroundImage:
                'radial-gradient(circle at 20% 30%, rgba(44,62,80,0.35), transparent 45%), radial-gradient(circle at 80% 70%, rgba(71,85,105,0.25), transparent 40%)',
            }}
          />
          <div className="relative">
            <h2 className="font-display mx-auto max-w-xl text-balance text-3xl font-bold tracking-tight text-bone-50 sm:text-4xl">
              Shaharingizni birga yaxshilaylik
            </h2>
            <p className="mx-auto mt-4 max-w-md text-bone-100/70">
              Muammo ko'rdingizmi? O'tib ketmang — suratga oling va xaritaga qo'ying.
            </p>
            <Link
              to={user ? '/home' : '/login'}
              className="btn btn-bronze btn-lg mt-8 text-white"
            >
              Shikoyat yuborish
              <ArrowRight size={18} />
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  )
}
