'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Col, Input, Row, Spin, Typography, message } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
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
import DepartmentItem, { OrgDepartment, OrgEmployee } from '@/components/OrgStructure/DepartmentItem';

const { Title, Text } = Typography;

interface OrgStats {
  totalDepartments: number;
  totalEmployees: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

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
  const [tree, setTree] = useState<OrgDepartment[]>([]);
  const [stats, setStats] = useState<OrgStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [draggingEmployee, setDraggingEmployee] = useState<OrgEmployee | null>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 6 } }),
  );

  useEffect(() => {
    const load = async () => {
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
    };
    load();
  }, []);

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

  return (
    <div>
      <Title level={3} style={{ marginBottom: 24 }}>
        Организационная структура
      </Title>

      <Row gutter={[40, 24]}>
        {/* ── Left: tree ───────────────────────────────── */}
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

        {/* ── Right: stats sidebar ─────────────────────── */}
        <Col xs={24} lg={7}>
          <div style={{ position: 'sticky', top: 80 }}>
            {stats && (
              <div style={{ marginBottom: 24 }}>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                    marginBottom: 16,
                  }}
                >
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

            <div
              style={{
                borderTop: '1px solid var(--color-border)',
                paddingTop: 16,
              }}
            >
              <Text style={{ fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: '18px' }}>
                Перетащите сотрудника из одного отдела в другой, чтобы изменить его принадлежность.
                Нажмите на имя сотрудника, чтобы открыть карточку.
              </Text>
            </div>
          </div>
        </Col>
      </Row>

      <style>{`
        .emp-row:hover {
          background: color-mix(in srgb, var(--color-primary-accent) 7%, transparent) !important;
        }
        .dept-row:hover {
          background: var(--color-bg-card) !important;
        }
      `}</style>
    </div>
  );
}
