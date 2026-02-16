import { create } from 'zustand';
import api from '@/lib/api';
import type {
  BuilderCourse,
  TopicWithItems,
  TopicItem,
  BuilderTab,
  DrawerState,
  TopicItemType,
} from '@/types/courseBuilder';

interface CourseBuilderState {
  course: BuilderCourse | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  activeTab: BuilderTab;
  isDirty: boolean;
  drawer: DrawerState;

  // Actions
  fetchCourseBuilder: (courseId: string) => Promise<void>;
  updateCourseInfo: (courseId: string, data: Partial<BuilderCourse>) => Promise<void>;

  // Topics (modules)
  addTopic: (courseId: string, title: string) => Promise<TopicWithItems | undefined>;
  updateTopic: (topicId: string, data: { title?: string; description?: string }) => Promise<void>;
  deleteTopic: (topicId: string) => Promise<void>;
  reorderTopics: (courseId: string, topicIds: string[]) => Promise<void>;

  // Topic items
  addLesson: (topicId: string, title: string) => Promise<TopicItem | undefined>;
  addQuiz: (topicId: string, title: string) => Promise<TopicItem | undefined>;
  addAssignment: (topicId: string, title: string) => Promise<TopicItem | undefined>;
  deleteItem: (topicId: string, itemId: string, itemType: TopicItemType) => Promise<void>;
  reorderTopicItems: (topicId: string, items: { id: string; type: TopicItemType; sortOrder: number }[]) => Promise<void>;

  // Drawer
  openDrawer: (type: TopicItemType, itemId: string, topicId: string) => void;
  closeDrawer: () => void;

  // UI
  setActiveTab: (tab: BuilderTab) => void;
  setDirty: (dirty: boolean) => void;
  reset: () => void;
}

const initialDrawer: DrawerState = {
  open: false,
  type: null,
  itemId: null,
  topicId: null,
};

