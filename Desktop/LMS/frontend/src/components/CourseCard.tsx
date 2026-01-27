'use client';

import React from 'react';
import { Card, Tag, Rate, Typography, Space, Avatar } from 'antd';
import { UserOutlined, TeamOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { DIFFICULTY_LABELS, DIFFICULTY_COLORS } from '@/lib/constants';
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
          course.thumbnailUrl ? (
            <img
              alt={course.title}
              src={course.thumbnailUrl}
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
        actions={[
          <Space key="enrolled">
            <TeamOutlined />
            <span>{course.enrollmentsCount}</span>
          </Space>,
          <span key="rating">
            <Rate disabled defaultValue={course.rating || 0} style={{ fontSize: 14 }} />
          </span>,
        ]}
      >
        <Meta
          title={
            <Space direction="vertical" size={4} style={{ width: '100%' }}>
              <Space>
                <Tag color={DIFFICULTY_COLORS[course.difficulty]}>
                  {DIFFICULTY_LABELS[course.difficulty]}
                </Tag>
                {course.isFree ? (
                  <Tag color="green">Бесплатно</Tag>
                ) : (
                  <Tag color="gold">{course.price} ₽</Tag>
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
                {course.shortDescription || course.description}
              </Paragraph>
              <Space>
                <Avatar
                  size="small"
                  src={course.author?.avatarUrl}
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
