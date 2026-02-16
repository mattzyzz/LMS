'use client';

import React from 'react';
import { Input, Typography } from 'antd';

const { Text } = Typography;

interface OpenEndedQuestionProps {
  explanation: string | null;
  onExplanationChange: (val: string) => void;
}

export const OpenEndedQuestion: React.FC<OpenEndedQuestionProps> = ({ explanation, onExplanationChange }) => {
  return (
    <div>
      <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
        Ответ в свободной форме. Проверяется вручную.
      </Text>
      <Input.TextArea
        value={explanation || ''}
        onChange={(e) => onExplanationChange(e.target.value)}
        placeholder="Эталонный ответ / пояснение для проверяющего"
        rows={3}
      />
    </div>
  );
};
