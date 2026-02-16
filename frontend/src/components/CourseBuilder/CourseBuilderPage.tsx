'use client';

import React, { useEffect, useCallback } from 'react';
import {
  Tabs,
  Spin,
  Button,
  Badge,
  Space,
  Typography,
  message,
  Popconfirm,
  Alert,
} from 'antd';
import {
  ArrowLeftOutlined,
  EyeOutlined,
  SendOutlined,
  InfoCircleOutlined,
  UnorderedListOutlined,
  SettingOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import { useCourseBuilderStore } from '@/stores/courseBuilder.store';
import type { BuilderTab } from '@/types/courseBuilder';
import CourseInfoForm from './CourseInfoForm';
import CourseSettingsForm from './CourseSettingsForm';
import CurriculumBuilder from './CurriculumBuilder/CurriculumBuilder';
import CourseEnrollments from './CourseEnrollments';
import { LessonDrawer } from './LessonEditor/LessonDrawer';
import { QuizDrawer } from './QuizEditor/QuizDrawer';
import { AssignmentDrawer } from './AssignmentEditor/AssignmentDrawer';

const { Title, Text } = Typography;

interface CourseBuilderPageProps {
  courseId: string;
}

const statusConfig: Record<string, { color: string; text: string }> = {
  draft: { color: 'default', text: 'Черновик' },
  published: { color: 'green', text: 'Опубликован' },
  archived: { color: 'red', text: 'Архив' },
};

const CourseBuilderPage: React.FC<CourseBuilderPageProps> = ({ courseId }) => {
  const {
    course,
    isLoading,
    isSaving,
    error,
    activeTab,
    drawer,
    fetchCourseBuilder,
    updateCourseInfo,
    setActiveTab,
    closeDrawer,
    reset,
  } = useCourseBuilderStore();

  useEffect(() => {
    fetchCourseBuilder(courseId);
    return () => {
      reset();
    };
  }, [courseId, fetchCourseBuilder, reset]);

  const handleSaveInfo = useCallback(
    async (data: Record<string, unknown>) => {
      await updateCourseInfo(courseId, data);
      message.success('Информация о курсе сохранена');
    },
    [courseId, updateCourseInfo],
  );

  const handleSaveSettings = useCallback(
    async (data: Record<string, unknown>) => {
      await updateCourseInfo(courseId, data);
      message.success('Настройки курса сохранены');
    },
    [courseId, updateCourseInfo],
  );

  const handlePublish = useCallback(async () => {
    await updateCourseInfo(courseId, { status: 'published' });
    message.success('Курс опубликован');
  }, [courseId, updateCourseInfo]);

  const handleTabChange = useCallback(
    (key: string) => {
      setActiveTab(key as BuilderTab);
    },
    [setActiveTab],
  );

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <Spin size="large" tip="Загрузка курса..." />
      </div>
    );
  }

  if (error && !course) {
    return (
      <Alert
        type="error"
        message="Ошибка загрузки"
        description={error}
        showIcon
        action={
          <Button onClick={() => fetchCourseBuilder(courseId)}>
            Повторить
          </Button>
        }
      />
    );
  }

  if (!course) {
    return (
      <Alert
        type="warning"
        message="Курс не найден"
        showIcon
      />
    );
  }

  const status = statusConfig[course.status] ?? statusConfig.draft;

  const tabItems = [
    {
      key: 'info',
      label: (
        <span>
          <InfoCircleOutlined /> Информация
        </span>
      ),
      children: <CourseInfoForm course={course} onSave={handleSaveInfo} />,
    },
    {
      key: 'curriculum',
      label: (
        <span>
          <UnorderedListOutlined /> Учебный план
        </span>
      ),
      children: <CurriculumBuilder />,
    },
    {
      key: 'settings',
      label: (
        <span>
          <SettingOutlined /> Настройки
        </span>
      ),
      children: <CourseSettingsForm course={course} onSave={handleSaveSettings} />,
    },
    {
      key: 'enrollments',
      label: (
        <span>
          <TeamOutlined /> Ученики
        </span>
      ),
      children: <CourseEnrollments courseId={courseId} />,
    },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <Space align="center">
          <Link href="/admin/courses">
            <Button type="text" icon={<ArrowLeftOutlined />} />
          </Link>
          <div>
            <Space align="center" size="middle">
              <Title level={4} style={{ margin: 0 }}>
                {course.title}
              </Title>
              <Badge
                color={status.color === 'default' ? 'grey' : status.color}
                text={<Text type="secondary">{status.text}</Text>}
              />
            </Space>
          </div>
        </Space>

        <Space>
          {isSaving && (
            <Text type="secondary">Сохранение...</Text>
          )}
          <Link href={`/courses/${courseId}`}>
            <Button icon={<EyeOutlined />}>Предпросмотр</Button>
          </Link>
          {course.status === 'draft' && (
            <Popconfirm
              title="Опубликовать курс?"
              description="Курс станет доступен для учеников"
              onConfirm={handlePublish}
              okText="Опубликовать"
              cancelText="Отмена"
            >
              <Button type="primary" icon={<SendOutlined />}>
                Опубликовать
              </Button>
            </Popconfirm>
          )}
        </Space>
      </div>

      {/* Tabs */}
      <Tabs
        activeKey={activeTab}
        onChange={handleTabChange}
        items={tabItems}
        size="large"
        style={{ minHeight: 500 }}
      />

      {/* Drawers for item editing */}
      {drawer.open && drawer.type === 'lesson' && drawer.itemId && (
        <LessonDrawer
          open={drawer.open}
          lessonId={drawer.itemId}
          onClose={closeDrawer}
          onSaved={() => {
            fetchCourseBuilder(courseId);
            closeDrawer();
          }}
        />
      )}

      {drawer.open && drawer.type === 'quiz' && drawer.itemId && drawer.topicId && (
        <QuizDrawer
          open={drawer.open}
          quizId={drawer.itemId}
          topicId={drawer.topicId}
          onClose={closeDrawer}
          onSaved={() => {
            fetchCourseBuilder(courseId);
            closeDrawer();
          }}
        />
      )}

      {drawer.open && drawer.type === 'assignment' && drawer.itemId && drawer.topicId && (
        <AssignmentDrawer
          open={drawer.open}
          assignmentId={drawer.itemId}
          topicId={drawer.topicId}
          onClose={closeDrawer}
          onSaved={() => {
            fetchCourseBuilder(courseId);
            closeDrawer();
          }}
        />
      )}
    </div>
  );
};

export default CourseBuilderPage;
