'use client';

import React from 'react';
import { Radio, Space } from 'antd';
import type { BuilderAnswerOption } from '@/types/courseBuilder';

interface TrueFalseQuestionProps {
  options: BuilderAnswerOption[];
  onChange: (options: BuilderAnswerOption[]) => void;
}

export const TrueFalseQuestion: React.FC<TrueFalseQuestionProps> = ({ options, onChange }) => {
  const correctId = options.find((o) => o.isCorrect)?.id;

  const ensureOptions = (): BuilderAnswerOption[] => {
    if (options.length >= 2) return options;
    return [
      { id: 'tf-true', text: 'Верно', isCorrect: true, sortOrder: 0 },
      { id: 'tf-false', text: 'Неверно', isCorrect: false, sortOrder: 1 },
    ];
  };

  const currentOptions = ensureOptions();

  return (
    <Radio.Group
      value={correctId || currentOptions.find((o) => o.isCorrect)?.id}
      onChange={(e) => {
        const updated = currentOptions.map((o) => ({
          ...o,
          isCorrect: o.id === e.target.value,
        }));
        onChange(updated);
      }}
    >
      <Space direction="vertical">
        {currentOptions.map((opt) => (
          <Radio key={opt.id} value={opt.id}>
            {opt.text}
          </Radio>
        ))}
      </Space>
    </Radio.Group>
  );
};
