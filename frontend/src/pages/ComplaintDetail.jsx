import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ThumbsUp,
  MapPin,
  User,
  CalendarDays,
  Pencil,
  Trash2,
  ArrowLeft,
  ImageOff,
  ShieldAlert,
  Sparkles,
  History,
  Check,
  X,
  ExternalLink,
  MessageSquareText,
} from 'lucide-react'
import api from '../api/client.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { getApiError, assetUrl, formatDateTime, formatDate } from '../utils/format.js'
import { STATUS_META, RISK_META, categoryIcon } from '../utils/constants.js'
import StatusBadge from '../components/StatusBadge.jsx'
import MapPicker from '../components/MapPicker.jsx'
import StatusChangeModal from '../components/StatusChangeModal.jsx'
import { SpinnerWrap } from '../components/Spinner.jsx'
import EmptyState from '../components/EmptyState.jsx'

function VoteButton({ complaintId, voted, count, onToggle }) {
  const { user } = useAuth()
  const [busy, setBusy] = useState(false)

  const handle = async () => {
    if (!user) return
    if (busy) return
    setBusy(true)
    onToggle((prev) => ({ ...prev, optimistic: true }))
    try {
      const res = await api.post(`/complaints/${complaintId}/vote`)
      onToggle((prev) => ({ ...prev, voted: res?.data?.voted, count: res?.data?.count, optimistic: false }))
    } catch {
      onToggle((prev) => ({ ...prev, optimistic: false }))
    } finally {
      setBusy(false)
    }
  }

  const active = voted || (busy && count > 0)

  return (
    <button
      onClick={handle}
      disabled={!user || busy}
      title={user ? 'Ovoz berish' : 'Ovoz berish uchun kiring'}
      className={`flex items-center gap-2.5 rounded-2xl border px-5 py-3 font-semibold transition ${
        active
          ? 'border-charcoal bg-charcoal text-bone-50 shadow-card'
          : 'border-line bg-surface text-ink-700 hover:border-bronze-600 hover:text-bronze-700'
      } ${!user ? 'cursor-not-allowed opacity-60' : ''}`}
    >
      <ThumbsUp size={19} className={active ? 'text-bronze-600' : 'text-bronze-700'} />
      <span className="text-lg font-bold">{count}</span>
      <span className="text-sm">{active ? 'Ovoz berdingiz' : 'Ovoz berish'}</span>
    </button>
  )
}

