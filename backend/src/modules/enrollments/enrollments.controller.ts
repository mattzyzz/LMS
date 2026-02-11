import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EnrollmentsService } from './enrollments.service';
import { EnrollDto, UpdateProgressDto } from './dto/enrollment.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Enrollments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('enrollments')
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Post()
  @ApiOperation({ summary: 'Enroll in a course (or assign to another user for admin)' })
  enroll(@CurrentUser('id') currentUserId: string, @Body() dto: EnrollDto) {
    // If userId is provided in body, use it (admin assigning to employee)
    // Otherwise use the current user's ID (self-enrollment)
    const targetUserId = dto.userId || currentUserId;
    return this.enrollmentsService.enroll(targetUserId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all enrollments (admin)' })
  getAllEnrollments(@Query() pagination: PaginationDto) {
    return this.enrollmentsService.getAllEnrollments(pagination);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete enrollment (admin)' })
  deleteEnrollment(@Param('id', ParseUUIDPipe) id: string) {
    return this.enrollmentsService.deleteEnrollment(id);
  }

  @Get('my')
  @ApiOperation({ summary: 'Get my enrollments' })
  getMyEnrollments(@CurrentUser('id') userId: string, @Query() pagination: PaginationDto) {
    return this.enrollmentsService.getMyEnrollments(userId, pagination);
  }

  @Get('course/:courseId')
  @ApiOperation({ summary: 'Get enrollment for specific course' })
  getEnrollment(
    @CurrentUser('id') userId: string,
    @Param('courseId', ParseUUIDPipe) courseId: string,
  ) {
    return this.enrollmentsService.getEnrollment(userId, courseId);
  }

  @Patch('course/:courseId/progress')
  @ApiOperation({ summary: 'Update lesson progress' })
  updateProgress(
    @CurrentUser('id') userId: string,
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @Body() dto: UpdateProgressDto,
  ) {
    return this.enrollmentsService.updateProgress(userId, courseId, dto);
  }

  @Get('course/:courseId/progress')
  @ApiOperation({ summary: 'Get lesson progress for a course' })
  getLessonProgress(
    @CurrentUser('id') userId: string,
    @Param('courseId', ParseUUIDPipe) courseId: string,
  ) {
    return this.enrollmentsService.getLessonProgress(userId, courseId);
  }

  @Get('admin/course/:courseId')
  @ApiOperation({ summary: 'Get all enrollments for a course (admin)' })
  getEnrollmentsByCourse(
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @Query() pagination: PaginationDto,
  ) {
    return this.enrollmentsService.getEnrollmentsByCourse(courseId, pagination);
  }

  @Patch('course/:courseId/drop')
  @ApiOperation({ summary: 'Drop enrollment' })
  drop(
    @CurrentUser('id') userId: string,
    @Param('courseId', ParseUUIDPipe) courseId: string,
  ) {
    return this.enrollmentsService.dropEnrollment(userId, courseId);
  }
}
