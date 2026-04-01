'use client'

import { motion } from 'framer-motion'

const proofStats = [
  { value: '300+', label: 'компаний-клиентов' },
  { value: '90 000+', label: 'обученных сотрудников' },
  { value: '90%', label: 'продлевают подписку\nкаждый год' },
]

export function SocialProof() {
  return (
    <section
      className="py-24 lg:py-32 bg-brand-surface/20"
      aria-labelledby="proof-heading"
    >
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2
            id="proof-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-black"
          >
            Нам доверяют <span className="text-brand-red">300+ компаний</span>
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-3 gap-5 lg:gap-6 mb-10">
          {proofStats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-white rounded-2xl p-8 lg:p-10 text-center"
              role="figure"
              aria-label={`${stat.value} ${stat.label.replace('\n', ' ')}`}
            >
              <div className="text-5xl lg:text-6xl font-black text-brand-red leading-none mb-3" aria-hidden="true">
                {stat.value}
              </div>
              <div className="text-gray-400 text-sm leading-snug whitespace-pre-line">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center text-white/40 text-sm max-w-md mx-auto"
        >
          Среди клиентов — компании из финансового сектора, ритейла, производства и технологий
        </motion.p>
      </div>
    </section>
  )
}
