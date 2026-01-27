import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from './department.entity';
import { Position } from './position.entity';
import { CreateDepartmentDto, UpdateDepartmentDto } from './dto/create-department.dto';
import { PaginationDto, PaginatedResponseDto } from '../../common/dto/pagination.dto';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
    @InjectRepository(Position)
    private readonly positionRepository: Repository<Position>,
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
    return this.departmentRepository.find({
      where: { parentId: undefined },
      relations: ['children', 'children.children', 'head'],
    });
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
