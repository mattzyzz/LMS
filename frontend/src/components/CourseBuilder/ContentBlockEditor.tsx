'use client';

import React, { useState, useEffect } from 'react';
import {
  Button,
  Space,
  Card,
  Input,
  Select,
  Upload,
  Modal,
  message,
  Popconfirm,
  Typography,
  InputNumber,
  Empty,
  Divider,
  Switch,
  Tabs,
  DatePicker,
  Radio,
  Checkbox,
  Alert,
  Collapse,
  Tag,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  MenuOutlined,
  UploadOutlined,
  FileTextOutlined,
  PictureOutlined,
  PlayCircleOutlined,
  FileOutlined,
  HighlightOutlined,
  MessageOutlined,
  QuestionCircleOutlined,
  FormOutlined,
  CodeOutlined,
  MinusOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import type { UploadProps } from 'antd';
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
import dayjs from 'dayjs';
import api from '@/lib/api';
import type {
  ContentBlock,
  ContentBlockType,
  Asset,
  Quiz,
  Question,
  HomeworkAssignment,
} from '@/types';

const { TextArea } = Input;
const { Text, Title } = Typography;
const { Panel } = Collapse;

// Block type configuration
const blockTypeConfig: Record<
  ContentBlockType,
  { icon: React.ReactNode; label: string; labelRu: string; color: string }
> = {
  text: {
    icon: <FileTextOutlined />,
    label: 'Text',
    labelRu: 'Текст',
    color: '#1677ff',
  },
  heading: {
    icon: <HighlightOutlined />,
    label: 'Heading',
    labelRu: 'Заголовок',
    color: '#722ed1',
  },
  image: {
    icon: <PictureOutlined />,
    label: 'Image',
    labelRu: 'Изображение',
    color: '#13c2c2',
  },
  video: {
    icon: <PlayCircleOutlined />,
    label: 'Video',
    labelRu: 'Видео',
    color: '#eb2f96',
  },
  file: {
    icon: <FileOutlined />,
    label: 'File',
    labelRu: 'Файл',
    color: '#fa8c16',
  },
  quote: {
    icon: <MessageOutlined />,
    label: 'Quote',
    labelRu: 'Цитата',
    color: '#52c41a',
  },
  quiz: {
    icon: <QuestionCircleOutlined />,
    label: 'Quiz',
    labelRu: 'Тест',
    color: '#f5222d',
  },
  homework: {
    icon: <FormOutlined />,
    label: 'Homework',
    labelRu: 'Домашка',
    color: '#faad14',
  },
  code: {
    icon: <CodeOutlined />,
    label: 'Code',
    labelRu: 'Код',
    color: '#2f54eb',
  },
  divider: {
    icon: <MinusOutlined />,
    label: 'Divider',
    labelRu: 'Разделитель',
    color: '#8c8c8c',
  },
};

const codeLanguages = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'csharp', label: 'C#' },
  { value: 'cpp', label: 'C++' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'php', label: 'PHP' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'sql', label: 'SQL' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'json', label: 'JSON' },
  { value: 'yaml', label: 'YAML' },
  { value: 'bash', label: 'Bash' },
  { value: 'plaintext', label: 'Plain Text' },
];

interface ContentBlockEditorProps {
  lessonId: string;
  blocks: ContentBlock[];
  onBlocksChange: (blocks: ContentBlock[]) => void;
}

interface SortableBlockProps {
  block: ContentBlock;
  onEdit: () => void;
  onDelete: () => void;
}

// Helper to render question type badges
const questionTypeBadge = (type: string) => {
  const labels: Record<string, { text: string; color: string }> = {
    single_choice: { text: 'Один ответ', color: 'blue' },
    multiple_choice: { text: 'Несколько ответов', color: 'purple' },
    free_text: { text: 'Свободный ответ', color: 'green' },
    survey: { text: 'Опрос', color: 'orange' },
  };
  const config = labels[type] || { text: type, color: 'default' };
  return <Tag color={config.color}>{config.text}</Tag>;
};

