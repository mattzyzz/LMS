'use client';

import React from 'react';
import { Checkbox, Input, Button, Space } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import type { BuilderAnswerOption } from '@/types/courseBuilder';

interface MultipleChoiceQuestionProps {
  options: BuilderAnswerOption[];
  onChange: (options: BuilderAnswerOption[]) => void;
}

export const MultipleChoiceQuestion: React.FC<MultipleChoiceQuestionProps> = ({ options, onChange }) => {
  const addOption = () => {
    onChange([
      ...options,
      { id: `new-${Date.now()}`, text: '', isCorrect: false, sortOrder: options.length },
    ]);
  };

  const removeOption = (id: string) => {
    onChange(options.filter((o) => o.id !== id));
  };

  const updateText = (id: string, text: string) => {
    onChange(options.map((o) => (o.id === id ? { ...o, text } : o)));
  };

  const toggleCorrect = (id: string) => {
    onChange(options.map((o) => (o.id === id ? { ...o, isCorrect: !o.isCorrect } : o)));
  };

  return (
    <div>
      <Space direction="vertical" style={{ width: '100%' }}>
        {options.map((opt) => (
          <Space key={opt.id} style={{ width: '100%' }}>
            <Checkbox checked={opt.isCorrect} onChange={() => toggleCorrect(opt.id)} />
            <Input
              value={opt.text}
              onChange={(e) => updateText(opt.id, e.target.value)}
              placeholder="Вариант ответа"
              style={{ width: 300 }}
            />
            <Button type="text" danger size="small" icon={<DeleteOutlined />} onClick={() => removeOption(opt.id)} />
          </Space>
        ))}
      </Space>
      <Button type="dashed" size="small" icon={<PlusOutlined />} onClick={addOption} style={{ marginTop: 8 }}>
        Добавить вариант
      </Button>
    </div>
  );
};
