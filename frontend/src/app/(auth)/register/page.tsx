'use client';

import React, { Suspense, useState } from 'react';
import { Form, Input, Button, Typography, Divider, message, Spin } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined, SettingOutlined } from '@ant-design/icons';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth.store';
import type { UserRoleType } from '@/types';

const { Title, Text } = Typography;

interface RegisterForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register, isLoading } = useAuthStore();
  const [form] = Form.useForm();

  const initialRole = (searchParams.get('role') as UserRoleType) || 'employee';
  const [role, setRole] = useState<UserRoleType>(initialRole);
  const isHrd = role === 'hrd';

  const onFinish = async (values: RegisterForm) => {
    try {
      await register({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
        role,
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
        style={{ display: 'block', textAlign: 'center', marginBottom: 24 }}
      >
        Создайте аккаунт для доступа к системе
      </Text>

      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <div
          onClick={() => setRole('hrd')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '14px 16px',
            borderRadius: 10,
            border: isHrd ? '2px solid #E54D2E' : '1px solid #E8E8E8',
            cursor: 'pointer',
            background: isHrd ? '#FFF5F3' : '#FAFAFA',
            transition: 'all 0.2s ease',
          }}
        >
          <SettingOutlined style={{ fontSize: 18, color: isHrd ? '#E54D2E' : '#999' }} />
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: isHrd ? '#E54D2E' : '#1A1A1A' }}>
              Администратор
            </div>
            <div style={{ fontSize: 11, color: '#999' }}>Управление</div>
          </div>
        </div>
        <div
          onClick={() => setRole('employee')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '14px 16px',
            borderRadius: 10,
            border: !isHrd ? '2px solid #E54D2E' : '1px solid #E8E8E8',
            cursor: 'pointer',
            background: !isHrd ? '#FFF5F3' : '#FAFAFA',
            transition: 'all 0.2s ease',
          }}
        >
          <UserOutlined style={{ fontSize: 18, color: !isHrd ? '#E54D2E' : '#999' }} />
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: !isHrd ? '#E54D2E' : '#1A1A1A' }}>
              Сотрудник
            </div>
            <div style={{ fontSize: 11, color: '#999' }}>Обучение</div>
          </div>
        </div>
      </div>

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
            style={{
              height: 44,
              background: isHrd
                ? 'linear-gradient(135deg, #722ed1 0%, #b37feb 100%)'
                : undefined,
            }}
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

export default function RegisterPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: 50 }}><Spin size="large" /></div>}>
      <RegisterForm />
    </Suspense>
  );
}
