'use client';

import React, { useEffect, useState } from 'react';
import {
  Card, Tabs, Table, Button, Space, Modal, Form, Input, InputNumber,
  Switch, Tag, Popconfirm, message, Typography, ColorPicker,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import Link from 'next/link';
import api from '@/lib/api';

const { Title } = Typography;

interface Position {
  id: string;
  title: string;
  slug: string | null;
  description: string | null;
  isActive: boolean;
  sortOrder: number;
}

interface DictItem {
  id: string;
  dictionaryType: string;
  code: string;
  label: string;
  color: string | null;
  sortOrder: number;
  isActive: boolean;
}

function useDict(type: string) {
  const [items, setItems] = useState<DictItem[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/dictionaries/${type}?all=true`);
      setItems(Array.isArray(data) ? data : []);
    } catch { message.error('Ошибка загрузки'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [type]);
  return { items, loading, reload: load };
}

function DictTable({ type, label }: { type: string; label: string }) {
  const { items, loading, reload } = useDict(type);
  const [editItem, setEditItem] = useState<DictItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  const openAdd = () => {
    form.resetFields();
    setEditItem(null);
    setModalOpen(true);
  };

  const openEdit = (item: DictItem) => {
    form.setFieldsValue(item);
    setEditItem(item);
    setModalOpen(true);
  };

  const handleSave = async () => {
    const vals = await form.validateFields();
    setSaving(true);
    try {
      if (editItem) {
        await api.patch(`/dictionaries/${type}/${editItem.id}`, vals);
        message.success('Обновлено');
      } else {
        await api.post(`/dictionaries/${type}`, vals);
        message.success('Добавлено');
      }
      setModalOpen(false);
      reload();
    } catch { message.error('Ошибка'); }
    finally { setSaving(false); }
  };

  const handleDeactivate = async (id: string) => {
    try {
      await api.delete(`/dictionaries/${type}/${id}`);
      message.success('Деактивировано');
      reload();
    } catch { message.error('Ошибка'); }
  };

  const columns = [
    { title: 'Код', dataIndex: 'code', key: 'code', width: 140, render: (v: string) => <code style={{ fontSize: 12 }}>{v}</code> },
    { title: 'Название', dataIndex: 'label', key: 'label' },
    {
      title: 'Цвет', dataIndex: 'color', key: 'color', width: 80,
      render: (v: string | null) => v ? <div style={{ width: 24, height: 24, borderRadius: 6, background: v, border: '1px solid #e8e8e8' }} /> : '—',
    },
    { title: 'Порядок', dataIndex: 'sortOrder', key: 'sortOrder', width: 80 },
    {
      title: 'Активен', dataIndex: 'isActive', key: 'isActive', width: 80,
      render: (v: boolean) => <Tag color={v ? 'success' : 'default'}>{v ? 'Да' : 'Нет'}</Tag>,
    },
    {
      title: '', key: 'actions', width: 100,
      render: (_: unknown, r: DictItem) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(r)} />
          <Popconfirm title="Деактивировать?" onConfirm={() => handleDeactivate(r.id)} okText="Да" cancelText="Нет">
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ color: '#8c8c8c', fontSize: 13 }}>{label}</span>
        <Button size="small" icon={<PlusOutlined />} type="primary" onClick={openAdd}>Добавить</Button>
      </div>
      <Table
        size="small"
        dataSource={items}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={false}
      />
      <Modal
        title={editItem ? 'Редактировать' : 'Добавить'}
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        confirmLoading={saving}
        okText="Сохранить"
        cancelText="Отмена"
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          {!editItem && (
            <Form.Item name="code" label="Код (machine key)" rules={[{ required: true }]}>
              <Input placeholder="e.g. senior, telegram" />
            </Form.Item>
          )}
          <Form.Item name="label" label="Название" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="color" label="Цвет (hex, опционально)">
            <Input placeholder="#1677ff" />
          </Form.Item>
          <Form.Item name="sortOrder" label="Порядок сортировки">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          {editItem && (
            <Form.Item name="isActive" label="Активен" valuePropName="checked">
              <Switch />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </>
  );
}

function PositionsTab() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editPos, setEditPos] = useState<Position | null>(null);
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/dictionaries/positions?all=true');
      setPositions(Array.isArray(data) ? data : []);
    } catch { message.error('Ошибка загрузки'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { form.resetFields(); setEditPos(null); setModalOpen(true); };
  const openEdit = (p: Position) => { form.setFieldsValue(p); setEditPos(p); setModalOpen(true); };

  const handleSave = async () => {
    const vals = await form.validateFields();
    setSaving(true);
    try {
      if (editPos) {
        await api.patch(`/dictionaries/positions/${editPos.id}`, vals);
        message.success('Обновлено');
      } else {
        await api.post('/dictionaries/positions', vals);
        message.success('Добавлено');
      }
      setModalOpen(false);
      load();
    } catch { message.error('Ошибка'); }
    finally { setSaving(false); }
  };

  const handleDeactivate = async (id: string) => {
    try {
      await api.delete(`/dictionaries/positions/${id}`);
      message.success('Деактивировано');
      load();
    } catch { message.error('Ошибка'); }
  };

  const columns = [
    { title: 'Название', dataIndex: 'title', key: 'title' },
    { title: 'Slug', dataIndex: 'slug', key: 'slug', render: (v: string) => <code style={{ fontSize: 12 }}>{v}</code> },
    { title: 'Описание', dataIndex: 'description', key: 'description', render: (v: string | null) => v ?? '—' },
    { title: 'Порядок', dataIndex: 'sortOrder', key: 'sortOrder', width: 80 },
    {
      title: 'Активна', dataIndex: 'isActive', key: 'isActive', width: 80,
      render: (v: boolean) => <Tag color={v ? 'success' : 'default'}>{v ? 'Да' : 'Нет'}</Tag>,
    },
    {
      title: '', key: 'actions', width: 100,
      render: (_: unknown, r: Position) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(r)} />
          <Popconfirm title="Деактивировать?" onConfirm={() => handleDeactivate(r.id)} okText="Да" cancelText="Нет">
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ color: '#8c8c8c', fontSize: 13 }}>Справочник должностей компании</span>
        <Button size="small" icon={<PlusOutlined />} type="primary" onClick={openAdd}>Добавить</Button>
      </div>
      <Table size="small" dataSource={positions} columns={columns} rowKey="id" loading={loading} pagination={false} />

      <Modal
        title={editPos ? 'Редактировать должность' : 'Новая должность'}
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        confirmLoading={saving}
        okText="Сохранить"
        cancelText="Отмена"
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="title" label="Название" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Описание">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="sortOrder" label="Порядок">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          {editPos && (
            <Form.Item name="isActive" label="Активна" valuePropName="checked">
              <Switch />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </>
  );
}

export default function DictionariesPage() {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <Link href="/admin/settings">
          <Button icon={<ArrowLeftOutlined />} type="text" />
        </Link>
        <Title level={3} style={{ margin: 0 }}>Справочники</Title>
      </div>

      <Card>
        <Tabs
          items={[
            { key: 'positions',     label: 'Должности',          children: <PositionsTab /> },
            { key: 'skill_level',   label: 'Уровни навыков',     children: <DictTable type="skill_level" label="Используются в профиле сотрудника" /> },
            { key: 'contact_type',  label: 'Типы контактов',     children: <DictTable type="contact_type" label="Типы контактов сотрудника" /> },
            { key: 'availability_label', label: 'Статусы доступности', children: <DictTable type="availability_label" label="Метки для статусов доступности с цветовой маркировкой" /> },
          ]}
        />
      </Card>
    </div>
  );
}
