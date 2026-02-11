'use client';

import React, { useEffect, useState } from 'react';
import {
  Row,
  Col,
  Typography,
  Avatar,
  Spin,
  Progress,
  Tag,
  Button,
  Empty,
} from 'antd';
import {
  UserOutlined,
  BookOutlined,
  CalendarOutlined,
  GiftOutlined,
  RightOutlined,
  TeamOutlined,
  FileTextOutlined,
  BarChartOutlined,
  TrophyOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/auth.store';
import type { Post, CalendarEvent, Enrollment, User, Course } from '@/types';

dayjs.locale('ru');
const { Title, Text } = Typography;

// Helper to safely convert API response to array
const toArray = (data: any) => Array.isArray(data) ? data : (data?.data || []);

// Section Header Component
function SectionHeader({
  icon,
  title,
  subtitle,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: '#F5F5F5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#666',
            fontSize: 20,
          }}
        >
          {icon}
        </div>
        <div>
          <Title level={3} style={{ margin: 0, fontWeight: 700 }}>{title}</Title>
          {subtitle && <Text style={{ color: '#999', fontSize: 14 }}>{subtitle}</Text>}
        </div>
      </div>
      {action}
    </div>
  );
}

// Birthday Card Component
function BirthdayCard({ user, label }: { user: User; label: string }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 24,
        background: '#FFFFFF',
        borderRadius: 16,
        border: '1px solid #F0F0F0',
        textAlign: 'center',
        position: 'relative',
        minWidth: 160,
      }}
    >
      <Avatar
        size={72}
        src={user.avatar}
        icon={<UserOutlined />}
        style={{ marginBottom: 16, border: '3px solid #F5F5F5', background: '#E54D2E' }}
      />
      <div style={{ fontSize: 15, fontWeight: 600, color: '#1A1A1A', marginBottom: 4 }}>
        {user.firstName}
      </div>
      <div style={{ fontSize: 15, fontWeight: 600, color: '#1A1A1A', marginBottom: 8 }}>
        {user.lastName}
      </div>
      <Tag color="error" style={{ marginBottom: 16, border: 'none' }}>{label}</Tag>
      <Button type="text" style={{ color: '#666', fontSize: 13 }}>
        Поздравить
      </Button>
    </div>
  );
}

