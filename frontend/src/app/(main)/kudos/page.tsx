'use client';

import React, { useEffect, useState } from 'react';
import {
  Card,
  Typography,
  Tabs,
  List,
  Avatar,
  Button,
  Space,
  Input,
  Select,
  Modal,
  Form,
  message,
  Tag,
  Spin,
  Empty,
} from 'antd';
import {
  StarOutlined,
  TrophyOutlined,
  HeartOutlined,
  SmileOutlined,
  PlusOutlined,
  UserOutlined,
  CrownOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import api from '@/lib/api';
import type { Kudos, LeaderboardEntry, User, PaginatedResponse } from '@/types';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const categoryIcons: Record<string, React.ReactNode> = {
  teamwork: <HeartOutlined />,
  innovation: <StarOutlined />,
  help: <SmileOutlined />,
  achievement: <TrophyOutlined />,
};

const categoryLabels: Record<string, string> = {
  teamwork: 'Командная работа',
  innovation: 'Инновации',
  help: 'Помощь коллегам',
  achievement: 'Достижение',
};

export default function KudosPage() {
  const [kudosList, setKudosList] = useState<Kudos[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('feed');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const toArray = (d: any) => Array.isArray(d) ? d : (d?.data || []);
      try {
        // Fetch kudos feed
        const { data: kudosData } = await api.get('/kudos', {
          params: { limit: 50 },
        });
        setKudosList(toArray(kudosData));

        // Fetch leaderboard
        const { data: leaderboardData } = await api.get('/kudos/leaderboard');
        setLeaderboard(toArray(leaderboardData));

        // Fetch users for the form
        const { data: usersData } = await api.get('/users');
        setUsers(toArray(usersData));
      } catch {
        // handle error
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSendKudos = async (values: { toUserId: string; message: string; category: string }) => {
    setSubmitting(true);
    try {
      const { data } = await api.post<Kudos>('/kudos', values);
      setKudosList((prev) => [data, ...prev]);
      message.success('Благодарность отправлена!');
      setIsModalOpen(false);
      form.resetFields();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Ошибка при отправке');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReaction = async (kudosId: string, emoji: string) => {
    try {
      await api.post(`/kudos/${kudosId}/reactions`, { emoji });
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
          Благодарности
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
          Поблагодарить
        </Button>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          { key: 'feed', label: 'Лента' },
          { key: 'leaderboard', label: 'Рейтинг', icon: <TrophyOutlined /> },
        ]}
      />

      <Spin spinning={loading}>
        {activeTab === 'feed' && (
          <>
            {kudosList.length === 0 && !loading ? (
              <Empty description="Пока нет благодарностей" />
            ) : (
              <List
                dataSource={kudosList}
                renderItem={(kudos) => (
                  <Card style={{ marginBottom: 16 }}>
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          size={48}
                          src={kudos.fromUser?.avatar}
                          icon={<UserOutlined />}
                          style={{ backgroundColor: '#1677ff' }}
                        />
                      }
                      title={
                        <Space>
                          <Text strong>
                            {kudos.fromUser?.firstName} {kudos.fromUser?.lastName}
                          </Text>
                          <Text type="secondary">поблагодарил(а)</Text>
                          <Text strong>
                            {kudos.toUser?.firstName} {kudos.toUser?.lastName}
                          </Text>
                        </Space>
                      }
                      description={
                        <Space direction="vertical" size={8} style={{ width: '100%' }}>
                          <Paragraph style={{ marginBottom: 0, fontSize: 15 }}>
                            {kudos.message}
                          </Paragraph>
                          <Space>
                            {kudos.category && (
                              <Tag icon={categoryIcons[kudos.category]}>
                                {categoryLabels[kudos.category] || kudos.category}
                              </Tag>
                            )}
                            <Text type="secondary">
                              {dayjs(kudos.createdAt).format('DD.MM.YYYY HH:mm')}
                            </Text>
                            <Text type="secondary">+{kudos.points} баллов</Text>
                          </Space>
                          <Space>
                            <Button
                              type="text"
                              size="small"
                              icon={<HeartOutlined />}
                              onClick={() => handleReaction(kudos.id, 'heart')}
                            />
                            <Button
                              type="text"
                              size="small"
                              icon={<StarOutlined />}
                              onClick={() => handleReaction(kudos.id, 'star')}
                            />
                            <Button
                              type="text"
                              size="small"
                              icon={<SmileOutlined />}
                              onClick={() => handleReaction(kudos.id, 'smile')}
                            />
                          </Space>
                        </Space>
                      }
                    />
                  </Card>
                )}
              />
            )}
          </>
        )}

        {activeTab === 'leaderboard' && (
          <Card>
            <List
              dataSource={leaderboard}
              renderItem={(entry, index) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Space>
                        {index < 3 ? (
                          <Avatar
                            style={{
                              backgroundColor:
                                index === 0
                                  ? '#ffd700'
                                  : index === 1
                                  ? '#c0c0c0'
                                  : '#cd7f32',
                            }}
                            icon={<CrownOutlined />}
                          />
                        ) : (
                          <Avatar style={{ backgroundColor: '#f0f0f0', color: '#666' }}>
                            {entry.rank}
                          </Avatar>
                        )}
                        <Avatar
                          size={48}
                          src={entry.user?.avatar}
                          icon={<UserOutlined />}
                        />
                      </Space>
                    }
                    title={
                      <Text strong>
                        {entry.user?.firstName} {entry.user?.lastName}
                      </Text>
                    }
                    description={
                      <Space>
                        <Text type="secondary">
                          Получено: {entry.kudosReceived} благодарностей
                        </Text>
                        <Text type="secondary">•</Text>
                        <Text type="secondary">
                          Отправлено: {entry.kudosGiven}
                        </Text>
                      </Space>
                    }
                  />
                  <div>
                    <Text strong style={{ fontSize: 18 }}>
                      {entry.totalPoints}
                    </Text>
                    <Text type="secondary"> баллов</Text>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        )}
      </Spin>

      {/* Send Kudos Modal */}
      <Modal
        title="Поблагодарить коллегу"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSendKudos}>
          <Form.Item
            name="toUserId"
            label="Кому"
            rules={[{ required: true, message: 'Выберите коллегу' }]}
          >
            <Select
              showSearch
              placeholder="Выберите коллегу"
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={users.map((u) => ({
                value: u.id,
                label: `${u.firstName} ${u.lastName}`,
              }))}
            />
          </Form.Item>

          <Form.Item
            name="category"
            label="Категория"
            rules={[{ required: true, message: 'Выберите категорию' }]}
          >
            <Select
              placeholder="Выберите категорию"
              options={[
                { value: 'teamwork', label: 'Командная работа' },
                { value: 'innovation', label: 'Инновации' },
                { value: 'help', label: 'Помощь коллегам' },
                { value: 'achievement', label: 'Достижение' },
              ]}
            />
          </Form.Item>

          <Form.Item
            name="message"
            label="Сообщение"
            rules={[
              { required: true, message: 'Напишите сообщение' },
              { min: 10, message: 'Минимум 10 символов' },
            ]}
          >
            <TextArea rows={4} placeholder="За что вы благодарите коллегу?" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setIsModalOpen(false)}>Отмена</Button>
              <Button type="primary" htmlType="submit" loading={submitting}>
                Отправить
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
