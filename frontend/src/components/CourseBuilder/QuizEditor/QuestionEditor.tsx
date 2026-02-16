'use client';

import React from 'react';
import { Form, Input, InputNumber, Select, Space, Typography, Divider } from 'antd';
import type { BuilderQuestion, BuilderAnswerOption, QuestionType } from '@/types/courseBuilder';
import { TrueFalseQuestion } from './question-types/TrueFalseQuestion';
import { SingleChoiceQuestion } from './question-types/SingleChoiceQuestion';
import { MultipleChoiceQuestion } from './question-types/MultipleChoiceQuestion';
import { OpenEndedQuestion } from './question-types/OpenEndedQuestion';
import { FillBlanksQuestion } from './question-types/FillBlanksQuestion';
import { ShortAnswerQuestion } from './question-types/ShortAnswerQuestion';
import { MatchingQuestion } from './question-types/MatchingQuestion';
import { OrderingQuestion } from './question-types/OrderingQuestion';

const { Text } = Typography;

const questionTypeOptions: { value: QuestionType; label: string }[] = [
  { value: 'single_choice', label: 'Одиночный выбор' },
  { value: 'multiple_choice', label: 'Множественный выбор' },
  { value: 'true_false', label: 'Верно / Неверно' },
  { value: 'free_text', label: 'Свободный ответ' },
  { value: 'short_answer', label: 'Краткий ответ' },
  { value: 'fill_blanks', label: 'Заполнить пропуски' },
  { value: 'matching', label: 'Сопоставление' },
  { value: 'ordering', label: 'Упорядочивание' },
  { value: 'survey', label: 'Опрос (без оценки)' },
];

interface QuestionEditorProps {
  question: BuilderQuestion;
  index: number;
  onChange: (updated: BuilderQuestion) => void;
}

export const QuestionEditor: React.FC<QuestionEditorProps> = ({ question, index, onChange }) => {
  const updateField = <K extends keyof BuilderQuestion>(key: K, value: BuilderQuestion[K]) => {
    onChange({ ...question, [key]: value });
  };

  const handleTypeChange = (type: QuestionType) => {
    let defaultOptions: BuilderAnswerOption[] = [];
    if (type === 'true_false') {
      defaultOptions = [
        { id: `new-${Date.now()}-t`, text: 'Верно', isCorrect: true, sortOrder: 0 },
        { id: `new-${Date.now()}-f`, text: 'Неверно', isCorrect: false, sortOrder: 1 },
      ];
    } else if (type === 'single_choice' || type === 'multiple_choice') {
      defaultOptions = [
        { id: `new-${Date.now()}-1`, text: '', isCorrect: false, sortOrder: 0 },
        { id: `new-${Date.now()}-2`, text: '', isCorrect: false, sortOrder: 1 },
      ];
    }
    onChange({ ...question, type, options: defaultOptions });
  };

  const handleOptionsChange = (options: BuilderAnswerOption[]) => {
    onChange({ ...question, options });
  };

  const renderAnswerEditor = () => {
    const options = question.options || [];
    switch (question.type) {
      case 'true_false':
        return <TrueFalseQuestion options={options} onChange={handleOptionsChange} />;
      case 'single_choice':
        return <SingleChoiceQuestion options={options} onChange={handleOptionsChange} />;
      case 'multiple_choice':
        return <MultipleChoiceQuestion options={options} onChange={handleOptionsChange} />;
      case 'free_text':
      case 'survey':
        return (
          <OpenEndedQuestion
            explanation={question.explanation || null}
            onExplanationChange={(val) => updateField('explanation', val || null)}
          />
        );
      case 'fill_blanks':
        return <FillBlanksQuestion options={options} onChange={handleOptionsChange} />;
      case 'short_answer':
        return <ShortAnswerQuestion options={options} onChange={handleOptionsChange} />;
      case 'matching':
        return <MatchingQuestion options={options} onChange={handleOptionsChange} />;
      case 'ordering':
        return <OrderingQuestion options={options} onChange={handleOptionsChange} />;
      default:
        return <Text type="secondary">Неизвестный тип вопроса</Text>;
    }
  };

  return (
    <div style={{ padding: '12px 0' }}>
      <Space direction="vertical" style={{ width: '100%' }} size="small">
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Text strong>Вопрос {index + 1}</Text>
          <Space>
            <Select
              value={question.type}
              onChange={handleTypeChange}
              options={questionTypeOptions}
              style={{ width: 200 }}
              size="small"
            />
            <InputNumber
              value={question.points}
              onChange={(v) => updateField('points', v ?? 1)}
              min={0}
              size="small"
              style={{ width: 80 }}
              addonAfter="б."
            />
          </Space>
        </Space>

        <Input.TextArea
          value={question.text}
          onChange={(e) => updateField('text', e.target.value)}
          placeholder="Текст вопроса"
          autoSize={{ minRows: 2, maxRows: 6 }}
        />

        <Divider style={{ margin: '8px 0' }} />
        {renderAnswerEditor()}

        <Input.TextArea
          value={question.explanation || ''}
          onChange={(e) => updateField('explanation', e.target.value || null)}
          placeholder="Объяснение ответа (необязательно)"
          autoSize={{ minRows: 1, maxRows: 3 }}
          style={{ marginTop: 8 }}
        />
      </Space>
    </div>
  );
};
