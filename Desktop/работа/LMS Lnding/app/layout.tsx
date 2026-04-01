import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600', '700', '900'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Альфа-Курс — LMS-система для корпоративного обучения',
  description:
    'Готовый корпоративный портал с 110+ курсами от экспертов Альфа-Банка. Без разработки, без долгого внедрения — первые сотрудники начинают учиться в день подключения.',
  keywords: 'LMS, корпоративное обучение, онлайн-курсы, Альфа-Банк, обучение сотрудников',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru" className={inter.variable}>
      <body className="font-inter">{children}</body>
    </html>
  )
}
