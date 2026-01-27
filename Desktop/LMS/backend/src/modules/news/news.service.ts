import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './post.entity';
import { Comment } from './comment.entity';
import { Like } from './like.entity';
import { CreatePostDto, UpdatePostDto, CreateCommentDto } from './dto/create-post.dto';
import { PaginationDto, PaginatedResponseDto } from '../../common/dto/pagination.dto';

@Injectable()
export class NewsService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(Like)
    private readonly likeRepository: Repository<Like>,
  ) {}

  async createPost(authorId: string, dto: CreatePostDto): Promise<Post> {
    const post = this.postRepository.create({
      ...dto,
      authorId,
      publishedAt: new Date(),
    });
    return this.postRepository.save(post);
  }

  async findAllPosts(pagination: PaginationDto): Promise<PaginatedResponseDto<Post>> {
    const [data, total] = await this.postRepository.findAndCount({
      relations: ['author'],
      order: { isPinned: 'DESC', [pagination.sort]: pagination.order },
      skip: pagination.skip,
      take: pagination.limit,
    });
    return new PaginatedResponseDto(data, total, pagination);
  }

  async findPostById(id: string): Promise<Post> {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['author'],
    });
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  async updatePost(id: string, dto: UpdatePostDto): Promise<Post> {
    const post = await this.findPostById(id);
    Object.assign(post, dto);
    return this.postRepository.save(post);
  }

  async removePost(id: string): Promise<void> {
    const post = await this.findPostById(id);
    await this.postRepository.softRemove(post);
  }

  async createComment(authorId: string, dto: CreateCommentDto): Promise<Comment> {
    const comment = this.commentRepository.create({ ...dto, authorId });
    return this.commentRepository.save(comment);
  }

  async getComments(commentableType: string, commentableId: string): Promise<Comment[]> {
    return this.commentRepository.find({
      where: { commentableType, commentableId },
      relations: ['author'],
      order: { createdAt: 'ASC' },
    });
  }

  async toggleLike(userId: string, likeableType: string, likeableId: string): Promise<{ liked: boolean }> {
    const existing = await this.likeRepository.findOne({
      where: { userId, likeableType, likeableId },
    });
    if (existing) {
      await this.likeRepository.remove(existing);
      return { liked: false };
    }
    const like = this.likeRepository.create({ userId, likeableType, likeableId });
    await this.likeRepository.save(like);
    return { liked: true };
  }

  async getLikeCount(likeableType: string, likeableId: string): Promise<number> {
    return this.likeRepository.count({ where: { likeableType, likeableId } });
  }
}
