import React from 'react';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import ruRU from 'antd/locale/ru_RU';
import { ConfigProvider } from 'antd';
import type { Metadata } from 'next';

import 'dayjs/locale/ru';
import './globals.css';

export const metadata: Metadata = {
  title: 'Портал — Корпоративная платформа',
  description: 'Корпоративная система управления обучением и коммуникациями',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body>
        <AntdRegistry>
          <ConfigProvider locale={ruRU}>
            {children}
          </ConfigProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
