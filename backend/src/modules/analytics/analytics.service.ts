import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { Course } from '../courses/course.entity';
import { Enrollment } from '../enrollments/enrollment.entity';

export interface CourseStats {
  courseId: string;
  courseTitle: string;
  totalEnrollments: number;
  completedEnrollments: number;
  averageProgress: number;
}

export interface AnalyticsOverview {
  totalUsers: number;
  activeUsers: number;
  totalCourses: number;
  publishedCourses: number;
  totalEnrollments: number;
  completedEnrollments: number;
  averageCompletionRate: number;
  courseStats: CourseStats[];
}

export interface UserLearningStats {
  totalEnrollments: number;
  completedCourses: number;
  inProgressCourses: number;
  averageProgress: number;
  totalTimeSpent: number;
  quizzesCompleted: number;
  averageQuizScore: number;
}

export interface DepartmentStats {
  totalEmployees: number;
  enrolledEmployees: number;
  averageProgress: number;
  coursesCompleted: number;
}

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Course)
    private coursesRepository: Repository<Course>,
    @InjectRepository(Enrollment)
    private enrollmentsRepository: Repository<Enrollment>,
  ) {}

  async getOverview(): Promise<AnalyticsOverview> {
    // Get user counts
    const totalUsers = await this.usersRepository.count();
    const activeUsers = await this.usersRepository.count({
      where: { isActive: true },
    });

    // Get course counts
    const totalCourses = await this.coursesRepository.count();
    const publishedCourses = await this.coursesRepository.count({
      where: { status: 'published' as any },
    });

    // Get enrollment stats
    const totalEnrollments = await this.enrollmentsRepository.count();
    const completedEnrollments = await this.enrollmentsRepository.count({
      where: { status: 'completed' as any },
    });

    // Calculate completion rate
    const averageCompletionRate =
      totalEnrollments > 0
        ? Math.round((completedEnrollments / totalEnrollments) * 100)
        : 0;

    // Get course-level stats
    const courseStats = await this.getCourseStats();

    return {
      totalUsers,
      activeUsers,
      totalCourses,
      publishedCourses,
      totalEnrollments,
      completedEnrollments,
      averageCompletionRate,
      courseStats,
    };
  }

  async getCourseStats(): Promise<CourseStats[]> {
    const courses = await this.coursesRepository.find({
      where: { status: 'published' as any },
      select: ['id', 'title'],
    });

    const stats: CourseStats[] = [];

    for (const course of courses) {
      const enrollments = await this.enrollmentsRepository.find({
        where: { courseId: course.id },
      });

      const totalEnrollments = enrollments.length;
      const completedEnrollments = enrollments.filter(
        (e) => e.status === 'completed',
      ).length;
      const averageProgress =
        totalEnrollments > 0
          ? Math.round(
              enrollments.reduce((sum, e) => sum + e.progressPercent, 0) /
                totalEnrollments,
            )
          : 0;

      stats.push({
        courseId: course.id,
        courseTitle: course.title,
        totalEnrollments,
        completedEnrollments,
        averageProgress,
      });
    }

    return stats.sort((a, b) => b.totalEnrollments - a.totalEnrollments);
  }

  async getUserStats(userId: string): Promise<UserLearningStats> {
    const enrollments = await this.enrollmentsRepository.find({
      where: { userId },
    });

    const totalEnrollments = enrollments.length;
    const completedCourses = enrollments.filter(
      (e) => e.status === 'completed',
    ).length;
    const inProgressCourses = enrollments.filter(
      (e) => e.status === 'active',
    ).length;
    const averageProgress =
      totalEnrollments > 0
        ? Math.round(
            enrollments.reduce((sum, e) => sum + e.progressPercent, 0) /
              totalEnrollments,
          )
        : 0;

    return {
      totalEnrollments,
      completedCourses,
      inProgressCourses,
      averageProgress,
      totalTimeSpent: 0, // Would need to aggregate from LessonProgress
      quizzesCompleted: 0, // Would need to count from Attempt
      averageQuizScore: 0, // Would need to calculate from Attempt
    };
  }

  async getDepartmentStats(departmentId: string): Promise<DepartmentStats> {
    // This would require joining with departments
    // For now, return placeholder
    return {
      totalEmployees: 0,
      enrolledEmployees: 0,
      averageProgress: 0,
      coursesCompleted: 0,
    };
  }
}
