'use client';

import React from 'react';
import { Form, Input, Button, Typography, Divider, message } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth.store';
import type { LoginRequest } from '@/types';

const { Title, Text } = Typography;

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const [form] = Form.useForm();

  const onFinish = async (values: LoginRequest) => {
    try {
      await login(values);
      message.success('Добро пожаловать!');
      router.push('/dashboard');
    } catch {
      message.error('Неверный email или пароль');
    }
  };

  return (
    <div>
      <Title level={3} style={{ textAlign: 'center', marginBottom: 8 }}>
        Вход в систему
      </Title>
      <Text
        type="secondary"
        style={{ display: 'block', textAlign: 'center', marginBottom: 32 }}
      >
        Введите свои учётные данные
      </Text>

      <Form
        form={form}
        name="login"
        onFinish={onFinish}
        layout="vertical"
        size="large"
      >
        <Form.Item
          name="email"
          rules={[
            { required: true, message: 'Введите email' },
            { type: 'email', message: 'Некорректный email' },
          ]}
        >
          <Input
            prefix={<MailOutlined />}
            placeholder="Email"
            autoComplete="email"
          />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[{ required: true, message: 'Введите пароль' }]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Пароль"
            autoComplete="current-password"
          />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={isLoading}
            block
            style={{ height: 44 }}
          >
            Войти
          </Button>
        </Form.Item>
      </Form>

      <Divider plain>
        <Text type="secondary">или</Text>
      </Divider>

      <div style={{ textAlign: 'center' }}>
        <Text>
          Нет аккаунта?{' '}
          <Link href="/register">Зарегистрироваться</Link>
        </Text>
      </div>
    </div>
  );
}
