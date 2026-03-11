'use client';

import React, { useEffect, useState } from 'react';
import {
  Card, Tabs, Form, Input, InputNumber, Button, Space, message,
  ColorPicker, Divider, Typography, Spin, Row, Col, Tooltip, Tag,
} from 'antd';
import type { Color } from 'antd/es/color-picker';
import { SaveOutlined, CheckCircleOutlined, CopyOutlined } from '@ant-design/icons';
import superadminApi from '@/lib/superadmin-api';
import api from '@/lib/api';
import { useThemeStore, ThemeConfig } from '@/stores/theme.store';

const { Title, Text } = Typography;

type ColorKey = keyof ThemeConfig;

// Fields that are safe to send to the API (UpdateThemeDto fields only)
const DTO_FIELDS: (keyof ThemeConfig)[] = [
  'brandName','logoUrl','faviconUrl',
  'colorPrimary','colorSecondary','colorAccent','colorBackground','colorSurface',
  'colorBorder','colorTextPrimary','colorTextSecondary','colorTextMuted',
  'colorSuccess','colorWarning','colorError','colorInfo',
  'colorStatusAvailable','colorStatusBusy','colorStatusOnLeave','colorStatusOffline',
  'sidebarBg','headerBg','navActiveBg','navActiveColor',
  'fontFamilyBase','fontFamilyHeading','fontSizeBase','fontScaleRatio',
  'fontWeightNormal','fontWeightMedium','fontWeightBold','lineHeightBase',
  'spacingUnit','spacingCardPadding','spacingCardGap',
  'borderRadiusSm','borderRadiusMd','borderRadiusLg','borderRadiusCard','borderRadiusFull',
  'shadowSm','shadowMd','shadowLg',
];

function toPayload(editing: ThemeConfig): Partial<ThemeConfig> {
  const payload: any = {};
  for (const k of DTO_FIELDS) {
    if (editing[k] !== undefined) payload[k] = editing[k];
  }
  return payload;
}

// Extract hex string from Ant Design ColorPicker value
function colorToHex(val: string | Color): string {
  if (typeof val === 'string') return val;
  // Ant Design Color object
  if (typeof (val as any).toHexString === 'function') {
    return (val as any).toHexString();
  }
  return String(val);
}

type ColorFieldDef = { key: ColorKey; label: string };

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

function ColorField({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
      <ColorPicker
        value={value}
        onChange={(color) => onChange(colorToHex(color))}
        size="small"
      />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, color: '#888', marginBottom: 2 }}>{label}</div>
        <Input
          size="small"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ width: 110, fontFamily: 'monospace', fontSize: 12 }}
        />
      </div>
      <div style={{
        width: 28, height: 28, borderRadius: 6, background: value,
        border: '1px solid rgba(255,255,255,0.1)', flexShrink: 0,
      }} />
    </div>
  );
}

