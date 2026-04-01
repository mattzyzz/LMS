'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

const formats = [
  {
    tag: 'Популярный выбор',
    title: 'Полный каталог',
    subtitle: 'Корпоративная подписка',
    desc: 'Все 110+ курсов для всей команды. Подключите компанию на 1, 3, 6 или 12 месяцев — сотрудники получают безлимитный доступ к обучению сразу после оплаты.',
    features: ['Весь каталог 110+ курсов', 'LMS-портал с аналитикой', 'Брендирование (white label)', 'Сертификаты гос. образца'],
    cta: 'Оставить заявку',
    href: '#contact',
    featured: true,
  },
  {
    title: 'Профильный доступ',
    subtitle: 'Обучение отделов',
    desc: 'Откройте доступ к нужным курсам конкретному отделу — продажи, финансы, HR, IT. Только то, что действительно нужно команде.',
    features: ['Подборка по профилю', 'Отчёты по подразделению', 'Гибкие сроки доступа'],
    cta: 'Узнать подробнее',
    href: '#contact',
    featured: false,
  },
  {
    title: 'Под ваши задачи',
    subtitle: 'Кастомный курс',
    desc: 'Разработаем курс с нуля по вашим процессам и метрикам или адаптируем готовую программу. Методисты Альфа-Банка — ваша команда разработки.',
    features: ['Разработка с нуля', 'Адаптация готовой программы', 'Интеграция в LMS'],
    cta: 'Обсудить проект',
    href: '#contact',
    featured: false,
  },
]

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <circle cx="7" cy="7" r="7" fill="#EF3124" fillOpacity="0.12" />
    <path d="M4.5 7l2 2 3-3" stroke="#EF3124" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export function Formats() {
  return (
    <section
      id="formats"
      className="py-24 lg:py-32 bg-brand-bg"
      aria-labelledby="formats-heading"
    >
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <h2
            id="formats-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4"
          >
            Выберите формат{' '}
            <span className="text-brand-red">под свои задачи</span>
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6 items-start">
          {formats.map((format, i) => (
            <motion.article
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              aria-label={format.title}
              className={cn(
                'relative flex flex-col rounded-2xl p-7 lg:p-8 h-full transition-shadow duration-300',
                format.featured
                  ? 'bg-brand-card border-2 border-brand-red shadow-[0_0_40px_rgba(239,49,36,0.12)] hover:shadow-[0_0_60px_rgba(239,49,36,0.18)]'
                  : 'bg-brand-card border border-white/[0.07] hover:border-white/[0.12]',
              )}
            >
              {format.featured && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-brand-red text-white text-xs font-bold rounded-full whitespace-nowrap shadow-lg">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                      <path d="M5 1l1 2.5h2.5l-2 1.5.8 2.5L5 6l-2.3 1.5.8-2.5L1.5 3.5H4L5 1z" fill="white" />
                    </svg>
                    {format.tag}
                  </span>
                </div>
              )}

              <div className="mb-5">
                <p className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-1">
                  {format.subtitle}
                </p>
                <h3 className="text-2xl font-black text-white">{format.title}</h3>
              </div>

              <p className="text-sm text-white/50 leading-relaxed mb-6">{format.desc}</p>

              <ul className="space-y-2.5 mb-8 flex-1" role="list">
                {format.features.map((feat, j) => (
                  <li key={j} className="flex items-center gap-2.5 text-sm text-white/70">
                    <CheckIcon />
                    {feat}
                  </li>
                ))}
              </ul>

              <a
                href={format.href}
                className={cn(
                  'inline-flex items-center justify-center w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 min-h-[48px]',
                  format.featured
                    ? 'bg-brand-red text-white hover:brightness-110 hover:shadow-lg hover:shadow-brand-red/25'
                    : 'border border-white/15 text-white hover:border-white/30 hover:bg-white/5',
                )}
              >
                {format.cta}
              </a>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
