'use client';

import React from 'react';
import { Layout, Card, Typography } from 'antd';
import { BookOutlined } from '@ant-design/icons';

const { Content } = Layout;
const { Title } = Typography;

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Layout
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Content
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 24,
        }}
      >
        <div style={{ width: '100%', maxWidth: 440 }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <BookOutlined
              style={{ fontSize: 48, color: '#fff', marginBottom: 16 }}
            />
            <Title level={2} style={{ color: '#fff', margin: 0 }}>
              LMS Platform
            </Title>
          </div>
          <Card
            style={{
              borderRadius: 16,
              boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            }}
          >
            {children}
          </Card>
        </div>
      </Content>
    </Layout>
  );
}
