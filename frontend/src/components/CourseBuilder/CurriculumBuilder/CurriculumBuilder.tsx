'use client';

import React, { useState } from 'react';
import { Button, Input, Space, Empty, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { TopicCard } from './TopicCard';
import { useCourseBuilderStore } from '@/stores/courseBuilder.store';
import type { TopicItemType } from '@/types/courseBuilder';

const CurriculumBuilder: React.FC = () => {
  const {
    course,
    addTopic,
    updateTopic,
    deleteTopic,
    reorderTopics,
    addLesson,
    addQuiz,
    addAssignment,
    deleteItem,
    reorderTopicItems,
    openDrawer,
  } = useCourseBuilderStore();

  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [adding, setAdding] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  if (!course) return null;

  const handleAddTopic = async () => {
    if (!newTopicTitle.trim()) return;
    await addTopic(course.id, newTopicTitle.trim());
    setNewTopicTitle('');
    setAdding(false);
    message.success('Тема добавлена');
  };

  const handleAddLesson = async (topicId: string) => {
    const item = await addLesson(topicId, 'Новый урок');
    if (item) {
      openDrawer('lesson', item.id, topicId);
    }
  };

  const handleAddQuiz = async (topicId: string) => {
    const item = await addQuiz(topicId, 'Новый тест');
    if (item) {
      openDrawer('quiz', item.id, topicId);
    }
  };

  const handleAddAssignment = async (topicId: string) => {
    const item = await addAssignment(topicId, 'Новое задание');
    if (item) {
      openDrawer('assignment', item.id, topicId);
    }
  };

  const handleEditItem = (itemId: string, type: TopicItemType, topicId: string) => {
    openDrawer(type, itemId, topicId);
  };

  const handleDeleteItem = async (topicId: string, itemId: string, type: TopicItemType) => {
    await deleteItem(topicId, itemId, type);
    message.success('Элемент удалён');
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    // Check if it's a topic-level drag
    const topicIds = course.topics.map((t) => t.id);
    if (topicIds.includes(active.id as string) && topicIds.includes(over.id as string)) {
      const oldIndex = topicIds.indexOf(active.id as string);
      const newIndex = topicIds.indexOf(over.id as string);
      const newOrder = arrayMove(topicIds, oldIndex, newIndex);
      reorderTopics(course.id, newOrder);
      return;
    }

    // Otherwise item-level drag within a topic
    for (const topic of course.topics) {
      const itemIds = topic.items.map((i) => i.id);
      if (itemIds.includes(active.id as string) && itemIds.includes(over.id as string)) {
        const oldIndex = itemIds.indexOf(active.id as string);
        const newIndex = itemIds.indexOf(over.id as string);
        const newOrder = arrayMove(topic.items, oldIndex, newIndex);
        reorderTopicItems(
          topic.id,
          newOrder.map((item, idx) => ({
            id: item.id,
            type: item.itemType,
            sortOrder: idx,
          })),
        );
        return;
      }
    }
  };

  const topicIds = course.topics.map((t) => t.id);

  return (
    <div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={topicIds} strategy={verticalListSortingStrategy}>
          {course.topics.length === 0 ? (
            <Empty description="Нет тем. Добавьте первую тему для курса." style={{ margin: '40px 0' }} />
          ) : (
            course.topics.map((topic) => (
              <TopicCard
                key={topic.id}
                topic={topic}
                onUpdateTitle={(id, title) => updateTopic(id, { title })}
                onDelete={deleteTopic}
                onAddLesson={handleAddLesson}
                onAddQuiz={handleAddQuiz}
                onAddAssignment={handleAddAssignment}
                onEditItem={handleEditItem}
                onDeleteItem={handleDeleteItem}
              />
            ))
          )}
        </SortableContext>
      </DndContext>

      {adding ? (
        <Space.Compact style={{ width: '100%', marginTop: 8 }}>
          <Input
            placeholder="Название темы"
            value={newTopicTitle}
            onChange={(e) => setNewTopicTitle(e.target.value)}
            onPressEnter={handleAddTopic}
            autoFocus
          />
          <Button type="primary" onClick={handleAddTopic}>
            Добавить
          </Button>
          <Button onClick={() => { setAdding(false); setNewTopicTitle(''); }}>
            Отмена
          </Button>
        </Space.Compact>
      ) : (
        <Button
          type="dashed"
          block
          icon={<PlusOutlined />}
          onClick={() => setAdding(true)}
          style={{ marginTop: 8 }}
        >
          Добавить тему
        </Button>
      )}
    </div>
  );
};

export default CurriculumBuilder;
