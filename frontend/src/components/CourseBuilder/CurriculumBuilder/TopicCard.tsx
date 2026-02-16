'use client';

import React, { useState } from 'react';
import { Card, Input, Button, Popconfirm, Space } from 'antd';
import { DeleteOutlined, EditOutlined, CheckOutlined, CloseOutlined, HolderOutlined } from '@ant-design/icons';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CurriculumItem } from './CurriculumItem';
import { AddItemMenu } from './AddItemMenu';
import type { TopicWithItems, TopicItemType } from '@/types/courseBuilder';

interface TopicCardProps {
  topic: TopicWithItems;
  onUpdateTitle: (topicId: string, title: string) => void;
  onDelete: (topicId: string) => void;
  onAddLesson: (topicId: string) => void;
  onAddQuiz: (topicId: string) => void;
  onAddAssignment: (topicId: string) => void;
  onEditItem: (itemId: string, type: TopicItemType, topicId: string) => void;
  onDeleteItem: (topicId: string, itemId: string, type: TopicItemType) => void;
}

export const TopicCard: React.FC<TopicCardProps> = ({
  topic,
  onUpdateTitle,
  onDelete,
  onAddLesson,
  onAddQuiz,
  onAddAssignment,
  onEditItem,
  onDeleteItem,
}) => {
  const [editing, setEditing] = useState(false);
  const [titleValue, setTitleValue] = useState(topic.title);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: topic.id,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    marginBottom: 16,
  };

  const handleSaveTitle = () => {
    if (titleValue.trim()) {
      onUpdateTitle(topic.id, titleValue.trim());
    }
    setEditing(false);
  };

  const itemIds = topic.items.map((i) => i.id);

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <Card
        size="small"
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div {...listeners} style={{ cursor: 'grab', color: '#999' }}>
              <HolderOutlined />
            </div>
            {editing ? (
              <Space.Compact style={{ flex: 1 }}>
                <Input
                  size="small"
                  value={titleValue}
                  onChange={(e) => setTitleValue(e.target.value)}
                  onPressEnter={handleSaveTitle}
                  autoFocus
                />
                <Button size="small" icon={<CheckOutlined />} onClick={handleSaveTitle} />
                <Button size="small" icon={<CloseOutlined />} onClick={() => { setEditing(false); setTitleValue(topic.title); }} />
              </Space.Compact>
            ) : (
              <span style={{ flex: 1, fontWeight: 600 }}>{topic.title}</span>
            )}
          </div>
        }
        extra={
          <Space>
            {!editing && (
              <Button type="text" size="small" icon={<EditOutlined />} onClick={() => setEditing(true)} />
            )}
            <Popconfirm title="Удалить тему и все содержимое?" onConfirm={() => onDelete(topic.id)} okText="Да" cancelText="Нет">
              <Button type="text" size="small" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Space>
        }
      >
        <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
          {topic.items.map((item) => (
            <CurriculumItem
              key={item.id}
              item={item}
              onEdit={(itemId, type) => onEditItem(itemId, type, topic.id)}
              onDelete={(itemId, type) => onDeleteItem(topic.id, itemId, type)}
            />
          ))}
        </SortableContext>

        <div style={{ marginTop: 8 }}>
          <AddItemMenu
            onAddLesson={() => onAddLesson(topic.id)}
            onAddQuiz={() => onAddQuiz(topic.id)}
            onAddAssignment={() => onAddAssignment(topic.id)}
          />
        </div>
      </Card>
    </div>
  );
};
