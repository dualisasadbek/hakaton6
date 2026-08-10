import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Map,
  ThumbsUp,
  ShieldCheck,
  TrendingUp,
  Megaphone,
  CalendarClock,
  Sparkles,
} from 'lucide-react'
import api from '../api/client.js'
import { useAuth } from '../context/AuthContext.jsx'
import { categoryIcon } from '../utils/constants.js'
import { formatDate } from '../utils/format.js'
import ComplaintCard from '../components/ComplaintCard.jsx'
import { SpinnerWrap } from '../components/Spinner.jsx'

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 26 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.55, delay },
})

export default function Home() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [statsLoading, setStatsLoading] = useState(true)
  const [categories, setCategories] = useState([])
  const [recent, setRecent] = useState([])
  const [recentLoading, setRecentLoading] = useState(true)
  const [announcements, setAnnouncements] = useState([])

  useEffect(() => {
    api
      .get('/stats', { skipRefresh: true })
      .then((res) => setStats(res?.data || null))
      .catch(() => setStats(null))
      .finally(() => setStatsLoading(false))
    api
      .get('/categories')
      .then((res) => setCategories(res?.data?.filter((c) => c.isActive) || []))
      .catch(() => setCategories([]))
    api
      .get('/complaints', { params: { limit: 3, status: undefined, sort: 'newest' } })
      .then((res) => setRecent(res?.data?.slice(0, 3) || []))
      .catch(() => setRecent([]))
      .finally(() => setRecentLoading(false))
    api
      .get('/announcements')
      .then((res) => setAnnouncements(res?.data?.filter((a) => a.isActive) || []))
      .catch(() => setAnnouncements([]))
  }, [])

  const statCards = stats
    ? [
        { label: 'Shikoyatlar', value: stats.totalComplaints, icon: Map, accent: 'bg-bone-100 text-bronze-700' },
        { label: 'Ovozlar', value: stats.totalVotes, icon: ThumbsUp, accent: 'bg-bone-100 text-bronze-700' },
        { label: 'Hal qilingan', value: stats.resolvedComplaints, icon: ShieldCheck, accent: 'bg-success-bg text-success' },
        { label: 'Kutilayotgan', value: stats.pendingComplaints, icon: TrendingUp, accent: 'bg-info-bg text-info' },
      ]
    : []

  return (
    <div className="overflow-hidden">
      {/* ===== SALOMLASHUV ===== */}
      <section className="relative border-b border-line bg-bone-50">
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              'radial-gradient(circle at 12% 20%, rgba(44,62,80,0.10), transparent 40%), radial-gradient(circle at 88% 10%, rgba(71,85,105,0.10), transparent 40%)',
          }}
        />
        <div className="relative mx-auto max-w-[1200px] px-6 py-14">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <h1 className="font-display text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
                {user ? `Xush kelibsiz, ${user.firstName}!` : 'Bosh sahifa'}
              </h1>
              <p className="mt-2 max-w-lg text-ink-500">
                Shaharingizdagi muammolarni ko'ring, ovoz bering va hal etilishini kuzating.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex gap-2.5"
            >
              <Link to="/map" className="btn btn-outline">
                <Map size={16} />
                Xarita
              </Link>
              <Link
                to={user ? '/complaints/new' : '/login'}
                className="btn btn-primary"
              >
                <Sparkles size={16} />
                Shikoyat yuborish
              </Link>
            </motion.div>
          </div>

          {/* Stats */}
          <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {statsLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-24 animate-pulse rounded-2xl bg-bone-100" />
                ))
              : statCards.map((s, i) => (
                  <motion.div
                    key={s.label}
                    {...fade(i * 0.06)}
                    className="flex items-center gap-4 rounded-2xl border border-line bg-surface p-5 shadow-card"
                  >
                    <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${s.accent}`}>
                      <s.icon size={22} />
                    </span>
                    <span>
                      <span className="block font-display text-2xl font-bold text-ink-900">{s.value}</span>
                      <span className="block text-xs text-ink-500">{s.label}</span>
                    </span>
                  </motion.div>
                ))}
          </div>
        </div>
      </section>

      {/* ===== KATEGORIYALAR ===== */}
      <section className="mx-auto max-w-[1200px] px-6 py-16">
        <motion.div {...fade()} className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="mb-3 inline-block text-sm font-bold uppercase tracking-widest text-bronze-700">
              Muammo turlari
            </span>
            <h2 className="font-display text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
              Nima ko'rdingiz — shuni yetkazing
            </h2>
          </div>
          <Link to="/map" className="inline-flex items-center gap-1.5 text-sm font-semibold text-bronze-700 transition hover:text-bronze-600">
            Barchasini ko'rish
            <ArrowRight size={16} />
          </Link>
        </motion.div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((c, i) => {
            const Icon = categoryIcon(c.icon)
            const count = c._count?.complaints ?? 0
            return (
              <motion.div key={c.id} {...fade(i * 0.06)}>
                <Link
                  to="/map"
                  className="group flex items-center gap-4 rounded-2xl border border-line bg-surface p-5 shadow-card transition hover:-translate-y-0.5 hover:border-bronze-600 hover:shadow-card-lg"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-bone-100 text-bronze-700 transition group-hover:bg-primary group-hover:text-white">
                    <Icon size={22} />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-semibold text-ink-900">{c.name}</span>
                    <span className="block text-xs text-ink-500">
                      {count === 0 ? 'Hali shikoyat yo\'q' : `${count} ta shikoyat`}
                    </span>
                  </span>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* ===== E'LONLAR ===== */}
      {announcements.length > 0 && (
        <section className="border-y border-line bg-bone-50">
          <div className="mx-auto max-w-[1200px] px-6 py-16">
            <motion.div {...fade()} className="mb-10 flex flex-wrap items-end justify-between gap-4">
              <div>
                <span className="mb-3 inline-block text-sm font-bold uppercase tracking-widest text-bronze-700">
                  Ma'muriyat e'lonlari
                </span>
                <h2 className="font-display text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
                  Qaysi soha qachon tuzatiladi
                </h2>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full bg-primary-100 px-4 py-2 text-xs font-bold text-primary">
                <Megaphone size={14} />
                {announcements.length} ta faol e'lon
              </span>
            </motion.div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {announcements.map((a, i) => (
                <motion.div
                  key={a.id}
                  {...fade(i * 0.07)}
                  className="group relative overflow-hidden rounded-3xl border border-line bg-surface p-6 shadow-card transition hover:-translate-y-1 hover:border-bronze-600 hover:shadow-card-lg"
                >
                  <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-bone-100 text-bronze-700 transition group-hover:bg-primary group-hover:text-white">
                    <Megaphone size={20} />
                  </span>
                  {a.area && (
                    <span className="mb-2 inline-block rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold text-primary">
                      {a.area}
                    </span>
                  )}
                  <h3 className="font-display text-lg font-bold leading-snug text-ink-900">{a.title}</h3>
                  <p className="ellipsis mt-2 text-sm leading-relaxed text-ink-500">{a.body}</p>
                  <div className="mt-5 flex items-center gap-2 rounded-2xl bg-bone-50 px-4 py-2.5">
                    <CalendarClock size={15} className="shrink-0 text-bronze-600" />
                    <span className="text-xs font-semibold text-ink-700">
                      {a.fixAt ? `${formatDate(a.fixAt)} — boshlanadi` : 'Sana keyinroq e\'lon qilinadi'}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== OXIRGI SHIKOYATLAR ===== */}
      <section className="mx-auto max-w-[1200px] px-6 py-16">
        <motion.div {...fade()} className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="mb-3 inline-block text-sm font-bold uppercase tracking-widest text-bronze-700">
              So'nggi shikoyatlar
            </span>
            <h2 className="font-display text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
              Shaharda nimalar bo'lyapti
            </h2>
          </div>
          <Link to="/map" className="inline-flex items-center gap-1.5 text-sm font-semibold text-bronze-700 transition hover:text-bronze-600">
            Xaritada ko'rish
            <ArrowRight size={16} />
          </Link>
        </motion.div>

        {recentLoading ? (
          <SpinnerWrap label="Shikoyatlar yuklanmoqda..." />
        ) : recent.length === 0 ? (
          <div className="rounded-3xl border border-line bg-surface py-16 text-center text-sm text-ink-500">
            Hozircha shikoyatlar yo'q. Birinchi shikoyatni siz yozishingiz mumkin!
            <div className="mt-5">
              <Link to="/complaints/new" className="btn btn-primary btn-sm">
                Shikoyat yuborish
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-3">
            {recent.map((c, i) => (
              <motion.div key={c.id} {...fade(i * 0.08)}>
                <ComplaintCard complaint={c} />
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* ===== CTA ===== */}
      <section className="mx-auto max-w-[1200px] px-6 pb-20">
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
              to={user ? '/complaints/new' : '/login'}
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
