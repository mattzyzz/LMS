'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Card,
  Typography,
  Button,
  Space,
  Input,
  Form,
  Select,
  Upload,
  Collapse,
  Modal,
  message,
  Spin,
  Popconfirm,
  Empty,
  Divider,
  InputNumber,
  Switch,
  Tabs,
} from 'antd';
import {
  ArrowLeftOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SaveOutlined,
  UploadOutlined,
  MenuOutlined,
  EyeOutlined,
  FileTextOutlined,
  PlayCircleOutlined,
  FileOutlined,
  PictureOutlined,
} from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Link from 'next/link';
import api from '@/lib/api';
import type { Course, CourseModule, Lesson, ContentBlock, Asset } from '@/types';
import ContentBlockEditor from '@/components/CourseBuilder/ContentBlockEditor';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Panel } = Collapse;

interface SortableItemProps {
  id: string;
  children: React.ReactNode;
}

function SortableItem({ id, children }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span {...attributes} {...listeners} style={{ cursor: 'grab' }}>
          <MenuOutlined />
        </span>
        <div style={{ flex: 1 }}>{children}</div>
      </div>
    </div>
  );
}

export default function CourseBuilderPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Course form
  const [courseForm] = Form.useForm();
  const [coverFileList, setCoverFileList] = useState<UploadFile[]>([]);

  // Module state
  const [moduleModalOpen, setModuleModalOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<CourseModule | null>(null);
  const [moduleForm] = Form.useForm();

  // Lesson state
  const [lessonModalOpen, setLessonModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [currentModuleId, setCurrentModuleId] = useState<string | null>(null);
  const [lessonForm] = Form.useForm();

  // Content block state
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [lessonBlocks, setLessonBlocks] = useState<ContentBlock[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchCourse = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get<Course>(`/courses/${courseId}/full`);
      setCourse(data);
      courseForm.setFieldsValue({
        title: data.title,
        description: data.description,
        category: data.category,
        accessType: data.accessType,
        price: data.price,
        durationMinutes: data.durationMinutes,
      });
      if (data.coverImage) {
        setCoverFileList([
          {
            uid: '-1',
            name: 'cover',
            status: 'done',
            url: data.coverImage,
          },
        ]);
      }
    } catch (err: any) {
      message.error('Failed to load course');
      router.push('/admin/courses');
    } finally {
      setLoading(false);
    }
  }, [courseId, courseForm, router]);

  useEffect(() => {
    fetchCourse();
  }, [fetchCourse]);

  // === Course Settings ===
  const handleSaveCourse = async (values: any) => {
    setSaving(true);
    try {
      const { data } = await api.put<Course>(`/courses/${courseId}`, values);
      setCourse(data);
      message.success('Course saved');
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleCoverUpload: UploadProps['customRequest'] = async (options) => {
    const { file, onSuccess, onError } = options;
    const formData = new FormData();
    formData.append('file', file as File);

    try {
      const { data } = await api.post<Asset>('/upload/file', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await api.put(`/courses/${courseId}`, { coverImage: data.url });
      setCoverFileList([
        {
          uid: data.id,
          name: data.originalName,
          status: 'done',
          url: data.url,
        },
      ]);
      onSuccess?.(data);
      message.success('Cover uploaded');
      fetchCourse();
    } catch (err: any) {
      onError?.(err);
      message.error('Upload failed');
    }
  };

  const handlePublish = async () => {
    try {
      await api.patch(`/courses/${courseId}/publish`);
      fetchCourse();
      message.success('Course published');
    } catch {
      message.error('Failed to publish');
    }
  };

  // === Modules ===
  const handleAddModule = () => {
    setEditingModule(null);
    moduleForm.resetFields();
    setModuleModalOpen(true);
  };

  const handleEditModule = (mod: CourseModule) => {
    setEditingModule(mod);
    moduleForm.setFieldsValue({
      title: mod.title,
      description: mod.description,
    });
    setModuleModalOpen(true);
  };

  const handleDeleteModule = async (modId: string) => {
    try {
      await api.delete(`/courses/modules/${modId}`);
      fetchCourse();
      message.success('Module deleted');
    } catch {
      message.error('Failed to delete module');
    }
  };

  const handleSaveModule = async (values: any) => {
    try {
      if (editingModule) {
        await api.put(`/courses/modules/${editingModule.id}`, values);
        message.success('Module updated');
      } else {
        await api.post('/courses/modules', {
          ...values,
          courseId,
          sortOrder: (course?.modules?.length || 0),
        });
        message.success('Module created');
      }
      setModuleModalOpen(false);
      fetchCourse();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Failed to save module');
    }
  };

  const handleModuleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !course?.modules) return;

    const oldIndex = course.modules.findIndex((m) => m.id === active.id);
    const newIndex = course.modules.findIndex((m) => m.id === over.id);
    const newModules = arrayMove(course.modules, oldIndex, newIndex);

    setCourse({ ...course, modules: newModules });

    try {
      await api.patch(`/courses/${courseId}/modules/reorder`, {
        moduleIds: newModules.map((m) => m.id),
      });
    } catch {
      message.error('Failed to reorder modules');
      fetchCourse();
    }
  };

  // === Lessons ===
  const handleAddLesson = (moduleId: string) => {
    setEditingLesson(null);
    setCurrentModuleId(moduleId);
    lessonForm.resetFields();
    lessonForm.setFieldsValue({ isFree: false, durationMinutes: 10 });
    setLessonModalOpen(true);
  };

  const handleEditLesson = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setCurrentModuleId(lesson.moduleId);
    lessonForm.setFieldsValue({
      title: lesson.title,
      description: lesson.description,
      durationMinutes: lesson.durationMinutes,
      isFree: lesson.isFree,
    });
    setLessonModalOpen(true);
  };

  const handleDeleteLesson = async (lessonId: string) => {
    try {
      await api.delete(`/courses/lessons/${lessonId}`);
      if (selectedLesson?.id === lessonId) {
        setSelectedLesson(null);
        setLessonBlocks([]);
      }
      fetchCourse();
      message.success('Lesson deleted');
    } catch {
      message.error('Failed to delete lesson');
    }
  };

  const handleSaveLesson = async (values: any) => {
    try {
      if (editingLesson) {
        await api.put(`/courses/lessons/${editingLesson.id}`, values);
        message.success('Lesson updated');
      } else {
        const mod = course?.modules?.find((m) => m.id === currentModuleId);
        await api.post('/courses/lessons', {
          ...values,
          moduleId: currentModuleId,
          sortOrder: mod?.lessons?.length || 0,
        });
        message.success('Lesson created');
      }
      setLessonModalOpen(false);
      fetchCourse();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Failed to save lesson');
    }
  };

  const handleLessonDragEnd = async (moduleId: string, event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !course?.modules) return;

    const mod = course.modules.find((m) => m.id === moduleId);
    if (!mod?.lessons) return;

    const oldIndex = mod.lessons.findIndex((l) => l.id === active.id);
    const newIndex = mod.lessons.findIndex((l) => l.id === over.id);
    const newLessons = arrayMove(mod.lessons, oldIndex, newIndex);

    const newModules = course.modules.map((m) =>
      m.id === moduleId ? { ...m, lessons: newLessons } : m
    );
    setCourse({ ...course, modules: newModules });

    try {
      await api.patch(`/courses/modules/${moduleId}/lessons/reorder`, {
        lessonIds: newLessons.map((l) => l.id),
      });
    } catch {
      message.error('Failed to reorder lessons');
      fetchCourse();
    }
  };

  // === Content Blocks ===
  const handleSelectLesson = async (lesson: Lesson) => {
    setSelectedLesson(lesson);
    try {
      const { data } = await api.get<Lesson>(`/courses/lessons/${lesson.id}`);
      setLessonBlocks(data.contentBlocks || []);
    } catch {
      message.error('Failed to load lesson content');
    }
  };

  const handleBlocksChange = (blocks: ContentBlock[]) => {
    setLessonBlocks(blocks);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!course) {
    return <Empty description="Course not found" />;
  }

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
        }}
      >
        <Space>
          <Link href="/admin/courses">
            <Button icon={<ArrowLeftOutlined />} />
          </Link>
          <Title level={3} style={{ margin: 0 }}>
            Course Builder: {course.title}
          </Title>
        </Space>
        <Space>
          <Link href={`/courses/${courseId}`}>
            <Button icon={<EyeOutlined />}>Preview</Button>
          </Link>
          {course.status === 'draft' && (
            <Popconfirm title="Publish this course?" onConfirm={handlePublish}>
              <Button type="primary">Publish</Button>
            </Popconfirm>
          )}
        </Space>
      </div>

      <div style={{ display: 'flex', gap: 24 }}>
        {/* Left column: Course Settings + Structure */}
        <div style={{ width: 400, flexShrink: 0 }}>
          {/* Course Settings */}
          <Card title="Course Settings" style={{ marginBottom: 16 }}>
            <Form
              form={courseForm}
              layout="vertical"
              onFinish={handleSaveCourse}
            >
              <Form.Item
                name="title"
                label="Title"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
              <Form.Item name="description" label="Description">
                <TextArea rows={3} />
              </Form.Item>
              <Form.Item name="category" label="Category">
                <Input />
              </Form.Item>
              <Form.Item label="Cover Image">
                <Upload
                  listType="picture-card"
                  fileList={coverFileList}
                  customRequest={handleCoverUpload}
                  onRemove={() => setCoverFileList([])}
                  maxCount={1}
                >
                  {coverFileList.length === 0 && (
                    <div>
                      <UploadOutlined />
                      <div style={{ marginTop: 8 }}>Upload</div>
                    </div>
                  )}
                </Upload>
              </Form.Item>
              <Space>
                <Form.Item name="accessType" label="Access" style={{ width: 130 }}>
                  <Select
                    options={[
                      { value: 'free', label: 'Free' },
                      { value: 'paid', label: 'Paid' },
                      { value: 'internal', label: 'Internal' },
                    ]}
                  />
                </Form.Item>
                <Form.Item name="price" label="Price" style={{ width: 100 }}>
                  <InputNumber min={0} style={{ width: '100%' }} />
                </Form.Item>
              </Space>
              <Form.Item name="durationMinutes" label="Duration (min)">
                <InputNumber min={1} style={{ width: 100 }} />
              </Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={saving}
              >
                Save Settings
              </Button>
            </Form>
          </Card>

          {/* Course Structure */}
          <Card
            title="Course Structure"
            extra={
              <Button
                type="primary"
                size="small"
                icon={<PlusOutlined />}
                onClick={handleAddModule}
              >
                Add Module
              </Button>
            }
          >
            {course.modules && course.modules.length > 0 ? (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleModuleDragEnd}
              >
                <SortableContext
                  items={course.modules.map((m) => m.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <Collapse accordion>
                    {course.modules.map((mod) => (
                      <Panel
                        key={mod.id}
                        header={
                          <SortableItem id={mod.id}>
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                width: '100%',
                              }}
                            >
                              <Text strong>{mod.title}</Text>
                              <Space
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Button
                                  type="text"
                                  size="small"
                                  icon={<EditOutlined />}
                                  onClick={() => handleEditModule(mod)}
                                />
                                <Popconfirm
                                  title="Delete this module?"
                                  onConfirm={() => handleDeleteModule(mod.id)}
                                >
                                  <Button
                                    type="text"
                                    size="small"
                                    danger
                                    icon={<DeleteOutlined />}
                                  />
                                </Popconfirm>
                              </Space>
                            </div>
                          </SortableItem>
                        }
                      >
                        <DndContext
                          sensors={sensors}
                          collisionDetection={closestCenter}
                          onDragEnd={(e) => handleLessonDragEnd(mod.id, e)}
                        >
                          <SortableContext
                            items={(mod.lessons || []).map((l) => l.id)}
                            strategy={verticalListSortingStrategy}
                          >
                            {mod.lessons && mod.lessons.length > 0 ? (
                              mod.lessons.map((lesson) => (
                                <SortableItem key={lesson.id} id={lesson.id}>
                                  <div
                                    style={{
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      alignItems: 'center',
                                      padding: '8px 12px',
                                      marginBottom: 8,
                                      background:
                                        selectedLesson?.id === lesson.id
                                          ? '#e6f4ff'
                                          : '#fafafa',
                                      borderRadius: 6,
                                      cursor: 'pointer',
                                    }}
                                    onClick={() => handleSelectLesson(lesson)}
                                  >
                                    <Space>
                                      <FileTextOutlined />
                                      <Text>{lesson.title}</Text>
                                      {lesson.isFree && (
                                        <Text
                                          type="secondary"
                                          style={{ fontSize: 12 }}
                                        >
                                          (Free)
                                        </Text>
                                      )}
                                    </Space>
                                    <Space onClick={(e) => e.stopPropagation()}>
                                      <Button
                                        type="text"
                                        size="small"
                                        icon={<EditOutlined />}
                                        onClick={() => handleEditLesson(lesson)}
                                      />
                                      <Popconfirm
                                        title="Delete this lesson?"
                                        onConfirm={() =>
                                          handleDeleteLesson(lesson.id)
                                        }
                                      >
                                        <Button
                                          type="text"
                                          size="small"
                                          danger
                                          icon={<DeleteOutlined />}
                                        />
                                      </Popconfirm>
                                    </Space>
                                  </div>
                                </SortableItem>
                              ))
                            ) : (
                              <Empty
                                description="No lessons"
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                              />
                            )}
                          </SortableContext>
                        </DndContext>
                        <Button
                          type="dashed"
                          size="small"
                          icon={<PlusOutlined />}
                          onClick={() => handleAddLesson(mod.id)}
                          style={{ marginTop: 8 }}
                          block
                        >
                          Add Lesson
                        </Button>
                      </Panel>
                    ))}
                  </Collapse>
                </SortableContext>
              </DndContext>
            ) : (
              <Empty
                description="No modules yet"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </Card>
        </div>

        {/* Right column: Lesson Content Editor */}
        <div style={{ flex: 1 }}>
          <Card
            title={
              selectedLesson
                ? `Editing: ${selectedLesson.title}`
                : 'Select a lesson to edit content'
            }
            style={{ minHeight: 600 }}
          >
            {selectedLesson ? (
              <ContentBlockEditor
                lessonId={selectedLesson.id}
                blocks={lessonBlocks}
                onBlocksChange={handleBlocksChange}
              />
            ) : (
              <Empty
                description="Select a lesson from the structure to edit its content"
                style={{ marginTop: 100 }}
              />
            )}
          </Card>
        </div>
      </div>

      {/* Module Modal */}
      <Modal
        title={editingModule ? 'Edit Module' : 'New Module'}
        open={moduleModalOpen}
        onCancel={() => setModuleModalOpen(false)}
        footer={null}
      >
        <Form form={moduleForm} layout="vertical" onFinish={handleSaveModule}>
          <Form.Item
            name="title"
            label="Module Title"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <TextArea rows={3} />
          </Form.Item>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={() => setModuleModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit">
              {editingModule ? 'Save' : 'Create'}
            </Button>
          </Space>
        </Form>
      </Modal>

      {/* Lesson Modal */}
      <Modal
        title={editingLesson ? 'Edit Lesson' : 'New Lesson'}
        open={lessonModalOpen}
        onCancel={() => setLessonModalOpen(false)}
        footer={null}
      >
        <Form form={lessonForm} layout="vertical" onFinish={handleSaveLesson}>
          <Form.Item
            name="title"
            label="Lesson Title"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <TextArea rows={3} />
          </Form.Item>
          <Space>
            <Form.Item
              name="durationMinutes"
              label="Duration (min)"
              style={{ width: 120 }}
            >
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item
              name="isFree"
              label="Free Preview"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Space>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={() => setLessonModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit">
              {editingLesson ? 'Save' : 'Create'}
            </Button>
          </Space>
        </Form>
      </Modal>
    </div>
  );
}
