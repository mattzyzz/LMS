'use client';

import React, { useState } from 'react';
import { Dropdown, Modal, Input, Select, Popconfirm, message } from 'antd';
import {
  PlusOutlined,
  MinusOutlined,
  UserOutlined,
  MoreOutlined,
  UserAddOutlined,
} from '@ant-design/icons';
import { useDroppable, useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import Link from 'next/link';
import api from '@/lib/api';

const PAGE_SIZE = 10;
const PAGE_INCREMENT = 50;
const INDENT = 64; // px per depth level

// ── Types ─────────────────────────────────────────────────────────────────────

export interface OrgEmployee {
  id: string;
  firstName: string;
  lastName: string;
  patronymic?: string | null;
  email: string;
  avatar?: string | null;
  position?: string | null;
  role?: string;
  departmentId?: string | null;
  employeeNumber?: string | null;
  managerId?: string | null;
  managerName?: string | null;
  profile?: {
    phone?: string | null;
    availabilityStatus?: string;
    vacationUntil?: string | null;
  } | null;
}

export interface OrgDepartment {
  id: string;
  name: string;
  order?: number;
  head?: { id: string; firstName: string; lastName: string; patronymic?: string | null } | null;
  children?: OrgDepartment[];
  employees?: OrgEmployee[];
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function getStatusDotColor(status: string): string {
  if (typeof window === 'undefined') {
    const defaults: Record<string, string> = {
      available: '#52c41a', busy: '#ff4d4f', on_leave: '#1677ff', offline: '#c8c8c8',
    };
    return defaults[status] ?? '#c8c8c8';
  }
  const map: Record<string, string> = {
    available: '--color-status-available',
    busy:      '--color-status-busy',
    on_leave:  '--color-status-on-leave',
    offline:   '--color-status-offline',
  };
  const varName = map[status];
  if (!varName) return '#c8c8c8';
  const val = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  return val || '#c8c8c8';
}

const AVATAR_PALETTE = ['#ee4564', '#5890ce', '#52c41a', '#722ed1', '#fa8c16', '#13c2c2', '#eb2f96'];
function avatarColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_PALETTE[Math.abs(h) % AVATAR_PALETTE.length];
}

function initials(first: string, last: string) {
  return `${(first[0] ?? '').toUpperCase()}${(last[0] ?? '').toUpperCase()}`;
}

function formatDate(raw: string | null | undefined): string {
  if (!raw) return '';
  const d = new Date(raw);
  if (isNaN(d.getTime())) return raw;
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function displayName(emp: { firstName: string; lastName: string; patronymic?: string | null }, full = false) {
  if (full) return [emp.lastName, emp.firstName, emp.patronymic].filter(Boolean).join(' ');
  return `${emp.lastName} ${emp.firstName}`;
}

// ── Icons ──────────────────────────────────────────────────────────────────────

function PersonProfileIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5 20c0-3.87 3.13-7 7-7s7 3.13 7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function EmailIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 7l9 6 9-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── EmployeeCard ──────────────────────────────────────────────────────────────

function EmployeeCard({ employee }: { employee: OrgEmployee }) {
  const status = employee.profile?.availabilityStatus ?? 'offline';
  const bg = avatarColor(employee.firstName + employee.lastName);
  const onVacation = status === 'on_leave' && employee.profile?.vacationUntil;
  const fullName = displayName(employee, true);
  const position = employee.position ?? '';

  return (
    <div style={{
      maxWidth: 640,
      border: '1px solid #e7e8ea',
      borderRadius: 4,
      background: '#fdfcfc',
      padding: 24,
      marginTop: 12,
    }}>
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        {/* Avatar */}
        <div style={{
          width: 64, height: 64, borderRadius: 32, flexShrink: 0,
          background: bg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20, fontWeight: 700, color: '#fff',
        }}>
          {employee.avatar
            ? <img src={employee.avatar} alt="" style={{ width: 64, height: 64, borderRadius: 32, objectFit: 'cover' }} />
            : initials(employee.firstName, employee.lastName)
          }
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 18, fontWeight: 600, lineHeight: '28px', color: '#0e0e0e' }}>
            {fullName}
          </div>

          <div style={{ marginTop: 4, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {position && (
              <div style={{ fontSize: 16, color: '#75757d', lineHeight: '24px' }}>
                {position}
              </div>
            )}
            {onVacation && (
              <div>
                <span style={{
                  display: 'inline-block',
                  padding: '6px 16px',
                  borderRadius: 100,
                  background: '#5890ce',
                  color: '#fff',
                  fontSize: 14,
                  lineHeight: '18px',
                }}>
                  В отпуске до {formatDate(employee.profile!.vacationUntil)}
                </span>
              </div>
            )}
          </div>

          {/* Contacts */}
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 0 }}>
            {employee.email && (
              <div style={{ fontSize: 16, color: '#75757d', lineHeight: '24px' }}>{employee.email}</div>
            )}
            {employee.profile?.phone && (
              <div style={{ fontSize: 16, color: '#75757d', lineHeight: '24px' }}>{employee.profile.phone}</div>
            )}
            {employee.employeeNumber && (
              <div style={{ fontSize: 16, color: '#75757d', lineHeight: '24px' }}>{employee.employeeNumber}</div>
            )}
          </div>

          {/* Manager */}
          {employee.managerName && (
            <div style={{ fontSize: 16, color: '#75757d', lineHeight: '24px', marginTop: 4 }}>
              Руководитель —{' '}
              <span style={{ color: '#0e0e0e' }}>{employee.managerName}</span>
            </div>
          )}

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 16, marginTop: 16 }}>
            <Link href={`/profile/${employee.id}`} style={{ textDecoration: 'none' }}>
              <button style={{
                height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 4, background: '#f2f3f5', border: 'none', borderRadius: 2,
                padding: '0 28px', cursor: 'pointer', fontSize: 16, fontWeight: 600,
                color: '#0e0e0e', fontFamily: 'inherit',
              }}>
                <PersonProfileIcon size={24} />
                Посмотреть профиль
              </button>
            </Link>
            <a href={`mailto:${employee.email}`} title="Написать">
              <button style={{
                width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: '#f2f3f5', border: 'none', borderRadius: 2,
                cursor: 'pointer', color: '#0e0e0e',
              }}>
                <EmailIcon size={24} />
              </button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── EmployeeLeaf ──────────────────────────────────────────────────────────────

