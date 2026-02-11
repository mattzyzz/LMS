import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Lesson } from '../courses/course.entity';

export enum QuestionType {
  SINGLE_CHOICE = 'single_choice',
  MULTIPLE_CHOICE = 'multiple_choice',
  FREE_TEXT = 'free_text',
  SURVEY = 'survey',
}

@Entity('quizzes')
export class Quiz {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 500 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  lessonId: string | null;

  @ManyToOne(() => Lesson, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'lessonId' })
  lesson: Lesson | null;

  @Column({ type: 'int', nullable: true })
  timeLimitMinutes: number | null;

  @Column({ type: 'int', default: 1 })
  maxAttempts: number;

  @Column({ type: 'int', default: 70 })
  passingScore: number;

  @Column({ type: 'boolean', default: false })
  randomizeQuestions: boolean;

  @Column({ type: 'boolean', default: false })
  randomizeOptions: boolean;

  @Column({ type: 'boolean', default: true })
  showResults: boolean;

  @OneToMany(() => Question, (q) => q.quiz, { cascade: true })
  questions: Question[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('questions')
export class Question {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  quizId: string;

  @ManyToOne(() => Quiz, (q) => q.questions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'quizId' })
  quiz: Quiz;

  @Column({ type: 'text' })
  text: string;

  @Column({ type: 'enum', enum: QuestionType })
  type: QuestionType;

  @Column({ type: 'int', default: 1 })
  points: number;

  @Column({ type: 'int', default: 0 })
  sortOrder: number;

  @Column({ type: 'text', nullable: true })
  explanation: string | null;

  @OneToMany(() => AnswerOption, (a) => a.question, { cascade: true })
  options: AnswerOption[];

  @CreateDateColumn()
  createdAt: Date;
}

@Entity('answer_options')
export class AnswerOption {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  questionId: string;

  @ManyToOne(() => Question, (q) => q.options, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'questionId' })
  question: Question;

  @Column({ type: 'text' })
  text: string;

  @Column({ type: 'boolean', default: false })
  isCorrect: boolean;

  @Column({ type: 'int', default: 0 })
  sortOrder: number;
}

export enum AttemptStatus {
  IN_PROGRESS = 'in_progress',
  SUBMITTED = 'submitted',
  GRADED = 'graded',
}

@Entity('quiz_attempts')
export class Attempt {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Index()
  @Column({ type: 'uuid' })
  quizId: string;

  @ManyToOne(() => Quiz, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'quizId' })
  quiz: Quiz;

  @Column({ type: 'enum', enum: AttemptStatus, default: AttemptStatus.IN_PROGRESS })
  status: AttemptStatus;

  @Column({ type: 'int', nullable: true })
  score: number | null;

  @Column({ type: 'int', nullable: true })
  maxScore: number | null;

  @Column({ type: 'boolean', nullable: true })
  passed: boolean | null;

  @Column({ type: 'timestamp', nullable: true })
  startedAt: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  submittedAt: Date | null;

  @OneToMany(() => AttemptAnswer, (a) => a.attempt, { cascade: true })
  answers: AttemptAnswer[];

  @CreateDateColumn()
  createdAt: Date;
}

@Entity('attempt_answers')
export class AttemptAnswer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  attemptId: string;

  @ManyToOne(() => Attempt, (a) => a.answers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'attemptId' })
  attempt: Attempt;

  @Column({ type: 'uuid' })
  questionId: string;

  @ManyToOne(() => Question, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'questionId' })
  question: Question;

  @Column({ type: 'simple-array', nullable: true })
  selectedOptionIds: string[] | null;

  @Column({ type: 'text', nullable: true })
  freeTextAnswer: string | null;

  @Column({ type: 'boolean', nullable: true })
  isCorrect: boolean | null;

  @Column({ type: 'int', default: 0 })
  pointsEarned: number;

  @CreateDateColumn()
  createdAt: Date;
}
