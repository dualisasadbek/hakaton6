import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import {
  Search,
  ArrowLeft,
  Ban,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Trash2,
  UserCog,
} from 'lucide-react'
import api from '../api/client.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { getApiError, formatDate } from '../utils/format.js'
import { ROLES } from '../utils/constants.js'
import EmptyState from '../components/EmptyState.jsx'
import Dropdown from '../components/Dropdown.jsx'
import { SpinnerWrap, Spinner } from '../components/Spinner.jsx'

const LIMIT = 12

function RoleBadge({ role }) {
  const styles =
    role === 'SUPER_ADMIN'
      ? 'bg-charcoal text-bone-50'
      : role === 'ADMIN'
        ? 'bg-bronze-100 text-bronze-700'
        : 'bg-bone-100 text-ink-500'
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${styles}`}>
      {role === 'ADMIN' && <ShieldCheck size={12} />}
      {ROLES[role] || role}
    </span>
  )
}

export default function AdminUsers() {
  const { user: me } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const [search, setSearch] = useState('')
  const [role, setRole] = useState('')
  const [page, setPage] = useState(1)
  const [items, setItems] = useState([])
  const [meta, setMeta] = useState({ total: 0 })
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => setPage(1), [search, role])

  useEffect(() => {
    let active = true
    setLoading(true)
    api
      .get('/users', {
        params: { page, limit: LIMIT, search: search || undefined, role: role || undefined },
      })
      .then((res) => {
        if (!active) return
        setItems(res?.data || [])
        setMeta(res?.meta || { total: 0 })
      })
      .catch(() => active && setItems([]))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [page, search, role])

  const toggleBlock = async (u) => {
    setBusyId(u.id)
    try {
      await api.patch(`/users/${u.id}/block`, { isBlocked: !u.isBlocked })
      setItems((prev) =>
        prev.map((x) => (x.id === u.id ? { ...x, isBlocked: !u.isBlocked } : x))
      )
      toast.success(!u.isBlocked ? 'Foydalanuvchi bloklandi' : 'Foydalanuvchi ochildi')
    } catch (err) {
      toast.error(getApiError(err, 'Amal bajarilmadi'))
    } finally {
      setBusyId(null)
    }
  }

  const toggleRole = async (u) => {
    const next = u.role === 'ADMIN' ? 'USER' : 'ADMIN'
    setBusyId(u.id)
    try {
      await api.patch(`/users/${u.id}/role`, { role: next })
      setItems((prev) => prev.map((x) => (x.id === u.id ? { ...x, role: next } : x)))
      toast.success('Rol o\'zgartirildi')
    } catch (err) {
      toast.error(getApiError(err, 'Rol o\'zgartirilmadi'))
    } finally {
      setBusyId(null)
    }
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await api.delete(`/users/${deleteTarget.id}`)
      setItems((prev) => prev.filter((x) => x.id !== deleteTarget.id))
      toast.success('Foydalanuvchi o\'chirildi')
      setDeleteTarget(null)
    } catch (err) {
      toast.error(getApiError(err, 'O\'chirilmadi'))
    } finally {
      setDeleting(false)
    }
  }

  const totalPages = Math.max(1, Math.ceil((meta.total || 0) / LIMIT))

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-10">
      <button
        onClick={() => navigate('/admin')}
        className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-ink-500 transition hover:text-bronze-700"
      >
        <ArrowLeft size={16} />
        Admin panelga qaytish
      </button>

      <h1 className="text-2xl font-bold text-ink-900 sm:text-3xl">Foydalanuvchilar</h1>
      <p className="mt-1 text-ink-500">Bloklash, rol berish va foydalanuvchilarni boshqarish</p>

      {/* Filterlar */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative min-w-56 flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ism, familiya yoki email..."
            className="w-full rounded-xl border border-line bg-surface py-2.5 pl-10 pr-4 text-sm text-ink-900 outline-none transition focus:border-bronze-600 focus:ring-4 focus:ring-bronze-glow"
          />
        </div>
        <Dropdown
          value={role}
          onChange={setRole}
          options={[
            { value: '', label: 'Barcha rollar' },
            { value: 'USER', label: 'Foydalanuvchi' },
            { value: 'ADMIN', label: 'Administrator' },
            { value: 'SUPER_ADMIN', label: 'Super Admin' },
          ]}
          placeholder="Barcha rollar"
          className="w-40 shrink-0"
        />
      </div>

      {/* Jadval */}
      <div className="mt-6 overflow-hidden rounded-3xl border border-line bg-surface shadow-card">
        {loading ? (
          <SpinnerWrap label="Foydalanuvchilar yuklanmoqda..." />
        ) : items.length === 0 ? (
          <EmptyState icon="users" title="Foydalanuvchilar topilmadi" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-line bg-bone-50 text-xs uppercase tracking-wider text-ink-500">
                  <th className="px-5 py-3.5 font-bold">Foydalanuvchi</th>
                  <th className="px-5 py-3.5 font-bold">Rol</th>
                  <th className="px-5 py-3.5 font-bold">Shikoyat / Ovoz</th>
                  <th className="px-5 py-3.5 font-bold">Ro'yxatdan o'tgan</th>
                  <th className="px-5 py-3.5 text-right font-bold">Amallar</th>
                </tr>
              </thead>
              <tbody>
                {items.map((u) => (
                  <tr
                    key={u.id}
                    className={`border-b border-line last:border-0 transition hover:bg-bone-50 ${u.isBlocked ? 'opacity-60' : ''}`}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-charcoal text-sm font-bold text-bronze-100">
                          {u.firstName?.[0]}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-ink-900">
                            {u.firstName} {u.lastName}
                            {me?.id === u.id && <span className="text-xs text-bronze-700"> (siz)</span>}
                            {u.isBlocked && (
                              <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-danger-bg px-2 py-0.5 text-[10px] font-bold text-danger">
                                <Ban size={10} /> Bloklangan
                              </span>
                            )}
                          </p>
                          <p className="truncate text-xs text-ink-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <RoleBadge role={u.role} />
                    </td>
                    <td className="px-5 py-4 text-ink-500">
                      {u._count?.complaints ?? 0} / {u._count?.votes ?? 0}
                    </td>
                    <td className="px-5 py-4 text-ink-500">{formatDate(u.createdAt)}</td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        {busyId === u.id && <Spinner size="sm" />}
                        {u.role !== 'SUPER_ADMIN' && (
                          <>
                            <button
                              onClick={() => toggleRole(u)}
                              disabled={busyId === u.id}
                              className="btn btn-outline btn-sm"
                              title={u.role === 'ADMIN' ? 'User qilish' : 'Admin qilish'}
                            >
                              <UserCog size={14} />
                              {u.role === 'ADMIN' ? 'User' : 'Admin'}
                            </button>
                            <button
                              onClick={() => toggleBlock(u)}
                              disabled={busyId === u.id}
                              className={`btn btn-sm ${
                                u.isBlocked ? 'btn-bronze text-white' : 'btn-outline'
                              }`}
                            >
                              <Ban size={14} />
                              {u.isBlocked ? 'Ochish' : 'Bloklash'}
                            </button>
                            <button
                              onClick={() => setDeleteTarget(u)}
                              disabled={busyId === u.id}
                              className="btn btn-danger btn-sm"
                              title="O'chirish"
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && !loading && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="btn btn-outline btn-sm disabled:opacity-40"
          >
            <ChevronLeft size={15} />
          </button>
          <span className="px-2 text-sm font-semibold text-ink-700">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="btn btn-outline btn-sm disabled:opacity-40"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      )}

      {/* Delete confirm */}
      <AnimatePresence>
        {deleteTarget && (
          <div
            className="fixed inset-0 z-[1500] flex items-center justify-center bg-charcoal/50 p-5 backdrop-blur-sm"
            onClick={() => setDeleteTarget(null)}
          >
            <div
              className="w-full max-w-[440px] rounded-3xl bg-surface shadow-card-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-line px-6 py-4">
                <h3 className="font-bold text-ink-900">Foydalanuvchini o'chirish</h3>
                <button onClick={() => setDeleteTarget(null)} className="icon-btn" aria-label="Yopish">
                  <span className="text-xl leading-none">×</span>
                </button>
              </div>
              <div className="p-6">
                <p className="text-sm text-ink-700">
                  <b>
                    {deleteTarget.firstName} {deleteTarget.lastName}
                  </b>{' '}
                  — bu foydalanuvchini o'chirmoqchimisiz? Uning barcha ma'lumotlari va shikoyatlari o'chiriladi.
                </p>
              </div>
              <div className="flex justify-end gap-2.5 border-t border-line px-6 py-4">
                <button onClick={() => setDeleteTarget(null)} className="btn btn-ghost">
                  Bekor qilish
                </button>
                <button onClick={confirmDelete} disabled={deleting} className="btn btn-danger">
                  {deleting ? "O'chirilmoqda..." : "O'chirish"}
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
