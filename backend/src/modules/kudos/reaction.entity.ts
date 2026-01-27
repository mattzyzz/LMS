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
import { Kudos } from './kudos.entity';

@Entity('reactions')
@Index(['userId', 'kudosId'], { unique: true })
export class Reaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'uuid' })
  kudosId: string;

  @ManyToOne(() => Kudos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'kudosId' })
  kudos: Kudos;

  @Column({ type: 'varchar', length: 50 })
  emoji: string;

  @CreateDateColumn()
  createdAt: Date;
}
