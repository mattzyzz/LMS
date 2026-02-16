'use client';

import React, { useEffect, useState } from 'react';
import { Drawer, Form, Input, Button, message, Spin, Divider } from 'antd';
import api from '@/lib/api';
import type { BuilderQuestion } from '@/types/courseBuilder';
import { QuizSettingsForm } from './QuizSettingsForm';
import { QuestionList } from './QuestionList';

interface QuizDrawerProps {
  open: boolean;
  quizId: string;
  topicId: string;
  onClose: () => void;
  onSaved: () => void;
}

export const QuizDrawer: React.FC<QuizDrawerProps> = ({ open, quizId, topicId, onClose, onSaved }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [questions, setQuestions] = useState<BuilderQuestion[]>([]);

  useEffect(() => {
    if (open && quizId) {
      loadQuiz();
    }
  }, [open, quizId]);

  const loadQuiz = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/quizzes/${quizId}`);
      form.setFieldsValue({
        title: data.title,
        description: data.description,
        timeLimitMinutes: data.timeLimitMinutes,
        maxAttempts: data.maxAttempts,
        passingScore: data.passingScore,
        passingScoreType: data.passingScoreType || 'percentage',
        feedbackMode: data.feedbackMode || 'after_submission',
        randomizeQuestions: data.randomizeQuestions ?? false,
        randomizeOptions: data.randomizeOptions ?? false,
      });
      setQuestions(
        (data.questions || []).map((q: BuilderQuestion) => ({
          ...q,
          options: q.options || [],
        })),
      );
    } catch {
      message.error('Ошибка загрузки теста');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      await api.put(`/quizzes/${quizId}`, {
        ...values,
        topicId,
        questions: questions.map((q, qi) => ({
          ...q,
          sortOrder: qi,
          id: q.id.startsWith('new-') ? undefined : q.id,
          options: (q.options || []).map((o, oi) => ({
            ...o,
            sortOrder: oi,
            id: o.id.startsWith('new-') ? undefined : o.id,
          })),
        })),
      });
      message.success('Тест сохранён');
      onSaved();
    } catch {
      message.error('Ошибка сохранения теста');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Drawer
      title="Редактирование теста"
      placement="right"
      width={720}
      open={open}
      onClose={onClose}
      extra={
        <Button type="primary" onClick={handleSave} loading={saving}>
          Сохранить
        </Button>
      }
    >
      {loading ? (
        <Spin style={{ display: 'block', margin: '40px auto' }} />
      ) : (
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="Название" rules={[{ required: true, message: 'Введите название' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Описание">
            <Input.TextArea rows={2} />
          </Form.Item>

          <Divider>Настройки</Divider>
          <QuizSettingsForm />

          <Divider>Вопросы ({questions.length})</Divider>
          <QuestionList questions={questions} quizId={quizId} onChange={setQuestions} />
        </Form>
      )}
    </Drawer>
  );
};
