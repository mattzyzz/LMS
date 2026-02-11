import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  AnalyticsService,
  AnalyticsOverview,
  CourseStats,
  UserLearningStats,
  DepartmentStats,
} from './analytics.service';

@ApiTags('analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Get overall analytics overview' })
  async getOverview(): Promise<AnalyticsOverview> {
    return this.analyticsService.getOverview();
  }

  @Get('courses')
  @ApiOperation({ summary: 'Get course-level statistics' })
  async getCourseStats(): Promise<CourseStats[]> {
    return this.analyticsService.getCourseStats();
  }

  @Get('users/:userId')
  @ApiOperation({ summary: 'Get user learning statistics' })
  async getUserStats(@Param('userId') userId: string): Promise<UserLearningStats> {
    return this.analyticsService.getUserStats(userId);
  }

  @Get('departments/:departmentId')
  @ApiOperation({ summary: 'Get department learning statistics' })
  async getDepartmentStats(@Param('departmentId') departmentId: string): Promise<DepartmentStats> {
    return this.analyticsService.getDepartmentStats(departmentId);
  }
}
