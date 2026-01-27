'use client';

import React, { useEffect, useState } from 'react';
import {
  Card,
  Typography,
  Space,
  Button,
  Tag,
  Avatar,
  Divider,
  Spin,
  message,
} from 'antd';
import {
  LikeOutlined,
  LikeFilled,
  ArrowLeftOutlined,
  PushpinFilled,
} from '@ant-design/icons';
import { useParams, useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import api from '@/lib/api';
import CommentSection from '@/components/CommentSection';
import type { Post } from '@/types';

dayjs.locale('ru');
const { Title, Paragraph, Text } = Typography;

export default function NewsDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const { data } = await api.get<Post>(`/posts/${params.id}`);
        setPost(data);
      } catch {
        message.error('Не удалось загрузить новость');
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [params.id]);

  const handleLike = async () => {
    if (!post) return;
    try {
      await api.post(`/posts/${post.id}/like`);
      setPost({
        ...post,
        isLiked: !post.isLiked,
        likesCount: post.isLiked ? post.likesCount - 1 : post.likesCount + 1,
      });
    } catch {
      // silently fail
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!post) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Title level={4}>Новость не найдена</Title>
        <Button onClick={() => router.push('/news')}>К новостям</Button>
      </div>
    );
  }

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
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          <Space>
            {post.isPinned && (
              <Tag icon={<PushpinFilled />} color="red">
                Закреплено
              </Tag>
            )}
            {post.tags?.map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </Space>

          <Title level={2} style={{ margin: 0 }}>
            {post.title}
          </Title>

          <Space>
            <Avatar
              src={post.author?.avatarUrl}
              style={{ backgroundColor: '#1677ff' }}
            >
              {post.author?.firstName?.[0]}
            </Avatar>
            <div>
              <Text strong>
                {post.author
                  ? `${post.author.firstName} ${post.author.lastName}`
                  : 'Автор'}
              </Text>
              <br />
              <Text type="secondary" style={{ fontSize: 13 }}>
                {dayjs(post.createdAt).format('DD MMMM YYYY, HH:mm')}
              </Text>
            </div>
          </Space>

          <Divider />

          <div style={{ fontSize: 16, lineHeight: 1.8 }}>
            <Paragraph>
              <span dangerouslySetInnerHTML={{ __html: post.content }} />
            </Paragraph>
          </div>

          {post.attachments && post.attachments.length > 0 && (
            <>
              <Divider />
              <div>
                <Text strong>Вложения:</Text>
                <div style={{ marginTop: 8 }}>
                  {post.attachments.map((att) => (
                    <div key={att.id} style={{ marginBottom: 4 }}>
                      <a href={att.url} download>
                        {att.originalName}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <Divider />

          <Space size={16}>
            <Button
              type={post.isLiked ? 'primary' : 'default'}
              icon={post.isLiked ? <LikeFilled /> : <LikeOutlined />}
              onClick={handleLike}
            >
              {post.likesCount} {post.likesCount === 1 ? 'нравится' : 'нравится'}
            </Button>
          </Space>
        </Space>
      </Card>

      <Card style={{ marginTop: 16 }} id="comments">
        <CommentSection postId={post.id} />
      </Card>
    </div>
  );
}
