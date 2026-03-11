'use client';

import React, { useState } from 'react';
import { Button, Dropdown, Typography, Modal, Input, message } from 'antd';
import {
  PlusOutlined,
  MinusOutlined,
  MailOutlined,
  UserOutlined,
  MoreOutlined,
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

// ── Constants ─────────────────────────────────────────────────────────────────

const STATUS_DOT: Record<string, string> = {
  available: '#1677ff',
  busy:      '#1677ff',
  on_leave:  '#1677ff',
  offline:   '#bfbfbf',
};

const AVATAR_PALETTE = ['#E52322', '#1677ff', '#52c41a', '#722ed1', '#fa8c16', '#13c2c2', '#eb2f96'];

function avatarColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_PALETTE[Math.abs(h) % AVATAR_PALETTE.length];
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

// ── MiniAvatar ─────────────────────────────────────────────────────────────────

function MiniAvatar({ employee, size = 32 }: { employee: OrgEmployee; size?: number }) {
  const status   = employee.profile?.availabilityStatus ?? 'offline';
  const dotColor = STATUS_DOT[status] ?? '#bfbfbf';
  const bg       = avatarColor(employee.firstName + employee.lastName);
  const dotSize  = Math.round(size * 0.32);

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      {employee.avatar ? (
        <img
          src={employee.avatar}
          alt=""
          style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover' }}
        />
      ) : (
        <div
          style={{
            width: size, height: size, borderRadius: '50%', background: bg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: Math.round(size * 0.35), fontWeight: 700, color: '#fff',
            letterSpacing: '0.5px',
          }}
        >
          {initials(employee.firstName, employee.lastName)}
        </div>
      )}
      <span
        style={{
          position: 'absolute', bottom: 0, right: 0,
          width: dotSize, height: dotSize, borderRadius: '50%',
          background: dotColor, border: '2px solid var(--color-bg-primary)',
        }}
      />
    </div>
  );
}

// ── EmployeeCard (inline, точно по скриншоту) ─────────────────────────────────

function EmployeeCard({ employee }: { employee: OrgEmployee }) {
  const status     = employee.profile?.availabilityStatus ?? 'offline';
  const bg         = avatarColor(employee.firstName + employee.lastName);
  const onVacation = status === 'on_leave' && employee.profile?.vacationUntil;
  const fullName   = [employee.firstName, employee.lastName, employee.patronymic].filter(Boolean).join(' ');
  const position   = employee.position ?? '';

  return (
    <div
      style={{
        margin: '4px 0 10px 48px',
        border: '1px solid var(--color-border)',
        borderRadius: 12,
        background: 'var(--color-bg-primary)',
        overflow: 'hidden',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div style={{ padding: '16px 16px 12px' }}>
        {/* Avatar + name block */}
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
          {/* Big avatar */}
          <div style={{ flexShrink: 0 }}>
            {employee.avatar ? (
              <img
                src={employee.avatar}
                alt=""
                style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : (
              <div
                style={{
                  width: 52, height: 52, borderRadius: '50%', background: bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, fontWeight: 700, color: '#fff',
                }}
              >
                {initials(employee.firstName, employee.lastName)}
              </div>
            )}
          </div>

          {/* Name + position + vacation badge */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <Text
              strong
              style={{ fontSize: 15, display: 'block', lineHeight: '22px', color: 'var(--color-text-primary)' }}
            >
              {fullName}
            </Text>
            {position && (
              <Text
                style={{ fontSize: 13, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 8, lineHeight: '18px' }}
              >
                {position}
              </Text>
            )}
            {onVacation && (
              <span
                style={{
                  display: 'inline-block',
                  padding: '3px 12px',
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 500,
                  background: '#1677ff',
                  color: '#fff',
                }}
              >
                В отпуске до {formatDate(employee.profile!.vacationUntil)}
              </span>
            )}
          </div>
        </div>

        {/* Contacts block */}
        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 3 }}>
          {employee.email && (
            <Text style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
              {employee.email}
            </Text>
          )}
          {employee.profile?.phone && (
            <Text style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
              {employee.profile.phone}
            </Text>
          )}
          {employee.employeeNumber && (
            <Text style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
              {employee.employeeNumber}
            </Text>
          )}
          {employee.managerName && (
            <Text style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
              Руководитель —{' '}
              <Text strong style={{ fontSize: 13, color: 'var(--color-text-primary)' }}>
                {employee.managerName}
              </Text>
            </Text>
          )}
        </div>
      </div>

      {/* Buttons */}
      <div
        style={{
          display: 'flex', gap: 8, padding: '10px 16px',
          borderTop: '1px solid var(--color-border)',
          background: 'var(--color-bg-card)',
        }}
      >
        <Link href={`/profile/${employee.id}`} style={{ flex: 1 }}>
          <Button block icon={<UserOutlined />} style={{ borderRadius: 8, fontSize: 13 }}>
            Посмотреть профиль
          </Button>
        </Link>
        <Button
          icon={<MailOutlined />}
          href={`mailto:${employee.email}`}
          title={`Написать ${employee.firstName}`}
          style={{ borderRadius: 8, width: 40, padding: 0, flexShrink: 0 }}
        />
      </div>
    </div>
  );
}

// ── EmployeeRow ────────────────────────────────────────────────────────────────

interface EmployeeRowProps {
  employee: OrgEmployee;
  departmentId: string;
  isExpanded: boolean;
  onToggle: () => void;
}

function EmployeeRow({ employee, departmentId, isExpanded, onToggle }: EmployeeRowProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: employee.id,
    data: { type: 'employee', departmentId },
  });

  const subtitle = employee.position ?? '';

  return (
    <>
      <div
        ref={setNodeRef}
        style={{
          transform: CSS.Translate.toString(transform),
          opacity: isDragging ? 0.3 : 1,
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '6px 8px', borderRadius: 8, cursor: 'pointer',
          background: isExpanded ? 'color-mix(in srgb, var(--color-primary-accent) 5%, transparent)' : undefined,
          transition: 'background 0.15s',
        }}
        className="emp-row"
        onClick={onToggle}
        {...listeners}
        {...attributes}
      >
        <MiniAvatar employee={employee} size={34} />
        <div style={{ minWidth: 0, flex: 1 }}>
          <Text strong style={{ fontSize: 14, display: 'block', lineHeight: '20px', color: 'var(--color-text-primary)' }}>
            {employee.firstName} {employee.lastName}
          </Text>
          {subtitle && (
            <Text style={{ fontSize: 12, color: 'var(--color-text-secondary)', display: 'block', lineHeight: '17px' }}>
              {subtitle}
            </Text>
          )}
        </div>
      </div>
      {isExpanded && <EmployeeCard employee={employee} />}
    </>
  );
}