// Course Card Component
function CourseCard({ enrollment }: { enrollment: Enrollment }) {
  const router = useRouter();
  const course = enrollment.course;

  return (
    <div
      onClick={() => router.push(`/courses/${course?.id}`)}
      style={{
        display: 'flex',
        gap: 16,
        padding: 20,
        background: '#FFFFFF',
        borderRadius: 16,
        border: '1px solid #F0F0F0',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: 12,
          background: course?.coverImage ? `url(${course.coverImage}) center/cover` : '#F5F5F5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {!course?.coverImage && <BookOutlined style={{ fontSize: 32, color: '#999' }} />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ marginBottom: 8 }}>
          <Tag color="error" style={{ border: 'none', marginRight: 8 }}>Курс</Tag>
          <Tag style={{ background: '#F5F5F5', border: 'none', color: '#666' }}>
            {enrollment.status === 'completed' ? 'Завершён' : 'Активный'}
          </Tag>
        </div>
        <div style={{ fontSize: 15, fontWeight: 500, color: '#1A1A1A', marginBottom: 12 }}>
          {course?.title || 'Без названия'}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Progress
            percent={enrollment.progressPercent || 0}
            showInfo={false}
            strokeColor="#E54D2E"
            trailColor="#F0F0F0"
            style={{ flex: 1, margin: 0 }}
          />
          <Text style={{ color: '#999', fontSize: 13, whiteSpace: 'nowrap' }}>
            {enrollment.progressPercent || 0}%
          </Text>
        </div>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({
  icon,
  value,
  label,
  color
}: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  color: string;
}) {
  return (
    <div
      style={{
        background: '#FFFFFF',
        borderRadius: 16,
        padding: 24,
        border: '1px solid #F0F0F0',
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 12,
          background: `${color}15`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 16,
          color: color,
          fontSize: 22,
        }}
      >
        {icon}
      </div>
      <div style={{ fontSize: 32, fontWeight: 700, color: '#1A1A1A', marginBottom: 4 }}>
        {value}
      </div>
      <div style={{ fontSize: 14, color: '#666' }}>{label}</div>
    </div>
  );
}

// Employee Dashboard
function EmployeeDashboard() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [birthdays, setBirthdays] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [enrollRes, usersRes] = await Promise.all([
          api.get('/enrollments/my').catch(() => ({ data: [] })),
          api.get('/users').catch(() => ({ data: [] })),
        ]);
        setEnrollments(toArray(enrollRes.data));
        // Mock birthdays - in real app, filter users by birthdate
        setBirthdays(toArray(usersRes.data).slice(0, 4));
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      {/* Welcome */}
      <div style={{ marginBottom: 32 }}>
        <Title level={2} style={{ marginBottom: 8, fontWeight: 700 }}>
          {user?.firstName},
        </Title>
        <Text style={{ fontSize: 16, color: '#666' }}>
          здесь для тебя представлены полезные разделы
        </Text>
      </div>

      {/* Birthdays Section */}
      <div style={{ marginBottom: 48 }}>
        <SectionHeader
          icon={<GiftOutlined />}
          title="Поздравить коллег"
          action={
            <Button type="text" icon={<RightOutlined />} style={{ color: '#666' }}>
              Все
            </Button>
          }
        />
        <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 8 }}>
          {birthdays.length > 0 ? (
            birthdays.map((u) => (
              <BirthdayCard key={u.id} user={u} label="День рождения" />
            ))
          ) : (
            <Empty description="Нет ближайших праздников" />
          )}
        </div>
      </div>

      {/* Company Goal Banner */}
      <div
        style={{
          background: '#3D4F5F',
          borderRadius: 16,
          padding: 32,
          marginBottom: 48,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Tag
          style={{
            background: '#E54D2E',
            color: 'white',
            border: 'none',
            marginBottom: 16,
          }}
        >
          Цель компании
        </Tag>
        <Title level={3} style={{ color: 'white', marginBottom: 12, fontWeight: 600 }}>
          Внедрение инноваций
        </Title>
        <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 15 }}>
          Компания стремится стать лидером в области инновационных технологий и услуг.
        </Text>
        <div
          style={{
            position: 'absolute',
            right: 32,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 120,
            height: 120,
            borderRadius: '50%',
            background: 'rgba(229, 77, 46, 0.3)',
          }}
        />
      </div>

      {/* My Courses */}
      <div>
        <SectionHeader
          icon={<BookOutlined />}
          title="Моё обучение"
          subtitle="Назначенные курсы"
          action={
            <Button
              type="primary"
              icon={<ArrowRightOutlined />}
              onClick={() => router.push('/my-learning')}
            >
              Все курсы
            </Button>
          }
        />
        <Row gutter={[16, 16]}>
          {enrollments.length > 0 ? (
            enrollments.slice(0, 4).map((enrollment) => (
              <Col xs={24} lg={12} key={enrollment.id}>
                <CourseCard enrollment={enrollment} />
              </Col>
            ))
          ) : (
            <Col span={24}>
              <Empty description="Вам пока не назначены курсы" />
            </Col>
          )}
        </Row>
      </div>
    </div>
  );
}

