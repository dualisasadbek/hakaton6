import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { MessageSquareText, X, Send } from 'lucide-react'
import api from '../api/client.js'
import { getApiError } from '../utils/format.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'

const WELCOME = 'Assalomu alaykum! Men FixMyCity AI yordamchisiman. Shahar muammolari, shikoyat yozish va platforma haqida savollaringizga javob beraman.'

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [enabled, setEnabled] = useState(true)
  const [messages, setMessages] = useState([{ role: 'assistant', content: WELCOME }])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const bodyRef = useRef(null)
  const { user } = useAuth()
  const toast = useToast()

  // AI holatini tekshirish
  useEffect(() => {
    api
      .get('/ai/status', { skipRefresh: true })
      .then((res) => setEnabled(Boolean(res?.data?.enabled)))
      .catch(() => setEnabled(true))
  }, [])

  // Yangi xabar kelganda pastga siljitish
  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, typing, open])

  const send = async () => {
    const text = input.trim()
    if (!text || typing) return
    setInput('')

    const history = messages
      .filter((m) => m.role !== 'system')
      .slice(-8)
      .map(({ role, content }) => ({ role, content }))

    setMessages((m) => [...m, { role: 'user', content: text }])
    setTyping(true)

    try {
      const res = await api.post('/ai/chat', { message: text, history })
      setMessages((m) => [...m, { role: 'assistant', content: res?.data?.answer || '' }])
    } catch (err) {
      setMessages((m) => [...m, { role: 'assistant', content: "Xatolik yuz berdi. Keyinroq urinib ko'ring." }])
      toast.error(getApiError(err, "AI bilan bog'lanib bo'lmadi"))
    } finally {
      setTyping(false)
    }
  }

  return (
    <>
      {/* Suzuvchi tugma */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-[1100] flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-card-lg transition hover:scale-105 hover:bg-primary-hover"
        aria-label="AI yordamchi"
        title="AI yordamchi"
      >
        {open ? <X size={24} /> : <MessageSquareText size={24} />}
      </button>

      {/* Chat oyna */}
      <AnimatePresence>
        {open && (
          <>
            {/* Tashqariga bosish orqali yopish */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[1090] bg-charcoal/30"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.96 }}
              transition={{ duration: 0.25 }}
              className="fixed bottom-24 right-6 z-[1100] flex h-[min(72vh,520px)] w-[min(92vw,370px)] flex-col overflow-hidden rounded-3xl border border-line bg-surface shadow-card-lg"
            >
              {/* Sarlavha */}
              <div className="flex items-center gap-3 border-b border-line bg-bone-50 px-4 py-3.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-bronze-600 font-display text-sm font-bold text-white">
                  AI
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-ink-900">FixMyCity AI</p>
                  <p className="flex items-center gap-1.5 text-xs text-ink-500">
                    <span className={`h-2 w-2 rounded-full ${enabled ? 'bg-success' : 'bg-danger'}`} />
                    {enabled ? 'onlayn' : 'o\'chirilgan'}
                  </p>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-500 transition hover:bg-surface-2 hover:text-ink-900"
                  aria-label="Suhbatni yopish"
                  title="Yopish"
                >
                  <X size={18} />
                </button>
              </div>

            {/* Xabarlar */}
            <div ref={bodyRef} className="no-scrollbar flex-1 space-y-3 overflow-y-auto bg-bone-50/50 p-4">
              {messages.map((m, i) => (
                <div key={i} className={`flex items-end gap-2 ${m.role === 'user' ? 'justify-end' : ''}`}>
                  {m.role === 'assistant' && (
                    <span className="mb-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-bronze-600 text-[10px] font-bold text-white">
                      AI
                    </span>
                  )}
                  <div
                    className={`max-w-[78%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm ${
                      m.role === 'user'
                        ? 'rounded-br-md bg-charcoal text-bone-50'
                        : 'rounded-bl-md border border-line bg-surface text-ink-700'
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}

              {typing && (
                <div className="flex items-end gap-2">
                  <span className="mb-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-bronze-600 text-[10px] font-bold text-white">
                    AI
                  </span>
                  <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-line bg-surface px-4 py-3 shadow-sm">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="h-2 w-2 animate-typing rounded-full bg-bronze-600"
                        style={{ animationDelay: `${i * 0.18}s` }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="flex items-center gap-2 border-t border-line bg-surface p-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && send()}
                placeholder="Savolingizni yozing..."
                className="min-w-0 flex-1 rounded-xl border border-line bg-bone-50 px-3.5 py-2.5 text-sm text-ink-900 outline-none transition focus:border-bronze-600 focus:ring-4 focus:ring-bronze-glow"
              />
              <button
                onClick={send}
                disabled={!input.trim() || typing}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Yuborish"
              >
                <Send size={17} />
              </button>
            </div>

            {!user && (
              <p className="bg-bone-100 px-4 py-1.5 text-center text-[11px] text-ink-500">
                Anonim rejimda — profil ma'lumotlaringiz AI ga yuborilmaydi
              </p>
            )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
