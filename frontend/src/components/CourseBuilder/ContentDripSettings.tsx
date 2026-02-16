'use client';

import React from 'react';
import { Select, DatePicker, InputNumber, Input, Space, Typography } from 'antd';
import dayjs from 'dayjs';
import type { DripType } from '@/types/courseBuilder';

const { Text } = Typography;

interface ContentDripSettingsProps {
  dripType: DripType;
  dripDate?: string | null;
  dripDaysAfterEnrollment?: number | null;
  dripPrerequisiteId?: string | null;
  onChange: (values: {
    dripType: DripType;
    dripDate?: string | null;
    dripDaysAfterEnrollment?: number | null;
    dripPrerequisiteId?: string | null;
  }) => void;
}

const dripTypeOptions = [
  { value: 'none', label: 'Нет' },
  { value: 'schedule', label: 'По расписанию' },
  { value: 'after_enrollment', label: 'После записи' },
  { value: 'prerequisite', label: 'По пререквизиту' },
];

export const ContentDripSettings: React.FC<ContentDripSettingsProps> = ({
  dripType,
  dripDate,
  dripDaysAfterEnrollment,
  dripPrerequisiteId,
  onChange,
}) => {
  const handleDripTypeChange = (value: DripType) => {
    onChange({
      dripType: value,
      dripDate: value === 'schedule' ? dripDate : null,
      dripDaysAfterEnrollment: value === 'after_enrollment' ? dripDaysAfterEnrollment : null,
      dripPrerequisiteId: value === 'prerequisite' ? dripPrerequisiteId : null,
    });
  };

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="middle">
      <div>
        <Text strong style={{ display: 'block', marginBottom: 4 }}>
          Тип доступа к контенту
        </Text>
        <Select
          style={{ width: '100%' }}
          value={dripType}
          onChange={handleDripTypeChange}
          options={dripTypeOptions}
        />
      </div>

      {dripType === 'schedule' && (
        <div>
          <Text strong style={{ display: 'block', marginBottom: 4 }}>
            Дата открытия
          </Text>
          <DatePicker
            style={{ width: '100%' }}
            showTime
            format="DD.MM.YYYY HH:mm"
            placeholder="Выберите дату и время"
            value={dripDate ? dayjs(dripDate) : null}
            onChange={(date) =>
              onChange({
                dripType,
                dripDate: date?.toISOString() ?? null,
                dripDaysAfterEnrollment: null,
                dripPrerequisiteId: null,
              })
            }
          />
        </div>
      )}

      {dripType === 'after_enrollment' && (
        <div>
          <Text strong style={{ display: 'block', marginBottom: 4 }}>
            Дней после записи
          </Text>
          <InputNumber
            style={{ width: '100%' }}
            min={1}
            placeholder="Количество дней"
            value={dripDaysAfterEnrollment}
            onChange={(value) =>
              onChange({
                dripType,
                dripDate: null,
                dripDaysAfterEnrollment: value,
                dripPrerequisiteId: null,
              })
            }
          />
        </div>
      )}

      {dripType === 'prerequisite' && (
        <div>
          <Text strong style={{ display: 'block', marginBottom: 4 }}>
            ID пререквизита
          </Text>
          <Input
            placeholder="Введите ID урока или модуля-пререквизита"
            value={dripPrerequisiteId ?? ''}
            onChange={(e) =>
              onChange({
                dripType,
                dripDate: null,
                dripDaysAfterEnrollment: null,
                dripPrerequisiteId: e.target.value || null,
              })
            }
          />
        </div>
      )}
    </Space>
  );
};

export default ContentDripSettings;
