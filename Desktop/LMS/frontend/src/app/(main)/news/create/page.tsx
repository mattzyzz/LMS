'use client';

import React, { useState } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Upload,
  Space,
  Typography,
  message,
  Switch,
} from 'antd';
import { ArrowLeftOutlined, UploadOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import RichTextEditor from '@/components/RichTextEditor';
import type { UploadFile } from 'antd';

const { Title } = Typography;

interface CreatePostForm {
  title: string;
  content: string;
  isPinned: boolean;
  tags: string;
}

export default function CreateNewsPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const onFinish = async (values: CreatePostForm) => {
    setLoading(true);
    try {
      const payload = {
        title: values.title,
        content: values.content,
        isPinned: values.isPinned || false,
        tags: values.tags
          ? values.tags.split(',').map((t) => t.trim()).filter(Boolean)
          : [],
      };
      const { data } = await api.post('/posts', payload);

      if (fileList.length > 0) {
        const formData = new FormData();
        fileList.forEach((file) => {
          if (file.originFileObj) {
            formData.append('files', file.originFileObj);
          }
        });
        await api.post(`/posts/${data.id}/attachments`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      message.success('Новость опубликована!');
      router.push('/news');
    } catch {
      message.error('Не удалось создать новость');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={() => router.push('/news')}
        style={{ marginBottom: 16 }}
      >
        Назад к новостям
      </Button>

      <Card>
        <Title level={3}>Создать новость</Title>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ isPinned: false }}
        >
          <Form.Item
            name="title"
            label="Заголовок"
            rules={[{ required: true, message: 'Введите заголовок' }]}
          >
            <Input placeholder="Заголовок новости" size="large" />
          </Form.Item>

          <Form.Item
            name="content"
            label="Содержание"
            rules={[{ required: true, message: 'Введите содержание' }]}
          >
            <RichTextEditor placeholder="Текст новости..." rows={12} />
          </Form.Item>

          <Form.Item name="tags" label="Теги (через запятую)">
            <Input placeholder="обновление, важное, HR" />
          </Form.Item>

          <Form.Item name="isPinned" label="Закрепить" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Form.Item label="Вложения">
            <Upload
              fileList={fileList}
              onChange={({ fileList: fl }) => setFileList(fl)}
              beforeUpload={() => false}
              multiple
            >
              <Button icon={<UploadOutlined />}>Загрузить файлы</Button>
            </Upload>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading} size="large">
                Опубликовать
              </Button>
              <Button onClick={() => router.push('/news')} size="large">
                Отмена
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
