import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Megaphone,
  Plus,
  X,
  CalendarClock,
  Pencil,
  Trash2,
  Power,
  Sparkles,
} from 'lucide-react'
import api from '../api/client.js'
import { useToast } from '../context/ToastContext.jsx'
import { getApiError, formatDate, timeAgo } from '../utils/format.js'
import { SpinnerWrap } from './Spinner.jsx'

const emptyForm = { title: '', body: '', area: '', fixAt: '', isActive: true }

export default function AnnouncementsPanel() {
  const toast = useToast()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [busy, setBusy] = useState(false)

  const load = () => {
    setLoading(true)
    api
      .get('/announcements', { params: { includeInactive: true } })
      .then((res) => setItems(res?.data || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }

  useEffect(load, []) // eslint-disable-line react-hooks/exhaustive-deps

  const startEdit = (a) => {
    setEditing(a)
    setForm({
      title: a.title,
      body: a.body,
      area: a.area || '',
      fixAt: a.fixAt ? a.fixAt.slice(0, 16) : '',
      isActive: a.isActive,
    })
    setOpen(true)
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.body.trim()) {
      toast.error('Sarlavha va matn to\'ldirilishi shart')
      return
    }
    setBusy(true)
    const payload = {
      title: form.title.trim(),
      body: form.body.trim(),
      area: form.area.trim() || undefined,
      fixAt: form.fixAt ? new Date(form.fixAt).toISOString() : undefined,
      isActive: form.isActive,
    }
    try {
      if (editing) {
        await api.patch(`/announcements/${editing.id}`, payload)
        toast.success('Yangilik yangilandi')
      } else {
        await api.post('/announcements', payload)
        toast.success('Yangilik e\'lon qilindi')
      }
      setOpen(false)
      setEditing(null)
      setForm(emptyForm)
      load()
    } catch (err) {
      toast.error(getApiError(err, 'Saqlashda xatolik'))
    } finally {
      setBusy(false)
    }
  }

  const toggleActive = async (a) => {
    try {
      await api.patch(`/announcements/${a.id}`, { isActive: !a.isActive })
      toast.success(a.isActive ? 'Yashirildi' : 'Faqat yana ko\'rinadi')
      load()
    } catch (err) {
      toast.error(getApiError(err, 'Holat o\'zgartirilmadi'))
    }
  }

  const remove = async (a) => {
    if (!window.confirm(`"${a.title}" yangiligini o'chirasizmi?`)) return
    try {
      await api.delete(`/announcements/${a.id}`)
      toast.success('Yangilik o\'chirildi')
      load()
    } catch (err) {
      toast.error(getApiError(err, 'O\'chirishda xatolik'))
    }
  }

  const activeCount = items.filter((a) => a.isActive).length

  return (
    <div className="rounded-3xl border border-line bg-surface p-6 shadow-card sm:p-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-white">
            <Megaphone size={20} />
          </span>
          <div>
            <h2 className="text-lg font-bold text-ink-900">Yangiliklar / E'lonlar</h2>
            <p className="text-sm text-ink-500">
              Qaysi soha qachon tuzatilishini fuqarolarga e'lon qiling
            </p>
          </div>
        </div>
        <span className="chip">
          Faol: {activeCount} / {items.length}
        </span>
      </div>

      {/* Yaratish tugmasi */}
      {!open && (
        <button onClick={() => { setEditing(null); setForm(emptyForm); setOpen(true) }} className="btn btn-primary mb-5">
          <Plus size={16} />
          Yangi e'lon qo'shish
        </button>
      )}

      {/* Forma */}
      <AnimatePresence>
        {open && (
          <motion.form
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            onSubmit={submit}
            className="overflow-hidden"
          >
            <div className="mb-5 space-y-4 rounded-2xl border border-bronze-600/30 bg-bone-50 p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-ink-900">
                  {editing ? "E'lonni tahrirlash" : "Yangi e'lon"}
                </p>
                <button type="button" onClick={() => { setOpen(false); setEditing(null) }} className="icon-btn" aria-label="Yopish">
                  <X size={17} />
                </button>
              </div>

              <div className="field">
                <label className="field-label">Sarlavha</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Masalan: Chilonzor yo'li ta'mirlanadi"
                  className="input"
                />
              </div>

              <div className="field">
                <label className="field-label">Matn</label>
                <textarea
                  value={form.body}
                  onChange={(e) => setForm({ ...form, body: e.target.value })}
                  placeholder="Nima tuzatiladi, qayerda, qachon..."
                  rows={3}
                  className="textarea"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="field">
                  <label className="field-label">Soha / hudud</label>
                  <input
                    value={form.area}
                    onChange={(e) => setForm({ ...form, area: e.target.value })}
                    placeholder="Masalan: Yo'l infratuzilmasi, Chilonzor"
                    className="input"
                  />
                </div>
                <div className="field">
                  <label className="field-label flex items-center gap-2">
                    <CalendarClock size={14} />
                    Qachon tuzatiladi
                  </label>
                  <input
                    type="datetime-local"
                    value={form.fixAt}
                    onChange={(e) => setForm({ ...form, fixAt: e.target.value })}
                    className="input"
                  />
                </div>
              </div>

              <label className="flex cursor-pointer items-center gap-2.5 text-sm font-medium text-ink-700">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="h-4 w-4 accent-[#2C3E50]"
                />
                Sahifada ko'rsatilsin
              </label>

              <div className="flex justify-end gap-2.5">
                <button type="button" onClick={() => { setOpen(false); setEditing(null) }} className="btn btn-ghost">
                  Bekor qilish
                </button>
                <button type="submit" disabled={busy} className="btn btn-primary">
                  {busy ? 'Saqlanmoqda...' : editing ? 'Saqlash' : "E'lon qilish"}
                </button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Ro'yxat */}
      {loading ? (
        <SpinnerWrap label="Yangiliklar yuklanmoqda..." />
      ) : items.length === 0 ? (
        <p className="rounded-2xl bg-bone-50 py-10 text-center text-sm text-ink-500">
          Hozircha e'lonlar yo'q. Birinchi e'lonni qo'shing.
        </p>
      ) : (
        <div className="space-y-3">
          {items.map((a) => (
            <div
              key={a.id}
              className={`flex flex-col gap-3 rounded-2xl border p-4 transition sm:flex-row sm:items-center ${
                a.isActive ? 'border-line bg-surface' : 'border-line bg-bone-50/60 opacity-70'
              }`}
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  {a.isActive ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-success-bg px-2.5 py-0.5 text-xs font-bold text-success">
                      <Sparkles size={11} />
                      Faol
                    </span>
                  ) : (
                    <span className="rounded-full bg-bone-100 px-2.5 py-0.5 text-xs font-bold text-ink-500">
                      Yashirin
                    </span>
                  )}
                  {a.area && <span className="rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-semibold text-primary">{a.area}</span>}
                  {a.fixAt && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-bone-100 px-2.5 py-0.5 text-xs font-semibold text-ink-700">
                      <CalendarClock size={11} className="text-bronze-600" />
                      {formatDate(a.fixAt)}
                    </span>
                  )}
                </div>
                <p className="mt-1.5 font-semibold text-ink-900">{a.title}</p>
                <p className="ellipsis mt-0.5 text-sm text-ink-500">{a.body}</p>
                <p className="mt-1 text-xs text-ink-400">
                  {timeAgo(a.createdAt)}
                  {a.createdBy ? ` · ${a.createdBy.firstName} ${a.createdBy.lastName}` : ''}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <button
                  onClick={() => toggleActive(a)}
                  className={`icon-btn ${a.isActive ? 'text-success' : 'text-ink-400'}`}
                  title={a.isActive ? 'Yashirish' : "Ko'rsatish"}
                >
                  <Power size={16} />
                </button>
                <button onClick={() => startEdit(a)} className="icon-btn" title="Tahrirlash">
                  <Pencil size={16} />
                </button>
                <button onClick={() => remove(a)} className="icon-btn text-danger" title="O'chirish">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
