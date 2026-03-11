import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { DictionaryItem, DictionaryType } from './dictionary-item.entity';
import { Position } from '../departments/position.entity';
import {
  CreateDictionaryItemDto,
  UpdateDictionaryItemDto,
  ReorderDto,
  CreatePositionDto,
  UpdatePositionDto,
} from './dto/dictionary.dto';

const SEED_ITEMS: Omit<DictionaryItem, 'id' | 'createdAt' | 'updatedAt'>[] = [
  { dictionaryType: 'skill_level', code: 'junior',    label: 'Junior',     color: null, sortOrder: 0, isActive: true, metadata: null },
  { dictionaryType: 'skill_level', code: 'middle',    label: 'Middle',     color: null, sortOrder: 1, isActive: true, metadata: null },
  { dictionaryType: 'skill_level', code: 'senior',    label: 'Senior',     color: null, sortOrder: 2, isActive: true, metadata: null },
  { dictionaryType: 'skill_level', code: 'lead',      label: 'Lead',       color: null, sortOrder: 3, isActive: true, metadata: null },
  { dictionaryType: 'contact_type', code: 'email',    label: 'Email',      color: null, sortOrder: 0, isActive: true, metadata: null },
  { dictionaryType: 'contact_type', code: 'phone',    label: 'Телефон',    color: null, sortOrder: 1, isActive: true, metadata: null },
  { dictionaryType: 'contact_type', code: 'telegram', label: 'Telegram',   color: null, sortOrder: 2, isActive: true, metadata: null },
  { dictionaryType: 'availability_label', code: 'available', label: 'Доступен',   color: '#52c41a', sortOrder: 0, isActive: true, metadata: null },
  { dictionaryType: 'availability_label', code: 'busy',      label: 'Занят',       color: '#ff4d4f', sortOrder: 1, isActive: true, metadata: null },
  { dictionaryType: 'availability_label', code: 'on_leave',  label: 'В отпуске',   color: '#1677ff', sortOrder: 2, isActive: true, metadata: null },
  { dictionaryType: 'availability_label', code: 'offline',   label: 'Недоступен',  color: '#c8c8c8', sortOrder: 3, isActive: true, metadata: null },
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-zа-яё0-9\s-]/gi, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 200);
}

@Injectable()
export class DictionariesService implements OnModuleInit {
  constructor(
    @InjectRepository(DictionaryItem)
    private readonly itemRepo: Repository<DictionaryItem>,
    @InjectRepository(Position)
    private readonly positionRepo: Repository<Position>,
  ) {}

  async onModuleInit() {
    // Seed dictionary items
    const count = await this.itemRepo.count();
    if (count === 0) {
      await this.itemRepo.save(SEED_ITEMS.map((i) => this.itemRepo.create(i as DeepPartial<DictionaryItem>)));
    }

    // Seed positions: add isActive / slug / sortOrder to existing records
    const positions = await this.positionRepo.find();
    for (const pos of positions) {
      let changed = false;
      if ((pos as any).isActive === undefined || (pos as any).isActive === null) {
        (pos as any).isActive = true;
        changed = true;
      }
      if (!(pos as any).slug) {
        (pos as any).slug = slugify(pos.title);
        changed = true;
      }
      if (changed) await this.positionRepo.save(pos as any);
    }
  }

  // ── Dictionary items ──────────────────────────────────────────

  async findByType(type: DictionaryType): Promise<DictionaryItem[]> {
    return this.itemRepo.find({
      where: { dictionaryType: type, isActive: true },
      order: { sortOrder: 'ASC', label: 'ASC' },
    });
  }

  async findAllByType(type: DictionaryType): Promise<DictionaryItem[]> {
    return this.itemRepo.find({
      where: { dictionaryType: type },
      order: { sortOrder: 'ASC', label: 'ASC' },
    });
  }

  async createItem(type: DictionaryType, dto: CreateDictionaryItemDto): Promise<DictionaryItem> {
    const item = this.itemRepo.create({ ...dto, dictionaryType: type } as DeepPartial<DictionaryItem>);
    return this.itemRepo.save(item);
  }

  async updateItem(type: DictionaryType, id: string, dto: UpdateDictionaryItemDto): Promise<DictionaryItem> {
    const item = await this.itemRepo.findOne({ where: { id, dictionaryType: type } });
    if (!item) throw new NotFoundException('Item not found');
    await this.itemRepo.update(id, dto as any);
    return this.itemRepo.findOne({ where: { id } }) as Promise<DictionaryItem>;
  }

  async deactivateItem(type: DictionaryType, id: string): Promise<void> {
    const item = await this.itemRepo.findOne({ where: { id, dictionaryType: type } });
    if (!item) throw new NotFoundException('Item not found');
    await this.itemRepo.update(id, { isActive: false } as any);
  }

  async reorder(type: DictionaryType, dto: ReorderDto): Promise<void> {
    for (const { id, sortOrder } of dto.items) {
      await this.itemRepo.update(id, { sortOrder } as any);
    }
  }

  // ── Positions ────────────────────────────────────────────────

  async findAllPositions(activeOnly = true): Promise<Position[]> {
    const where: any = activeOnly ? { isActive: true } : {};
    const rows = await this.positionRepo.find({ where, order: { sortOrder: 'ASC' as any, title: 'ASC' } });
    return rows;
  }

  async createPosition(dto: CreatePositionDto): Promise<Position> {
    const slug = slugify(dto.title);
    const pos = this.positionRepo.create({ title: dto.title, description: dto.description ?? null, sortOrder: dto.sortOrder ?? 0, slug, isActive: true } as DeepPartial<Position>);
    return this.positionRepo.save(pos);
  }

  async updatePosition(id: string, dto: UpdatePositionDto): Promise<Position> {
    const pos = await this.positionRepo.findOne({ where: { id } });
    if (!pos) throw new NotFoundException('Position not found');
    if (dto.title && !dto.slug) (dto as any).slug = slugify(dto.title);
    await this.positionRepo.update(id, dto as any);
    return this.positionRepo.findOne({ where: { id } }) as Promise<Position>;
  }

  async deactivatePosition(id: string): Promise<void> {
    const pos = await this.positionRepo.findOne({ where: { id } });
    if (!pos) throw new NotFoundException('Position not found');
    await this.positionRepo.update(id, { isActive: false } as any);
  }
}
