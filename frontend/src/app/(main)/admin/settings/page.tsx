'use client';

import React from 'react';
import { Card, Row, Col, Typography } from 'antd';
import {
  BgColorsOutlined,
  BookOutlined,
  ApartmentOutlined,
  ProfileOutlined,
} from '@ant-design/icons';
import Link from 'next/link';

const { Title, Text } = Typography;

const SECTIONS = [
  {
    href: '/admin/settings/theme',
    icon: <BgColorsOutlined style={{ fontSize: 32 }} />,
    title: 'Тема и брендинг',
    desc: 'Цвета, шрифты, логотип, отступы, тени',
  },
  {
    href: '/admin/settings/dictionaries',
    icon: <BookOutlined style={{ fontSize: 32 }} />,
    title: 'Справочники',
    desc: 'Должности, уровни навыков, типы контактов, статусы',
  },
  {
    href: '/admin/settings/org-structure',
    icon: <ApartmentOutlined style={{ fontSize: 32 }} />,
    title: 'Оргструктура',
    desc: 'Подписи руководителей, поля карточки сотрудника',
  },
  {
    href: '/admin/settings/profile',
    icon: <ProfileOutlined style={{ fontSize: 32 }} />,
    title: 'Профиль',
    desc: 'Видимость вкладок и полей в профиле сотрудника',
  },
];

export default function SettingsPage() {
  return (
    <div>
      <Title level={3} style={{ marginBottom: 24 }}>Настройки</Title>
      <Row gutter={[16, 16]}>
        {SECTIONS.map((s) => (
          <Col xs={24} sm={12} lg={6} key={s.href}>
            <Link href={s.href} style={{ textDecoration: 'none' }}>
              <Card
                hoverable
                style={{ textAlign: 'center', borderRadius: 'var(--border-radius-card, 12px)' }}
                styles={{ body: { padding: 32 } }}
              >
                <div style={{ color: 'var(--color-primary, #E52322)', marginBottom: 16 }}>
                  {s.icon}
                </div>
                <Title level={5} style={{ marginBottom: 8 }}>{s.title}</Title>
                <Text type="secondary" style={{ fontSize: 13 }}>{s.desc}</Text>
              </Card>
            </Link>
          </Col>
        ))}
      </Row>
    </div>
  );
}
