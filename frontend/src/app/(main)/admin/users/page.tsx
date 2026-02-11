'use client';

import React, { useEffect, useState } from 'react';
import {
  Card,
  Table,
  Typography,
  Button,
  Space,
  Input,
  Tag,
  Avatar,
  Modal,
  Form,
  Select,
  message,
  Popconfirm,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import api from '@/lib/api';
import type { User, Department } from '@/types';

const { Title } = Typography;

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const toArray = (d: any) => Array.isArray(d) ? d : (d?.data || []);
      try {
        const [usersRes, deptsRes] = await Promise.all([
          api.get('/users'),
          api.get('/departments').catch(() => ({ data: [] })),
        ]);
        setUsers(toArray(usersRes.data));
        setDepartments(toArray(deptsRes.data));
      } catch {
        setUsers([]);
        message.error('Ошибка загрузки данных');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredUsers = users.filter(
    (u) =>
      u.firstName.toLowerCase().includes(search.toLowerCase()) ||
      u.lastName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = () => {
    setEditingUser(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    form.setFieldsValue({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      departmentId: user.department?.id,
      isActive: user.isActive,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/users/${id}`);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      message.success('Пользователь удалён');
    } catch {
      message.error('Ошибка при удалении');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingUser) {
        const { data } = await api.patch<User>(`/users/${editingUser.id}`, values);
        setUsers((prev) => prev.map((u) => (u.id === editingUser.id ? data : u)));
        message.success('Пользователь обновлён');
      } else {
        const { data } = await api.post<User>('/users', values);
        setUsers((prev) => [...prev, data]);
        message.success('Пользователь создан');
      }
      setIsModalOpen(false);
      form.resetFields();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Ошибка при сохранении');
    }
  };

  const columns = [
    {
      title: 'Пользователь',
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
      title: 'Роль',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <Tag color={role === 'hrd' ? 'purple' : 'blue'}>
          {role === 'hrd' ? 'HRD' : 'Сотрудник'}
        </Tag>
      ),
    },
    {
      title: 'Отдел',
      dataIndex: ['department', 'name'],
      key: 'department',
    },
    {
      title: 'Статус',
      key: 'isActive',
      render: (_: any, record: User) =>
        record.isActive ? (
          <Tag color="success">Активен</Tag>
        ) : (
          <Tag color="default">Неактивен</Tag>
        ),
    },
    {
      title: 'Дата регистрации',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).format('DD.MM.YYYY'),
    },
    {
      title: 'Действия',
      key: 'actions',
      render: (_: any, record: User) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Удалить пользователя?"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

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
        <Title level={3} style={{ margin: 0 }}>
          Управление пользователями
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          Добавить пользователя
        </Button>
      </div>

      <Card>
        <Input
          prefix={<SearchOutlined />}
          placeholder="Поиск по имени или email..."
          allowClear
          style={{ marginBottom: 16, width: 300 }}
          onChange={(e) => setSearch(e.target.value)}
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
        title={editingUser ? 'Редактировать пользователя' : 'Новый пользователь'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="firstName"
            label="Имя"
            rules={[{ required: true, message: 'Введите имя' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="lastName"
            label="Фамилия"
            rules={[{ required: true, message: 'Введите фамилию' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Введите email' },
              { type: 'email', message: 'Некорректный email' },
            ]}
          >
            <Input />
          </Form.Item>
          {!editingUser && (
            <Form.Item
              name="password"
              label="Пароль"
              rules={[{ required: true, message: 'Введите пароль' }]}
            >
              <Input.Password />
            </Form.Item>
          )}
          <Form.Item name="role" label="Роль" initialValue="employee">
            <Select
              placeholder="Выберите роль"
              options={[
                { value: 'hrd', label: 'HRD / Администратор' },
                { value: 'employee', label: 'Сотрудник' },
              ]}
            />
          </Form.Item>
          <Form.Item name="departmentId" label="Отдел">
            <Select
              allowClear
              placeholder="Выберите отдел"
              options={departments.map((d) => ({ value: d.id, label: d.name }))}
            />
          </Form.Item>
          <Form.Item name="isActive" label="Статус" initialValue={true}>
            <Select
              options={[
                { value: true, label: 'Активен' },
                { value: false, label: 'Неактивен' },
              ]}
            />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setIsModalOpen(false)}>Отмена</Button>
              <Button type="primary" htmlType="submit">
                {editingUser ? 'Сохранить' : 'Создать'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
