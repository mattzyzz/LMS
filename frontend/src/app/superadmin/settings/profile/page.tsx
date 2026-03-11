'use client';

import React, { useEffect, useState } from 'react';
import {
  Card, Switch, Button, message, Spin, Typography, Space,
  Checkbox, Divider, Tag,
} from 'antd';
import superadminApi from '@/lib/superadmin-api';
import api from '@/lib/api';

const { Title, Text } = Typography;

interface ProfileSectionConfig {
  id: string; sectionKey: string; label: string;
  isVisible: boolean; sortOrder: number; visibleFields: string[];
}

const OVERVIEW_FIELDS = [
  { key: 'phone', label: 'Телефон' }, { key: 'email', label: 'Email' },
  { key: 'hireDate', label: 'Дата найма' }, { key: 'bio', label: 'О себе' },
  { key: 'city', label: 'Город' }, { key: 'workSchedule', label: 'График работы' },
  { key: 'manager', label: 'Руководитель' }, { key: 'department', label: 'Отдел' },
  { key: 'position', label: 'Должность' },
];

export default function SuperadminProfilePage() {
  const [sections, setSections] = useState<ProfileSectionConfig[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/profile-config');
      setSections(Array.isArray(data) ? data : []);
    } catch { message.error('Не удалось загрузить настройки'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleVisibility = async (key: string, isVisible: boolean) => {
    try {
      await superadminApi.patch(`/profile-config/${key}`, { isVisible });
      setSections((prev) => prev.map((s) => s.sectionKey === key ? { ...s, isVisible } : s));
      message.success('Сохранено');
    } catch { message.error('Ошибка'); }
  };

  const handleFieldToggle = async (key: string, field: string, checked: boolean) => {
    const section = sections.find((s) => s.sectionKey === key);
    if (!section) return;
    const visibleFields = checked
      ? [...section.visibleFields, field]
      : section.visibleFields.filter((f) => f !== field);
    try {
      await superadminApi.patch(`/profile-config/${key}`, { visibleFields });
      setSections((prev) => prev.map((s) => s.sectionKey === key ? { ...s, visibleFields } : s));
    } catch { message.error('Ошибка'); }
  };

  const handleReorder = async (reordered: ProfileSectionConfig[]) => {
    const items = reordered.map((s, i) => ({ sectionKey: s.sectionKey, sortOrder: i }));
    try {
      await superadminApi.post('/profile-config/reorder', { items });
      setSections(reordered.map((s, i) => ({ ...s, sortOrder: i })));
      message.success('Порядок сохранён');
    } catch { message.error('Ошибка'); }
  };

  if (loading) return <Spin style={{ display: 'block', margin: '80px auto' }} />;

  const cardStyle = { background: '#1a1a1a', borderColor: '#2a2a2a', borderRadius: 12 };

  return (
    <div>
      <Title level={3} style={{ color: '#fff', marginBottom: 24 }}>Настройки профиля</Title>

      <Card title={<span style={{ color: '#eee' }}>Разделы профиля сотрудника</span>} style={cardStyle}>
        <Text style={{ color: '#888', display: 'block', marginBottom: 16, fontSize: 13 }}>
          Управляйте видимостью вкладок и полей в профиле сотрудника.
        </Text>

        {[...sections].sort((a, b) => a.sortOrder - b.sortOrder).map((section) => (
          <div
            key={section.sectionKey}
            style={{
              padding: '12px 16px', borderRadius: 8, marginBottom: 8,
              background: '#222', border: '1px solid #333',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Switch
                checked={section.isVisible}
                onChange={(v) => handleVisibility(section.sectionKey, v)}
                size="small"
              />
              <span style={{ fontWeight: 600, fontSize: 14, color: '#eee' }}>{section.label}</span>
              <Tag color={section.isVisible ? 'success' : 'default'}>
                {section.isVisible ? 'Видна' : 'Скрыта'}
              </Tag>
            </div>

            {section.sectionKey === 'overview' && section.isVisible && (
              <>
                <Divider style={{ margin: '12px 0', borderColor: '#333' }} />
                <Text style={{ color: '#888', fontSize: 12, display: 'block', marginBottom: 8 }}>
                  Поля на вкладке:
                </Text>
                <Space wrap>
                  {OVERVIEW_FIELDS.map((f) => (
                    <Checkbox
                      key={f.key}
                      checked={section.visibleFields.includes(f.key)}
                      onChange={(e) => handleFieldToggle(section.sectionKey, f.key, e.target.checked)}
                      style={{ color: '#ccc' }}
                    >
                      {f.label}
                    </Checkbox>
                  ))}
                </Space>
              </>
            )}
          </div>
        ))}

        <Divider style={{ borderColor: '#333' }} />
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <Text style={{ color: '#666', fontSize: 12 }}>Порядок вкладок:</Text>
          {[...sections].sort((a, b) => a.sortOrder - b.sortOrder).map((s, i) => (
            <Space key={s.sectionKey}>
              {i > 0 && (
                <Button size="small" onClick={() => {
                  const arr = [...sections].sort((a, b) => a.sortOrder - b.sortOrder);
                  [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]];
                  handleReorder(arr);
                }}>
                  ← {s.label}
                </Button>
              )}
            </Space>
          ))}
        </div>
      </Card>
    </div>
  );
}
