import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getDatabaseConfig } from './config/database.config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';
import { DepartmentsModule } from './modules/departments/departments.module';
import { ProfilesModule } from './modules/profiles/profiles.module';
import { NewsModule } from './modules/news/news.module';
import { CalendarModule } from './modules/calendar/calendar.module';
import { KudosModule } from './modules/kudos/kudos.module';
import { CoursesModule } from './modules/courses/courses.module';
import { EnrollmentsModule } from './modules/enrollments/enrollments.module';
import { QuizzesModule } from './modules/quizzes/quizzes.module';
import { HomeworkModule } from './modules/homework/homework.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AuditModule } from './modules/audit/audit.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { UploadModule } from './modules/upload/upload.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getDatabaseConfig,
    }),
    AuthModule,
    UsersModule,
    RolesModule,
    DepartmentsModule,
    ProfilesModule,
    NewsModule,
    CalendarModule,
    KudosModule,
    CoursesModule,
    EnrollmentsModule,
    QuizzesModule,
    HomeworkModule,
    NotificationsModule,
    AuditModule,
    AnalyticsModule,
    UploadModule,
    HealthModule,
  ],
})
export class AppModule {}
