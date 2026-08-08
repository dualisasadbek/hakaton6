import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { User as UserIcon, Save, KeyRound, ShieldCheck, Mail, CalendarDays } from 'lucide-react'
import api from '../api/client.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { getApiError, formatDate } from '../utils/format.js'
import { ROLES } from '../utils/constants.js'

const infoSchema = z.object({
  firstName: z.string().min(2, 'Ism kamida 2 ta belgi'),
  lastName: z.string().min(2, 'Familiya kamida 2 ta belgi'),
})

const passSchema = z
  .object({
    password: z.string().min(6, 'Parol kamida 6 ta belgi'),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: 'Parollar mos emas',
    path: ['confirm'],
  })

export default function Profile() {
  const { user, refreshUser } = useAuth()
  const toast = useToast()

  const [infoBusy, setInfoBusy] = useState(false)
  const [passBusy, setPassBusy] = useState(false)

  const infoForm = useForm({
    resolver: zodResolver(infoSchema),
    defaultValues: { firstName: user?.firstName || '', lastName: user?.lastName || '' },
  })

  const passForm = useForm({ resolver: zodResolver(passSchema) })

  const saveInfo = async (data) => {
    setInfoBusy(true)
    try {
      await api.patch('/users/me', data)
      await refreshUser()
      toast.success('Profil yangilandi')
    } catch (err) {
      toast.error(getApiError(err, 'Saqlanmadi'))
    } finally {
      setInfoBusy(false)
    }
  }

  const changePassword = async (data) => {
    setPassBusy(true)
    try {
      await api.patch('/users/me', { password: data.password })
      passForm.reset()
      toast.success('Parol yangilandi')
    } catch (err) {
      toast.error(getApiError(err, 'Parol o\'zgartirilmadi'))
    } finally {
      setPassBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-[900px] px-6 py-10">
      <h1 className="text-2xl font-bold text-ink-900 sm:text-3xl">Profil</h1>
      <p className="mt-1 text-ink-500">Shaxsiy ma'lumotlaringizni boshqaring</p>

      <div className="mt-8 grid gap-8 md:grid-cols-[320px_1fr]">
        {/* Profil kartasi */}
        <div className="h-fit rounded-3xl border border-line bg-surface p-8 text-center shadow-card">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-charcoal text-4xl font-bold text-bronze-100 shadow-card-lg">
            {user?.firstName?.[0]}
          </div>
          <h2 className="mt-4 text-xl font-bold text-ink-900">
            {user?.firstName} {user?.lastName}
          </h2>
          <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-bone-100 px-3.5 py-1.5 text-xs font-bold text-bronze-700">
            <ShieldCheck size={13} />
            {ROLES[user?.role] || user?.role}
          </span>

          <div className="mt-6 space-y-3 border-t border-line pt-6 text-left text-sm">
            <p className="flex items-center gap-2.5 text-ink-700">
              <Mail size={16} className="text-bronze-700" />
              {user?.email}
            </p>
            <p className="flex items-center gap-2.5 text-ink-500">
              <CalendarDays size={16} className="text-bronze-700" />
              {formatDate(user?.createdAt)}
            </p>
          </div>
        </div>

        {/* Formalar */}
        <div className="space-y-6">
          <form onSubmit={infoForm.handleSubmit(saveInfo)} className="rounded-3xl border border-line bg-surface p-7 shadow-card">
            <h3 className="mb-5 flex items-center gap-2 text-lg font-bold text-ink-900">
              <UserIcon size={19} className="text-bronze-700" />
              Shaxsiy ma'lumotlar
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="field">
                <label className="field-label">Ism</label>
                <input
                  type="text"
                  className={`input ${infoForm.formState.errors.firstName ? 'border-danger' : ''}`}
                  {...infoForm.register('firstName')}
                />
                {infoForm.formState.errors.firstName && (
                  <p className="field-error">{infoForm.formState.errors.firstName.message}</p>
                )}
              </div>
              <div className="field">
                <label className="field-label">Familiya</label>
                <input
                  type="text"
                  className={`input ${infoForm.formState.errors.lastName ? 'border-danger' : ''}`}
                  {...infoForm.register('lastName')}
                />
                {infoForm.formState.errors.lastName && (
                  <p className="field-error">{infoForm.formState.errors.lastName.message}</p>
                )}
              </div>
            </div>

            <button type="submit" disabled={infoBusy} className="btn btn-primary">
              {infoBusy ? 'Saqlanmoqda...' : <><Save size={17} /> Saqlash</>}
            </button>
          </form>

          <form onSubmit={passForm.handleSubmit(changePassword)} className="rounded-3xl border border-line bg-surface p-7 shadow-card">
            <h3 className="mb-5 flex items-center gap-2 text-lg font-bold text-ink-900">
              <KeyRound size={19} className="text-bronze-700" />
              Parolni yangilash
            </h3>

            <div className="field">
              <label className="field-label">Yangi parol</label>
              <input
                type="password"
                placeholder="Kamida 6 ta belgi"
                className={`input ${passForm.formState.errors.password ? 'border-danger' : ''}`}
                {...passForm.register('password')}
              />
              {passForm.formState.errors.password && (
                <p className="field-error">{passForm.formState.errors.password.message}</p>
              )}
            </div>

            <div className="field">
              <label className="field-label">Parolni tasdiqlang</label>
              <input
                type="password"
                placeholder="Parolni qayta kiriting"
                className={`input ${passForm.formState.errors.confirm ? 'border-danger' : ''}`}
                {...passForm.register('confirm')}
              />
              {passForm.formState.errors.confirm && (
                <p className="field-error">{passForm.formState.errors.confirm.message}</p>
              )}
            </div>

            <button type="submit" disabled={passBusy} className="btn btn-bronze text-white">
              {passBusy ? 'Yangilanmoqda...' : <><KeyRound size={17} /> Parolni yangilash</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
