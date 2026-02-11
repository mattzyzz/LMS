export enum Roles {
  ADMIN = 'admin',
  MANAGER = 'manager',
  TEACHER = 'teacher',
  STUDENT = 'student',
  HR = 'hr',
}

export const ROLE_LABELS: Record<string, string> = {
  [Roles.ADMIN]: 'Администратор',
  [Roles.MANAGER]: 'Менеджер',
  [Roles.TEACHER]: 'Преподаватель',
  [Roles.STUDENT]: 'Сотрудник',
  [Roles.HR]: 'HR',
  hrd: 'HRD / Администратор',
  employee: 'Сотрудник',
};

export const ROLE_COLORS: Record<string, string> = {
  [Roles.ADMIN]: 'red',
  [Roles.MANAGER]: 'blue',
  [Roles.TEACHER]: 'green',
  [Roles.STUDENT]: 'default',
  [Roles.HR]: 'purple',
  hrd: 'purple',
  employee: 'blue',
};

export enum CourseStatuses {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export const COURSE_STATUS_LABELS: Record<string, string> = {
  [CourseStatuses.DRAFT]: 'Черновик',
  [CourseStatuses.PUBLISHED]: 'Опубликован',
  [CourseStatuses.ARCHIVED]: 'В архиве',
};

export const COURSE_STATUS_COLORS: Record<string, string> = {
  [CourseStatuses.DRAFT]: 'default',
  [CourseStatuses.PUBLISHED]: 'success',
  [CourseStatuses.ARCHIVED]: 'warning',
};

export enum SubmissionStatuses {
  PENDING = 'pending',
  SUBMITTED = 'submitted',
  IN_REVIEW = 'in_review',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  REVISION_REQUESTED = 'revision_requested',
}

export const SUBMISSION_STATUS_LABELS: Record<string, string> = {
  [SubmissionStatuses.PENDING]: 'Ожидает',
  [SubmissionStatuses.SUBMITTED]: 'Отправлено',
  [SubmissionStatuses.IN_REVIEW]: 'На проверке',
  [SubmissionStatuses.ACCEPTED]: 'Принято',
  [SubmissionStatuses.REJECTED]: 'Отклонено',
  [SubmissionStatuses.REVISION_REQUESTED]: 'На доработке',
};

export const SUBMISSION_STATUS_COLORS: Record<string, string> = {
  [SubmissionStatuses.PENDING]: 'default',
  [SubmissionStatuses.SUBMITTED]: 'processing',
  [SubmissionStatuses.IN_REVIEW]: 'warning',
  [SubmissionStatuses.ACCEPTED]: 'success',
  [SubmissionStatuses.REJECTED]: 'error',
  [SubmissionStatuses.REVISION_REQUESTED]: 'orange',
};

export enum EventTypes {
  MEETING = 'meeting',
  DEADLINE = 'deadline',
  HOLIDAY = 'holiday',
  BIRTHDAY = 'birthday',
  TRAINING = 'training',
  OTHER = 'other',
}

export const EVENT_TYPE_LABELS: Record<string, string> = {
  [EventTypes.MEETING]: 'Встреча',
  [EventTypes.DEADLINE]: 'Дедлайн',
  [EventTypes.HOLIDAY]: 'Праздник',
  [EventTypes.BIRTHDAY]: 'День рождения',
  [EventTypes.TRAINING]: 'Обучение',
  [EventTypes.OTHER]: 'Другое',
};

export const EVENT_TYPE_COLORS: Record<string, string> = {
  [EventTypes.MEETING]: '#1890ff',
  [EventTypes.DEADLINE]: '#ff4d4f',
  [EventTypes.HOLIDAY]: '#52c41a',
  [EventTypes.BIRTHDAY]: '#fa8c16',
  [EventTypes.TRAINING]: '#722ed1',
  [EventTypes.OTHER]: '#8c8c8c',
};

export const DIFFICULTY_LABELS: Record<string, string> = {
  beginner: 'Начальный',
  intermediate: 'Средний',
  advanced: 'Продвинутый',
};

export const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: 'green',
  intermediate: 'blue',
  advanced: 'red',
};

export const SKILL_LEVEL_LABELS: Record<string, string> = {
  beginner: 'Начинающий',
  intermediate: 'Средний',
  advanced: 'Продвинутый',
  expert: 'Эксперт',
};

export const AVAILABILITY_LABELS: Record<string, string> = {
  available: 'Доступен',
  busy: 'Занят',
  away: 'Отошёл',
  offline: 'Не в сети',
};

export const AVAILABILITY_COLORS: Record<string, string> = {
  available: '#52c41a',
  busy: '#ff4d4f',
  away: '#faad14',
  offline: '#d9d9d9',
};

export const KUDOS_CATEGORY_LABELS: Record<string, string> = {
  teamwork: 'Командная работа',
  innovation: 'Инновации',
  leadership: 'Лидерство',
  quality: 'Качество',
  dedication: 'Преданность делу',
};

export const NOTIFICATION_TYPE_LABELS: Record<string, string> = {
  info: 'Информация',
  success: 'Успех',
  warning: 'Предупреждение',
  error: 'Ошибка',
  course: 'Курс',
  homework: 'Домашнее задание',
  comment: 'Комментарий',
  kudos: 'Благодарность',
};
