'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Card,
  Typography,
  Button,
  Space,
  Tag,
  Collapse,
  List,
  Progress,
  Spin,
  message,
  Avatar,
  Divider,
  Row,
  Col,
  Statistic,
} from 'antd';
import {
  PlayCircleOutlined,
  ClockCircleOutlined,
  BookOutlined,
  CheckCircleOutlined,
  LockOutlined,
  FileTextOutlined,
  VideoCameraOutlined,
  QuestionCircleOutlined,
  UserOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import api from '@/lib/api';
import type { Course, Enrollment, LessonProgress } from '@/types';

const { Title, Text, Paragraph } = Typography;

const accessTypeLabels: Record<string, { label: string; color: string }> = {
  free: { label: 'Бесплатно', color: 'green' },
  paid: { label: 'Платный', color: 'gold' },
  internal: { label: 'Для сотрудников', color: 'blue' },
};

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [lessonProgress, setLessonProgress] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: courseData } = await api.get<Course>(`/courses/${courseId}`);
        setCourse(courseData);

        // Try to get enrollment
        try {
          const { data: enrollmentData } = await api.get<Enrollment>(
            `/enrollments/my/course/${courseId}`
          );
          setEnrollment(enrollmentData);

          // Get lesson progress
          const { data: progressData } = await api.get(
            `/enrollments/${enrollmentData.id}/progress`
          );
          const progressArr = Array.isArray(progressData) ? progressData : (progressData?.data || []);
          const progressMap: Record<string, boolean> = {};
          progressArr.forEach((p: LessonProgress) => {
            progressMap[p.lessonId] = p.isCompleted;
          });
          setLessonProgress(progressMap);
        } catch {
          // Not enrolled yet
        }
      } catch {
        message.error('Не удалось загрузить курс');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId]);

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      const { data } = await api.post<Enrollment>('/enrollments', { courseId });
      setEnrollment(data);
      message.success('Вы записаны на курс!');
    } catch {
      message.error('Не удалось записаться на курс');
    } finally {
      setEnrolling(false);
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} мин`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours} ч ${mins} мин` : `${hours} ч`;
  };

  const getTotalLessons = () => {
    return course?.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 0;
  };

  const getCompletedLessons = () => {
    return Object.values(lessonProgress).filter(Boolean).length;
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!course) {
    return <div>Курс не найден</div>;
  }

  return (
    <div>
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          {/* Course header */}
          <Card>
            <Space direction="vertical" size={16} style={{ width: '100%' }}>
              <Space>
                <Tag color={accessTypeLabels[course.accessType]?.color}>
                  {accessTypeLabels[course.accessType]?.label}
                </Tag>
                {course.category && <Tag>{course.category}</Tag>}
              </Space>

              <Title level={2} style={{ marginBottom: 0 }}>
                {course.title}
              </Title>

              <Paragraph style={{ fontSize: 16 }}>
                {course.description || 'Нет описания'}
              </Paragraph>

              <Space split={<Divider type="vertical" />}>
                <Space>
                  <Avatar src={course.author?.avatar} icon={<UserOutlined />} />
                  <Text>
                    {course.author?.firstName} {course.author?.lastName}
                  </Text>
                </Space>
                <Space>
                  <ClockCircleOutlined />
                  <Text>{formatDuration(course.durationMinutes)}</Text>
                </Space>
                <Space>
                  <BookOutlined />
                  <Text>{getTotalLessons()} уроков</Text>
                </Space>
              </Space>
            </Space>
          </Card>

          {/* Course program */}
          <Card style={{ marginTop: 24 }} title="Программа курса">
            {course.modules && course.modules.length > 0 ? (
              <Collapse
                defaultActiveKey={course.modules.map((m) => m.id)}
                items={course.modules
                  .sort((a, b) => a.sortOrder - b.sortOrder)
                  .map((module) => ({
                    key: module.id,
                    label: (
                      <Space>
                        <Text strong>{module.title}</Text>
                        <Text type="secondary">
                          ({module.lessons?.length || 0} уроков)
                        </Text>
                      </Space>
                    ),
                    children: (
                      <List
                        dataSource={module.lessons?.sort((a, b) => a.sortOrder - b.sortOrder)}
                        renderItem={(lesson) => {
                          const isCompleted = lessonProgress[lesson.id];
                          const canAccess = enrollment || lesson.isFree;

                          return (
                            <List.Item
                              actions={[
                                canAccess ? (
                                  <Link
                                    key="start"
                                    href={`/courses/${courseId}/lessons/${lesson.id}`}
                                  >
                                    <Button
                                      type={isCompleted ? 'default' : 'primary'}
                                      size="small"
                                      icon={
                                        isCompleted ? (
                                          <CheckCircleOutlined />
                                        ) : (
                                          <PlayCircleOutlined />
                                        )
                                      }
                                    >
                                      {isCompleted ? 'Повторить' : 'Начать'}
                                    </Button>
                                  </Link>
                                ) : (
                                  <Button
                                    key="locked"
                                    size="small"
                                    disabled
                                    icon={<LockOutlined />}
                                  >
                                    Заблокировано
                                  </Button>
                                ),
                              ]}
                            >
                              <List.Item.Meta
                                avatar={
                                  isCompleted ? (
                                    <CheckCircleOutlined
                                      style={{ fontSize: 20, color: '#52c41a' }}
                                    />
                                  ) : (
                                    <FileTextOutlined style={{ fontSize: 20 }} />
                                  )
                                }
                                title={
                                  <Space>
                                    <Text>{lesson.title}</Text>
                                    {lesson.isFree && !enrollment && (
                                      <Tag color="green">
                                        Бесплатно
                                      </Tag>
                                    )}
                                  </Space>
                                }
                                description={
                                  <Space>
                                    <ClockCircleOutlined />
                                    <Text type="secondary">
                                      {formatDuration(lesson.durationMinutes)}
                                    </Text>
                                  </Space>
                                }
                              />
                            </List.Item>
                          );
                        }}
                      />
                    ),
                  }))}
              />
            ) : (
              <Text type="secondary">Программа курса пока не опубликована</Text>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          {/* Enrollment card */}
          <Card>
            {course.coverImage ? (
              <img
                src={course.coverImage}
                alt={course.title}
                style={{ width: '100%', borderRadius: 8, marginBottom: 16 }}
              />
            ) : (
              <div
                style={{
                  height: 160,
                  background: 'linear-gradient(135deg, #1677ff 0%, #69b1ff 100%)',
                  borderRadius: 8,
                  marginBottom: 16,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <BookOutlined style={{ fontSize: 48, color: '#fff' }} />
              </div>
            )}

            {enrollment ? (
              <Space direction="vertical" size={16} style={{ width: '100%' }}>
                <div>
                  <Text type="secondary">Ваш прогресс</Text>
                  <Progress
                    percent={enrollment.progressPercent}
                    status={enrollment.status === 'completed' ? 'success' : 'active'}
                  />
                </div>

                <Row gutter={16}>
                  <Col span={12}>
                    <Statistic
                      title="Пройдено"
                      value={getCompletedLessons()}
                      suffix={`/ ${getTotalLessons()}`}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="Статус"
                      value={
                        enrollment.status === 'completed'
                          ? 'Завершён'
                          : enrollment.status === 'active'
                          ? 'В процессе'
                          : 'Отменён'
                      }
                    />
                  </Col>
                </Row>

                <Button
                  type="primary"
                  size="large"
                  block
                  icon={<PlayCircleOutlined />}
                  onClick={() => {
                    // Find first incomplete lesson
                    const firstIncomplete = course.modules
                      ?.flatMap((m) => m.lessons || [])
                      .sort((a, b) => a.sortOrder - b.sortOrder)
                      .find((l) => !lessonProgress[l.id]);
                    if (firstIncomplete) {
                      router.push(`/courses/${courseId}/lessons/${firstIncomplete.id}`);
                    }
                  }}
                >
                  Продолжить обучение
                </Button>
              </Space>
            ) : (
              <Space direction="vertical" size={16} style={{ width: '100%' }}>
                {course.accessType === 'paid' && course.price > 0 && (
                  <div style={{ textAlign: 'center' }}>
                    <Title level={2} style={{ margin: 0 }}>
                      {course.price} {course.currency}
                    </Title>
                  </div>
                )}

                <Button
                  type="primary"
                  size="large"
                  block
                  icon={<PlayCircleOutlined />}
                  loading={enrolling}
                  onClick={handleEnroll}
                >
                  {course.accessType === 'paid'
                    ? 'Купить курс'
                    : 'Начать обучение'}
                </Button>

                <Text type="secondary" style={{ display: 'block', textAlign: 'center' }}>
                  {getTotalLessons()} уроков • {formatDuration(course.durationMinutes)}
                </Text>
              </Space>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
