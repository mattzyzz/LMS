'use client';

import React, { useEffect, useState } from 'react';
import {
  Card, Tabs, Form, Input, InputNumber, Button, Space, message,
  ColorPicker, Divider, Typography, Spin, Row, Col, Tooltip,
} from 'antd';
import { SaveOutlined, CheckCircleOutlined, CopyOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import Link from 'next/link';
import api from '@/lib/api';
import { useThemeStore, ThemeConfig } from '@/stores/theme.store';

const { Title, Text } = Typography;

type ColorFieldDef = { key: keyof ThemeConfig; label: string };

const COLOR_GROUPS: { group: string; fields: ColorFieldDef[] }[] = [
  {
    group: 'Основные цвета',
    fields: [
      { key: 'colorPrimary', label: 'Основной (кнопки, ссылки)' },
      { key: 'colorSecondary', label: 'Вторичный' },
      { key: 'colorAccent', label: 'Акцент' },
      { key: 'colorBackground', label: 'Фон страницы' },
      { key: 'colorSurface', label: 'Фон карточек' },
      { key: 'colorBorder', label: 'Границы' },
    ],
  },
  {
    group: 'Текст',
    fields: [
      { key: 'colorTextPrimary', label: 'Основной текст' },
      { key: 'colorTextSecondary', label: 'Вторичный текст' },
      { key: 'colorTextMuted', label: 'Приглушённый текст' },
    ],
  },
  {
    group: 'Статусы',
    fields: [
      { key: 'colorSuccess', label: 'Успех' },
      { key: 'colorWarning', label: 'Предупреждение' },
      { key: 'colorError', label: 'Ошибка' },
      { key: 'colorInfo', label: 'Информация' },
    ],
  },
  {
    group: 'Навигация',
    fields: [
      { key: 'sidebarBg', label: 'Фон сайдбара' },
      { key: 'headerBg', label: 'Фон шапки' },
      { key: 'navActiveBg', label: 'Фон активного пункта' },
      { key: 'navActiveColor', label: 'Цвет активного пункта' },
    ],
  },
  {
    group: 'Статусы доступности',
    fields: [
      { key: 'colorStatusAvailable', label: 'Доступен' },
      { key: 'colorStatusBusy', label: 'Занят' },
      { key: 'colorStatusOnLeave', label: 'В отпуске' },
      { key: 'colorStatusOffline', label: 'Недоступен' },
    ],
  },
];

function ColorField({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
      <ColorPicker
        value={value}
        onChange={(_, hex) => onChange(hex)}
        size="small"
      />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 2 }}>{label}</div>
        <Input
          size="small"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ width: 110, fontFamily: 'monospace' }}
        />
      </div>
      <div style={{
        width: 32, height: 32, borderRadius: 6, background: value,
        border: '1px solid #e8e8e8', flexShrink: 0,
      }} />
    </div>
  );
}

