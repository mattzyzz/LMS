import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('org_structure_configs')
export class OrgStructureConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'boolean', default: true })
  isDefault: boolean;

  // Head labels
  @Column({ type: 'varchar', length: 200, default: 'Директор департамента' })
  headLabelDepth0: string;

  @Column({ type: 'varchar', length: 200, default: 'Руководитель отдела' })
  headLabelDepthN: string;

  @Column({ type: 'varchar', length: 200, default: 'не назначен' })
  unassignedLabel: string;

  // Card field visibility
  @Column({ type: 'boolean', default: true })
  showPhone: boolean;

  @Column({ type: 'boolean', default: true })
  showEmail: boolean;

  @Column({ type: 'boolean', default: true })
  showEmployeeNumber: boolean;

  @Column({ type: 'boolean', default: true })
  showPosition: boolean;

  @Column({ type: 'boolean', default: true })
  showManager: boolean;

  @Column({ type: 'jsonb', default: '["email","phone","employeeNumber","manager"]' })
  cardFieldsOrder: string[];

  // Visual sizing
  @Column({ type: 'int', default: 60 })
  avatarSize: number;

  @Column({ type: 'boolean', default: true })
  showVacationBadge: boolean;

  @Column({ type: 'int', default: 30 })
  circleButtonSize: number;

  @Column({ type: 'int', default: 16 })
  fontSizeDeptDepth0: number;

  @Column({ type: 'int', default: 15 })
  fontSizeDeptDepthN: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
