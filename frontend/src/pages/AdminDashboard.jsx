import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import {
  FileText,
  Clock,
  CheckCircle2,
  Ban,
  ThumbsUp,
  Users,
  RefreshCw,
  Settings,
  UserCog,
  ChevronRight,
  Search,
  Trash2,
} from 'lucide-react'
import api from '../api/client.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { timeAgo, getApiError } from '../utils/format.js'
import { STATUS_META } from '../utils/constants.js'
import StatusBadge from '../components/StatusBadge.jsx'
import StatusChangeModal from '../components/StatusChangeModal.jsx'
import AnnouncementsPanel from '../components/AnnouncementsPanel.jsx'
import EmptyState from '../components/EmptyState.jsx'
import { SpinnerWrap } from '../components/Spinner.jsx'

const TAB_META = [
  { key: '', label: 'Barchasi' },
  { key: 'PENDING', label: 'Yangi' },
  { key: 'VERIFIED', label: 'Tasdiqlangan' },
  { key: 'IN_PROGRESS', label: 'Jarayonda' },
  { key: 'RESOLVED', label: 'Hal qilingan' },
  { key: 'REJECTED', label: 'Rad etilgan' },
  { key: 'BLOCKED', label: 'Bloklangan' },
]

function StatCard({ label, value, icon: Icon, accent }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-card-lg">
      <div className="flex items-center justify-between">
        <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${accent}`}>
          <Icon size={20} />
        </span>
      </div>
      <p className="mt-3 font-display text-3xl font-bold text-ink-900">{value}</p>
      <p className="text-sm text-ink-500">{label}</p>
    </div>
  )
}

function BarRow({ label, count, color, max }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-32 shrink-0 truncate text-sm text-ink-700">{label}</span>
      <div className="h-3 flex-1 overflow-hidden rounded-full bg-bone-100">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${max ? (count / max) * 100 : 0}%`, background: color }}
        />
      </div>
      <span className="w-9 shrink-0 text-right text-sm font-bold text-ink-900">{count}</span>
    </div>
  )
}

