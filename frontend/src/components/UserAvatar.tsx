'use client';

import React from 'react';
import { Avatar, Space, Typography } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import Link from 'next/link';
import type { User } from '@/types';

const { Text } = Typography;

interface UserAvatarProps {
  user?: User | null;
  size?: number;
  showName?: boolean;
  linkToProfile?: boolean;
}

export default function UserAvatar({
  user,
  size = 32,
  showName = true,
  linkToProfile = true,
}: UserAvatarProps) {
  const fullName = user ? `${user.firstName} ${user.lastName}` : 'Пользователь';
  const initials = user
    ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`
    : '';

  const avatar = (
    <Space size={8} align="center">
      <Avatar
        size={size}
        src={user?.avatar}
        icon={!user?.avatar && !initials ? <UserOutlined /> : undefined}
        style={{ backgroundColor: user?.avatar ? undefined : '#1677ff' }}
      >
        {!user?.avatar && initials}
      </Avatar>
      {showName && <Text>{fullName}</Text>}
    </Space>
  );

  if (linkToProfile && user) {
    return <Link href={`/profile/${user.id}`}>{avatar}</Link>;
  }

  return avatar;
}