// ── DeptActionMenu (admin only) ────────────────────────────────────────────────

interface DeptActionsProps {
  dept: OrgDepartment;
  onRename: () => void;
  onDelete: () => void;
  onAddChild: () => void;
}

function DeptActionMenu({ dept: _dept, onRename, onDelete, onAddChild }: DeptActionsProps) {
  return (
    <Dropdown
      trigger={['click']}
      menu={{
        items: [
          { key: 'add', label: 'Добавить отдел внутрь', onClick: onAddChild },
          { key: 'rename', label: 'Переименовать', onClick: onRename },
          { key: 'delete', label: 'Удалить', danger: true, onClick: onDelete },
        ],
      }}
    >
      <span
        className="dept-menu-btn"
        style={{
          width: 24, height: 24, borderRadius: 6,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', flexShrink: 0,
          color: 'var(--color-text-secondary)',
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

  // Rename modal state
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameName, setRenameName] = useState(dept.name);
  const [renameLoading, setRenameLoading] = useState(false);

  // Add child dept modal
  const [addChildOpen, setAddChildOpen] = useState(false);
  const [addChildName, setAddChildName] = useState('');
  const [addChildLoading, setAddChildLoading] = useState(false);

  const { isOver, setNodeRef } = useDroppable({ id: dept.id });

  const employees = dept.employees ?? [];
  const children  = dept.children ?? [];

  const filteredEmployees = searchQuery
    ? employees.filter((e) =>
        `${e.firstName} ${e.lastName} ${e.patronymic ?? ''}`.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : employees;

  const forceExpand = searchQuery.length > 0 && (filteredEmployees.length > 0 || children.length > 0);
  const isExpanded  = expanded || forceExpand;

  const headLabel = depth === 0 ? 'Директор департамента' : 'Руководитель отдела';
  const headName  = dept.head
    ? `${dept.head.firstName} ${dept.head.lastName}`
    : 'не назначен';

  // Admin handlers
  const handleRename = async () => {
    if (!renameName.trim()) return;
    setRenameLoading(true);
    try {
      await api.patch(`/departments/${dept.id}`, { name: renameName.trim() });
      message.success('Отдел переименован');
      setRenameOpen(false);
      onRefresh?.();
    } catch {
      message.error('Не удалось переименовать');
    } finally {
      setRenameLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/departments/${dept.id}`);
      message.success('Удалено');
      onRefresh?.();
    } catch (e: any) {
      message.error(e?.response?.data?.message ?? 'Не удалось удалить');
    }
  };

  const handleAddChild = async () => {
    if (!addChildName.trim()) return;
    setAddChildLoading(true);
    try {
      await api.post('/departments', { name: addChildName.trim(), parentId: dept.id });
      message.success('Отдел добавлен');
      setAddChildOpen(false);
      setAddChildName('');
      setExpanded(true);
      onRefresh?.();
    } catch {
      message.error('Не удалось добавить отдел');
    } finally {
      setAddChildLoading(false);
    }
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={{
          marginLeft: depth > 0 ? 28 : 0,
          borderRadius: 8,
          background: isOver ? 'color-mix(in srgb, var(--color-primary-accent) 4%, transparent)' : undefined,
          transition: 'background 0.2s',
        }}
      >
        {/* Department header */}
        <div
          style={{
            display: 'flex', alignItems: 'flex-start', gap: 10,
            padding: '8px 6px', cursor: 'pointer', userSelect: 'none', borderRadius: 8,
          }}
          className="dept-row"
          onClick={() => setExpanded((v) => !v)}
        >
          {/* +/- button */}
          <span
            style={{
              width: 20, height: 20, borderRadius: '50%',
              border: '1px solid var(--color-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, marginTop: 3,
              color: 'var(--color-text-secondary)',
              background: 'var(--color-bg-primary)',
            }}
          >
            {isExpanded
              ? <MinusOutlined style={{ fontSize: 9 }} />
              : <PlusOutlined  style={{ fontSize: 9 }} />}
          </span>

          {/* Name + subtitle */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <Text
              strong
              style={{ fontSize: depth === 0 ? 15 : 14, color: 'var(--color-text-primary)', display: 'block', lineHeight: '22px' }}
            >
              {dept.name}
            </Text>
            <Text
              style={{ fontSize: 12, color: 'var(--color-text-secondary)', display: 'block', lineHeight: '17px' }}
            >
              {headLabel} — {headName}
            </Text>
          </div>

          {/* [...] menu (admin only) */}
          {isAdmin && (
            <DeptActionMenu
              dept={dept}
              onRename={() => { setRenameName(dept.name); setRenameOpen(true); }}
              onDelete={handleDelete}
              onAddChild={() => setAddChildOpen(true)}
            />
          )}
        </div>

        {/* Expanded content */}
        {isExpanded && (
          <div style={{ paddingLeft: 30 }}>
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
              <EmployeeRow
                key={emp.id}
                employee={emp}
                departmentId={dept.id}
                isExpanded={expandedEmployeeId === emp.id}
                onToggle={() =>
                  setExpandedEmployeeId((prev) => (prev === emp.id ? null : emp.id))
                }
              />
            ))}

            {filteredEmployees.length > visibleCount && (
              <div style={{ paddingLeft: 46, paddingBottom: 6, paddingTop: 2 }}>
                <span
                  style={{
                    fontSize: 13, color: 'var(--color-text-secondary)',
                    cursor: 'pointer', textDecoration: 'underline', textDecorationStyle: 'dotted',
                  }}
                  onClick={(e) => { e.stopPropagation(); setVisibleCount((c) => c + PAGE_INCREMENT); }}
                >
                  Загрузить ещё {Math.min(filteredEmployees.length - visibleCount, PAGE_INCREMENT)}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Rename modal */}
      <Modal
        title="Переименовать"
        open={renameOpen}
        onOk={handleRename}
        onCancel={() => setRenameOpen(false)}
        confirmLoading={renameLoading}
        okText="Сохранить"
        cancelText="Отмена"
      >
        <Input
          value={renameName}
          onChange={(e) => setRenameName(e.target.value)}
          onPressEnter={handleRename}
          placeholder="Название"
          style={{ marginTop: 8 }}
        />
      </Modal>

      {/* Add child dept modal */}
      <Modal
        title="Добавить отдел"
        open={addChildOpen}
        onOk={handleAddChild}
        onCancel={() => { setAddChildOpen(false); setAddChildName(''); }}
        confirmLoading={addChildLoading}
        okText="Создать"
        cancelText="Отмена"
      >
        <Input
          value={addChildName}
          onChange={(e) => setAddChildName(e.target.value)}
          onPressEnter={handleAddChild}
          placeholder="Название отдела"
          style={{ marginTop: 8 }}
        />
      </Modal>
    </>
  );
}
