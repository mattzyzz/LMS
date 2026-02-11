import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Asset } from '../courses/course.entity';
import { unlink } from 'fs/promises';
import { join } from 'path';

interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer: Buffer;
}

@Injectable()
export class UploadService {
  constructor(
    @InjectRepository(Asset)
    private readonly assetRepo: Repository<Asset>,
  ) {}

  async saveAsset(
    file: MulterFile,
    uploadedById: string,
  ): Promise<Asset> {
    const baseUrl = process.env.API_BASE_URL || 'http://localhost:3001';
    const asset = this.assetRepo.create({
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      url: `${baseUrl}/uploads/${file.filename}`,
      storageKey: file.filename,
      uploadedById,
    });
    return this.assetRepo.save(asset);
  }

  async findById(id: string): Promise<Asset> {
    const asset = await this.assetRepo.findOne({ where: { id } });
    if (!asset) {
      throw new NotFoundException('Asset not found');
    }
    return asset;
  }

  async remove(id: string): Promise<void> {
    const asset = await this.findById(id);
    const filePath = join(process.cwd(), 'uploads', asset.storageKey);
    try {
      await unlink(filePath);
    } catch (err) {
      // File may not exist, continue with DB deletion
    }
    await this.assetRepo.remove(asset);
  }

  async findByUploader(uploadedById: string): Promise<Asset[]> {
    return this.assetRepo.find({
      where: { uploadedById },
      order: { createdAt: 'DESC' },
    });
  }
}
