import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsUUID, IsInt, Min, Max } from 'class-validator';

export class CreateKudosDto {
  @ApiProperty()
  @IsUUID()
  toUserId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  points?: number;
}

export class CreateReactionDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  emoji: string;
}