export const useCourseBuilderStore = create<CourseBuilderState>((set, get) => ({
  course: null,
  isLoading: false,
  isSaving: false,
  error: null,
  activeTab: 'info',
  isDirty: false,
  drawer: initialDrawer,

  fetchCourseBuilder: async (courseId: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get(`/courses/${courseId}/builder`);
      set({ course: data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  updateCourseInfo: async (courseId: string, updateData: Partial<BuilderCourse>) => {
    set({ isSaving: true });
    try {
      await api.put(`/courses/${courseId}`, updateData);
      const course = get().course;
      if (course) {
        set({ course: { ...course, ...updateData }, isSaving: false, isDirty: false });
      }
    } catch (err: any) {
      set({ isSaving: false, error: err.message });
    }
  },

  addTopic: async (courseId: string, title: string) => {
    try {
      const course = get().course;
      const sortOrder = course?.topics?.length ?? 0;
      const { data } = await api.post('/courses/modules', { courseId, title, sortOrder });
      const newTopic: TopicWithItems = {
        id: data.id,
        title: data.title,
        description: data.description,
        courseId,
        sortOrder: data.sortOrder,
        items: [],
      };
      if (course) {
        set({ course: { ...course, topics: [...(course.topics || []), newTopic] } });
      }
      return newTopic;
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  updateTopic: async (topicId: string, data: { title?: string; description?: string }) => {
    try {
      await api.put(`/courses/modules/${topicId}`, data);
      const course = get().course;
      if (course) {
        set({
          course: {
            ...course,
            topics: course.topics.map((t) =>
              t.id === topicId ? { ...t, ...data } : t,
            ),
          },
        });
      }
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  deleteTopic: async (topicId: string) => {
    try {
      await api.delete(`/courses/modules/${topicId}`);
      const course = get().course;
      if (course) {
        set({
          course: {
            ...course,
            topics: course.topics.filter((t) => t.id !== topicId),
          },
        });
      }
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  reorderTopics: async (courseId: string, topicIds: string[]) => {
    const course = get().course;
    if (!course) return;

    // Optimistic update
    const reorderedTopics = topicIds.map((id, i) => {
      const topic = course.topics.find((t) => t.id === id)!;
      return { ...topic, sortOrder: i };
    });
    set({ course: { ...course, topics: reorderedTopics } });

    try {
      await api.patch(`/courses/${courseId}/modules/reorder`, { moduleIds: topicIds });
    } catch (err: any) {
      set({ error: err.message });
      // Revert
      get().fetchCourseBuilder(courseId);
    }
  },

  addLesson: async (topicId: string, title: string) => {
    const course = get().course;
    if (!course) return;
    const topic = course.topics.find((t) => t.id === topicId);
    const sortOrder = topic?.items?.length ?? 0;

    try {
      const { data } = await api.post('/courses/lessons', { moduleId: topicId, title, sortOrder });
      const newItem: TopicItem = { ...data, itemType: 'lesson' };
      set({
        course: {
          ...course,
          topics: course.topics.map((t) =>
            t.id === topicId ? { ...t, items: [...t.items, newItem] } : t,
          ),
        },
      });
      return newItem;
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  addQuiz: async (topicId: string, title: string) => {
    const course = get().course;
    if (!course) return;
    const topic = course.topics.find((t) => t.id === topicId);
    const sortOrder = topic?.items?.length ?? 0;

    try {
      const { data } = await api.post(`/quizzes/topic/${topicId}`, { title, sortOrder });
      const newItem: TopicItem = { ...data, itemType: 'quiz' };
      set({
        course: {
          ...course,
          topics: course.topics.map((t) =>
            t.id === topicId ? { ...t, items: [...t.items, newItem] } : t,
          ),
        },
      });
      return newItem;
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  addAssignment: async (topicId: string, title: string) => {
    const course = get().course;
    if (!course) return;
    const topic = course.topics.find((t) => t.id === topicId);
    const sortOrder = topic?.items?.length ?? 0;

    try {
      const { data } = await api.post(`/homework/assignments/topic/${topicId}`, {
        title,
        description: '',
        sortOrder,
      });
      const newItem: TopicItem = { ...data, itemType: 'assignment' };
      set({
        course: {
          ...course,
          topics: course.topics.map((t) =>
            t.id === topicId ? { ...t, items: [...t.items, newItem] } : t,
          ),
        },
      });
      return newItem;
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  deleteItem: async (topicId: string, itemId: string, itemType: TopicItemType) => {
    const course = get().course;
    if (!course) return;

    try {
      const endpoint =
        itemType === 'lesson'
          ? `/courses/lessons/${itemId}`
          : itemType === 'quiz'
            ? `/quizzes/${itemId}`
            : `/homework/assignments/${itemId}`;

      await api.delete(endpoint);
      set({
        course: {
          ...course,
          topics: course.topics.map((t) =>
            t.id === topicId
              ? { ...t, items: t.items.filter((i) => i.id !== itemId) }
              : t,
          ),
        },
      });
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  reorderTopicItems: async (topicId: string, items: { id: string; type: TopicItemType; sortOrder: number }[]) => {
    const course = get().course;
    if (!course) return;

    // Optimistic update
    const topic = course.topics.find((t) => t.id === topicId);
    if (!topic) return;

    const reorderedItems = items.map((item) => {
      const existing = topic.items.find((i) => i.id === item.id)!;
      return { ...existing, sortOrder: item.sortOrder };
    }).sort((a, b) => a.sortOrder - b.sortOrder);

    set({
      course: {
        ...course,
        topics: course.topics.map((t) =>
          t.id === topicId ? { ...t, items: reorderedItems } : t,
        ),
      },
    });

    try {
      await api.patch(`/courses/modules/${topicId}/items/reorder`, { items });
    } catch (err: any) {
      set({ error: err.message });
      get().fetchCourseBuilder(course.id);
    }
  },

  openDrawer: (type, itemId, topicId) => {
    set({ drawer: { open: true, type, itemId, topicId } });
  },

  closeDrawer: () => {
    set({ drawer: initialDrawer });
  },

  setActiveTab: (tab) => set({ activeTab: tab }),
  setDirty: (dirty) => set({ isDirty: dirty }),

  reset: () => {
    set({
      course: null,
      isLoading: false,
      isSaving: false,
      error: null,
      activeTab: 'info',
      isDirty: false,
      drawer: initialDrawer,
    });
  },
}));
