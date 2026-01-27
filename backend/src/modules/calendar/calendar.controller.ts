import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CalendarService } from './calendar.service';
import { CreateEventDto, UpdateEventDto } from './dto/create-event.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Calendar')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('calendar')
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Post('events')
  @ApiOperation({ summary: 'Create event' })
  createEvent(@CurrentUser('id') userId: string, @Body() dto: CreateEventDto) {
    return this.calendarService.createEvent(userId, dto);
  }

  @Get('events')
  @ApiOperation({ summary: 'Get all events' })
  findAllEvents(@Query() pagination: PaginationDto) {
    return this.calendarService.findAllEvents(pagination);
  }

  @Get('events/range')
  @ApiOperation({ summary: 'Get events by date range' })
  findByRange(@Query('start') start: string, @Query('end') end: string) {
    return this.calendarService.findEventsByRange(new Date(start), new Date(end));
  }

  @Get('events/:id')
  @ApiOperation({ summary: 'Get event by ID' })
  findEvent(@Param('id', ParseUUIDPipe) id: string) {
    return this.calendarService.findEventById(id);
  }

  @Put('events/:id')
  @ApiOperation({ summary: 'Update event' })
  updateEvent(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateEventDto) {
    return this.calendarService.updateEvent(id, dto);
  }

  @Delete('events/:id')
  @ApiOperation({ summary: 'Delete event' })
  removeEvent(@Param('id', ParseUUIDPipe) id: string) {
    return this.calendarService.removeEvent(id);
  }

  @Get('reminders')
  @ApiOperation({ summary: 'Get my reminders' })
  getReminders(@CurrentUser('id') userId: string) {
    return this.calendarService.getUserReminders(userId);
  }

  @Post('reminders')
  @ApiOperation({ summary: 'Create reminder' })
  createReminder(
    @CurrentUser('id') userId: string,
    @Body() body: { eventId: string; remindAt: string },
  ) {
    return this.calendarService.createReminder(body.eventId, userId, new Date(body.remindAt));
  }

  @Get('goals')
  @ApiOperation({ summary: 'Get company goals' })
  findGoals() {
    return this.calendarService.findAllGoals();
  }

  @Post('goals')
  @ApiOperation({ summary: 'Create company goal' })
  createGoal(@Body() body: { title: string; description?: string; targetDate?: string; ownerId?: string }) {
    return this.calendarService.createGoal(body);
  }
}
