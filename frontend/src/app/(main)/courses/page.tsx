'use client';

import React, { useEffect, useState } from 'react';
import {
  Row,
  Col,
  Card,
  Input,
  Select,
  Typography,
  Spin,
  Empty,
  Tag,
  Button,
  Space,
} from 'antd';
import {
  SearchOutlined,
  ClockCircleOutlined,
  BookOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import api from '@/lib/api';
import type { Course, PaginatedResponse } from '@/types';

const { Title, Text, Paragraph } = Typography;

const accessTypeLabels: Record<string, { label: string; color: string }> = {
  free: { label: 'Бесплатно', color: 'green' },
  paid: { label: 'Платный', color: 'gold' },
  internal: { label: 'Для сотрудников', color: 'blue' },
};

const statusLabels: Record<string, { label: string; color: string }> = {
  draft: { label: 'Черновик', color: 'default' },
  published: { label: 'Опубликован', color: 'success' },
  archived: { label: 'В архиве', color: 'warning' },
};

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [accessType, setAccessType] = useState<string | undefined>(undefined);
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [categories, setCategories] = useState<string[]>([]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = {
        page,
        limit: 12,
        status: 'published',
      };
      if (search) params.search = search;
      if (accessType) params.accessType = accessType;
      if (category) params.category = category;

      const { data } = await api.get<PaginatedResponse<Course>>('/courses', { params });
      setCourses(data.data);
      setTotal(data.meta.total);

      // Extract unique categories
      const uniqueCategories = Array.from(new Set(data.data.map((c) => c.category).filter(Boolean))) as string[];
      if (uniqueCategories.length > categories.length) {
        setCategories(uniqueCategories);
      }
    } catch {
      // use empty state
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [page, search, accessType, category]);

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} мин`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours} ч ${mins} мин` : `${hours} ч`;
  };

  return (
    <div>
      <Title level={3} style={{ marginBottom: 24 }}>
        Каталог курсов
      </Title>

      <Space wrap style={{ marginBottom: 24, width: '100%' }}>
        <Input
          prefix={<SearchOutlined />}
          placeholder="Поиск курсов..."
          allowClear
          style={{ width: 300 }}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
        />
        <Select
          placeholder="Тип доступа"
          allowClear
          style={{ width: 180 }}
          onChange={(val) => {
            setPage(1);
            setAccessType(val);
          }}
          options={[
            { value: 'free', label: 'Бесплатные' },
            { value: 'paid', label: 'Платные' },
            { value: 'internal', label: 'Для сотрудников' },
          ]}
        />
        {categories.length > 0 && (
          <Select
            placeholder="Категория"
            allowClear
            style={{ width: 180 }}
            onChange={(val) => {
              setPage(1);
              setCategory(val);
            }}
            options={categories.map((c) => ({ value: c, label: c }))}
          />
        )}
      </Space>

      <Spin spinning={loading}>
        {courses.length === 0 && !loading ? (
          <Empty description="Курсы не найдены" />
        ) : (
          <Row gutter={[24, 24]}>
            {courses.map((course) => (
              <Col key={course.id} xs={24} sm={12} lg={8} xl={6}>
                <Link href={`/courses/${course.id}`}>
                  <Card
                    hoverable
                    cover={
                      course.coverImage ? (
                        <img
                          alt={course.title}
                          src={course.coverImage}
                          style={{ height: 160, objectFit: 'cover' }}
                        />
                      ) : (
                        <div
                          style={{
                            height: 160,
                            background: 'linear-gradient(135deg, #1677ff 0%, #69b1ff 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <BookOutlined style={{ fontSize: 48, color: '#fff' }} />
                        </div>
                      )
                    }
                  >
                    <Space direction="vertical" size={8} style={{ width: '100%' }}>
                      <Space>
                        <Tag color={accessTypeLabels[course.accessType]?.color}>
                          {accessTypeLabels[course.accessType]?.label}
                        </Tag>
                        {course.category && <Tag>{course.category}</Tag>}
                      </Space>
                      <Text strong style={{ fontSize: 16 }}>
                        {course.title}
                      </Text>
                      <Paragraph
                        type="secondary"
                        ellipsis={{ rows: 2 }}
                        style={{ marginBottom: 8 }}
                      >
                        {course.description || 'Нет описания'}
                      </Paragraph>
                      <Space>
                        <ClockCircleOutlined />
                        <Text type="secondary">{formatDuration(course.durationMinutes)}</Text>
                        {course.accessType === 'paid' && course.price > 0 && (
                          <Text strong style={{ color: '#faad14' }}>
                            {course.price} {course.currency}
                          </Text>
                        )}
                      </Space>
                    </Space>
                  </Card>
                </Link>
              </Col>
            ))}
          </Row>
        )}
      </Spin>

      {total > 12 && (
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Button
            disabled={page * 12 >= total}
            onClick={() => setPage((p) => p + 1)}
          >
            Загрузить ещё
          </Button>
        </div>
      )}
    </div>
  );
}
