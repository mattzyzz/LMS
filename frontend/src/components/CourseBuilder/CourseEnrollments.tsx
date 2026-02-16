'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Table,
  Button,
  Space,
  Typography,
  message,
  Tag,
  Avatar,
  Modal,
  Input,
  List,
  Checkbox,
  Empty,
  Popconfirm,
  DatePicker,
} from 'antd';
import {
  UserOutlined,
  PlusOutlined,
  DeleteOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import api from '@/lib/api';
import type { User, Enrollment } from '@/types';
import dayjs from 'dayjs';

const { Text } = Typography;

interface CourseEnrollmentsProps {
  courseId: string;
}

const CourseEnrollments: React.FC<CourseEnrollmentsProps> = ({ courseId }) => {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [searchUser, setSearchUser] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [deadline, setDeadline] = useState<string | null>(null);

  const toArray = (d: any) => (Array.isArray(d) ? d : d?.data || []);

  const fetchEnrollments = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/enrollments/admin/course/${courseId}`, {
        params: { limit: 100 },
      });
      setEnrollments(toArray(data));
    } catch {
      message.error('Ошибка загрузки записей');
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchEnrollments();
  }, [fetchEnrollments]);

  const handleOpenModal = async () => {
    try {
      const { data } = await api.get('/users', { params: { limit: 100 } });
      const users = toArray(data).filter((u: User) => u.role === 'employee');
      setAllUsers(users);
      setSelectedUserIds([]);
      setSearchUser('');
      setDeadline(null);
      setIsModalOpen(true);
    } catch {
      message.error('Ошибка загрузки сотрудников');
    }
  };

  const handleAssign = async () => {
    if (selectedUserIds.length === 0) {
      message.warning('Выберите хотя бы одного сотрудника');
      return;
    }

    setAssigning(true);
    let successCount = 0;
    let errorCount = 0;

    for (const userId of selectedUserIds) {
      try {
        await api.post('/enrollments', {
          courseId,
          userId,
          ...(deadline ? { deadline } : {}),
        });
        successCount++;
      } catch {
        errorCount++;
      }
    }

    if (successCount > 0) {
      message.success(`Назначено: ${successCount} сотрудник(ов)`);
    }
    if (errorCount > 0) {
      message.warning(`${errorCount} уже записаны или произошла ошибка`);
    }

    setAssigning(false);
    setIsModalOpen(false);
    fetchEnrollments();
  };

  const handleRemoveEnrollment = async (enrollmentId: string) => {
    try {
      await api.delete(`/enrollments/${enrollmentId}`);
      message.success('Запись удалена');
      setEnrollments((prev) => prev.filter((e) => e.id !== enrollmentId));
    } catch {
      message.error('Ошибка удаления записи');
    }
  };

  const enrolledUserIds = enrollments.map((e) => e.userId);

  const filteredUsers = allUsers.filter(
    (u) =>
      !enrolledUserIds.includes(u.id) &&
      (u.firstName.toLowerCase().includes(searchUser.toLowerCase()) ||
        u.lastName.toLowerCase().includes(searchUser.toLowerCase()) ||
        u.email.toLowerCase().includes(searchUser.toLowerCase())),
  );

  const statusLabels: Record<string, { color: string; label: string }> = {
    active: { color: 'processing', label: 'Активен' },
    completed: { color: 'success', label: 'Завершён' },
    dropped: { color: 'default', label: 'Отчислен' },
  };

  const columns = [
    {
      title: 'Сотрудник',
      key: 'user',
      render: (_: unknown, record: Enrollment) => (
        <Space>
          <Avatar src={record.user?.avatar} icon={<UserOutlined />} />
          <div>
            <div style={{ fontWeight: 500 }}>
              {record.user?.firstName} {record.user?.lastName}
            </div>
            <div style={{ color: '#666', fontSize: 12 }}>{record.user?.email}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Статус',
      key: 'status',
      width: 120,
      render: (_: unknown, record: Enrollment) => {
        const s = statusLabels[record.status] || statusLabels.active;
        return <Tag color={s.color}>{s.label}</Tag>;
      },
    },
    {
      title: 'Прогресс',
      key: 'progress',
      width: 100,
      render: (_: unknown, record: Enrollment) => (
        <Text>{record.progressPercent}%</Text>
      ),
    },
    {
      title: 'Дедлайн',
      key: 'deadline',
      width: 130,
      render: (_: unknown, record: Enrollment) =>
        record.deadline ? dayjs(record.deadline).format('DD.MM.YYYY') : '-',
    },
    {
      title: 'Дата записи',
      key: 'createdAt',
      width: 130,
      render: (_: unknown, record: Enrollment) =>
        dayjs(record.createdAt).format('DD.MM.YYYY'),
    },
    {
      title: '',
      key: 'actions',
      width: 50,
      render: (_: unknown, record: Enrollment) => (
        <Popconfirm
          title="Удалить запись?"
          description="Прогресс сотрудника по этому курсу будет потерян"
          onConfirm={() => handleRemoveEnrollment(record.id)}
          okText="Удалить"
          cancelText="Отмена"
        >
          <Button type="text" danger icon={<DeleteOutlined />} size="small" />
        </Popconfirm>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Text type="secondary">
          Всего записано: {enrollments.length} сотрудник(ов)
        </Text>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenModal}>
          Назначить сотрудникам
        </Button>
      </div>

      <Table
        dataSource={enrollments}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
        locale={{ emptyText: <Empty description="Нет записанных сотрудников" /> }}
      />

      <Modal
        title="Назначить курс сотрудникам"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleAssign}
        okText={`Назначить (${selectedUserIds.length})`}
        cancelText="Отмена"
        confirmLoading={assigning}
        okButtonProps={{ disabled: selectedUserIds.length === 0 }}
        width={600}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Input
            prefix={<SearchOutlined />}
            placeholder="Поиск сотрудника..."
            allowClear
            value={searchUser}
            onChange={(e) => setSearchUser(e.target.value)}
          />

          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Дедлайн (необязательно):
            </Text>
            <DatePicker
              style={{ width: '100%', marginTop: 4 }}
              placeholder="Без дедлайна"
              onChange={(date) => setDeadline(date ? date.toISOString() : null)}
              format="DD.MM.YYYY"
            />
          </div>

          {filteredUsers.length === 0 ? (
            <Empty description="Нет доступных сотрудников" />
          ) : (
            <Checkbox.Group
              value={selectedUserIds}
              onChange={(values) => setSelectedUserIds(values as string[])}
              style={{ width: '100%' }}
            >
              <List
                dataSource={filteredUsers}
                style={{ maxHeight: 400, overflow: 'auto' }}
                renderItem={(user) => (
                  <List.Item style={{ padding: '8px 0' }}>
                    <Checkbox value={user.id} style={{ width: '100%' }}>
                      <Space>
                        <Avatar src={user.avatar} icon={<UserOutlined />} size="small" />
                        <div>
                          <Text>
                            {user.firstName} {user.lastName}
                          </Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {user.email}
                          </Text>
                        </div>
                      </Space>
                    </Checkbox>
                  </List.Item>
                )}
              />
            </Checkbox.Group>
          )}
        </Space>
      </Modal>
    </div>
  );
};

export default CourseEnrollments;
