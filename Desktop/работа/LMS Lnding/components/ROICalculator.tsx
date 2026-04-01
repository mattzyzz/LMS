'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'

function formatMoney(value: number): string {
  if (value >= 1_000_000) {
    return (value / 1_000_000).toFixed(1).replace(/\.0$/, '') + ' млн \u20bd'
  }
  if (value >= 1_000) {
    return Math.round(value / 1_000) + ' тыс \u20bd'
  }
  return value + ' \u20bd'
}

const sliders = [
  {
    id: 'emp',
    label: 'Сотрудников в компании',
    min: 50,
    max: 5000,
    step: 50,
    default: 250,
  },
  {
    id: 'sal',
    label: 'Средняя зарплата (тыс. \u20bd/мес)',
    min: 40,
    max: 300,
    step: 5,
    default: 90,
  },
  {
    id: 'hrs',
    label: 'Часов обучения в месяц на сотрудника',
    min: 1,
    max: 20,
    step: 1,
    default: 4,
  },
  {
    id: 'crs',
    label: 'Курсов создаёте в год',
    min: 1,
    max: 50,
    step: 1,
    default: 6,
  },
] as const

export function ROICalculator() {
  const [values, setValues] = useState({
    emp: 250,
    sal: 90,
    hrs: 4,
    crs: 6,
  })

  const update = useCallback((id: string, val: number) => {
    setValues((prev) => ({ ...prev, [id]: val }))
  }, [])

  const emp = values.emp
  const sal = values.sal * 1000
  const hrs = values.hrs
  const crs = values.crs

  const c1 = crs * 290_000
  const c2 = Math.round(emp * hrs * 0.8 * 12 * 1500)
  const c3 = Math.round(emp * sal * 0.015 * 12)
  const total = c1 + c2 + c3

  const lmsCost = Math.max(300_000, emp * 3000)
  const payback = (lmsCost / (total / 12)).toFixed(1) + ' мес'

  const results = [
    { label: 'Экономия на создании курсов', value: formatMoney(c1) },
    { label: 'Экономия времени HR', value: formatMoney(c2) },
    { label: 'Рост продуктивности команды', value: formatMoney(c3) },
    { label: 'Срок окупаемости', value: payback, highlight: true },
  ]

  return (
    <section className="py-24 lg:py-32 bg-brand-bg">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4">
            Сколько вы <span className="text-brand-red">сэкономите</span> с
            LMS?
          </h2>
          <p className="text-[15px] text-white/50 max-w-lg mx-auto">
            Введите данные своей компании — калькулятор покажет реальные цифры
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-[#1a1a1a] rounded-[20px] p-6 sm:p-8 lg:p-10"
        >
          <div className="grid md:grid-cols-2 gap-10 lg:gap-14">
            {/* Left — sliders */}
            <div className="flex flex-col gap-7">
              {sliders.map((s) => (
                <div key={s.id}>
                  <div className="flex items-center justify-between mb-3">
                    <label
                      htmlFor={s.id}
                      className="text-sm text-white/70 font-medium"
                    >
                      {s.label}
                    </label>
                    <span className="text-sm font-bold text-brand-red tabular-nums">
                      {values[s.id as keyof typeof values]}
                    </span>
                  </div>
                  <input
                    id={s.id}
                    type="range"
                    min={s.min}
                    max={s.max}
                    step={s.step}
                    value={values[s.id as keyof typeof values]}
                    onChange={(e) => update(s.id, Number(e.target.value))}
                    className="roi-slider w-full"
                  />
                </div>
              ))}
            </div>

            {/* Right — results */}
            <div className="bg-[#111111] rounded-2xl p-6 sm:p-8 flex flex-col">
              {/* Total card */}
              <div className="bg-brand-red rounded-2xl p-6 text-center mb-6">
                <span className="block text-4xl sm:text-5xl font-black text-white leading-none mb-1">
                  {formatMoney(total)}
                </span>
                <span className="text-sm text-white/80">экономия в год</span>
              </div>

              {/* Breakdown */}
              <div className="flex flex-col flex-1">
                {results.map((r, i) => (
                  <div
                    key={i}
                    className={`flex items-center justify-between py-3.5 text-sm ${
                      i < results.length - 1
                        ? 'border-b border-white/[0.06]'
                        : ''
                    }`}
                  >
                    <span className="text-white/50">{r.label}</span>
                    <span
                      className={`font-semibold tabular-nums ${
                        r.highlight ? 'text-brand-red' : 'text-white'
                      }`}
                    >
                      {r.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        <p className="text-center text-xs text-[#333] mt-6">
          * Расчёт основан на средних показателях 300+ клиентов. Реальные цифры
          зависят от специфики компании.
        </p>
      </div>
    </section>
  )
}
