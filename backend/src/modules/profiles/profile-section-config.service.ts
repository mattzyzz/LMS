import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { ProfileSectionConfig } from './profile-section-config.entity';

const DEFAULT_SECTIONS = [
  { sectionKey: 'overview',  label: 'Обзор',         isVisible: true, sortOrder: 0, visibleFields: ['phone','email','hireDate','bio','city','workSchedule'] },
  { sectionKey: 'skills',    label: 'Навыки',         isVisible: true, sortOrder: 1, visibleFields: [] },
  { sectionKey: 'projects',  label: 'Проекты',        isVisible: true, sortOrder: 2, visibleFields: [] },
  { sectionKey: 'kudos',     label: 'Благодарности',  isVisible: true, sortOrder: 3, visibleFields: [] },
  { sectionKey: 'learning',  label: 'Обучение',       isVisible: true, sortOrder: 4, visibleFields: [] },
];

@Injectable()
export class ProfileSectionConfigService implements OnModuleInit {
  constructor(
    @InjectRepository(ProfileSectionConfig)
    private readonly repo: Repository<ProfileSectionConfig>,
  ) {}

  async onModuleInit() {
    const count = await this.repo.count();
    if (count === 0) {
      for (const s of DEFAULT_SECTIONS) {
        await this.repo.save(this.repo.create(s as DeepPartial<ProfileSectionConfig>));
      }
    }
  }

  async findAll(): Promise<ProfileSectionConfig[]> {
    return this.repo.find({ order: { sortOrder: 'ASC' } });
  }

  async update(sectionKey: string, dto: Partial<ProfileSectionConfig>): Promise<ProfileSectionConfig> {
    await this.repo.update({ sectionKey }, dto as any);
    return this.repo.findOne({ where: { sectionKey } }) as Promise<ProfileSectionConfig>;
  }

  async reorder(items: { sectionKey: string; sortOrder: number }[]): Promise<void> {
    for (const { sectionKey, sortOrder } of items) {
      await this.repo.update({ sectionKey }, { sortOrder } as any);
    }
  }
}
