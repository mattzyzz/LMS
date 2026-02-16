'use client';

import React from 'react';
import { Input, Button, Space, Typography } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import type { BuilderAnswerOption } from '@/types/courseBuilder';

const { Text } = Typography;

interface MatchingQuestionProps {
  options: BuilderAnswerOption[];
  onChange: (options: BuilderAnswerOption[]) => void;
}

export const MatchingQuestion: React.FC<MatchingQuestionProps> = ({ options, onChange }) => {
  const addPair = () => {
    onChange([
      ...options,
      { id: `new-${Date.now()}`, text: '', matchPair: '', isCorrect: true, sortOrder: options.length },
    ]);
  };

  const removePair = (id: string) => {
    onChange(options.filter((o) => o.id !== id));
  };

  const updateLeft = (id: string, text: string) => {
    onChange(options.map((o) => (o.id === id ? { ...o, text } : o)));
  };

  const updateRight = (id: string, matchPair: string) => {
    onChange(options.map((o) => (o.id === id ? { ...o, matchPair } : o)));
  };

  return (
    <div>
      <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
        Создайте пары для сопоставления.
      </Text>
      <Space direction="vertical" style={{ width: '100%' }}>
        {options.map((opt, idx) => (
          <Space key={opt.id} align="center">
            <Text>{idx + 1}.</Text>
            <Input
              value={opt.text}
              onChange={(e) => updateLeft(opt.id, e.target.value)}
              placeholder="Левая часть"
              style={{ width: 200 }}
            />
            <span>→</span>
            <Input
              value={opt.matchPair || ''}
              onChange={(e) => updateRight(opt.id, e.target.value)}
              placeholder="Правая часть"
              style={{ width: 200 }}
            />
            <Button type="text" danger size="small" icon={<DeleteOutlined />} onClick={() => removePair(opt.id)} />
          </Space>
        ))}
      </Space>
      <Button type="dashed" size="small" icon={<PlusOutlined />} onClick={addPair} style={{ marginTop: 8 }}>
        Добавить пару
      </Button>
    </div>
  );
};