// HRD Dashboard
function HrdDashboard() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [stats, setStats] = useState({ users: 0, courses: 0, enrollments: 0, pending: 0 });
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, coursesRes, enrollRes] = await Promise.all([
          api.get('/users').catch(() => ({ data: [] })),
          api.get('/courses').catch(() => ({ data: [] })),
          api.get('/enrollments').catch(() => ({ data: [] })),
        ]);
        const users = toArray(usersRes.data);
        const courses = toArray(coursesRes.data);
        const allEnrollments = toArray(enrollRes.data);

        setStats({
          users: users.length,
          courses: courses.length,
          enrollments: allEnrollments.length,
          pending: allEnrollments.filter((e: Enrollment) => e.status === 'active').length,
        });
        setRecentUsers(users.slice(0, 5));
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      {/* Welcome */}
      <div style={{ marginBottom: 32 }}>
        <Title level={2} style={{ marginBottom: 8, fontWeight: 700 }}>
          Панель администратора
        </Title>
        <Text style={{ fontSize: 16, color: '#666' }}>
          Добро пожаловать, {user?.firstName}! Вот обзор вашей платформы.
        </Text>
      </div>

      {/* Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 48 }}>
        <Col xs={12} lg={6}>
          <StatCard
            icon={<TeamOutlined />}
            value={stats.users}
            label="Сотрудников"
            color="#E54D2E"
          />
        </Col>
        <Col xs={12} lg={6}>
          <StatCard
            icon={<BookOutlined />}
            value={stats.courses}
            label="Курсов"
            color="#10B981"
          />
        </Col>
        <Col xs={12} lg={6}>
          <StatCard
            icon={<TrophyOutlined />}
            value={stats.enrollments}
            label="Назначений"
            color="#3B82F6"
          />
        </Col>
        <Col xs={12} lg={6}>
          <StatCard
            icon={<FileTextOutlined />}
            value={stats.pending}
            label="В процессе"
            color="#F97316"
          />
        </Col>
      </Row>

      {/* Quick Actions */}
      <div style={{ marginBottom: 48 }}>
        <SectionHeader
          icon={<BarChartOutlined />}
          title="Быстрые действия"
        />
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <div
              onClick={() => router.push('/admin/courses')}
              style={{
                background: '#FFFFFF',
                borderRadius: 16,
                padding: 24,
                border: '1px solid #F0F0F0',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#E54D2E';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#F0F0F0';
              }}
            >
              <BookOutlined style={{ fontSize: 24, color: '#E54D2E', marginBottom: 12 }} />
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Управление курсами</div>
              <div style={{ fontSize: 13, color: '#666' }}>Создание и редактирование</div>
            </div>
          </Col>
          <Col xs={24} sm={8}>
            <div
              onClick={() => router.push('/admin/assign-courses')}
              style={{
                background: '#FFFFFF',
                borderRadius: 16,
                padding: 24,
                border: '1px solid #F0F0F0',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#E54D2E';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#F0F0F0';
              }}
            >
              <TeamOutlined style={{ fontSize: 24, color: '#10B981', marginBottom: 12 }} />
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Назначить курсы</div>
              <div style={{ fontSize: 13, color: '#666' }}>Распределение обучения</div>
            </div>
          </Col>
          <Col xs={24} sm={8}>
            <div
              onClick={() => router.push('/admin/analytics')}
              style={{
                background: '#FFFFFF',
                borderRadius: 16,
                padding: 24,
                border: '1px solid #F0F0F0',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#E54D2E';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#F0F0F0';
              }}
            >
              <BarChartOutlined style={{ fontSize: 24, color: '#3B82F6', marginBottom: 12 }} />
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Аналитика</div>
              <div style={{ fontSize: 13, color: '#666' }}>Статистика обучения</div>
            </div>
          </Col>
        </Row>
      </div>

      {/* Recent Users */}
      <div>
        <SectionHeader
          icon={<TeamOutlined />}
          title="Сотрудники"
          subtitle="Последние добавленные"
          action={
            <Button
              type="primary"
              onClick={() => router.push('/admin/users')}
            >
              Все сотрудники
            </Button>
          }
        />
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 16,
            border: '1px solid #F0F0F0',
            overflow: 'hidden',
          }}
        >
          {recentUsers.map((u, index) => (
            <div
              key={u.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: 16,
                borderBottom: index < recentUsers.length - 1 ? '1px solid #F0F0F0' : 'none',
              }}
            >
              <Avatar
                size={40}
                src={u.avatar}
                icon={<UserOutlined />}
                style={{ background: '#E54D2E' }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: '#1A1A1A' }}>
                  {u.firstName} {u.lastName}
                </div>
                <div style={{ fontSize: 13, color: '#666' }}>{u.email}</div>
              </div>
              <Tag color={u.role === 'hrd' ? 'error' : 'default'}>
                {u.role === 'hrd' ? 'Админ' : 'Сотрудник'}
              </Tag>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Main Dashboard Component
export default function DashboardPage() {
  const { user } = useAuthStore();
  const isHrd = user?.role === 'hrd';

  return isHrd ? <HrdDashboard /> : <EmployeeDashboard />;
}
