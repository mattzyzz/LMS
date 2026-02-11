'use client';

import React, { useEffect, useState } from 'react';
import {
  Card,
  Table,
  Typography,
  Button,
  Space,
  Select,
  message,
  Tag,
  Avatar,
  Modal,
  List,
  Checkbox,
  Input,
  Empty,
} from 'antd';
import {
  UserOutlined,
  BookOutlined,
  PlusOutlined,
  DeleteOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import api from '@/lib/api';
import type { User, Course, Enrollment } from '@/types';

const { Title, Text } = Typography;

export default function AssignCoursesPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [searchUser, setSearchUser] = useState('');
  const [assigning, setAssigning] = useState(false);

  const toArray = (d: any) => Array.isArray(d) ? d : (d?.data || []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, coursesRes, enrollmentsRes] = await Promise.all([
        api.get('/users'),
        api.get('/courses', { params: { status: 'published', limit: 100 } }),
        api.get('/enrollments', { params: { limit: 1000 } }),
      ]);
      // Filter only employees
      const allUsers = toArray(usersRes.data);
      setUsers(allUsers.filter((u: User) => u.role === 'employee'));
      setCourses(toArray(coursesRes.data));
      setEnrollments(toArray(enrollmentsRes.data));
    } catch {
      message.error('Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getUserEnrollments = (userId: string) => {
    return enrollments.filter((e) => e.userId === userId);
  };

  const getUserCourses = (userId: string) => {
    const userEnrollments = getUserEnrollments(userId);
    return userEnrollments.map((e) => {
      const course = courses.find((c) => c.id === e.courseId);
      return {
        ...e,
        course,
      };
    });
  };

  const handleAssignClick = (user: User) => {
    setSelectedUser(user);
    const existingCourseIds = getUserEnrollments(user.id).map((e) => e.courseId);
    setSelectedCourses(existingCourseIds);
    setIsModalOpen(true);
  };

  const handleAssign = async () => {
    if (!selectedUser) return;

    setAssigning(true);
    try {
      const existingCourseIds = getUserEnrollments(selectedUser.id).map((e) => e.courseId);
      const newCourseIds = selectedCourses.filter((id) => !existingCourseIds.includes(id));
      const removedCourseIds = existingCourseIds.filter((id) => !selectedCourses.includes(id));

      // Create new enrollments
      for (const courseId of newCourseIds) {
        await api.post('/enrollments', {
          userId: selectedUser.id,
          courseId,
        });
      }

      // Remove old enrollments (optional - could just leave them)
      for (const courseId of removedCourseIds) {
        const enrollment = enrollments.find(
          (e) => e.userId === selectedUser.id && e.courseId === courseId
        );
        if (enrollment) {
          await api.delete(`/enrollments/${enrollment.id}`);
        }
      }

      message.success('Курсы успешно назначены');
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Ошибка при назначении');
    } finally {
      setAssigning(false);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.firstName.toLowerCase().includes(searchUser.toLowerCase()) ||
      u.lastName.toLowerCase().includes(searchUser.toLowerCase()) ||
      u.email.toLowerCase().includes(searchUser.toLowerCase())
  );

  const columns = [
    {
      title: 'Сотрудник',
      key: 'user',
      render: (_: any, record: User) => (
        <Space>
          <Avatar src={record.avatar} icon={<UserOutlined />} />
          <div>
            <div style={{ fontWeight: 500 }}>
              {record.firstName} {record.lastName}
            </div>
            <div style={{ color: '#666', fontSize: 12 }}>{record.email}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Назначенные курсы',
      key: 'courses',
      render: (_: any, record: User) => {
        const userCourses = getUserCourses(record.id);
        if (userCourses.length === 0) {
          return <Text type="secondary">Нет назначенных курсов</Text>;
        }
        return (
          <Space wrap>
            {userCourses.slice(0, 3).map((uc) => (
              <Tag key={uc.id} color="blue">
                {uc.course?.title || 'Курс'}
              </Tag>
            ))}
            {userCourses.length > 3 && (
              <Tag>+{userCourses.length - 3}</Tag>
            )}
          </Space>
        );
      },
    },
    {
      title: 'Прогресс',
      key: 'progress',
      render: (_: any, record: User) => {
        const userCourses = getUserCourses(record.id);
        if (userCourses.length === 0) return '-';
        const completed = userCourses.filter((uc) => uc.status === 'completed').length;
        return (
          <Text>
            {completed} / {userCourses.length} завершено
          </Text>
        );
      },
    },
    {
      title: 'Действия',
      key: 'actions',
      render: (_: any, record: User) => (
        <Button
          type="primary"
          icon={<BookOutlined />}
          onClick={() => handleAssignClick(record)}
        >
          Назначить курсы
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Title level={3} style={{ marginBottom: 24 }}>
        Назначение курсов сотрудникам
      </Title>

      <Card>
        <Input
          prefix={<SearchOutlined />}
          placeholder="Поиск сотрудника..."
          allowClear
          style={{ marginBottom: 16, width: 300 }}
          value={searchUser}
          onChange={(e) => setSearchUser(e.target.value)}
        />

        <Table
          dataSource={filteredUsers}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={
          <Space>
            <BookOutlined />
            Назначить курсы: {selectedUser?.firstName} {selectedUser?.lastName}
          </Space>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleAssign}
        okText="Сохранить"
        cancelText="Отмена"
        confirmLoading={assigning}
        width={600}
      >
        {courses.length === 0 ? (
          <Empty description="Нет опубликованных курсов" />
        ) : (
          <Checkbox.Group
            value={selectedCourses}
            onChange={(values) => setSelectedCourses(values as string[])}
            style={{ width: '100%' }}
          >
            <List
              dataSource={courses}
              renderItem={(course) => {
                const isEnrolled = selectedCourses.includes(course.id);
                const enrollment = enrollments.find(
                  (e) => e.userId === selectedUser?.id && e.courseId === course.id
                );
                return (
                  <List.Item>
                    <Checkbox value={course.id} style={{ width: '100%' }}>
                      <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                        <div>
                          <Text strong>{course.title}</Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {course.category || 'Без категории'} • {course.durationMinutes} мин
                          </Text>
                        </div>
                        {enrollment && (
                          <Tag color={enrollment.status === 'completed' ? 'success' : 'processing'}>
                            {enrollment.status === 'completed'
                              ? 'Завершён'
                              : `${enrollment.progressPercent}%`}
                          </Tag>
                        )}
                      </Space>
                    </Checkbox>
                  </List.Item>
                );
              }}
            />
          </Checkbox.Group>
        )}
      </Modal>
    </div>
  );
}
