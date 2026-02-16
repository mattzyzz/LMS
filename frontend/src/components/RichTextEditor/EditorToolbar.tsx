'use client';

import React from 'react';
import { Button, Space, Divider, Tooltip } from 'antd';
import {
  BoldOutlined,
  ItalicOutlined,
  UnderlineOutlined,
  StrikethroughOutlined,
  OrderedListOutlined,
  UnorderedListOutlined,
  AlignLeftOutlined,
  AlignCenterOutlined,
  AlignRightOutlined,
  HighlightOutlined,
  LinkOutlined,
  UndoOutlined,
  RedoOutlined,
} from '@ant-design/icons';
import type { Editor } from '@tiptap/react';

interface EditorToolbarProps {
  editor: Editor | null;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({ editor }) => {
  if (!editor) return null;

  const ToolBtn = ({
    icon,
    action,
    isActive,
    tip,
  }: {
    icon: React.ReactNode;
    action: () => void;
    isActive?: boolean;
    tip: string;
  }) => (
    <Tooltip title={tip}>
      <Button
        type={isActive ? 'primary' : 'text'}
        size="small"
        icon={icon}
        onClick={action}
        style={{ minWidth: 32 }}
      />
    </Tooltip>
  );

  const addLink = () => {
    const url = window.prompt('URL:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  return (
    <div
      style={{
        padding: '6px 12px',
        borderBottom: '1px solid #d9d9d9',
        background: '#fafafa',
        display: 'flex',
        flexWrap: 'wrap',
        gap: 2,
        alignItems: 'center',
      }}
    >
      <Space size={2}>
        <ToolBtn icon={<BoldOutlined />} action={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} tip="Жирный" />
        <ToolBtn icon={<ItalicOutlined />} action={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} tip="Курсив" />
        <ToolBtn icon={<UnderlineOutlined />} action={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} tip="Подчёркнутый" />
        <ToolBtn icon={<StrikethroughOutlined />} action={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')} tip="Зачёркнутый" />
        <ToolBtn icon={<HighlightOutlined />} action={() => editor.chain().focus().toggleHighlight().run()} isActive={editor.isActive('highlight')} tip="Выделение" />
      </Space>

      <Divider type="vertical" style={{ margin: '0 4px' }} />

      <Space size={2}>
        <ToolBtn icon={<span style={{ fontWeight: 700, fontSize: 12 }}>H1</span>} action={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive('heading', { level: 1 })} tip="Заголовок 1" />
        <ToolBtn icon={<span style={{ fontWeight: 700, fontSize: 11 }}>H2</span>} action={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })} tip="Заголовок 2" />
        <ToolBtn icon={<span style={{ fontWeight: 700, fontSize: 10 }}>H3</span>} action={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} isActive={editor.isActive('heading', { level: 3 })} tip="Заголовок 3" />
      </Space>

      <Divider type="vertical" style={{ margin: '0 4px' }} />

      <Space size={2}>
        <ToolBtn icon={<UnorderedListOutlined />} action={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} tip="Список" />
        <ToolBtn icon={<OrderedListOutlined />} action={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} tip="Нумерованный список" />
      </Space>

      <Divider type="vertical" style={{ margin: '0 4px' }} />

      <Space size={2}>
        <ToolBtn icon={<AlignLeftOutlined />} action={() => editor.chain().focus().setTextAlign('left').run()} isActive={editor.isActive({ textAlign: 'left' })} tip="По левому краю" />
        <ToolBtn icon={<AlignCenterOutlined />} action={() => editor.chain().focus().setTextAlign('center').run()} isActive={editor.isActive({ textAlign: 'center' })} tip="По центру" />
        <ToolBtn icon={<AlignRightOutlined />} action={() => editor.chain().focus().setTextAlign('right').run()} isActive={editor.isActive({ textAlign: 'right' })} tip="По правому краю" />
      </Space>

      <Divider type="vertical" style={{ margin: '0 4px' }} />

      <Space size={2}>
        <ToolBtn icon={<LinkOutlined />} action={addLink} isActive={editor.isActive('link')} tip="Ссылка" />
      </Space>

      <Divider type="vertical" style={{ margin: '0 4px' }} />

      <Space size={2}>
        <ToolBtn icon={<UndoOutlined />} action={() => editor.chain().focus().undo().run()} tip="Отменить" />
        <ToolBtn icon={<RedoOutlined />} action={() => editor.chain().focus().redo().run()} tip="Повторить" />
      </Space>
    </div>
  );
};
