import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course, CourseModule as CourseModuleEntity, Lesson, ContentBlock, Asset } from './course.entity';
import { LessonAttachment } from './entities/lesson-attachment.entity';
import { Quiz } from '../quizzes/quiz.entity';
import { HomeworkAssignment } from '../homework/homework.entity';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Course,
      CourseModuleEntity,
      Lesson,
      ContentBlock,
      Asset,
      LessonAttachment,
      Quiz,
      HomeworkAssignment,
    ]),
  ],
  controllers: [CoursesController],
  providers: [CoursesService],
  exports: [CoursesService],
})
export class CoursesModule {}
