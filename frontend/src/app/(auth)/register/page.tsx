'use client';

import React from 'react';
import { Form, Input, Button, Typography, Divider, message } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth.store';

const { Title, Text } = Typography;

interface RegisterForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading } = useAuthStore();
  const [form] = Form.useForm();

  const onFinish = async (values: RegisterForm) => {
    try {
      await register({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
      });
      message.success('Регистрация прошла успешно!');
      router.push('/dashboard');
    } catch {
      message.error('Ошибка регистрации. Попробуйте другой email.');
    }
  };

  return (
    <div>
      <Title level={3} style={{ textAlign: 'center', marginBottom: 8 }}>
        Регистрация
      </Title>
      <Text
        type="secondary"
        style={{ display: 'block', textAlign: 'center', marginBottom: 32 }}
      >
        Создайте аккаунт для доступа к системе
      </Text>

      <Form
        form={form}
        name="register"
        onFinish={onFinish}
        layout="vertical"
        size="large"
      >
        <Form.Item
          name="firstName"
          rules={[{ required: true, message: 'Введите имя' }]}
        >
          <Input prefix={<UserOutlined />} placeholder="Имя" />
        </Form.Item>

        <Form.Item
          name="lastName"
          rules={[{ required: true, message: 'Введите фамилию' }]}
        >
          <Input prefix={<UserOutlined />} placeholder="Фамилия" />
        </Form.Item>

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
          rules={[
            { required: true, message: 'Введите пароль' },
            { min: 6, message: 'Минимум 6 символов' },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Пароль"
            autoComplete="new-password"
          />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          dependencies={['password']}
          rules={[
            { required: true, message: 'Подтвердите пароль' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Пароли не совпадают'));
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Подтвердите пароль"
            autoComplete="new-password"
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
            Зарегистрироваться
          </Button>
        </Form.Item>
      </Form>

      <Divider plain>
        <Text type="secondary">или</Text>
      </Divider>

      <div style={{ textAlign: 'center' }}>
        <Text>
          Уже есть аккаунт?{' '}
          <Link href="/login">Войти</Link>
        </Text>
      </div>
    </div>
  );
}
