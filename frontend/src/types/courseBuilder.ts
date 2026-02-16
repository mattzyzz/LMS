// ============================================================
// Course Builder Types
// ============================================================

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';
export type DripType = 'none' | 'schedule' | 'after_enrollment' | 'prerequisite';
export type VideoSource = 'upload' | 'youtube' | 'vimeo' | 'rutube';
export type TopicItemType = 'lesson' | 'quiz' | 'assignment';
export type PassingScoreType = 'percentage' | 'points';
export type FeedbackMode = 'after_submission' | 'after_all_attempts' | 'never';

export type QuestionType =
  | 'single_choice'
  | 'multiple_choice'
  | 'free_text'
  | 'survey'
  | 'true_false'
  | 'fill_blanks'
  | 'short_answer'
  | 'matching'
  | 'ordering';

export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  children?: Category[];
  sortOrder: number;
}

export interface LessonAttachment {
  id: string;
  lessonId: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  fileType: string | null;
  createdAt: string;
}

export interface BuilderCourse {
  id: string;
  title: string;
  description: string | null;
  shortDescription: string | null;
  coverImage: string | null;
  authorId: string;
  status: 'draft' | 'published' | 'archived';
  accessType: 'free' | 'paid' | 'internal';
  price: number;
  currency: string;
  category: string | null;
  categoryId: string | null;
  tags: string[] | null;
  durationMinutes: number;
  difficultyLevel: DifficultyLevel | null;
  dripType: DripType;
  maxParticipants: number | null;
  certificateEnabled: boolean;
  requireAllCompletion: boolean;
  learningObjectives: string[] | null;
  publishedAt: string | null;
  topics: TopicWithItems[];
  createdAt: string;
  updatedAt: string;
}

export interface TopicWithItems {
  id: string;
  title: string;
  description: string | null;
  courseId: string;
  sortOrder: number;
  items: TopicItem[];
}

export interface TopicItem {
  id: string;
  title: string;
  description?: string | null;
  sortOrder: number;
  itemType: TopicItemType;
  // Lesson-specific
  htmlContent?: string | null;
  videoSource?: VideoSource | null;
  videoUrl?: string | null;
  durationMinutes?: number;
  isFree?: boolean;
  moduleId?: string;
  // Quiz-specific
  timeLimitMinutes?: number | null;
  maxAttempts?: number;
  passingScore?: number;
  passingScoreType?: PassingScoreType;
  feedbackMode?: FeedbackMode;
  randomizeQuestions?: boolean;
  randomizeOptions?: boolean;
  showResults?: boolean;
  questions?: BuilderQuestion[];
  // Assignment-specific
  deadline?: string | null;
  maxScore?: number | null;
  timeLimitHours?: number | null;
  allowFileUpload?: boolean;
  allowedFileTypes?: string[] | null;
  maxFileSizeMb?: number;
  maxFilesCount?: number;
  allowResubmission?: boolean;
  allowTextAnswer?: boolean;
  // Drip (shared)
  dripType?: DripType;
  dripDate?: string | null;
  dripDaysAfterEnrollment?: number | null;
  dripPrerequisiteId?: string | null;
  // Common
  topicId?: string | null;
  lessonId?: string | null;
}

export interface BuilderQuestion {
  id: string;
  quizId: string;
  text: string;
  type: QuestionType;
  points: number;
  sortOrder: number;
  explanation?: string | null;
  options?: BuilderAnswerOption[];
}

export interface BuilderAnswerOption {
  id: string;
  text: string;
  isCorrect: boolean;
  sortOrder: number;
  matchPair?: string | null;
}

export type BuilderTab = 'info' | 'curriculum' | 'settings' | 'enrollments';

export interface DrawerState {
  open: boolean;
  type: TopicItemType | null;
  itemId: string | null;
  topicId: string | null;
}
