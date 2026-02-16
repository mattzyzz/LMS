'use client';

import React from 'react';
import { Upload, Button, List, message } from 'antd';
import { UploadOutlined, DeleteOutlined, PaperClipOutlined } from '@ant-design/icons';
import api from '@/lib/api';
import type { LessonAttachment } from '@/types/courseBuilder';

interface AttachmentsUploaderProps {
  lessonId: string;
  attachments: LessonAttachment[];
  onAdd: (attachment: LessonAttachment) => void;
  onRemove: (attachmentId: string) => void;
}

export const AttachmentsUploader: React.FC<AttachmentsUploaderProps> = ({
  lessonId,
  attachments,
  onAdd,
  onRemove,
}) => {
  const handleUpload = async (options: any) => {
    const { file, onSuccess, onError } = options;
    const formData = new FormData();
    formData.append('file', file);

    try {
      const { data: asset } = await api.post('/upload/file', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const { data: attachment } = await api.post(
        `/courses/lessons/${lessonId}/attachments`,
        {
          fileName: file.name,
          fileUrl: asset.url,
          fileSize: file.size,
          fileType: file.type,
        },
      );

      onAdd(attachment);
      onSuccess(attachment);
      message.success('Файл прикреплён');
    } catch (err) {
      onError(err);
      message.error('Ошибка загрузки файла');
    }
  };

  const handleRemove = async (attachmentId: string) => {
    try {
      await api.delete(`/courses/attachments/${attachmentId}`);
      onRemove(attachmentId);
    } catch {
      message.error('Ошибка удаления');
    }
  };

  return (
    <div>
      <Upload customRequest={handleUpload} showUploadList={false}>
        <Button icon={<UploadOutlined />}>Прикрепить файл</Button>
      </Upload>
      {attachments.length > 0 && (
        <List
          size="small"
          style={{ marginTop: 8 }}
          dataSource={attachments}
          renderItem={(att) => (
            <List.Item
              actions={[
                <Button
                  key="del"
                  type="text"
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleRemove(att.id)}
                />,
              ]}
            >
              <PaperClipOutlined style={{ marginRight: 8 }} />
              <a href={att.fileUrl} target="_blank" rel="noopener noreferrer">
                {att.fileName}
              </a>
            </List.Item>
          )}
        />
      )}
    </div>
  );
};
