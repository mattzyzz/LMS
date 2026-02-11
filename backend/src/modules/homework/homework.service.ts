import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { HomeworkAssignment, Submission, SubmissionStatus, Review } from './homework.entity';
import {
  CreateAssignmentDto,
  UpdateAssignmentDto,
  CreateSubmissionDto,
  UpdateSubmissionDto,
  CreateReviewDto,
} from './dto/homework.dto';
import { PaginationDto, PaginatedResponseDto } from '../../common/dto/pagination.dto';
import { Enrollment } from '../enrollments/enrollment.entity';
import { Lesson } from '../courses/course.entity';

@Injectable()
export class HomeworkService {
  constructor(
    @InjectRepository(HomeworkAssignment)
    private readonly assignmentRepo: Repository<HomeworkAssignment>,
    @InjectRepository(Submission)
    private readonly submissionRepo: Repository<Submission>,
    @InjectRepository(Review)
    private readonly reviewRepo: Repository<Review>,
    @InjectRepository(Enrollment)
    private readonly enrollmentRepo: Repository<Enrollment>,
    @InjectRepository(Lesson)
    private readonly lessonRepo: Repository<Lesson>,
  ) {}

  // --- Assignments ---

  async createAssignment(dto: CreateAssignmentDto): Promise<HomeworkAssignment> {
    const assignment = this.assignmentRepo.create({
      ...dto,
      deadline: dto.deadline ? new Date(dto.deadline) : null,
    });
    return this.assignmentRepo.save(assignment);
  }

  async findAssignmentById(id: string): Promise<HomeworkAssignment> {
    const assignment = await this.assignmentRepo.findOne({
      where: { id },
      relations: ['lesson'],
    });
    if (!assignment) throw new NotFoundException('Assignment not found');
    return assignment;
  }

  async findAssignmentsByLesson(lessonId: string): Promise<HomeworkAssignment[]> {
    return this.assignmentRepo.find({
      where: { lessonId, isActive: true },
      order: { createdAt: 'ASC' },
    });
  }

  async updateAssignment(id: string, dto: UpdateAssignmentDto): Promise<HomeworkAssignment> {
    const assignment = await this.findAssignmentById(id);
    if (dto.deadline) {
      (dto as any).deadline = new Date(dto.deadline);
    }
    Object.assign(assignment, dto);
    return this.assignmentRepo.save(assignment);
  }

  async removeAssignment(id: string): Promise<void> {
    const assignment = await this.findAssignmentById(id);
    await this.assignmentRepo.remove(assignment);
  }

  // --- Submissions ---

  async createSubmission(studentId: string, dto: CreateSubmissionDto & { assignmentId: string }): Promise<Submission> {
    const assignment = await this.findAssignmentById(dto.assignmentId);

    if (assignment.deadline && new Date() > assignment.deadline) {
      throw new BadRequestException('Deadline has passed');
    }

    const prevCount = await this.submissionRepo.count({
      where: { assignmentId: dto.assignmentId, studentId },
    });

    const submission = this.submissionRepo.create({
      ...dto,
      studentId,
      attempt: prevCount + 1,
    });
    return this.submissionRepo.save(submission);
  }

  async getSubmission(id: string): Promise<Submission> {
    const submission = await this.submissionRepo.findOne({
      where: { id },
      relations: ['student', 'assignment', 'reviews', 'reviews.reviewer'],
    });
    if (!submission) throw new NotFoundException('Submission not found');
    return submission;
  }

  async getMySubmissions(
    studentId: string,
    assignmentId: string,
  ): Promise<Submission[]> {
    return this.submissionRepo.find({
      where: { studentId, assignmentId },
      relations: ['reviews'],
      order: { createdAt: 'DESC' },
    });
  }

