'use client';

import React from 'react';
import { Layout } from 'antd';

const { Content } = Layout;

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Layout
      style={{
        minHeight: '100vh',
        background: '#F5F5F5',
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
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
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
                }}
              >
                <span style={{ color: 'white', fontSize: 24, fontWeight: 700 }}>П</span>
              </div>
              <span
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: '#1A1A1A',
                  letterSpacing: '-0.5px',
                }}
              >
                п<span style={{ color: '#E54D2E' }}>о</span>ртал
              </span>
            </div>
          </div>

          {/* Card */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 20,
              padding: 40,
              boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)',
            }}
          >
            {children}
          </div>

          {/* Footer */}
          <div
            style={{
              textAlign: 'center',
              marginTop: 24,
              color: '#999',
              fontSize: 13,
            }}
          >
            © 2024 Портал. Все права защищены.
          </div>
        </div>
      </Content>
    </Layout>
  );
}
