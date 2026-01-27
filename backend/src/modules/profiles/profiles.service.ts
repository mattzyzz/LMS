import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmployeeProfile } from './employee-profile.entity';
import { Skill } from './skill.entity';
import { EmployeeSkill } from './employee-skill.entity';
import { Project } from './project.entity';
import { EmployeeProject } from './employee-project.entity';
import { CreateProfileDto, UpdateProfileDto } from './dto/create-profile.dto';
import { PaginationDto, PaginatedResponseDto } from '../../common/dto/pagination.dto';

@Injectable()
export class ProfilesService {
  constructor(
    @InjectRepository(EmployeeProfile)
    private readonly profileRepository: Repository<EmployeeProfile>,
    @InjectRepository(Skill)
    private readonly skillRepository: Repository<Skill>,
    @InjectRepository(EmployeeSkill)
    private readonly employeeSkillRepository: Repository<EmployeeSkill>,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @InjectRepository(EmployeeProject)
    private readonly employeeProjectRepository: Repository<EmployeeProject>,
  ) {}

  async createProfile(dto: CreateProfileDto): Promise<EmployeeProfile> {
    const profile = this.profileRepository.create(dto);
    return this.profileRepository.save(profile);
  }

  async findAllProfiles(pagination: PaginationDto): Promise<PaginatedResponseDto<EmployeeProfile>> {
    const [data, total] = await this.profileRepository.findAndCount({
      relations: ['user'],
      order: { [pagination.sort]: pagination.order },
      skip: pagination.skip,
      take: pagination.limit,
    });
    return new PaginatedResponseDto(data, total, pagination);
  }

  async findProfileByUserId(userId: string): Promise<EmployeeProfile> {
    const profile = await this.profileRepository.findOne({
      where: { userId },
      relations: ['user'],
    });
    if (!profile) throw new NotFoundException('Profile not found');
    return profile;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<EmployeeProfile> {
    const profile = await this.findProfileByUserId(userId);
    Object.assign(profile, dto);
    return this.profileRepository.save(profile);
  }

  async addSkill(userId: string, skillId: string, level?: string): Promise<EmployeeSkill> {
    const es = this.employeeSkillRepository.create({ userId, skillId, level: level as any });
    return this.employeeSkillRepository.save(es);
  }

  async getUserSkills(userId: string): Promise<EmployeeSkill[]> {
    return this.employeeSkillRepository.find({
      where: { userId },
      relations: ['skill'],
    });
  }

  async findAllSkills(): Promise<Skill[]> {
    return this.skillRepository.find();
  }

  async createSkill(name: string, category?: string): Promise<Skill> {
    const skill = this.skillRepository.create({ name, category });
    return this.skillRepository.save(skill);
  }

  async findAllProjects(): Promise<Project[]> {
    return this.projectRepository.find();
  }

  async assignProject(userId: string, projectId: string, role?: string): Promise<EmployeeProject> {
    const ep = this.employeeProjectRepository.create({ userId, projectId, role });
    return this.employeeProjectRepository.save(ep);
  }
}
