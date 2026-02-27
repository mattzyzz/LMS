'use client';

import React from 'react';
import { Button, Tag, Popconfirm, Tooltip } from 'antd';
import {
  ReadOutlined,
  FormOutlined,
  FileTextOutlined,
  EditOutlined,
  DeleteOutlined,
  HolderOutlined,
} from '@ant-design/icons';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { TopicItem, TopicItemType } from '@/types/courseBuilder';

interface CurriculumItemProps {
  item: TopicItem;
  onEdit: (itemId: string, type: TopicItemType) => void;
  onDelete: (itemId: string, type: TopicItemType) => void;
}

const typeConfig: Record<TopicItemType, { icon: React.ReactNode; color: string; label: string }> = {
  lesson: { icon: <ReadOutlined />, color: 'blue', label: 'Урок' },
  quiz: { icon: <FormOutlined />, color: 'red', label: 'Тест' },
  assignment: { icon: <FileTextOutlined />, color: 'green', label: 'Задание' },
};

export const CurriculumItem: React.FC<CurriculumItemProps> = ({ item, onEdit, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 12px',
    background: '#fff',
    borderRadius: 6,
    border: '1px solid #f0f0f0',
    marginBottom: 4,
  };

  const config = typeConfig[item.itemType];

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <div {...listeners} style={{ cursor: 'grab', color: '#999' }}>
        <HolderOutlined />
      </div>
      <Tag color={config.color} style={{ margin: 0 }}>
        {config.icon} {config.label}
      </Tag>
      <span style={{ flex: 1, fontSize: 14 }}>{item.title}</span>
      <Tooltip title="Редактировать">
        <Button
          type="text"
          size="small"
          icon={<EditOutlined />}
          onClick={() => onEdit(item.id, item.itemType)}
        />
      </Tooltip>
      <Popconfirm
        title="Удалить этот элемент?"
        onConfirm={() => onDelete(item.id, item.itemType)}
        okText="Да"
        cancelText="Нет"
      >
        <Button type="text" size="small" danger icon={<DeleteOutlined />} />
      </Popconfirm>
    </div>
  );
};
