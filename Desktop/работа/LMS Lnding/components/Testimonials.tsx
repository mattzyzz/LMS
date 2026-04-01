'use client'

import { motion } from 'framer-motion'

const testimonials = [
  {
    quote:
      'Внедрили Альфа-Курс в ноябре 2023-го. За 4 месяца прошли обучение 2 300 сотрудников в 18 регионах. Особенно ценим аналитику — видим по каждому человеку, где он остановился и почему. Это сильно меняет разговор с менеджерами.',
    name: 'Мария Козлова',
    role: 'Директор по персоналу',
    company: 'Ростелеком',
    photo: '/testimonials/maria.jpg',
  },
  {
    quote:
      'Нас зацепила скорость: подключили 800 человек в пятницу вечером, в понедельник они уже проходили курсы. Никакого IT-проекта, никаких согласований. Для компании нашего масштаба — это редкость.',
    name: 'Алексей Громов',
    role: 'Руководитель L&D',
    company: 'МТС',
    photo: '/testimonials/alexey.jpg',
  },
  {
    quote:
      'Геймификация работает лучше, чем мы ожидали. Сотрудники сами начали требовать новые курсы — раньше такого не было. Completion rate вырос с 34% до 78% за первые два месяца.',
    name: 'Наталья Семёнова',
    role: 'Chief People Officer',
    company: 'Яндекс',
    photo: '/testimonials/natalia.jpg',
  },
]

export function Testimonials() {
  return (
    <section className="py-24 lg:py-32 bg-brand-bg" aria-labelledby="testimonials-heading">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <h2 id="testimonials-heading" className="text-3xl sm:text-4xl lg:text-5xl font-black">
            Говорят клиенты
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <motion.figure
              key={i}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="flex flex-col bg-brand-card border border-white/[0.07] rounded-2xl p-7 lg:p-8"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-5" aria-label="5 из 5 звёзд">
                {Array.from({ length: 5 }).map((_, j) => (
                  <svg key={j} width="14" height="14" viewBox="0 0 14 14" fill="#EF3124" aria-hidden="true">
                    <path d="M7 1l1.6 4H13l-3.4 2.5 1.3 4L7 9.2 3.1 11.5l1.3-4L1 5h4.4L7 1z" />
                  </svg>
                ))}
              </div>

              {/* Quote */}
              <blockquote className="text-sm text-white/60 leading-relaxed flex-1 mb-6">
                &ldquo;{t.quote}&rdquo;
              </blockquote>

              {/* Author */}
              <figcaption className="flex items-center gap-3">
                <img
                  src={t.photo}
                  alt={t.name}
                  className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                />
                <div>
                  <p className="text-sm font-semibold text-white leading-tight">{t.name}</p>
                  <p className="text-xs text-white/35 mt-0.5">
                    {t.role}
                  </p>
                </div>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  )
}
