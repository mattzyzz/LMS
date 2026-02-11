'use client';

import React from 'react';
import { Card, Tag, Typography, Space, Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import Link from 'next/link';
import type { Course } from '@/types';

const { Text, Paragraph } = Typography;
const { Meta } = Card;

interface CourseCardProps {
  course: Course;
}

export default function CourseCard({ course }: CourseCardProps) {
  return (
    <Link href={`/courses/${course.id}`} style={{ display: 'block' }}>
      <Card
        hoverable
        cover={
          course.coverImage ? (
            <img
              alt={course.title}
              src={course.coverImage}
              style={{ height: 180, objectFit: 'cover' }}
            />
          ) : (
            <div
              style={{
                height: 180,
                background: 'linear-gradient(135deg, #1677ff 0%, #69b1ff 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 48,
                color: '#fff',
              }}
            >
              📚
            </div>
          )
        }
      >
        <Meta
          title={
            <Space direction="vertical" size={4} style={{ width: '100%' }}>
              <Space>
                {course.category && <Tag color="blue">{course.category}</Tag>}
                {course.accessType === 'free' ? (
                  <Tag color="green">Бесплатно</Tag>
                ) : course.accessType === 'internal' ? (
                  <Tag color="purple">Внутренний</Tag>
                ) : (
                  <Tag color="gold">{course.price} {course.currency}</Tag>
                )}
              </Space>
              <Text strong style={{ fontSize: 16 }}>
                {course.title}
              </Text>
            </Space>
          }
          description={
            <Space direction="vertical" size={8} style={{ width: '100%' }}>
              <Paragraph
                ellipsis={{ rows: 2 }}
                style={{ marginBottom: 0, color: '#8c8c8c' }}
              >
                {course.description}
              </Paragraph>
              <Space>
                <Avatar
                  size="small"
                  src={course.author?.avatar}
                  icon={<UserOutlined />}
                />
                <Text type="secondary" style={{ fontSize: 13 }}>
                  {course.author
                    ? `${course.author.firstName} ${course.author.lastName}`
                    : 'Автор'}
                </Text>
              </Space>
            </Space>
          }
        />
      </Card>
    </Link>
  );
}
