import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Quiz,
  Question,
  AnswerOption,
  Attempt,
  AttemptAnswer,
  AttemptStatus,
  QuestionType,
} from './quiz.entity';
import {
  CreateQuizDto,
  UpdateQuizDto,
  UpdateQuestionDto,
  CreateQuestionDto,
  CreateAnswerOptionDto,
  SubmitAttemptDto,
} from './dto/quiz.dto';

@Injectable()
export class QuizzesService {
  constructor(
    @InjectRepository(Quiz)
    private readonly quizRepo: Repository<Quiz>,
    @InjectRepository(Question)
    private readonly questionRepo: Repository<Question>,
    @InjectRepository(AnswerOption)
    private readonly optionRepo: Repository<AnswerOption>,
    @InjectRepository(Attempt)
    private readonly attemptRepo: Repository<Attempt>,
    @InjectRepository(AttemptAnswer)
    private readonly attemptAnswerRepo: Repository<AttemptAnswer>,
  ) {}

  // --- Quiz CRUD ---

  async createQuiz(dto: CreateQuizDto): Promise<Quiz> {
    const quiz = this.quizRepo.create(dto);
    return this.quizRepo.save(quiz);
  }

  async findQuizById(id: string): Promise<Quiz> {
    const quiz = await this.quizRepo.findOne({
      where: { id },
      relations: ['questions', 'questions.options'],
      order: { questions: { sortOrder: 'ASC', options: { sortOrder: 'ASC' } } },
    });
    if (!quiz) throw new NotFoundException('Quiz not found');
    return quiz;
  }

  async findQuizByLesson(lessonId: string): Promise<Quiz | null> {
    return this.quizRepo.findOne({
      where: { lessonId },
      relations: ['questions', 'questions.options'],
    });
  }

  async findQuizzesByTopic(topicId: string): Promise<Quiz[]> {
    return this.quizRepo.find({
      where: { topicId },
      relations: ['questions', 'questions.options'],
      order: { sortOrder: 'ASC' },
    });
  }

  async updateQuiz(id: string, dto: UpdateQuizDto): Promise<Quiz> {
    const quiz = await this.findQuizById(id);
    const { questions: questionDtos, ...quizFields } = dto;
    Object.assign(quiz, quizFields);
    await this.quizRepo.save(quiz);

    if (questionDtos !== undefined) {
      await this.syncQuestions(id, questionDtos);
    }

    return this.findQuizById(id);
  }

  private async syncQuestions(quizId: string, questionDtos: UpdateQuestionDto[]): Promise<void> {
    const existing = await this.questionRepo.find({
      where: { quizId },
      relations: ['options'],
    });
    const existingIds = existing.map((q) => q.id);
    const incomingIds = questionDtos.filter((q) => q.id).map((q) => q.id);

    // Delete removed questions
    const toDelete = existingIds.filter((id) => !incomingIds.includes(id));
    if (toDelete.length > 0) {
      await this.questionRepo.delete(toDelete);
    }

    // Upsert questions
    for (const qDto of questionDtos) {
      const { id: qId, options: optionDtos, ...qFields } = qDto;

      let question: Question;
      if (qId && existingIds.includes(qId)) {
        // Update existing
        question = existing.find((q) => q.id === qId)!;
        Object.assign(question, qFields);
        await this.questionRepo.save(question);
      } else {
        // Create new
        question = this.questionRepo.create({ ...qFields, quizId });
        question = await this.questionRepo.save(question);
      }

      // Sync options
      if (optionDtos !== undefined) {
        // Delete all existing options and recreate
        await this.optionRepo.delete({ questionId: question.id });
        if (optionDtos.length > 0) {
          const options = optionDtos.map((o, idx) =>
            this.optionRepo.create({
              ...o,
              sortOrder: o.sortOrder ?? idx,
              questionId: question.id,
            }),
          );
          await this.optionRepo.save(options);
        }
      }
    }
  }

  async removeQuiz(id: string): Promise<void> {
    const quiz = await this.findQuizById(id);
    await this.quizRepo.remove(quiz);
  }

  // --- Questions ---

