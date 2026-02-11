'use client';

import React, { useEffect, useState } from 'react';
import {
  Card,
  Typography,
  Tabs,
  List,
  Tag,
  Button,
  Space,
  Empty,
  Spin,
  Avatar,
} from 'antd';
import {
  FormOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import dayjs from 'dayjs';
import api from '@/lib/api';
import type { Submission, HomeworkAssignment } from '@/types';

const { Title, Text, Paragraph } = Typography;

const statusLabels: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  submitted: { label: 'На проверке', color: 'processing', icon: <ClockCircleOutlined /> },
  in_review: { label: 'Проверяется', color: 'processing', icon: <ClockCircleOutlined /> },
  needs_revision: { label: 'Нужна доработка', color: 'warning', icon: <ExclamationCircleOutlined /> },
  accepted: { label: 'Принято', color: 'success', icon: <CheckCircleOutlined /> },
  rejected: { label: 'Отклонено', color: 'error', icon: <ExclamationCircleOutlined /> },
};

export default function HomeworkPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [assignments, setAssignments] = useState<HomeworkAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      // Helper to extract array from response
      const toArray = (d: any) => Array.isArray(d) ? d : (d?.data || []);
      try {
        // Fetch my submissions
        const { data: submissionsData } = await api.get('/homework/submissions/my');
        setSubmissions(toArray(submissionsData));

        // Fetch available assignments (from enrolled courses)
        const { data: assignmentsData } = await api.get('/homework/my-assignments');
        setAssignments(toArray(assignmentsData));
      } catch {
        setSubmissions([]);
        setAssignments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Find assignments that haven't been submitted or need revision
  const pendingAssignments = assignments.filter((a) => {
    const submission = submissions.find((s) => s.assignmentId === a.id);
    return !submission || submission.status === 'needs_revision';
  });

  const completedSubmissions = submissions.filter(
    (s) => s.status === 'accepted' || s.status === 'rejected'
  );
  const inProgressSubmissions = submissions.filter(
    (s) => s.status === 'submitted' || s.status === 'in_review'
  );

  return (
    <div>
      <Title level={3} style={{ marginBottom: 24 }}>
        Домашние задания
      </Title>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'pending',
            label: `К выполнению (${pendingAssignments.length})`,
          },
          {
            key: 'in_progress',
            label: `На проверке (${inProgressSubmissions.length})`,
          },
          {
            key: 'completed',
            label: `Завершённые (${completedSubmissions.length})`,
          },
        ]}
      />

      <Spin spinning={loading}>
        {activeTab === 'pending' && (
          <>
            {pendingAssignments.length === 0 && !loading ? (
              <Empty description="Нет заданий к выполнению" />
            ) : (
              <List
                dataSource={pendingAssignments}
                renderItem={(assignment) => {
                  const existingSubmission = submissions.find(
                    (s) => s.assignmentId === assignment.id
                  );
                  const needsRevision = existingSubmission?.status === 'needs_revision';
                  const isOverdue = assignment.deadline && dayjs(assignment.deadline).isBefore(dayjs());

                  return (
                    <Card style={{ marginBottom: 16 }}>
                      <List.Item.Meta
                        avatar={
                          <Avatar
                            icon={<FormOutlined />}
                            style={{
                              background: needsRevision
                                ? '#faad14'
                                : isOverdue
                                ? '#ff4d4f'
                                : '#1677ff',
                            }}
                          />
                        }
                        title={
                          <Space>
                            <Text strong>{assignment.title}</Text>
                            {needsRevision && (
                              <Tag color="warning">Требует доработки</Tag>
                            )}
                            {isOverdue && !needsRevision && (
                              <Tag color="error">Просрочено</Tag>
                            )}
                          </Space>
                        }
                        description={
                          <Space direction="vertical" size={4}>
                            <Paragraph
                              type="secondary"
                              ellipsis={{ rows: 2 }}
                              style={{ marginBottom: 0 }}
                            >
                              {assignment.description}
                            </Paragraph>
                            <Space>
                              {assignment.deadline && (
                                <Text type={isOverdue ? 'danger' : 'secondary'}>
                                  <ClockCircleOutlined /> Дедлайн:{' '}
                                  {dayjs(assignment.deadline).format('DD.MM.YYYY HH:mm')}
                                </Text>
                              )}
                              {assignment.maxScore && (
                                <Text type="secondary">
                                  Макс. балл: {assignment.maxScore}
                                </Text>
                              )}
                            </Space>
                          </Space>
                        }
                      />
                      <div style={{ marginTop: 12, textAlign: 'right' }}>
                        <Link href={`/homework/${assignment.id}`}>
                          <Button type="primary">
                            {needsRevision ? 'Доработать' : 'Выполнить'}
                          </Button>
                        </Link>
                      </div>
                    </Card>
                  );
                }}
              />
            )}
          </>
        )}

        {activeTab === 'in_progress' && (
          <>
            {inProgressSubmissions.length === 0 && !loading ? (
              <Empty description="Нет заданий на проверке" />
            ) : (
              <List
                dataSource={inProgressSubmissions}
                renderItem={(submission) => (
                  <Card style={{ marginBottom: 16 }}>
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          icon={statusLabels[submission.status]?.icon}
                          style={{ background: '#1677ff' }}
                        />
                      }
                      title={
                        <Space>
                          <Text strong>
                            {submission.assignment?.title || 'Задание'}
                          </Text>
                          <Tag color={statusLabels[submission.status]?.color}>
                            {statusLabels[submission.status]?.label}
                          </Tag>
                        </Space>
                      }
                      description={
                        <Text type="secondary">
                          Отправлено:{' '}
                          {dayjs(submission.createdAt).format('DD.MM.YYYY HH:mm')}
                        </Text>
                      }
                    />
                    <div style={{ marginTop: 12, textAlign: 'right' }}>
                      <Link href={`/homework/${submission.assignmentId}`}>
                        <Button>Посмотреть</Button>
                      </Link>
                    </div>
                  </Card>
                )}
              />
            )}
          </>
        )}

        {activeTab === 'completed' && (
          <>
            {completedSubmissions.length === 0 && !loading ? (
              <Empty description="Нет завершённых заданий" />
            ) : (
              <List
                dataSource={completedSubmissions}
                renderItem={(submission) => (
                  <Card style={{ marginBottom: 16 }}>
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          icon={statusLabels[submission.status]?.icon}
                          style={{
                            background:
                              submission.status === 'accepted' ? '#52c41a' : '#ff4d4f',
                          }}
                        />
                      }
                      title={
                        <Space>
                          <Text strong>
                            {submission.assignment?.title || 'Задание'}
                          </Text>
                          <Tag color={statusLabels[submission.status]?.color}>
                            {statusLabels[submission.status]?.label}
                          </Tag>
                          {submission.reviews?.[0]?.score !== undefined && (
                            <Text strong>
                              Оценка: {submission.reviews[0].score}
                              {submission.assignment?.maxScore &&
                                ` / ${submission.assignment.maxScore}`}
                            </Text>
                          )}
                        </Space>
                      }
                      description={
                        <Text type="secondary">
                          Проверено:{' '}
                          {dayjs(submission.reviews?.[0]?.createdAt || submission.updatedAt).format(
                            'DD.MM.YYYY HH:mm'
                          )}
                        </Text>
                      }
                    />
                    <div style={{ marginTop: 12, textAlign: 'right' }}>
                      <Link href={`/homework/${submission.assignmentId}`}>
                        <Button>Посмотреть</Button>
                      </Link>
                    </div>
                  </Card>
                )}
              />
            )}
          </>
        )}
      </Spin>
    </div>
  );
}
