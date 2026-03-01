'use client';

import React, { useState } from 'react';
import { Button, Typography } from 'antd';
import { PlusOutlined, MinusOutlined, MailOutlined, UserOutlined } from '@ant-design/icons';
import { useDroppable } from '@dnd-kit/core';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import Link from 'next/link';

const { Text } = Typography;

const PAGE_SIZE = 10;
const PAGE_INCREMENT = 50;

// ── Types ────────────────────────────────────────────────────────────────────

export interface OrgEmployee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string | null;
  role?: string;
  departmentId?: string | null;
  profile?: {
    phone?: string | null;
    availabilityStatus?: string;
  } | null;
}

export interface OrgDepartment {
  id: string;
  name: string;
  head?: { id: string; firstName: string; lastName: string } | null;
  children?: OrgDepartment[];
  employees?: OrgEmployee[];
}

// ── Constants ────────────────────────────────────────────────────────────────

const ROLE_LABELS: Record<string, string> = {
  hrd: 'HRD / Администратор',
  employee: 'Сотрудник',
};

const STATUS_COLOR: Record<string, string> = {
  available: '#52c41a',
  busy:      '#faad14',
  on_leave:  '#d48806',
  offline:   '#bfbfbf',
};

const STATUS_LABEL: Record<string, string> = {
  available: 'Доступен',
  busy:      'Занят',
  on_leave:  'В отпуске',
  offline:   'Не в сети',
};

// Stable color per name (not per render)
const AVATAR_PALETTE = ['#E52322', '#1677ff', '#52c41a', '#722ed1', '#fa8c16', '#13c2c2', '#eb2f96'];
function avatarColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_PALETTE[Math.abs(h) % AVATAR_PALETTE.length];
}

