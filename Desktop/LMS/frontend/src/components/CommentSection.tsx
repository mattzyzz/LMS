'use client';

import React, { useState, useEffect } from 'react';
import { List, Input, Button, Space, Typography, message } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/ru';
import api from '@/lib/api';
import UserAvatar from './UserAvatar';
import type { Comment } from '@/types';

dayjs.extend(relativeTime);
dayjs.locale('ru');

const { TextArea } = Input;
const { Text } = Typography;

interface CommentSectionProps {
  postId?: number;
  lessonId?: number;
}

export default function CommentSection({ postId, lessonId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newComment, setNewComment] = useState('');

  const fetchComments = async () => {
    setLoading(true);
    try {
      const params: Record<string, number> = {};
      if (postId) params.postId = postId;
      if (lessonId) params.lessonId = lessonId;
      const { data } = await api.get<Comment[]>('/comments', { params });
      setComments(data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId, lessonId]);

  const handleSubmit = async () => {
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = { content: newComment };
      if (postId) payload.postId = postId;
      if (lessonId) payload.lessonId = lessonId;
      await api.post('/comments', payload);
      setNewComment('');
      message.success('Комментарий добавлен');
      fetchComments();
    } catch {
      message.error('Не удалось добавить комментарий');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <Typography.Title level={5} style={{ marginBottom: 16 }}>
        Комментарии ({comments.length})
      </Typography.Title>

      <div style={{ marginBottom: 24 }}>
        <TextArea
          rows={3}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Написать комментарий..."
          maxLength={2000}
        />
        <div style={{ marginTop: 8, textAlign: 'right' }}>
          <Button
            type="primary"
            icon={<SendOutlined />}
            loading={submitting}
            onClick={handleSubmit}
            disabled={!newComment.trim()}
          >
            Отправить
          </Button>
        </div>
      </div>

      <List
        loading={loading}
        dataSource={comments}
        locale={{ emptyText: 'Комментариев пока нет' }}
        renderItem={(comment) => (
          <List.Item key={comment.id}>
            <List.Item.Meta
              avatar={
                <UserAvatar user={comment.author} showName={false} size={36} />
              }
              title={
                <Space>
                  <Text strong>
                    {comment.author
                      ? `${comment.author.firstName} ${comment.author.lastName}`
                      : 'Пользователь'}
                  </Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {dayjs(comment.createdAt).fromNow()}
                  </Text>
                </Space>
              }
              description={comment.content}
            />
          </List.Item>
        )}
      />
    </div>
  );
}
