'use client';

import React from 'react';
import { Input, Typography, Space, Button } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import type { BuilderAnswerOption } from '@/types/courseBuilder';

const { Text } = Typography;

interface FillBlanksQuestionProps {
  options: BuilderAnswerOption[];
  onChange: (options: BuilderAnswerOption[]) => void;
}

export const FillBlanksQuestion: React.FC<FillBlanksQuestionProps> = ({ options, onChange }) => {
  const addBlank = () => {
    onChange([
      ...options,
      { id: `new-${Date.now()}`, text: '', isCorrect: true, sortOrder: options.length },
    ]);
  };

  const removeBlank = (id: string) => {
    onChange(options.filter((o) => o.id !== id));
  };

  const updateText = (id: string, text: string) => {
    onChange(options.map((o) => (o.id === id ? { ...o, text } : o)));
  };

  return (
    <div>
      <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
        Используйте {'{blank}'} в тексте вопроса. Ниже укажите правильные ответы для каждого пропуска по порядку.
      </Text>
      <Space direction="vertical" style={{ width: '100%' }}>
        {options.map((opt, idx) => (
          <Space key={opt.id}>
            <Text>Пропуск {idx + 1}:</Text>
            <Input
              value={opt.text}
              onChange={(e) => updateText(opt.id, e.target.value)}
              placeholder="Правильный ответ"
              style={{ width: 250 }}
            />
            <Button type="text" danger size="small" icon={<DeleteOutlined />} onClick={() => removeBlank(opt.id)} />
          </Space>
        ))}
      </Space>
      <Button type="dashed" size="small" icon={<PlusOutlined />} onClick={addBlank} style={{ marginTop: 8 }}>
        Добавить пропуск
      </Button>
    </div>
  );
};
