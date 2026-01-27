'use client';

import React from 'react';
import { Input, Typography } from 'antd';

const { TextArea } = Input;
const { Text } = Typography;

interface RichTextEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  rows?: number;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Введите текст...',
  rows = 10,
}: RichTextEditorProps) {
  return (
    <div>
      <TextArea
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        showCount
        maxLength={50000}
        style={{ fontSize: 15 }}
      />
      <Text type="secondary" style={{ fontSize: 12, marginTop: 4, display: 'block' }}>
        Поддерживается HTML-разметка. В будущем будет добавлен визуальный редактор.
      </Text>
    </div>
  );
}
