import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsString,
  IsInt,
  IsEnum,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum TopicItemType {
  LESSON = 'lesson',
  QUIZ = 'quiz',
  ASSIGNMENT = 'assignment',
}

export class TopicItemDto {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty({ enum: TopicItemType })
  @IsEnum(TopicItemType)
  type: TopicItemType;

  @ApiProperty()
  @IsInt()
  sortOrder: number;
}

export class ReorderTopicItemsDto {
  @ApiProperty({ type: [TopicItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TopicItemDto)
  items: TopicItemDto[];
}