export default function ThemeSettingsPage() {
  const [themes, setThemes] = useState<ThemeConfig[]>([]);
  const [editing, setEditing] = useState<ThemeConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { setTheme } = useThemeStore();

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/theme');
      setThemes(data);
      const active = data.find((t: ThemeConfig) => t.isActive) ?? data[0];
      if (active) setEditing({ ...active });
    } catch { message.error('Не удалось загрузить темы'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      const { data } = await api.patch(`/theme/${editing.id}`, editing);
      message.success('Сохранено');
      setThemes((prev) => prev.map((t) => (t.id === data.id ? data : t)));
      if (data.isActive) setTheme(data);
    } catch { message.error('Ошибка сохранения'); }
    finally { setSaving(false); }
  };

  const handleActivate = async (id: string) => {
    try {
      const { data } = await api.post(`/theme/${id}/activate`);
      message.success('Тема активирована');
      setTheme(data);
      setThemes((prev) => prev.map((t) => ({ ...t, isActive: t.id === id })));
      setEditing({ ...data });
    } catch { message.error('Ошибка'); }
  };

  const handleDuplicate = async (id: string) => {
    try {
      const { data } = await api.post(`/theme/${id}/duplicate`);
      setThemes((prev) => [...prev, data]);
      message.success('Тема дублирована');
    } catch { message.error('Ошибка'); }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/theme/${id}`);
      setThemes((prev) => prev.filter((t) => t.id !== id));
      message.success('Удалено');
    } catch (e: any) { message.error(e?.response?.data?.message ?? 'Ошибка'); }
  };

  const setField = (key: keyof ThemeConfig, value: unknown) => {
    setEditing((prev) => prev ? { ...prev, [key]: value } : prev);
  };

  if (loading) return <Spin style={{ display: 'block', margin: '80px auto' }} />;
  if (!editing) return null;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <Link href="/admin/settings">
          <Button icon={<ArrowLeftOutlined />} type="text" />
        </Link>
        <Title level={3} style={{ margin: 0 }}>Тема и брендинг</Title>
      </div>

      <Row gutter={[24, 24]}>
        {/* Left: theme list */}
        <Col xs={24} lg={6}>
          <Card title="Темы" size="small">
            {themes.map((t) => (
              <div
                key={t.id}
                style={{
                  padding: '8px 12px',
                  borderRadius: 8,
                  marginBottom: 4,
                  background: editing.id === t.id ? 'var(--nav-active-bg, #FFF0F0)' : '#fafafa',
                  cursor: 'pointer',
                  border: `1px solid ${t.isActive ? 'var(--color-primary, #E52322)' : '#e8e8e8'}`,
                }}
                onClick={() => setEditing({ ...t })}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text strong style={{ fontSize: 13 }}>{t.brandName}</Text>
                  {t.isActive && <CheckCircleOutlined style={{ color: 'var(--color-primary, #E52322)' }} />}
                </div>
                <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
                  <Tooltip title="Активировать">
                    <Button size="small" onClick={(e) => { e.stopPropagation(); handleActivate(t.id); }}
                      disabled={t.isActive} type={t.isActive ? 'primary' : 'default'}>
                      {t.isActive ? 'Активна' : 'Активировать'}
                    </Button>
                  </Tooltip>
                  <Tooltip title="Дублировать">
                    <Button size="small" icon={<CopyOutlined />} onClick={(e) => { e.stopPropagation(); handleDuplicate(t.id); }} />
                  </Tooltip>
                </div>
              </div>
            ))}
            <Button
              block
              type="dashed"
              style={{ marginTop: 8 }}
              onClick={async () => {
                const { data } = await api.post('/theme', { brandName: 'Новая тема' });
                setThemes((prev) => [...prev, data]);
                setEditing({ ...data });
              }}
            >
              + Новая тема
            </Button>
          </Card>
        </Col>

        {/* Right: editor */}
        <Col xs={24} lg={18}>
          <Card
            title={`Редактирование: ${editing.brandName}`}
            extra={
              <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={handleSave}>
                Сохранить
              </Button>
            }
          >
            <Tabs
              items={[
                {
                  key: 'branding',
                  label: 'Брендинг',
                  children: (
                    <Row gutter={24}>
                      <Col xs={24} md={12}>
                        <Form layout="vertical">
                          <Form.Item label="Название бренда">
                            <Input value={editing.brandName} onChange={(e) => setField('brandName', e.target.value)} />
                          </Form.Item>
                          <Form.Item label="URL логотипа">
                            <Input value={editing.logoUrl ?? ''} onChange={(e) => setField('logoUrl', e.target.value || null)} placeholder="https://..." />
                          </Form.Item>
                          <Form.Item label="URL favicon">
                            <Input value={editing.faviconUrl ?? ''} onChange={(e) => setField('faviconUrl', e.target.value || null)} placeholder="https://..." />
                          </Form.Item>
                        </Form>
                      </Col>
                      <Col xs={24} md={12}>
                        <div style={{
                          border: '1px solid #e8e8e8', borderRadius: 12, padding: 24,
                          background: editing.sidebarBg,
                        }}>
                          <Text type="secondary" style={{ fontSize: 12 }}>Предпросмотр логотипа</Text>
                          <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
                            {editing.logoUrl ? (
                              <img src={editing.logoUrl} alt="logo" style={{ height: 40, maxWidth: 120, objectFit: 'contain' }} />
                            ) : (
                              <div style={{
                                width: 40, height: 40, borderRadius: 8,
                                background: editing.colorPrimary,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                              }}>
                                <span style={{ color: '#fff', fontSize: 20, fontWeight: 700 }}>
                                  {editing.brandName?.[0]?.toUpperCase()}
                                </span>
                              </div>
                            )}
                            <span style={{ fontSize: 20, fontWeight: 700, color: editing.colorTextPrimary }}>
                              {editing.brandName}
                            </span>
                          </div>
                        </div>
                      </Col>
                    </Row>
                  ),
                },
                {
                  key: 'colors',
                  label: 'Цвета',
                  children: (
                    <Row gutter={24}>
                      {COLOR_GROUPS.map((g) => (
                        <Col xs={24} md={12} key={g.group}>
                          <Divider orientation="left" style={{ fontSize: 13 }}>{g.group}</Divider>
                          {g.fields.map((f) => (
                            <ColorField
                              key={f.key}
                              label={f.label}
                              value={String(editing[f.key] ?? '')}
                              onChange={(v) => setField(f.key, v)}
                            />
                          ))}
                        </Col>
                      ))}
                    </Row>
                  ),
                },
                {
                  key: 'typography',
                  label: 'Типографика',
                  children: (
                    <Form layout="vertical">
                      <Row gutter={24}>
                        <Col xs={24} md={12}>
                          <Form.Item label="Шрифт (base)">
                            <Input value={editing.fontFamilyBase} onChange={(e) => setField('fontFamilyBase', e.target.value)} />
                          </Form.Item>
                          <Form.Item label="Шрифт заголовков (опционально)">
                            <Input value={editing.fontFamilyHeading ?? ''} onChange={(e) => setField('fontFamilyHeading', e.target.value || null)} placeholder="Inherit from base" />
                          </Form.Item>
                          <Form.Item label="Размер шрифта (px)">
                            <InputNumber min={10} max={24} value={editing.fontSizeBase} onChange={(v) => setField('fontSizeBase', v)} style={{ width: '100%' }} />
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                          <Form.Item label="Жирность обычного текста">
                            <InputNumber min={100} max={900} step={100} value={editing.fontWeightNormal} onChange={(v) => setField('fontWeightNormal', v)} style={{ width: '100%' }} />
                          </Form.Item>
                          <Form.Item label="Жирность medium">
                            <InputNumber min={100} max={900} step={100} value={editing.fontWeightMedium} onChange={(v) => setField('fontWeightMedium', v)} style={{ width: '100%' }} />
                          </Form.Item>
                          <Form.Item label="Жирность bold">
                            <InputNumber min={100} max={900} step={100} value={editing.fontWeightBold} onChange={(v) => setField('fontWeightBold', v)} style={{ width: '100%' }} />
                          </Form.Item>
                          <Form.Item label="Высота строки">
                            <InputNumber min={1} max={3} step={0.1} value={Number(editing.lineHeightBase)} onChange={(v) => setField('lineHeightBase', v)} style={{ width: '100%' }} />
                          </Form.Item>
                        </Col>
                      </Row>
                    </Form>
                  ),
                },
                {
                  key: 'spacing',
                  label: 'Отступы и радиусы',
                  children: (
                    <Form layout="vertical">
                      <Row gutter={24}>
                        <Col xs={24} md={12}>
                          <Divider orientation="left">Отступы</Divider>
                          <Form.Item label="Базовая единица (px)">
                            <InputNumber min={4} max={16} value={editing.spacingUnit} onChange={(v) => setField('spacingUnit', v)} style={{ width: '100%' }} />
                          </Form.Item>
                          <Form.Item label="Padding карточки (px)">
                            <InputNumber min={8} max={48} value={editing.spacingCardPadding} onChange={(v) => setField('spacingCardPadding', v)} style={{ width: '100%' }} />
                          </Form.Item>
                          <Form.Item label="Gap в карточке (px)">
                            <InputNumber min={4} max={32} value={editing.spacingCardGap} onChange={(v) => setField('spacingCardGap', v)} style={{ width: '100%' }} />
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                          <Divider orientation="left">Скругления</Divider>
                          <Form.Item label="Small (px)">
                            <InputNumber min={0} max={24} value={editing.borderRadiusSm} onChange={(v) => setField('borderRadiusSm', v)} style={{ width: '100%' }} />
                          </Form.Item>
                          <Form.Item label="Medium (px)">
                            <InputNumber min={0} max={24} value={editing.borderRadiusMd} onChange={(v) => setField('borderRadiusMd', v)} style={{ width: '100%' }} />
                          </Form.Item>
                          <Form.Item label="Large (px)">
                            <InputNumber min={0} max={32} value={editing.borderRadiusLg} onChange={(v) => setField('borderRadiusLg', v)} style={{ width: '100%' }} />
                          </Form.Item>
                          <Form.Item label="Card (px)">
                            <InputNumber min={0} max={32} value={editing.borderRadiusCard} onChange={(v) => setField('borderRadiusCard', v)} style={{ width: '100%' }} />
                          </Form.Item>
                        </Col>
                      </Row>
                    </Form>
                  ),
                },
                {
                  key: 'shadows',
                  label: 'Тени',
                  children: (
                    <Form layout="vertical">
                      <Form.Item label="Тень SM">
                        <Input value={editing.shadowSm} onChange={(e) => setField('shadowSm', e.target.value)} />
                      </Form.Item>
                      <Form.Item label="Тень MD">
                        <Input value={editing.shadowMd} onChange={(e) => setField('shadowMd', e.target.value)} />
                      </Form.Item>
                      <Form.Item label="Тень LG">
                        <Input value={editing.shadowLg} onChange={(e) => setField('shadowLg', e.target.value)} />
                      </Form.Item>

                      <Divider />
                      <Space>
                        <div style={{ width: 80, height: 80, background: editing.colorSurface, borderRadius: editing.borderRadiusMd, boxShadow: editing.shadowSm, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Text style={{ fontSize: 11 }}>SM</Text>
                        </div>
                        <div style={{ width: 80, height: 80, background: editing.colorSurface, borderRadius: editing.borderRadiusMd, boxShadow: editing.shadowMd, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Text style={{ fontSize: 11 }}>MD</Text>
                        </div>
                        <div style={{ width: 80, height: 80, background: editing.colorSurface, borderRadius: editing.borderRadiusMd, boxShadow: editing.shadowLg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Text style={{ fontSize: 11 }}>LG</Text>
                        </div>
                      </Space>
                    </Form>
                  ),
                },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
