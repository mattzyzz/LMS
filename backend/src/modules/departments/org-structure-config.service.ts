import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { OrgStructureConfig } from './org-structure-config.entity';

const DEFAULTS: Partial<OrgStructureConfig> = {
  isDefault: true,
  headLabelDepth0: 'Директор департамента',
  headLabelDepthN: 'Руководитель отдела',
  unassignedLabel: 'не назначен',
  showPhone: true,
  showEmail: true,
  showEmployeeNumber: true,
  showPosition: true,
  showManager: true,
  cardFieldsOrder: ['email', 'phone', 'employeeNumber', 'manager'],
  avatarSize: 60,
  showVacationBadge: true,
  circleButtonSize: 30,
  fontSizeDeptDepth0: 16,
  fontSizeDeptDepthN: 15,
};

@Injectable()
export class OrgStructureConfigService implements OnModuleInit {
  constructor(
    @InjectRepository(OrgStructureConfig)
    private readonly repo: Repository<OrgStructureConfig>,
  ) {}

  async onModuleInit() {
    const count = await this.repo.count();
    if (count === 0) {
      await this.repo.save(this.repo.create(DEFAULTS as DeepPartial<OrgStructureConfig>));
    }
  }

  async getDefault(): Promise<OrgStructureConfig> {
    const config = await this.repo.findOne({ where: { isDefault: true } });
    if (!config) {
      return this.repo.save(this.repo.create(DEFAULTS as DeepPartial<OrgStructureConfig>));
    }
    return config;
  }

  async update(dto: Partial<OrgStructureConfig>): Promise<OrgStructureConfig> {
    const config = await this.getDefault();
    await this.repo.update(config.id, dto as any);
    return this.getDefault();
  }

  async reset(): Promise<OrgStructureConfig> {
    const config = await this.getDefault();
    const { id } = config;
    await this.repo.update(id, DEFAULTS as any);
    return this.getDefault();
  }
}