export default function SuperadminThemePage() {
  const [themes, setThemes] = useState<ThemeConfig[]>([]);
  const [editing, setEditing] = useState<ThemeConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { setTheme } = useThemeStore();

  const load = async () => {
    setLoading(true);
    try {
      // Use regular api for reading (requires user JWT)
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
      const payload = toPayload(editing);
      const { data } = await superadminApi.patch(`/theme/${editing.id}`, payload);
      message.success('Сохранено');
      setThemes((prev) => prev.map((t) => (t.id === data.id ? data : t)));
      if (data.isActive) setTheme(data);
      setEditing({ ...data });
    } catch (e: any) {
      const msg = e?.response?.data?.message;
      message.error(Array.isArray(msg) ? msg.join(', ') : (msg ?? 'Ошибка сохранения'));
    } finally { setSaving(false); }
  };

  const handleActivate = async (id: string) => {
    try {
      const { data } = await superadminApi.post(`/theme/${id}/activate`);
      message.success('Тема активирована');
      setTheme(data);
      setThemes((prev) => prev.map((t) => ({ ...t, isActive: t.id === id })));
      setEditing({ ...data });
    } catch { message.error('Ошибка'); }
  };

  const handleDuplicate = async (id: string) => {
    try {
      const { data } = await superadminApi.post(`/theme/${id}/duplicate`);
      setThemes((prev) => [...prev, data]);
      message.success('Тема дублирована');
    } catch { message.error('Ошибка'); }
  };

  const handleDelete = async (id: string) => {
    try {
      await superadminApi.delete(`/theme/${id}`);
      setThemes((prev) => prev.filter((t) => t.id !== id));
      message.success('Удалено');
    } catch (e: any) { message.error(e?.response?.data?.message ?? 'Ошибка'); }
  };

  const setField = (key: keyof ThemeConfig, value: unknown) => {
    setEditing((prev) => prev ? { ...prev, [key]: value } : prev);
  };

  const cardStyle = { background: '#1a1a1a', borderColor: '#2a2a2a', borderRadius: 12 };

  if (loading) return <Spin style={{ display: 'block', margin: '80px auto' }} />;
  if (!editing) return null;

  return (
    <div>
      <Title level={3} style={{ color: '#fff', marginBottom: 24 }}>Тема и брендинг</Title>

      <Row gutter={[24, 24]}>
        {/* Theme list */}
        <Col xs={24} lg={6}>
          <Card title={<span style={{ color: '#fff' }}>Темы</span>} size="small" style={cardStyle}>
            {themes.map((t) => (
              <div
                key={t.id}
                style={{
                  padding: '8px 12px', borderRadius: 8, marginBottom: 6, cursor: 'pointer',
                  background: editing.id === t.id ? 'rgba(229,35,34,0.12)' : '#222',
                  border: `1px solid ${t.isActive ? '#E52322' : '#333'}`,
                }}
                onClick={() => setEditing({ ...t })}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={{ color: '#eee', fontSize: 13, fontWeight: 600 }}>{t.brandName}</Text>
                  {t.isActive && <CheckCircleOutlined style={{ color: '#E52322' }} />}
                </div>
                <Space size={4} style={{ marginTop: 6 }}>
                  <Button size="small" onClick={(e) => { e.stopPropagation(); handleActivate(t.id); }}
                    disabled={t.isActive}
                    style={t.isActive ? { background: '#E52322', borderColor: '#E52322', color: '#fff' } : {}}>
                    {t.isActive ? 'Активна' : 'Активировать'}
                  </Button>
                  <Button size="small" icon={<CopyOutlined />} onClick={(e) => { e.stopPropagation(); handleDuplicate(t.id); }} />
                </Space>
              </div>
            ))}
            <Button block type="dashed" style={{ marginTop: 8, borderColor: '#444', color: '#aaa' }}
              onClick={async () => {
                const { data } = await superadminApi.post('/theme', { brandName: 'Новая тема' });
                setThemes((prev) => [...prev, data]);
                setEditing({ ...data });
              }}>
              + Новая тема
            </Button>
          </Card>
        </Col>

        {/* Editor */}
        <Col xs={24} lg={18}>
          <Card
            title={<span style={{ color: '#fff' }}>Редактирование: {editing.brandName}</span>}
            extra={
              <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={handleSave}
                style={{ background: '#E52322', borderColor: '#E52322' }}>
                Сохранить
              </Button>
            }
            style={cardStyle}
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
                          <Form.Item label={<span style={{ color: '#ccc' }}>Название бренда</span>}>
                            <Input value={editing.brandName} onChange={(e) => setField('brandName', e.target.value)} />
                          </Form.Item>
                          <Form.Item label={<span style={{ color: '#ccc' }}>URL логотипа</span>}>
                            <Input value={editing.logoUrl ?? ''} onChange={(e) => setField('logoUrl', e.target.value || null)} placeholder="https://..." />
                          </Form.Item>
                          <Form.Item label={<span style={{ color: '#ccc' }}>URL favicon</span>}>
                            <Input value={editing.faviconUrl ?? ''} onChange={(e) => setField('faviconUrl', e.target.value || null)} placeholder="https://..." />
                          </Form.Item>
                        </Form>
                      </Col>
                      <Col xs={24} md={12}>
                        <div style={{
                          border: '1px solid #333', borderRadius: 12, padding: 24,
                          background: editing.sidebarBg,
                        }}>
                          <Text style={{ color: '#888', fontSize: 12 }}>Предпросмотр логотипа</Text>
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
                            <span style={{ fontSize: 18, fontWeight: 700, color: editing.colorTextPrimary }}>
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
                          <Divider orientation="left" style={{ fontSize: 12, color: '#666' }}>{g.group}</Divider>
                          {g.fields.map((f) => (
                            <ColorField
                              key={String(f.key)}
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
                          <Form.Item label={<span style={{ color: '#ccc' }}>Шрифт (base)</span>}>
                            <Input value={editing.fontFamilyBase} onChange={(e) => setField('fontFamilyBase', e.target.value)} />
                          </Form.Item>
                          <Form.Item label={<span style={{ color: '#ccc' }}>Шрифт заголовков</span>}>
                            <Input value={editing.fontFamilyHeading ?? ''} onChange={(e) => setField('fontFamilyHeading', e.target.value || null)} placeholder="Inherit from base" />
                          </Form.Item>
                          <Form.Item label={<span style={{ color: '#ccc' }}>Размер шрифта (px)</span>}>
                            <InputNumber min={10} max={24} value={editing.fontSizeBase} onChange={(v) => setField('fontSizeBase', v)} style={{ width: '100%' }} />
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                          <Form.Item label={<span style={{ color: '#ccc' }}>Normal weight</span>}>
                            <InputNumber min={100} max={900} step={100} value={editing.fontWeightNormal} onChange={(v) => setField('fontWeightNormal', v)} style={{ width: '100%' }} />
                          </Form.Item>
                          <Form.Item label={<span style={{ color: '#ccc' }}>Medium weight</span>}>
                            <InputNumber min={100} max={900} step={100} value={editing.fontWeightMedium} onChange={(v) => setField('fontWeightMedium', v)} style={{ width: '100%' }} />
                          </Form.Item>
                          <Form.Item label={<span style={{ color: '#ccc' }}>Bold weight</span>}>
                            <InputNumber min={100} max={900} step={100} value={editing.fontWeightBold} onChange={(v) => setField('fontWeightBold', v)} style={{ width: '100%' }} />
                          </Form.Item>
                          <Form.Item label={<span style={{ color: '#ccc' }}>Высота строки</span>}>
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
                          <Divider orientation="left" style={{ fontSize: 12, color: '#666' }}>Отступы</Divider>
                          <Form.Item label={<span style={{ color: '#ccc' }}>Базовая единица (px)</span>}>
                            <InputNumber min={4} max={16} value={editing.spacingUnit} onChange={(v) => setField('spacingUnit', v)} style={{ width: '100%' }} />
                          </Form.Item>
                          <Form.Item label={<span style={{ color: '#ccc' }}>Padding карточки (px)</span>}>
                            <InputNumber min={8} max={48} value={editing.spacingCardPadding} onChange={(v) => setField('spacingCardPadding', v)} style={{ width: '100%' }} />
                          </Form.Item>
                          <Form.Item label={<span style={{ color: '#ccc' }}>Gap в карточке (px)</span>}>
                            <InputNumber min={4} max={32} value={editing.spacingCardGap} onChange={(v) => setField('spacingCardGap', v)} style={{ width: '100%' }} />
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                          <Divider orientation="left" style={{ fontSize: 12, color: '#666' }}>Скругления</Divider>
                          <Form.Item label={<span style={{ color: '#ccc' }}>SM (px)</span>}>
                            <InputNumber min={0} max={24} value={editing.borderRadiusSm} onChange={(v) => setField('borderRadiusSm', v)} style={{ width: '100%' }} />
                          </Form.Item>
                          <Form.Item label={<span style={{ color: '#ccc' }}>MD (px)</span>}>
                            <InputNumber min={0} max={24} value={editing.borderRadiusMd} onChange={(v) => setField('borderRadiusMd', v)} style={{ width: '100%' }} />
                          </Form.Item>
                          <Form.Item label={<span style={{ color: '#ccc' }}>LG (px)</span>}>
                            <InputNumber min={0} max={32} value={editing.borderRadiusLg} onChange={(v) => setField('borderRadiusLg', v)} style={{ width: '100%' }} />
                          </Form.Item>
                          <Form.Item label={<span style={{ color: '#ccc' }}>Card (px)</span>}>
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
                      <Form.Item label={<span style={{ color: '#ccc' }}>Тень SM</span>}>
                        <Input value={editing.shadowSm} onChange={(e) => setField('shadowSm', e.target.value)} />
                      </Form.Item>
                      <Form.Item label={<span style={{ color: '#ccc' }}>Тень MD</span>}>
                        <Input value={editing.shadowMd} onChange={(e) => setField('shadowMd', e.target.value)} />
                      </Form.Item>
                      <Form.Item label={<span style={{ color: '#ccc' }}>Тень LG</span>}>
                        <Input value={editing.shadowLg} onChange={(e) => setField('shadowLg', e.target.value)} />
                      </Form.Item>
                      <Divider />
                      <Space>
                        {['SM','MD','LG'].map((s, i) => (
                          <div key={s} style={{
                            width: 80, height: 80, background: '#fff', borderRadius: 8,
                            boxShadow: [editing.shadowSm, editing.shadowMd, editing.shadowLg][i],
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <Text style={{ fontSize: 11 }}>{s}</Text>
                          </div>
                        ))}
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