  async addQuestion(quizId: string, dto: CreateQuestionDto): Promise<Question> {
    await this.findQuizById(quizId);
    const question = this.questionRepo.create({ ...dto, quizId });
    return this.questionRepo.save(question);
  }

  async updateQuestion(id: string, dto: Partial<CreateQuestionDto>): Promise<Question> {
    const question = await this.questionRepo.findOne({ where: { id } });
    if (!question) throw new NotFoundException('Question not found');
    Object.assign(question, dto);
    return this.questionRepo.save(question);
  }

  async removeQuestion(id: string): Promise<void> {
    const question = await this.questionRepo.findOne({ where: { id } });
    if (!question) throw new NotFoundException('Question not found');
    await this.questionRepo.remove(question);
  }

  // --- Attempts ---

  async startAttempt(userId: string, quizId: string): Promise<Attempt> {
    const quiz = await this.findQuizById(quizId);

    const existingCount = await this.attemptRepo.count({
      where: { userId, quizId, status: AttemptStatus.SUBMITTED },
    });
    if (existingCount >= quiz.maxAttempts) {
      throw new BadRequestException('Maximum attempts reached');
    }

    const inProgress = await this.attemptRepo.findOne({
      where: { userId, quizId, status: AttemptStatus.IN_PROGRESS },
    });
    if (inProgress) return inProgress;

    const attempt = this.attemptRepo.create({
      userId,
      quizId,
      startedAt: new Date(),
    });
    return this.attemptRepo.save(attempt);
  }

  async submitAttempt(userId: string, attemptId: string, dto: SubmitAttemptDto): Promise<Attempt> {
    const attempt = await this.attemptRepo.findOne({
      where: { id: attemptId, userId },
      relations: ['quiz', 'quiz.questions', 'quiz.questions.options'],
    });
    if (!attempt) throw new NotFoundException('Attempt not found');
    if (attempt.status !== AttemptStatus.IN_PROGRESS) {
      throw new BadRequestException('Attempt already submitted');
    }

    const quiz = attempt.quiz;
    let totalScore = 0;
    let maxScore = 0;

    const answers: AttemptAnswer[] = [];

    for (const answerDto of dto.answers) {
      const question = quiz.questions.find((q) => q.id === answerDto.questionId);
      if (!question) continue;

      maxScore += question.points;

      let isCorrect: boolean | null = null;
      let pointsEarned = 0;

      if (question.type === QuestionType.SINGLE_CHOICE || question.type === QuestionType.MULTIPLE_CHOICE) {
        const correctIds = question.options.filter((o) => o.isCorrect).map((o) => o.id);
        const selectedIds = answerDto.selectedOptionIds || [];

        isCorrect =
          correctIds.length === selectedIds.length &&
          correctIds.every((id) => selectedIds.includes(id));

        if (isCorrect) pointsEarned = question.points;
      } else if (question.type === QuestionType.SURVEY) {
        pointsEarned = question.points;
        isCorrect = null;
      }
      // FREE_TEXT needs manual grading

      totalScore += pointsEarned;

      answers.push(
        this.attemptAnswerRepo.create({
          attemptId: attempt.id,
          questionId: question.id,
          selectedOptionIds: answerDto.selectedOptionIds,
          freeTextAnswer: answerDto.freeTextAnswer,
          isCorrect,
          pointsEarned,
        }),
      );
    }

    await this.attemptAnswerRepo.save(answers);

    attempt.status = AttemptStatus.SUBMITTED;
    attempt.submittedAt = new Date();
    attempt.score = totalScore;
    attempt.maxScore = maxScore;
    attempt.passed = maxScore > 0 ? (totalScore / maxScore) * 100 >= quiz.passingScore : true;

    return this.attemptRepo.save(attempt);
  }

  async getAttemptResult(userId: string, attemptId: string): Promise<Attempt> {
    const attempt = await this.attemptRepo.findOne({
      where: { id: attemptId, userId },
      relations: ['answers', 'answers.question', 'quiz'],
    });
    if (!attempt) throw new NotFoundException('Attempt not found');
    return attempt;
  }

  async getUserAttempts(userId: string, quizId: string): Promise<Attempt[]> {
    return this.attemptRepo.find({
      where: { userId, quizId },
      order: { createdAt: 'DESC' },
    });
  }
}
