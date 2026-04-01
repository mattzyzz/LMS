'use client'

const columns = [
  {
    title: 'Теория и практика',
    links: [
      { label: 'Курсы', href: '#' },
      { label: 'Вебинары', href: '#' },
      { label: 'База знаний', href: '#' },
      { label: 'Игры', href: '#' },
      { label: 'Про «Курс»', href: '#' },
      { label: 'Разработка', href: '#' },
    ],
  },
  {
    title: 'Телеграм-каналы',
    links: [
      { label: 'Альфа в курсе', href: '#' },
      { label: 'Немалый бизнес', href: '#' },
      { label: 'Сервисы Альфа-Банка', href: '#' },
    ],
  },
  {
    title: 'Может пригодиться',
    links: [
      { label: 'Техподдержка', href: '#' },
      { label: 'Шаблоны документов', href: '#' },
      { label: 'Словарь', href: '#' },
      { label: 'Калькулятор НДФЛ', href: '#' },
      { label: 'Калькулятор НДС', href: '#' },
      { label: 'Сумма прописью онлайн', href: '#' },
    ],
  },
]

const awards = [
  'Образовательный проект года Digital Leaders Awards 2024',
  'Лучшая практика в бизнес-образовании «Инновации 2024», НИУ ВШЭ',
  'Образовательная экосистема Digital Learning 2024',
  'Образовательная платформа года «Эффективное образование 2024»',
  'Платиновый знак потребителям 2024',
]

export function Footer() {
  return (
    <footer role="contentinfo" className="bg-[#111111] border-t border-white/[0.08]">
      {/* Main footer content */}
      <div className="container py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
          {/* Logo */}
          <div className="lg:col-span-1">
            <a
              href="/"
              className="text-lg font-black tracking-wide hover:opacity-90 transition-opacity uppercase inline-block"
              style={{ letterSpacing: '0.08em' }}
            >
              АЛЬФА<span className="text-brand-red">-</span>КУ
              <svg
                className="inline -ml-0.5 -mr-0.5 relative -top-px"
                width="12"
                height="14"
                viewBox="0 0 14 16"
                fill="none"
                aria-hidden="true"
              >
                <path d="M1 1.5L13 8L1 14.5V1.5Z" fill="#EF3124" />
              </svg>
              С
            </a>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.title}>
              <p className="text-[13px] font-semibold text-white/40 uppercase tracking-wider mb-4">
                {col.title}
              </p>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-[13px] text-[#999] hover:text-white transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* CTA column */}
          <div className="flex flex-col items-start lg:items-end">
            <a
              href="#contact"
              className="inline-flex items-center justify-center px-6 py-3 bg-brand-red text-white text-sm font-semibold rounded-xl hover:brightness-110 transition-all whitespace-nowrap"
            >
              У меня вопрос про бизнес
            </a>
          </div>
        </div>
      </div>

      {/* Awards bar */}
      <div className="border-t border-white/[0.06]">
        <div className="container py-5">
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {awards.map((award) => (
              <span key={award} className="text-[10px] text-[#444] leading-tight">
                {award}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Legal / copyright */}
      <div className="border-t border-white/[0.06]">
        <div className="container py-6">
          <p className="text-[10px] text-[#333] leading-relaxed mb-3">
            © 2023–2025 ООО «Альфа Диджитал». ИНН 9097647530I, КПП 901240I018,
            ОГРН 1225000030308. Московская область, г. Подольск, ул. Рабочая, д. 4,
            этаж 2, помещение 114, кабинет 143-000. Телефон: (495) 974-25-10 (доб. 3406).
            team@alfa-digital.ru
          </p>
          <p className="text-[10px] text-[#333] leading-relaxed mb-3">
            ООО «Альфа Диджитал» является оператором по обработке персональных данных,
            информация об обработке персональных данных и сведения о реализуемых требованиях
            к защите персональных данных.
          </p>
          <p className="text-[10px] text-[#333] leading-relaxed">
            ООО «Альфа Диджитал» использует файлы cookie с целью персонализации сервисов
            и повышения удобства пользования веб-сайтом.{' '}
            <a href="#" className="underline hover:text-[#555] transition-colors">
              Политика конфиденциальности
            </a>
            .
            Изучите публичную оферту{' '}
            <a href="#" className="underline hover:text-[#555] transition-colors">
              здесь
            </a>
            , а условия покупки подарочных сертификатов —{' '}
            <a href="#" className="underline hover:text-[#555] transition-colors">
              здесь
            </a>
            .
          </p>
        </div>
      </div>
    </footer>
  )
}
