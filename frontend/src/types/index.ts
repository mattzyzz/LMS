// ============================================================
// LMS TypeScript Interfaces
// ============================================================

export type UserRoleType = 'hrd' | 'employee';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  patronymic?: string;
  avatar?: string;
  phone?: string;
  birthday?: string;
  isActive: boolean;
  position?: string;
  role: UserRoleType;  // Simple role: 'hrd' or 'employee'
  legacyRole?: Role;   // Legacy role object (if needed)
  department?: Department;
  profile?: Profile;
  createdAt?: string;
  updatedAt?: string;
}

export interface Role {
  id: string;
  name: string;
  slug: string;
  description?: string;
  permissions?: Permission[];
}

export interface Permission {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface Department {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  parent?: Department;
  children?: Department[];
  headId?: string;
  head?: User;
  employees?: User[];
  createdAt: string;
  updatedAt: string;
}

export interface Profile {
  id: string;
  userId: string;
  bio?: string;
  phone?: string;
  hireDate?: string;
  birthDate?: string;
  availabilityStatus?: 'available' | 'busy' | 'away' | 'offline';
  skills?: EmployeeSkill[];
  projects?: EmployeeProject[];
}

export interface Skill {
  id: string;
  name: string;
  category?: string;
}

export interface EmployeeSkill {
  id: string;
  skill: Skill;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

export interface Project {
  id: string;
  name: string;
  description?: string;
}

export interface EmployeeProject {
  id: string;
  project: Project;
  role?: string;
  startDate?: string;
  endDate?: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
  author?: User;
  isPinned: boolean;
  publishedAt?: string;
  coverImage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  body: string;
  authorId: string;
  author?: User;
  commentableType: string;
  commentableId: string;
  parentId?: string;
  replies?: Comment[];
  createdAt: string;
  updatedAt: string;
}

export interface Attachment {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
}

export interface Asset {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  storageKey: string;
  uploadedById: string | null;
  createdAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  allDay: boolean;
  type: string;
  color?: string;
  location?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CompanyGoal {
  id: string;
  title: string;
  description?: string;
  status: string;
  targetDate?: string;
  createdAt: string;
}

export interface Course {
  id: string;
  title: string;
  description?: string;
  coverImage?: string;
  authorId: string;
  author?: User;
  status: CourseStatus;
  accessType: 'free' | 'paid' | 'internal';
  price: number;
  currency: string;
  category?: string;
  tags?: string[];
  durationMinutes: number;
  publishedAt?: string;
  modules?: CourseModule[];
  createdAt: string;
  updatedAt: string;
}

export interface CourseModule {
  id: string;
  title: string;
  description?: string;
  courseId: string;
  sortOrder: number;
  lessons?: Lesson[];
}

export interface Lesson {
  id: string;
  title: string;
  description?: string;
  moduleId: string;
  sortOrder: number;
  durationMinutes: number;
  isFree: boolean;
  contentBlocks?: ContentBlock[];
}

export type ContentBlockType =
  | 'text'
  | 'heading'
  | 'image'
  | 'video'
  | 'file'
  | 'quote'
  | 'quiz'
  | 'homework'
  | 'code'
  | 'divider';

export interface ContentBlock {
  id: string;
  type: ContentBlockType;
  content: Record<string, unknown>;
  sortOrder: number;
  lessonId: string;
}

export interface Quiz {
  id: string;
  title: string;
  description?: string;
  lessonId?: string;
  timeLimitMinutes?: number;
  maxAttempts: number;
  passingScore: number;
  randomizeQuestions: boolean;
  randomizeOptions: boolean;
  showResults: boolean;
  questions?: Question[];
  createdAt: string;
  updatedAt: string;
}

export interface Question {
  id: string;
  quizId: string;
  text: string;
  type: 'single_choice' | 'multiple_choice' | 'free_text' | 'survey';
  points: number;
  sortOrder: number;
  explanation?: string;
  options?: AnswerOption[];
}

export interface AnswerOption {
  id: string;
  text: string;
  isCorrect?: boolean;
  sortOrder: number;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  status: 'in_progress' | 'submitted' | 'graded';
  score?: number;
  maxScore?: number;
  passed?: boolean;
  startedAt?: string;
  submittedAt?: string;
  answers?: AttemptAnswer[];
  createdAt: string;
}

export interface AttemptAnswer {
  id: string;
  questionId: string;
  selectedOptionIds?: string[];
  freeTextAnswer?: string;
  isCorrect?: boolean;
  pointsEarned: number;
}

export interface HomeworkAssignment {
  id: string;
  title: string;
  description: string;
  lessonId: string;
  lesson?: Lesson;
  deadline?: string;
  maxScore?: number;
  isActive: boolean;
  submissions?: Submission[];
  createdAt: string;
  updatedAt: string;
}

export interface Submission {
  id: string;
  assignmentId: string;
  assignment?: HomeworkAssignment;
  studentId: string;
  student?: User;
  content?: string;
  attachmentUrls?: string[];
  status: SubmissionStatus;
  attempt?: number;
  reviews?: Review[];
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  submissionId: string;
  reviewerId: string;
  reviewer?: User;
  comment: string;
  score?: number;
  verdict: SubmissionStatus;
  createdAt: string;
}

export interface Enrollment {
  id: string;
  userId: string;
  user?: User;
  courseId: string;
  course?: Course;
  status: 'active' | 'completed' | 'dropped';
  progressPercent: number;
  completedAt?: string;
  deadline?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LessonProgress {
  id: string;
  userId: string;
  lessonId: string;
  courseId: string;
  isCompleted: boolean;
  completedAt?: string;
  timeSpentSeconds: number;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message?: string;
  link?: string;
  metadata?: Record<string, unknown>;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

export interface Kudos {
  id: string;
  fromUserId: string;
  fromUser?: User;
  toUserId: string;
  toUser?: User;
  message: string;
  category?: string;
  points: number;
  createdAt: string;
}

export interface KudosReaction {
  id: string;
  userId: string;
  kudosId: string;
  emoji: string;
}

export interface LeaderboardEntry {
  id: string;
  userId: string;
  user: User;
  totalPoints: number;
  kudosReceived: number;
  kudosGiven: number;
  rank: number;
  period: string;
}

export interface AuditLog {
  id: string;
  userId?: string;
  user?: User;
  action: string;
  entityType: string;
  entityId?: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  ipAddress?: string;
  createdAt: string;
}

// ============================================================
// API Response Types
// ============================================================

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: UserRoleType;
}

// ============================================================
// Status Types
// ============================================================

export type CourseStatus = 'draft' | 'published' | 'archived';
export type SubmissionStatus = 'submitted' | 'in_review' | 'needs_revision' | 'accepted' | 'rejected';
