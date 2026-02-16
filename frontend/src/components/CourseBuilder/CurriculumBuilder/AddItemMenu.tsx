'use client';

import React from 'react';
import { Dropdown, Button } from 'antd';
import { PlusOutlined, ReadOutlined, FormOutlined, FileTextOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';

interface AddItemMenuProps {
  onAddLesson: () => void;
  onAddQuiz: () => void;
  onAddAssignment: () => void;
}

export const AddItemMenu: React.FC<AddItemMenuProps> = ({
  onAddLesson,
  onAddQuiz,
  onAddAssignment,
}) => {
  const items: MenuProps['items'] = [
    {
      key: 'lesson',
      icon: <ReadOutlined />,
      label: 'Урок',
      onClick: onAddLesson,
    },
    {
      key: 'quiz',
      icon: <FormOutlined />,
      label: 'Тест',
      onClick: onAddQuiz,
    },
    {
      key: 'assignment',
      icon: <FileTextOutlined />,
      label: 'Задание',
      onClick: onAddAssignment,
    },
  ];

  return (
    <Dropdown menu={{ items }} trigger={['click']}>
      <Button type="dashed" size="small" icon={<PlusOutlined />}>
        Добавить
      </Button>
    </Dropdown>
  );
};
