import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { QuizzesService } from './quizzes.service';
import {
  CreateQuizDto,
  UpdateQuizDto,
  CreateQuestionDto,
  SubmitAttemptDto,
} from './dto/quiz.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Quizzes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('quizzes')
export class QuizzesController {
  constructor(private readonly quizzesService: QuizzesService) {}

  // --- Quiz CRUD ---

  @Post()
  @ApiOperation({ summary: 'Create quiz' })
  create(@Body() dto: CreateQuizDto) {
    return this.quizzesService.createQuiz(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get quiz with questions' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.quizzesService.findQuizById(id);
  }

  @Get('lesson/:lessonId')
  @ApiOperation({ summary: 'Get quiz for a lesson' })
  findByLesson(@Param('lessonId', ParseUUIDPipe) lessonId: string) {
    return this.quizzesService.findQuizByLesson(lessonId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update quiz' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateQuizDto) {
    return this.quizzesService.updateQuiz(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete quiz' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.quizzesService.removeQuiz(id);
  }

  // --- Questions ---

  @Post(':quizId/questions')
  @ApiOperation({ summary: 'Add question to quiz' })
  addQuestion(
    @Param('quizId', ParseUUIDPipe) quizId: string,
    @Body() dto: CreateQuestionDto,
  ) {
    return this.quizzesService.addQuestion(quizId, dto);
  }

  @Put('questions/:id')
  @ApiOperation({ summary: 'Update question' })
  updateQuestion(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Partial<CreateQuestionDto>,
  ) {
    return this.quizzesService.updateQuestion(id, dto);
  }

  @Delete('questions/:id')
  @ApiOperation({ summary: 'Delete question' })
  removeQuestion(@Param('id', ParseUUIDPipe) id: string) {
    return this.quizzesService.removeQuestion(id);
  }

  // --- Attempts ---

  @Post(':quizId/attempts')
  @ApiOperation({ summary: 'Start a quiz attempt' })
  startAttempt(
    @CurrentUser('id') userId: string,
    @Param('quizId', ParseUUIDPipe) quizId: string,
  ) {
    return this.quizzesService.startAttempt(userId, quizId);
  }

  @Post('attempts/:attemptId/submit')
  @ApiOperation({ summary: 'Submit quiz attempt with answers' })
  submitAttempt(
    @CurrentUser('id') userId: string,
    @Param('attemptId', ParseUUIDPipe) attemptId: string,
    @Body() dto: SubmitAttemptDto,
  ) {
    return this.quizzesService.submitAttempt(userId, attemptId, dto);
  }

  @Get('attempts/:attemptId/result')
  @ApiOperation({ summary: 'Get attempt result' })
  getResult(
    @CurrentUser('id') userId: string,
    @Param('attemptId', ParseUUIDPipe) attemptId: string,
  ) {
    return this.quizzesService.getAttemptResult(userId, attemptId);
  }

  @Get(':quizId/my-attempts')
  @ApiOperation({ summary: 'Get my attempts for a quiz' })
  getMyAttempts(
    @CurrentUser('id') userId: string,
    @Param('quizId', ParseUUIDPipe) quizId: string,
  ) {
    return this.quizzesService.getUserAttempts(userId, quizId);
  }
}
