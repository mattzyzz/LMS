'use client';

import React, { useEffect, useState } from 'react';
import {
  Card,
  Tabs,
  Avatar,
  Typography,
  Descriptions,
  Tag,
  Table,
  List,
  Progress,
  Space,
  Badge,
  Spin,
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  TrophyOutlined,
  BookOutlined,
  HeartOutlined,
} from '@ant-design/icons';
import { useParams } from 'next/navigation';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import Link from 'next/link';
import api from '@/lib/api';
import {
  SKILL_LEVEL_LABELS,
  AVAILABILITY_LABELS,
  AVAILABILITY_COLORS,
} from '@/lib/constants';
import type { User, Enrollment, Kudos } from '@/types';

dayjs.locale('ru');
const { Title, Text, Paragraph } = Typography;

export default function ProfilePage() {
  const params = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [kudos, setKudos] = useState<Kudos[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const toArray = (d: any) => Array.isArray(d) ? d : (d?.data || []);
      try {
        const [userRes, enrollRes, kudosRes] = await Promise.allSettled([
          api.get(`/users/${params.id}`),
          api.get(`/users/${params.id}/enrollments`),
          api.get(`/users/${params.id}/kudos`),
        ]);
        if (userRes.status === 'fulfilled') setUser(userRes.value.data);
        if (enrollRes.status === 'fulfilled') setEnrollments(toArray(enrollRes.value.data));
        if (kudosRes.status === 'fulfilled') setKudos(toArray(kudosRes.value.data));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [params.id]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Title level={4}>Пользователь не найден</Title>
      </div>
    );
  }

  const skillColors: Record<string, string> = {
    beginner: 'green',
    intermediate: 'blue',
    advanced: 'orange',
    expert: 'red',
  };

  const tabItems = [
    {
      key: 'overview',
      label: (
        <span>
          <UserOutlined /> Обзор
        </span>
      ),
      children: (
        <div>
          <Descriptions column={{ xs: 1, sm: 2 }} bordered>
            <Descriptions.Item label={<><MailOutlined /> Email</>}>
              {user.email}
            </Descriptions.Item>
            {user.phone && (
              <Descriptions.Item label={<><PhoneOutlined /> Телефон</>}>
                {user.phone}
              </Descriptions.Item>
            )}
            {user.position && (
              <Descriptions.Item label="Должность">
                {user.position}
              </Descriptions.Item>
            )}
            {user.department && (
              <Descriptions.Item label="Отдел">
                {user.department.name}
              </Descriptions.Item>
            )}
            {user.birthday && (
              <Descriptions.Item label="День рождения">
                {dayjs(user.birthday).format('DD MMMM YYYY')}
              </Descriptions.Item>
            )}
            <Descriptions.Item label="Статус">
              <Badge
                color={
                  AVAILABILITY_COLORS[
                    user.profile?.availabilityStatus || 'offline'
                  ]
                }
                text={
                  AVAILABILITY_LABELS[
                    user.profile?.availabilityStatus || 'offline'
                  ]
                }
              />
            </Descriptions.Item>
          </Descriptions>
          {user.profile?.bio && (
            <Card style={{ marginTop: 16 }} title="О себе">
              <Paragraph>{user.profile.bio}</Paragraph>
            </Card>
          )}
        </div>
      ),
    },
    {
      key: 'skills',
      label: (
        <span>
          <TrophyOutlined /> Навыки
        </span>
      ),
      children: (
        <div>
          {user.profile?.skills && user.profile.skills.length > 0 ? (
            <Space wrap size={[8, 8]}>
              {user.profile.skills.map((skill, idx) => (
                <Tag
                  key={idx}
                  color={skillColors[skill.level] || 'default'}
                  style={{ padding: '4px 12px', fontSize: 14 }}
                >
                  {skill.skill?.name || 'Навык'} — {SKILL_LEVEL_LABELS[skill.level]}
                </Tag>
              ))}
            </Space>
          ) : (
            <Text type="secondary">Навыки не указаны</Text>
          )}
        </div>
      ),
    },
    {
      key: 'projects',
      label: 'Проекты',
      children: (
        <Table
          dataSource={[]}
          locale={{ emptyText: 'Нет проектов' }}
          columns={[
            { title: 'Название', dataIndex: 'name', key: 'name' },
            { title: 'Роль', dataIndex: 'role', key: 'role' },
            { title: 'Статус', dataIndex: 'status', key: 'status' },
          ]}
          rowKey="id"
          pagination={false}
        />
      ),
    },
    {
      key: 'kudos',
      label: (
        <span>
          <HeartOutlined /> Благодарности
        </span>
      ),
      children: (
        <List
          dataSource={kudos}
          locale={{ emptyText: 'Нет благодарностей' }}
          renderItem={(k) => (
            <List.Item key={k.id}>
              <List.Item.Meta
                avatar={
                  <Avatar
                    src={k.fromUser?.avatar}
                    style={{ backgroundColor: '#fa8c16' }}
                  >
                    {k.fromUser?.firstName?.[0]}
                  </Avatar>
                }
                title={
                  <Text>
                    {k.fromUser
                      ? `${k.fromUser.firstName} ${k.fromUser.lastName}`
                      : 'Аноним'}
                  </Text>
                }
                description={
                  <Space direction="vertical">
                    <Text>{k.message}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {dayjs(k.createdAt).format('DD MMMM YYYY')}
                    </Text>
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      ),
    },
    {
      key: 'learning',
      label: (
        <span>
          <BookOutlined /> Обучение
        </span>
      ),
      children: (
        <List
          dataSource={enrollments}
          locale={{ emptyText: 'Нет записей на курсы' }}
          renderItem={(enrollment) => (
            <List.Item key={enrollment.id}>
              <div style={{ width: '100%' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: 8,
                  }}
                >
                  <Link href={`/courses/${enrollment.courseId}`}>
                    <Text strong>
                      {enrollment.course?.title || `Курс #${enrollment.courseId}`}
                    </Text>
                  </Link>
                  <Tag
                    color={
                      enrollment.status === 'completed'
                        ? 'success'
                        : enrollment.status === 'active'
                        ? 'processing'
                        : 'default'
                    }
                  >
                    {enrollment.status === 'completed'
                      ? 'Завершён'
                      : enrollment.status === 'active'
                      ? 'В процессе'
                      : enrollment.status}
                  </Tag>
                </div>
                <Progress percent={enrollment.progressPercent} size="small" />
              </div>
            </List.Item>
          )}
        />
      ),
    },
  ];

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <Card>
        <div
          style={{
            display: 'flex',
            gap: 24,
            alignItems: 'center',
            marginBottom: 24,
          }}
        >
          <Avatar
            size={96}
            src={user.avatar}
            icon={<UserOutlined />}
            style={{ backgroundColor: '#1677ff', flexShrink: 0 }}
          />
          <div>
            <Title level={3} style={{ margin: 0 }}>
              {user.firstName} {user.lastName}
              {user.patronymic && ` ${user.patronymic}`}
            </Title>
            {user.position && (
              <Text type="secondary" style={{ fontSize: 16 }}>
                {user.position}
              </Text>
            )}
            <div style={{ marginTop: 8 }}>
              <Badge
                color={
                  AVAILABILITY_COLORS[
                    user.profile?.availabilityStatus || 'offline'
                  ]
                }
                text={
                  AVAILABILITY_LABELS[
                    user.profile?.availabilityStatus || 'offline'
                  ]
                }
              />
            </div>
          </div>
        </div>

        <Tabs items={tabItems} defaultActiveKey="overview" />
      </Card>
    </div>
  );
}
