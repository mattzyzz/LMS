'use client';

import React, { useEffect, useState } from 'react';
import { Layout, Typography, Form, Input, Button, Card, message, ConfigProvider, theme as antTheme } from 'antd';
import {
  BgColorsOutlined,
  BookOutlined,
  ApartmentOutlined,
  ProfileOutlined,
  HomeOutlined,
  LogoutOutlined,
  LockOutlined,
} from '@ant-design/icons';
import { usePathname, useRouter } from 'next/navigation';
import {
  getSuperadminToken,
  clearSuperadminToken,
  superadminLogin,
} from '@/lib/superadmin-api';

const { Sider, Content, Header } = Layout;
const { Title, Text } = Typography;

const NAV_ITEMS = [
  { key: '/superadmin/settings/theme',        icon: <BgColorsOutlined />,  label: 'Тема и брендинг' },
  { key: '/superadmin/settings/dictionaries', icon: <BookOutlined />,      label: 'Справочники' },
  { key: '/superadmin/settings/org-structure',icon: <ApartmentOutlined />, label: 'Оргструктура' },
  { key: '/superadmin/settings/profile',      icon: <ProfileOutlined />,   label: 'Профиль' },
];

const DARK_THEME = {
  algorithm: antTheme.darkAlgorithm,
  token: {
    colorPrimary: '#E52322',
    colorBgContainer: '#1a1a1a',
    colorBgElevated: '#222',
    colorBgLayout: '#0f0f0f',
    colorBorder: '#333',
    colorBorderSecondary: '#2a2a2a',
    borderRadius: 8,
  },
  components: {
    Card: {
      colorBgContainer: '#1a1a1a',
      colorBorderSecondary: '#2a2a2a',
    },
    Table: {
      colorBgContainer: '#1a1a1a',
      headerBg: '#222',
      rowHoverBg: '#262626',
      borderColor: '#333',
    },
    Input: {
      colorBgContainer: '#222',
      colorBorder: '#3a3a3a',
    },
    InputNumber: {
      colorBgContainer: '#222',
      colorBorder: '#3a3a3a',
    },
    Select: {
      colorBgContainer: '#222',
      colorBorder: '#3a3a3a',
    },
    Modal: {
      contentBg: '#1a1a1a',
      headerBg: '#1a1a1a',
    },
    Tabs: {
      itemColor: 'rgba(255,255,255,0.55)',
      itemActiveColor: '#E52322',
      itemSelectedColor: '#E52322',
      inkBarColor: '#E52322',
      itemHoverColor: 'rgba(255,255,255,0.85)',
    },
    Switch: {
      colorPrimary: '#E52322',
    },
    Divider: {
      colorSplit: '#333',
    },
    Button: {
      colorPrimary: '#E52322',
    },
  },
};

function LoginGate({ onLogin }: { onLogin: () => void }) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async ({ secret }: { secret: string }) => {
    setLoading(true);
    try {
      await superadminLogin(secret);
      onLogin();
    } catch {
      message.error('Неверный секрет. Доступ запрещён.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#0a0a0a',
    }}>
      <Card
        style={{ width: 380, borderRadius: 16, boxShadow: '0 8px 40px rgba(0,0,0,0.4)' }}
        styles={{ body: { padding: 40 } }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 12, background: '#E52322',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 16,
          }}>
            <LockOutlined style={{ fontSize: 24, color: '#fff' }} />
          </div>
          <Title level={4} style={{ margin: 0 }}>Панель разработчика</Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Доступ только для команды Альфа Банк
          </Text>
        </div>

        <Form onFinish={handleSubmit} layout="vertical">
          <Form.Item name="secret" rules={[{ required: true, message: 'Введите секрет' }]}>
            <Input.Password
              size="large"
              placeholder="Developer secret"
              prefix={<LockOutlined style={{ color: '#999' }} />}
            />
          </Form.Item>
          <Button type="primary" htmlType="submit" block size="large" loading={loading}>
            Войти
          </Button>
        </Form>
      </Card>
    </div>
  );
}

export default function SuperadminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = getSuperadminToken();
    setAuthed(!!token);
    setChecking(false);
  }, []);

  if (checking) return null;

  if (!authed) {
    return (
      <ConfigProvider theme={DARK_THEME as any}>
        <LoginGate onLogin={() => setAuthed(true)} />
      </ConfigProvider>
    );
  }

  const handleLogout = () => {
    clearSuperadminToken();
    setAuthed(false);
  };

  return (
    <ConfigProvider theme={DARK_THEME as any}>
      <Layout style={{ minHeight: '100vh' }}>
        <Sider
          width={240}
          style={{
            background: '#141414',
            position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 100,
            display: 'flex', flexDirection: 'column',
          }}
        >
          <div style={{
            height: 64, display: 'flex', alignItems: 'center', padding: '0 20px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: 6, background: '#E52322',
              display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 10,
            }}>
              <LockOutlined style={{ color: '#fff', fontSize: 13 }} />
            </div>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>Dev Panel</span>
          </div>

          <div style={{ padding: '12px 8px', flex: 1 }}>
            {NAV_ITEMS.map((item) => {
              const isActive = pathname.startsWith(item.key);
              return (
                <div
                  key={item.key}
                  onClick={() => router.push(item.key)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 14px', borderRadius: 8, cursor: 'pointer',
                    background: isActive ? 'rgba(229,35,34,0.15)' : 'transparent',
                    color: isActive ? '#E52322' : 'rgba(255,255,255,0.65)',
                    marginBottom: 2, transition: 'all 0.15s',
                  }}
                >
                  <span style={{ fontSize: 16 }}>{item.icon}</span>
                  <span style={{ fontSize: 14 }}>{item.label}</span>
                </div>
              );
            })}
          </div>

          <div style={{ padding: '12px 8px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <div
              onClick={() => router.push('/dashboard')}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px', borderRadius: 8, cursor: 'pointer',
                color: 'rgba(255,255,255,0.45)', marginBottom: 2,
              }}
            >
              <HomeOutlined style={{ fontSize: 16 }} />
              <span style={{ fontSize: 14 }}>На главную</span>
            </div>
            <div
              onClick={handleLogout}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px', borderRadius: 8, cursor: 'pointer',
                color: 'rgba(255,255,255,0.45)',
              }}
            >
              <LogoutOutlined style={{ fontSize: 16 }} />
              <span style={{ fontSize: 14 }}>Выйти</span>
            </div>
          </div>
        </Sider>

        <Layout style={{ marginLeft: 240 }}>
          <Header style={{
            background: '#1a1a1a', borderBottom: '1px solid rgba(255,255,255,0.08)',
            padding: '0 32px', display: 'flex', alignItems: 'center',
            position: 'sticky', top: 0, zIndex: 99, height: 64,
          }}>
            <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>
              Alfa Bank · Developer Panel · Только для внутреннего использования
            </Text>
          </Header>
          <Content style={{ padding: 32, background: '#0f0f0f', minHeight: 'calc(100vh - 64px)' }}>
            {children}
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
}
