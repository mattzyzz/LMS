'use client';

import React from 'react';
import { Input, Button, Space, Typography } from 'antd';
import { PlusOutlined, DeleteOutlined, HolderOutlined } from '@ant-design/icons';
import type { BuilderAnswerOption } from '@/types/courseBuilder';

const { Text } = Typography;

interface OrderingQuestionProps {
  options: BuilderAnswerOption[];
  onChange: (options: BuilderAnswerOption[]) => void;
}

export const OrderingQuestion: React.FC<OrderingQuestionProps> = ({ options, onChange }) => {
  const addItem = () => {
    onChange([
      ...options,
      { id: `new-${Date.now()}`, text: '', isCorrect: true, sortOrder: options.length },
    ]);
  };

  const removeItem = (id: string) => {
    onChange(options.filter((o) => o.id !== id).map((o, i) => ({ ...o, sortOrder: i })));
  };

  const updateText = (id: string, text: string) => {
    onChange(options.map((o) => (o.id === id ? { ...o, text } : o)));
  };

  return (
    <div>
      <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
        Расположите элементы в правильном порядке (сверху вниз). Студент увидит их в случайном порядке.
      </Text>
      <Space direction="vertical" style={{ width: '100%' }}>
        {options.map((opt, idx) => (
          <Space key={opt.id}>
            <HolderOutlined style={{ color: '#999' }} />
            <Text>{idx + 1}.</Text>
            <Input
              value={opt.text}
              onChange={(e) => updateText(opt.id, e.target.value)}
              placeholder="Элемент"
              style={{ width: 300 }}
            />
            <Button type="text" danger size="small" icon={<DeleteOutlined />} onClick={() => removeItem(opt.id)} />
          </Space>
        ))}
      </Space>
      <Button type="dashed" size="small" icon={<PlusOutlined />} onClick={addItem} style={{ marginTop: 8 }}>
        Добавить элемент
      </Button>
    </div>
  );
};
