import React from 'react';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ConfigProvider } from 'antd';
import ruRU from 'antd/locale/ru_RU';
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
          <ConfigProvider
            locale={ruRU}
            theme={{
              token: {
                colorPrimary: '#E54D2E',
                colorSuccess: '#10B981',
                colorWarning: '#F97316',
                colorError: '#EF4444',
                colorInfo: '#3B82F6',
                borderRadius: 10,
                fontFamily:
                  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                colorBgContainer: '#FFFFFF',
                colorBgLayout: '#F5F5F5',
                colorBorder: '#E8E8E8',
                colorBorderSecondary: '#F0F0F0',
              },
              components: {
                Button: {
                  borderRadius: 10,
                  controlHeight: 40,
                  paddingContentHorizontal: 20,
                },
                Card: {
                  borderRadiusLG: 16,
                  paddingLG: 24,
                },
                Input: {
                  borderRadius: 10,
                  controlHeight: 40,
                },
                Select: {
                  borderRadius: 10,
                  controlHeight: 40,
                },
                Table: {
                  borderRadius: 16,
                  headerBg: '#FAFAFA',
                },
                Tag: {
                  borderRadiusSM: 100,
                },
                Menu: {
                  itemBorderRadius: 10,
                  itemMarginInline: 8,
                  itemPaddingInline: 16,
                },
                Modal: {
                  borderRadiusLG: 16,
                },
                Drawer: {
                  borderRadiusLG: 16,
                },
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
