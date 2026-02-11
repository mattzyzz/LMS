import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course, CourseStatus, CourseModule, Lesson, ContentBlock, Asset } from './course.entity';
import {
  CreateCourseDto,
  UpdateCourseDto,
  CreateModuleDto,
  UpdateModuleDto,
  CreateLessonDto,
  UpdateLessonDto,
  CreateContentBlockDto,
  UpdateContentBlockDto,
  ReorderBlocksDto,
} from './dto/course.dto';
import { PaginationDto, PaginatedResponseDto } from '../../common/dto/pagination.dto';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepo: Repository<Course>,
    @InjectRepository(CourseModule)
    private readonly moduleRepo: Repository<CourseModule>,
    @InjectRepository(Lesson)
    private readonly lessonRepo: Repository<Lesson>,
    @InjectRepository(ContentBlock)
    private readonly blockRepo: Repository<ContentBlock>,
    @InjectRepository(Asset)
    private readonly assetRepo: Repository<Asset>,
  ) {}

  // --- Courses ---

  async createCourse(authorId: string, dto: CreateCourseDto): Promise<Course> {
    const course = this.courseRepo.create({ ...dto, authorId });
    return this.courseRepo.save(course);
  }

  async findAllCourses(pagination: PaginationDto): Promise<PaginatedResponseDto<Course>> {
    const [data, total] = await this.courseRepo.findAndCount({
      where: { status: CourseStatus.PUBLISHED },
      relations: ['author'],
      order: { [pagination.sort]: pagination.order },
      skip: pagination.skip,
      take: pagination.limit,
    });
    return new PaginatedResponseDto(data, total, pagination);
  }

  async findAllCoursesAdmin(pagination: PaginationDto): Promise<PaginatedResponseDto<Course>> {
    const [data, total] = await this.courseRepo.findAndCount({
      relations: ['author'],
      order: { [pagination.sort]: pagination.order },
      skip: pagination.skip,
      take: pagination.limit,
    });
    return new PaginatedResponseDto(data, total, pagination);
  }

  async findCourseById(id: string): Promise<Course> {
    const course = await this.courseRepo.findOne({
      where: { id },
      relations: ['author', 'modules', 'modules.lessons'],
    });
    if (!course) throw new NotFoundException('Course not found');
    return course;
  }

  async updateCourse(id: string, dto: UpdateCourseDto): Promise<Course> {
    const course = await this.findCourseById(id);
    Object.assign(course, dto);
    return this.courseRepo.save(course);
  }

  async publishCourse(id: string): Promise<Course> {
    const course = await this.findCourseById(id);
    course.status = CourseStatus.PUBLISHED;
    course.publishedAt = new Date();
    return this.courseRepo.save(course);
  }

  async archiveCourse(id: string): Promise<Course> {
    const course = await this.findCourseById(id);
    course.status = CourseStatus.ARCHIVED;
    return this.courseRepo.save(course);
  }

  async removeCourse(id: string): Promise<void> {
    const course = await this.findCourseById(id);
    await this.courseRepo.softRemove(course);
  }

  // --- Modules ---

  async createModule(dto: CreateModuleDto): Promise<CourseModule> {
    const mod = this.moduleRepo.create(dto);
    return this.moduleRepo.save(mod);
  }

  async updateModule(id: string, dto: UpdateModuleDto): Promise<CourseModule> {
    const mod = await this.moduleRepo.findOne({ where: { id } });
    if (!mod) throw new NotFoundException('Module not found');
    Object.assign(mod, dto);
    return this.moduleRepo.save(mod);
  }

  async removeModule(id: string): Promise<void> {
    const mod = await this.moduleRepo.findOne({ where: { id } });
    if (!mod) throw new NotFoundException('Module not found');
    await this.moduleRepo.remove(mod);
  }

  // --- Lessons ---

  async createLesson(dto: CreateLessonDto): Promise<Lesson> {
    const lesson = this.lessonRepo.create(dto);
    return this.lessonRepo.save(lesson);
  }

  async findLessonById(id: string): Promise<Lesson> {
    const lesson = await this.lessonRepo.findOne({
      where: { id },
      relations: ['contentBlocks'],
      order: { contentBlocks: { sortOrder: 'ASC' } },
    });
    if (!lesson) throw new NotFoundException('Lesson not found');
    return lesson;
  }

  async updateLesson(id: string, dto: UpdateLessonDto): Promise<Lesson> {
    const lesson = await this.findLessonById(id);
    Object.assign(lesson, dto);
    return this.lessonRepo.save(lesson);
  }

  async removeLesson(id: string): Promise<void> {
    const lesson = await this.findLessonById(id);
    await this.lessonRepo.remove(lesson);
  }

  // --- Content Blocks ---

  async createBlock(dto: CreateContentBlockDto): Promise<ContentBlock> {
    const block = this.blockRepo.create(dto);
    return this.blockRepo.save(block);
  }

  async updateBlock(id: string, dto: UpdateContentBlockDto): Promise<ContentBlock> {
    const block = await this.blockRepo.findOne({ where: { id } });
    if (!block) throw new NotFoundException('Content block not found');
    Object.assign(block, dto);
    return this.blockRepo.save(block);
  }

  async removeBlock(id: string): Promise<void> {
    const block = await this.blockRepo.findOne({ where: { id } });
    if (!block) throw new NotFoundException('Content block not found');
    await this.blockRepo.remove(block);
  }

  async reorderBlocks(lessonId: string, dto: ReorderBlocksDto): Promise<ContentBlock[]> {
    const blocks = await this.blockRepo.find({ where: { lessonId } });
    const blockMap = new Map(blocks.map((b) => [b.id, b]));

    for (let i = 0; i < dto.blockIds.length; i++) {
      const block = blockMap.get(dto.blockIds[i]);
      if (block) {
        block.sortOrder = i;
      }
    }

    return this.blockRepo.save(blocks);
  }

  // --- Reorder Modules ---

  async reorderModules(courseId: string, moduleIds: string[]): Promise<CourseModule[]> {
    const modules = await this.moduleRepo.find({ where: { courseId } });
    const moduleMap = new Map(modules.map((m) => [m.id, m]));

    for (let i = 0; i < moduleIds.length; i++) {
      const mod = moduleMap.get(moduleIds[i]);
      if (mod) {
        mod.sortOrder = i;
      }
    }

    return this.moduleRepo.save(modules);
  }

  // --- Reorder Lessons ---

  async reorderLessons(moduleId: string, lessonIds: string[]): Promise<Lesson[]> {
    const lessons = await this.lessonRepo.find({ where: { moduleId } });
    const lessonMap = new Map(lessons.map((l) => [l.id, l]));

    for (let i = 0; i < lessonIds.length; i++) {
      const lesson = lessonMap.get(lessonIds[i]);
      if (lesson) {
        lesson.sortOrder = i;
      }
    }

    return this.lessonRepo.save(lessons);
  }

  // --- Full Course with all content ---

  async findCourseWithFullContent(id: string): Promise<Course> {
    const course = await this.courseRepo.findOne({
      where: { id },
      relations: [
        'author',
        'modules',
        'modules.lessons',
        'modules.lessons.contentBlocks',
      ],
    });
    if (!course) throw new NotFoundException('Course not found');

    // Sort modules, lessons, and blocks by sortOrder
    if (course.modules) {
      course.modules.sort((a, b) => a.sortOrder - b.sortOrder);
      course.modules.forEach((mod) => {
        if (mod.lessons) {
          mod.lessons.sort((a, b) => a.sortOrder - b.sortOrder);
          mod.lessons.forEach((lesson) => {
            if (lesson.contentBlocks) {
              lesson.contentBlocks.sort((a, b) => a.sortOrder - b.sortOrder);
            }
          });
        }
      });
    }

    return course;
  }
}
