import { useRef, useState } from 'react'
import { UploadCloud, X, ImagePlus } from 'lucide-react'
import { MAX_IMAGES } from '../utils/constants.js'
import { useToast } from '../context/ToastContext.jsx'

export default function ImageUploader({ value = [], onChange, max = MAX_IMAGES }) {
  const [drag, setDrag] = useState(false)
  const inputRef = useRef(null)
  const toast = useToast()

  const addFiles = (files) => {
    const list = Array.from(files).filter((f) => f.type.startsWith('image/'))
    const remaining = max - value.length
    if (remaining <= 0) {
      toast.error(`Ko'pi bilan ${max} ta rasm yuklash mumkin`)
      return
    }
    const selected = list.slice(0, remaining)
    if (list.length > remaining) {
      toast.info(`Faqat ${remaining} ta rasm qo'shildi (maks ${max} ta)`)
    }
    if (!selected.length) return

    const items = selected.map((file) => {
      const preview = URL.createObjectURL(file)
      return { file, preview }
    })
    onChange([...value, ...items])
  }

  const removeAt = (i) => {
    const target = value[i]
    if (target?.preview) URL.revokeObjectURL(target.preview)
    onChange(value.filter((_, idx) => idx !== i))
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          addFiles(e.target.files)
          e.target.value = ''
        }}
      />

      {/* Drop zonasi */}
      <div
        onClick={() => !drag && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setDrag(true)
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDrag(false)
          addFiles(e.dataTransfer.files)
        }}
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition ${
          drag ? 'border-bronze-600 bg-bronze-100/50' : 'border-line bg-surface hover:border-bronze-600'
        }`}
      >
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-bone-100 text-bronze-600">
          <UploadCloud size={26} />
        </span>
        <p className="font-semibold text-ink-900">Rasmlarni shu yerga tashlang</p>
        <p className="text-sm text-ink-500">
          yoki <span className="font-semibold text-bronze-700">bosing va tanlang</span> · maks {max} ta
        </p>
      </div>

      {/* Previews */}
      {value.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
          {value.map((item, i) => (
            <div
              key={item.preview || item.url || i}
              className="group relative aspect-square overflow-hidden rounded-xl border border-line bg-bone-100"
            >
              <img src={item.preview || item.url} alt={`Rasm ${i + 1}`} className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removeAt(i)}
                className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-charcoal/80 text-bone-50 opacity-0 transition group-hover:opacity-100"
                aria-label="O'chirish"
              >
                <X size={14} />
              </button>
            </div>
          ))}

          {value.length < max && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex aspect-square items-center justify-center rounded-xl border-2 border-dashed border-line text-ink-400 transition hover:border-bronze-600 hover:text-bronze-700"
              aria-label="Rasm qo'shish"
            >
              <ImagePlus size={24} />
            </button>
          )}
        </div>
      )}
    </div>
  )
}
