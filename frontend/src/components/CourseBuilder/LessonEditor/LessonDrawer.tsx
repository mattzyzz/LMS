'use client';

import React, { useEffect, useState } from 'react';
import { Drawer, Form, Input, InputNumber, Switch, Button, message, Spin, Divider } from 'antd';
import api from '@/lib/api';
import { RichTextEditor } from '@/components/RichTextEditor';
import { VideoSourceSelector } from './VideoSourceSelector';
import { AttachmentsUploader } from './AttachmentsUploader';
import { ContentDripSettings } from '../ContentDripSettings';
import type { VideoSource, DripType, LessonAttachment } from '@/types/courseBuilder';

interface LessonDrawerProps {
  open: boolean;
  lessonId: string | null;
  onClose: () => void;
  onSaved: () => void;
}

export const LessonDrawer: React.FC<LessonDrawerProps> = ({ open, lessonId, onClose, onSaved }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [htmlContent, setHtmlContent] = useState('');
  const [videoSource, setVideoSource] = useState<VideoSource | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [dripType, setDripType] = useState<DripType>('none');
  const [dripDate, setDripDate] = useState<string | null>(null);
  const [dripDays, setDripDays] = useState<number | null>(null);
  const [dripPrereq, setDripPrereq] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<LessonAttachment[]>([]);

  useEffect(() => {
    if (open && lessonId) {
      loadLesson();
    }
  }, [open, lessonId]);

  const loadLesson = async () => {
    if (!lessonId) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/courses/lessons/${lessonId}`);
      form.setFieldsValue({
        title: data.title,
        description: data.description,
        durationMinutes: data.durationMinutes,
        isFree: data.isFree,
      });
      setHtmlContent(data.htmlContent || '');
      setVideoSource(data.videoSource || null);
      setVideoUrl(data.videoUrl || null);
      setDripType(data.dripType || 'none');
      setDripDate(data.dripDate || null);
      setDripDays(data.dripDaysAfterEnrollment || null);
      setDripPrereq(data.dripPrerequisiteId || null);
      setAttachments(data.attachments || []);
    } catch {
      message.error('Ошибка загрузки урока');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      await api.put(`/courses/lessons/${lessonId}`, {
        ...values,
        htmlContent,
        videoSource,
        videoUrl,
        dripType,
        dripDate,
        dripDaysAfterEnrollment: dripDays,
        dripPrerequisiteId: dripPrereq,
      });
      message.success('Урок сохранён');
      onSaved();
    } catch {
      message.error('Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Drawer
      title="Редактирование урока"
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
            <Input.TextArea rows={2} />
          </Form.Item>

          <Divider>Контент</Divider>
          <Form.Item label="Содержание урока">
            <RichTextEditor value={htmlContent} onChange={setHtmlContent} />
          </Form.Item>

          <Divider>Видео</Divider>
          <VideoSourceSelector
            videoSource={videoSource}
            videoUrl={videoUrl}
            onChange={(s, u) => { setVideoSource(s); setVideoUrl(u); }}
          />

          <Divider>Файлы</Divider>
          {lessonId && (
            <AttachmentsUploader
              lessonId={lessonId}
              attachments={attachments}
              onAdd={(att) => setAttachments([...attachments, att])}
              onRemove={(id) => setAttachments(attachments.filter((a) => a.id !== id))}
            />
          )}

          <Divider>Настройки</Divider>
          <Form.Item name="durationMinutes" label="Длительность (мин)">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="isFree" label="Бесплатный доступ" valuePropName="checked">
            <Switch />
          </Form.Item>

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