function SortableBlock({ block, onEdit, onDelete }: SortableBlockProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const content = block.content as Record<string, any>;
  const config = blockTypeConfig[block.type] || blockTypeConfig.text;

  const renderPreview = () => {
    switch (block.type) {
      case 'heading':
        return (
          <Text strong style={{ fontSize: 18 - (content.level || 2) * 2 }}>
            {content.text || 'Untitled Heading'}
          </Text>
        );
      case 'text':
        return (
          <Text ellipsis style={{ maxWidth: 400 }}>
            {content.text ||
              content.html?.replace(/<[^>]+>/g, '') ||
              'Empty text block'}
          </Text>
        );
      case 'image':
        return (
          <Space>
            <PictureOutlined />
            <Text ellipsis style={{ maxWidth: 300 }}>
              {content.alt || content.url || 'Image'}
            </Text>
          </Space>
        );
      case 'video':
        return (
          <Space>
            <PlayCircleOutlined />
            <Text ellipsis style={{ maxWidth: 300 }}>
              {content.title || content.url || 'Video'}
            </Text>
          </Space>
        );
      case 'file':
        return (
          <Space>
            <FileOutlined />
            <Text ellipsis style={{ maxWidth: 300 }}>
              {content.filename || content.name || 'File'}
            </Text>
          </Space>
        );
      case 'quote':
        return (
          <Text italic ellipsis style={{ maxWidth: 400 }}>
            &ldquo;{content.text || 'Empty quote'}&rdquo;
            {content.author && ` - ${content.author}`}
          </Text>
        );
      case 'quiz':
        return (
          <Space>
            <QuestionCircleOutlined style={{ color: '#f5222d' }} />
            <Text strong>
              {content.title || 'Quiz'}{' '}
              {content.questionsCount && `(${content.questionsCount} вопросов)`}
            </Text>
          </Space>
        );
      case 'homework':
        return (
          <Space>
            <FormOutlined style={{ color: '#faad14' }} />
            <Text strong>{content.title || 'Homework Assignment'}</Text>
            {content.deadline && (
              <Text type="secondary" style={{ fontSize: 12 }}>
                до {dayjs(content.deadline).format('DD.MM.YYYY')}
              </Text>
            )}
          </Space>
        );
      case 'code':
        return (
          <Space>
            <CodeOutlined style={{ color: '#2f54eb' }} />
            <Tag>{content.language || 'plaintext'}</Tag>
            <Text ellipsis style={{ maxWidth: 300 }}>
              {content.code?.substring(0, 50) || 'Empty code block'}
            </Text>
          </Space>
        );
      case 'divider':
        return (
          <Text type="secondary">
            ─────────────────────────────────────────
          </Text>
        );
      default:
        return <Text type="secondary">Unknown block type</Text>;
    }
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card
        size="small"
        style={{
          marginBottom: 8,
          borderLeft: `3px solid ${config.color}`,
        }}
        bodyStyle={{ padding: '8px 12px' }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Space>
            <span
              {...attributes}
              {...listeners}
              style={{ cursor: 'grab', color: '#999' }}
            >
              <MenuOutlined />
            </span>
            <span style={{ color: config.color }}>{config.icon}</span>
            {renderPreview()}
          </Space>
          <Space>
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={onEdit}
            />
            <Popconfirm title="Удалить этот блок?" onConfirm={onDelete}>
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
              />
            </Popconfirm>
          </Space>
        </div>
      </Card>
    </div>
  );
}

// Question editor for quiz inline creation
interface QuestionEditorProps {
  question: Partial<Question>;
  index: number;
  onChange: (question: Partial<Question>) => void;
  onDelete: () => void;
}

function QuestionEditor({
  question,
  index,
  onChange,
  onDelete,
}: QuestionEditorProps) {
  const [options, setOptions] = useState<
    Array<{ text: string; isCorrect: boolean }>
  >(
    question.options?.map((o) => ({ text: o.text, isCorrect: !!o.isCorrect })) ||
      [
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
      ]
  );

  const handleTypeChange = (type: string) => {
    onChange({ ...question, type: type as Question['type'] });
  };

  const handleAddOption = () => {
    setOptions([...options, { text: '', isCorrect: false }]);
  };

  const handleOptionChange = (
    idx: number,
    field: 'text' | 'isCorrect',
    value: string | boolean
  ) => {
    const newOptions = [...options];
    if (field === 'isCorrect' && question.type === 'single_choice') {
      // For single choice, uncheck all others
      newOptions.forEach((o, i) => (o.isCorrect = i === idx ? Boolean(value) : false));
    } else if (field === 'isCorrect') {
      newOptions[idx].isCorrect = Boolean(value);
    } else {
      newOptions[idx].text = String(value);
    }
    setOptions(newOptions);
    onChange({
      ...question,
      options: newOptions.map((o, i) => ({
        ...o,
        sortOrder: i,
        id: question.options?.[i]?.id || '',
      })),
    });
  };

  const handleRemoveOption = (idx: number) => {
    const newOptions = options.filter((_, i) => i !== idx);
    setOptions(newOptions);
    onChange({
      ...question,
      options: newOptions.map((o, i) => ({
        ...o,
        sortOrder: i,
        id: question.options?.[i]?.id || '',
      })),
    });
  };

  return (
    <Card
      size="small"
      style={{ marginBottom: 12 }}
      title={`Вопрос ${index + 1}`}
      extra={
        <Button type="text" danger size="small" onClick={onDelete}>
          <DeleteOutlined /> Удалить
        </Button>
      }
    >
      <Space direction="vertical" style={{ width: '100%' }} size="small">
        <TextArea
          placeholder="Текст вопроса"
          rows={2}
          value={question.text || ''}
          onChange={(e) => onChange({ ...question, text: e.target.value })}
        />

        <Space>
          <Select
            style={{ width: 200 }}
            value={question.type || 'single_choice'}
            onChange={handleTypeChange}
            options={[
              { value: 'single_choice', label: 'Один правильный ответ' },
              { value: 'multiple_choice', label: 'Несколько ответов' },
              { value: 'free_text', label: 'Свободный ответ' },
              { value: 'survey', label: 'Опрос (без оценки)' },
            ]}
          />
          <InputNumber
            min={1}
            value={question.points || 1}
            onChange={(v) => onChange({ ...question, points: v || 1 })}
            addonBefore="Баллы"
            style={{ width: 120 }}
          />
        </Space>

        {(question.type === 'single_choice' ||
          question.type === 'multiple_choice' ||
          question.type === 'survey') && (
          <div>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>
              Варианты ответов:
            </Text>
            {options.map((opt, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 8,
                }}
              >
                {question.type !== 'survey' &&
                  (question.type === 'single_choice' ? (
                    <Radio
                      checked={opt.isCorrect}
                      onChange={(e) =>
                        handleOptionChange(idx, 'isCorrect', e.target.checked)
                      }
                    />
                  ) : (
                    <Checkbox
                      checked={opt.isCorrect}
                      onChange={(e) =>
                        handleOptionChange(idx, 'isCorrect', e.target.checked)
                      }
                    />
                  ))}
                <Input
                  placeholder={`Вариант ${idx + 1}`}
                  value={opt.text}
                  onChange={(e) =>
                    handleOptionChange(idx, 'text', e.target.value)
                  }
                  style={{ flex: 1 }}
                />
                {options.length > 2 && (
                  <Button
                    type="text"
                    danger
                    size="small"
                    onClick={() => handleRemoveOption(idx)}
                  >
                    <DeleteOutlined />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="dashed"
              size="small"
              onClick={handleAddOption}
              icon={<PlusOutlined />}
            >
              Добавить вариант
            </Button>
          </div>
        )}

        {question.type === 'free_text' && (
          <Alert
            type="info"
            message="Студенты смогут написать свой ответ в текстовом поле"
            showIcon
          />
        )}

        <Input
          placeholder="Пояснение к ответу (необязательно)"
          value={question.explanation || ''}
          onChange={(e) =>
            onChange({ ...question, explanation: e.target.value })
          }
        />
      </Space>
    </Card>
  );
}

export default function ContentBlockEditor({
  lessonId,
  blocks,
  onBlocksChange,
}: ContentBlockEditorProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<ContentBlock | null>(null);
  const [blockType, setBlockType] = useState<ContentBlockType>('text');
  const [blockContent, setBlockContent] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);

  // Quiz inline editor state
  const [quizQuestions, setQuizQuestions] = useState<Partial<Question>[]>([]);
  const [existingQuizzes, setExistingQuizzes] = useState<Quiz[]>([]);
  const [quizMode, setQuizMode] = useState<'new' | 'existing'>('new');

  // Homework inline editor state
  const [existingHomework, setExistingHomework] = useState<HomeworkAssignment[]>(
    []
  );
  const [homeworkMode, setHomeworkMode] = useState<'new' | 'existing'>('new');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Load existing quizzes and homework for the lesson
  useEffect(() => {
    if (modalOpen && (blockType === 'quiz' || blockType === 'homework')) {
      loadExistingItems();
    }
  }, [modalOpen, blockType, lessonId]);

  const loadExistingItems = async () => {
    try {
      if (blockType === 'quiz') {
        const { data } = await api.get(`/quizzes/lesson/${lessonId}`);
        setExistingQuizzes(Array.isArray(data) ? data : data ? [data] : []);
      } else if (blockType === 'homework') {
        const { data } = await api.get(`/homework/lesson/${lessonId}`);
        setExistingHomework(Array.isArray(data) ? data : data ? [data] : []);
      }
    } catch {
      // No existing items
    }
  };

  const handleAddBlock = (type: ContentBlockType) => {
    setEditingBlock(null);
    setBlockType(type);
    setBlockContent(getDefaultContent(type));
    setQuizQuestions([]);
    setQuizMode('new');
    setHomeworkMode('new');
    setModalOpen(true);
  };

  const handleEditBlock = (block: ContentBlock) => {
    setEditingBlock(block);
    setBlockType(block.type);
    setBlockContent(block.content as Record<string, any>);

    // If editing quiz, load questions
    if (block.type === 'quiz' && block.content) {
      const content = block.content as Record<string, any>;
      if (content.quizId) {
        setQuizMode('existing');
        loadQuizQuestions(content.quizId);
      } else if (content.questions) {
        setQuizMode('new');
        setQuizQuestions(content.questions);
      }
    }

    setModalOpen(true);
  };

  const loadQuizQuestions = async (quizId: string) => {
    try {
      const { data } = await api.get<Quiz>(`/quizzes/${quizId}`);
      if (data.questions) {
        setQuizQuestions(data.questions);
      }
    } catch {
      message.error('Failed to load quiz');
    }
  };

  const handleDeleteBlock = async (blockId: string) => {
    try {
      await api.delete(`/courses/blocks/${blockId}`);
      const newBlocks = blocks.filter((b) => b.id !== blockId);
      onBlocksChange(newBlocks);
      message.success('Блок удалён');
    } catch {
      message.error('Ошибка при удалении блока');
    }
  };

  const handleSaveBlock = async () => {
    setSaving(true);
    try {
      let finalContent = { ...blockContent };

      // Handle quiz block - create quiz first if needed
      if (blockType === 'quiz' && quizMode === 'new' && quizQuestions.length > 0) {
        // Create quiz with questions
        const quizData = {
          title: blockContent.title || 'Тест',
          description: blockContent.description || '',
          lessonId,
          timeLimitMinutes: blockContent.timeLimitMinutes || null,
          maxAttempts: blockContent.maxAttempts || 1,
          passingScore: blockContent.passingScore || 70,
          randomizeQuestions: blockContent.randomizeQuestions || false,
          randomizeOptions: blockContent.randomizeOptions || false,
          showResults: blockContent.showResults !== false,
        };

        const { data: quiz } = await api.post<Quiz>('/quizzes', quizData);

        // Add questions to quiz
        for (const q of quizQuestions) {
          await api.post(`/quizzes/${quiz.id}/questions`, {
            text: q.text,
            type: q.type || 'single_choice',
            points: q.points || 1,
            explanation: q.explanation || null,
            options: q.options?.map((o, idx) => ({
              text: o.text,
              isCorrect: o.isCorrect || false,
              sortOrder: idx,
            })),
          });
        }

        finalContent = {
          quizId: quiz.id,
          title: quiz.title,
          questionsCount: quizQuestions.length,
        };
      }

      // Handle homework block - create assignment first if needed
      if (blockType === 'homework' && homeworkMode === 'new') {
        const hwData = {
          title: blockContent.title || 'Домашнее задание',
          description: blockContent.description || '',
          lessonId,
          deadline: blockContent.deadline || null,
          maxScore: blockContent.maxScore || null,
        };

        const { data: hw } = await api.post<HomeworkAssignment>(
          '/homework/assignments',
          hwData
        );

        finalContent = {
          homeworkId: hw.id,
          title: hw.title,
          deadline: hw.deadline,
        };
      }

      if (editingBlock) {
        const { data } = await api.put<ContentBlock>(
          `/courses/blocks/${editingBlock.id}`,
          { type: blockType, content: finalContent }
        );
        const newBlocks = blocks.map((b) => (b.id === data.id ? data : b));
        onBlocksChange(newBlocks);
        message.success('Блок обновлён');
      } else {
        const { data } = await api.post<ContentBlock>('/courses/blocks', {
          lessonId,
          type: blockType,
          content: finalContent,
          sortOrder: blocks.length,
        });
        onBlocksChange([...blocks, data]);
        message.success('Блок добавлен');
      }
      setModalOpen(false);
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Ошибка при сохранении');
    } finally {
      setSaving(false);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = blocks.findIndex((b) => b.id === active.id);
    const newIndex = blocks.findIndex((b) => b.id === over.id);
    const newBlocks = arrayMove(blocks, oldIndex, newIndex);

    onBlocksChange(newBlocks);

    try {
      await api.patch(`/courses/lessons/${lessonId}/blocks/reorder`, {
        blockIds: newBlocks.map((b) => b.id),
      });
    } catch {
      message.error('Ошибка при изменении порядка');
    }
  };

  const handleUpload: UploadProps['customRequest'] = async (options) => {
    const { file, onSuccess, onError } = options;
    const formData = new FormData();
    formData.append('file', file as File);

    try {
      const { data } = await api.post<Asset>('/upload/file', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (blockType === 'image') {
        setBlockContent({
          ...blockContent,
          url: data.url,
          alt: data.originalName,
        });
      } else if (blockType === 'video') {
        setBlockContent({
          ...blockContent,
          url: data.url,
          title: data.originalName,
        });
      } else if (blockType === 'file') {
        setBlockContent({
          ...blockContent,
          url: data.url,
          filename: data.originalName,
        });
      }

      onSuccess?.(data);
      message.success('Файл загружен');
    } catch (err: any) {
      onError?.(err);
      message.error('Ошибка загрузки');
    }
  };

  const getDefaultContent = (type: ContentBlockType): Record<string, any> => {
    switch (type) {
      case 'text':
        return { text: '', html: '' };
      case 'heading':
        return { text: '', level: 2 };
      case 'image':
        return { url: '', alt: '', caption: '' };
      case 'video':
        return { url: '', title: '', provider: 'direct' };
      case 'file':
        return { url: '', filename: '' };
      case 'quote':
        return { text: '', author: '' };
      case 'quiz':
        return {
          title: '',
          description: '',
          timeLimitMinutes: null,
          maxAttempts: 1,
          passingScore: 70,
          randomizeQuestions: false,
          showResults: true,
        };
      case 'homework':
        return {
          title: '',
          description: '',
          deadline: null,
          maxScore: 100,
        };
      case 'code':
        return { code: '', language: 'javascript', showLineNumbers: true };
      case 'divider':
        return { style: 'solid' };
      default:
        return {};
    }
  };

  const renderBlockEditor = () => {
    switch (blockType) {
      case 'text':
        return (
          <Space direction="vertical" style={{ width: '100%' }}>
            <TextArea
              rows={10}
              placeholder="Введите текст (поддерживается Markdown)"
              value={blockContent.text || ''}
              onChange={(e) =>
                setBlockContent({ ...blockContent, text: e.target.value })
              }
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              Подсказка: Используйте Markdown для форматирования (жирный,
              списки, ссылки и т.д.)
            </Text>
          </Space>
        );

      case 'heading':
        return (
          <Space direction="vertical" style={{ width: '100%' }}>
            <Input
              placeholder="Текст заголовка"
              size="large"
              value={blockContent.text || ''}
              onChange={(e) =>
                setBlockContent({ ...blockContent, text: e.target.value })
              }
            />
            <Select
              style={{ width: 200 }}
              value={blockContent.level || 2}
              onChange={(value) =>
                setBlockContent({ ...blockContent, level: value })
              }
              options={[
                { value: 1, label: 'Заголовок 1 (H1)' },
                { value: 2, label: 'Заголовок 2 (H2)' },
                { value: 3, label: 'Заголовок 3 (H3)' },
                { value: 4, label: 'Заголовок 4 (H4)' },
                { value: 5, label: 'Заголовок 5 (H5)' },
              ]}
            />
          </Space>
        );

      case 'image':
        return (
          <Space direction="vertical" style={{ width: '100%' }}>
            <Upload
              customRequest={handleUpload}
              accept="image/*"
              showUploadList={false}
            >
              <Button icon={<UploadOutlined />} size="large">
                Загрузить изображение
              </Button>
            </Upload>
            <Divider>или</Divider>
            <Input
              placeholder="Вставьте URL изображения"
              value={blockContent.url || ''}
              onChange={(e) =>
                setBlockContent({ ...blockContent, url: e.target.value })
              }
            />
            {blockContent.url && (
              <img
                src={blockContent.url}
                alt="Preview"
                style={{
                  maxWidth: '100%',
                  maxHeight: 200,
                  objectFit: 'contain',
                  borderRadius: 8,
                  border: '1px solid #d9d9d9',
                }}
              />
            )}
            <Input
              placeholder="Alt-текст (для SEO и доступности)"
              value={blockContent.alt || ''}
              onChange={(e) =>
                setBlockContent({ ...blockContent, alt: e.target.value })
              }
            />
            <Input
              placeholder="Подпись к изображению (необязательно)"
              value={blockContent.caption || ''}
              onChange={(e) =>
                setBlockContent({ ...blockContent, caption: e.target.value })
              }
            />
          </Space>
        );

      case 'video':
        return (
          <Space direction="vertical" style={{ width: '100%' }}>
            <Tabs
              defaultActiveKey="upload"
              items={[
                {
                  key: 'upload',
                  label: 'Загрузить видео',
                  children: (
                    <Upload
                      customRequest={handleUpload}
                      accept="video/*"
                      showUploadList={false}
                    >
                      <Button icon={<UploadOutlined />} size="large">
                        Загрузить видео файл
                      </Button>
                    </Upload>
                  ),
                },
                {
                  key: 'url',
                  label: 'Вставить ссылку',
                  children: (
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Select
                        style={{ width: '100%' }}
                        value={blockContent.provider || 'direct'}
                        onChange={(v) =>
                          setBlockContent({ ...blockContent, provider: v })
                        }
                        options={[
                          { value: 'youtube', label: 'YouTube' },
                          { value: 'vimeo', label: 'Vimeo' },
                          { value: 'rutube', label: 'Rutube' },
                          { value: 'direct', label: 'Прямая ссылка на видео' },
                        ]}
                      />
                      <Input
                        placeholder={
                          blockContent.provider === 'youtube'
                            ? 'https://www.youtube.com/watch?v=... или ID видео'
                            : 'URL видео'
                        }
                        value={blockContent.url || ''}
                        onChange={(e) =>
                          setBlockContent({
                            ...blockContent,
                            url: e.target.value,
                          })
                        }
                      />
                    </Space>
                  ),
                },
              ]}
            />
            <Input
              placeholder="Название видео"
              value={blockContent.title || ''}
              onChange={(e) =>
                setBlockContent({ ...blockContent, title: e.target.value })
              }
            />
            {blockContent.url && (
              <Alert
                type="success"
                message={`Видео: ${blockContent.url}`}
                showIcon
              />
            )}
          </Space>
        );

      case 'file':
        return (
          <Space direction="vertical" style={{ width: '100%' }}>
            <Upload
              customRequest={handleUpload}
              accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.rar,.txt"
              showUploadList={false}
            >
              <Button icon={<UploadOutlined />} size="large">
                Загрузить файл (PDF, DOC, PPT, XLS, ZIP)
              </Button>
            </Upload>
            {blockContent.url && (
              <Alert
                type="success"
                message={
                  <Space>
                    <FileOutlined />
                    {blockContent.filename || 'Файл загружен'}
                  </Space>
                }
                showIcon
                icon={<CheckCircleOutlined />}
              />
            )}
            <Input
              placeholder="Отображаемое имя файла"
              value={blockContent.filename || ''}
              onChange={(e) =>
                setBlockContent({ ...blockContent, filename: e.target.value })
              }
            />
            <Input
              placeholder="Описание файла (необязательно)"
              value={blockContent.description || ''}
              onChange={(e) =>
                setBlockContent({
                  ...blockContent,
                  description: e.target.value,
                })
              }
            />
          </Space>
        );

      case 'quote':
        return (
          <Space direction="vertical" style={{ width: '100%' }}>
            <TextArea
              rows={4}
              placeholder="Текст цитаты"
              value={blockContent.text || ''}
              onChange={(e) =>
                setBlockContent({ ...blockContent, text: e.target.value })
              }
            />
            <Input
              placeholder="Автор (необязательно)"
              value={blockContent.author || ''}
              onChange={(e) =>
                setBlockContent({ ...blockContent, author: e.target.value })
              }
            />
          </Space>
        );

      case 'code':
        return (
          <Space direction="vertical" style={{ width: '100%' }}>
            <Space>
              <Select
                style={{ width: 200 }}
                value={blockContent.language || 'javascript'}
                onChange={(v) =>
                  setBlockContent({ ...blockContent, language: v })
                }
                options={codeLanguages}
                placeholder="Язык программирования"
              />
              <Switch
                checked={blockContent.showLineNumbers !== false}
                onChange={(v) =>
                  setBlockContent({ ...blockContent, showLineNumbers: v })
                }
                checkedChildren="Номера строк"
                unCheckedChildren="Без номеров"
              />
            </Space>
            <TextArea
              rows={12}
              placeholder="// Вставьте код здесь"
              style={{
                fontFamily: 'monospace',
                fontSize: 13,
                backgroundColor: '#1e1e1e',
                color: '#d4d4d4',
              }}
              value={blockContent.code || ''}
              onChange={(e) =>
                setBlockContent({ ...blockContent, code: e.target.value })
              }
            />
            <Input
              placeholder="Заголовок или описание кода (необязательно)"
              value={blockContent.title || ''}
              onChange={(e) =>
                setBlockContent({ ...blockContent, title: e.target.value })
              }
            />
          </Space>
        );

      case 'divider':
        return (
          <Space direction="vertical" style={{ width: '100%' }}>
            <Text>Стиль разделителя:</Text>
            <Select
              style={{ width: 200 }}
              value={blockContent.style || 'solid'}
              onChange={(v) => setBlockContent({ ...blockContent, style: v })}
              options={[
                { value: 'solid', label: 'Сплошная линия' },
                { value: 'dashed', label: 'Пунктирная линия' },
                { value: 'dotted', label: 'Точечная линия' },
                { value: 'space', label: 'Пробел (отступ)' },
              ]}
            />
            <div
              style={{
                padding: '20px 0',
                borderBottom:
                  blockContent.style === 'space'
                    ? 'none'
                    : `2px ${blockContent.style || 'solid'} #d9d9d9`,
              }}
            />
          </Space>
        );

      case 'quiz':
        return (
          <Space direction="vertical" style={{ width: '100%' }}>
            <Tabs
              activeKey={quizMode}
              onChange={(k) => setQuizMode(k as 'new' | 'existing')}
              items={[
                {
                  key: 'new',
                  label: 'Создать новый тест',
                  children: (
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Input
                        placeholder="Название теста"
                        size="large"
                        value={blockContent.title || ''}
                        onChange={(e) =>
                          setBlockContent({
                            ...blockContent,
                            title: e.target.value,
                          })
                        }
                      />
                      <TextArea
                        placeholder="Описание теста (необязательно)"
                        rows={2}
                        value={blockContent.description || ''}
                        onChange={(e) =>
                          setBlockContent({
                            ...blockContent,
                            description: e.target.value,
                          })
                        }
                      />

                      <Collapse ghost>
                        <Panel header="Настройки теста" key="settings">
                          <Space wrap>
                            <InputNumber
                              addonBefore="Время (мин)"
                              min={1}
                              value={blockContent.timeLimitMinutes}
                              onChange={(v) =>
                                setBlockContent({
                                  ...blockContent,
                                  timeLimitMinutes: v,
                                })
                              }
                              placeholder="Без ограничений"
                              style={{ width: 180 }}
                            />
                            <InputNumber
                              addonBefore="Попытки"
                              min={1}
                              value={blockContent.maxAttempts || 1}
                              onChange={(v) =>
                                setBlockContent({
                                  ...blockContent,
                                  maxAttempts: v || 1,
                                })
                              }
                              style={{ width: 140 }}
                            />
                            <InputNumber
                              addonBefore="Проходной %"
                              min={0}
                              max={100}
                              value={blockContent.passingScore || 70}
                              onChange={(v) =>
                                setBlockContent({
                                  ...blockContent,
                                  passingScore: v || 70,
                                })
                              }
                              style={{ width: 160 }}
                            />
                          </Space>
                          <div style={{ marginTop: 12 }}>
                            <Space>
                              <Switch
                                checked={blockContent.randomizeQuestions}
                                onChange={(v) =>
                                  setBlockContent({
                                    ...blockContent,
                                    randomizeQuestions: v,
                                  })
                                }
                              />{' '}
                              <Text>Перемешивать вопросы</Text>
                            </Space>
                          </div>
                          <div style={{ marginTop: 8 }}>
                            <Space>
                              <Switch
                                checked={blockContent.showResults !== false}
                                onChange={(v) =>
                                  setBlockContent({
                                    ...blockContent,
                                    showResults: v,
                                  })
                                }
                              />{' '}
                              <Text>Показывать результаты</Text>
                            </Space>
                          </div>
                        </Panel>
                      </Collapse>

                      <Divider>Вопросы</Divider>

                      {quizQuestions.length === 0 ? (
                        <Empty
                          description="Добавьте вопросы к тесту"
                          image={Empty.PRESENTED_IMAGE_SIMPLE}
                        />
                      ) : (
                        quizQuestions.map((q, idx) => (
                          <QuestionEditor
                            key={idx}
                            question={q}
                            index={idx}
                            onChange={(updated) => {
                              const newQuestions = [...quizQuestions];
                              newQuestions[idx] = updated;
                              setQuizQuestions(newQuestions);
                            }}
                            onDelete={() => {
                              setQuizQuestions(
                                quizQuestions.filter((_, i) => i !== idx)
                              );
                            }}
                          />
                        ))
                      )}

                      <Button
                        type="dashed"
                        icon={<PlusOutlined />}
                        onClick={() =>
                          setQuizQuestions([
                            ...quizQuestions,
                            {
                              text: '',
                              type: 'single_choice',
                              points: 1,
                              options: [
                                { text: '', isCorrect: false, sortOrder: 0, id: '' },
                                { text: '', isCorrect: false, sortOrder: 1, id: '' },
                              ],
                            },
                          ])
                        }
                        block
                      >
                        Добавить вопрос
                      </Button>
                    </Space>
                  ),
                },
                {
                  key: 'existing',
                  label: 'Выбрать существующий',
                  children:
                    existingQuizzes.length > 0 ? (
                      <Select
                        style={{ width: '100%' }}
                        placeholder="Выберите тест"
                        value={blockContent.quizId}
                        onChange={(v) => {
                          const quiz = existingQuizzes.find((q) => q.id === v);
                          setBlockContent({
                            quizId: v,
                            title: quiz?.title,
                            questionsCount: quiz?.questions?.length || 0,
                          });
                        }}
                        options={existingQuizzes.map((q) => ({
                          value: q.id,
                          label: `${q.title} (${q.questions?.length || 0} вопросов)`,
                        }))}
                      />
                    ) : (
                      <Empty
                        description="Нет существующих тестов для этого урока"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                      />
                    ),
                },
              ]}
            />
          </Space>
        );

      case 'homework':
        return (
          <Space direction="vertical" style={{ width: '100%' }}>
            <Tabs
              activeKey={homeworkMode}
              onChange={(k) => setHomeworkMode(k as 'new' | 'existing')}
              items={[
                {
                  key: 'new',
                  label: 'Создать новое задание',
                  children: (
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Input
                        placeholder="Название задания"
                        size="large"
                        value={blockContent.title || ''}
                        onChange={(e) =>
                          setBlockContent({
                            ...blockContent,
                            title: e.target.value,
                          })
                        }
                      />
                      <TextArea
                        placeholder="Описание задания (что нужно сделать, критерии оценки и т.д.)"
                        rows={6}
                        value={blockContent.description || ''}
                        onChange={(e) =>
                          setBlockContent({
                            ...blockContent,
                            description: e.target.value,
                          })
                        }
                      />
                      <Space>
                        <DatePicker
                          placeholder="Дедлайн (необязательно)"
                          showTime
                          format="DD.MM.YYYY HH:mm"
                          value={
                            blockContent.deadline
                              ? dayjs(blockContent.deadline)
                              : null
                          }
                          onChange={(date) =>
                            setBlockContent({
                              ...blockContent,
                              deadline: date?.toISOString() || null,
                            })
                          }
                        />
                        <InputNumber
                          addonBefore="Макс. баллов"
                          min={1}
                          value={blockContent.maxScore || 100}
                          onChange={(v) =>
                            setBlockContent({
                              ...blockContent,
                              maxScore: v || 100,
                            })
                          }
                          style={{ width: 180 }}
                        />
                      </Space>
                    </Space>
                  ),
                },
                {
                  key: 'existing',
                  label: 'Выбрать существующее',
                  children:
                    existingHomework.length > 0 ? (
                      <Select
                        style={{ width: '100%' }}
                        placeholder="Выберите задание"
                        value={blockContent.homeworkId}
                        onChange={(v) => {
                          const hw = existingHomework.find((h) => h.id === v);
                          setBlockContent({
                            homeworkId: v,
                            title: hw?.title,
                            deadline: hw?.deadline,
                          });
                        }}
                        options={existingHomework.map((h) => ({
                          value: h.id,
                          label: h.title,
                        }))}
                      />
                    ) : (
                      <Empty
                        description="Нет существующих заданий для этого урока"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                      />
                    ),
                },
              ]}
            />
          </Space>
        );

      default:
        return null;
    }
  };

  // Group block types by category
  const contentBlocks: ContentBlockType[] = [
    'text',
    'heading',
    'image',
    'video',
    'file',
    'code',
  ];
  const specialBlocks: ContentBlockType[] = ['quote', 'divider'];
  const interactiveBlocks: ContentBlockType[] = ['quiz', 'homework'];

  return (
    <div>
      {/* Add Block Section */}
      <Card
        size="small"
        style={{ marginBottom: 16 }}
        title="Добавить контент"
        bodyStyle={{ padding: '12px 16px' }}
      >
        <div style={{ marginBottom: 8 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Контент:
          </Text>
          <div style={{ marginTop: 4 }}>
            <Space wrap size="small">
              {contentBlocks.map((type) => {
                const cfg = blockTypeConfig[type];
                return (
                  <Button
                    key={type}
                    icon={cfg.icon}
                    onClick={() => handleAddBlock(type)}
                    style={{ borderColor: cfg.color, color: cfg.color }}
                  >
                    {cfg.labelRu}
                  </Button>
                );
              })}
            </Space>
          </div>
        </div>

        <div style={{ marginBottom: 8 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Оформление:
          </Text>
          <div style={{ marginTop: 4 }}>
            <Space wrap size="small">
              {specialBlocks.map((type) => {
                const cfg = blockTypeConfig[type];
                return (
                  <Button
                    key={type}
                    icon={cfg.icon}
                    onClick={() => handleAddBlock(type)}
                    style={{ borderColor: cfg.color, color: cfg.color }}
                  >
                    {cfg.labelRu}
                  </Button>
                );
              })}
            </Space>
          </div>
        </div>

        <div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Интерактив:
          </Text>
          <div style={{ marginTop: 4 }}>
            <Space wrap size="small">
              {interactiveBlocks.map((type) => {
                const cfg = blockTypeConfig[type];
                return (
                  <Button
                    key={type}
                    type="primary"
                    ghost
                    icon={cfg.icon}
                    onClick={() => handleAddBlock(type)}
                    style={{ borderColor: cfg.color, color: cfg.color }}
                  >
                    {cfg.labelRu}
                  </Button>
                );
              })}
            </Space>
          </div>
        </div>
      </Card>

      {/* Blocks List */}
      {blocks.length > 0 ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={blocks.map((b) => b.id)}
            strategy={verticalListSortingStrategy}
          >
            {blocks.map((block) => (
              <SortableBlock
                key={block.id}
                block={block}
                onEdit={() => handleEditBlock(block)}
                onDelete={() => handleDeleteBlock(block.id)}
              />
            ))}
          </SortableContext>
        </DndContext>
      ) : (
        <Empty
          description="Нет контента. Добавьте первый блок выше."
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      )}

      {/* Block Editor Modal */}
      <Modal
        title={
          <Space>
            <span style={{ color: blockTypeConfig[blockType]?.color }}>
              {blockTypeConfig[blockType]?.icon}
            </span>
            {editingBlock
              ? `Редактировать: ${blockTypeConfig[blockType]?.labelRu}`
              : `Добавить: ${blockTypeConfig[blockType]?.labelRu}`}
          </Space>
        }
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={
          <Space>
            <Button onClick={() => setModalOpen(false)}>Отмена</Button>
            <Button type="primary" onClick={handleSaveBlock} loading={saving}>
              {editingBlock ? 'Сохранить' : 'Добавить'}
            </Button>
          </Space>
        }
        width={blockType === 'quiz' || blockType === 'homework' ? 800 : 600}
        styles={{ body: { maxHeight: '70vh', overflowY: 'auto' } }}
      >
        {renderBlockEditor()}
      </Modal>
    </div>
  );
}
