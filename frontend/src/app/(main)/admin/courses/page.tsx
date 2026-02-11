'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  Table,
  Typography,
  Button,
  Space,
  Input,
  Tag,
  Modal,
  Form,
  Select,
  InputNumber,
  message,
  Popconfirm,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  SendOutlined,
  ToolOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import dayjs from 'dayjs';
import api from '@/lib/api';
import type { Course, PaginatedResponse } from '@/types';

const { Title } = Typography;
const { TextArea } = Input;

const statusLabels: Record<string, { label: string; color: string }> = {
  draft: { label: 'Черновик', color: 'default' },
  published: { label: 'Опубликован', color: 'success' },
  archived: { label: 'В архиве', color: 'warning' },
};

const accessTypeLabels: Record<string, string> = {
  free: 'Бесплатный',
  paid: 'Платный',
  internal: 'Для сотрудников',
};

export default function AdminCoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState('');

  // Create modal - simple title only
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createForm] = Form.useForm();

  // Edit modal - full settings
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editForm] = Form.useForm();

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const { data } = await api.get<PaginatedResponse<Course>>('/courses/admin', {
        params: { limit: 100 },
      });
      setCourses(data.data);
    } catch {
      message.error('Ошибка загрузки курсов');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const filteredCourses = courses.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  // Create course and redirect to builder
  const handleCreate = async (values: { title: string }) => {
    setCreating(true);
    try {
      const { data } = await api.post<Course>('/courses', {
        title: values.title,
        accessType: 'free',
      });
      message.success('Курс создан! Переход в редактор...');
      setCreateModalOpen(false);
      createForm.resetFields();
      // Redirect to Course Builder
      router.push(`/admin/courses/${data.id}/builder`);
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Ошибка при создании курса');
    } finally {
      setCreating(false);
    }
  };

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    editForm.setFieldsValue({
      title: course.title,
      description: course.description,
      category: course.category,
      accessType: course.accessType,
      price: course.price,
      durationMinutes: course.durationMinutes,
    });
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (values: any) => {
    if (!editingCourse) return;
    try {
      const { data } = await api.put<Course>(`/courses/${editingCourse.id}`, values);
      setCourses((prev) => prev.map((c) => (c.id === editingCourse.id ? data : c)));
      message.success('Курс обновлён');
      setEditModalOpen(false);
      editForm.resetFields();
      setEditingCourse(null);
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Ошибка при сохранении');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/courses/${id}`);
      setCourses((prev) => prev.filter((c) => c.id !== id));
      message.success('Курс удалён');
    } catch {
      message.error('Ошибка при удалении');
    }
  };

  const handlePublish = async (id: string) => {
    try {
      await api.patch(`/courses/${id}/publish`);
      fetchCourses();
      message.success('Курс опубликован');
    } catch {
      message.error('Ошибка при публикации');
    }
  };

  const handleArchive = async (id: string) => {
    try {
      await api.patch(`/courses/${id}/archive`);
      fetchCourses();
      message.success('Курс отправлен в архив');
    } catch {
      message.error('Ошибка при архивации');
    }
  };

  const columns = [
    {
      title: 'Название',
      dataIndex: 'title',
      key: 'title',
      render: (title: string, record: Course) => (
        <Link href={`/admin/courses/${record.id}/builder`}>
          <strong>{title}</strong>
        </Link>
      ),
    },
    {
      title: 'Категория',
      dataIndex: 'category',
      key: 'category',
      render: (cat: string) => cat || '-',
    },
    {
      title: 'Доступ',
      dataIndex: 'accessType',
      key: 'accessType',
      render: (type: string) => accessTypeLabels[type] || type,
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={statusLabels[status]?.color}>
          {statusLabels[status]?.label || status}
        </Tag>
      ),
    },
    {
      title: 'Создан',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).format('DD.MM.YYYY'),
    },
    {
      title: 'Действия',
      key: 'actions',
      width: 200,
      render: (_: any, record: Course) => (
        <Space size="small">
          <Link href={`/admin/courses/${record.id}/builder`}>
            <Button type="primary" size="small" icon={<ToolOutlined />}>
              Редактор
            </Button>
          </Link>
          <Link href={`/courses/${record.id}`}>
            <Button type="text" size="small" icon={<EyeOutlined />} title="Просмотр" />
          </Link>
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            title="Настройки"
          />
          {record.status === 'draft' && (
            <Button
              type="text"
              size="small"
              icon={<SendOutlined />}
              onClick={() => handlePublish(record.id)}
              title="Опубликовать"
            />
          )}
          {record.status === 'draft' && (
            <Popconfirm
              title="Удалить курс?"
              onConfirm={() => handleDelete(record.id)}
            >
              <Button type="text" size="small" danger icon={<DeleteOutlined />} title="Удалить" />
            </Popconfirm>
          )}
          {record.status === 'published' && (
            <Popconfirm
              title="Отправить в архив?"
              onConfirm={() => handleArchive(record.id)}
            >
              <Button type="text" size="small" icon={<DeleteOutlined />} title="В архив" />
            </Popconfirm>
          )}
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
          Управление курсами
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setCreateModalOpen(true)}
          size="large"
        >
          Создать курс
        </Button>
      </div>

      <Card>
        <Input
          prefix={<SearchOutlined />}
          placeholder="Поиск по названию..."
          allowClear
          style={{ marginBottom: 16, width: 300 }}
          onChange={(e) => setSearch(e.target.value)}
        />

        <Table
          dataSource={filteredCourses}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Create Course Modal - Simple */}
      <Modal
        title="Создать новый курс"
        open={createModalOpen}
        onCancel={() => setCreateModalOpen(false)}
        footer={null}
        width={500}
      >
        <Form form={createForm} layout="vertical" onFinish={handleCreate}>
          <Form.Item
            name="title"
            label="Название курса"
            rules={[{ required: true, message: 'Введите название курса' }]}
          >
            <Input
              placeholder="Например: Основы TypeScript"
              size="large"
              autoFocus
            />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setCreateModalOpen(false)}>
                Отмена
              </Button>
              <Button type="primary" htmlType="submit" loading={creating} size="large">
                Создать и перейти в редактор
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Course Modal - Full Settings */}
      <Modal
        title="Настройки курса"
        open={editModalOpen}
        onCancel={() => {
          setEditModalOpen(false);
          setEditingCourse(null);
        }}
        footer={null}
        width={600}
      >
        <Form form={editForm} layout="vertical" onFinish={handleEditSubmit}>
          <Form.Item
            name="title"
            label="Название"
            rules={[{ required: true, message: 'Введите название' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Описание">
            <TextArea rows={4} />
          </Form.Item>
          <Form.Item name="category" label="Категория">
            <Input placeholder="Например: Программирование" />
          </Form.Item>
          <Space style={{ width: '100%' }}>
            <Form.Item
              name="accessType"
              label="Тип доступа"
              style={{ width: 200 }}
            >
              <Select
                options={[
                  { value: 'free', label: 'Бесплатный' },
                  { value: 'paid', label: 'Платный' },
                  { value: 'internal', label: 'Для сотрудников' },
                ]}
              />
            </Form.Item>
            <Form.Item name="price" label="Цена" style={{ width: 120 }}>
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          </Space>
          <Form.Item name="durationMinutes" label="Длительность (мин)">
            <InputNumber min={1} style={{ width: 120 }} />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => {
                setEditModalOpen(false);
                setEditingCourse(null);
              }}>
                Отмена
              </Button>
              <Button type="primary" htmlType="submit">
                Сохранить
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
