'use client';

import React from 'react';
import { Radio, Input, Space } from 'antd';
import type { VideoSource } from '@/types/courseBuilder';

interface VideoSourceSelectorProps {
  videoSource: VideoSource | null;
  videoUrl: string | null;
  onChange: (source: VideoSource | null, url: string | null) => void;
}

export const VideoSourceSelector: React.FC<VideoSourceSelectorProps> = ({
  videoSource,
  videoUrl,
  onChange,
}) => {
  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Radio.Group
        value={videoSource}
        onChange={(e) => onChange(e.target.value, videoUrl)}
      >
        <Radio value={null}>Нет видео</Radio>
        <Radio value="youtube">YouTube</Radio>
        <Radio value="vimeo">Vimeo</Radio>
        <Radio value="rutube">Rutube</Radio>
        <Radio value="upload">Загрузка</Radio>
      </Radio.Group>
      {videoSource && (
        <Input
          placeholder={
            videoSource === 'upload'
              ? 'URL загруженного видео'
              : `Вставьте ссылку на ${videoSource}`
          }
          value={videoUrl || ''}
          onChange={(e) => onChange(videoSource, e.target.value)}
        />
      )}
    </Space>
  );
};
