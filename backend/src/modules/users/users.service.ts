import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';
import { EmployeeProfile } from '../profiles/employee-profile.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto, PaginatedResponseDto } from '../../common/dto/pagination.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(EmployeeProfile)
    private readonly profileRepository: Repository<EmployeeProfile>,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    const existing = await this.userRepository.findOne({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already in use');

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = this.userRepository.create({
      email: dto.email,
      passwordHash,
      firstName: dto.firstName,
      lastName: dto.lastName,
      patronymic: dto.patronymic ?? null,
      avatar: dto.avatar ?? null,
      role: dto.role ?? 'employee',
      isActive: dto.isActive ?? true,
      departmentId: dto.departmentId ?? null,
      position: dto.position ?? null,
      employeeNumber: dto.employeeNumber ?? null,
      managerId: dto.managerId ?? null,
    });
    const saved = await this.userRepository.save(user);

    // Auto-create employee profile
    const profile = this.profileRepository.create({
      userId: saved.id,
      phone: dto.phone ?? null,
    });
    await this.profileRepository.save(profile);

    return this.findById(saved.id);
  }

  async findAll(pagination: PaginationDto): Promise<PaginatedResponseDto<User>> {
    const [data, total] = await this.userRepository.findAndCount({
      relations: ['department'],
      order: { [pagination.sort]: pagination.order },
      skip: pagination.skip,
      take: pagination.limit,
    });
    return new PaginatedResponseDto(data, total, pagination);
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['department'],
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    await this.findById(id);

    // Extract phone before updating user columns
    const { phone, ...userFields } = dto;

    // Use update() instead of save() to avoid TypeORM relation cache conflicts
    // (save() with a loaded 'department' relation can overwrite departmentId back to old value)
    if (Object.keys(userFields).length > 0) {
      await this.userRepository.update(id, userFields as any);
    }

    // Update profile phone if provided
    if (phone !== undefined) {
      let profile = await this.profileRepository.findOne({ where: { userId: id } });
      if (profile) {
        profile.phone = phone;
        await this.profileRepository.save(profile);
      } else {
        await this.profileRepository.save(
          this.profileRepository.create({ userId: id, phone }),
        );
      }
    }

    return this.findById(id);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findById(id);
    await this.userRepository.softRemove(user);
  }

  async setRefreshToken(userId: string, refreshToken: string | null): Promise<void> {
    let hashed: string | null = null;
    if (refreshToken) hashed = await bcrypt.hash(refreshToken, 12);
    await this.userRepository.update(userId, { refreshToken: hashed });
  }

  async validateRefreshToken(userId: string, refreshToken: string): Promise<boolean> {
    const user = await this.findById(userId);
    if (!user.refreshToken) return false;
    return bcrypt.compare(refreshToken, user.refreshToken);
  }
}
