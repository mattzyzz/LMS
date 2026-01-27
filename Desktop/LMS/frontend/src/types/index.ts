// ============================================================
// LMS TypeScript Interfaces
// ============================================================

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  patronymic?: string;
  avatarUrl?: string;
  phone?: string;
  birthday?: string;
  roleId: number;
  role?: Role;
  departmentId?: number;
  department?: Department;
  profile?: Profile;
  position?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: number;
  name: string;
  slug: string;
  description?: string;
  permissions?: string[];
}

export interface Department {
  id: number;
  name: string;
  description?: string;
  parentId?: number;
  parent?: Department;
  children?: Department[];
  headId?: number;
  head?: User;
  employees?: User[];
  createdAt: string;
  updatedAt: string;
}

export interface Profile {
  id: number;
  userId: number;
  bio?: string;
  skills?: Skill[];
  socialLinks?: SocialLinks;
  availabilityStatus?: 'available' | 'busy' | 'away' | 'offline';
  timezone?: string;
}

export interface Skill {
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

export interface SocialLinks {
  telegram?: string;
  vk?: string;
  github?: string;
  linkedin?: string;
}

export interface Post {
  id: number;
  title: string;
  content: string;
  excerpt?: string;
  authorId: number;
  author?: User;
  isPinned: boolean;
  isPublished: boolean;
  likesCount: number;
  commentsCount: number;
  isLiked?: boolean;
  attachments?: Attachment[];
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: number;
  content: string;
  authorId: number;
  author?: User;
  postId?: number;
  lessonId?: number;
  parentId?: number;
  replies?: Comment[];
  createdAt: string;
  updatedAt: string;
}

export interface Attachment {
  id: number;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
}

export interface Event {
  id: number;
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  allDay: boolean;
  type: 'meeting' | 'deadline' | 'holiday' | 'birthday' | 'training' | 'other';
  color?: string;
  location?: string;
  organizerId: number;
  organizer?: User;
  participants?: User[];
  createdAt: string;
  updatedAt: string;
}

export interface Course {
  id: number;
  title: string;
  description: string;
  shortDescription?: string;
  thumbnailUrl?: string;
  authorId: number;
  author?: User;
  categoryId?: number;
  category?: CourseCategory;
  status: CourseStatus;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration?: number;
  rating?: number;
  enrollmentsCount: number;
  isFree: boolean;
  price?: number;
  modules?: Module[];
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CourseCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
}

export interface Module {
  id: number;
  title: string;
  description?: string;
  courseId: number;
  order: number;
  lessons?: Lesson[];
}

export interface Lesson {
  id: number;
  title: string;
  description?: string;
  moduleId: number;
  order: number;
  type: 'text' | 'video' | 'mixed';
  contentBlocks?: ContentBlock[];
  duration?: number;
  isCompleted?: boolean;
  homeworkId?: number;
  homework?: Homework;
}

export interface ContentBlock {
  id: string;
  type: 'text' | 'heading' | 'image' | 'video' | 'file' | 'quote' | 'code' | 'quiz';
  content: string;
  metadata?: Record<string, unknown>;
  order: number;
}

export interface Quiz {
  id: number;
  title: string;
  description?: string;
  courseId?: number;
  lessonId?: number;
  timeLimit?: number; // in minutes
  passingScore: number;
  questionsCount: number;
  questions?: Question[];
  attempts?: QuizAttempt[];
  createdAt: string;
  updatedAt: string;
}

export interface Question {
  id: number;
  quizId: number;
  text: string;
  type: 'single' | 'multiple' | 'text' | 'ordering';
  options?: QuestionOption[];
  points: number;
  order: number;
  explanation?: string;
}

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect?: boolean;
}

export interface QuizAttempt {
  id: number;
  quizId: number;
  userId: number;
  score: number;
  maxScore: number;
  passed: boolean;
  answers: Record<number, string | string[]>;
  startedAt: string;
  completedAt?: string;
}

export interface Homework {
  id: number;
  title: string;
  description: string;
  lessonId: number;
  lesson?: Lesson;
  courseId?: number;
  course?: Course;
  dueDate?: string;
  maxScore: number;
  submissions?: Submission[];
  createdAt: string;
  updatedAt: string;
}

export interface Submission {
  id: number;
  homeworkId: number;
  homework?: Homework;
  studentId: number;
  student?: User;
  content: string;
  attachments?: Attachment[];
  status: SubmissionStatus;
  score?: number;
  reviewComment?: string;
  reviewerId?: number;
  reviewer?: User;
  submittedAt: string;
  reviewedAt?: string;
}

export interface Enrollment {
  id: number;
  userId: number;
  user?: User;
  courseId: number;
  course?: Course;
  progress: number;
  status: 'active' | 'completed' | 'paused' | 'dropped';
  completedLessons?: number[];
  enrolledAt: string;
  completedAt?: string;
}

export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'course' | 'homework' | 'comment' | 'kudos';
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export interface Kudos {
  id: number;
  senderId: number;
  sender?: User;
  receiverId: number;
  receiver?: User;
  message: string;
  category?: 'teamwork' | 'innovation' | 'leadership' | 'quality' | 'dedication';
  reactions?: KudosReaction[];
  createdAt: string;
}

export interface KudosReaction {
  userId: number;
  emoji: string;
}

export interface KudosLeaderboard {
  userId: number;
  user: User;
  receivedCount: number;
  sentCount: number;
}

// ============================================================
// API Response Types
// ============================================================

export interface ApiResponse<T> {
  data: T;
  message?: string;
  statusCode: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
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
}

// ============================================================
// Status Types
// ============================================================

export type CourseStatus = 'draft' | 'published' | 'archived';
export type SubmissionStatus = 'pending' | 'submitted' | 'in_review' | 'accepted' | 'rejected' | 'revision_requested';
