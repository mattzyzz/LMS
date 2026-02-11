import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { KudosService } from './kudos.service';
import { CreateKudosDto, CreateReactionDto } from './dto/kudos.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Kudos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('kudos')
export class KudosController {
  constructor(private readonly kudosService: KudosService) {}

  @Post()
  @ApiOperation({ summary: 'Send kudos to a colleague' })
  create(@CurrentUser('id') userId: string, @Body() dto: CreateKudosDto) {
    return this.kudosService.create(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get kudos feed' })
  findAll(@Query() pagination: PaginationDto) {
    return this.kudosService.findAll(pagination);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get kudos for a user' })
  findByUser(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.kudosService.findByUser(userId);
  }

  @Get('received/:userId')
  @ApiOperation({ summary: 'Get kudos received by a user' })
  findReceived(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.kudosService.findReceivedByUser(userId);
  }

  @Post(':kudosId/reactions')
  @ApiOperation({ summary: 'Toggle reaction on kudos' })
  toggleReaction(
    @CurrentUser('id') userId: string,
    @Param('kudosId', ParseUUIDPipe) kudosId: string,
    @Body() dto: CreateReactionDto,
  ) {
    return this.kudosService.toggleReaction(userId, kudosId, dto);
  }

  @Get('leaderboard')
  @ApiOperation({ summary: 'Get leaderboard' })
  leaderboard(@Query('period') period?: string) {
    return this.kudosService.getLeaderboard(period);
  }
}
