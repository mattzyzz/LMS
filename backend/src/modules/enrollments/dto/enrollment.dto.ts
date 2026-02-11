import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsOptional, IsDateString, IsBoolean, IsInt, Min } from 'class-validator';

export class EnrollDto {
  @ApiProperty()
  @IsUUID()
  courseId: string;

  @ApiPropertyOptional({ description: 'User ID to enroll (for admin assignment)' })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  deadline?: string;
}

export class UpdateProgressDto {
  @ApiProperty()
  @IsUUID()
  lessonId: string;

  @ApiProperty()
  @IsBoolean()
  isCompleted: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  timeSpentSeconds?: number;
}
