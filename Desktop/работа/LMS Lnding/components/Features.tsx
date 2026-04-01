'use client'

import { motion } from 'framer-motion'
import { BrowserMockup } from '@/components/BrowserMockup'

const hrFeatures = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path fillRule="evenodd" clipRule="evenodd" d="M16.5 1.93945L22.0607 7.50011L7.56066 22.0001H2V16.4395L16.5 1.93945ZM14.3107 6.25011L17.75 9.68945L19.9393 7.50011L16.5 4.06077L14.3107 6.25011ZM16.6893 10.7501L13.25 7.31077L3.5 17.0608V20.5001H6.93934L16.6893 10.7501Z" fill="currentColor" />
      </svg>
    ),
    title: 'Конструктор курсов',
    desc: 'Создавайте курсы и тесты сами или доверьте это ИИ — он сгенерирует структуру, контент и вопросы за минуты. Интуитивный редактор для любых форматов.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path fillRule="evenodd" clipRule="evenodd" d="M3 3H21V21H3V3ZM4.5 12.75V19.5H19.5V12.75H15.8114L14.039 9.59909L10.039 17.5991L7.31136 12.75H4.5ZM19.5 11.25V4.5H4.5V11.25H8.18864L9.96102 14.4009L13.961 6.40091L16.6886 11.25H19.5Z" fill="currentColor" />
      </svg>
    ),
    title: 'Аналитика',
    desc: 'Видите прогресс каждого сотрудника в реальном времени — охват, результаты тестов, активность по курсам.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path fillRule="evenodd" clipRule="evenodd" d="M12 3.5C9.79086 3.5 8 5.29086 8 7.5C8 9.70914 9.79086 11.5 12 11.5C14.2091 11.5 16 9.70914 16 7.5C16 5.29086 14.2091 3.5 12 3.5ZM6.5 7.5C6.5 4.46243 8.96243 2 12 2C15.0376 2 17.5 4.46243 17.5 7.5C17.5 10.2832 15.4328 12.5835 12.75 12.9493V14.0805C14.081 14.3711 15.1289 15.419 15.4195 16.75H16.0805C16.4239 15.1774 17.8244 14 19.5 14C21.433 14 23 15.567 23 17.5C23 19.433 21.433 21 19.5 21C17.8244 21 16.4239 19.8226 16.0805 18.25H15.4195C15.0761 19.8226 13.6756 21 12 21C10.3244 21 8.92388 19.8226 8.58054 18.25H7.91946C7.57612 19.8226 6.17556 21 4.5 21C2.567 21 1 19.433 1 17.5C1 15.567 2.567 14 4.5 14C6.17556 14 7.57612 15.1774 7.91946 16.75H8.58054C8.87113 15.419 9.91903 14.3711 11.25 14.0805V12.9493C8.56724 12.5835 6.5 10.2832 6.5 7.5ZM4.5 15.5C3.39543 15.5 2.5 16.3954 2.5 17.5C2.5 18.6046 3.39543 19.5 4.5 19.5C5.60457 19.5 6.5 18.6046 6.5 17.5C6.5 16.3954 5.60457 15.5 4.5 15.5ZM12 15.5C10.8954 15.5 10 16.3954 10 17.5C10 18.6046 10.8954 19.5 12 19.5C13.1046 19.5 14 18.6046 14 17.5C14 16.3954 13.1046 15.5 12 15.5ZM19.5 15.5C18.3954 15.5 17.5 16.3954 17.5 17.5C17.5 18.6046 18.3954 19.5 19.5 19.5C20.6046 19.5 21.5 18.6046 21.5 17.5C21.5 16.3954 20.6046 15.5 19.5 15.5Z" fill="currentColor" />
      </svg>
    ),
    title: 'Оргструктура',
    desc: 'Управляйте командами, добавляйте людей в один клик — гибкая иерархия отделов и ролей.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path fillRule="evenodd" clipRule="evenodd" d="M12 4C7.26577 4 3.5 7.62044 3.5 12C3.5 16.3796 7.26577 20 12 20C12.1067 20 12.1931 19.9958 12.262 19.9897C12.2109 19.8746 12.1393 19.7362 12.046 19.5652C12.0139 19.5065 11.9793 19.4441 11.943 19.3786C11.7235 18.983 11.4408 18.4732 11.2643 17.9495C11.0529 17.3221 10.9471 16.5476 11.329 15.7827C11.9362 14.5663 13.1012 14.3082 14.1554 14.3236C14.6839 14.3313 15.2401 14.4059 15.7716 14.4896C15.9552 14.5185 16.1338 14.5481 16.3094 14.5771C16.6609 14.6353 17.0003 14.6915 17.3433 14.7362C18.3981 14.8736 19.1509 14.8449 19.6409 14.5394C20.0572 14.2799 20.5 13.6668 20.5 12C20.5 7.62044 16.7342 4 12 4ZM2 12C2 6.71457 6.51697 2.5 12 2.5C17.483 2.5 22 6.71457 22 12C22 13.8878 21.4937 15.1519 20.4345 15.8123C19.4491 16.4266 18.2002 16.3605 17.1496 16.2236C16.7813 16.1757 16.3969 16.1121 16.0307 16.0515C15.8616 16.0235 15.6964 15.9962 15.5384 15.9713C15.0184 15.8895 14.5499 15.8295 14.1335 15.8234C13.298 15.8112 12.8925 16.0091 12.671 16.4526C12.539 16.7171 12.5395 17.0363 12.6858 17.4705C12.8149 17.8538 13.0213 18.2276 13.2434 18.6299C13.2828 18.7012 13.3226 18.7733 13.3626 18.8465C13.4857 19.0721 13.6169 19.3217 13.7077 19.5624C13.7926 19.7875 13.8875 20.117 13.8161 20.466C13.7303 20.8858 13.4434 21.1713 13.0891 21.3241C12.7768 21.4588 12.3992 21.5 12 21.5C6.51697 21.5 2 17.2854 2 12ZM10.25 7.25C9.97386 7.25 9.75 7.47386 9.75 7.75C9.75 8.02614 9.97386 8.25 10.25 8.25C10.5261 8.25 10.75 8.02614 10.75 7.75C10.75 7.47386 10.5261 7.25 10.25 7.25ZM8.25 7.75C8.25 6.64543 9.14543 5.75 10.25 5.75C11.3546 5.75 12.25 6.64543 12.25 7.75C12.25 8.85457 11.3546 9.75 10.25 9.75C9.14543 9.75 8.25 8.85457 8.25 7.75ZM15.25 8.75C14.9739 8.75 14.75 8.97386 14.75 9.25C14.75 9.52614 14.9739 9.75 15.25 9.75C15.5261 9.75 15.75 9.52614 15.75 9.25C15.75 8.97386 15.5261 8.75 15.25 8.75ZM13.25 9.25C13.25 8.14543 14.1454 7.25 15.25 7.25C16.3546 7.25 17.25 8.14543 17.25 9.25C17.25 10.3546 16.3546 11.25 15.25 11.25C14.1454 11.25 13.25 10.3546 13.25 9.25ZM7.25 11.5C6.97386 11.5 6.75 11.7239 6.75 12C6.75 12.2761 6.97386 12.5 7.25 12.5C7.52614 12.5 7.75 12.2761 7.75 12C7.75 11.7239 7.52614 11.5 7.25 11.5ZM5.25 12C5.25 10.8954 6.14543 10 7.25 10C8.35457 10 9.25 10.8954 9.25 12C9.25 13.1046 8.35457 14 7.25 14C6.14543 14 5.25 13.1046 5.25 12Z" fill="currentColor" />
      </svg>
    ),
    title: 'Брендирование',
    desc: 'Портал в ваших цветах и с вашим логотипом (white label) — сотрудники не покидают среду бренда.',
  },
]

