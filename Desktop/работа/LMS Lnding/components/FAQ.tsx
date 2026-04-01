'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const faqs = [
  {
    q: 'Что такое LMS-портал и что в него входит?',
    a: 'LMS (Learning Management System) — это единая цифровая среда для корпоративного обучения. Внутри: каталог курсов, конструктор для создания собственных материалов, модуль тестирования, проверка домашних заданий, аналитика по каждому сотруднику, оргструктура, профили, лента новостей и календарь событий компании.',
  },
  {
    q: 'Как быстро можно запустить LMS в компании?',
    a: 'В день подключения. Никакой разработки и долгого внедрения — портал брендируется под вашу компанию, сотрудники получают доступ и сразу начинают учиться. Среднее время от заявки до старта — 1 день.',
  },
  {
    q: 'Можно ли создавать собственные курсы внутри LMS?',
    a: 'Да. Встроенный курс-билдер позволяет создавать курсы без разработчиков — добавляйте видео, тексты, тесты и файлы в интуитивном редакторе. А ИИ-генератор создаст структуру и контент курса за 10 минут по вашему описанию.',
  },
  {
    q: 'Как работает аналитика в LMS?',
    a: 'В реальном времени вы видите прогресс каждого сотрудника: какие курсы прошёл, результаты тестов, время на платформе, активность. Для руководства доступны дашборды по отделам и подразделениям — экспорт в любой момент.',
  },
  {
    q: 'Можно ли брендировать LMS под компанию?',
    a: 'Да. Портал полностью настраивается под вашу айдентику — цвета, логотип, название разделов. Сотрудники видят корпоративную среду, а не стороннюю платформу. White label без ограничений.',
  },
  {
    q: 'Как LMS помогает с адаптацией новых сотрудников?',
    a: 'HR один раз настраивает онбординг-трек — и каждый новый сотрудник автоматически получает нужные курсы в нужном порядке с первого рабочего дня. Не нужно объяснять одно и то же вручную. Прогресс адаптации виден в реальном времени.',
  },
]

function FAQItem({ q, a, isLast }: { q: string; a: string; isLast: boolean }) {
  const [open, setOpen] = useState(false)

  return (
    <div
      style={{
        borderBottom: isLast ? 'none' : '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          background: 'none',
          border: 'none',
          color: '#ffffff',
          fontSize: '17px',
          fontWeight: 700,
          fontFamily: 'inherit',
          cursor: 'pointer',
          textAlign: 'left',
          gap: '16px',
          padding: '20px 28px',
        }}
      >
        <span>{q}</span>
        <motion.div
          animate={{ rotate: open ? 45 : 0, backgroundColor: open ? '#EF3124' : '#2a2a2a' }}
          transition={{ duration: 0.25 }}
          aria-hidden="true"
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            display: 'grid',
            placeItems: 'center',
            flexShrink: 0,
            color: open ? '#ffffff' : '#888888',
            fontSize: 18,
            lineHeight: 1,
          }}
        >
          +
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
            role="region"
          >
            <p
              style={{
                fontSize: 15,
                color: '#888888',
                lineHeight: 1.65,
                padding: '0 28px 20px',
                margin: 0,
              }}
            >
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function FAQ() {
  return (
    <section id="faq" className="py-24 lg:py-32" aria-labelledby="faq-heading">
      <div className="container" style={{ maxWidth: 760 }}>
        <motion.h2
          id="faq-heading"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          style={{
            textAlign: 'center',
            color: '#ffffff',
            fontSize: 'clamp(36px, 4vw, 56px)',
            fontWeight: 900,
            letterSpacing: '-0.03em',
            marginBottom: 48,
          }}
        >
          Частые вопросы
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{
            background: '#1e1e1e',
            borderRadius: 16,
            padding: '8px 0',
          }}
        >
          {faqs.map((faq, i) => (
            <FAQItem key={i} q={faq.q} a={faq.a} isLast={i === faqs.length - 1} />
          ))}
        </motion.div>
      </div>
    </section>
  )
}
