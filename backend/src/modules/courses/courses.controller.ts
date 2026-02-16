import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CoursesService } from './courses.service';
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
  ReorderModulesDto,
  ReorderLessonsDto,
  CreateLessonAttachmentDto,
} from './dto/course.dto';
import { ReorderTopicItemsDto } from './dto/topic-items.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Courses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  // --- Courses ---

  @Post()
  @UseGuards(RolesGuard)
  @Roles('hrd')
  @ApiOperation({ summary: 'Create a course (HRD only)' })
  create(@CurrentUser('id') userId: string, @Body() dto: CreateCourseDto) {
    return this.coursesService.createCourse(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get published courses (catalog)' })
  findAll(@Query() pagination: PaginationDto) {
    return this.coursesService.findAllCourses(pagination);
  }

  @Get('admin')
  @UseGuards(RolesGuard)
  @Roles('hrd')
  @ApiOperation({ summary: 'Get all courses (HRD only)' })
  findAllAdmin(@Query() pagination: PaginationDto) {
    return this.coursesService.findAllCoursesAdmin(pagination);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get course by ID with modules and lessons' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.coursesService.findCourseById(id);
  }

  @Get(':id/full')
  @UseGuards(RolesGuard)
  @Roles('hrd')
  @ApiOperation({ summary: 'Get course with full content (HRD only)' })
  findOneFull(@Param('id', ParseUUIDPipe) id: string) {
    return this.coursesService.findCourseWithFullContent(id);
  }

  @Get(':id/builder')
  @UseGuards(RolesGuard)
  @Roles('hrd')
  @ApiOperation({ summary: 'Get course for builder (topics with merged items)' })
  findForBuilder(@Param('id', ParseUUIDPipe) id: string) {
    return this.coursesService.findCourseForBuilder(id);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('hrd')
  @ApiOperation({ summary: 'Update course (HRD only)' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateCourseDto) {
    return this.coursesService.updateCourse(id, dto);
  }

  @Patch(':id/publish')
  @UseGuards(RolesGuard)
  @Roles('hrd')
  @ApiOperation({ summary: 'Publish course (HRD only)' })
  publish(@Param('id', ParseUUIDPipe) id: string) {
    return this.coursesService.publishCourse(id);
  }

  @Patch(':id/archive')
  @UseGuards(RolesGuard)
  @Roles('hrd')
  @ApiOperation({ summary: 'Archive course (HRD only)' })
  archive(@Param('id', ParseUUIDPipe) id: string) {
    return this.coursesService.archiveCourse(id);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('hrd')
  @ApiOperation({ summary: 'Soft delete course (HRD only)' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.coursesService.removeCourse(id);
  }

  @Patch(':id/modules/reorder')
  @UseGuards(RolesGuard)
  @Roles('hrd')
  @ApiOperation({ summary: 'Reorder modules in a course (HRD only)' })
  reorderModules(
    @Param('id', ParseUUIDPipe) courseId: string,
    @Body() dto: ReorderModulesDto,
  ) {
    return this.coursesService.reorderModules(courseId, dto.moduleIds);
  }

  // --- Modules ---

  @Post('modules')
  @UseGuards(RolesGuard)
  @Roles('hrd')
  @ApiOperation({ summary: 'Create course module (HRD only)' })
  createModule(@Body() dto: CreateModuleDto) {
    return this.coursesService.createModule(dto);
  }

  @Put('modules/:id')
  @UseGuards(RolesGuard)
  @Roles('hrd')
  @ApiOperation({ summary: 'Update course module (HRD only)' })
  updateModule(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateModuleDto) {
    return this.coursesService.updateModule(id, dto);
  }

  @Delete('modules/:id')
  @UseGuards(RolesGuard)
  @Roles('hrd')
  @ApiOperation({ summary: 'Delete course module (HRD only)' })
  removeModule(@Param('id', ParseUUIDPipe) id: string) {
    return this.coursesService.removeModule(id);
  }

  @Patch('modules/:id/lessons/reorder')
  @UseGuards(RolesGuard)
  @Roles('hrd')
  @ApiOperation({ summary: 'Reorder lessons in a module (HRD only)' })
  reorderLessons(
    @Param('id', ParseUUIDPipe) moduleId: string,
    @Body() dto: ReorderLessonsDto,
  ) {
    return this.coursesService.reorderLessons(moduleId, dto.lessonIds);
  }

  @Patch('modules/:topicId/items/reorder')
  @UseGuards(RolesGuard)
  @Roles('hrd')
  @ApiOperation({ summary: 'Reorder items (lessons/quizzes/assignments) in a topic' })
  reorderTopicItems(
    @Param('topicId', ParseUUIDPipe) topicId: string,
    @Body() dto: ReorderTopicItemsDto,
  ) {
    return this.coursesService.reorderTopicItems(topicId, dto);
  }

  // --- Lessons ---

  @Post('lessons')
  @UseGuards(RolesGuard)
  @Roles('hrd')
  @ApiOperation({ summary: 'Create lesson (HRD only)' })
  createLesson(@Body() dto: CreateLessonDto) {
    return this.coursesService.createLesson(dto);
  }

  @Get('lessons/:id')
  @ApiOperation({ summary: 'Get lesson with content blocks' })
  findLesson(@Param('id', ParseUUIDPipe) id: string) {
    return this.coursesService.findLessonById(id);
  }

  @Put('lessons/:id')
  @UseGuards(RolesGuard)
  @Roles('hrd')
  @ApiOperation({ summary: 'Update lesson (HRD only)' })
  updateLesson(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateLessonDto) {
    return this.coursesService.updateLesson(id, dto);
  }

  @Delete('lessons/:id')
  @UseGuards(RolesGuard)
  @Roles('hrd')
  @ApiOperation({ summary: 'Delete lesson (HRD only)' })
  removeLesson(@Param('id', ParseUUIDPipe) id: string) {
    return this.coursesService.removeLesson(id);
  }

  // --- Lesson Attachments ---

  @Post('lessons/:lessonId/attachments')
  @UseGuards(RolesGuard)
  @Roles('hrd')
  @ApiOperation({ summary: 'Add attachment to lesson' })
  addLessonAttachment(
    @Param('lessonId', ParseUUIDPipe) lessonId: string,
    @Body() dto: CreateLessonAttachmentDto,
  ) {
    return this.coursesService.addLessonAttachment(lessonId, dto);
  }

  @Get('lessons/:lessonId/attachments')
  @ApiOperation({ summary: 'Get lesson attachments' })
  getLessonAttachments(@Param('lessonId', ParseUUIDPipe) lessonId: string) {
    return this.coursesService.getLessonAttachments(lessonId);
  }

  @Delete('attachments/:id')
  @UseGuards(RolesGuard)
  @Roles('hrd')
  @ApiOperation({ summary: 'Remove lesson attachment' })
  removeLessonAttachment(@Param('id', ParseUUIDPipe) id: string) {
    return this.coursesService.removeLessonAttachment(id);
  }

  // --- Content Blocks ---

  @Post('blocks')
  @UseGuards(RolesGuard)
  @Roles('hrd')
  @ApiOperation({ summary: 'Create content block (HRD only)' })
  createBlock(@Body() dto: CreateContentBlockDto) {
    return this.coursesService.createBlock(dto);
  }

  @Put('blocks/:id')
  @UseGuards(RolesGuard)
  @Roles('hrd')
  @ApiOperation({ summary: 'Update content block (HRD only)' })
  updateBlock(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateContentBlockDto) {
    return this.coursesService.updateBlock(id, dto);
  }

  @Delete('blocks/:id')
  @UseGuards(RolesGuard)
  @Roles('hrd')
  @ApiOperation({ summary: 'Delete content block (HRD only)' })
  removeBlock(@Param('id', ParseUUIDPipe) id: string) {
    return this.coursesService.removeBlock(id);
  }

  @Patch('lessons/:lessonId/blocks/reorder')
  @UseGuards(RolesGuard)
  @Roles('hrd')
  @ApiOperation({ summary: 'Reorder content blocks in a lesson (HRD only)' })
  reorderBlocks(
    @Param('lessonId', ParseUUIDPipe) lessonId: string,
    @Body() dto: ReorderBlocksDto,
  ) {
    return this.coursesService.reorderBlocks(lessonId, dto);
  }
}
