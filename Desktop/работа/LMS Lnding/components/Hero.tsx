'use client'

import { motion } from 'framer-motion'
import { FloatingPaths } from '@/components/ui/background-paths'
import { BrowserMockup } from '@/components/BrowserMockup'

const awards = [
  'Digital Leaders Awards 2024',
  'НИУ ВШЭ «Комплаенс» 2024',
  'Digital Learning 2024',
  '«Эффективное образование» 2024',
  '«Выбор потребителей» 2024',
]

const AwardIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
    <path d="M6 1L7.3 4.2L11 4.5L8.5 6.8L9.3 10.5L6 8.7L2.7 10.5L3.5 6.8L1 4.5L4.7 4.2L6 1Z" fill="#EF3124" fillOpacity="0.8" />
  </svg>
)

export function Hero() {
  const title = 'LMS-система для роста вашей команды'
  const words = title.split(' ')

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center overflow-hidden bg-brand-bg"
      aria-labelledby="hero-heading"
    >
      {/* Animated SVG background */}
      <FloatingPaths position={1} />
      <FloatingPaths position={-1} />

      {/* Radial glow */}
      <div
        className="absolute top-0 right-0 w-[700px] h-[700px] pointer-events-none"
        aria-hidden="true"
        style={{
          background: 'radial-gradient(circle at top right, rgba(239,49,36,0.07) 0%, transparent 65%)',
        }}
      />

      <div className="container relative z-10 pt-24 pb-16 lg:pt-32 lg:pb-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Left: content */}
          <div>
            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex items-center gap-2 mb-6"
            >
              <span className="w-6 h-px bg-brand-red/60" aria-hidden="true" />
              <span className="text-xs font-semibold text-brand-red/70 uppercase tracking-widest">
                Корпоративное обучение
              </span>
            </motion.div>

            {/* Animated title */}
            <h1
              id="hero-heading"
              className="text-[2.5rem] sm:text-5xl lg:text-[3.5rem] font-black leading-[1.05] tracking-tight mb-6"
            >
              {words.map((word, wi) => (
                <span key={wi} className="inline-block mr-[0.22em] last:mr-0">
                  {word.split('').map((letter, li) => (
                    <motion.span
                      key={`${wi}-${li}`}
                      initial={{ y: 60, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{
                        delay: 0.1 + wi * 0.07 + li * 0.018,
                        type: 'spring',
                        stiffness: 130,
                        damping: 22,
                      }}
                      className="inline-block"
                    >
                      {letter}
                    </motion.span>
                  ))}
                </span>
              ))}
            </h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.75, duration: 0.5 }}
              className="text-lg text-white/55 leading-relaxed mb-9 max-w-[480px]"
            >
              Готовый корпоративный портал для обучения, адаптации и развития сотрудников.
              Без разработки, без долгого внедрения — первые сотрудники начинают учиться
              в день подключения.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 mb-10"
              role="group"
              aria-label="Действия"
            >
              <a
                href="#contact"
                className="inline-flex items-center justify-center px-8 py-3.5 bg-brand-red text-white font-semibold rounded-xl hover:brightness-110 hover:shadow-xl hover:shadow-brand-red/25 hover:-translate-y-0.5 transition-all duration-200 text-base min-h-[52px]"
              >
                Получить демо
              </a>
              <a
                href="#features"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 border border-white/20 text-white font-semibold rounded-xl hover:border-white/40 hover:bg-white/5 transition-all duration-200 text-base min-h-[52px]"
              >
                Как это работает
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </motion.div>

            {/* Awards trust bar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1, duration: 0.6 }}
              className="flex flex-wrap gap-2"
              role="list"
              aria-label="Награды"
            >
              {awards.map((award, i) => (
                <div
                  key={i}
                  role="listitem"
                  className="flex items-center gap-1.5 text-[11px] text-white/35 border border-white/[0.08] rounded-full px-3 py-1.5 hover:border-white/20 hover:text-white/50 transition-all duration-200"
                >
                  <AwardIcon />
                  {award}
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right: browser mockup */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.7, ease: 'easeOut' }}
          >
            <BrowserMockup
              src="/lms-main.png"
              alt="Главный экран платформы Альфа-Курс"
              rotateY={-5}
              priority
            />
          </motion.div>

        </div>
      </div>
    </section>
  )
}
