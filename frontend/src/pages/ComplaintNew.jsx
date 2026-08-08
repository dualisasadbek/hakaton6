import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Send, MapPin, ImagePlus, Pencil, Sparkles, ArrowLeft } from 'lucide-react'
import api from '../api/client.js'
import { useToast } from '../context/ToastContext.jsx'
import { getApiError, assetUrl } from '../utils/format.js'
import { categoryIcon } from '../utils/constants.js'
import MapPicker from '../components/MapPicker.jsx'
import ImageUploader from '../components/ImageUploader.jsx'
import { SpinnerWrap } from '../components/Spinner.jsx'

const schema = z.object({
  title: z.string().min(5, 'Sarlavha kamida 5 ta belgi').max(150, 'Sarlavha juda uzun'),
  description: z.string().min(10, 'Matn kamida 10 ta belgi').max(5000, 'Matn juda uzun'),
  address: z.string().max(300, 'Manzil juda uzun').optional(),
})

const sectionHead = (num, title, desc) => (
  <div className="mb-5 flex items-start gap-4">
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-charcoal font-display text-base font-bold text-bronze-600">
      {num}
    </span>
    <div>
      <h2 className="text-lg font-bold text-ink-900">{title}</h2>
      {desc && <p className="text-sm text-ink-500">{desc}</p>}
    </div>
  </div>
)

