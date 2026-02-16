import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { HomeworkAssignment } from '../homework.entity';

@Entity('assignment_attachments')
export class AssignmentAttachment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  assignmentId: string;

  @ManyToOne(() => HomeworkAssignment, (a) => a.attachments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'assignmentId' })
  assignment: HomeworkAssignment;

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
