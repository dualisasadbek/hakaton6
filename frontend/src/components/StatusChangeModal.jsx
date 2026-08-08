import { useState } from 'react'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import api from '../api/client.js'
import { useToast } from '../context/ToastContext.jsx'
import { getApiError } from '../utils/format.js'
import { STATUS_META, STATUS_FLOW } from '../utils/constants.js'
import StatusBadge from './StatusBadge.jsx'

export default function StatusChangeModal({ complaint, onClose, onDone }) {
  const toast = useToast()
  const allowed = STATUS_FLOW[complaint.status] || []
  const [status, setStatus] = useState(allowed[0] || '')
  const [comment, setComment] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async () => {
    if (!status) return
    setBusy(true)
    try {
      await api.patch(`/complaints/${complaint.id}/status`, {
        status,
        comment: comment || undefined,
      })
      toast.success('Holat yangilandi')
      onDone()
    } catch (err) {
      toast.error(getApiError(err, 'Holat o\'zgartirilmadi'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[1500] flex items-center justify-center bg-charcoal/50 p-5 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.94, y: 16 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.94, y: 16 }}
        className="w-full max-w-[520px] rounded-3xl bg-surface shadow-card-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <h3 className="font-bold text-ink-900">Holatni o'zgartirish</h3>
          <button onClick={onClose} className="icon-btn" aria-label="Yopish">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 p-6">
          <div className="rounded-2xl bg-bone-100 p-4">
            <p className="mb-1 text-xs font-semibold text-ink-500">Shikoyat</p>
            <p className="text-sm font-bold text-ink-900">{complaint.title}</p>
            <div className="mt-2">
              <StatusBadge status={complaint.status} />
            </div>
          </div>

          {allowed.length ? (
            <>
              <div>
                <p className="mb-2 text-xs font-semibold text-ink-500">Yangi holat</p>
                <div className="flex flex-wrap gap-2">
                  {allowed.map((s) => (
                    <button
                      key={s}
                      onClick={() => setStatus(s)}
                      className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                        status === s
                          ? 'border-charcoal bg-charcoal text-bone-50'
                          : 'border-line bg-surface text-ink-700 hover:border-bronze-600'
                      }`}
                    >
                      {STATUS_META[s].label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="field">
                <label className="field-label">Izoh (ixtiyoriy)</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="O'zgarish sababini yozing..."
                  className="textarea"
                />
              </div>
            </>
          ) : (
            <p className="rounded-2xl bg-bone-100 p-4 text-sm text-ink-500">
              Bu holat yakuniy — boshqa holatga o'tkazib bo'lmaydi.
            </p>
          )}
        </div>

        {allowed.length > 0 && (
          <div className="flex justify-end gap-2.5 border-t border-line px-6 py-4">
            <button onClick={onClose} className="btn btn-ghost">
              Bekor qilish
            </button>
            <button onClick={submit} disabled={busy} className="btn btn-primary">
              {busy ? 'Saqlanmoqda...' : 'Saqlash'}
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
