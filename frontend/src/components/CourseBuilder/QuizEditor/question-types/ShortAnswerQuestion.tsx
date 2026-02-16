'use client';

import React from 'react';
import { Input, Button, Space, Typography } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import type { BuilderAnswerOption } from '@/types/courseBuilder';

const { Text } = Typography;

interface ShortAnswerQuestionProps {
  options: BuilderAnswerOption[];
  onChange: (options: BuilderAnswerOption[]) => void;
}

export const ShortAnswerQuestion: React.FC<ShortAnswerQuestionProps> = ({ options, onChange }) => {
  const addAnswer = () => {
    onChange([
      ...options,
      { id: `new-${Date.now()}`, text: '', isCorrect: true, sortOrder: options.length },
    ]);
  };

  const removeAnswer = (id: string) => {
    onChange(options.filter((o) => o.id !== id));
  };

  const updateText = (id: string, text: string) => {
    onChange(options.map((o) => (o.id === id ? { ...o, text } : o)));
  };

  return (
    <div>
      <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
        Укажите допустимые варианты ответа (регистр не учитывается).
      </Text>
      <Space direction="vertical" style={{ width: '100%' }}>
        {options.map((opt) => (
          <Space key={opt.id}>
            <Input
              value={opt.text}
              onChange={(e) => updateText(opt.id, e.target.value)}
              placeholder="Допустимый ответ"
              style={{ width: 300 }}
            />
            <Button type="text" danger size="small" icon={<DeleteOutlined />} onClick={() => removeAnswer(opt.id)} />
          </Space>
        ))}
      </Space>
      <Button type="dashed" size="small" icon={<PlusOutlined />} onClick={addAnswer} style={{ marginTop: 8 }}>
        Добавить вариант ответа
      </Button>
    </div>
  );
};
