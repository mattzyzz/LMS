'use client';

import React, { useEffect, useState } from 'react';
import {
  Card, Form, Input, InputNumber, Switch, Button,
  message, Spin, Typography, Row, Col, Space,
} from 'antd';
import { SaveOutlined, ReloadOutlined } from '@ant-design/icons';
import superadminApi from '@/lib/superadmin-api';

const { Title } = Typography;

export default function SuperadminOrgStructurePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [form] = Form.useForm();

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await superadminApi.get('/org-structure-config');
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

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0, flex: 1 }}>Настройки оргструктуры</Title>
        <Space>
          <Button icon={<ReloadOutlined />} loading={resetting} onClick={handleReset}>Сбросить</Button>
          <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={handleSave}>
            Сохранить
          </Button>
        </Space>
      </div>

      <Form form={form} layout="vertical">
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={12}>
            <Card title="Подписи руководителей" style={{ marginBottom: 24 }}>
              <Form.Item name="headLabelDepth0" label="Глава верхнего уровня">
                <Input placeholder="Директор департамента" />
              </Form.Item>
              <Form.Item name="headLabelDepthN" label="Руководитель отдела (N уровень)">
                <Input placeholder="Руководитель отдела" />
              </Form.Item>
              <Form.Item name="unassignedLabel" label="Метка для незаполненных">
                <Input placeholder="не назначен" />
              </Form.Item>
            </Card>

            <Card title="Визуальные параметры">
              <Form.Item name="avatarSize" label="Размер аватара (px)">
                <InputNumber min={32} max={120} style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item name="circleButtonSize" label="Размер кнопки +/- (px)">
                <InputNumber min={20} max={60} style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item name="fontSizeDeptDepth0" label="Шрифт: верхний уровень (px)">
                <InputNumber min={12} max={24} style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item name="fontSizeDeptDepthN" label="Шрифт: подотделы (px)">
                <InputNumber min={12} max={24} style={{ width: '100%' }} />
              </Form.Item>
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card title="Поля карточки сотрудника">
              {[
                { name: 'showEmail', label: 'Email' },
                { name: 'showPhone', label: 'Телефон' },
                { name: 'showEmployeeNumber', label: 'Табельный номер' },
                { name: 'showPosition', label: 'Должность' },
                { name: 'showManager', label: 'Руководитель' },
                { name: 'showVacationBadge', label: 'Бейдж отпуска' },
              ].map((f) => (
                <Form.Item key={f.name} name={f.name} label={f.label} valuePropName="checked">
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
