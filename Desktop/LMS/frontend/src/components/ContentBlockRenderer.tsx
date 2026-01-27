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
  switch (block.type) {
    case 'heading':
      return (
        <Title level={(block.metadata?.level as 1 | 2 | 3 | 4 | 5) || 3}>
          {block.content}
        </Title>
      );

    case 'text':
      return (
        <Paragraph style={{ fontSize: 16, lineHeight: 1.8 }}>
          <span dangerouslySetInnerHTML={{ __html: block.content }} />
        </Paragraph>
      );

    case 'image':
      return (
        <div style={{ textAlign: 'center', margin: '24px 0' }}>
          <Image
            src={block.content}
            alt={(block.metadata?.alt as string) || 'Изображение'}
            style={{ maxWidth: '100%', borderRadius: 8 }}
          />
          {block.metadata?.caption && (
            <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
              {block.metadata.caption as string}
            </Text>
          )}
        </div>
      );

    case 'video':
      return (
        <div style={{ margin: '24px 0', position: 'relative', paddingBottom: '56.25%', height: 0 }}>
          <iframe
            src={block.content}
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
            title={(block.metadata?.title as string) || 'Видео'}
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
          <a href={block.content} download>
            {(block.metadata?.filename as string) || 'Скачать файл'}
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
          {block.content}
          {block.metadata?.author && (
            <div style={{ marginTop: 8, fontStyle: 'normal' }}>
              <Text type="secondary">— {block.metadata.author as string}</Text>
            </div>
          )}
        </blockquote>
      );

    case 'code':
      return (
        <pre
          style={{
            margin: '16px 0',
            padding: 16,
            background: '#1e1e1e',
            color: '#d4d4d4',
            borderRadius: 8,
            overflow: 'auto',
            fontSize: 14,
          }}
        >
          <code>{block.content}</code>
        </pre>
      );

    default:
      return <Paragraph>{block.content}</Paragraph>;
  }
}

export default function ContentBlockRenderer({ blocks }: ContentBlockRendererProps) {
  const sorted = [...blocks].sort((a, b) => a.order - b.order);
  return (
    <div>
      {sorted.map((block) => (
        <RenderBlock key={block.id} block={block} />
      ))}
    </div>
  );
}
