import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsOptional, IsString, IsUUID, IsIn } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateUserDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  patronymic?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  // Allow null to remove from department
  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @Transform(({ value }) => value === null ? null : value)
  departmentId?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  position?: string;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsUUID('all')
  @Transform(({ value }) => value === null ? null : value)
  positionId?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  employeeNumber?: string;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @Transform(({ value }) => value === null ? null : value)
  managerId?: string | null;

  @ApiPropertyOptional({ enum: ['hrd', 'employee'] })
  @IsOptional()
  @IsIn(['hrd', 'employee'])
  role?: 'hrd' | 'employee';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;
}
