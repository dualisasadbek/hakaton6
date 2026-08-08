import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LogIn, Eye, EyeOff } from 'lucide-react'
import AuthShell from '../components/AuthShell.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { getApiError } from '../utils/format.js'

const schema = z.object({
  email: z
    .string()
    .min(1, 'Email yoki login kiriting')
    .refine((v) => !v.includes('@') || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), 'Email noto\'g\'ri formatda'),
  password: z.string().min(1, 'Parol kiritilishi shart'),
})

export default function Login() {
  const { login } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()
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
      const identifier = data.email.includes('@') ? data.email : `${data.email}@fixmycity.uz`
      await login(identifier, data.password)
      toast.success('Tizimga kirdingiz. Xush kelibsiz!')
      navigate(location.state?.from || '/home', { replace: true })
    } catch (err) {
      toast.error(getApiError(err, 'Kirishda xatolik'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthShell
      title="Tizimga kirish"
      subtitle="Davom etish uchun hisobingizga kiring"
      footer={
        <>
          Hisobingiz yo'qmi?{' '}
          <Link to="/register" className="font-semibold text-bronze-700 hover:text-bronze-600">
            Ro'yxatdan o'tish
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="rounded-3xl border border-line bg-surface p-7 shadow-card">
        <div className="field">
          <label className="field-label">Email yoki login</label>
          <input
            type="text"
            placeholder="siz@email.uz yoki login"
            className={`input ${errors.email ? 'border-danger' : ''}`}
            {...register('email')}
          />
          {errors.email && <p className="field-error">{errors.email.message}</p>}
        </div>

        <div className="field">
          <label className="field-label">Parol</label>
          <div className="relative">
            <input
              type={show ? 'text' : 'password'}
              placeholder="••••••••"
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
          {submitting ? <span className="h-5 w-5 animate-spin rounded-full border-2 border-line border-t-bone-50" /> : <LogIn size={18} />}
          {submitting ? 'Kirilmoqda...' : 'Kirish'}
        </button>
      </form>
    </AuthShell>
  )
}
