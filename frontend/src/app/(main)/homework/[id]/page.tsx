'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Card,
  Typography,
  Button,
  Space,
  Input,
  Upload,
  message,
  Tag,
  Spin,
  Alert,
  Timeline,
  Divider,
  Avatar,
} from 'antd';
import {
  LeftOutlined,
  UploadOutlined,
  SendOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  UserOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import dayjs from 'dayjs';
import api from '@/lib/api';
import type { HomeworkAssignment, Submission, Review } from '@/types';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const statusLabels: Record<string, { label: string; color: string }> = {
  submitted: { label: 'На проверке', color: 'processing' },
  in_review: { label: 'Проверяется', color: 'processing' },
  needs_revision: { label: 'Нужна доработка', color: 'warning' },
  accepted: { label: 'Принято', color: 'success' },
  rejected: { label: 'Отклонено', color: 'error' },
};

export default function HomeworkDetailPage() {
  const params = useParams();
  const router = useRouter();
  const assignmentId = params.id as string;

  const [assignment, setAssignment] = useState<HomeworkAssignment | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [content, setContent] = useState('');
  const [fileUrls, setFileUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch assignment
        const { data: assignmentData } = await api.get<HomeworkAssignment>(
          `/homework/${assignmentId}`
        );
        setAssignment(assignmentData);

        // Fetch my submission for this assignment
        try {
          const { data: submissionData } = await api.get<Submission>(
            `/homework/${assignmentId}/my-submission`
          );
          setSubmission(submissionData);
          if (submissionData.content) setContent(submissionData.content);
          if (submissionData.attachmentUrls) setFileUrls(submissionData.attachmentUrls);
        } catch {
          // No submission yet
        }
      } catch {
        message.error('Не удалось загрузить задание');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [assignmentId]);

  const handleSubmit = async () => {
    if (!content.trim() && fileUrls.length === 0) {
      message.warning('Добавьте текст или файлы');
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await api.post<Submission>(`/homework/${assignmentId}/submissions`, {
        content: content.trim(),
        attachmentUrls: fileUrls,
      });
      setSubmission(data);
      message.success('Работа отправлена на проверку!');
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Ошибка при отправке');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResubmit = async () => {
    if (!content.trim() && fileUrls.length === 0) {
      message.warning('Добавьте текст или файлы');
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await api.patch<Submission>(`/homework/submissions/${submission?.id}`, {
        content: content.trim(),
        attachmentUrls: fileUrls,
      });
      setSubmission(data);
      message.success('Работа отправлена повторно!');
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Ошибка при отправке');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!assignment) {
    return <div>Задание не найдено</div>;
  }

  const isOverdue = assignment.deadline && dayjs(assignment.deadline).isBefore(dayjs());
  const canSubmit = !submission || submission.status === 'needs_revision';
  const isCompleted = submission?.status === 'accepted' || submission?.status === 'rejected';

  return (
    <div>
      <Link href="/homework">
        <Button icon={<LeftOutlined />} style={{ marginBottom: 16 }}>
          К списку заданий
        </Button>
      </Link>

      {/* Assignment info */}
      <Card style={{ marginBottom: 24 }}>
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          <div>
            <Space>
              <Title level={3} style={{ marginBottom: 0 }}>
                {assignment.title}
              </Title>
              {submission && (
                <Tag color={statusLabels[submission.status]?.color}>
                  {statusLabels[submission.status]?.label}
                </Tag>
              )}
            </Space>
          </div>

          <Paragraph>{assignment.description}</Paragraph>

          <Space split={<Divider type="vertical" />}>
            {assignment.deadline && (
              <Text type={isOverdue ? 'danger' : 'secondary'}>
                <ClockCircleOutlined /> Дедлайн:{' '}
                {dayjs(assignment.deadline).format('DD.MM.YYYY HH:mm')}
              </Text>
            )}
            {assignment.maxScore && (
              <Text type="secondary">Максимальный балл: {assignment.maxScore}</Text>
            )}
          </Space>
        </Space>
      </Card>

      {/* Submission form or status */}
      {canSubmit && !isCompleted ? (
        <Card title="Ваш ответ">
          {isOverdue && (
            <Alert
              message="Дедлайн прошёл"
              description="Вы можете отправить работу, но она может быть принята с пониженной оценкой."
              type="warning"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}

          {submission?.status === 'needs_revision' && (
            <Alert
              message="Требуется доработка"
              description="Проверьте комментарии ревьюера и внесите исправления."
              type="warning"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}

          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <div>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>
                Текст ответа
              </Text>
              <TextArea
                rows={6}
                placeholder="Введите ваш ответ..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>

            <div>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>
                Файлы (опционально)
              </Text>
              <Upload
                multiple
                beforeUpload={(file) => {
                  // Here you would upload to your storage and get URL
                  message.info('Загрузка файлов пока не реализована');
                  return false;
                }}
              >
                <Button icon={<UploadOutlined />}>Прикрепить файл</Button>
              </Upload>
            </div>

            <Button
              type="primary"
              size="large"
              icon={<SendOutlined />}
              loading={submitting}
              onClick={submission ? handleResubmit : handleSubmit}
            >
              {submission ? 'Отправить повторно' : 'Отправить на проверку'}
            </Button>
          </Space>
        </Card>
      ) : (
        <Card title="Ваш ответ">
          {submission && (
            <Space direction="vertical" size={16} style={{ width: '100%' }}>
              <div>
                <Text type="secondary">Отправлено: </Text>
                <Text>{dayjs(submission.createdAt).format('DD.MM.YYYY HH:mm')}</Text>
              </div>

              {submission.content && (
                <div>
                  <Text strong style={{ display: 'block', marginBottom: 8 }}>
                    Ваш текст:
                  </Text>
                  <Paragraph
                    style={{
                      background: '#f5f5f5',
                      padding: 16,
                      borderRadius: 8,
                    }}
                  >
                    {submission.content}
                  </Paragraph>
                </div>
              )}

              {submission.attachmentUrls && submission.attachmentUrls.length > 0 && (
                <div>
                  <Text strong style={{ display: 'block', marginBottom: 8 }}>
                    Прикреплённые файлы:
                  </Text>
                  <Space direction="vertical">
                    {submission.attachmentUrls.map((url, index) => (
                      <a key={index} href={url} target="_blank" rel="noopener noreferrer">
                        Файл {index + 1}
                      </a>
                    ))}
                  </Space>
                </div>
              )}
            </Space>
          )}
        </Card>
      )}

      {/* Reviews */}
      {submission?.reviews && submission.reviews.length > 0 && (
        <Card title="История проверок" style={{ marginTop: 24 }}>
          <Timeline
            items={submission.reviews.map((review) => ({
              color:
                review.verdict === 'accepted'
                  ? 'green'
                  : review.verdict === 'rejected'
                  ? 'red'
                  : 'orange',
              dot:
                review.verdict === 'accepted' ? (
                  <CheckCircleOutlined />
                ) : (
                  <ExclamationCircleOutlined />
                ),
              children: (
                <Card size="small">
                  <Space direction="vertical" size={8} style={{ width: '100%' }}>
                    <Space>
                      <Avatar
                        size="small"
                        src={review.reviewer?.avatar}
                        icon={<UserOutlined />}
                      />
                      <Text strong>
                        {review.reviewer?.firstName} {review.reviewer?.lastName}
                      </Text>
                      <Text type="secondary">
                        {dayjs(review.createdAt).format('DD.MM.YYYY HH:mm')}
                      </Text>
                    </Space>
                    <div>
                      <Tag color={statusLabels[review.verdict]?.color}>
                        {statusLabels[review.verdict]?.label}
                      </Tag>
                      {review.score !== undefined && (
                        <Text strong style={{ marginLeft: 8 }}>
                          Оценка: {review.score}
                          {assignment.maxScore && ` / ${assignment.maxScore}`}
                        </Text>
                      )}
                    </div>
                    {review.comment && <Paragraph>{review.comment}</Paragraph>}
                  </Space>
                </Card>
              ),
            }))}
          />
        </Card>
      )}
    </div>
  );
}
