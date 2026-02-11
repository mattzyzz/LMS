import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Quiz, Question, AnswerOption, Attempt, AttemptAnswer } from './quiz.entity';
import { QuizzesService } from './quizzes.service';
import { QuizzesController } from './quizzes.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Quiz, Question, AnswerOption, Attempt, AttemptAnswer]),
  ],
  controllers: [QuizzesController],
  providers: [QuizzesService],
  exports: [QuizzesService],
})
export class QuizzesModule {}
