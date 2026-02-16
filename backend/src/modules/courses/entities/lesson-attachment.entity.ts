import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Lesson } from '../course.entity';

@Entity('lesson_attachments')
export class LessonAttachment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  lessonId: string;

  @ManyToOne(() => Lesson, (l) => l.attachments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lessonId' })
  lesson: Lesson;

  @Column({ type: 'varchar', length: 500 })
  fileName: string;

  @Column({ type: 'varchar', length: 1024 })
  fileUrl: string;

  @Column({ type: 'bigint', default: 0 })
  fileSize: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  fileType: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
