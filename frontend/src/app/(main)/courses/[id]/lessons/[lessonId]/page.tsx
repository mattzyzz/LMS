'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Card,
  Typography,
  Button,
  Space,
  Spin,
  message,
  Divider,
  Steps,
  Progress,
} from 'antd';
import {
  LeftOutlined,
  RightOutlined,
  CheckCircleOutlined,
  BookOutlined,
  FormOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import api from '@/lib/api';
import ContentBlockRenderer from '@/components/ContentBlockRenderer';
import CommentSection from '@/components/CommentSection';
import type { Course, Lesson, Enrollment, LessonProgress, HomeworkAssignment, Quiz } from '@/types';

const { Title, Text } = Typography;

interface LessonWithDetails extends Lesson {
  contentBlocks?: any[];
}

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const lessonId = params.lessonId as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [lesson, setLesson] = useState<LessonWithDetails | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [lessonProgress, setLessonProgress] = useState<Record<string, boolean>>({});
  const [homework, setHomework] = useState<HomeworkAssignment[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);

  const allLessons = course?.modules
    ?.flatMap((m) =>
      (m.lessons || []).map((l) => ({ ...l, moduleTitle: m.title }))
    )
    .sort((a, b) => a.sortOrder - b.sortOrder) || [];

  const currentIndex = allLessons.findIndex((l) => l.id === lessonId);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch course
        const { data: courseData } = await api.get<Course>(`/courses/${courseId}`);
        setCourse(courseData);

        // Fetch lesson with content blocks
        const { data: lessonData } = await api.get<LessonWithDetails>(
          `/courses/lessons/${lessonId}`
        );
        setLesson(lessonData);

        const toArray = (d: any) => Array.isArray(d) ? d : (d?.data || []);

        // Fetch enrollment
        try {
          const { data: enrollmentData } = await api.get<Enrollment>(
            `/enrollments/my/course/${courseId}`
          );
          setEnrollment(enrollmentData);

          // Get lesson progress
          const { data: progressData } = await api.get(
            `/enrollments/${enrollmentData.id}/progress`
          );
          const progressArr = toArray(progressData);
          const progressMap: Record<string, boolean> = {};
          progressArr.forEach((p: LessonProgress) => {
            progressMap[p.lessonId] = p.isCompleted;
          });
          setLessonProgress(progressMap);
        } catch {
          // Not enrolled
        }

        // Fetch homework for this lesson
        try {
          const { data: hwData } = await api.get(`/homework/lesson/${lessonId}`);
          setHomework(toArray(hwData));
        } catch {
          // No homework
        }

        // Fetch quizzes for this lesson
        try {
          const { data: quizData } = await api.get(`/quizzes/lesson/${lessonId}`);
          setQuizzes(toArray(quizData));
        } catch {
          // No quizzes
        }
      } catch {
        message.error('Не удалось загрузить урок');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId, lessonId]);

  const handleComplete = async () => {
    if (!enrollment) return;

    setCompleting(true);
    try {
      await api.patch(`/enrollments/${enrollment.id}/progress`, {
        lessonId,
        isCompleted: true,
      });
      setLessonProgress((prev) => ({ ...prev, [lessonId]: true }));
      message.success('Урок завершён!');

      // Move to next lesson
      if (nextLesson) {
        router.push(`/courses/${courseId}/lessons/${nextLesson.id}`);
      }
    } catch {
      message.error('Ошибка при сохранении прогресса');
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!lesson || !course) {
    return <div>Урок не найден</div>;
  }

  const isCompleted = lessonProgress[lessonId];
  const completedCount = Object.values(lessonProgress).filter(Boolean).length;
  const progressPercent = allLessons.length > 0
    ? Math.round((completedCount / allLessons.length) * 100)
    : 0;

  return (
    <div>
      {/* Course navigation */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Link href={`/courses/${courseId}`}>
            <Button icon={<LeftOutlined />}>К курсу</Button>
          </Link>
          <Space>
            <Text type="secondary">
              Урок {currentIndex + 1} из {allLessons.length}
            </Text>
            <Progress
              percent={progressPercent}
              size="small"
              style={{ width: 100 }}
            />
          </Space>
        </Space>
      </Card>

      {/* Lesson content */}
      <Card>
        <Space direction="vertical" size={24} style={{ width: '100%' }}>
          <div>
            <Text type="secondary">{(lesson as any).moduleTitle || 'Модуль'}</Text>
            <Title level={2} style={{ marginTop: 8, marginBottom: 0 }}>
              {lesson.title}
            </Title>
            {lesson.description && (
              <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
                {lesson.description}
              </Text>
            )}
          </div>

          <Divider />

          {/* Content blocks */}
          {lesson.contentBlocks && lesson.contentBlocks.length > 0 ? (
            <ContentBlockRenderer blocks={lesson.contentBlocks} />
          ) : (
            <Text type="secondary">Содержимое урока пока не добавлено</Text>
          )}

          {/* Homework section */}
          {homework.length > 0 && (
            <>
              <Divider />
              <div>
                <Title level={4}>
                  <FormOutlined /> Домашнее задание
                </Title>
                {homework.map((hw) => (
                  <Card key={hw.id} size="small" style={{ marginTop: 8 }}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Text strong>{hw.title}</Text>
                      <Text type="secondary">{hw.description}</Text>
                      <Link href={`/homework/${hw.id}`}>
                        <Button type="primary">Выполнить задание</Button>
                      </Link>
                    </Space>
                  </Card>
                ))}
              </div>
            </>
          )}

          {/* Quiz section */}
          {quizzes.length > 0 && (
            <>
              <Divider />
              <div>
                <Title level={4}>
                  <BookOutlined /> Тесты
                </Title>
                {quizzes.map((quiz) => (
                  <Card key={quiz.id} size="small" style={{ marginTop: 8 }}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Text strong>{quiz.title}</Text>
                      {quiz.description && (
                        <Text type="secondary">{quiz.description}</Text>
                      )}
                      <Text type="secondary">
                        {quiz.questions?.length || 0} вопросов
                        {quiz.timeLimitMinutes && ` • ${quiz.timeLimitMinutes} мин`}
                        {` • Проходной балл: ${quiz.passingScore}%`}
                      </Text>
                      <Link href={`/courses/${courseId}/quizzes/${quiz.id}`}>
                        <Button type="primary">Пройти тест</Button>
                      </Link>
                    </Space>
                  </Card>
                ))}
              </div>
            </>
          )}

          <Divider />

          {/* Navigation and complete */}
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            {prevLesson ? (
              <Link href={`/courses/${courseId}/lessons/${prevLesson.id}`}>
                <Button icon={<LeftOutlined />}>
                  {prevLesson.title}
                </Button>
              </Link>
            ) : (
              <div />
            )}

            {enrollment && (
              <Button
                type="primary"
                size="large"
                icon={isCompleted ? <CheckCircleOutlined /> : <RightOutlined />}
                loading={completing}
                onClick={isCompleted && nextLesson ? () => router.push(`/courses/${courseId}/lessons/${nextLesson.id}`) : handleComplete}
              >
                {isCompleted
                  ? nextLesson
                    ? 'Следующий урок'
                    : 'Урок завершён'
                  : 'Завершить урок'}
              </Button>
            )}

            {nextLesson && !enrollment && (
              <Link href={`/courses/${courseId}/lessons/${nextLesson.id}`}>
                <Button type="primary">
                  {nextLesson.title} <RightOutlined />
                </Button>
              </Link>
            )}
          </Space>
        </Space>
      </Card>

      {/* Comments */}
      <Card style={{ marginTop: 24 }} title="Комментарии к уроку">
        <CommentSection lessonId={lessonId} />
      </Card>
    </div>
  );
}
