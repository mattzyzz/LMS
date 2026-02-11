import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course, CourseModule as CourseModuleEntity, Lesson, ContentBlock, Asset } from './course.entity';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Course, CourseModuleEntity, Lesson, ContentBlock, Asset]),
  ],
  controllers: [CoursesController],
  providers: [CoursesService],
  exports: [CoursesService],
})
export class CoursesModule {}
