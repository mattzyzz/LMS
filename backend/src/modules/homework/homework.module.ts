import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HomeworkAssignment, Submission, Review } from './homework.entity';
import { AssignmentAttachment } from './entities/assignment-attachment.entity';
import { HomeworkService } from './homework.service';
import { HomeworkController } from './homework.controller';
import { Enrollment } from '../enrollments/enrollment.entity';
import { Lesson } from '../courses/course.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      HomeworkAssignment,
      Submission,
      Review,
      AssignmentAttachment,
      Enrollment,
      Lesson,
    ]),
  ],
  controllers: [HomeworkController],
  providers: [HomeworkService],
  exports: [HomeworkService],
})
export class HomeworkModule {}
