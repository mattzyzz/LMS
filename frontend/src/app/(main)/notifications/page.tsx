'use client';

import React, { useEffect, useState } from 'react';
import {
  Card,
  Typography,
  List,
  Button,
  Space,
  Badge,
  Empty,
  Spin,
  Tag,
} from 'antd';
import {
  BellOutlined,
  CommentOutlined,
  BookOutlined,
  FormOutlined,
  CheckCircleOutlined,
  StarOutlined,
  CalendarOutlined,
  GiftOutlined,
  NotificationOutlined,
  CheckOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/ru';
import api from '@/lib/api';
import { useNotificationStore } from '@/stores/notification.store';
import type { Notification } from '@/types';

dayjs.extend(relativeTime);
dayjs.locale('ru');

const { Title, Text } = Typography;

const notificationIcons: Record<string, React.ReactNode> = {
  comment: <CommentOutlined />,
  mention: <CommentOutlined style={{ color: '#1677ff' }} />,
  course_assigned: <BookOutlined style={{ color: '#52c41a' }} />,
  homework_deadline: <FormOutlined style={{ color: '#faad14' }} />,
  homework_reviewed: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
  submission_received: <FormOutlined style={{ color: '#1677ff' }} />,
  quiz_result: <CheckCircleOutlined />,
  kudos_received: <StarOutlined style={{ color: '#faad14' }} />,
  event_reminder: <CalendarOutlined style={{ color: '#1677ff' }} />,
  birthday: <GiftOutlined style={{ color: '#eb2f96' }} />,
  news_published: <NotificationOutlined />,
};

const notificationLabels: Record<string, string> = {
  comment: 'Комментарий',
  mention: 'Упоминание',
  course_assigned: 'Назначен курс',
  homework_deadline: 'Дедлайн ДЗ',
  homework_reviewed: 'ДЗ проверено',
  submission_received: 'Получена работа',
  quiz_result: 'Результат теста',
  kudos_received: 'Благодарность',
  event_reminder: 'Напоминание',
  birthday: 'День рождения',
  news_published: 'Новость',
};

export default function NotificationsPage() {
  const { notifications, fetchNotifications, markAsRead, markAllAsRead, unreadCount } =
    useNotificationStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchNotifications();
      setLoading(false);
    };
    load();
  }, [fetchNotifications]);

  const getNotificationLink = (notification: Notification): string | null => {
    if (notification.link) return notification.link;

    const meta = notification.metadata as Record<string, any> | undefined;
    switch (notification.type) {
      case 'comment':
      case 'mention':
        if (meta?.postId) return `/news/${meta.postId}`;
        if (meta?.lessonId) return `/courses/${meta.courseId}/lessons/${meta.lessonId}`;
        break;
      case 'course_assigned':
        if (meta?.courseId) return `/courses/${meta.courseId}`;
        break;
      case 'homework_deadline':
      case 'homework_reviewed':
        if (meta?.assignmentId) return `/homework/${meta.assignmentId}`;
        break;
      case 'submission_received':
        if (meta?.assignmentId) return `/admin/homework-review`;
        break;
      case 'quiz_result':
        if (meta?.quizId) return `/courses/${meta.courseId}/quizzes/${meta.quizId}`;
        break;
      case 'kudos_received':
        return `/kudos`;
      case 'event_reminder':
        return `/calendar`;
      case 'birthday':
        if (meta?.userId) return `/profile/${meta.userId}`;
        break;
      case 'news_published':
        if (meta?.postId) return `/news/${meta.postId}`;
        break;
    }
    return null;
  };

  const handleClick = async (notification: Notification) => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }
  };

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
        }}
      >
        <Space>
          <Title level={3} style={{ margin: 0 }}>
            Уведомления
          </Title>
          {unreadCount > 0 && (
            <Badge count={unreadCount} style={{ marginLeft: 8 }} />
          )}
        </Space>
        {unreadCount > 0 && (
          <Button icon={<CheckOutlined />} onClick={markAllAsRead}>
            Прочитать все
          </Button>
        )}
      </div>

      <Spin spinning={loading}>
        {notifications.length === 0 && !loading ? (
          <Empty
            image={<BellOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />}
            description="Нет уведомлений"
          />
        ) : (
          <List
            dataSource={notifications}
            renderItem={(notification) => {
              const link = getNotificationLink(notification);
              const content = (
                <Card
                  size="small"
                  style={{
                    marginBottom: 8,
                    background: notification.isRead ? '#fff' : '#f0f5ff',
                    cursor: link ? 'pointer' : 'default',
                  }}
                  onClick={() => handleClick(notification)}
                >
                  <List.Item.Meta
                    avatar={
                      <Badge dot={!notification.isRead}>
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 8,
                            background: '#f5f5f5',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 18,
                          }}
                        >
                          {notificationIcons[notification.type] || <BellOutlined />}
                        </div>
                      </Badge>
                    }
                    title={
                      <Space>
                        <Text strong={!notification.isRead}>{notification.title}</Text>
                        <Tag>
                          {notificationLabels[notification.type] || notification.type}
                        </Tag>
                      </Space>
                    }
                    description={
                      <Space direction="vertical" size={4}>
                        {notification.message && (
                          <Text type="secondary">{notification.message}</Text>
                        )}
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {dayjs(notification.createdAt).fromNow()}
                        </Text>
                      </Space>
                    }
                  />
                </Card>
              );

              return link ? (
                <Link href={link} key={notification.id}>
                  {content}
                </Link>
              ) : (
                <div key={notification.id}>{content}</div>
              );
            }}
          />
        )}
      </Spin>
    </div>
  );
}
