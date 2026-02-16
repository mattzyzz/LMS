'use client';

import React from 'react';
import { Radio, Input, Button, Space } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import type { BuilderAnswerOption } from '@/types/courseBuilder';

interface SingleChoiceQuestionProps {
  options: BuilderAnswerOption[];
  onChange: (options: BuilderAnswerOption[]) => void;
}

export const SingleChoiceQuestion: React.FC<SingleChoiceQuestionProps> = ({ options, onChange }) => {
  const correctId = options.find((o) => o.isCorrect)?.id;

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

  const setCorrect = (id: string) => {
    onChange(options.map((o) => ({ ...o, isCorrect: o.id === id })));
  };

  return (
    <div>
      <Radio.Group value={correctId} onChange={(e) => setCorrect(e.target.value)} style={{ width: '100%' }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          {options.map((opt) => (
            <Space key={opt.id} style={{ width: '100%' }}>
              <Radio value={opt.id} />
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
      </Radio.Group>
      <Button type="dashed" size="small" icon={<PlusOutlined />} onClick={addOption} style={{ marginTop: 8 }}>
        Добавить вариант
      </Button>
    </div>
  );
};
