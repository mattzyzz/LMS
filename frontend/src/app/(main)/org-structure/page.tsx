'use client';

import React, { useEffect, useState } from 'react';
import {
  Tree,
  Card,
  Input,
  Select,
  Row,
  Col,
  Avatar,
  Typography,
  Space,
  Tag,
  Drawer,
  Descriptions,
  Badge,
  Spin,
} from 'antd';
import {
  SearchOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  ApartmentOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import api from '@/lib/api';
import { AVAILABILITY_LABELS, AVAILABILITY_COLORS, ROLE_LABELS } from '@/lib/constants';
import type { Department, User } from '@/types';
import type { DataNode } from 'antd/es/tree';

const { Title, Text } = Typography;

export default function OrgStructurePage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState('');
  const [selectedDept, setSelectedDept] = useState<string | undefined>();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await api.get('/departments', {
          params: { includeEmployees: true },
        });
        const arr = Array.isArray(data) ? data : (data?.data || []);
        setDepartments(arr);
      } catch {
        setDepartments([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const buildTreeData = (depts: Department[]): DataNode[] => {
    return depts
      .filter((d) => !selectedDept || d.id === selectedDept)
      .map((dept) => ({
        key: `dept-${dept.id}`,
        title: (
          <Space>
            <ApartmentOutlined />
            <Text strong>{dept.name}</Text>
            <Tag>{dept.employees?.length || 0} сотр.</Tag>
          </Space>
        ),
        children: [
          ...(dept.children?.map((child) => ({
            key: `dept-${child.id}`,
            title: (
              <Space>
                <ApartmentOutlined />
                <Text strong>{child.name}</Text>
                <Tag>{child.employees?.length || 0} сотр.</Tag>
              </Space>
            ),
            children:
              child.employees
                ?.filter(
                  (u) =>
                    !searchValue ||
                    `${u.firstName} ${u.lastName}`
                      .toLowerCase()
                      .includes(searchValue.toLowerCase())
                )
                .map((user) => ({
                  key: `user-${user.id}`,
                  title: (
                    <Space
                      onClick={() => {
                        setSelectedUser(user);
                        setDrawerOpen(true);
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      <Avatar
                        size="small"
                        src={user.avatar}
                        icon={<UserOutlined />}
                        style={{ backgroundColor: '#1677ff' }}
                      />
                      <Text>
                        {user.firstName} {user.lastName}
                      </Text>
                      {user.position && (
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          — {user.position}
                        </Text>
                      )}
                    </Space>
                  ),
                  isLeaf: true,
                })) || [],
          })) || []),
          ...(dept.employees
            ?.filter(
              (u) =>
                !searchValue ||
                `${u.firstName} ${u.lastName}`
                  .toLowerCase()
                  .includes(searchValue.toLowerCase())
            )
            .map((user) => ({
              key: `user-${user.id}`,
              title: (
                <Space
                  onClick={() => {
                    setSelectedUser(user);
                    setDrawerOpen(true);
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <Avatar
                    size="small"
                    src={user.avatar}
                    icon={<UserOutlined />}
                    style={{ backgroundColor: '#1677ff' }}
                  />
                  <Text>
                    {user.firstName} {user.lastName}
                  </Text>
                  {user.position && (
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      — {user.position}
                    </Text>
                  )}
                </Space>
              ),
              isLeaf: true,
            })) || []),
        ],
      }));
  };

  return (
    <div>
      <Title level={3} style={{ marginBottom: 24 }}>
        Организационная структура
      </Title>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} md={12}>
          <Input
            prefix={<SearchOutlined />}
            placeholder="Поиск сотрудника..."
            allowClear
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </Col>
        <Col xs={24} md={12}>
          <Select
            placeholder="Фильтр по отделу"
            allowClear
            style={{ width: '100%' }}
            value={selectedDept}
            onChange={setSelectedDept}
          >
            {departments.map((d) => (
              <Select.Option key={d.id} value={d.id}>
                {d.name}
              </Select.Option>
            ))}
          </Select>
        </Col>
      </Row>

      <Card loading={loading}>
        {!loading && (
          <Tree
            showLine
            defaultExpandAll
            treeData={buildTreeData(departments)}
            style={{ fontSize: 14 }}
          />
        )}
      </Card>

      <Drawer
        title="Профиль сотрудника"
        placement="right"
        width={400}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        {selectedUser && (
          <Space direction="vertical" size={24} style={{ width: '100%' }}>
            <div style={{ textAlign: 'center' }}>
              <Avatar
                size={80}
                src={selectedUser.avatar}
                icon={<UserOutlined />}
                style={{ backgroundColor: '#1677ff', marginBottom: 12 }}
              />
              <Title level={4} style={{ margin: 0 }}>
                {selectedUser.firstName} {selectedUser.lastName}
              </Title>
              {selectedUser.position && (
                <Text type="secondary">{selectedUser.position}</Text>
              )}
              <div style={{ marginTop: 8 }}>
                <Badge
                  color={
                    AVAILABILITY_COLORS[
                      selectedUser.profile?.availabilityStatus || 'offline'
                    ]
                  }
                  text={
                    AVAILABILITY_LABELS[
                      selectedUser.profile?.availabilityStatus || 'offline'
                    ]
                  }
                />
              </div>
            </div>

            <Descriptions column={1} size="small">
              <Descriptions.Item label={<><MailOutlined /> Email</>}>
                {selectedUser.email}
              </Descriptions.Item>
              {selectedUser.phone && (
                <Descriptions.Item label={<><PhoneOutlined /> Телефон</>}>
                  {selectedUser.phone}
                </Descriptions.Item>
              )}
              {selectedUser.department && (
                <Descriptions.Item label="Отдел">
                  {selectedUser.department.name}
                </Descriptions.Item>
              )}
              {selectedUser.role && (
                <Descriptions.Item label="Роль">
                  <Tag color={selectedUser.role === 'hrd' ? 'purple' : 'blue'}>
                    {ROLE_LABELS[selectedUser.role] || selectedUser.role}
                  </Tag>
                </Descriptions.Item>
              )}
            </Descriptions>

            <Link href={`/profile/${selectedUser.id}`}>
              <span
                style={{
                  color: '#1677ff',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                Перейти в полный профиль
              </span>
            </Link>
          </Space>
        )}
      </Drawer>
    </div>
  );
}
