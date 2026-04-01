'use client'

import { motion } from 'framer-motion'

const stats = [
  { value: '300+', label: 'компаний\nуже обучаются' },
  { value: '90 000+', label: 'сотрудников\nпрошли обучение' },
  { value: '110+', label: 'курсов по\n17 направлениям' },
  { value: '90%', label: 'продлевают\nподписку' },
]

export function Stats() {
  return (
    <section className="py-20 lg:py-24" aria-label="Ключевые показатели">
      <div className="container">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: i * 0.09 }}
              className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-brand-card p-6 lg:p-8 text-center"
            >
              <div
                className="text-4xl sm:text-5xl lg:text-[3.25rem] font-black text-brand-red leading-none mb-2.5"
                style={{ textShadow: '0 0 32px rgba(239,49,36,0.35)' }}
              >
                {stat.value}
              </div>
              <div className="text-sm text-white/35 leading-snug whitespace-pre-line">
                {stat.label}
              </div>
              {/* subtle corner glow */}
              <div
                className="absolute -top-6 -right-6 w-16 h-16 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(239,49,36,0.08) 0%, transparent 70%)' }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