export default function ComplaintDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { user, isAdmin } = useAuth()

  const [complaint, setComplaint] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [mainImg, setMainImg] = useState(0)
  const [vote, setVote] = useState({ voted: false, count: 0, optimistic: false })
  const [statusModal, setStatusModal] = useState(false)
  const [deleteModal, setDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const timerRef = useRef(null)

  const applyComplaint = useCallback((c) => {
    setComplaint(c)
    setVote({ voted: Boolean(c.voted), count: c._count?.votes ?? 0, optimistic: false })
  }, [])

  const load = useCallback(async () => {
    try {
      const res = await api.get(`/complaints/${id}`)
      applyComplaint(res?.data)
      setNotFound(false)
    } catch {
      setNotFound(true)
    }
  }, [id, applyComplaint])

  useEffect(() => {
    setLoading(true)
    load().finally(() => setLoading(false))
  }, [load])

  // AI tekshirayapti — PENDING va aiAnalysis yo'q bo'lsa polling
  useEffect(() => {
    if (!complaint) return
    const pendingAnalysis = complaint.status === 'PENDING' && !complaint.aiAnalysis
    if (!pendingAnalysis) return

    timerRef.current = setInterval(load, 5000)
    return () => clearInterval(timerRef.current)
  }, [complaint, load])

  const isAuthor = user && complaint && complaint.user?.id === user.id
  const canEdit = isAuthor && complaint?.status === 'PENDING'
  const canVote = Boolean(user)

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await api.delete(`/complaints/${id}`)
      toast.success('Shikoyat o\'chirildi')
      navigate('/map')
    } catch (err) {
      toast.error(getApiError(err, 'O\'chirilmadi'))
    } finally {
      setDeleting(false)
      setDeleteModal(false)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto min-h-[70vh] max-w-[1000px] px-6">
        <SpinnerWrap label="Shikoyat yuklanmoqda..." />
      </div>
    )
  }

  if (notFound || !complaint) {
    return (
      <div className="mx-auto max-w-[600px] px-6 py-16">
        <EmptyState
          icon="complaints"
          title="Shikoyat topilmadi"
          text="Shikoyat o'chirilgan yoki manzil noto'g'ri bo'lishi mumkin."
          action={
            <Link to="/map" className="btn btn-primary btn-sm">
              Xaritaga qaytish
            </Link>
          }
        />
      </div>
    )
  }

  const images = complaint.images || []
  const ai = complaint.aiAnalysis
  const risk = ai ? RISK_META[ai.riskLevel] : null
  const CategoryIcon = categoryIcon(complaint.category?.icon)
  const isBlocked = complaint.status === 'BLOCKED' || ai?.blocked
  const pendingAnalysis = complaint.status === 'PENDING' && !complaint.aiAnalysis

  return (
    <div className="mx-auto max-w-[1000px] px-6 py-10">
      <Link
        to="/map"
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-ink-500 transition hover:text-bronze-700"
      >
        <ArrowLeft size={16} />
        Xaritaga qaytish
      </Link>

      {/* AI tekshirayapti banner */}
      <AnimatePresence>
        {pendingAnalysis && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-6 flex items-center gap-3 rounded-2xl border border-bronze-100 bg-bronze-100/50 px-5 py-4"
          >
            <span className="flex h-10 w-10 shrink-0 animate-spin items-center justify-center rounded-full border-[3px] border-bronze-600/30 border-t-bronze-600 text-bronze-700">
              <Sparkles size={16} />
            </span>
            <div>
              <p className="text-sm font-bold text-bronze-700">AI tekshirayapti...</p>
              <p className="text-xs text-ink-500">Shikoyat avtomatik moderatsiyadan o'tmoqda. Bu bir necha daqiqa olishi mumkin.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* Chap ustun */}
        <div>
          {/* Galereya */}
          <div className="overflow-hidden rounded-3xl border border-line bg-surface shadow-card">
            <div className="relative aspect-[16/9] bg-bone-100">
              {images.length ? (
                <img
                  src={assetUrl(images[mainImg]?.url)}
                  alt={complaint.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-ink-400">
                  <ImageOff size={48} />
                </div>
              )}
              <div className="absolute left-4 top-4">
                <StatusBadge status={complaint.status} size="lg" />
              </div>
            </div>

            {images.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto p-4">
                {images.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setMainImg(i)}
                    className={`h-16 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition ${
                      i === mainImg ? 'border-bronze-600' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={assetUrl(img.url)} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sarlavha + ma'lumot */}
          <div className="mt-6">
            <div className="flex flex-wrap items-center gap-2">
              {complaint.category && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-bone-100 px-3 py-1 text-xs font-semibold text-ink-500">
                  <CategoryIcon size={13} className="text-bronze-700" />
                  {complaint.category.name}
                </span>
              )}
              <StatusBadge status={complaint.status} />
            </div>

            <h1 className="mt-3 font-display text-2xl font-bold leading-tight tracking-tight text-ink-900 sm:text-3xl">
              {complaint.title}
            </h1>

            <p className="mt-4 whitespace-pre-wrap leading-relaxed text-ink-700">{complaint.description}</p>

            {/* Ovoz + amallar */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <VoteButton complaintId={id} voted={vote.voted} count={vote.count} onToggle={setVote} />

              {canEdit && (
                <>
                  <Link to={`/complaints/${id}/edit`} className="btn btn-outline">
                    <Pencil size={16} />
                    Tahrirlash
                  </Link>
                  <button onClick={() => setDeleteModal(true)} className="btn btn-danger">
                    <Trash2 size={16} />
                    O'chirish
                  </button>
                </>
              )}

              {isAdmin && (
                <button onClick={() => setStatusModal(true)} className="btn btn-bronze text-white">
                  <Check size={16} />
                  Holatni o'zgartirish
                </button>
              )}

              {!canVote && (
                <span className="text-sm text-ink-500">
                  <Link to="/login" className="font-semibold text-bronze-700 hover:underline">
                    Kirib
                  </Link>{' '}
                  ovoz berishingiz mumkin
                </span>
              )}
            </div>

            {/* Muallif + sana */}
            <div className="mt-8 grid gap-4 rounded-3xl border border-line bg-surface p-6 shadow-card sm:grid-cols-3">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-charcoal text-sm font-bold text-bronze-100">
                  {complaint.user?.firstName?.[0] || 'U'}
                </span>
                <div>
                  <p className="flex items-center gap-1.5 text-sm font-bold text-ink-900">
                    <User size={13} className="text-bronze-700" />
                    {complaint.user?.firstName} {complaint.user?.lastName}
                  </p>
                  <p className="text-xs text-ink-500">Muallif</p>
                </div>
              </div>
              <div>
                <p className="flex items-center gap-1.5 text-sm font-bold text-ink-900">
                  <CalendarDays size={13} className="text-bronze-700" />
                  {formatDate(complaint.createdAt)}
                </p>
                <p className="text-xs text-ink-500">Yuborilgan sana</p>
              </div>
              <div>
                <p className="flex items-center gap-1.5 text-sm font-bold text-ink-900">
                  <ThumbsUp size={13} className="text-bronze-700" />
                  {vote.count} ovoz
                </p>
                <p className="text-xs text-ink-500">Qo'llab-quvvatlash</p>
              </div>
            </div>
          </div>
        </div>

        {/* O'ng ustun */}
        <div className="space-y-6">
          {/* Xarita */}
          <div>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-ink-500">
              <MapPin size={15} className="text-bronze-700" />
              Joylashuv
            </h3>
            <MapPicker
              coords={{ lat: complaint.latitude, lng: complaint.longitude }}
              height="h-60"
            />
            {complaint.address && (
              <p className="mt-2 text-sm text-ink-500">Manzil: {complaint.address}</p>
            )}
            <a
              href={`https://www.google.com/maps?q=${complaint.latitude},${complaint.longitude}`}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-bronze-700 hover:text-bronze-600"
            >
              <ExternalLink size={14} />
              Google Maps'da ochish
            </a>
          </div>

          {/* AI tahlil */}
          {ai && (
            <div
              className={`rounded-3xl border p-6 shadow-card ${
                ai.blocked ? 'border-danger/40 bg-danger-bg' : 'border-line bg-surface'
              }`}
            >
              <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-ink-500">
                {ai.blocked ? (
                  <ShieldAlert size={15} className="text-danger" />
                ) : (
                  <Sparkles size={15} className="text-bronze-700" />
                )}
                AI tahlili
              </h3>

              {ai.blocked && (
                <div className="mb-4 rounded-2xl border border-danger/30 bg-surface px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-danger">Bloklangan</p>
                  <p className="mt-1 text-sm text-ink-700">{ai.blockReason || 'Noma\'lub kontent aniqlandi'}</p>
                </div>
              )}

              <div className="space-y-3 text-sm">
                {ai.summary && (
                  <div>
                    <p className="text-xs font-semibold text-ink-500">Xulosa</p>
                    <p className="text-ink-700">{ai.summary}</p>
                  </div>
                )}
                {risk && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-ink-500">Xavf darajasi</span>
                    <span
                      className="rounded-full px-3 py-1 text-xs font-bold"
                      style={{
                        color: risk.color,
                        background: `color-mix(in srgb, ${risk.color} 12%, #FFFFFF)`,
                      }}
                    >
                      {risk.label}
                    </span>
                  </div>
                )}
                {ai.categoryGuess && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-ink-500">Taxminiy kategoriya</span>
                    <span className="font-semibold text-ink-900">{ai.categoryGuess}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Status tarixi */}
          {complaint.statusHistory?.length > 0 && (
            <div className="rounded-3xl border border-line bg-surface p-6 shadow-card">
              <h3 className="mb-5 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-ink-500">
                <History size={15} className="text-bronze-700" />
                Status tarixi
              </h3>

              <div className="relative space-y-5 pl-6">
                <span className="absolute left-[7px] top-2 h-[calc(100%-16px)] w-px bg-line" />
                {complaint.statusHistory.map((h, i) => (
                  <div key={h.id || i} className="relative">
                    <span
                      className="absolute -left-6 top-1.5 h-3.5 w-3.5 rounded-full border-2 border-bone-50"
                      style={{
                        background: STATUS_META[h.toStatus]?.color || '#7c7468',
                        boxShadow: `0 0 0 3px color-mix(in srgb, ${STATUS_META[h.toStatus]?.color || '#7c7468'} 25%, transparent)`,
                      }}
                    />
                    <p className="text-sm font-bold text-ink-900">
                      {STATUS_META[h.toStatus]?.label || h.toStatus}
                    </p>
                    <p className="text-xs text-ink-500">{formatDateTime(h.createdAt)}</p>
                    {h.comment && <p className="mt-1 rounded-xl bg-bone-100 px-3 py-2 text-xs text-ink-700">{h.comment}</p>}
                    {h.changedBy && (
                      <p className="mt-0.5 text-[11px] text-ink-400">
                        {h.changedBy.firstName} {h.changedBy.lastName}
                        {h.changedBy.role === 'ADMIN' || h.changedBy.role === 'SUPER_ADMIN' ? ' · Admin' : ''}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI chat taklifi */}
          {!isBlocked && (
            <div className="rounded-3xl border border-line bg-surface p-6 text-center shadow-card">
              <span className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-bronze-600 text-white">
                <MessageSquareText size={20} />
              </span>
              <p className="text-sm font-semibold text-ink-900">Bu shikoyat haqida savolingiz bormi?</p>
              <p className="mt-1 text-xs text-ink-500">
                Pastki o'ng burchakdagi AI yordamchidan shahringiz muammolari haqida so'rashingiz mumkin.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Status modal */}
      <AnimatePresence>
        {statusModal && (
          <StatusChangeModal
            complaint={complaint}
            onClose={() => setStatusModal(false)}
            onDone={() => {
              setStatusModal(false)
              load()
            }}
          />
        )}
      </AnimatePresence>

      {/* O'chirish modal */}
      <AnimatePresence>
        {deleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-backdrop"
            onClick={() => setDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.94, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.94, y: 16 }}
              className="modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-head">
                <h3 className="font-bold text-ink-900">Shikoyatni o'chirish</h3>
                <button onClick={() => setDeleteModal(false)} className="icon-btn" aria-label="Yopish">
                  <X size={18} />
                </button>
              </div>
              <div className="modal-body">
                <p className="text-sm text-ink-700">
                  Rostdan ham <b>{complaint.title}</b> shikoyatini o'chirmoqchimisiz? Bu amalni ortga qaytarib bo'lmaydi.
                </p>
              </div>
              <div className="modal-foot">
                <button onClick={() => setDeleteModal(false)} className="btn btn-ghost">
                  Bekor qilish
                </button>
                <button onClick={handleDelete} disabled={deleting} className="btn btn-danger">
                  {deleting ? "O'chirilmoqda..." : "O'chirish"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
