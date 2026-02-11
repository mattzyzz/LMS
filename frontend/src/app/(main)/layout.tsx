'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  Layout,
  Avatar,
  Badge,
  Dropdown,
  Space,
  Typography,
  Tooltip,
  Input,
} from 'antd';
import {
  HomeOutlined,
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
  SearchOutlined,
  TeamOutlined,
  BarChartOutlined,
  GlobalOutlined,
  MenuOutlined,
} from '@ant-design/icons';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { useNotificationStore } from '@/stores/notification.store';
import type { MenuProps } from 'antd';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

interface NavItem {
  key: string;
  icon: React.ReactNode;
  label: string;
  children?: NavItem[];
}

// Navigation items for employees
const employeeNavItems: NavItem[] = [
  { key: '/dashboard', icon: <HomeOutlined />, label: 'Главная' },
  { key: '/my-learning', icon: <LaptopOutlined />, label: 'Моё обучение' },
  { key: '/homework', icon: <FileTextOutlined />, label: 'Задания' },
  { key: '/news', icon: <ReadOutlined />, label: 'Новости' },
  { key: '/org-structure', icon: <ApartmentOutlined />, label: 'Структура' },
  { key: '/kudos', icon: <HeartOutlined />, label: 'Благодарности' },
  { key: '/calendar', icon: <CalendarOutlined />, label: 'Календарь' },
  { key: '/notifications', icon: <BellOutlined />, label: 'Уведомления' },
];

