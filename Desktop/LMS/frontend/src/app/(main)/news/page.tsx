'use client';

import React, { useEffect, useState } from 'react';
import {
  List,
  Card,
  Avatar,
  Space,
  Tag,
  Button,
  Typography,
  Input,
  Spin,
} from 'antd';
import {
  LikeOutlined,
  LikeFilled,
  CommentOutlined,
  PushpinFilled,
  PlusOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import api from '@/lib/api';
import type { Post, PaginatedResponse } from '@/types';

dayjs.locale('ru');
const { Title, Paragraph, Text } = Typography;

export default function NewsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');

  const fetchPosts = async (p: number = 1, q: string = '') => {
    setLoading(true);
    try {
      const { data } = await api.get<PaginatedResponse<Post>>('/posts', {
        params: { page: p, limit: 10, search: q || undefined },
      });
      setPosts(data.data);
      setTotal(data.total);
    } catch {
      // use empty state
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(page, search);
  }, [page, search]);

  const handleLike = async (postId: number) => {
    try {
      await api.post(`/posts/${postId}/like`);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                isLiked: !p.isLiked,
                likesCount: p.isLiked ? p.likesCount - 1 : p.likesCount + 1,
              }
            : p
        )
      );
    } catch {
      // silently fail
    }
  };

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
        }}
      >
        <Title level={3} style={{ margin: 0 }}>
          Новости
        </Title>
        <Link href="/news/create">
          <Button type="primary" icon={<PlusOutlined />}>
            Создать пост
          </Button>
        </Link>
      </div>

      <Input
        prefix={<SearchOutlined />}
        placeholder="Поиск новостей..."
        allowClear
        size="large"
        style={{ marginBottom: 24 }}
        onChange={(e) => {
          setPage(1);
          setSearch(e.target.value);
        }}
      />

      <Spin spinning={loading}>
        <List
          dataSource={posts}
          locale={{ emptyText: 'Нет новостей' }}
          pagination={{
            current: page,
            total,
            pageSize: 10,
            onChange: setPage,
            showSizeChanger: false,
          }}
          renderItem={(post) => (
            <Card
              key={post.id}
              style={{ marginBottom: 16 }}
              hoverable
            >
              <List.Item.Meta
                avatar={
                  <Avatar
                    size={48}
                    src={post.author?.avatarUrl}
                    style={{ backgroundColor: '#1677ff' }}
                  >
                    {post.author?.firstName?.[0]}
                  </Avatar>
                }
                title={
                  <Space direction="vertical" size={4}>
                    <Space>
                      {post.isPinned && (
                        <Tag icon={<PushpinFilled />} color="red">
                          Закреплено
                        </Tag>
                      )}
                      <Link href={`/news/${post.id}`}>
                        <Text strong style={{ fontSize: 18 }}>
                          {post.title}
                        </Text>
                      </Link>
                    </Space>
                    <Space>
                      <Text type="secondary" style={{ fontSize: 13 }}>
                        {post.author
                          ? `${post.author.firstName} ${post.author.lastName}`
                          : 'Автор'}
                      </Text>
                      <Text type="secondary" style={{ fontSize: 13 }}>
                        {dayjs(post.createdAt).format('DD MMMM YYYY, HH:mm')}
                      </Text>
                    </Space>
                  </Space>
                }
                description={
                  <div style={{ marginTop: 12 }}>
                    <Paragraph
                      ellipsis={{ rows: 3 }}
                      style={{ marginBottom: 12 }}
                    >
                      {post.excerpt || post.content}
                    </Paragraph>
                    {post.tags && post.tags.length > 0 && (
                      <Space style={{ marginBottom: 12 }} wrap>
                        {post.tags.map((tag) => (
                          <Tag key={tag}>{tag}</Tag>
                        ))}
                      </Space>
                    )}
                    <Space size={16}>
                      <Button
                        type="text"
                        icon={post.isLiked ? <LikeFilled /> : <LikeOutlined />}
                        onClick={(e) => {
                          e.preventDefault();
                          handleLike(post.id);
                        }}
                        style={{ color: post.isLiked ? '#1677ff' : undefined }}
                      >
                        {post.likesCount}
                      </Button>
                      <Link href={`/news/${post.id}#comments`}>
                        <Button type="text" icon={<CommentOutlined />}>
                          {post.commentsCount}
                        </Button>
                      </Link>
                    </Space>
                  </div>
                }
              />
            </Card>
          )}
        />
      </Spin>
    </div>
  );
}