const employeeFeatures = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path fillRule="evenodd" clipRule="evenodd" d="M6 3H14V6.47354L18.877 5.16676L22.7593 19.6556L16.9637 21.2086L14 10.1478V21H2V5H6V3ZM7.5 7H12.5V4.5H7.5V7ZM12.5 8.5H7.5V15.5H12.5V8.5ZM12.5 17H7.5V19.5H12.5V17ZM6 19.5V6.5H3.5V19.5H6ZM14.9186 7.78033L18.0244 19.3714L20.9222 18.595L17.8163 7.00387L14.9186 7.78033Z" fill="currentColor" />
      </svg>
    ),
    title: '110+ курсов',
    desc: 'От экспертов Альфа-Банка — финансы, управление, искусственный интеллект, soft skills. Новые курсы каждый квартал.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path fillRule="evenodd" clipRule="evenodd" d="M12 0.305344L15.4369 7.26942L23.1223 8.38616L17.5611 13.8069L18.8739 21.4612L12 17.8473L5.12602 21.4612L6.43883 13.8069L0.877686 8.38616L8.563 7.26942L12 0.305344ZM12 3.69467L9.55909 8.64043L4.10113 9.43352L8.05055 13.2833L7.11822 18.7192L12 16.1527L16.8817 18.7192L15.9494 13.2833L19.8988 9.43352L14.4408 8.64043L12 3.69467Z" fill="currentColor" />
      </svg>
    ),
    title: 'Геймификация',
    desc: 'Рейтинги, достижения и благодарности от коллег — система мотивации, которая работает.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path fillRule="evenodd" clipRule="evenodd" d="M9.79907 5.09374L5.59203 10.7732L2.70874 8.82702L3.54795 7.58374L5.24126 8.72673L8.59373 4.2009L9.79907 5.09374ZM11 6.99999H21V8.49999H11V6.99999ZM9.79907 14.0937L5.59203 19.7732L2.70874 17.827L3.54795 16.5837L5.24126 17.7267L8.59373 13.2009L9.79907 14.0937ZM11 15.5H21V17H11V15.5Z" fill="currentColor" />
      </svg>
    ),
    title: 'Проверка ДЗ',
    desc: 'С живой обратной связью от преподавателя — не просто тест, а диалог и развитие навыков.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path fillRule="evenodd" clipRule="evenodd" d="M12 2.5C8.41015 2.5 5.5 5.41015 5.5 9C5.5 12.5899 8.41015 15.5 12 15.5C15.5899 15.5 18.5 12.5899 18.5 9C18.5 5.41015 15.5899 2.5 12 2.5ZM4 9C4 4.58172 7.58172 1 12 1C16.4183 1 20 4.58172 20 9C20 11.5264 18.8289 13.7793 17 15.2454V23.1818L12 20.8289L7 23.1818V15.2454C5.17107 13.7793 4 11.5264 4 9ZM8.5 16.1958V20.8182L12 19.1711L15.5 20.8182V16.1958C14.4428 16.7109 13.2552 17 12 17C10.7448 17 9.5572 16.7109 8.5 16.1958Z" fill="currentColor" />
      </svg>
    ),
    title: 'Сертификат гос. образца',
    desc: 'По итогам обучения сотрудник получает документ, подтверждающий квалификацию.',
  },
]

