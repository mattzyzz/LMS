'use client';

import React, { useState, useEffect } from 'react';
import {
  Form,
  Radio,
  InputNumber,
  Switch,
  Select,
  Button,
  Space,
  Typography,
} from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import type { BuilderCourse, DripType } from '@/types/courseBuilder';

const { Text } = Typography;

interface CourseSettingsFormProps {
  course: BuilderCourse;
  onSave: (data: Partial<BuilderCourse>) => Promise<void>;
}

const dripTypeOptions = [
  { value: 'none', label: 'Нет' },
  { value: 'schedule', label: 'По расписанию' },
  { value: 'after_enrollment', label: 'После записи' },
  { value: 'prerequisite', label: 'По пререквизиту' },
];

const CourseSettingsForm: React.FC<CourseSettingsFormProps> = ({ course, onSave }) => {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [accessType, setAccessType] = useState(course.accessType);

  useEffect(() => {
    form.setFieldsValue({
      accessType: course.accessType,
      price: course.price,
      dripType: course.dripType,
      maxParticipants: course.maxParticipants,
      certificateEnabled: course.certificateEnabled,
      requireAllCompletion: course.requireAllCompletion,
      durationMinutes: course.durationMinutes,
    });
    setAccessType(course.accessType);
  }, [course, form]);

  const handleFinish = async (values: Record<string, unknown>) => {
    setSaving(true);
    try {
      await onSave({
        accessType: values.accessType as BuilderCourse['accessType'],
        price: values.accessType === 'paid' ? (values.price as number) : 0,
        dripType: values.dripType as DripType,
        maxParticipants: (values.maxParticipants as number) || null,
        certificateEnabled: values.certificateEnabled as boolean,
        requireAllCompletion: values.requireAllCompletion as boolean,
        durationMinutes: (values.durationMinutes as number) || 0,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAccessTypeChange = (e: { target: { value?: string } }) => {
    setAccessType(e.target.value as BuilderCourse['accessType']);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      style={{ maxWidth: 600 }}
    >
      <Form.Item name="accessType" label="Тип доступа">
        <Radio.Group onChange={handleAccessTypeChange}>
          <Radio.Button value="free">Бесплатный</Radio.Button>
          <Radio.Button value="paid">Платный</Radio.Button>
          <Radio.Button value="internal">Внутренний</Radio.Button>
        </Radio.Group>
      </Form.Item>

      {accessType === 'paid' && (
        <Form.Item
          name="price"
          label="Цена"
          rules={[{ required: true, message: 'Укажите цену курса' }]}
        >
          <InputNumber
            min={0}
            step={100}
            style={{ width: 200 }}
            addonAfter="RUB"
            placeholder="0"
          />
        </Form.Item>
      )}

      <Form.Item
        name="dripType"
        label="Тип публикации контента"
        extra="Определяет, как открываются уроки для учеников"
      >
        <Select options={dripTypeOptions} style={{ width: 300 }} />
      </Form.Item>

      <Form.Item
        name="maxParticipants"
        label="Максимум участников"
        extra="Оставьте пустым для неограниченного количества"
      >
        <InputNumber min={1} style={{ width: 200 }} placeholder="Без ограничений" />
      </Form.Item>

      <Form.Item
        name="durationMinutes"
        label="Длительность курса (минуты)"
        extra="Ориентировочное время прохождения"
      >
        <InputNumber min={0} step={15} style={{ width: 200 }} placeholder="0" />
      </Form.Item>

      <Space direction="vertical" size="middle" style={{ width: '100%', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Form.Item
            name="certificateEnabled"
            valuePropName="checked"
            style={{ marginBottom: 0 }}
          >
            <Switch />
          </Form.Item>
          <div>
            <Text strong>Выдавать сертификат</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              Ученики получат сертификат после завершения курса
            </Text>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Form.Item
            name="requireAllCompletion"
            valuePropName="checked"
            style={{ marginBottom: 0 }}
          >
            <Switch />
          </Form.Item>
          <div>
            <Text strong>Обязательное прохождение всех уроков</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              Ученики должны пройти все уроки для завершения курса
            </Text>
          </div>
        </div>
      </Space>

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          icon={<SaveOutlined />}
          loading={saving}
          size="large"
        >
          Сохранить настройки
        </Button>
      </Form.Item>
    </Form>
  );
};

export default CourseSettingsForm;
