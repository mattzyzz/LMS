'use client';

import React, { useState } from 'react';
import { Form, Input, Button, Typography, Divider, message } from 'antd';
import { MailOutlined, LockOutlined, UserOutlined, SettingOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth.store';
import type { LoginRequest, UserRoleType } from '@/types';

const { Title, Text } = Typography;

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const [form] = Form.useForm();
  const [selectedRole, setSelectedRole] = useState<UserRoleType | null>(null);

  const onFinish = async (values: LoginRequest) => {
    try {
      await login(values);
      message.success('Добро пожаловать!');
      router.push('/dashboard');
    } catch {
      message.error('Неверный email или пароль');
    }
  };

  // Role selection screen
  if (!selectedRole) {
    return (
      <div>
        <Title level={3} style={{ textAlign: 'center', marginBottom: 8, fontWeight: 600 }}>
          Добро пожаловать
        </Title>
        <Text
          style={{ display: 'block', textAlign: 'center', marginBottom: 32, color: '#666' }}
        >
          Выберите тип входа
        </Text>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* HRD Card */}
          <div
            onClick={() => setSelectedRole('hrd')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              padding: 20,
              borderRadius: 12,
              border: '1px solid #E8E8E8',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              background: '#FAFAFA',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#E54D2E';
              e.currentTarget.style.background = '#FFEFEB';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#E8E8E8';
              e.currentTarget.style.background = '#FAFAFA';
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: '#E54D2E',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <SettingOutlined style={{ fontSize: 22, color: '#fff' }} />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 600, color: '#1A1A1A', marginBottom: 4 }}>
                Администратор
              </div>
              <div style={{ fontSize: 13, color: '#666' }}>
                Управление курсами и сотрудниками
              </div>
            </div>
          </div>

          {/* Employee Card */}
          <div
            onClick={() => setSelectedRole('employee')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              padding: 20,
              borderRadius: 12,
              border: '1px solid #E8E8E8',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              background: '#FAFAFA',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#E54D2E';
              e.currentTarget.style.background = '#FFEFEB';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#E8E8E8';
              e.currentTarget.style.background = '#FAFAFA';
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: '#3D4F5F',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <UserOutlined style={{ fontSize: 22, color: '#fff' }} />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 600, color: '#1A1A1A', marginBottom: 4 }}>
                Сотрудник
              </div>
              <div style={{ fontSize: 13, color: '#666' }}>
                Прохождение курсов и обучение
              </div>
            </div>
          </div>
        </div>

        <Divider plain style={{ marginTop: 32, marginBottom: 24 }}>
          <Text style={{ color: '#999', fontSize: 13 }}>или</Text>
        </Divider>

        <div style={{ textAlign: 'center' }}>
          <Text style={{ color: '#666' }}>
            Нет аккаунта?{' '}
            <Link href="/register" style={{ color: '#E54D2E', fontWeight: 500 }}>
              Зарегистрироваться
            </Link>
          </Text>
        </div>
      </div>
    );
  }

  // Login form screen
  return (
    <div>
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={() => setSelectedRole(null)}
        style={{ padding: 0, marginBottom: 24, color: '#666' }}
      >
        Назад
      </Button>

      <Title level={3} style={{ textAlign: 'center', marginBottom: 8, fontWeight: 600 }}>
        Вход в систему
      </Title>
      <Text
        style={{ display: 'block', textAlign: 'center', marginBottom: 32, color: '#666' }}
      >
        {selectedRole === 'hrd' ? 'Администратор' : 'Сотрудник'}
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
            prefix={<MailOutlined style={{ color: '#999' }} />}
            placeholder="Email"
            autoComplete="email"
            style={{ height: 48 }}
          />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[{ required: true, message: 'Введите пароль' }]}
        >
          <Input.Password
            prefix={<LockOutlined style={{ color: '#999' }} />}
            placeholder="Пароль"
            autoComplete="current-password"
            style={{ height: 48 }}
          />
        </Form.Item>

        <Form.Item style={{ marginBottom: 16 }}>
          <Button
            type="primary"
            htmlType="submit"
            loading={isLoading}
            block
            style={{
              height: 48,
              fontSize: 15,
              fontWeight: 500,
            }}
          >
            Войти
          </Button>
        </Form.Item>

        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Link href="/forgot-password" style={{ color: '#999', fontSize: 13 }}>
            Забыли пароль?
          </Link>
        </div>
      </Form>

      <Divider plain>
        <Text style={{ color: '#999', fontSize: 13 }}>или</Text>
      </Divider>

      <div style={{ textAlign: 'center' }}>
        <Text style={{ color: '#666' }}>
          Нет аккаунта?{' '}
          <Link href={`/register?role=${selectedRole}`} style={{ color: '#E54D2E', fontWeight: 500 }}>
            Зарегистрироваться
          </Link>
        </Text>
      </div>
    </div>
  );
}
