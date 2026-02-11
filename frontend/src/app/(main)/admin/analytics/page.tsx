'use client';

import React, { useEffect, useState } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Statistic,
  Table,
  Progress,
  Spin,
} from 'antd';
import {
  UserOutlined,
  BookOutlined,
  CheckCircleOutlined,
  RiseOutlined,
  TeamOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import api from '@/lib/api';

const { Title, Text } = Typography;

interface CourseStats {
  courseId: string;
  courseTitle: string;
  totalEnrollments: number;
  completedEnrollments: number;
  averageProgress: number;
}

interface AnalyticsData {
  totalUsers: number;
  activeUsers: number;
  totalCourses: number;
  publishedCourses: number;
  totalEnrollments: number;
  completedEnrollments: number;
  averageCompletionRate: number;
  courseStats: CourseStats[];
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const { data: analyticsData } = await api.get<AnalyticsData>('/analytics/overview');
        setData(analyticsData);
      } catch {
        // Use mock data if API not available
        setData({
          totalUsers: 0,
          activeUsers: 0,
          totalCourses: 0,
          publishedCourses: 0,
          totalEnrollments: 0,
          completedEnrollments: 0,
          averageCompletionRate: 0,
          courseStats: [],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const courseColumns = [
    {
      title: 'Курс',
      dataIndex: 'courseTitle',
      key: 'courseTitle',
    },
    {
      title: 'Записей',
      dataIndex: 'totalEnrollments',
      key: 'totalEnrollments',
    },
    {
      title: 'Завершено',
      dataIndex: 'completedEnrollments',
      key: 'completedEnrollments',
    },
    {
      title: 'Средний прогресс',
      dataIndex: 'averageProgress',
      key: 'averageProgress',
      render: (value: number) => (
        <Progress percent={Math.round(value)} size="small" />
      ),
    },
    {
      title: 'Completion Rate',
      key: 'completionRate',
      render: (_: any, record: CourseStats) => {
        const rate = record.totalEnrollments > 0
          ? Math.round((record.completedEnrollments / record.totalEnrollments) * 100)
          : 0;
        return `${rate}%`;
      },
    },
  ];

  return (
    <div>
      <Title level={3} style={{ marginBottom: 24 }}>
        Аналитика
      </Title>

      <Spin spinning={loading}>
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Всего пользователей"
                value={data?.totalUsers || 0}
                prefix={<UserOutlined style={{ color: '#1677ff' }} />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Активных пользователей"
                value={data?.activeUsers || 0}
                prefix={<TeamOutlined style={{ color: '#52c41a' }} />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Курсов опубликовано"
                value={data?.publishedCourses || 0}
                suffix={`/ ${data?.totalCourses || 0}`}
                prefix={<BookOutlined style={{ color: '#722ed1' }} />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Записей на курсы"
                value={data?.totalEnrollments || 0}
                prefix={<RiseOutlined style={{ color: '#faad14' }} />}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
          <Col xs={24} lg={12}>
            <Card title="Completion Rate">
              <div style={{ textAlign: 'center' }}>
                <Progress
                  type="circle"
                  percent={data?.averageCompletionRate || 0}
                  size={180}
                  format={(percent) => (
                    <div>
                      <div style={{ fontSize: 32, fontWeight: 'bold' }}>
                        {percent}%
                      </div>
                      <Text type="secondary">Средняя завершаемость</Text>
                    </div>
                  )}
                />
              </div>
              <Row gutter={16} style={{ marginTop: 24 }}>
                <Col span={12}>
                  <Statistic
                    title="Завершено"
                    value={data?.completedEnrollments || 0}
                    valueStyle={{ color: '#52c41a' }}
                    prefix={<CheckCircleOutlined />}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="В процессе"
                    value={(data?.totalEnrollments || 0) - (data?.completedEnrollments || 0)}
                    valueStyle={{ color: '#1677ff' }}
                    prefix={<BookOutlined />}
                  />
                </Col>
              </Row>
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card title="Топ достижений">
              <div style={{ textAlign: 'center', padding: 40 }}>
                <TrophyOutlined style={{ fontSize: 64, color: '#faad14' }} />
                <Title level={4} style={{ marginTop: 16 }}>
                  Статистика по достижениям
                </Title>
                <Text type="secondary">
                  Здесь будет отображаться информация о достижениях пользователей
                </Text>
              </div>
            </Card>
          </Col>
        </Row>

        <Card title="Статистика по курсам" style={{ marginTop: 24 }}>
          <Table
            dataSource={data?.courseStats || []}
            columns={courseColumns}
            rowKey="courseId"
            pagination={false}
            locale={{ emptyText: 'Нет данных о курсах' }}
          />
        </Card>
      </Spin>
    </div>
  );
}