export default function AdminDashboard() {
  const { isSuperAdmin } = useAuth()
  const toast = useToast()

  const [stats, setStats] = useState(null)
  const [statsLoading, setStatsLoading] = useState(true)

  const [tab, setTab] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [items, setItems] = useState([])
  const [meta, setMeta] = useState({ total: 0 })
  const [listLoading, setListLoading] = useState(false)
  const [target, setTarget] = useState(null) // holat o'zgartirilayotgan shikoyat
  const [reloadKey, setReloadKey] = useState(0)

  const handleDelete = async (c) => {
    if (!window.confirm(`"${c.title}" shikoyatini o'chirasizmi?`)) return
    try {
      await api.delete(`/complaints/${c.id}`)
      toast.success('Shikoyat o\'chirildi')
      loadStats()
      setReloadKey((r) => r + 1)
    } catch (err) {
      toast.error(getApiError(err, 'O\'chirishda xatolik'))
    }
  }

  const loadStats = () => {
    setStatsLoading(true)
    api
      .get('/admin/stats')
      .then((res) => setStats(res?.data || null))
      .catch(() => toast.error('Statistika yuklanmadi'))
      .finally(() => setStatsLoading(false))
  }

  useEffect(loadStats, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => setPage(1), [tab, search])

  useEffect(() => {
    let active = true
    setListLoading(true)
    api
      .get('/complaints', {
        params: {
          page,
          limit: 10,
          status: tab || undefined,
          search: search || undefined,
        },
      })
      .then((res) => {
        if (!active) return
        setItems(res?.data || [])
        setMeta(res?.meta || { total: 0 })
      })
      .catch(() => active && setItems([]))
      .finally(() => active && setListLoading(false))
    return () => {
      active = false
    }
  }, [page, tab, search, reloadKey])

  const statusRows = useMemo(() => {
    const rows = stats?.complaintsByStatus || []
    const max = Math.max(1, ...rows.map((r) => r.count))
    return rows.map((r) => ({ label: STATUS_META[r.status]?.label || r.status, count: r.count, color: STATUS_META[r.status]?.color, max }))
  }, [stats])

  const catRows = useMemo(() => {
    const rows = stats?.complaintsByCategory || []
    const max = Math.max(1, ...rows.map((r) => r.count))
    return rows.map((r) => ({ label: r.categoryName, count: r.count, color: '#2C3E50', max }))
  }, [stats])

  const totalPages = Math.max(1, Math.ceil((meta.total || 0) / 10))

  const statCards = stats
    ? [
        { label: 'Jami shikoyatlar', value: stats.totalComplaints, icon: FileText, accent: 'bg-bone-100 text-bronze-700' },
        { label: 'Kutilayotgan', value: stats.pendingComplaints, icon: Clock, accent: 'bg-bronze-100 text-bronze-700' },
        { label: 'Hal qilingan', value: stats.resolvedComplaints, icon: CheckCircle2, accent: 'bg-success-bg text-success' },
        { label: 'Bloklangan', value: stats.blockedComplaints, icon: Ban, accent: 'bg-danger-bg text-danger' },
        { label: 'Ovozlar', value: stats.totalVotes, icon: ThumbsUp, accent: 'bg-bone-100 text-bronze-700' },
        { label: 'Foydalanuvchilar', value: stats.totalUsers, icon: Users, accent: 'bg-info-bg text-info' },
      ]
    : []

  return (
    <div className="mx-auto max-w-[1440px] px-6 py-10">
      {/* Sarlavha */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink-900 sm:text-3xl">Admin panel</h1>
          <p className="mt-1 text-ink-500">Shikoyatlar va platforma statistikasi</p>
        </div>
        <div className="flex gap-2">
          {isSuperAdmin && (
            <>
              <Link to="/admin/users" className="btn btn-outline btn-sm">
                <UserCog size={16} />
                Foydalanuvchilar
              </Link>
              <Link to="/admin/categories" className="btn btn-outline btn-sm">
                <Settings size={16} />
                Kategoriyalar
              </Link>
            </>
          )}
          <button onClick={loadStats} className="btn btn-ghost btn-sm" title="Yangilash">
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Stats kartalar */}
      {statsLoading ? (
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-bone-100" />
          ))}
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {statCards.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>
      )}

      {/* Diagrammalar */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-line bg-surface p-6 shadow-card">
          <h3 className="mb-5 text-sm font-bold uppercase tracking-wider text-ink-500">
            Statuslar bo'yicha
          </h3>
          <div className="space-y-3.5">
            {statusRows.length ? (
              statusRows.map((r) => <BarRow key={r.label} {...r} />)
            ) : (
              <p className="text-sm text-ink-500">Ma'lumot yo'q</p>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-line bg-surface p-6 shadow-card">
          <h3 className="mb-5 text-sm font-bold uppercase tracking-wider text-ink-500">
            Kategoriyalar bo'yicha
          </h3>
          <div className="space-y-3.5">
            {catRows.length ? (
              catRows.map((r) => <BarRow key={r.label} {...r} />)
            ) : (
              <p className="text-sm text-ink-500">Ma'lumot yo'q</p>
            )}
          </div>
        </div>
      </div>

      {/* Shikoyatlar boshqaruvi */}
      <div className="mt-10">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-ink-900">Shikoyatlar boshqaruvi</h2>
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Qidirish..."
              className="w-56 rounded-xl border border-line bg-surface py-2 pl-10 pr-4 text-sm text-ink-900 outline-none transition focus:border-bronze-600 focus:ring-4 focus:ring-bronze-glow"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="no-scrollbar mb-5 flex gap-2 overflow-x-auto pb-1">
          {TAB_META.map((t) => (
            <button
              key={t.key || 'all'}
              onClick={() => setTab(t.key)}
              className={`chip shrink-0 ${tab === t.key ? 'active' : ''}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {listLoading ? (
          <SpinnerWrap label="Yuklanmoqda..." />
        ) : items.length === 0 ? (
          <div className="rounded-3xl border border-line bg-surface shadow-card">
            <EmptyState title="Hozircha shikoyatlar yo'q" text="Bu bo'limda hech qanday shikoyat topilmadi." />
          </div>
        ) : (
          <div className="space-y-2.5">
            {items.map((c) => (
              <div
                key={c.id}
                className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-4 shadow-card transition hover:border-bronze-600 sm:flex-row sm:items-center"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={c.status} />
                    <span className="text-xs text-ink-500">{timeAgo(c.createdAt)}</span>
                  </div>
                  <Link
                    to={`/complaints/${c.id}`}
                    className="mt-1.5 block truncate font-semibold text-ink-900 transition hover:text-bronze-700"
                  >
                    {c.title}
                  </Link>
                  <p className="text-xs text-ink-500">
                    {c.category?.name} · {c.user?.firstName} {c.user?.lastName} · {c._count?.votes ?? 0} ovoz
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    onClick={() => setTarget(c)}
                    className="btn btn-outline btn-sm shrink-0"
                  >
                    Holatni o'zgartirish
                    <ChevronRight size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(c)}
                    className="icon-btn shrink-0 text-danger"
                    title="Shikoyatni o'chirish"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="btn btn-outline btn-sm disabled:opacity-40"
            >
              Oldingi
            </button>
            <span className="px-2 text-sm font-semibold text-ink-700">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="btn btn-outline btn-sm disabled:opacity-40"
            >
              Keyingi
            </button>
          </div>
        )}
      </div>

      {/* Yangiliklar / E'lonlar */}
      <div className="mt-10">
        <AnnouncementsPanel />
      </div>

      {/* Status modal */}
      <AnimatePresence>
        {target && (
          <StatusChangeModal
            complaint={target}
            onClose={() => setTarget(null)}
            onDone={() => {
              setTarget(null)
              loadStats()
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