function initials(first: string, last: string) {
  return `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase();
}

// ── Mini Avatar (used in list row) ───────────────────────────────────────────

function MiniAvatar({ employee, size = 32 }: { employee: OrgEmployee; size?: number }) {
  const status   = employee.profile?.availabilityStatus ?? 'offline';
  const dotColor = STATUS_COLOR[status];
  const bg       = avatarColor(employee.firstName + employee.lastName);
  const dotSize  = Math.round(size * 0.32);

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      {/* Circle with initials or photo */}
      {employee.avatar ? (
        <img
          src={employee.avatar}
          alt=""
          style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover' }}
        />
      ) : (
        <div
          style={{
            width: size,
            height: size,
            borderRadius: '50%',
            background: bg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: Math.round(size * 0.35),
            fontWeight: 700,
            color: '#fff',
            letterSpacing: '0.5px',
          }}
        >
          {initials(employee.firstName, employee.lastName)}
        </div>
      )}
      {/* Status dot — bottom-right */}
      <span
        style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: dotSize,
          height: dotSize,
          borderRadius: '50%',
          background: dotColor,
          border: '2px solid var(--color-bg-primary)',
        }}
      />
    </div>
  );
}

// ── Inline Employee Card (expanded) ──────────────────────────────────────────

function EmployeeCard({ employee }: { employee: OrgEmployee }) {
  const status     = employee.profile?.availabilityStatus ?? 'offline';
  const statusLabel = STATUS_LABEL[status];
  const roleLabel   = ROLE_LABELS[employee.role ?? ''] ?? 'Сотрудник';
  const bg          = avatarColor(employee.firstName + employee.lastName);

  const badgeBg    = status === 'available' ? '#f6ffed' : status === 'offline' ? '#f5f5f5' : '#fffbe6';
  const badgeColor = status === 'available' ? '#389e0d' : status === 'offline' ? '#8c8c8c' : '#d48806';
  const badgeBorder = status === 'available' ? '#b7eb8f' : status === 'offline' ? '#d9d9d9' : '#ffe58f';

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
        {/* Avatar + info */}
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
          {/* Big avatar */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            {employee.avatar ? (
              <img
                src={employee.avatar}
                alt=""
                style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : (
              <div
                style={{
                  width: 52, height: 52, borderRadius: '50%',
                  background: bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, fontWeight: 700, color: '#fff',
                }}
              >
                {initials(employee.firstName, employee.lastName)}
              </div>
            )}
          </div>

          {/* Text */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <Text strong style={{ fontSize: 15, display: 'block', lineHeight: '22px', color: 'var(--color-text-primary)' }}>
              {employee.firstName} {employee.lastName}
            </Text>
            <Text style={{ fontSize: 13, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 8, lineHeight: '18px' }}>
              {roleLabel}
            </Text>
            <span
              style={{
                display: 'inline-block',
                padding: '2px 12px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 500,
                background: badgeBg,
                color: badgeColor,
                border: `1px solid ${badgeBorder}`,
              }}
            >
              {statusLabel}
            </span>
          </div>
        </div>

        {/* Email */}
        {employee.profile?.phone && (
          <div style={{ marginTop: 10, fontSize: 13, color: 'var(--color-text-secondary)' }}>
            {employee.profile.phone}
          </div>
        )}
        <div style={{ marginTop: 6, fontSize: 13, color: 'var(--color-text-secondary)' }}>
          {employee.email}
        </div>
      </div>

      {/* Action buttons */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          padding: '10px 16px',
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

// ── Draggable Employee Row ────────────────────────────────────────────────────

interface EmployeeRowProps {
  employee: OrgEmployee;
  departmentId: string;
  isExpanded: boolean;
  onToggle: () => void;
}

function EmployeeRow({ employee, departmentId, isExpanded, onToggle }: EmployeeRowProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: employee.id,
    data: { departmentId },
  });

  const roleLabel = ROLE_LABELS[employee.role ?? ''] ?? 'Сотрудник';

  return (
    <>
      <div
        ref={setNodeRef}
        style={{
          transform: CSS.Translate.toString(transform),
          opacity: isDragging ? 0.3 : 1,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '6px 8px',
          borderRadius: 8,
          cursor: 'pointer',
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
          <Text
            strong
            style={{
              fontSize: 14,
              display: 'block',
              lineHeight: '20px',
              color: 'var(--color-text-primary)',
            }}
          >
            {employee.firstName} {employee.lastName}
          </Text>
          <Text
            style={{
              fontSize: 12,
              color: 'var(--color-text-secondary)',
              display: 'block',
              lineHeight: '17px',
            }}
          >
            {roleLabel}
          </Text>
        </div>
      </div>

      {isExpanded && <EmployeeCard employee={employee} />}
    </>
  );
}

// ── Department Accordion ──────────────────────────────────────────────────────

interface DepartmentItemProps {
  dept: OrgDepartment;
  depth?: number;
  defaultExpanded?: boolean;
  searchQuery?: string;
}

export default function DepartmentItem({
  dept,
  depth = 0,
  defaultExpanded = false,
  searchQuery = '',
}: DepartmentItemProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [expandedEmployeeId, setExpandedEmployeeId] = useState<string | null>(null);

  const { isOver, setNodeRef } = useDroppable({ id: dept.id });

  const employees = dept.employees ?? [];
  const children  = dept.children ?? [];

  const filteredEmployees = searchQuery
    ? employees.filter((e) =>
        `${e.firstName} ${e.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : employees;

  const forceExpand = searchQuery.length > 0 && (filteredEmployees.length > 0 || children.length > 0);
  const isExpanded  = expanded || forceExpand;

  const headLabel = depth === 0 ? 'Директор департамента' : 'Руководитель отдела';
  const headName  = dept.head ? `${dept.head.firstName} ${dept.head.lastName}` : 'не назначен';

  return (
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
          display: 'flex',
          alignItems: 'flex-start',
          gap: 10,
          padding: '8px 6px',
          cursor: 'pointer',
          userSelect: 'none',
          borderRadius: 8,
        }}
        className="dept-row"
        onClick={() => { setExpanded((v) => !v); }}
      >
        {/* +/- icon */}
        <span
          style={{
            width: 20,
            height: 20,
            borderRadius: '50%',
            border: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            marginTop: 3,
            color: 'var(--color-text-secondary)',
            background: 'var(--color-bg-primary)',
          }}
        >
          {isExpanded
            ? <MinusOutlined style={{ fontSize: 9 }} />
            : <PlusOutlined  style={{ fontSize: 9 }} />}
        </span>

        {/* Name + subtitle */}
        <div>
          <Text
            strong
            style={{
              fontSize: depth === 0 ? 15 : 14,
              color: 'var(--color-text-primary)',
              display: 'block',
              lineHeight: '22px',
            }}
          >
            {dept.name}
          </Text>
          <Text
            style={{
              fontSize: 12,
              color: 'var(--color-text-secondary)',
              display: 'block',
              lineHeight: '17px',
            }}
          >
            {headLabel} — {headName}
          </Text>
        </div>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div style={{ paddingLeft: 30 }}>
          {/* Child departments */}
          {children.map((child) => (
            <DepartmentItem
              key={child.id}
              dept={child}
              depth={depth + 1}
              defaultExpanded={false}
              searchQuery={searchQuery}
            />
          ))}

          {/* Employee list */}
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

          {/* Load more */}
          {filteredEmployees.length > visibleCount && (
            <div style={{ paddingLeft: 46, paddingBottom: 6, paddingTop: 2 }}>
              <span
                style={{
                  fontSize: 13,
                  color: 'var(--color-text-secondary)',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  textDecorationStyle: 'dotted',
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
  );
}
