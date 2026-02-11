import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Enrollment, EnrollmentStatus, LessonProgress } from './enrollment.entity';
import { EnrollDto, UpdateProgressDto } from './dto/enrollment.dto';
import { PaginationDto, PaginatedResponseDto } from '../../common/dto/pagination.dto';

@Injectable()
export class EnrollmentsService {
  constructor(
    @InjectRepository(Enrollment)
    private readonly enrollmentRepo: Repository<Enrollment>,
    @InjectRepository(LessonProgress)
    private readonly progressRepo: Repository<LessonProgress>,
  ) {}

  async enroll(userId: string, dto: EnrollDto): Promise<Enrollment> {
    const existing = await this.enrollmentRepo.findOne({
      where: { userId, courseId: dto.courseId },
    });
    if (existing) throw new ConflictException('Already enrolled in this course');

    const enrollment = this.enrollmentRepo.create({
      userId,
      courseId: dto.courseId,
      deadline: dto.deadline ? new Date(dto.deadline) : null,
    });
    return this.enrollmentRepo.save(enrollment);
  }

  async getMyEnrollments(
    userId: string,
    pagination: PaginationDto,
  ): Promise<PaginatedResponseDto<Enrollment>> {
    const [data, total] = await this.enrollmentRepo.findAndCount({
      where: { userId },
      relations: ['course', 'course.author'],
      order: { [pagination.sort]: pagination.order },
      skip: pagination.skip,
      take: pagination.limit,
    });
    return new PaginatedResponseDto(data, total, pagination);
  }

  async getEnrollment(userId: string, courseId: string): Promise<Enrollment> {
    const enrollment = await this.enrollmentRepo.findOne({
      where: { userId, courseId },
      relations: ['course'],
    });
    if (!enrollment) throw new NotFoundException('Enrollment not found');
    return enrollment;
  }

  async updateProgress(userId: string, courseId: string, dto: UpdateProgressDto): Promise<LessonProgress> {
    let progress = await this.progressRepo.findOne({
      where: { userId, lessonId: dto.lessonId },
    });

    if (!progress) {
      progress = this.progressRepo.create({
        userId,
        lessonId: dto.lessonId,
        courseId,
      });
    }

    progress.isCompleted = dto.isCompleted;
    if (dto.isCompleted && !progress.completedAt) {
      progress.completedAt = new Date();
    }
    if (dto.timeSpentSeconds !== undefined) {
      progress.timeSpentSeconds += dto.timeSpentSeconds;
    }

    const saved = await this.progressRepo.save(progress);

    await this.recalculateEnrollmentProgress(userId, courseId);

    return saved;
  }

  async getLessonProgress(userId: string, courseId: string): Promise<LessonProgress[]> {
    return this.progressRepo.find({
      where: { userId, courseId },
      order: { createdAt: 'ASC' },
    });
  }

  async getEnrollmentsByCourse(
    courseId: string,
    pagination: PaginationDto,
  ): Promise<PaginatedResponseDto<Enrollment>> {
    const [data, total] = await this.enrollmentRepo.findAndCount({
      where: { courseId },
      relations: ['user'],
      order: { [pagination.sort]: pagination.order },
      skip: pagination.skip,
      take: pagination.limit,
    });
    return new PaginatedResponseDto(data, total, pagination);
  }

  async dropEnrollment(userId: string, courseId: string): Promise<Enrollment> {
    const enrollment = await this.getEnrollment(userId, courseId);
    enrollment.status = EnrollmentStatus.DROPPED;
    return this.enrollmentRepo.save(enrollment);
  }

  async getAllEnrollments(pagination: PaginationDto): Promise<PaginatedResponseDto<Enrollment>> {
    const [data, total] = await this.enrollmentRepo.findAndCount({
      relations: ['user', 'course'],
      order: { [pagination.sort]: pagination.order },
      skip: pagination.skip,
      take: pagination.limit,
    });
    return new PaginatedResponseDto(data, total, pagination);
  }

  async deleteEnrollment(id: string): Promise<void> {
    const enrollment = await this.enrollmentRepo.findOne({ where: { id } });
    if (!enrollment) throw new NotFoundException('Enrollment not found');

    // Delete related progress
    await this.progressRepo.delete({ userId: enrollment.userId, courseId: enrollment.courseId });

    // Delete enrollment
    await this.enrollmentRepo.remove(enrollment);
  }

  private async recalculateEnrollmentProgress(userId: string, courseId: string): Promise<void> {
    const totalLessons = await this.progressRepo.count({ where: { userId, courseId } });
    const completedLessons = await this.progressRepo.count({
      where: { userId, courseId, isCompleted: true },
    });

    const enrollment = await this.enrollmentRepo.findOne({
      where: { userId, courseId },
    });
    if (!enrollment) return;

    enrollment.progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    if (enrollment.progressPercent === 100) {
      enrollment.status = EnrollmentStatus.COMPLETED;
      enrollment.completedAt = new Date();
    }

    await this.enrollmentRepo.save(enrollment);
  }
}
