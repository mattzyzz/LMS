'use client';

import React, { useEffect, useState } from 'react';
import {
  Card, Form, Input, InputNumber, Switch, Button, Divider,
  message, Spin, Typography, Row, Col, Space,
} from 'antd';
import { SaveOutlined, ReloadOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import Link from 'next/link';
import api from '@/lib/api';

const { Title } = Typography;

interface OrgStructureConfig {
  id: string;
  headLabelDepth0: string;
  headLabelDepthN: string;
  unassignedLabel: string;
  showPhone: boolean;
  showEmail: boolean;
  showEmployeeNumber: boolean;
  showPosition: boolean;
  showManager: boolean;
  cardFieldsOrder: string[];
  avatarSize: number;
  showVacationBadge: boolean;
  circleButtonSize: number;
  fontSizeDeptDepth0: number;
  fontSizeDeptDepthN: number;
}

export default function OrgStructureConfigPage() {
  const [config, setConfig] = useState<OrgStructureConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [form] = Form.useForm();

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/org-structure-config');
      setConfig(data);
      form.setFieldsValue(data);
    } catch { message.error('Не удалось загрузить настройки'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    const vals = form.getFieldsValue();
    setSaving(true);
    try {
      const { data } = await api.patch('/org-structure-config', vals);
      setConfig(data);
      message.success('Сохранено');
    } catch { message.error('Ошибка сохранения'); }
    finally { setSaving(false); }
  };

  const handleReset = async () => {
    setResetting(true);
    try {
      const { data } = await api.post('/org-structure-config/reset');
      setConfig(data);
      form.setFieldsValue(data);
      message.success('Сброшено до умолчаний');
    } catch { message.error('Ошибка'); }
    finally { setResetting(false); }
  };

  if (loading) return <Spin style={{ display: 'block', margin: '80px auto' }} />;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <Link href="/admin/settings">
          <Button icon={<ArrowLeftOutlined />} type="text" />
        </Link>
        <Title level={3} style={{ margin: 0 }}>Настройки оргструктуры</Title>
        <Space style={{ marginLeft: 'auto' }}>
          <Button icon={<ReloadOutlined />} loading={resetting} onClick={handleReset}>
            Сбросить
          </Button>
          <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={handleSave}>
            Сохранить
          </Button>
        </Space>
      </div>

      <Form form={form} layout="vertical">
        <Row gutter={[24, 0]}>
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
              <Form.Item name="fontSizeDeptDepth0" label="Шрифт: отдел верх. уровня (px)">
                <InputNumber min={12} max={24} style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item name="fontSizeDeptDepthN" label="Шрифт: подотдел (px)">
                <InputNumber min={12} max={24} style={{ width: '100%' }} />
              </Form.Item>
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card title="Поля карточки сотрудника">
              <Form.Item name="showEmail" label="Email" valuePropName="checked">
                <Switch />
              </Form.Item>
              <Form.Item name="showPhone" label="Телефон" valuePropName="checked">
                <Switch />
              </Form.Item>
              <Form.Item name="showEmployeeNumber" label="Табельный номер" valuePropName="checked">
                <Switch />
              </Form.Item>
              <Form.Item name="showPosition" label="Должность" valuePropName="checked">
                <Switch />
              </Form.Item>
              <Form.Item name="showManager" label="Руководитель" valuePropName="checked">
                <Switch />
              </Form.Item>
              <Divider />
              <Form.Item name="showVacationBadge" label="Показывать бейдж отпуска" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Card>
          </Col>
        </Row>
      </Form>
    </div>
  );
}
