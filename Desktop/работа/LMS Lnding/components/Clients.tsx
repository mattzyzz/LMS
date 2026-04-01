'use client'

import { motion } from 'framer-motion'

const clients = [
  'Додо Пицца', 'Familia', 'Деловые Линии', 'МТС Банк', 'Calltouch',
  'Четыре Лапы', 'Банк Синара', 'Roistat', 'Sunlight', 'Profitbase',
  'Usedesk', 'ТЕНЗОР', 'Агро Банк', 'ММК', 'Positive Technologies',
  'Selectel', 'Bitrix24', 'Innostage',
]

export function Clients() {
  const doubled = [...clients, ...clients]

  return (
    <section className="py-16 border-y border-white/[0.05] overflow-hidden" aria-label="Наши клиенты">
      <div className="container mb-8">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center text-xs font-semibold uppercase tracking-widest text-white/25"
        >
          Обучают команды в Альфа-Курс
        </motion.p>
      </div>

      {/* Marquee */}
      <div className="relative">
        {/* fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to right, #0D0D0D, transparent)' }} />
        <div className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to left, #0D0D0D, transparent)' }} />

        <div className="flex gap-12 items-center marquee-track">
          {doubled.map((name, i) => (
            <div
              key={i}
              className="flex-shrink-0 text-white/20 font-bold text-lg tracking-tight hover:text-white/50 transition-colors duration-300 cursor-default select-none"
            >
              {name}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
