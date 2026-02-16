'use client';

import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Select,
  Button,
  Space,
  Typography,
} from 'antd';
import {
  SaveOutlined,
  PlusOutlined,
  MinusCircleOutlined,
} from '@ant-design/icons';
import RichTextEditor from '@/components/RichTextEditor';
import type { BuilderCourse, DifficultyLevel } from '@/types/courseBuilder';

const { Text } = Typography;

interface CourseInfoFormProps {
  course: BuilderCourse;
  onSave: (data: Partial<BuilderCourse>) => Promise<void>;
}

const difficultyOptions = [
  { value: 'beginner', label: 'Начальный' },
  { value: 'intermediate', label: 'Средний' },
  { value: 'advanced', label: 'Продвинутый' },
];

const CourseInfoForm: React.FC<CourseInfoFormProps> = ({ course, onSave }) => {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [description, setDescription] = useState(course.description ?? '');

  useEffect(() => {
    form.setFieldsValue({
      title: course.title,
      shortDescription: course.shortDescription ?? '',
      categoryId: course.categoryId ?? '',
      difficultyLevel: course.difficultyLevel ?? undefined,
      tags: course.tags ?? [],
      coverImage: course.coverImage ?? '',
      learningObjectives: course.learningObjectives ?? [''],
    });
    setDescription(course.description ?? '');
  }, [course, form]);

  const handleFinish = async (values: Record<string, unknown>) => {
    setSaving(true);
    try {
      const objectives = (values.learningObjectives as string[] | undefined)?.filter(
        (v: string) => v && v.trim().length > 0,
      );

      await onSave({
        title: values.title as string,
        shortDescription: (values.shortDescription as string) || null,
        description: description || null,
        categoryId: (values.categoryId as string) || null,
        difficultyLevel: (values.difficultyLevel as DifficultyLevel) ?? null,
        tags: (values.tags as string[]) ?? null,
        coverImage: (values.coverImage as string) || null,
        learningObjectives: objectives && objectives.length > 0 ? objectives : null,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      style={{ maxWidth: 720 }}
    >
      <Form.Item
        name="title"
        label="Название курса"
        rules={[{ required: true, message: 'Введите название курса' }]}
      >
        <Input placeholder="Например: Основы TypeScript" />
      </Form.Item>

      <Form.Item name="shortDescription" label="Краткое описание">
        <Input.TextArea
          rows={3}
          placeholder="Краткое описание курса для каталога (1-2 предложения)"
          showCount
          maxLength={300}
        />
      </Form.Item>

      <Form.Item label="Полное описание">
        <RichTextEditor
          value={description}
          onChange={setDescription}
          placeholder="Подробное описание курса..."
          minHeight={200}
        />
        <Text type="secondary" style={{ fontSize: 12, marginTop: 4, display: 'block' }}>
          Поддерживается форматирование: жирный, курсив, списки, ссылки, изображения
        </Text>
      </Form.Item>

      <Form.Item name="categoryId" label="Категория">
        <Input placeholder="Введите или выберите категорию" />
      </Form.Item>

      <Form.Item name="difficultyLevel" label="Уровень сложности">
        <Select
          allowClear
          placeholder="Выберите уровень"
          options={difficultyOptions}
        />
      </Form.Item>

      <Form.Item name="tags" label="Теги">
        <Select
          mode="tags"
          placeholder="Введите теги и нажмите Enter"
          tokenSeparators={[',']}
        />
      </Form.Item>

      <Form.Item
        name="coverImage"
        label="Обложка курса"
        extra="Вставьте URL изображения или загрузите через файловый менеджер"
      >
        <Input placeholder="https://example.com/cover.jpg" />
      </Form.Item>

      <Form.Item label="Цели обучения">
        <Form.List name="learningObjectives">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Space
                  key={key}
                  style={{ display: 'flex', marginBottom: 8, width: '100%' }}
                  align="baseline"
                >
                  <Form.Item
                    {...restField}
                    name={name}
                    style={{ flex: 1, marginBottom: 0 }}
                  >
                    <Input placeholder={`Цель обучения ${name + 1}`} />
                  </Form.Item>
                  <MinusCircleOutlined
                    onClick={() => remove(name)}
                    style={{ color: '#ff4d4f', fontSize: 16, cursor: 'pointer' }}
                  />
                </Space>
              ))}
              <Button
                type="dashed"
                onClick={() => add('')}
                icon={<PlusOutlined />}
                block
              >
                Добавить цель обучения
              </Button>
            </>
          )}
        </Form.List>
      </Form.Item>

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          icon={<SaveOutlined />}
          loading={saving}
          size="large"
        >
          Сохранить информацию
        </Button>
      </Form.Item>
    </Form>
  );
};

export default CourseInfoForm;
