'use client';

import React, { useEffect, useState } from 'react';
import {
  Card,
  Typography,
  Tabs,
  List,
  Progress,
  Tag,
  Button,
  Space,
  Empty,
  Spin,
  Avatar,
} from 'antd';
import {
  PlayCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  BookOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import dayjs from 'dayjs';
import api from '@/lib/api';
import type { Enrollment } from '@/types';

const { Title, Text, Paragraph } = Typography;

const statusLabels: Record<string, { label: string; color: string }> = {
  active: { label: 'В процессе', color: 'processing' },
  completed: { label: 'Завершён', color: 'success' },
  dropped: { label: 'Отменён', color: 'default' },
};

export default function MyLearningPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active');

  useEffect(() => {
    const fetchEnrollments = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/enrollments/my');
        // Handle both array and paginated response
        const arr = Array.isArray(data) ? data : (data?.data || []);
        setEnrollments(arr);
      } catch {
        setEnrollments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEnrollments();
  }, []);

  const filteredEnrollments = enrollments.filter((e) => {
    if (activeTab === 'active') return e.status === 'active';
    if (activeTab === 'completed') return e.status === 'completed';
    return true;
  });

  const formatDuration = (minutes: number) => {
    if (!minutes) return '';
    if (minutes < 60) return `${minutes} мин`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours} ч ${mins} мин` : `${hours} ч`;
  };

  return (
    <div>
      <Title level={3} style={{ marginBottom: 24 }}>
        Моё обучение
      </Title>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'active',
            label: `В процессе (${enrollments.filter((e) => e.status === 'active').length})`,
          },
          {
            key: 'completed',
            label: `Завершённые (${enrollments.filter((e) => e.status === 'completed').length})`,
          },
          {
            key: 'all',
            label: `Все (${enrollments.length})`,
          },
        ]}
      />

      <Spin spinning={loading}>
        {filteredEnrollments.length === 0 && !loading ? (
          <Empty
            description={
              activeTab === 'active'
                ? 'У вас пока нет активных курсов'
                : 'Нет завершённых курсов'
            }
          >
            <Link href="/courses">
              <Button type="primary">Перейти в каталог курсов</Button>
            </Link>
          </Empty>
        ) : (
          <List
            dataSource={filteredEnrollments}
            renderItem={(enrollment) => (
              <Card style={{ marginBottom: 16 }} hoverable>
                <List.Item.Meta
                  avatar={
                    enrollment.course?.coverImage ? (
                      <Avatar
                        shape="square"
                        size={80}
                        src={enrollment.course.coverImage}
                      />
                    ) : (
                      <Avatar
                        shape="square"
                        size={80}
                        icon={<BookOutlined />}
                        style={{
                          background:
                            'linear-gradient(135deg, #1677ff 0%, #69b1ff 100%)',
                        }}
                      />
                    )
                  }
                  title={
                    <Space>
                      <Link href={`/courses/${enrollment.courseId}`}>
                        <Text strong style={{ fontSize: 16 }}>
                          {enrollment.course?.title || 'Курс'}
                        </Text>
                      </Link>
                      <Tag color={statusLabels[enrollment.status]?.color}>
                        {statusLabels[enrollment.status]?.label}
                      </Tag>
                    </Space>
                  }
                  description={
                    <Space direction="vertical" size={8} style={{ width: '100%' }}>
                      <Paragraph
                        type="secondary"
                        ellipsis={{ rows: 2 }}
                        style={{ marginBottom: 0 }}
                      >
                        {enrollment.course?.description || 'Нет описания'}
                      </Paragraph>
                      <Space split={<span style={{ color: '#d9d9d9' }}>•</span>}>
                        {enrollment.course?.durationMinutes && (
                          <Text type="secondary">
                            <ClockCircleOutlined />{' '}
                            {formatDuration(enrollment.course.durationMinutes)}
                          </Text>
                        )}
                        {enrollment.deadline && (
                          <Text type="secondary">
                            Дедлайн: {dayjs(enrollment.deadline).format('DD.MM.YYYY')}
                          </Text>
                        )}
                        {enrollment.completedAt && (
                          <Text type="secondary">
                            Завершён: {dayjs(enrollment.completedAt).format('DD.MM.YYYY')}
                          </Text>
                        )}
                      </Space>
                    </Space>
                  }
                />
                <div style={{ marginTop: 16 }}>
                  <Space
                    style={{ width: '100%', justifyContent: 'space-between' }}
                  >
                    <div style={{ flex: 1, maxWidth: 300 }}>
                      <Text type="secondary">Прогресс: {enrollment.progressPercent}%</Text>
                      <Progress
                        percent={enrollment.progressPercent}
                        status={
                          enrollment.status === 'completed' ? 'success' : 'active'
                        }
                        size="small"
                      />
                    </div>
                    <Link href={`/courses/${enrollment.courseId}`}>
                      <Button
                        type="primary"
                        icon={
                          enrollment.status === 'completed' ? (
                            <CheckCircleOutlined />
                          ) : (
                            <PlayCircleOutlined />
                          )
                        }
                      >
                        {enrollment.status === 'completed'
                          ? 'Повторить'
                          : 'Продолжить'}
                      </Button>
                    </Link>
                  </Space>
                </div>
              </Card>
            )}
          />
        )}
      </Spin>
    </div>
  );
}
