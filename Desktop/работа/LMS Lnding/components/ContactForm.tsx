'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Illustration3D } from '@/components/Illustration3D'

// ─── MODAL FORM ─────────────────────────────────────────────────────────────

interface FormState {
  name: string
  company: string
  position: string
  email: string
  phone: string
  size: string
  message: string
  consent: boolean
}

const sizeOptions = [
  '1–50 сотрудников',
  '51–200 сотрудников',
  '201–500 сотрудников',
  '501–1000 сотрудников',
  'более 1000 сотрудников',
]

function ModalForm({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState<FormState>({
    name: '', company: '', position: '', email: '',
    phone: '', size: '', message: '', consent: false,
  })
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})
  const [submitted, setSubmitted] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const set = (key: keyof FormState, value: string | boolean) => {
    setForm(f => ({ ...f, [key]: value }))
    setErrors(e => ({ ...e, [key]: undefined }))
  }

  const validate = () => {
    const e: Partial<Record<keyof FormState, string>> = {}
    if (!form.name.trim()) e.name = 'Обязательное поле'
    if (!form.company.trim()) e.company = 'Обязательное поле'
    if (!form.position.trim()) e.position = 'Обязательное поле'
    if (!form.email.trim()) e.email = 'Обязательное поле'
    if (!form.phone.trim()) e.phone = 'Обязательное поле'
    if (!form.consent) e.consent = 'Необходимо согласие'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault()
    if (validate()) setSubmitted(true)
  }

  const inputCls = (key: keyof FormState) =>
    cn(
      'w-full bg-white/[0.06] border rounded-lg px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none transition-all duration-200 min-h-[48px]',
      errors[key]
        ? 'border-brand-red/70 focus:border-brand-red'
        : 'border-white/[0.08] focus:border-white/30 focus:bg-white/[0.08]',
    )

  return (
    <AnimatePresence>
      <motion.div
        ref={overlayRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
        onClick={e => { if (e.target === overlayRef.current) onClose() }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-lg bg-[#141414] rounded-2xl border border-white/[0.08] shadow-2xl overflow-hidden"
          style={{ maxHeight: '90vh', overflowY: 'auto' }}
        >
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-white/40 hover:text-white transition-colors rounded-lg hover:bg-white/5 z-10"
            aria-label="Закрыть"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 3l10 10M3 13L13 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>

          <div className="px-8 py-8">
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center text-center py-8"
                role="status"
                aria-live="polite"
              >
                <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-5">
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                    <path d="M6 14l6 6L22 8" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Заявка отправлена!</h3>
                <p className="text-sm text-white/45 leading-relaxed">
                  Мы свяжемся с вами в течение одного рабочего дня.
                </p>
                <button
                  onClick={onClose}
                  className="mt-6 px-6 py-2.5 bg-white/8 border border-white/12 text-white/70 text-sm rounded-lg hover:bg-white/12 transition-all"
                >
                  Закрыть
                </button>
              </motion.div>
            ) : (
              <>
                <h2 id="modal-title" className="text-xl font-bold text-white text-center mb-6">
                  Получить консультацию
                </h2>

                <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">
                  {/* Row 1: Имя | Название компании */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <input
                        id="modal-name"
                        type="text"
                        placeholder="Имя *"
                        value={form.name}
                        onChange={e => set('name', e.target.value)}
                        className={inputCls('name')}
                        aria-label="Имя"
                        aria-required="true"
                      />
                    </div>
                    <div>
                      <input
                        id="modal-company"
                        type="text"
                        placeholder="Название компании *"
                        value={form.company}
                        onChange={e => set('company', e.target.value)}
                        className={inputCls('company')}
                        aria-label="Название компании"
                        aria-required="true"
                      />
                    </div>
                  </div>

                  {/* Row 2: Должность */}
                  <input
                    id="modal-position"
                    type="text"
                    placeholder="Ваша должность *"
                    value={form.position}
                    onChange={e => set('position', e.target.value)}
                    className={inputCls('position')}
                    aria-label="Должность"
                    aria-required="true"
                  />

                  {/* Row 3: Email | Phone */}
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      id="modal-email"
                      type="email"
                      placeholder="Электронная почта *"
                      value={form.email}
                      onChange={e => set('email', e.target.value)}
                      className={inputCls('email')}
                      aria-label="Email"
                      aria-required="true"
                    />
                    <div className={cn(
                      'flex items-center border rounded-lg overflow-hidden transition-all duration-200 min-h-[48px]',
                      errors.phone
                        ? 'border-brand-red/70'
                        : 'border-white/[0.08] focus-within:border-white/30 focus-within:bg-white/[0.08]',
                      'bg-white/[0.06]'
                    )}>
                      {/* Russian flag prefix */}
                      <div className="flex items-center gap-1.5 pl-3 pr-2 border-r border-white/[0.08] flex-shrink-0">
                        {/* RU flag */}
                        <svg width="18" height="13" viewBox="0 0 18 13" aria-label="Россия">
                          <rect width="18" height="4.33" y="0" fill="#fff" />
                          <rect width="18" height="4.33" y="4.33" fill="#0039A6" />
                          <rect width="18" height="4.33" y="8.67" fill="#D52B1E" />
                        </svg>
                        <span className="text-xs text-white/40">+7</span>
                      </div>
                      <input
                        id="modal-phone"
                        type="tel"
                        placeholder="(000) 000-00-00"
                        value={form.phone}
                        onChange={e => set('phone', e.target.value)}
                        className="flex-1 bg-transparent px-2 py-3 text-sm text-white placeholder:text-white/25 outline-none"
                        aria-label="Телефон"
                        aria-required="true"
                      />
                    </div>
                  </div>

                  {/* Row 4: Размер компании */}
                  <div className="relative">
                    <select
                      value={form.size}
                      onChange={e => set('size', e.target.value)}
                      className={cn(
                        'w-full appearance-none bg-white/[0.06] border rounded-lg px-4 py-3 text-sm outline-none transition-all duration-200 min-h-[48px] cursor-pointer',
                        form.size ? 'text-white' : 'text-white/25',
                        'border-white/[0.08] focus:border-white/30',
                      )}
                      aria-label="Размер компании"
                    >
                      <option value="" disabled className="bg-[#141414] text-white/40">Размер компании</option>
                      {sizeOptions.map(opt => (
                        <option key={opt} value={opt} className="bg-[#141414] text-white">
                          {opt}
                        </option>
                      ))}
                    </select>
                    <svg
                      className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/30"
                      width="16" height="16" viewBox="0 0 16 16" fill="none"
                    >
                      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>

                  {/* Row 5: Сообщение */}
                  <textarea
                    placeholder="Расскажите о ваших задачах"
                    value={form.message}
                    onChange={e => set('message', e.target.value)}
                    rows={3}
                    className="w-full bg-white/[0.06] border border-white/[0.08] rounded-lg px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none focus:border-white/30 focus:bg-white/[0.08] transition-all duration-200 resize-none"
                    aria-label="Сообщение"
                  />

                  {/* Checkbox */}
                  <label className="flex items-start gap-3 cursor-pointer group mt-1">
                    <div className="relative mt-0.5 flex-shrink-0">
                      <input
                        type="checkbox"
                        checked={form.consent}
                        onChange={e => set('consent', e.target.checked)}
                        className="sr-only"
                        aria-label="Согласие на обработку данных"
                      />
                      <div className={cn(
                        'w-4 h-4 rounded border flex items-center justify-center transition-all duration-150',
                        form.consent
                          ? 'bg-brand-red border-brand-red'
                          : errors.consent
                          ? 'border-brand-red/60 bg-transparent'
                          : 'border-white/20 bg-transparent group-hover:border-white/40',
                      )}>
                        {form.consent && (
                          <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                            <path d="M1.5 4.5L3.5 6.5L7.5 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-white/35 leading-relaxed">
                      Согласен на обработку персональных данных
                    </span>
                  </label>
                  {errors.consent && (
                    <p className="text-xs text-brand-red -mt-1 pl-7" role="alert">{errors.consent}</p>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    className="w-full py-3.5 bg-brand-red text-white font-semibold rounded-xl hover:brightness-110 hover:shadow-lg hover:shadow-brand-red/25 transition-all duration-200 text-sm min-h-[50px] mt-1"
                  >
                    Отправить
                  </button>
                </form>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// ─── CTA BANNER ─────────────────────────────────────────────────────────────

export function ContactForm() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <section id="contact" className="py-24 lg:py-32 bg-brand-bg" aria-labelledby="cta-heading">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-3xl border border-white/[0.07] bg-brand-card"
            style={{
              background: 'linear-gradient(135deg, #161616 0%, #1a1010 50%, #161616 100%)',
            }}
          >
            {/* Glow */}
            <div
              className="absolute inset-0 pointer-events-none"
              aria-hidden="true"
              style={{
                background: 'radial-gradient(ellipse at 80% 50%, rgba(239,49,36,0.06) 0%, transparent 65%)',
              }}
            />

            <div className="relative flex flex-col lg:flex-row items-center gap-10 px-10 py-12 lg:px-16 lg:py-14">
              {/* Left: text + button */}
              <div className="flex-1 text-center lg:text-left">
                <h2
                  id="cta-heading"
                  className="text-3xl sm:text-4xl lg:text-[2.5rem] font-black text-white leading-[1.1] mb-4"
                >
                  Готовы обсудить обучение<br />
                  <span className="text-white/80">для вашей команды?</span>
                </h2>
                <p className="text-white/40 text-base leading-relaxed mb-8 max-w-sm lg:max-w-none">
                  Оставьте заявку, и мы подберём оптимальное решение под ваши задачи и бюджет.
                </p>
                <button
                  onClick={() => setOpen(true)}
                  className="inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-brand-red text-white font-semibold rounded-xl hover:brightness-110 hover:shadow-xl hover:shadow-brand-red/30 hover:-translate-y-0.5 transition-all duration-200 text-base min-h-[52px]"
                >
                  Получить консультацию
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>

              {/* Right: 3D illustration */}
              <div className="w-64 h-56 lg:w-72 lg:h-64 flex-shrink-0" aria-hidden="true">
                <Illustration3D />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Modal */}
      {open && <ModalForm onClose={() => setOpen(false)} />}
    </>
  )
}
