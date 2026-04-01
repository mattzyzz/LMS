'use client'

import { motion } from 'framer-motion'

const steps = [
  {
    num: 1,
    title: 'Опишите тему',
    desc: 'Напишите о чём курс — как запрос в поиске',
  },
  {
    num: 2,
    title: 'ИИ создаёт структуру',
    desc: 'Разделы, уроки, логика подачи — готово за секунды',
  },
  {
    num: 3,
    title: 'Генерирует контент и тесты',
    desc: 'Тексты уроков, вопросы, варианты ответов — автоматически',
  },
  {
    num: 4,
    title: 'HR проверяет и публикует',
    desc: 'Редактируете если нужно — один клик и курс доступен команде',
  },
]

const stats = [
  { value: '10 мин', label: 'вместо месяца работы над курсом' },
  { value: '40\u00d7', label: 'быстрее создание учебного контента' },
  { value: '0 \u20bd', label: 'на подрядчиков и авторов контента' },
]

export function AISection() {
  return (
    <section className="py-24 lg:py-32 bg-[#0d0d0d]">
      <div className="container">
        {/* Two-column grid */}
        <div className="grid md:grid-cols-2 gap-12 lg:gap-16 mb-16">
          {/* Left column */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[13px] font-medium mb-6"
              style={{
                background: 'rgba(239,49,36,0.1)',
                border: '1px solid rgba(239,49,36,0.25)',
                color: '#ff7066',
              }}
            >
              &#10022; Искусственный интеллект
            </span>

            <h2
              className="font-black mb-5"
              style={{
                fontSize: 'clamp(28px, 3.5vw, 40px)',
                letterSpacing: '-0.03em',
              }}
            >
              Курс за{' '}
              <span className="text-brand-red">10 минут</span> вместо месяца
            </h2>

            <p className="text-[15px] text-[#555555] leading-relaxed max-w-md">
              Опишите тему — ИИ создаст структуру, напишет контент и
              сгенерирует тесты. HR только проверяет и публикует. Никаких
              подрядчиков, никаких агентств.
            </p>
          </motion.div>

          {/* Right column — 4 steps */}
          <div className="flex flex-col">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className={`flex items-start gap-4 py-5 ${
                  i < steps.length - 1 ? 'border-b border-[#1a1a1a]' : ''
                }`}
              >
                <span className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-lg bg-brand-red text-white text-sm font-bold">
                  {step.num}
                </span>
                <div>
                  <p className="font-bold text-white text-[15px] mb-0.5">
                    {step.title}
                  </p>
                  <p className="text-[13px] text-[#888]">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 bg-[#111111] rounded-2xl overflow-hidden"
        >
          {stats.map((stat, i) => (
            <div
              key={i}
              className={`flex flex-col items-center text-center py-8 px-6 ${
                i < stats.length - 1
                  ? 'border-b md:border-b-0 md:border-r border-[#1a1a1a]'
                  : ''
              }`}
            >
              <span className="text-[44px] font-black text-brand-red leading-none mb-2">
                {stat.value}
              </span>
              <span className="text-[13px] text-[#555]">{stat.label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
