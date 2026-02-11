'use client';

import React from 'react';
import { Typography, Image } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import type { ContentBlock } from '@/types';

const { Title, Paragraph, Text } = Typography;

interface ContentBlockRendererProps {
  blocks: ContentBlock[];
}

function RenderBlock({ block }: { block: ContentBlock }) {
  const c = block.content as Record<string, any>;

  switch (block.type) {
    case 'heading':
      return (
        <Title level={(c.level as 1 | 2 | 3 | 4 | 5) || 3}>
          {c.text}
        </Title>
      );

    case 'text':
      return (
        <Paragraph style={{ fontSize: 16, lineHeight: 1.8 }}>
          <span dangerouslySetInnerHTML={{ __html: c.html || c.text || '' }} />
        </Paragraph>
      );

    case 'image':
      return (
        <div style={{ textAlign: 'center', margin: '24px 0' }}>
          <Image
            src={c.url || c.src}
            alt={c.alt || 'Изображение'}
            style={{ maxWidth: '100%', borderRadius: 8 }}
          />
          {c.caption && (
            <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
              {c.caption}
            </Text>
          )}
        </div>
      );

    case 'video':
      return (
        <div style={{ margin: '24px 0', position: 'relative', paddingBottom: '56.25%', height: 0 }}>
          <iframe
            src={c.url || c.src}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              border: 'none',
              borderRadius: 8,
            }}
            allowFullScreen
            title={c.title || 'Видео'}
          />
        </div>
      );

    case 'file':
      return (
        <div
          style={{
            margin: '16px 0',
            padding: '12px 16px',
            background: '#f5f5f5',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <DownloadOutlined />
          <a href={c.url} download>
            {c.filename || c.name || 'Скачать файл'}
          </a>
        </div>
      );

    case 'quote':
      return (
        <blockquote
          style={{
            margin: '24px 0',
            padding: '16px 24px',
            borderLeft: '4px solid #1677ff',
            background: '#f0f5ff',
            borderRadius: '0 8px 8px 0',
            fontStyle: 'italic',
            fontSize: 16,
          }}
        >
          {c.text}
          {c.author && (
            <div style={{ marginTop: 8, fontStyle: 'normal' }}>
              <Text type="secondary">— {c.author}</Text>
            </div>
          )}
        </blockquote>
      );

    default:
      return <Paragraph>{c.text || JSON.stringify(c)}</Paragraph>;
  }
}

export default function ContentBlockRenderer({ blocks }: ContentBlockRendererProps) {
  const sorted = [...blocks].sort((a, b) => a.sortOrder - b.sortOrder);
  return (
    <div>
      {sorted.map((block) => (
        <RenderBlock key={block.id} block={block} />
      ))}
    </div>
  );
}
