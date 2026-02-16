'use client';

import React from 'react';
import { Form, InputNumber, Select, Switch } from 'antd';

export const QuizSettingsForm: React.FC = () => {
  return (
    <>
      <Form.Item name="timeLimitMinutes" label="Лимит времени (мин)">
        <InputNumber min={1} style={{ width: '100%' }} placeholder="Без ограничений" />
      </Form.Item>
      <Form.Item name="maxAttempts" label="Максимум попыток" initialValue={1}>
        <InputNumber min={1} style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item name="passingScore" label="Проходной балл (%)" initialValue={70}>
        <InputNumber min={0} max={100} style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item name="passingScoreType" label="Тип оценки" initialValue="percentage">
        <Select options={[
          { value: 'percentage', label: 'Процент' },
          { value: 'points', label: 'Баллы' },
        ]} />
      </Form.Item>
      <Form.Item name="feedbackMode" label="Показ результатов" initialValue="after_submission">
        <Select options={[
          { value: 'after_submission', label: 'После отправки' },
          { value: 'after_all_attempts', label: 'После всех попыток' },
          { value: 'never', label: 'Не показывать' },
        ]} />
      </Form.Item>
      <Form.Item name="randomizeQuestions" label="Перемешивать вопросы" valuePropName="checked">
        <Switch />
      </Form.Item>
      <Form.Item name="randomizeOptions" label="Перемешивать варианты" valuePropName="checked">
        <Switch />
      </Form.Item>
    </>
  );
};
