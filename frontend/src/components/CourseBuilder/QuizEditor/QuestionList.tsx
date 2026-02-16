'use client';

import React, { useCallback } from 'react';
import { Button, Card, Space, Popconfirm, Typography } from 'antd';
import { PlusOutlined, DeleteOutlined, HolderOutlined } from '@ant-design/icons';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { BuilderQuestion, QuestionType } from '@/types/courseBuilder';
import { QuestionEditor } from './QuestionEditor';

const { Text } = Typography;

interface QuestionListProps {
  questions: BuilderQuestion[];
  quizId: string;
  onChange: (questions: BuilderQuestion[]) => void;
}

const SortableQuestion: React.FC<{
  question: BuilderQuestion;
  index: number;
  onChange: (updated: BuilderQuestion) => void;
  onDelete: () => void;
}> = ({ question, index, onChange, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: question.id,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card
        size="small"
        style={{ marginBottom: 8 }}
        extra={
          <Space>
            <span {...attributes} {...listeners} style={{ cursor: 'grab' }}>
              <HolderOutlined />
            </span>
            <Popconfirm title="Удалить вопрос?" onConfirm={onDelete} okText="Да" cancelText="Нет">
              <Button type="text" danger size="small" icon={<DeleteOutlined />} />
            </Popconfirm>
          </Space>
        }
      >
        <QuestionEditor question={question} index={index} onChange={onChange} />
      </Card>
    </div>
  );
};

export const QuestionList: React.FC<QuestionListProps> = ({ questions, quizId, onChange }) => {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const oldIndex = questions.findIndex((q) => q.id === active.id);
      const newIndex = questions.findIndex((q) => q.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;
      const reordered = arrayMove(questions, oldIndex, newIndex).map((q, i) => ({
        ...q,
        sortOrder: i,
      }));
      onChange(reordered);
    },
    [questions, onChange],
  );

  const addQuestion = useCallback(
    (type: QuestionType = 'single_choice') => {
      const newQuestion: BuilderQuestion = {
        id: `new-${Date.now()}`,
        quizId,
        text: '',
        type,
        points: 1,
        sortOrder: questions.length,
        explanation: null,
        options:
          type === 'true_false'
            ? [
                { id: `new-${Date.now()}-t`, text: 'Верно', isCorrect: true, sortOrder: 0 },
                { id: `new-${Date.now()}-f`, text: 'Неверно', isCorrect: false, sortOrder: 1 },
              ]
            : [
                { id: `new-${Date.now()}-1`, text: '', isCorrect: false, sortOrder: 0 },
                { id: `new-${Date.now()}-2`, text: '', isCorrect: false, sortOrder: 1 },
              ],
      };
      onChange([...questions, newQuestion]);
    },
    [questions, quizId, onChange],
  );

  const updateQuestion = useCallback(
    (index: number, updated: BuilderQuestion) => {
      const next = [...questions];
      next[index] = updated;
      onChange(next);
    },
    [questions, onChange],
  );

  const deleteQuestion = useCallback(
    (index: number) => {
      onChange(questions.filter((_, i) => i !== index).map((q, i) => ({ ...q, sortOrder: i })));
    },
    [questions, onChange],
  );

  return (
    <div>
      {questions.length === 0 && (
        <Text type="secondary" style={{ display: 'block', textAlign: 'center', padding: 24 }}>
          Нет вопросов. Добавьте первый вопрос.
        </Text>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={questions.map((q) => q.id)} strategy={verticalListSortingStrategy}>
          {questions.map((q, idx) => (
            <SortableQuestion
              key={q.id}
              question={q}
              index={idx}
              onChange={(updated) => updateQuestion(idx, updated)}
              onDelete={() => deleteQuestion(idx)}
            />
          ))}
        </SortableContext>
      </DndContext>

      <Button
        type="dashed"
        icon={<PlusOutlined />}
        onClick={() => addQuestion()}
        style={{ width: '100%', marginTop: 8 }}
      >
        Добавить вопрос
      </Button>
    </div>
  );
};
