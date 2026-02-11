'use client';

import React, { useEffect, useState } from 'react';
import {
  Card,
  Table,
  Typography,
  Button,
  Space,
  Tag,
  Avatar,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  message,
  Tabs,
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  UserOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import api from '@/lib/api';
import type { Submission, HomeworkAssignment, Review } from '@/types';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

const statusLabels: Record<string, { label: string; color: string }> = {
  submitted: { label: 'На проверке', color: 'processing' },
  in_review: { label: 'Проверяется', color: 'processing' },
  needs_revision: { label: 'Нужна доработка', color: 'warning' },
  accepted: { label: 'Принято', color: 'success' },
  rejected: { label: 'Отклонено', color: 'error' },
};

export default function AdminHomeworkReviewPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/homework/submissions/all');
      const arr = Array.isArray(data) ? data : (data?.data || []);
      setSubmissions(arr);
    } catch {
      setSubmissions([]);
      message.error('Ошибка загрузки работ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const pendingSubmissions = submissions.filter(
    (s) => s.status === 'submitted' || s.status === 'in_review'
  );
  const reviewedSubmissions = submissions.filter(
    (s) => s.status === 'accepted' || s.status === 'rejected' || s.status === 'needs_revision'
  );

  const handleReview = (submission: Submission) => {
    setSelectedSubmission(submission);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleSubmitReview = async (values: { verdict: string; score?: number; comment: string }) => {
    if (!selectedSubmission) return;

    setSubmitting(true);
    try {
      await api.post<Review>(`/homework/submissions/${selectedSubmission.id}/reviews`, values);
      message.success('Оценка сохранена');
      setIsModalOpen(false);
      fetchSubmissions();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Ошибка при сохранении');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      title: 'Студент',
      key: 'student',
      render: (_: any, record: Submission) => (
        <Space>
          <Avatar src={record.student?.avatar} icon={<UserOutlined />} />
          <div>
            <div style={{ fontWeight: 500 }}>
              {record.student?.firstName} {record.student?.lastName}
            </div>
            <div style={{ color: '#666', fontSize: 12 }}>{record.student?.email}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Задание',
      dataIndex: ['assignment', 'title'],
      key: 'assignment',
    },
    {
      title: 'Попытка',
      dataIndex: 'attempt',
      key: 'attempt',
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
      title: 'Отправлено',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).format('DD.MM.YYYY HH:mm'),
    },
    {
      title: 'Оценка',
      key: 'score',
      render: (_: any, record: Submission) => {
        const lastReview = record.reviews?.[record.reviews.length - 1];
        if (!lastReview?.score) return '-';
        return (
          <Text>
            {lastReview.score}
            {record.assignment?.maxScore && ` / ${record.assignment.maxScore}`}
          </Text>
        );
      },
    },
    {
      title: 'Действия',
      key: 'actions',
      render: (_: any, record: Submission) => (
        <Space>
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => handleReview(record)}
          >
            {record.status === 'submitted' ? 'Проверить' : 'Просмотр'}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={3} style={{ marginBottom: 24 }}>
        Проверка домашних заданий
      </Title>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'pending',
            label: `На проверке (${pendingSubmissions.length})`,
          },
          {
            key: 'reviewed',
            label: `Проверенные (${reviewedSubmissions.length})`,
          },
        ]}
      />

      <Card>
        <Table
          dataSource={activeTab === 'pending' ? pendingSubmissions : reviewedSubmissions}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={`Проверка: ${selectedSubmission?.assignment?.title || 'Задание'}`}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={700}
      >
        {selectedSubmission && (
          <div>
            <Card size="small" style={{ marginBottom: 16 }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Text strong>Студент: </Text>
                  <Text>
                    {selectedSubmission.student?.firstName}{' '}
                    {selectedSubmission.student?.lastName}
                  </Text>
                </div>
                <div>
                  <Text strong>Отправлено: </Text>
                  <Text>
                    {dayjs(selectedSubmission.createdAt).format('DD.MM.YYYY HH:mm')}
                  </Text>
                </div>
                {selectedSubmission.assignment?.maxScore && (
                  <div>
                    <Text strong>Максимальный балл: </Text>
                    <Text>{selectedSubmission.assignment.maxScore}</Text>
                  </div>
                )}
              </Space>
            </Card>

            <Card
              size="small"
              title="Ответ студента"
              style={{ marginBottom: 16 }}
            >
              {selectedSubmission.content ? (
                <Paragraph style={{ whiteSpace: 'pre-wrap' }}>
                  {selectedSubmission.content}
                </Paragraph>
              ) : (
                <Text type="secondary">Текст не добавлен</Text>
              )}
              {selectedSubmission.attachmentUrls &&
                selectedSubmission.attachmentUrls.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    <Text strong>Прикреплённые файлы:</Text>
                    {selectedSubmission.attachmentUrls.map((url, index) => (
                      <div key={index}>
                        <a href={url} target="_blank" rel="noopener noreferrer">
                          Файл {index + 1}
                        </a>
                      </div>
                    ))}
                  </div>
                )}
            </Card>

            {(selectedSubmission.status === 'submitted' ||
              selectedSubmission.status === 'in_review') && (
              <Form form={form} layout="vertical" onFinish={handleSubmitReview}>
                <Form.Item
                  name="verdict"
                  label="Вердикт"
                  rules={[{ required: true, message: 'Выберите вердикт' }]}
                >
                  <Select
                    options={[
                      {
                        value: 'accepted',
                        label: (
                          <Space>
                            <CheckCircleOutlined style={{ color: '#52c41a' }} />
                            Принято
                          </Space>
                        ),
                      },
                      {
                        value: 'needs_revision',
                        label: (
                          <Space>
                            <ExclamationCircleOutlined style={{ color: '#faad14' }} />
                            Нужна доработка
                          </Space>
                        ),
                      },
                      {
                        value: 'rejected',
                        label: (
                          <Space>
                            <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
                            Отклонено
                          </Space>
                        ),
                      },
                    ]}
                  />
                </Form.Item>
                <Form.Item name="score" label="Оценка (баллы)">
                  <InputNumber
                    min={0}
                    max={selectedSubmission.assignment?.maxScore || 100}
                    style={{ width: 120 }}
                  />
                </Form.Item>
                <Form.Item
                  name="comment"
                  label="Комментарий"
                  rules={[{ required: true, message: 'Добавьте комментарий' }]}
                >
                  <TextArea rows={4} placeholder="Ваш отзыв о работе..." />
                </Form.Item>
                <Form.Item style={{ marginBottom: 0 }}>
                  <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                    <Button onClick={() => setIsModalOpen(false)}>Отмена</Button>
                    <Button type="primary" htmlType="submit" loading={submitting}>
                      Сохранить оценку
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            )}

            {selectedSubmission.reviews && selectedSubmission.reviews.length > 0 && (
              <Card size="small" title="История проверок" style={{ marginTop: 16 }}>
                {selectedSubmission.reviews.map((review) => (
                  <div key={review.id} style={{ marginBottom: 12 }}>
                    <Space>
                      <Tag color={statusLabels[review.verdict]?.color}>
                        {statusLabels[review.verdict]?.label}
                      </Tag>
                      {review.score !== undefined && (
                        <Text strong>Оценка: {review.score}</Text>
                      )}
                      <Text type="secondary">
                        {dayjs(review.createdAt).format('DD.MM.YYYY HH:mm')}
                      </Text>
                    </Space>
                    <Paragraph style={{ marginTop: 4, marginBottom: 0 }}>
                      {review.comment}
                    </Paragraph>
                  </div>
                ))}
              </Card>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
