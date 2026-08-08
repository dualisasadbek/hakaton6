import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  Route,
  Lightbulb,
  Recycle,
  Droplet,
  PlugZap,
  TreePine,
  BusFront,
  MoreHorizontal,
  MapPin,
} from 'lucide-react'
import api from '../api/client.js'
import { useToast } from '../context/ToastContext.jsx'
import { getApiError } from '../utils/format.js'
import { categoryIcon } from '../utils/constants.js'
import EmptyState from '../components/EmptyState.jsx'
import { SpinnerWrap, Spinner } from '../components/Spinner.jsx'

const ICON_CHOICES = [
  { key: 'road', label: 'Yo\'l', Icon: Route },
  { key: 'lamp', label: 'Yoritish', Icon: Lightbulb },
  { key: 'trash', label: 'Chiqindi', Icon: Recycle },
  { key: 'water', label: 'Suv', Icon: Droplet },
  { key: 'bolt', label: 'Elektr', Icon: PlugZap },
  { key: 'tree', label: 'Park', Icon: TreePine },
  { key: 'bus', label: 'Transport', Icon: BusFront },
  { key: 'dots', label: 'Boshqa', Icon: MoreHorizontal },
  { key: 'pin', label: 'Pin', Icon: MapPin },
]

function CategoryModal({ editing, onClose, onSaved }) {
  const toast = useToast()
  const [name, setName] = useState(editing?.name || '')
  const [slug, setSlug] = useState(editing?.slug || '')
  const [icon, setIcon] = useState(editing?.icon || ICON_CHOICES[0].key)
  const [busy, setBusy] = useState(false)

  const slugify = (s) =>
    s
      .toLowerCase()
      .replace(/[']/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')

  const submit = async () => {
    if (name.trim().length < 2) {
      toast.error('Nomi kamida 2 ta belgi bo\'lishi kerak')
      return
    }
    setBusy(true)
    try {
      const payload = { name: name.trim(), slug: slug.trim() || undefined, icon }
      if (editing) {
        await api.patch(`/categories/${editing.id}`, payload)
        toast.success('Kategoriya yangilandi')
      } else {
        await api.post('/categories', payload)
        toast.success('Kategoriya yaratildi')
      }
      onSaved()
      onClose()
    } catch (err) {
      toast.error(getApiError(err, 'Saqlanmadi'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[1500] flex items-center justify-center bg-charcoal/50 p-5 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[480px] rounded-3xl bg-surface shadow-card-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <h3 className="font-bold text-ink-900">{editing ? 'Kategoriyani tahrirlash' : 'Yangi kategoriya'}</h3>
          <button onClick={onClose} className="icon-btn" aria-label="Yopish">
            <span className="text-xl leading-none">×</span>
          </button>
        </div>

        <div className="space-y-4 p-6">
          <div className="field">
            <label className="field-label">Nomi</label>
            <input
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (!editing) setSlug(slugify(e.target.value))
              }}
              placeholder="Masalan: Oshxona chiqindilari"
              className="input"
            />
          </div>

          <div className="field">
            <label className="field-label">Slug (ixtiyoriy)</label>
            <input
              value={slug}
              onChange={(e) => setSlug(slugify(e.target.value))}
              placeholder="avtomatik generatsiya"
              className="input"
            />
          </div>

          <div className="field">
            <label className="field-label">Ikonka</label>
            <div className="flex flex-wrap gap-2">
              {ICON_CHOICES.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setIcon(c.key)}
                  title={c.label}
                  className={`flex h-11 w-11 items-center justify-center rounded-xl border transition ${
                    icon === c.key
                      ? 'border-charcoal bg-charcoal text-bronze-600'
                      : 'border-line bg-surface text-ink-500 hover:border-bronze-600 hover:text-bronze-700'
                  }`}
                >
                  <c.Icon size={19} />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2.5 border-t border-line px-6 py-4">
          <button onClick={onClose} className="btn btn-ghost">
            Bekor qilish
          </button>
          <button onClick={submit} disabled={busy} className="btn btn-primary">
            {busy ? 'Saqlanmoqda...' : 'Saqlash'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminCategories() {
  const navigate = useNavigate()
  const toast = useToast()

  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [busyId, setBusyId] = useState(null)

  const load = () => {
    setLoading(true)
    api
      .get('/categories', { params: { includeInactive: true } })
      .then((res) => setItems(res?.data || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }

  useEffect(load, []) // eslint-disable-line react-hooks/exhaustive-deps

  const remove = async (c) => {
    setBusyId(c.id)
    try {
      await api.delete(`/categories/${c.id}`)
      toast.success('Kategoriya o\'chirildi')
      setItems((prev) => prev.filter((x) => x.id !== c.id))
    } catch (err) {
      toast.error(getApiError(err, 'O\'chirilmadi'))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-10">
      <button
        onClick={() => navigate('/admin')}
        className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-ink-500 transition hover:text-bronze-700"
      >
        <ArrowLeft size={16} />
        Admin panelga qaytish
      </button>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink-900 sm:text-3xl">Kategoriyalar</h1>
          <p className="mt-1 text-ink-500">Shikoyat kategoriyalarini boshqarish</p>
        </div>
        <button
          onClick={() => {
            setEditing(null)
            setModal(true)
          }}
          className="btn btn-primary"
        >
          <Plus size={17} />
          Yangi kategoriya
        </button>
      </div>

      <div className="mt-8">
        {loading ? (
          <SpinnerWrap label="Kategoriyalar yuklanmoqda..." />
        ) : items.length === 0 ? (
          <div className="rounded-3xl border border-line bg-surface shadow-card">
            <EmptyState icon="users" title="Kategoriyalar yo'q" />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {items.map((c) => {
              const Icon = categoryIcon(c.icon)
              return (
                <div
                  key={c.id}
                  className="flex items-center gap-4 rounded-2xl border border-line bg-surface p-5 shadow-card transition hover:border-bronze-600"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-charcoal text-bronze-600">
                    <Icon size={22} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-ink-900">{c.name}</p>
                    <p className="truncate text-xs text-ink-500">
                      /{c.slug} · {c._count?.complaints ?? 0} ta shikoyat
                      {!c.isActive && <span className="ml-2 text-danger">· nofaol</span>}
                    </p>
                  </div>
                  <div className="flex gap-1.5">
                    {busyId === c.id ? (
                      <Spinner size="sm" />
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setEditing(c)
                            setModal(true)
                          }}
                          className="icon-btn"
                          title="Tahrirlash"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => remove(c)}
                          className="icon-btn hover:bg-danger-bg hover:text-danger"
                          title="O'chirish"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <AnimatePresence>
        {modal && (
          <CategoryModal
            editing={editing}
            onClose={() => setModal(false)}
            onSaved={load}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
