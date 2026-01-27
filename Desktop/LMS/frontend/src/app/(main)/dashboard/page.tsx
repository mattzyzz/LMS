'use client';

import React, { useEffect, useState } from 'react';
import {
  Row,
  Col,
  Card,
  List,
  Progress,
  Statistic,
  Avatar,
  Typography,
  Space,
  Tag,
  Tooltip,
} from 'antd';
import {
  BookOutlined,
  CalendarOutlined,
  ReadOutlined,
  TeamOutlined,
  TrophyOutlined,
  SmileOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import api from '@/lib/api';
import type { Post, Event, Enrollment, User } from '@/types';

dayjs.locale('ru');
const { Title, Text, Paragraph } = Typography;

export default function DashboardPage() {
  const [news, setNews] = useState<Post[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [birthdays, setBirthdays] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [newsRes, eventsRes, enrollRes, birthdayRes] = await Promise.allSettled([
          api.get<Post[]>('/posts', { params: { limit: 5 } }),
          api.get<Event[]>('/events', { params: { limit: 5, upcoming: true } }),
          api.get<Enrollment[]>('/enrollments/my', { params: { limit: 5 } }),
          api.get<User[]>('/users/birthdays'),
        ]);

        if (newsRes.status === 'fulfilled') setNews(newsRes.value.data);
        if (eventsRes.status === 'fulfilled') setEvents(eventsRes.value.data);
        if (enrollRes.status === 'fulfilled') setEnrollments(enrollRes.value.data);
        if (birthdayRes.status === 'fulfilled') setBirthdays(birthdayRes.value.data);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      <Title level={3} style={{ marginBottom: 24 }}>
        Дашборд
      </Title>

      {/* Stats Row */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Активных курсов"
              value={enrollments.filter((e) => e.status === 'active').length}
              prefix={<BookOutlined />}
              valueStyle={{ color: '#1677ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Завершённых курсов"
              value={enrollments.filter((e) => e.status === 'completed').length}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Новостей"
              value={news.length}
              prefix={<ReadOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Событий на этой неделе"
              value={events.length}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* Latest News */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <ReadOutlined />
                <span>Последние новости</span>
              </Space>
            }
            extra={<Link href="/news">Все новости</Link>}
            loading={loading}
          >
            <List
              dataSource={news}
              locale={{ emptyText: 'Нет новостей' }}
              renderItem={(post) => (
                <List.Item key={post.id}>
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        src={post.author?.avatarUrl}
                        style={{ backgroundColor: '#1677ff' }}
                      >
                        {post.author?.firstName?.[0]}
                      </Avatar>
                    }
                    title={
                      <Link href={`/news/${post.id}`}>
                        <Space>
                          {post.isPinned && <Tag color="red">Закреплено</Tag>}
                          {post.title}
                        </Space>
                      </Link>
                    }
                    description={
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {dayjs(post.createdAt).format('DD MMM YYYY')}
                      </Text>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* Upcoming Events */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <CalendarOutlined />
                <span>Ближайшие события</span>
              </Space>
            }
            extra={<Link href="/calendar">Календарь</Link>}
            loading={loading}
          >
            <List
              dataSource={events}
              locale={{ emptyText: 'Нет предстоящих событий' }}
              renderItem={(event) => (
                <List.Item key={event.id}>
                  <List.Item.Meta
                    avatar={
                      <div
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: 8,
                          background: '#f0f5ff',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Text strong style={{ fontSize: 16, lineHeight: 1, color: '#1677ff' }}>
                          {dayjs(event.startDate).format('DD')}
                        </Text>
                        <Text style={{ fontSize: 10, color: '#1677ff', textTransform: 'uppercase' }}>
                          {dayjs(event.startDate).format('MMM')}
                        </Text>
                      </div>
                    }
                    title={event.title}
                    description={
                      <Space>
                        <Tag>{event.type}</Tag>
                        {event.location && (
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {event.location}
                          </Text>
                        )}
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* My Courses Progress */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <BookOutlined />
                <span>Мои курсы</span>
              </Space>
            }
            extra={<Link href="/my-learning">Все курсы</Link>}
            loading={loading}
          >
            <List
              dataSource={enrollments.slice(0, 5)}
              locale={{ emptyText: 'Вы ещё не записаны на курсы' }}
              renderItem={(enrollment) => (
                <List.Item key={enrollment.id}>
                  <div style={{ width: '100%' }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: 4,
                      }}
                    >
                      <Link href={`/courses/${enrollment.courseId}`}>
                        <Text>{enrollment.course?.title || `Курс #${enrollment.courseId}`}</Text>
                      </Link>
                      <Text type="secondary">{enrollment.progress}%</Text>
                    </div>
                    <Progress
                      percent={enrollment.progress}
                      showInfo={false}
                      size="small"
                      status={enrollment.progress === 100 ? 'success' : 'active'}
                    />
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* Birthdays */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <SmileOutlined />
                <span>Дни рождения</span>
              </Space>
            }
            extra={
              <Link href="/org-structure">
                <TeamOutlined /> Сотрудники
              </Link>
            }
            loading={loading}
          >
            {birthdays.length === 0 ? (
              <Paragraph type="secondary">Нет ближайших дней рождения</Paragraph>
            ) : (
              <Space wrap>
                {birthdays.map((user) => (
                  <Tooltip
                    key={user.id}
                    title={`${user.firstName} ${user.lastName} — ${dayjs(user.birthday).format('DD MMMM')}`}
                  >
                    <Link href={`/profile/${user.id}`}>
                      <Avatar
                        size={48}
                        src={user.avatarUrl}
                        style={{ backgroundColor: '#fa8c16' }}
                      >
                        {user.firstName?.[0]}
                        {user.lastName?.[0]}
                      </Avatar>
                    </Link>
                  </Tooltip>
                ))}
              </Space>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