interface EmployeeLeafProps {
  employee: OrgEmployee;
  departmentId: string;
  depth: number;
  isExpanded: boolean;
  onToggle: () => void;
  isAdmin?: boolean;
  onRemove?: () => void;
}

function EmployeeLeaf({ employee, departmentId, depth, isExpanded, onToggle, isAdmin, onRemove }: EmployeeLeafProps) {
  const [hovered, setHovered] = useState(false);
  const status = employee.profile?.availabilityStatus ?? 'offline';
  const dotColor = getStatusDotColor(status);
  const empPadding = (depth + 1) * INDENT;

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: employee.id,
    data: { type: 'employee', departmentId },
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.3 : 1,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 24,
          paddingLeft: empPadding,
          cursor: 'pointer',
          userSelect: 'none',
          borderRadius: 4,
          background: hovered && !isExpanded ? 'rgba(0,0,0,0.02)' : 'transparent',
          transition: 'background 0.12s',
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={onToggle}
        {...listeners}
        {...attributes}
      >
        {/* Status dot */}
        <div style={{
          width: 40, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <span style={{
            width: 12, height: 12, borderRadius: '50%',
            background: dotColor, display: 'inline-block',
          }} />
        </div>

        {/* Name + position + card */}
        <div style={{ flex: 1, minWidth: 0, paddingTop: 0 }}>
          <div style={{ fontSize: 16, fontWeight: 600, lineHeight: '24px', color: '#0e0e0e' }}>
            {displayName(employee)}
          </div>
          {employee.position && (
            <div style={{ fontSize: 14, color: '#75757d', lineHeight: '24px' }}>
              {employee.position}
            </div>
          )}

          {/* Expanded card */}
          <div style={{
            overflow: 'hidden',
            maxHeight: isExpanded ? 600 : 0,
            opacity: isExpanded ? 1 : 0,
            transition: 'max-height 0.25s ease, opacity 0.2s ease',
          }}>
            {isExpanded && <EmployeeCard employee={employee} />}
          </div>
        </div>

        {/* Quick actions on hover */}
        {hovered && !isExpanded && (
          <div
            style={{ display: 'flex', gap: 4, flexShrink: 0, paddingTop: 10 }}
            onClick={(e) => e.stopPropagation()}
          >
            {isAdmin && onRemove && (
              <Popconfirm title="Убрать из отдела?" onConfirm={onRemove} okText="Да" cancelText="Нет">
                <span title="Убрать" style={{
                  width: 24, height: 24, borderRadius: '50%',
                  background: '#fff', border: '1px solid #ffccc7',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: '#ff4d4f', fontSize: 12,
                }}>
                  ✕
                </span>
              </Popconfirm>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── DeptActionMenu ─────────────────────────────────────────────────────────────

interface DeptActionsProps {
  onRename: () => void;
  onDelete: () => void;
  onAddChild: () => void;
  onAssignHead: () => void;
  onAddEmployee: () => void;
  addChildLabel?: string;
}

function DeptActionMenu({ onRename, onDelete, onAddChild, onAssignHead, onAddEmployee, addChildLabel = 'Добавить подотдел' }: DeptActionsProps) {
  return (
    <Dropdown trigger={['click']} menu={{ items: [
      { key: 'add-emp',    icon: <UserAddOutlined />, label: 'Добавить сотрудника',    onClick: onAddEmployee },
      { key: 'add-child',  icon: <PlusOutlined />,   label: addChildLabel,            onClick: onAddChild },
      { key: 'head',       icon: <UserOutlined />,   label: 'Назначить руководителя', onClick: onAssignHead },
      { type: 'divider' },
      { key: 'rename',     label: 'Переименовать',    onClick: onRename },
      { key: 'delete',     label: 'Удалить', danger: true, onClick: onDelete },
    ]}}>
      <span
        className="dept-menu-btn"
        style={{
          width: 32, height: 32, borderRadius: 4,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: '#aaa', flexShrink: 0,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <MoreOutlined />
      </span>
    </Dropdown>
  );
}

// ── DepartmentItem ─────────────────────────────────────────────────────────────

interface DepartmentItemProps {
  dept: OrgDepartment;
  depth?: number;
  defaultExpanded?: boolean;
  searchQuery?: string;
  isAdmin?: boolean;
  onRefresh?: () => void;
}

export default function DepartmentItem({
  dept,
  depth = 0,
  defaultExpanded = false,
  searchQuery = '',
  isAdmin = false,
  onRefresh,
}: DepartmentItemProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [expandedEmployeeId, setExpandedEmployeeId] = useState<string | null>(null);

  const [renameOpen, setRenameOpen] = useState(false);
  const [renameName, setRenameName] = useState(dept.name);
  const [renameLoading, setRenameLoading] = useState(false);

  const [addChildOpen, setAddChildOpen] = useState(false);
  const [addChildName, setAddChildName] = useState('');
  const [addChildLoading, setAddChildLoading] = useState(false);

  const [assignHeadOpen, setAssignHeadOpen] = useState(false);
  const [assignHeadId, setAssignHeadId] = useState<string | undefined>(dept.head?.id);
  const [assignHeadLoading, setAssignHeadLoading] = useState(false);
  const [allUsers, setAllUsers] = useState<{ value: string; label: string }[]>([]);
  const [usersFetching, setUsersFetching] = useState(false);

  const [addEmpOpen, setAddEmpOpen] = useState(false);
  const [addEmpId, setAddEmpId] = useState<string | undefined>();
  const [addEmpLoading, setAddEmpLoading] = useState(false);

  const { isOver, setNodeRef } = useDroppable({ id: dept.id });
  const employees = dept.employees ?? [];
  const children  = dept.children ?? [];

  const filteredEmployees = searchQuery
    ? employees.filter((e) =>
        `${e.firstName} ${e.lastName} ${e.patronymic ?? ''}`.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : employees;

  const forceExpand = searchQuery.length > 0 && (filteredEmployees.length > 0 || children.length > 0);
  const isExpanded = expanded || forceExpand;

  const headLabel = depth === 0 ? 'Директор департамента' : 'Руководитель отдела';
  const deptPadding = depth * INDENT;
  const empPadding = (depth + 1) * INDENT;

  // ── Handlers ──

  const fetchAllUsers = async () => {
    if (allUsers.length > 0) return;
    setUsersFetching(true);
    try {
      const res = await api.get('/users?limit=500');
      const list = (res.data?.data ?? res.data ?? []) as any[];
      setAllUsers(list.map((u: any) => ({
        value: u.id,
        label: [u.lastName, u.firstName, u.patronymic].filter(Boolean).join(' ') + (u.position ? ` — ${u.position}` : ''),
      })));
    } catch { message.error('Не удалось загрузить сотрудников'); }
    finally { setUsersFetching(false); }
  };

  const handleRename = async () => {
    if (!renameName.trim()) return;
    setRenameLoading(true);
    try {
      await api.patch(`/departments/${dept.id}`, { name: renameName.trim() });
      message.success('Переименовано'); setRenameOpen(false); onRefresh?.();
    } catch { message.error('Ошибка'); }
    finally { setRenameLoading(false); }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/departments/${dept.id}`);
      message.success('Удалено'); onRefresh?.();
    } catch (e: any) { message.error(e?.response?.data?.message ?? 'Ошибка'); }
  };

  const handleAddChild = async () => {
    if (!addChildName.trim()) return;
    setAddChildLoading(true);
    try {
      await api.post('/departments', { name: addChildName.trim(), parentId: dept.id });
      message.success('Отдел добавлен'); setAddChildOpen(false); setAddChildName(''); setExpanded(true); onRefresh?.();
    } catch { message.error('Ошибка'); }
    finally { setAddChildLoading(false); }
  };

  const handleAssignHead = async () => {
    setAssignHeadLoading(true);
    try {
      await api.patch(`/departments/${dept.id}`, { headId: assignHeadId ?? null });
      message.success('Руководитель назначен'); setAssignHeadOpen(false); onRefresh?.();
    } catch { message.error('Ошибка'); }
    finally { setAssignHeadLoading(false); }
  };

  const handleAddEmployee = async () => {
    if (!addEmpId) return;
    setAddEmpLoading(true);
    try {
      await api.patch(`/users/${addEmpId}`, { departmentId: dept.id });
      message.success('Сотрудник добавлен'); setAddEmpOpen(false); setAddEmpId(undefined); onRefresh?.();
    } catch { message.error('Ошибка'); }
    finally { setAddEmpLoading(false); }
  };

  const handleRemoveEmployee = async (empId: string) => {
    try {
      await api.patch(`/users/${empId}`, { departmentId: null });
      message.success('Убрано из отдела'); onRefresh?.();
    } catch { message.error('Ошибка'); }
  };

  return (
    <>
      {/* Department header row */}
      <div
        ref={setNodeRef}
        className="dept-row"
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 24,
          paddingLeft: deptPadding,
          paddingTop: 4,
          paddingBottom: 4,
          cursor: 'pointer',
          userSelect: 'none',
          borderRadius: 4,
          background: isOver ? 'rgba(239,49,36,0.04)' : undefined,
          transition: 'background 0.15s',
        }}
        onClick={() => setExpanded((v) => !v)}
      >
        {/* +/- circle button */}
        <div style={{
          width: 40, height: 40, borderRadius: 24, flexShrink: 0,
          border: '1px solid #d5d6dc',
          background: '#fdfcfc',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#75757d',
          marginTop: 4,
        }}>
          {isExpanded
            ? <MinusOutlined style={{ fontSize: 14 }} />
            : <PlusOutlined  style={{ fontSize: 14 }} />
          }
        </div>

        {/* Name + head label */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 16, fontWeight: 600, lineHeight: '24px',
            color: '#0e0e0e',
          }}>
            {dept.name}
          </div>
          <div style={{
            fontSize: 14, lineHeight: '24px',
            color: '#75757d',
          }}>
            {dept.head
              ? `${headLabel} — ${displayName(dept.head)}`
              : `${headLabel} не назначен`}
          </div>
        </div>

        {isAdmin && (
          <DeptActionMenu
            onRename={() => { setRenameName(dept.name); setRenameOpen(true); }}
            onDelete={handleDelete}
            onAddChild={() => setAddChildOpen(true)}
            onAssignHead={() => { setAssignHeadId(dept.head?.id); fetchAllUsers(); setAssignHeadOpen(true); }}
            onAddEmployee={() => { fetchAllUsers(); setAddEmpOpen(true); }}
            addChildLabel={depth === 0 ? 'Новый отдел' : 'Добавить подотдел'}
          />
        )}
      </div>

      {/* Expanded content — children + employees */}
      {isExpanded && (
        <>
          {children.map((child) => (
            <DepartmentItem
              key={child.id}
              dept={child}
              depth={depth + 1}
              defaultExpanded={false}
              searchQuery={searchQuery}
              isAdmin={isAdmin}
              onRefresh={onRefresh}
            />
          ))}

          {filteredEmployees.slice(0, visibleCount).map((emp) => (
            <EmployeeLeaf
              key={emp.id}
              employee={emp}
              departmentId={dept.id}
              depth={depth}
              isExpanded={expandedEmployeeId === emp.id}
              onToggle={() => setExpandedEmployeeId((prev) => (prev === emp.id ? null : emp.id))}
              isAdmin={isAdmin}
              onRemove={isAdmin ? () => handleRemoveEmployee(emp.id) : undefined}
            />
          ))}

          {filteredEmployees.length > visibleCount && (
            <div style={{ paddingLeft: empPadding + INDENT }}>
              <button
                style={{
                  height: 48,
                  padding: '0 32px',
                  background: '#fdfcfc',
                  border: '1px solid #d5d6dc',
                  borderRadius: 8,
                  fontSize: 16,
                  fontWeight: 600,
                  color: '#0e0e0e',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  marginTop: 8,
                  marginBottom: 8,
                }}
                onClick={(e) => { e.stopPropagation(); setVisibleCount((c) => c + PAGE_INCREMENT); }}
              >
                Загрузить ещё {Math.min(filteredEmployees.length - visibleCount, PAGE_INCREMENT)}
              </button>
            </div>
          )}
        </>
      )}

      {/* Modals */}
      <Modal title="Переименовать" open={renameOpen} onOk={handleRename}
        onCancel={() => setRenameOpen(false)} confirmLoading={renameLoading} okText="Сохранить" cancelText="Отмена">
        <Input autoFocus value={renameName} onChange={(e) => setRenameName(e.target.value)}
          onPressEnter={handleRename} style={{ marginTop: 8 }} />
      </Modal>

      <Modal title="Новый отдел" open={addChildOpen} onOk={handleAddChild}
        onCancel={() => { setAddChildOpen(false); setAddChildName(''); }}
        confirmLoading={addChildLoading} okText="Создать" cancelText="Отмена">
        <Input autoFocus value={addChildName} onChange={(e) => setAddChildName(e.target.value)}
          onPressEnter={handleAddChild} placeholder="Название отдела" style={{ marginTop: 8 }} />
      </Modal>

      <Modal title={`Руководитель — «${dept.name}»`} open={assignHeadOpen} onOk={handleAssignHead}
        onCancel={() => setAssignHeadOpen(false)} confirmLoading={assignHeadLoading} okText="Назначить" cancelText="Отмена">
        <Select showSearch allowClear loading={usersFetching} placeholder="Выберите сотрудника"
          style={{ width: '100%', marginTop: 8 }} value={assignHeadId} onChange={setAssignHeadId}
          filterOption={(i, o) => (o?.label as string ?? '').toLowerCase().includes(i.toLowerCase())}
          options={allUsers} />
      </Modal>

      <Modal title={`Добавить в «${dept.name}»`} open={addEmpOpen} onOk={handleAddEmployee}
        onCancel={() => { setAddEmpOpen(false); setAddEmpId(undefined); }}
        confirmLoading={addEmpLoading} okText="Добавить" cancelText="Отмена"
        okButtonProps={{ disabled: !addEmpId }}>
        <Select showSearch loading={usersFetching} placeholder="Поиск сотрудника..."
          style={{ width: '100%', marginTop: 8 }} value={addEmpId} onChange={setAddEmpId}
          filterOption={(i, o) => (o?.label as string ?? '').toLowerCase().includes(i.toLowerCase())}
          options={allUsers} />
      </Modal>
    </>
  );
}
