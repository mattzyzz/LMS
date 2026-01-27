import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Event } from './event.entity';
import { Reminder } from './reminder.entity';
import { CompanyGoal } from './company-goal.entity';
import { CreateEventDto, UpdateEventDto } from './dto/create-event.dto';
import { PaginationDto, PaginatedResponseDto } from '../../common/dto/pagination.dto';

@Injectable()
export class CalendarService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @InjectRepository(Reminder)
    private readonly reminderRepository: Repository<Reminder>,
    @InjectRepository(CompanyGoal)
    private readonly goalRepository: Repository<CompanyGoal>,
  ) {}

  async createEvent(creatorId: string, dto: CreateEventDto): Promise<Event> {
    const event = this.eventRepository.create({ ...dto, creatorId });
    return this.eventRepository.save(event);
  }

  async findAllEvents(pagination: PaginationDto): Promise<PaginatedResponseDto<Event>> {
    const [data, total] = await this.eventRepository.findAndCount({
      relations: ['creator'],
      order: { startDate: pagination.order },
      skip: pagination.skip,
      take: pagination.limit,
    });
    return new PaginatedResponseDto(data, total, pagination);
  }

  async findEventsByRange(start: Date, end: Date): Promise<Event[]> {
    return this.eventRepository.find({
      where: { startDate: Between(start, end) },
      relations: ['creator'],
      order: { startDate: 'ASC' },
    });
  }

  async findEventById(id: string): Promise<Event> {
    const event = await this.eventRepository.findOne({
      where: { id },
      relations: ['creator'],
    });
    if (!event) throw new NotFoundException('Event not found');
    return event;
  }

  async updateEvent(id: string, dto: UpdateEventDto): Promise<Event> {
    const event = await this.findEventById(id);
    Object.assign(event, dto);
    return this.eventRepository.save(event);
  }

  async removeEvent(id: string): Promise<void> {
    const event = await this.findEventById(id);
    await this.eventRepository.remove(event);
  }

  async createReminder(eventId: string, userId: string, remindAt: Date): Promise<Reminder> {
    const reminder = this.reminderRepository.create({ eventId, userId, remindAt });
    return this.reminderRepository.save(reminder);
  }

  async getUserReminders(userId: string): Promise<Reminder[]> {
    return this.reminderRepository.find({
      where: { userId, isSent: false },
      relations: ['event'],
      order: { remindAt: 'ASC' },
    });
  }

  async createGoal(data: Partial<CompanyGoal>): Promise<CompanyGoal> {
    const goal = this.goalRepository.create(data);
    return this.goalRepository.save(goal);
  }

  async findAllGoals(): Promise<CompanyGoal[]> {
    return this.goalRepository.find({ relations: ['owner'], order: { createdAt: 'DESC' } });
  }

  async updateGoal(id: string, data: Partial<CompanyGoal>): Promise<CompanyGoal> {
    const goal = await this.goalRepository.findOne({ where: { id } });
    if (!goal) throw new NotFoundException('Goal not found');
    Object.assign(goal, data);
    return this.goalRepository.save(goal);
  }
}
