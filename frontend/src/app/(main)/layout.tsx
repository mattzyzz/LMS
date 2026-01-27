'use client';

import React, { useEffect, useState } from 'react';
import {
  Layout,
  Menu,
  Avatar,
  Badge,
  Dropdown,
  Space,
  Typography,
  Input,
  theme,
} from 'antd';
import {
  DashboardOutlined,
  ReadOutlined,
  CalendarOutlined,
  ApartmentOutlined,
  BookOutlined,
  LaptopOutlined,
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  HeartOutlined,
  FileTextOutlined,
  NotificationOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { useNotificationStore } from '@/stores/notification.store';
import type { MenuProps } from 'antd';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const menuItems: MenuProps['items'] = [
  {
    key: '/dashboard',
    icon: <DashboardOutlined />,
    label: 'Дашборд',
  },
  {
    key: '/news',
    icon: <ReadOutlined />,
    label: 'Новости',
  },
  {
    key: '/calendar',
    icon: <CalendarOutlined />,
    label: 'Календарь',
  },
  {
    key: '/org-structure',
    icon: <ApartmentOutlined />,
    label: 'Структура',
  },
  {
    key: '/kudos',
    icon: <HeartOutlined />,
    label: 'Благодарности',
  },
  {
    key: 'learning',
    icon: <BookOutlined />,
    label: 'Обучение',
    children: [
      {
        key: '/courses',
        icon: <BookOutlined />,
        label: 'Каталог курсов',
      },
      {
        key: '/my-learning',
        icon: <LaptopOutlined />,
        label: 'Моё обучение',
      },
      {
        key: '/homework',
        icon: <FileTextOutlined />,
        label: 'Домашние задания',
      },
    ],
  },
  {
    key: '/notifications',
    icon: <NotificationOutlined />,
    label: 'Уведомления',
  },
  {
    type: 'divider',
  },
  {
    key: '/admin/users',
    icon: <SettingOutlined />,
    label: 'Администрирование',
  },
];

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, fetchUser, logout } = useAuthStore();
  const { unreadCount, fetchNotifications } = useNotificationStore();
  const [collapsed, setCollapsed] = useState(false);
  const { token: themeToken } = theme.useToken();

  useEffect(() => {
    fetchUser();
    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Профиль',
      onClick: () => router.push(user ? `/profile/${user.id}` : '/profile/1'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Настройки',
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Выйти',
      onClick: logout,
    },
  ];

  const selectedKey = (() => {
    if (pathname.startsWith('/admin')) return '/admin/users';
    if (pathname.startsWith('/courses')) return '/courses';
    if (pathname.startsWith('/my-learning')) return '/my-learning';
    if (pathname.startsWith('/homework')) return '/homework';
    if (pathname.startsWith('/news')) return '/news';
    return pathname;
  })();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        trigger={null}
        width={260}
        style={{
          background: '#fff',
          borderRight: '1px solid #f0f0f0',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100,
          overflow: 'auto',
        }}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderBottom: '1px solid #f0f0f0',
          }}
        >
          <BookOutlined
            style={{ fontSize: 24, color: themeToken.colorPrimary }}
          />
          {!collapsed && (
            <Text
              strong
              style={{
                marginLeft: 12,
                fontSize: 18,
                color: themeToken.colorPrimary,
              }}
            >
              LMS Platform
            </Text>
          )}
        </div>
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          defaultOpenKeys={['learning']}
          items={menuItems}
          onClick={({ key }) => router.push(key)}
          style={{ borderRight: 0, paddingTop: 8 }}
        />
      </Sider>

      <Layout
        style={{
          marginLeft: collapsed ? 80 : 260,
          transition: 'margin-left 0.2s',
        }}
      >
        <Header
          style={{
            background: '#fff',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #f0f0f0',
            position: 'sticky',
            top: 0,
            zIndex: 99,
            height: 64,
          }}
        >
          <Space>
            {React.createElement(
              collapsed ? MenuUnfoldOutlined : MenuFoldOutlined,
              {
                style: { fontSize: 18, cursor: 'pointer' },
                onClick: () => setCollapsed(!collapsed),
              }
            )}
            <Input
              prefix={<SearchOutlined />}
              placeholder="Поиск..."
              style={{ width: 300, marginLeft: 16 }}
              allowClear
            />
          </Space>

          <Space size={20}>
            <Badge count={unreadCount} size="small">
              <BellOutlined
                style={{ fontSize: 20, cursor: 'pointer' }}
                onClick={() => router.push('/notifications')}
              />
            </Badge>
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              trigger={['click']}
            >
              <Space style={{ cursor: 'pointer' }}>
                <Avatar
                  size={36}
                  src={user?.avatarUrl}
                  icon={<UserOutlined />}
                  style={{ backgroundColor: '#1677ff' }}
                />
                {user && (
                  <Text strong>
                    {user.firstName} {user.lastName}
                  </Text>
                )}
              </Space>
            </Dropdown>
          </Space>
        </Header>

        <Content
          style={{
            margin: 24,
            minHeight: 'calc(100vh - 64px - 48px)',
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