  async getSubmissionsForReview(
    assignmentId: string,
    pagination: PaginationDto,
  ): Promise<PaginatedResponseDto<Submission>> {
    const [data, total] = await this.submissionRepo.findAndCount({
      where: { assignmentId },
      relations: ['student', 'reviews'],
      order: { [pagination.sort]: pagination.order },
      skip: pagination.skip,
      take: pagination.limit,
    });
    return new PaginatedResponseDto(data, total, pagination);
  }

  async getPendingReviews(
    pagination: PaginationDto,
  ): Promise<PaginatedResponseDto<Submission>> {
    const [data, total] = await this.submissionRepo.findAndCount({
      where: [
        { status: SubmissionStatus.SUBMITTED },
        { status: SubmissionStatus.IN_REVIEW },
      ],
      relations: ['student', 'assignment', 'assignment.lesson'],
      order: { [pagination.sort]: pagination.order },
      skip: pagination.skip,
      take: pagination.limit,
    });
    return new PaginatedResponseDto(data, total, pagination);
  }

  // --- Reviews ---

  async createReview(
    reviewerId: string,
    submissionId: string,
    dto: CreateReviewDto,
  ): Promise<Review> {
    const submission = await this.getSubmission(submissionId);

    const review = this.reviewRepo.create({
      submissionId,
      reviewerId,
      ...dto,
    });
    const saved = await this.reviewRepo.save(review);

    submission.status = dto.verdict;
    await this.submissionRepo.save(submission);

    return saved;
  }

  // --- Additional user-facing methods ---

  async getAssignmentsForUser(userId: string): Promise<HomeworkAssignment[]> {
    // Get user's enrolled courses
    const enrollments = await this.enrollmentRepo.find({
      where: { userId, status: 'active' as any },
      select: ['courseId'],
    });

    if (enrollments.length === 0) return [];

    const courseIds = enrollments.map((e) => e.courseId);

    // Get lessons for these courses
    const lessons = await this.lessonRepo
      .createQueryBuilder('lesson')
      .innerJoin('lesson.module', 'module')
      .where('module.courseId IN (:...courseIds)', { courseIds })
      .getMany();

    if (lessons.length === 0) return [];

    const lessonIds = lessons.map((l) => l.id);

    // Get active assignments for these lessons
    return this.assignmentRepo.find({
      where: {
        lessonId: In(lessonIds),
        isActive: true,
      },
      relations: ['lesson'],
      order: { deadline: 'ASC' },
    });
  }

  async getAllUserSubmissions(userId: string): Promise<Submission[]> {
    return this.submissionRepo.find({
      where: { studentId: userId },
      relations: ['assignment', 'reviews', 'reviews.reviewer'],
      order: { createdAt: 'DESC' },
    });
  }

  async getAllSubmissions(): Promise<Submission[]> {
    return this.submissionRepo.find({
      relations: ['student', 'assignment', 'reviews', 'reviews.reviewer'],
      order: { createdAt: 'DESC' },
    });
  }

  async getLatestSubmission(userId: string, assignmentId: string): Promise<Submission | null> {
    const submission = await this.submissionRepo.findOne({
      where: { studentId: userId, assignmentId },
      relations: ['assignment', 'reviews', 'reviews.reviewer'],
      order: { createdAt: 'DESC' },
    });
    return submission;
  }

  async updateSubmission(
    userId: string,
    submissionId: string,
    dto: UpdateSubmissionDto,
  ): Promise<Submission> {
    const submission = await this.submissionRepo.findOne({
      where: { id: submissionId },
      relations: ['assignment'],
    });

    if (!submission) throw new NotFoundException('Submission not found');
    if (submission.studentId !== userId) throw new ForbiddenException('Not your submission');

    if (submission.status !== SubmissionStatus.NEEDS_REVISION) {
      throw new BadRequestException('Can only update submissions that need revision');
    }

    submission.content = dto.content ?? submission.content;
    submission.attachmentUrls = dto.attachmentUrls ?? submission.attachmentUrls;
    submission.status = SubmissionStatus.SUBMITTED;
    submission.attempt = submission.attempt + 1;

    return this.submissionRepo.save(submission);
  }
}
