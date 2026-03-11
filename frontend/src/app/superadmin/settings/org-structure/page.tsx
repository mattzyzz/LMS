'use client';

import React, { useEffect, useState } from 'react';
import {
  Card, Form, Input, InputNumber, Switch, Button, Divider,
  message, Spin, Typography, Row, Col, Space,
} from 'antd';
import { SaveOutlined, ReloadOutlined } from '@ant-design/icons';
import superadminApi from '@/lib/superadmin-api';
import api from '@/lib/api';

const { Title } = Typography;

export default function SuperadminOrgStructurePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [form] = Form.useForm();

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/org-structure-config');
      form.setFieldsValue(data);
    } catch { message.error('Не удалось загрузить настройки'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    const vals = form.getFieldsValue();
    setSaving(true);
    try {
      await superadminApi.patch('/org-structure-config', vals);
      message.success('Сохранено');
    } catch { message.error('Ошибка сохранения'); }
    finally { setSaving(false); }
  };

  const handleReset = async () => {
    setResetting(true);
    try {
      const { data } = await superadminApi.post('/org-structure-config/reset');
      form.setFieldsValue(data);
      message.success('Сброшено до умолчаний');
    } catch { message.error('Ошибка'); }
    finally { setResetting(false); }
  };

  if (loading) return <Spin style={{ display: 'block', margin: '80px auto' }} />;

  const cardStyle = { background: '#1a1a1a', borderColor: '#2a2a2a', borderRadius: 12 };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
        <Title level={3} style={{ color: '#fff', margin: 0, flex: 1 }}>Настройки оргструктуры</Title>
        <Space>
          <Button icon={<ReloadOutlined />} loading={resetting} onClick={handleReset}>Сбросить</Button>
          <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={handleSave}
            style={{ background: '#E52322', borderColor: '#E52322' }}>
            Сохранить
          </Button>
        </Space>
      </div>

      <Form form={form} layout="vertical">
        <Row gutter={[24, 0]}>
          <Col xs={24} lg={12}>
            <Card title={<span style={{ color: '#eee' }}>Подписи руководителей</span>} style={{ ...cardStyle, marginBottom: 24 }}>
              <Form.Item name="headLabelDepth0" label={<span style={{ color: '#ccc' }}>Глава верхнего уровня</span>}>
                <Input placeholder="Директор департамента" />
              </Form.Item>
              <Form.Item name="headLabelDepthN" label={<span style={{ color: '#ccc' }}>Руководитель отдела (N уровень)</span>}>
                <Input placeholder="Руководитель отдела" />
              </Form.Item>
              <Form.Item name="unassignedLabel" label={<span style={{ color: '#ccc' }}>Метка для незаполненных</span>}>
                <Input placeholder="не назначен" />
              </Form.Item>
            </Card>

            <Card title={<span style={{ color: '#eee' }}>Визуальные параметры</span>} style={cardStyle}>
              <Form.Item name="avatarSize" label={<span style={{ color: '#ccc' }}>Размер аватара (px)</span>}>
                <InputNumber min={32} max={120} style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item name="circleButtonSize" label={<span style={{ color: '#ccc' }}>Размер кнопки +/- (px)</span>}>
                <InputNumber min={20} max={60} style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item name="fontSizeDeptDepth0" label={<span style={{ color: '#ccc' }}>Шрифт: верхний уровень (px)</span>}>
                <InputNumber min={12} max={24} style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item name="fontSizeDeptDepthN" label={<span style={{ color: '#ccc' }}>Шрифт: подотделы (px)</span>}>
                <InputNumber min={12} max={24} style={{ width: '100%' }} />
              </Form.Item>
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card title={<span style={{ color: '#eee' }}>Поля карточки сотрудника</span>} style={cardStyle}>
              {[
                { name: 'showEmail', label: 'Email' },
                { name: 'showPhone', label: 'Телефон' },
                { name: 'showEmployeeNumber', label: 'Табельный номер' },
                { name: 'showPosition', label: 'Должность' },
                { name: 'showManager', label: 'Руководитель' },
                { name: 'showVacationBadge', label: 'Бейдж отпуска' },
              ].map((f) => (
                <Form.Item key={f.name} name={f.name} label={<span style={{ color: '#ccc' }}>{f.label}</span>} valuePropName="checked">
                  <Switch />
                </Form.Item>
              ))}
            </Card>
          </Col>
        </Row>
      </Form>
    </div>
  );
}
