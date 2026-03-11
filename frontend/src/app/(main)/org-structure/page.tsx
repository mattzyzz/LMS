'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Button, Col, Form, Input, Modal, Row, Select, Spin, Typography, message } from 'antd';
import { PlusOutlined, SearchOutlined, UserAddOutlined } from '@ant-design/icons';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/auth.store';
import DepartmentItem, { OrgDepartment, OrgEmployee } from '@/components/OrgStructure/DepartmentItem';

const { Title, Text } = Typography;

interface OrgStats {
  totalDepartments: number;
  totalEmployees: number;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function findEmployee(depts: OrgDepartment[], id: string): OrgEmployee | null {
  for (const d of depts) {
    const found = d.employees?.find((e) => e.id === id);
    if (found) return found;
    if (d.children?.length) {
      const r = findEmployee(d.children, id);
      if (r) return r;
    }
  }
  return null;
}

function moveEmployee(
  depts: OrgDepartment[],
  employeeId: string,
  targetDeptId: string,
): OrgDepartment[] {
  let moved: OrgEmployee | null = null;

  function removeFrom(list: OrgDepartment[]): OrgDepartment[] {
    return list.map((d) => ({
      ...d,
      employees: (d.employees ?? []).filter((e) => {
        if (e.id === employeeId) { moved = e; return false; }
        return true;
      }),
      children: d.children ? removeFrom(d.children) : [],
    }));
  }

  function addTo(list: OrgDepartment[]): OrgDepartment[] {
    return list.map((d) => {
      if (d.id === targetDeptId) {
        return {
          ...d,
          employees: [...(d.employees ?? []), { ...moved!, departmentId: targetDeptId }],
        };
      }
      return { ...d, children: d.children ? addTo(d.children) : [] };
    });
  }

  const without = removeFrom(depts);
  if (!moved) return depts;
  return addTo(without);
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function OrgStructurePage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'hrd';

  const [tree, setTree] = useState<OrgDepartment[]>([]);
  const [stats, setStats] = useState<OrgStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [draggingEmployee, setDraggingEmployee] = useState<OrgEmployee | null>(null);

  // Add root dept modal
  const [addDeptOpen, setAddDeptOpen] = useState(false);
  const [addDeptName, setAddDeptName] = useState('');
  const [addDeptLoading, setAddDeptLoading] = useState(false);

  // Create employee modal
  const [createEmpOpen, setCreateEmpOpen] = useState(false);
  const [createEmpLoading, setCreateEmpLoading] = useState(false);
  const [deptOptions, setDeptOptions] = useState<{ value: string; label: string }[]>([]);
  const [empForm] = Form.useForm();

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 6 } }),
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [treeRes, statsRes] = await Promise.all([
        api.get('/departments/tree'),
        api.get('/departments/stats'),
      ]);
      setTree(treeRes.data ?? []);
      setStats(statsRes.data ?? null);
    } catch {
      message.error('Не удалось загрузить оргструктуру');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDragStart = useCallback(
    (event: { active: { id: string | number } }) => {
      setDraggingEmployee(findEmployee(tree, String(event.active.id)));
    },
    [tree],
  );

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    setDraggingEmployee(null);
    const { active, over } = event;
    if (!over) return;

    const employeeId = String(active.id);
    const targetDeptId = String(over.id);
    const sourceDeptId = active.data.current?.departmentId as string | undefined;
    if (!sourceDeptId || sourceDeptId === targetDeptId) return;

    setTree((prev) => moveEmployee(prev, employeeId, targetDeptId));
    try {
      await api.patch(`/users/${employeeId}`, { departmentId: targetDeptId });
      message.success('Сотрудник перемещён');
    } catch {
      setTree((prev) => moveEmployee(prev, employeeId, sourceDeptId));
      message.error('Не удалось переместить сотрудника');
    }
  }, []);

  const openCreateEmp = async () => {
    setCreateEmpOpen(true);
    // Build flat list of depts for select
    const flatDepts: { value: string; label: string }[] = [];
    const flatten = (nodes: OrgDepartment[], prefix = '') => {
      nodes.forEach((d) => {
        flatDepts.push({ value: d.id, label: prefix + d.name });
        if (d.children?.length) flatten(d.children, prefix + '  ');
      });
    };
    flatten(tree);
    setDeptOptions(flatDepts);
  };

  const handleCreateEmployee = async () => {
    try {
      const values = await empForm.validateFields();
      setCreateEmpLoading(true);
      await api.post('/users', values);
      message.success(`Сотрудник ${values.lastName} ${values.firstName} создан`);
      empForm.resetFields();
      setCreateEmpOpen(false);
      await load();
    } catch (e: any) {
      if (e?.response?.data?.message) message.error(e.response.data.message);
    } finally {
      setCreateEmpLoading(false);
    }
  };

  const handleAddDept = async () => {
    if (!addDeptName.trim()) return;
    setAddDeptLoading(true);
    try {
      await api.post('/departments', { name: addDeptName.trim() });
      message.success('Департамент создан');
      setAddDeptOpen(false);
      setAddDeptName('');
      await load();
    } catch {
      message.error('Не удалось создать департамент');
    } finally {
      setAddDeptLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>
          Организационная структура
        </Title>
        {isAdmin && (
          <div style={{ display: 'flex', gap: 8 }}>
            <Button icon={<UserAddOutlined />} onClick={openCreateEmp}>
              Новый сотрудник
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddDeptOpen(true)}>
              Новый департамент
            </Button>
          </div>
        )}
      </div>

      <Row gutter={[40, 24]}>
        {/* ── Left: tree ─────────────────────────────────── */}
        <Col xs={24} lg={17}>
          <Input
            prefix={<SearchOutlined style={{ color: 'var(--color-text-secondary)' }} />}
            placeholder="Поиск сотрудника или отдела…"
            allowClear
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ marginBottom: 24, borderRadius: 8 }}
          />

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <Spin size="large" />
            </div>
          ) : tree.length === 0 ? (
            <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
              Нет данных об организационной структуре
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              {tree.map((dept) => (
                <DepartmentItem
                  key={dept.id}
                  dept={dept}
                  depth={0}
                  defaultExpanded={true}
                  searchQuery={search}
                  isAdmin={isAdmin}
                  onRefresh={load}
                />
              ))}

              <DragOverlay dropAnimation={null}>
                {draggingEmployee && (
                  <div
                    style={{
                      background: 'var(--color-bg-card)',
                      border: '1px solid var(--color-primary-accent)',
                      borderRadius: 8,
                      padding: '6px 16px',
                      fontSize: 13,
                      fontWeight: 600,
                      boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                      color: 'var(--color-text-primary)',
                      cursor: 'grabbing',
                    }}
                  >
                    {draggingEmployee.firstName} {draggingEmployee.lastName}
                  </div>
                )}
              </DragOverlay>
            </DndContext>
          )}
        </Col>

        {/* ── Right: stats sidebar ───────────────────────── */}
        <Col xs={24} lg={7}>
          <div style={{ position: 'sticky', top: 80 }}>
            {stats && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 16 }}>
                  <Text strong style={{ fontSize: 22, color: 'var(--color-primary-accent)' }}>
                    {stats.totalEmployees}
                  </Text>
                  <Text style={{ color: 'var(--color-text-secondary)', fontSize: 13 }}>
                    сотрудников в компании
                  </Text>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <Text strong style={{ fontSize: 22, color: 'var(--color-primary-accent)' }}>
                    {stats.totalDepartments}
                  </Text>
                  <Text style={{ color: 'var(--color-text-secondary)', fontSize: 13 }}>
                    отделов и департаментов
                  </Text>
                </div>
              </div>
            )}

            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 16 }}>
              <Text style={{ fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: '18px' }}>
                {isAdmin
                  ? 'Наведите на отдел для управления. Перетащите сотрудника, чтобы изменить принадлежность.'
                  : 'Перетащите сотрудника из одного отдела в другой, чтобы изменить его принадлежность. Нажмите на имя сотрудника, чтобы открыть карточку.'}
              </Text>
            </div>
          </div>
        </Col>
      </Row>

      {/* Create employee modal */}
      <Modal
        title="Создать сотрудника"
        open={createEmpOpen}
        onOk={handleCreateEmployee}
        onCancel={() => { setCreateEmpOpen(false); empForm.resetFields(); }}
        confirmLoading={createEmpLoading}
        okText="Создать"
        cancelText="Отмена"
        width={520}
      >
        <Form form={empForm} layout="vertical" style={{ marginTop: 12 }}>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="lastName" label="Фамилия" rules={[{ required: true, message: 'Введите фамилию' }]}>
                <Input placeholder="Иванов" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="firstName" label="Имя" rules={[{ required: true, message: 'Введите имя' }]}>
                <Input placeholder="Иван" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="patronymic" label="Отчество">
            <Input placeholder="Иванович" />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Введите email' }]}>
            <Input placeholder="ivan@company.ru" />
          </Form.Item>
          <Form.Item name="password" label="Пароль" rules={[{ required: true, min: 6, message: 'Минимум 6 символов' }]}>
            <Input.Password placeholder="Минимум 6 символов" />
          </Form.Item>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="position" label="Должность">
                <Input placeholder="Менеджер по продажам" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="employeeNumber" label="Табельный номер">
                <Input placeholder="1001" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="phone" label="Телефон">
            <Input placeholder="+7 921 000-00-00" />
          </Form.Item>
          <Form.Item name="departmentId" label="Отдел / Департамент">
            <Select showSearch allowClear placeholder="Выберите отдел"
              filterOption={(i, o) => (o?.label as string ?? '').toLowerCase().includes(i.toLowerCase())}
              options={deptOptions} />
          </Form.Item>
          <Form.Item name="role" label="Роль" initialValue="employee">
            <Select options={[
              { value: 'employee', label: 'Сотрудник' },
              { value: 'hrd', label: 'HR директор' },
            ]} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Add root dept modal */}
      <Modal
        title="Новый департамент"
        open={addDeptOpen}
        onOk={handleAddDept}
        onCancel={() => { setAddDeptOpen(false); setAddDeptName(''); }}
        confirmLoading={addDeptLoading}
        okText="Создать"
        cancelText="Отмена"
      >
        <Input
          value={addDeptName}
          onChange={(e) => setAddDeptName(e.target.value)}
          onPressEnter={handleAddDept}
          placeholder="Название департамента"
          style={{ marginTop: 8 }}
        />
      </Modal>

      <style>{`
        .dept-row:hover { background: #f7f7f7 !important; }
        .dept-row:hover .dept-menu-btn { opacity: 1 !important; }
        .dept-menu-btn { opacity: 0; transition: opacity 0.12s; }
        button:hover { border-color: #999 !important; }
      `}</style>
    </div>
  );
}
