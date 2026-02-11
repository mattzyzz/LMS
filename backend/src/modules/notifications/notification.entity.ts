import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../users/user.entity';

export enum NotificationType {
  COMMENT = 'comment',
  MENTION = 'mention',
  COURSE_ASSIGNED = 'course_assigned',
  HOMEWORK_DEADLINE = 'homework_deadline',
  HOMEWORK_REVIEWED = 'homework_reviewed',
  SUBMISSION_RECEIVED = 'submission_received',
  QUIZ_RESULT = 'quiz_result',
  KUDOS_RECEIVED = 'kudos_received',
  EVENT_REMINDER = 'event_reminder',
  BIRTHDAY = 'birthday',
  NEWS_PUBLISHED = 'news_published',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'enum', enum: NotificationType })
  type: NotificationType;

  @Column({ type: 'varchar', length: 500 })
  title: string;

  @Column({ type: 'text', nullable: true })
  message: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  link: string | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any> | null;

  @Column({ type: 'boolean', default: false })
  isRead: boolean;

  @Column({ type: 'timestamp', nullable: true })
  readAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;
}
