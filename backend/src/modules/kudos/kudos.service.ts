import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Kudos } from './kudos.entity';
import { Reaction } from './reaction.entity';
import { LeaderboardSnapshot } from './leaderboard-snapshot.entity';
import { CreateKudosDto, CreateReactionDto } from './dto/kudos.dto';
import { PaginationDto, PaginatedResponseDto } from '../../common/dto/pagination.dto';

@Injectable()
export class KudosService {
  constructor(
    @InjectRepository(Kudos)
    private readonly kudosRepo: Repository<Kudos>,
    @InjectRepository(Reaction)
    private readonly reactionRepo: Repository<Reaction>,
    @InjectRepository(LeaderboardSnapshot)
    private readonly leaderboardRepo: Repository<LeaderboardSnapshot>,
  ) {}

  async create(fromUserId: string, dto: CreateKudosDto): Promise<Kudos> {
    if (fromUserId === dto.toUserId) {
      throw new BadRequestException('Cannot send kudos to yourself');
    }
    const kudos = this.kudosRepo.create({ ...dto, fromUserId });
    return this.kudosRepo.save(kudos);
  }

  async findAll(pagination: PaginationDto): Promise<PaginatedResponseDto<Kudos>> {
    const [data, total] = await this.kudosRepo.findAndCount({
      relations: ['fromUser', 'toUser'],
      order: { [pagination.sort]: pagination.order },
      skip: pagination.skip,
      take: pagination.limit,
    });
    return new PaginatedResponseDto(data, total, pagination);
  }

  async findByUser(userId: string): Promise<Kudos[]> {
    return this.kudosRepo.find({
      where: [{ toUserId: userId }, { fromUserId: userId }],
      relations: ['fromUser', 'toUser'],
      order: { createdAt: 'DESC' },
    });
  }

  async findReceivedByUser(userId: string): Promise<Kudos[]> {
    return this.kudosRepo.find({
      where: { toUserId: userId },
      relations: ['fromUser'],
      order: { createdAt: 'DESC' },
    });
  }

  async toggleReaction(userId: string, kudosId: string, dto: CreateReactionDto): Promise<{ added: boolean }> {
    const existing = await this.reactionRepo.findOne({
      where: { userId, kudosId },
    });
    if (existing) {
      await this.reactionRepo.remove(existing);
      return { added: false };
    }
    const reaction = this.reactionRepo.create({ userId, kudosId, emoji: dto.emoji });
    await this.reactionRepo.save(reaction);
    return { added: true };
  }

  async getLeaderboard(period?: string): Promise<LeaderboardSnapshot[]> {
    const where = period ? { period } : {};
    return this.leaderboardRepo.find({
      where,
      relations: ['user'],
      order: { rank: 'ASC' },
      take: 50,
    });
  }
}
