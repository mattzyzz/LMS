'use client';

import React, { useEffect, useState } from 'react';
import {
  Calendar,
  Badge,
  Card,
  List,
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  Switch,
  Button,
  Typography,
  Space,
  Row,
  Col,
  Tag,
  message,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/ru';
import api from '@/lib/api';
import { EVENT_TYPE_LABELS, EVENT_TYPE_COLORS } from '@/lib/constants';
import type { CalendarEvent } from '@/types';

dayjs.locale('ru');
const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [form] = Form.useForm();

  const fetchEvents = async () => {
    try {
      const { data } = await api.get('/calendar/events');
      const arr = Array.isArray(data) ? data : (data?.data || []);
      setEvents(arr);
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const getEventsForDate = (date: Dayjs) => {
    return events.filter((e) => dayjs(e.startDate).isSame(date, 'day'));
  };

  const dateCellRender = (date: Dayjs) => {
    const dayEvents = getEventsForDate(date);
    return (
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {dayEvents.slice(0, 3).map((event) => (
          <li key={event.id}>
            <Badge
              color={EVENT_TYPE_COLORS[event.type] || '#1677ff'}
              text={
                <Text style={{ fontSize: 11 }} ellipsis>
                  {event.title}
                </Text>
              }
            />
          </li>
        ))}
        {dayEvents.length > 3 && (
          <li>
            <Text type="secondary" style={{ fontSize: 11 }}>
              +{dayEvents.length - 3} ещё
            </Text>
          </li>
        )}
      </ul>
    );
  };

  const selectedEvents = getEventsForDate(selectedDate);

  const handleCreateEvent = async (values: Record<string, unknown>) => {
    try {
      const dateRange = values.dateRange as [Dayjs, Dayjs] | undefined;
      const payload = {
        title: values.title,
        description: values.description,
        type: values.type,
        allDay: values.allDay,
        location: values.location,
        startDate: dateRange?.[0]?.toISOString() || selectedDate.toISOString(),
        endDate: dateRange?.[1]?.toISOString(),
      };
      await api.post('/events', payload);
      message.success('Событие создано');
      setModalOpen(false);
      form.resetFields();
      fetchEvents();
    } catch {
      message.error('Не удалось создать событие');
    }
  };

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
        }}
      >
        <Title level={3} style={{ margin: 0 }}>
          Календарь
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setModalOpen(true)}
        >
          Создать событие
        </Button>
      </div>

      <Row gutter={24}>
        <Col xs={24} lg={17}>
          <Card loading={loading}>
            <Calendar
              cellRender={(date) => dateCellRender(date as Dayjs)}
              onSelect={(date) => setSelectedDate(date as Dayjs)}
            />
          </Card>
        </Col>

        <Col xs={24} lg={7}>
          <Card
            title={`События: ${selectedDate.format('DD MMMM YYYY')}`}
            style={{ position: 'sticky', top: 88 }}
          >
            <List
              dataSource={selectedEvents}
              locale={{ emptyText: 'Нет событий в этот день' }}
              renderItem={(event) => (
                <List.Item key={event.id}>
                  <List.Item.Meta
                    title={event.title}
                    description={
                      <Space direction="vertical" size={4}>
                        <Tag color={EVENT_TYPE_COLORS[event.type]}>
                          {EVENT_TYPE_LABELS[event.type]}
                        </Tag>
                        {event.location && (
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {event.location}
                          </Text>
                        )}
                        {!event.allDay && (
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {dayjs(event.startDate).format('HH:mm')}
                            {event.endDate &&
                              ` — ${dayjs(event.endDate).format('HH:mm')}`}
                          </Text>
                        )}
                        {event.description && (
                          <Text style={{ fontSize: 13 }}>{event.description}</Text>
                        )}
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      <Modal
        title="Создать событие"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={520}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateEvent}
          initialValues={{ type: 'meeting', allDay: false }}
        >
          <Form.Item
            name="title"
            label="Название"
            rules={[{ required: true, message: 'Введите название' }]}
          >
            <Input placeholder="Название события" />
          </Form.Item>

          <Form.Item name="description" label="Описание">
            <Input.TextArea rows={3} placeholder="Описание события" />
          </Form.Item>

          <Form.Item
            name="type"
            label="Тип"
            rules={[{ required: true }]}
          >
            <Select>
              {Object.entries(EVENT_TYPE_LABELS).map(([key, label]) => (
                <Select.Option key={key} value={key}>
                  {label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="dateRange" label="Дата и время">
            <RangePicker
              showTime
              style={{ width: '100%' }}
              format="DD.MM.YYYY HH:mm"
            />
          </Form.Item>

          <Form.Item name="location" label="Место">
            <Input placeholder="Место проведения" />
          </Form.Item>

          <Form.Item name="allDay" label="Весь день" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Создать
              </Button>
              <Button onClick={() => setModalOpen(false)}>Отмена</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
