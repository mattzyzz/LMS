'use client';

import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Typography, Space, Spin } from 'antd';
import {
  UserOutlined,
  BookOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  TeamOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import api from '@/lib/api';

const { Title } = Typography;

interface AdminStats {
  totalUsers: number;
  totalCourses: number;
  totalEnrollments: number;
  pendingSubmissions: number;
  activeUsers: number;
  totalKudos: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        // In a real app, this would be a single API call
        const [users, courses, submissions] = await Promise.all([
          api.get('/users').catch(() => ({ data: [] })),
          api.get('/courses').catch(() => ({ data: { data: [] } })),
          api.get('/homework/submissions/pending').catch(() => ({ data: [] })),
        ]);

        setStats({
          totalUsers: Array.isArray(users.data) ? users.data.length : 0,
          totalCourses: Array.isArray(courses.data?.data) ? courses.data.data.length : 0,
          totalEnrollments: 0,
          pendingSubmissions: Array.isArray(submissions.data) ? submissions.data.length : 0,
          activeUsers: 0,
          totalKudos: 0,
        });
      } catch {
        // handle error
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const adminCards = [
    {
      title: 'Пользователи',
      value: stats?.totalUsers || 0,
      icon: <UserOutlined />,
      color: '#1677ff',
      href: '/admin/users',
    },
    {
      title: 'Курсы',
      value: stats?.totalCourses || 0,
      icon: <BookOutlined />,
      color: '#52c41a',
      href: '/admin/courses',
    },
    {
      title: 'ДЗ на проверке',
      value: stats?.pendingSubmissions || 0,
      icon: <FileTextOutlined />,
      color: '#faad14',
      href: '/admin/homework-review',
    },
    {
      title: 'Тесты',
      value: 0,
      icon: <CheckCircleOutlined />,
      color: '#722ed1',
      href: '/admin/quizzes',
    },
    {
      title: 'Отделы',
      value: 0,
      icon: <TeamOutlined />,
      color: '#eb2f96',
      href: '/org-structure',
    },
    {
      title: 'Аналитика',
      value: 'Отчёты',
      icon: <TrophyOutlined />,
      color: '#13c2c2',
      href: '/admin/analytics',
    },
  ];

  return (
    <div>
      <Title level={3} style={{ marginBottom: 24 }}>
        Администрирование
      </Title>

      <Spin spinning={loading}>
        <Row gutter={[24, 24]}>
          {adminCards.map((card) => (
            <Col xs={24} sm={12} lg={8} key={card.title}>
              <Link href={card.href}>
                <Card hoverable>
                  <Statistic
                    title={card.title}
                    value={card.value}
                    prefix={
                      <span style={{ color: card.color, fontSize: 24 }}>
                        {card.icon}
                      </span>
                    }
                  />
                </Card>
              </Link>
            </Col>
          ))}
        </Row>
      </Spin>
    </div>
  );
}