export default function ComplaintNew() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const toast = useToast()

  const [categories, setCategories] = useState([])
  const [categoryId, setCategoryId] = useState('')
  const [coords, setCoords] = useState(null)
  const [images, setImages] = useState([])
  const [existingImages, setExistingImages] = useState([])
  const [loading, setLoading] = useState(isEdit)
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) })

  useEffect(() => {
    api
      .get('/categories')
      .then((res) => setCategories(res?.data || []))
      .catch(() => {})
  }, [])

  // Tahrirlash rejimida mavjud shikoyatni yuklash
  useEffect(() => {
    if (!isEdit) return
    let active = true
    api
      .get(`/complaints/${id}`)
      .then((res) => {
        if (!active) return
        const c = res?.data
        reset({
          title: c.title,
          description: c.description,
          address: c.address || '',
        })
        setCategoryId(c.categoryId)
        setCoords({ lat: c.latitude, lng: c.longitude })
        setExistingImages(c.images || [])
      })
      .catch((err) => {
        toast.error(getApiError(err, 'Shikoyat yuklanmadi'))
        navigate('/map')
      })
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [isEdit, id, reset, toast, navigate])

  const onSubmit = async (data) => {
    // Validatsiya: kategoriya + joy tanlangan bo'lishi shart
    if (!categoryId) {
      toast.error('Iltimos, muammo kategoriyasini tanlang')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    if (!coords?.lat || !coords?.lng) {
      toast.error('Xaritadan muammo turgan joyni belgilang')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    setSubmitting(true)
    try {
      let complaintId = id

      if (isEdit) {
        await api.patch(`/complaints/${id}`, {
          title: data.title,
          description: data.description,
          categoryId,
          latitude: coords.lat,
          longitude: coords.lng,
          address: data.address || undefined,
        })
        if (images.length) {
          const fd = new FormData()
          images.forEach((img) => fd.append('images', img.file))
          await api.post(`/complaints/${id}/images`, fd)
        }
        toast.success('Shikoyat yangilandi')
      } else {
        const fd = new FormData()
        fd.append('title', data.title)
        fd.append('description', data.description)
        fd.append('categoryId', categoryId)
        fd.append('latitude', coords.lat)
        fd.append('longitude', coords.lng)
        if (data.address) fd.append('address', data.address)
        images.forEach((img) => fd.append('images', img.file))

        const res = await api.post('/complaints', fd)
        complaintId = res?.data?.id
        toast.success('Shikoyat yuborildi. Rahmat!')
      }

      navigate(`/complaints/${complaintId}`)
    } catch (err) {
      toast.error(getApiError(err, 'Saqlashda xatolik'))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto min-h-[70vh] max-w-[900px] px-6">
        <SpinnerWrap label="Shikoyat yuklanmoqda..." />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[900px] px-6 py-10">
      <Link
        to={isEdit ? `/complaints/${id}` : '/map'}
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-ink-500 transition hover:text-bronze-700"
      >
        <ArrowLeft size={16} />
        {isEdit ? 'Shikoyatga qaytish' : 'Xaritaga qaytish'}
      </Link>

      <div className="mb-8 flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-charcoal text-bronze-600">
          {isEdit ? <Pencil size={22} /> : <Send size={22} />}
        </span>
        <div>
          <h1 className="text-2xl font-bold text-ink-900 sm:text-3xl">
            {isEdit ? 'Shikoyatni tahrirlash' : 'Yangi shikoyat yuborish'}
          </h1>
          <p className="text-ink-500">
            {isEdit
              ? 'Faqat PENDING holatidagi shikoyatni tahrirlash mumkin'
              : '4 qadamda muammoni yetkazing — 2 daqiqadan kam vaqt ketadi'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* 1. Kategoriya */}
        <section className="rounded-3xl border border-line bg-surface p-6 shadow-card sm:p-8">
          {sectionHead(1, 'Muammo kategoriyasi', 'Qaysi sohaga tegishli?')}
          <div className="flex flex-wrap gap-2.5">
            {categories.map((c) => {
              const Icon = categoryIcon(c.icon)
              const active = categoryId === c.id
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategoryId(active ? '' : c.id)}
                  className={`flex items-center gap-2 rounded-2xl border px-5 py-3 text-sm font-semibold transition ${
                    active
                      ? 'border-charcoal bg-charcoal text-bone-50 shadow-card'
                      : 'border-line bg-surface text-ink-700 hover:border-bronze-600 hover:text-bronze-700'
                  }`}
                >
                  <Icon size={17} className={active ? 'text-bronze-600' : 'text-bronze-700'} />
                  {c.name}
                </button>
              )
            })}
          </div>
        </section>

        {/* 2. Joy */}
        <section className="rounded-3xl border border-line bg-surface p-6 shadow-card sm:p-8">
          {sectionHead(2, 'Muammo joyi', 'Xaritadan belgilang yoki "Mening joyim" tugmasini bosing')}
          <MapPicker
            coords={coords}
            onChange={setCoords}
            interactive
            height="h-80"
          />
        </section>

        {/* 3. Rasmlar */}
        <section className="rounded-3xl border border-line bg-surface p-6 shadow-card sm:p-8">
          {sectionHead(3, 'Rasmlar', 'Muammoning suratlarini yuklang (ixtiyoriy, maks 6 ta)')}
          <ImageUploader value={images} onChange={setImages} />

          {existingImages.length > 0 && (
            <div className="mt-5">
              <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-ink-500">
                <ImagePlus size={15} />
                Mavjud rasmlar ({existingImages.length})
              </p>
              <div className="grid grid-cols-4 gap-3 sm:grid-cols-6">
                {existingImages.map((img) => (
                  <div key={img.id} className="aspect-square overflow-hidden rounded-xl border border-line">
                    <img src={assetUrl(img.url)} alt="" className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* 4. Matn */}
        <section className="rounded-3xl border border-line bg-surface p-6 shadow-card sm:p-8">
          {sectionHead(4, 'Tavsif', 'Muammoni qisqa va aniq tasvirlang')}

          <div className="field">
            <label className="field-label">Sarlavha</label>
            <input
              type="text"
              placeholder="Masalan: Chorsu ko'chasidagi yo'l qoplamasi yemirilgan"
              className={`input ${errors.title ? 'border-danger' : ''}`}
              {...register('title')}
            />
            {errors.title && <p className="field-error">{errors.title.message}</p>}
          </div>

          <div className="field">
            <label className="field-label">Batafsil tavsif</label>
            <textarea
              placeholder="Muammoni batafsil tasvirlang: qachondan beri bor, qanchalik katta, kimga ta'sir qilmoqda..."
              className={`textarea ${errors.description ? 'border-danger' : ''}`}
              {...register('description')}
            />
            {errors.description && <p className="field-error">{errors.description.message}</p>}
          </div>

          <div className="field">
            <label className="field-label flex items-center gap-2">
              <MapPin size={14} />
              Manzil (ixtiyoriy)
            </label>
            <input
              type="text"
              placeholder="Masalan: Chilonzor tumani, Qatortol ko'chasi 12"
              className={`input ${errors.address ? 'border-danger' : ''}`}
              {...register('address')}
            />
            {errors.address && <p className="field-error">{errors.address.message}</p>}
          </div>
        </section>

        {/* Submit */}
        <div className="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center justify-center gap-2 text-sm text-ink-500 sm:justify-start">
            <Sparkles size={15} className="text-bronze-600" />
            Shikoyat AI orqali avtomatik tekshiriladi
          </p>
          <button type="submit" disabled={submitting} className="btn btn-primary btn-lg">
            {submitting ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-line border-t-bone-50" />
            ) : isEdit ? (
              <Pencil size={18} />
            ) : (
              <Send size={18} />
            )}
            {submitting ? 'Yuborilmoqda...' : isEdit ? 'Saqlash' : 'Shikoyatni yuborish'}
          </button>
        </div>
      </form>
    </div>
  )
}