// Navigation items for HRD
const hrdNavItems: NavItem[] = [
  { key: '/dashboard', icon: <HomeOutlined />, label: 'Главная' },
  { key: '/admin/courses', icon: <BookOutlined />, label: 'Курсы' },
  { key: '/admin/assign-courses', icon: <TeamOutlined />, label: 'Назначения' },
  { key: '/admin/homework-review', icon: <FileTextOutlined />, label: 'Проверка ДЗ' },
  { key: '/admin/analytics', icon: <BarChartOutlined />, label: 'Аналитика' },
  { key: '/admin/users', icon: <TeamOutlined />, label: 'Сотрудники' },
  { key: '/news', icon: <ReadOutlined />, label: 'Новости' },
  { key: '/org-structure', icon: <ApartmentOutlined />, label: 'Структура' },
  { key: '/kudos', icon: <HeartOutlined />, label: 'Благодарности' },
  { key: '/calendar', icon: <CalendarOutlined />, label: 'Календарь' },
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
  const [collapsed, setCollapsed] = useState(true);

  useEffect(() => {
    fetchUser();
    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isHrd = user?.role === 'hrd';
  const navItems = useMemo(() => (isHrd ? hrdNavItems : employeeNavItems), [isHrd]);

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
      danger: true,
      onClick: logout,
    },
  ];

  const getSelectedKey = () => {
    if (pathname.startsWith('/admin/courses')) return '/admin/courses';
    if (pathname.startsWith('/admin/assign')) return '/admin/assign-courses';
    if (pathname.startsWith('/admin/analytics')) return '/admin/analytics';
    if (pathname.startsWith('/admin/homework')) return '/admin/homework-review';
    if (pathname.startsWith('/admin/users')) return '/admin/users';
    if (pathname.startsWith('/courses')) return '/my-learning';
    if (pathname.startsWith('/my-learning')) return '/my-learning';
    if (pathname.startsWith('/homework')) return '/homework';
    if (pathname.startsWith('/news')) return '/news';
    if (pathname.startsWith('/profile')) return '/profile';
    return pathname;
  };

  const selectedKey = getSelectedKey();

  return (
    <Layout style={{ minHeight: '100vh', background: '#F5F5F5' }}>
      {/* Sidebar */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        trigger={null}
        width={240}
        collapsedWidth={72}
        onMouseEnter={() => setCollapsed(false)}
        onMouseLeave={() => setCollapsed(true)}
        style={{
          background: '#FFFFFF',
          borderRight: '1px solid #F0F0F0',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100,
          overflow: 'hidden',
          transition: 'all 0.2s ease',
        }}
      >
        {/* Logo */}
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            padding: collapsed ? 0 : '0 20px',
            borderBottom: '1px solid #F0F0F0',
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: '#E54D2E',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <span style={{ color: 'white', fontSize: 16, fontWeight: 700 }}>П</span>
          </div>
          {!collapsed && (
            <span
              style={{
                marginLeft: 12,
                fontSize: 18,
                fontWeight: 700,
                color: '#1A1A1A',
                letterSpacing: '-0.5px',
                whiteSpace: 'nowrap',
              }}
            >
              п<span style={{ color: '#E54D2E' }}>о</span>ртал
            </span>
          )}
        </div>

        {/* Navigation */}
        <nav style={{ padding: '12px 8px', overflow: 'hidden' }}>
          {navItems.map((item) => {
            const isActive = selectedKey === item.key;
            return (
              <Tooltip
                key={item.key}
                title={collapsed ? item.label : ''}
                placement="right"
              >
                <div
                  onClick={() => router.push(item.key)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: collapsed ? '12px 0' : '12px 16px',
                    margin: '2px 0',
                    borderRadius: 10,
                    cursor: 'pointer',
                    background: isActive ? '#FFEFEB' : 'transparent',
                    color: isActive ? '#E54D2E' : '#666666',
                    transition: 'all 0.15s ease',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = '#F5F5F5';
                      e.currentTarget.style.color = '#1A1A1A';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = '#666666';
                    }
                  }}
                >
                  <span style={{ fontSize: 20, display: 'flex', alignItems: 'center' }}>
                    {item.icon}
                  </span>
                  {!collapsed && (
                    <span style={{ fontSize: 14, fontWeight: 500 }}>{item.label}</span>
                  )}
                </div>
              </Tooltip>
            );
          })}
        </nav>
      </Sider>

      {/* Main Content */}
      <Layout
        style={{
          marginLeft: collapsed ? 72 : 72,
          transition: 'margin-left 0.2s ease',
          background: '#F5F5F5',
        }}
      >
        {/* Header */}
        <Header
          style={{
            background: '#FFFFFF',
            padding: '0 32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #F0F0F0',
            position: 'sticky',
            top: 0,
            zIndex: 99,
            height: 64,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <Input
              prefix={<SearchOutlined style={{ color: '#999' }} />}
              placeholder="Поиск..."
              style={{
                width: 320,
                background: '#F5F5F5',
                border: 'none',
              }}
              allowClear
            />
          </div>

          <Space size={16}>
            <Tooltip title="Язык">
              <div
                style={{
                  width: 40,
                  height: 40,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 10,
                  cursor: 'pointer',
                  color: '#666',
                }}
              >
                <GlobalOutlined style={{ fontSize: 20 }} />
              </div>
            </Tooltip>

            <Badge count={unreadCount} size="small" offset={[-4, 4]}>
              <div
                onClick={() => router.push('/notifications')}
                style={{
                  width: 40,
                  height: 40,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 10,
                  cursor: 'pointer',
                  color: '#666',
                }}
              >
                <BellOutlined style={{ fontSize: 20 }} />
              </div>
            </Badge>

            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              trigger={['click']}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '6px 12px 6px 6px',
                  borderRadius: 10,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <Avatar
                  size={36}
                  src={user?.avatar}
                  icon={<UserOutlined />}
                  style={{
                    background: '#E54D2E',
                    border: '2px solid #FFEFEB',
                  }}
                />
                {user && (
                  <div style={{ lineHeight: 1.2 }}>
                    <Text strong style={{ fontSize: 14, display: 'block' }}>
                      {user.firstName}
                    </Text>
                    <Text style={{ fontSize: 12, color: '#999' }}>
                      {isHrd ? 'Администратор' : 'Сотрудник'}
                    </Text>
                  </div>
                )}
                <MenuOutlined style={{ fontSize: 12, color: '#999', marginLeft: 4 }} />
              </div>
            </Dropdown>
          </Space>
        </Header>

        {/* Content */}
        <Content
          style={{
            padding: 32,
            minHeight: 'calc(100vh - 64px)',
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
