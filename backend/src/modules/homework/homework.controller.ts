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
import { HomeworkService } from './homework.service';
import {
  CreateAssignmentDto,
  UpdateAssignmentDto,
  CreateSubmissionDto,
  UpdateSubmissionDto,
  CreateReviewDto,
} from './dto/homework.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Homework')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('homework')
export class HomeworkController {
  constructor(private readonly homeworkService: HomeworkService) {}

  // --- User-facing endpoints ---

  @Get('my-assignments')
  @ApiOperation({ summary: 'Get homework assignments for enrolled courses' })
  getMyAssignments(@CurrentUser('id') userId: string) {
    return this.homeworkService.getAssignmentsForUser(userId);
  }

  @Get('submissions/my')
  @ApiOperation({ summary: 'Get all my submissions' })
  getAllMySubmissions(@CurrentUser('id') userId: string) {
    return this.homeworkService.getAllUserSubmissions(userId);
  }

  @Get('submissions/all')
  @ApiOperation({ summary: 'Get all submissions (admin)' })
  getAllSubmissions() {
    return this.homeworkService.getAllSubmissions();
  }

  @Get('lesson/:lessonId')
  @ApiOperation({ summary: 'Get assignments for a lesson' })
  getByLesson(@Param('lessonId', ParseUUIDPipe) lessonId: string) {
    return this.homeworkService.findAssignmentsByLesson(lessonId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get assignment by ID' })
  getAssignment(@Param('id', ParseUUIDPipe) id: string) {
    return this.homeworkService.findAssignmentById(id);
  }

  @Get(':id/my-submission')
  @ApiOperation({ summary: 'Get my latest submission for an assignment' })
  getMySubmission(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) assignmentId: string,
  ) {
    return this.homeworkService.getLatestSubmission(userId, assignmentId);
  }

  @Post(':id/submissions')
  @ApiOperation({ summary: 'Submit homework for an assignment' })
  submitToAssignment(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) assignmentId: string,
    @Body() dto: CreateSubmissionDto,
  ) {
    return this.homeworkService.createSubmission(userId, { ...dto, assignmentId });
  }

  @Patch('submissions/:id')
  @ApiOperation({ summary: 'Update/resubmit submission' })
  updateSubmission(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSubmissionDto,
  ) {
    return this.homeworkService.updateSubmission(userId, id, dto);
  }

  @Post('submissions/:id/reviews')
  @ApiOperation({ summary: 'Create review for a submission' })
  createReview(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) submissionId: string,
    @Body() dto: CreateReviewDto,
  ) {
    return this.homeworkService.createReview(userId, submissionId, dto);
  }

  // --- Assignments ---

  @Post('assignments')
  @ApiOperation({ summary: 'Create homework assignment' })
  createAssignment(@Body() dto: CreateAssignmentDto) {
    return this.homeworkService.createAssignment(dto);
  }

  @Get('assignments/:id')
  @ApiOperation({ summary: 'Get assignment by ID' })
  findAssignment(@Param('id', ParseUUIDPipe) id: string) {
    return this.homeworkService.findAssignmentById(id);
  }

  @Get('assignments/lesson/:lessonId')
  @ApiOperation({ summary: 'Get assignments for a lesson' })
  findByLesson(@Param('lessonId', ParseUUIDPipe) lessonId: string) {
    return this.homeworkService.findAssignmentsByLesson(lessonId);
  }

  @Put('assignments/:id')
  @ApiOperation({ summary: 'Update assignment' })
  updateAssignment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAssignmentDto,
  ) {
    return this.homeworkService.updateAssignment(id, dto);
  }

  @Delete('assignments/:id')
  @ApiOperation({ summary: 'Delete assignment' })
  removeAssignment(@Param('id', ParseUUIDPipe) id: string) {
    return this.homeworkService.removeAssignment(id);
  }

  // --- Submissions ---

  @Post('submissions')
  @ApiOperation({ summary: 'Submit homework (requires assignmentId in body)' })
  submit(@CurrentUser('id') userId: string, @Body() dto: CreateSubmissionDto) {
    if (!dto.assignmentId) {
      throw new Error('assignmentId is required');
    }
    return this.homeworkService.createSubmission(userId, dto as CreateSubmissionDto & { assignmentId: string });
  }

  @Get('submissions/:id')
  @ApiOperation({ summary: 'Get submission details' })
  getSubmission(@Param('id', ParseUUIDPipe) id: string) {
    return this.homeworkService.getSubmission(id);
  }

  @Get('submissions/my/:assignmentId')
  @ApiOperation({ summary: 'Get my submissions for an assignment' })
  getMySubmissions(
    @CurrentUser('id') userId: string,
    @Param('assignmentId', ParseUUIDPipe) assignmentId: string,
  ) {
    return this.homeworkService.getMySubmissions(userId, assignmentId);
  }

  @Get('submissions/review/:assignmentId')
  @ApiOperation({ summary: 'Get submissions pending review' })
  getForReview(
    @Param('assignmentId', ParseUUIDPipe) assignmentId: string,
    @Query() pagination: PaginationDto,
  ) {
    return this.homeworkService.getSubmissionsForReview(assignmentId, pagination);
  }

  @Get('submissions/pending')
  @ApiOperation({ summary: 'Get all submissions pending review' })
  getPending(@Query() pagination: PaginationDto) {
    return this.homeworkService.getPendingReviews(pagination);
  }

  // --- Reviews ---

  @Post('submissions/:submissionId/review')
  @ApiOperation({ summary: 'Review a submission' })
  review(
    @CurrentUser('id') userId: string,
    @Param('submissionId', ParseUUIDPipe) submissionId: string,
    @Body() dto: CreateReviewDto,
  ) {
    return this.homeworkService.createReview(userId, submissionId, dto);
  }
}
