import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { UserPlus, Eye, EyeOff } from 'lucide-react'
import AuthShell from '../components/AuthShell.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { getApiError } from '../utils/format.js'

const schema = z.object({
  firstName: z.string().min(2, 'Ism kamida 2 ta belgi bo\'lishi kerak'),
  lastName: z.string().min(2, 'Familiya kamida 2 ta belgi bo\'lishi kerak'),
  email: z.string().email('Email noto\'g\'ri formatda'),
  password: z.string().min(6, 'Parol kamida 6 ta belgi bo\'lishi kerak'),
})

export default function Register() {
  const { register: registerUser } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [show, setShow] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) })

  const onSubmit = async (data) => {
    setSubmitting(true)
    try {
      await registerUser(data)
      toast.success('Ro\'yxatdan o\'tdingiz. Xush kelibsiz!')
      navigate('/home', { replace: true })
    } catch (err) {
      toast.error(getApiError(err, 'Ro\'yxatdan o\'tishda xatolik'))
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass = (hasError) => `input ${hasError ? 'border-danger' : ''}`

  return (
    <AuthShell
      title="Ro'yxatdan o'tish"
      subtitle="Shikoyat yuborish va ovoz berish uchun hisob yarating"
      footer={
        <>
          Hisobingiz bormi?{' '}
          <Link to="/login" className="font-semibold text-bronze-700 hover:text-bronze-600">
            Kirish
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="rounded-3xl border border-line bg-surface p-7 shadow-card">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="field">
            <label className="field-label">Ism</label>
            <input type="text" placeholder="Ali" className={inputClass(errors.firstName)} {...register('firstName')} />
            {errors.firstName && <p className="field-error">{errors.firstName.message}</p>}
          </div>

          <div className="field">
            <label className="field-label">Familiya</label>
            <input type="text" placeholder="Valiyev" className={inputClass(errors.lastName)} {...register('lastName')} />
            {errors.lastName && <p className="field-error">{errors.lastName.message}</p>}
          </div>
        </div>

        <div className="field">
          <label className="field-label">Email</label>
          <input type="email" placeholder="siz@email.uz" className={inputClass(errors.email)} {...register('email')} />
          {errors.email && <p className="field-error">{errors.email.message}</p>}
        </div>

        <div className="field">
          <label className="field-label">Parol</label>
          <div className="relative">
            <input
              type={show ? 'text' : 'password'}
              placeholder="Kamida 6 ta belgi"
              className={`input pr-11 ${errors.password ? 'border-danger' : ''}`}
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700"
              aria-label={show ? 'Parolni yashirish' : 'Parolni ko\'rsatish'}
            >
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && <p className="field-error">{errors.password.message}</p>}
        </div>

        <button type="submit" disabled={submitting} className="btn btn-primary btn-block btn-lg mt-2">
          {submitting ? (
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-line border-t-bone-50" />
          ) : (
            <UserPlus size={18} />
          )}
          {submitting ? 'Yaratilmoqda...' : 'Hisob yaratish'}
        </button>
      </form>
    </AuthShell>
  )
}
