import {
  Controller,
  Get,
  Post as HttpPost,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NewsService } from './news.service';
import { CreatePostDto, UpdatePostDto, CreateCommentDto } from './dto/create-post.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('News')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @HttpPost()
  @ApiOperation({ summary: 'Create a post' })
  create(@CurrentUser('id') userId: string, @Body() dto: CreatePostDto) {
    return this.newsService.createPost(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all posts' })
  findAll(@Query() pagination: PaginationDto) {
    return this.newsService.findAllPosts(pagination);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get post by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.newsService.findPostById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update post' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdatePostDto) {
    return this.newsService.updatePost(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete post' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.newsService.removePost(id);
  }

  @HttpPost('comments')
  @ApiOperation({ summary: 'Create comment' })
  createComment(@CurrentUser('id') userId: string, @Body() dto: CreateCommentDto) {
    return this.newsService.createComment(userId, dto);
  }

  @Get('comments/:type/:id')
  @ApiOperation({ summary: 'Get comments for entity' })
  getComments(@Param('type') type: string, @Param('id') id: string) {
    return this.newsService.getComments(type, id);
  }

  @HttpPost('likes/:type/:id')
  @ApiOperation({ summary: 'Toggle like' })
  toggleLike(
    @CurrentUser('id') userId: string,
    @Param('type') type: string,
    @Param('id') id: string,
  ) {
    return this.newsService.toggleLike(userId, type, id);
  }
}