function FeatureItem({
  icon,
  title,
  desc,
  index,
}: {
  icon: React.ReactNode
  title: string
  desc: string
  index: number
}) {
  return (
    <motion.li
      initial={{ opacity: 0, x: -16 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="flex gap-4 group"
    >
      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-brand-red/10 border border-brand-red/20 flex items-center justify-center text-brand-red group-hover:bg-brand-red/15 transition-colors duration-200">
        {icon}
      </div>
      <div>
        <p className="font-semibold text-white mb-1">{title}</p>
        <p className="text-sm text-white/50 leading-relaxed">{desc}</p>
      </div>
    </motion.li>
  )
}

export function Features() {
  return (
    <section
      id="features"
      className="py-24 lg:py-32 bg-brand-bg"
      aria-labelledby="features-heading"
    >
      <div className="container">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-20"
        >
          <h2
            id="features-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight"
          >
            Всё что нужно для обучения —{' '}
            <span className="text-brand-red">уже внутри</span>
          </h2>
        </motion.div>

        {/* Block A: mockup left, list right */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-24 lg:mb-32">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <BrowserMockup
              src="/lms-analytics.png"
              alt="Интерфейс HR-аналитики Альфа-Курс"
              rotateY={5}
            />
          </motion.div>
          <div>
            <motion.h3
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="text-2xl font-bold text-white mb-8"
            >
              Для HR и руководителя
            </motion.h3>
            <ul className="space-y-6" role="list">
              {hrFeatures.map((feat, i) => (
                <FeatureItem key={i} {...feat} index={i} />
              ))}
            </ul>
          </div>
        </div>

        {/* Block B: list left, mockup right */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="lg:order-2">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <BrowserMockup
                src="/lms-courses.png"
                alt="Профиль сотрудника в Альфа-Курс"
                rotateY={-5}
              />
            </motion.div>
          </div>
          <div className="lg:order-1">
            <motion.h3
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="text-2xl font-bold text-white mb-8"
            >
              Для сотрудника
            </motion.h3>
            <ul className="space-y-6" role="list">
              {employeeFeatures.map((feat, i) => (
                <FeatureItem key={i} {...feat} index={i} />
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
