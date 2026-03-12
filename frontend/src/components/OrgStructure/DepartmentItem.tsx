'use client';

import React, { useState } from 'react';
import { Dropdown, Typography, Modal, Input, Select, Popconfirm, message } from 'antd';
import {
  PlusOutlined,
  MinusOutlined,
  MailOutlined,
  UserOutlined,
  MoreOutlined,
  UserAddOutlined,
} from '@ant-design/icons';
import { useDroppable, useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import Link from 'next/link';
import api from '@/lib/api';

const { Text } = Typography;

const PAGE_SIZE = 10;
const PAGE_INCREMENT = 50;

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

// Colors are resolved at runtime via CSS vars (set by ThemeProvider)
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

// Avatar palette — first slot updated at render time from CSS var
const AVATAR_PALETTE_BASE = ['#E52322', '#1677ff', '#52c41a', '#722ed1', '#fa8c16', '#13c2c2', '#eb2f96'];
function getAvatarPalette(): string[] {
  if (typeof window === 'undefined') return AVATAR_PALETTE_BASE;
  const primary = getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim();
  return primary ? [primary, ...AVATAR_PALETTE_BASE.slice(1)] : AVATAR_PALETTE_BASE;
}

function avatarColor(name: string) {
  const palette = getAvatarPalette();
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return palette[Math.abs(h) % palette.length];
}

function initials(first: string, last: string) {
  return `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase();
}

function formatDate(raw: string | null | undefined): string {
  if (!raw) return '';
  const d = new Date(raw);
  if (isNaN(d.getTime())) return raw;
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// ── PersonInCircleIcon — точно как на скриншоте ────────────────────────────────
function PersonInCircleIcon({ size = 16, color = '#555' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="8" cy="8" r="7" stroke={color} strokeWidth="1.2"/>
      <circle cx="8" cy="6" r="2.2" stroke={color} strokeWidth="1.2"/>
      <path d="M3.5 13c0-2.485 2.015-4.5 4.5-4.5s4.5 2.015 4.5 4.5" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}

// ── EnvelopeIcon — точно как на скриншоте ─────────────────────────────────────
function EnvelopeIcon({ size = 14, color = '#555' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="0.6" y="0.6" width="12.8" height="10.8" rx="1.4" stroke={color} strokeWidth="1.2"/>
      <path d="M1 1.5l6 4.5 6-4.5" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}

// ── EmployeeCard — точно по скриншоту ─────────────────────────────────────────

function EmployeeCard({ employee }: { employee: OrgEmployee }) {
  const status     = employee.profile?.availabilityStatus ?? 'offline';
  const bg         = avatarColor(employee.firstName + employee.lastName);
  const onVacation = status === 'on_leave' && employee.profile?.vacationUntil;
  const fullName   = [employee.firstName, employee.lastName, employee.patronymic].filter(Boolean).join(' ');
  const position   = employee.position ?? '';

  return (
    <div
      style={{
        margin: '4px 0 12px 36px',
        border: '1px solid #e8e8e8',
        borderRadius: 8,
        background: '#fff',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Card body */}
      <div style={{ padding: '14px 16px 14px' }}>
        {/* Avatar row */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 12 }}>
          {/* Avatar circle */}
          <div style={{
            width: 60, height: 60, borderRadius: '50%', background: bg, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, fontWeight: 700, color: '#fff', letterSpacing: '0.5px',
          }}>
            {employee.avatar
              ? <img src={employee.avatar} alt="" style={{ width: 60, height: 60, borderRadius: '50%', objectFit: 'cover' }} />
              : initials(employee.firstName, employee.lastName)
            }
          </div>

          {/* Name + position + badge */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 17, fontWeight: 600, lineHeight: '24px', color: '#1a1a1a', marginBottom: 2 }}>
              {fullName}
            </div>
            {position && (
              <div style={{ fontSize: 13, color: '#8c8c8c', lineHeight: '18px', marginBottom: onVacation ? 8 : 0 }}>
                {position}
              </div>
            )}
            {onVacation && (
              <span style={{
                display: 'inline-block', padding: '2px 10px', borderRadius: 10,
                fontSize: 12, fontWeight: 500,
                background: 'var(--color-status-on-leave, #1677ff)', color: '#fff',
                lineHeight: '20px',
              }}>
                В отпуске до {formatDate(employee.profile!.vacationUntil)}
              </span>
            )}
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: '#f0f0f0', marginBottom: 10 }} />

        {/* Contacts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {employee.email && (
            <div style={{ fontSize: 13, color: '#595959', lineHeight: '20px' }}>{employee.email}</div>
          )}
          {employee.profile?.phone && (
            <div style={{ fontSize: 13, color: '#595959', lineHeight: '20px' }}>{employee.profile.phone}</div>
          )}
          {employee.employeeNumber && (
            <div style={{ fontSize: 13, color: '#595959', lineHeight: '20px' }}>{employee.employeeNumber}</div>
          )}
          {employee.managerName && (
            <div style={{ fontSize: 13, color: '#8c8c8c', lineHeight: '20px' }}>
              Руководитель —{' '}
              <span style={{ fontWeight: 600, color: '#1a1a1a' }}>{employee.managerName}</span>
            </div>
          )}
        </div>
      </div>

      {/* Buttons footer */}
      <div style={{
        display: 'flex', gap: 8, padding: '10px 12px',
        borderTop: '1px solid #f0f0f0',
        background: '#fff',
      }}>
        {/* Посмотреть профиль */}
        <Link href={`/profile/${employee.id}`} style={{ flex: 1, textDecoration: 'none' }}>
          <button style={{
            width: '100%', height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 7, background: '#fff', border: '1px solid #d9d9d9', borderRadius: 8,
            cursor: 'pointer', fontSize: 14, color: '#333', fontFamily: 'inherit',
            transition: 'border-color 0.15s',
          }}>
            <PersonInCircleIcon size={16} color="#555" />
            Посмотреть профиль
          </button>
        </Link>

        {/* Написать */}
        <a href={`mailto:${employee.email}`} title={`Написать ${employee.firstName}`}>
          <button style={{
            width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: '#fff', border: '1px solid #d9d9d9', borderRadius: 8,
            cursor: 'pointer', flexShrink: 0,
            transition: 'border-color 0.15s',
          }}>
            <EnvelopeIcon size={15} color="#555" />
          </button>
        </a>
      </div>
    </div>
  );
}

// ── EmployeeRow — только точка + имя + должность ──────────────────────────────

interface EmployeeRowProps {
  employee: OrgEmployee;
  departmentId: string;
  isExpanded: boolean;
  onToggle: () => void;
  isAdmin?: boolean;
  onRemove?: () => void;
}

function EmployeeRow({ employee, departmentId, isExpanded, onToggle, isAdmin, onRemove }: EmployeeRowProps) {
  const [hovered, setHovered] = useState(false);
  const status = employee.profile?.availabilityStatus ?? 'offline';
  const dotColor = getStatusDotColor(status);

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: employee.id,
    data: { type: 'employee', departmentId },
  });

  return (
    <>
      <div
        ref={setNodeRef}
        style={{
          transform: CSS.Translate.toString(transform),
          opacity: isDragging ? 0.3 : 1,
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '8px 8px 8px 4px', borderRadius: 6,
          background: isExpanded ? '#f0f4ff' : hovered ? '#f7f7f7' : 'transparent',
          transition: 'background 0.12s',
          cursor: 'pointer', userSelect: 'none',
        }}
        className="emp-row"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={onToggle}
        {...listeners}
        {...attributes}
      >
        {/* Status dot — маленькая точка как на скриншоте */}
        <span style={{
          width: 10, height: 10, borderRadius: '50%',
          background: dotColor, flexShrink: 0, display: 'inline-block',
        }} />

        {/* Name + position */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, lineHeight: '20px', color: '#1a1a1a' }}>
            {employee.firstName} {employee.lastName}
          </div>
          {employee.position && (
            <div style={{ fontSize: 12, color: '#8c8c8c', lineHeight: '17px' }}>
              {employee.position}
            </div>
          )}
        </div>

        {/* Quick actions on hover */}
        <div
          style={{ display: 'flex', gap: 4, opacity: hovered ? 1 : 0, transition: 'opacity 0.12s', flexShrink: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <Link href={`/profile/${employee.id}`}>
            <span title="Профиль" style={quickBtnStyle}>
              <UserOutlined style={{ fontSize: 11 }} />
            </span>
          </Link>
          <a href={`mailto:${employee.email}`}>
            <span title="Написать" style={quickBtnStyle}>
              <MailOutlined style={{ fontSize: 11 }} />
            </span>
          </a>
          {isAdmin && onRemove && (
            <Popconfirm title="Убрать из отдела?" onConfirm={onRemove} okText="Да" cancelText="Нет">
              <span title="Убрать" style={{ ...quickBtnStyle, borderColor: '#ffccc7', color: '#ff4d4f' }}>
                ✕
              </span>
            </Popconfirm>
          )}
        </div>
      </div>

      <div
        style={{
          overflow: 'hidden',
          maxHeight: isExpanded ? 600 : 0,
          opacity: isExpanded ? 1 : 0,
          transition: 'max-height 0.2s ease, opacity 0.2s ease',
        }}
      >
        {isExpanded && <EmployeeCard employee={employee} />}
      </div>
    </>
  );
}

const quickBtnStyle: React.CSSProperties = {
  width: 24, height: 24, borderRadius: '50%',
  background: '#fff', border: '1px solid #e8e8e8',
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', color: '#8c8c8c', fontSize: 13,
};

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
        style={{ width: 24, height: 24, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#aaa' }}
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

export default function DepartmentItem({ dept, depth = 0, defaultExpanded = false, searchQuery = '', isAdmin = false, onRefresh }: DepartmentItemProps) {
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
    ? employees.filter((e) => `${e.firstName} ${e.lastName} ${e.patronymic ?? ''}`.toLowerCase().includes(searchQuery.toLowerCase()))
    : employees;

  const forceExpand = searchQuery.length > 0 && (filteredEmployees.length > 0 || children.length > 0);
  const isExpanded  = expanded || forceExpand;

  const headLabel = depth === 0 ? 'Директор департамента' : 'Руководитель отдела';

  const fetchAllUsers = async () => {
    if (allUsers.length > 0) return;
    setUsersFetching(true);
    try {
      const res = await api.get('/users?limit=500');
      const list = (res.data?.data ?? res.data ?? []) as any[];
      setAllUsers(list.map((u: any) => ({
        value: u.id,
        label: [u.firstName, u.lastName, u.patronymic].filter(Boolean).join(' ') + (u.position ? ` — ${u.position}` : ''),
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
      <div
        ref={setNodeRef}
        style={{
          marginLeft: depth > 0 ? 32 : 0,
          marginBottom: depth === 0 ? 16 : 6,
          borderRadius: 6,
          background: isOver ? '#f0f4ff' : undefined,
          transition: 'background 0.15s',
        }}
      >
        {/* Department header row */}
        <div
          className="dept-row"
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '7px 6px', cursor: 'pointer', userSelect: 'none', borderRadius: 6,
          }}
          onClick={() => setExpanded((v) => !v)}
        >
          {/* +/- circle button */}
          <span style={{
            width: 30, height: 30, borderRadius: '50%',
            border: '1px solid #d0d0d0',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, background: '#fff', color: '#666',
          }}>
            {isExpanded
              ? <MinusOutlined style={{ fontSize: 9 }} />
              : <PlusOutlined  style={{ fontSize: 9 }} />}
          </span>

          {/* Name + subtitle */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: depth === 0 ? 17 : 15, fontWeight: 600, color: '#1a1a1a', lineHeight: '22px' }}>
              {dept.name}
            </div>
            <div style={{ fontSize: 13, color: '#8c8c8c', lineHeight: '18px' }}>
              {dept.head
                ? `${headLabel} — ${dept.head.firstName} ${dept.head.lastName}`
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

        {/* Expanded content */}
        {isExpanded && (
          <div style={{ paddingLeft: 32 }}>
            {children.map((child) => (
              <DepartmentItem key={child.id} dept={child} depth={depth + 1}
                defaultExpanded={false} searchQuery={searchQuery}
                isAdmin={isAdmin} onRefresh={onRefresh} />
            ))}

            {filteredEmployees.slice(0, visibleCount).map((emp) => (
              <EmployeeRow
                key={emp.id} employee={emp} departmentId={dept.id}
                isExpanded={expandedEmployeeId === emp.id}
                onToggle={() => setExpandedEmployeeId((prev) => (prev === emp.id ? null : emp.id))}
                isAdmin={isAdmin}
                onRemove={isAdmin ? () => handleRemoveEmployee(emp.id) : undefined}
              />
            ))}

            {filteredEmployees.length > visibleCount && (
              <div style={{ paddingLeft: 20, paddingBottom: 4, paddingTop: 2 }}>
                <span
                  style={{ fontSize: 12, color: '#8c8c8c', cursor: 'pointer', textDecoration: 'underline dotted' }}
                  onClick={(e) => { e.stopPropagation(); setVisibleCount((c) => c + PAGE_INCREMENT); }}
                >
                  Показать ещё {Math.min(filteredEmployees.length - visibleCount, PAGE_INCREMENT)}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Rename */}
      <Modal title="Переименовать" open={renameOpen} onOk={handleRename}
        onCancel={() => setRenameOpen(false)} confirmLoading={renameLoading} okText="Сохранить" cancelText="Отмена">
        <Input autoFocus value={renameName} onChange={(e) => setRenameName(e.target.value)}
          onPressEnter={handleRename} style={{ marginTop: 8 }} />
      </Modal>

      {/* Add child */}
      <Modal title="Новый отдел" open={addChildOpen} onOk={handleAddChild}
        onCancel={() => { setAddChildOpen(false); setAddChildName(''); }}
        confirmLoading={addChildLoading} okText="Создать" cancelText="Отмена">
        <Input autoFocus value={addChildName} onChange={(e) => setAddChildName(e.target.value)}
          onPressEnter={handleAddChild} placeholder="Название отдела" style={{ marginTop: 8 }} />
      </Modal>

      {/* Assign head */}
      <Modal title={`Руководитель — «${dept.name}»`} open={assignHeadOpen} onOk={handleAssignHead}
        onCancel={() => setAssignHeadOpen(false)} confirmLoading={assignHeadLoading} okText="Назначить" cancelText="Отмена">
        <Select showSearch allowClear loading={usersFetching} placeholder="Выберите сотрудника"
          style={{ width: '100%', marginTop: 8 }} value={assignHeadId} onChange={setAssignHeadId}
          filterOption={(i, o) => (o?.label as string ?? '').toLowerCase().includes(i.toLowerCase())}
          options={allUsers} />
      </Modal>

      {/* Add employee */}
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
