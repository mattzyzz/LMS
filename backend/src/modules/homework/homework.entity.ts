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

@Entity('homework_assignments')
export class HomeworkAssignment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 500 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Index()
  @Column({ type: 'uuid' })
  lessonId: string;

  @ManyToOne(() => Lesson, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lessonId' })
  lesson: Lesson;

  @Column({ type: 'timestamp', nullable: true })
  deadline: Date | null;

  @Column({ type: 'int', nullable: true })
  maxScore: number | null;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany(() => Submission, (s) => s.assignment)
  submissions: Submission[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

export enum SubmissionStatus {
  SUBMITTED = 'submitted',
  IN_REVIEW = 'in_review',
  NEEDS_REVISION = 'needs_revision',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

@Entity('homework_submissions')
export class Submission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  assignmentId: string;

  @ManyToOne(() => HomeworkAssignment, (a) => a.submissions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'assignmentId' })
  assignment: HomeworkAssignment;

  @Index()
  @Column({ type: 'uuid' })
  studentId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'studentId' })
  student: User;

  @Column({ type: 'text', nullable: true })
  content: string | null;

  @Column({ type: 'simple-array', nullable: true })
  attachmentUrls: string[] | null;

  @Column({ type: 'enum', enum: SubmissionStatus, default: SubmissionStatus.SUBMITTED })
  status: SubmissionStatus;

  @Column({ type: 'int', nullable: true })
  attempt: number;

  @OneToMany(() => Review, (r) => r.submission)
  reviews: Review[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('homework_reviews')
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  submissionId: string;

  @ManyToOne(() => Submission, (s) => s.reviews, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'submissionId' })
  submission: Submission;

  @Column({ type: 'uuid' })
  reviewerId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reviewerId' })
  reviewer: User;

  @Column({ type: 'text' })
  comment: string;

  @Column({ type: 'int', nullable: true })
  score: number | null;

  @Column({ type: 'enum', enum: SubmissionStatus })
  verdict: SubmissionStatus;

  @CreateDateColumn()
  createdAt: Date;
}
