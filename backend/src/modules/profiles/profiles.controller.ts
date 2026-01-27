import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProfilesService } from './profiles.service';
import { CreateProfileDto, UpdateProfileDto } from './dto/create-profile.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Profiles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Post()
  @ApiOperation({ summary: 'Create employee profile' })
  create(@Body() dto: CreateProfileDto) {
    return this.profilesService.createProfile(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all profiles' })
  findAll(@Query() pagination: PaginationDto) {
    return this.profilesService.findAllProfiles(pagination);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get profile by user ID' })
  findByUser(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.profilesService.findProfileByUserId(userId);
  }

  @Put('user/:userId')
  @ApiOperation({ summary: 'Update profile' })
  update(@Param('userId', ParseUUIDPipe) userId: string, @Body() dto: UpdateProfileDto) {
    return this.profilesService.updateProfile(userId, dto);
  }

  @Get('skills')
  @ApiOperation({ summary: 'Get all skills' })
  findAllSkills() {
    return this.profilesService.findAllSkills();
  }

  @Post('skills')
  @ApiOperation({ summary: 'Create skill' })
  createSkill(@Body() body: { name: string; category?: string }) {
    return this.profilesService.createSkill(body.name, body.category);
  }

  @Get('user/:userId/skills')
  @ApiOperation({ summary: 'Get user skills' })
  getUserSkills(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.profilesService.getUserSkills(userId);
  }

  @Post('user/:userId/skills')
  @ApiOperation({ summary: 'Add skill to user' })
  addSkill(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() body: { skillId: string; level?: string },
  ) {
    return this.profilesService.addSkill(userId, body.skillId, body.level);
  }
}
