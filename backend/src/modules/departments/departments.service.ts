import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Department } from './department.entity';
import { Position } from './position.entity';
import { User } from '../users/user.entity';
import { EmployeeProfile } from '../profiles/employee-profile.entity';
import { CreateDepartmentDto, UpdateDepartmentDto } from './dto/create-department.dto';
import { PaginationDto, PaginatedResponseDto } from '../../common/dto/pagination.dto';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
    @InjectRepository(Position)
    private readonly positionRepository: Repository<Position>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(EmployeeProfile)
    private readonly profileRepository: Repository<EmployeeProfile>,
  ) {}

  async create(dto: CreateDepartmentDto): Promise<Department> {
    const department = this.departmentRepository.create(dto);
    return this.departmentRepository.save(department);
  }

  async findAll(pagination: PaginationDto): Promise<PaginatedResponseDto<Department>> {
    const [data, total] = await this.departmentRepository.findAndCount({
      relations: ['parent', 'head', 'children'],
      order: { [pagination.sort]: pagination.order },
      skip: pagination.skip,
      take: pagination.limit,
    });
    return new PaginatedResponseDto(data, total, pagination);
  }

  async findTree(): Promise<Department[]> {
    // 1) All departments with head user
    const depts = await this.departmentRepository.find({
      relations: ['head'],
      order: { name: 'ASC' },
    });

    // 2) All active users (with departmentId)
    const users = await this.userRepository.find({
      where: { isActive: true },
      select: ['id', 'firstName', 'lastName', 'email', 'avatar', 'role', 'departmentId'],
    });

    // 3) All profiles
    const profiles = await this.profileRepository.find({
      select: ['userId', 'phone', 'availabilityStatus'],
    });

    // Build lookup maps
    const profileByUserId = new Map(profiles.map((p) => [p.userId, p]));

    // Attach profile to each user
    const enrichedUsers = users.map((u) => ({
      ...u,
      profile: profileByUserId.get(u.id) ?? null,
    }));

    const usersByDeptId = new Map<string, typeof enrichedUsers>();
    for (const u of enrichedUsers) {
      if (!u.departmentId) continue;
      const arr = usersByDeptId.get(u.departmentId) ?? [];
      arr.push(u);
      usersByDeptId.set(u.departmentId, arr);
    }

    // Build dept map
    const deptMap = new Map(depts.map((d) => [d.id, { ...d, children: [] as any[], employees: [] as any[] }]));

    // Assign employees to depts
    for (const [deptId, emps] of usersByDeptId) {
      const dept = deptMap.get(deptId);
      if (dept) dept.employees = emps;
    }

    // Build tree
    const roots: any[] = [];
    for (const dept of deptMap.values()) {
      if (dept.parentId) {
        const parent = deptMap.get(dept.parentId);
        if (parent) {
          parent.children.push(dept);
        } else {
          roots.push(dept);
        }
      } else {
        roots.push(dept);
      }
    }

    return roots;
  }

  async getStats(): Promise<{ totalDepartments: number; totalEmployees: number }> {
    const [totalDepartments, totalEmployees] = await Promise.all([
      this.departmentRepository.count(),
      this.userRepository.count({ where: { isActive: true } }),
    ]);
    return { totalDepartments, totalEmployees };
  }

  async findById(id: string): Promise<Department> {
    const dept = await this.departmentRepository.findOne({
      where: { id },
      relations: ['parent', 'head', 'children'],
    });
    if (!dept) throw new NotFoundException('Department not found');
    return dept;
  }

  async update(id: string, dto: UpdateDepartmentDto): Promise<Department> {
    const dept = await this.findById(id);
    Object.assign(dept, dto);
    return this.departmentRepository.save(dept);
  }

  async remove(id: string): Promise<void> {
    const dept = await this.findById(id);
    await this.departmentRepository.remove(dept);
  }

  async createPosition(title: string, departmentId?: string, description?: string): Promise<Position> {
    const position = this.positionRepository.create({ title, departmentId, description });
    return this.positionRepository.save(position);
  }

  async findAllPositions(): Promise<Position[]> {
    return this.positionRepository.find({ relations: ['department'] });
  }
}
