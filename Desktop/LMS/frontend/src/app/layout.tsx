import React from 'react';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ConfigProvider } from 'antd';
import ruRU from 'antd/locale/ru_RU';
import type { Metadata } from 'next';

import 'dayjs/locale/ru';

export const metadata: Metadata = {
  title: 'LMS — Система управления обучением',
  description: 'Корпоративная система управления обучением',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body style={{ margin: 0 }}>
        <AntdRegistry>
          <ConfigProvider
            locale={ruRU}
            theme={{
              token: {
                colorPrimary: '#1677ff',
                borderRadius: 8,
                fontFamily:
                  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
              },
            }}
          >
            {children}
          </ConfigProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
