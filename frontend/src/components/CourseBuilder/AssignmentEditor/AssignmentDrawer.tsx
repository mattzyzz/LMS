'use client';

import React, { useEffect, useState } from 'react';
import { Drawer, Form, Input, InputNumber, Switch, Button, message, Spin, Divider } from 'antd';
import api from '@/lib/api';
import { ContentDripSettings } from '../ContentDripSettings';
import { FileUploadSettings } from './FileUploadSettings';
import type { DripType } from '@/types/courseBuilder';

interface AssignmentDrawerProps {
  open: boolean;
  assignmentId: string;
  topicId: string;
  onClose: () => void;
  onSaved: () => void;
}

export const AssignmentDrawer: React.FC<AssignmentDrawerProps> = ({
  open,
  assignmentId,
  topicId,
  onClose,
  onSaved,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dripType, setDripType] = useState<DripType>('none');
  const [dripDate, setDripDate] = useState<string | null>(null);
  const [dripDays, setDripDays] = useState<number | null>(null);
  const [dripPrereq, setDripPrereq] = useState<string | null>(null);

  useEffect(() => {
    if (open && assignmentId) {
      loadAssignment();
    }
  }, [open, assignmentId]);

  const loadAssignment = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/homework/assignments/${assignmentId}`);
      form.setFieldsValue({
        title: data.title,
        description: data.description,
        timeLimitHours: data.timeLimitHours,
        passingScore: data.passingScore,
        maxScore: data.maxScore,
        allowFileUpload: data.allowFileUpload ?? true,
        allowedFileTypes: data.allowedFileTypes,
        maxFileSizeMb: data.maxFileSizeMb ?? 10,
        maxFilesCount: data.maxFilesCount ?? 5,
        allowResubmission: data.allowResubmission ?? false,
        allowTextAnswer: data.allowTextAnswer ?? true,
      });
      setDripType(data.dripType || 'none');
      setDripDate(data.dripDate || null);
      setDripDays(data.dripDaysAfterEnrollment || null);
      setDripPrereq(data.dripPrerequisiteId || null);
    } catch {
      message.error('Ошибка загрузки задания');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      await api.put(`/homework/assignments/${assignmentId}`, {
        ...values,
        topicId,
        dripType,
        dripDate,
        dripDaysAfterEnrollment: dripDays,
        dripPrerequisiteId: dripPrereq,
      });
      message.success('Задание сохранено');
      onSaved();
    } catch {
      message.error('Ошибка сохранения задания');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Drawer
      title="Редактирование задания"
      placement="right"
      width={640}
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
            <Input.TextArea rows={3} />
          </Form.Item>

          <Divider>Настройки</Divider>
          <Form.Item name="timeLimitHours" label="Лимит времени (часы)">
            <InputNumber min={1} style={{ width: '100%' }} placeholder="Без ограничений" />
          </Form.Item>
          <Form.Item name="maxScore" label="Макс. баллы">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="passingScore" label="Проходной балл">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="allowResubmission" label="Разрешить повторную сдачу" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="allowTextAnswer" label="Разрешить текстовый ответ" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Divider>Загрузка файлов</Divider>
          <FileUploadSettings />

          <Divider>Доступ по расписанию</Divider>
          <ContentDripSettings
            dripType={dripType}
            dripDate={dripDate}
            dripDaysAfterEnrollment={dripDays}
            dripPrerequisiteId={dripPrereq}
            onChange={(values) => {
              setDripType(values.dripType);
              setDripDate(values.dripDate ?? null);
              setDripDays(values.dripDaysAfterEnrollment ?? null);
              setDripPrereq(values.dripPrerequisiteId ?? null);
            }}
          />
        </Form>
      )}
    </Drawer>
  );
};
