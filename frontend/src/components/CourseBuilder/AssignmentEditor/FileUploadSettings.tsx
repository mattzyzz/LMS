'use client';

import React from 'react';
import { Form, Switch, Select, InputNumber, Space } from 'antd';

export const FileUploadSettings: React.FC = () => {
  return (
    <>
      <Form.Item name="allowFileUpload" label="Разрешить загрузку файлов" valuePropName="checked">
        <Switch />
      </Form.Item>
      <Form.Item
        noStyle
        shouldUpdate={(prev, cur) => prev.allowFileUpload !== cur.allowFileUpload}
      >
        {({ getFieldValue }) =>
          getFieldValue('allowFileUpload') ? (
            <Space direction="vertical" style={{ width: '100%' }}>
              <Form.Item name="allowedFileTypes" label="Допустимые типы файлов">
                <Select
                  mode="tags"
                  placeholder="Например: pdf, docx, jpg (пусто = все)"
                  style={{ width: '100%' }}
                />
              </Form.Item>
              <Form.Item name="maxFileSizeMb" label="Макс. размер файла (МБ)" initialValue={10}>
                <InputNumber min={1} max={500} style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item name="maxFilesCount" label="Макс. количество файлов" initialValue={5}>
                <InputNumber min={1} max={20} style={{ width: '100%' }} />
              </Form.Item>
            </Space>
          ) : null
        }
      </Form.Item>
    </>
  );
};
