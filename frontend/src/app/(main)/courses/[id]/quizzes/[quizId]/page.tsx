'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Card,
  Typography,
  Button,
  Space,
  Radio,
  Checkbox,
  Input,
  Progress,
  message,
  Result,
  Tag,
  Spin,
  Alert,
  Statistic,
} from 'antd';
import {
  LeftOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import api from '@/lib/api';
import type { Quiz, Question, QuizAttempt } from '@/types';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Countdown } = Statistic;

interface AnswerState {
  [questionId: string]: {
    selectedOptionIds?: string[];
    freeTextAnswer?: string;
  };
}

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const quizId = params.quizId as string;

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [answers, setAnswers] = useState<AnswerState>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [deadline, setDeadline] = useState<number | null>(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      setLoading(true);
      try {
        const { data } = await api.get<Quiz>(`/quizzes/${quizId}`);
        setQuiz(data);
      } catch {
        message.error('Не удалось загрузить тест');
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId]);

  const startAttempt = async () => {
    try {
      const { data } = await api.post<QuizAttempt>(`/quizzes/${quizId}/attempts`);
      setAttempt(data);

      if (quiz?.timeLimitMinutes) {
        const startTime = new Date(data.startedAt || data.createdAt).getTime();
        const endTime = startTime + quiz.timeLimitMinutes * 60 * 1000;
        setDeadline(endTime);
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Не удалось начать тест');
    }
  };

  const handleAnswerChange = (questionId: string, value: any, type: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        ...(type === 'free_text'
          ? { freeTextAnswer: value }
          : { selectedOptionIds: Array.isArray(value) ? value : [value] }),
      },
    }));
  };

  const handleSubmit = async () => {
    if (!attempt) return;

    setSubmitting(true);
    try {
      const formattedAnswers = Object.entries(answers).map(([questionId, answer]) => ({
        questionId,
        ...answer,
      }));

      const { data } = await api.post<QuizAttempt>(`/quizzes/attempts/${attempt.id}/submit`, {
        answers: formattedAnswers,
      });

      setAttempt(data);
      setSubmitted(true);
    } catch {
      message.error('Ошибка при отправке ответов');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTimeUp = () => {
    message.warning('Время вышло!');
    handleSubmit();
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!quiz) {
    return <div>Тест не найден</div>;
  }

  const questions = quiz.questions || [];
  const currentQuestion = questions[currentQuestionIndex];

  // Show results
  if (submitted && attempt) {
    const passed = attempt.passed;
    const scorePercent = attempt.maxScore
      ? Math.round(((attempt.score || 0) / attempt.maxScore) * 100)
      : 0;

    return (
      <div>
        <Link href={`/courses/${courseId}`}>
          <Button icon={<LeftOutlined />} style={{ marginBottom: 16 }}>
            К курсу
          </Button>
        </Link>

        <Card>
          <Result
            status={passed ? 'success' : 'error'}
            icon={passed ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
            title={passed ? 'Тест пройден!' : 'Тест не пройден'}
            subTitle={
              <Space direction="vertical" size={8}>
                <Text>
                  Ваш результат: {attempt.score} из {attempt.maxScore} ({scorePercent}%)
                </Text>
                <Text type="secondary">
                  Проходной балл: {quiz.passingScore}%
                </Text>
              </Space>
            }
            extra={[
              <Link key="course" href={`/courses/${courseId}`}>
                <Button type="primary">Вернуться к курсу</Button>
              </Link>,
              !passed && quiz.maxAttempts > 1 && (
                <Button key="retry" onClick={() => window.location.reload()}>
                  Попробовать снова
                </Button>
              ),
            ].filter(Boolean)}
          />

          {quiz.showResults && attempt.answers && (
            <div style={{ marginTop: 24 }}>
              <Title level={4}>Разбор ответов</Title>
              {questions.map((q, index) => {
                const answer = attempt.answers?.find((a) => a.questionId === q.id);
                return (
                  <Card key={q.id} size="small" style={{ marginBottom: 8 }}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Space>
                        <Text strong>Вопрос {index + 1}:</Text>
                        {answer?.isCorrect ? (
                          <Tag color="success">Верно</Tag>
                        ) : (
                          <Tag color="error">Неверно</Tag>
                        )}
                        <Text type="secondary">
                          {answer?.pointsEarned || 0} из {q.points} баллов
                        </Text>
                      </Space>
                      <Text>{q.text}</Text>
                      {q.explanation && (
                        <Alert message={q.explanation} type="info" showIcon />
                      )}
                    </Space>
                  </Card>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    );
  }

  // Show quiz intro
  if (!attempt) {
    return (
      <div>
        <Link href={`/courses/${courseId}`}>
          <Button icon={<LeftOutlined />} style={{ marginBottom: 16 }}>
            К курсу
          </Button>
        </Link>

        <Card>
          <Space direction="vertical" size={24} style={{ width: '100%' }}>
            <div>
              <Title level={2}>{quiz.title}</Title>
              {quiz.description && <Paragraph>{quiz.description}</Paragraph>}
            </div>

            <Space direction="vertical" size={8}>
              <Text>
                <strong>Количество вопросов:</strong> {questions.length}
              </Text>
              {quiz.timeLimitMinutes && (
                <Text>
                  <ClockCircleOutlined /> <strong>Ограничение по времени:</strong>{' '}
                  {quiz.timeLimitMinutes} мин
                </Text>
              )}
              <Text>
                <strong>Проходной балл:</strong> {quiz.passingScore}%
              </Text>
              <Text>
                <strong>Попыток:</strong> {quiz.maxAttempts}
              </Text>
            </Space>

            <Button type="primary" size="large" onClick={startAttempt}>
              Начать тест
            </Button>
          </Space>
        </Card>
      </div>
    );
  }

  // Show quiz questions
  return (
    <div>
      <Card size="small" style={{ marginBottom: 16 }}>
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Text>
            Вопрос {currentQuestionIndex + 1} из {questions.length}
          </Text>
          {deadline && (
            <Space>
              <ClockCircleOutlined />
              <Countdown
                value={deadline}
                format="mm:ss"
                onFinish={handleTimeUp}
              />
            </Space>
          )}
        </Space>
        <Progress
          percent={Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}
          showInfo={false}
          size="small"
        />
      </Card>

      <Card>
        <Space direction="vertical" size={24} style={{ width: '100%' }}>
          <div>
            <Tag>{currentQuestion.type === 'single_choice' ? 'Один ответ' : currentQuestion.type === 'multiple_choice' ? 'Несколько ответов' : currentQuestion.type === 'survey' ? 'Опрос' : 'Свободный ответ'}</Tag>
            <Title level={4} style={{ marginTop: 8 }}>
              {currentQuestion.text}
            </Title>
          </div>

          {currentQuestion.type === 'single_choice' && (
            <Radio.Group
              value={answers[currentQuestion.id]?.selectedOptionIds?.[0]}
              onChange={(e) =>
                handleAnswerChange(currentQuestion.id, e.target.value, 'choice')
              }
              style={{ width: '100%' }}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                {currentQuestion.options
                  ?.sort((a, b) => a.sortOrder - b.sortOrder)
                  .map((option) => (
                    <Radio
                      key={option.id}
                      value={option.id}
                      style={{
                        display: 'block',
                        padding: '12px 16px',
                        border: '1px solid #d9d9d9',
                        borderRadius: 8,
                        marginRight: 0,
                      }}
                    >
                      {option.text}
                    </Radio>
                  ))}
              </Space>
            </Radio.Group>
          )}

          {currentQuestion.type === 'multiple_choice' && (
            <Checkbox.Group
              value={answers[currentQuestion.id]?.selectedOptionIds || []}
              onChange={(checkedValues) =>
                handleAnswerChange(currentQuestion.id, checkedValues, 'choice')
              }
              style={{ width: '100%' }}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                {currentQuestion.options
                  ?.sort((a, b) => a.sortOrder - b.sortOrder)
                  .map((option) => (
                    <Checkbox
                      key={option.id}
                      value={option.id}
                      style={{
                        display: 'block',
                        padding: '12px 16px',
                        border: '1px solid #d9d9d9',
                        borderRadius: 8,
                        marginLeft: 0,
                      }}
                    >
                      {option.text}
                    </Checkbox>
                  ))}
              </Space>
            </Checkbox.Group>
          )}

          {(currentQuestion.type === 'free_text' || currentQuestion.type === 'survey') && (
            <TextArea
              rows={4}
              placeholder="Введите ваш ответ..."
              value={answers[currentQuestion.id]?.freeTextAnswer || ''}
              onChange={(e) =>
                handleAnswerChange(currentQuestion.id, e.target.value, 'free_text')
              }
            />
          )}

          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <Button
              disabled={currentQuestionIndex === 0}
              onClick={() => setCurrentQuestionIndex((i) => i - 1)}
            >
              Назад
            </Button>

            {currentQuestionIndex < questions.length - 1 ? (
              <Button
                type="primary"
                onClick={() => setCurrentQuestionIndex((i) => i + 1)}
              >
                Далее
              </Button>
            ) : (
              <Button
                type="primary"
                loading={submitting}
                onClick={handleSubmit}
              >
                Завершить тест
              </Button>
            )}
          </Space>
        </Space>
      </Card>
    </div>
  );
}
