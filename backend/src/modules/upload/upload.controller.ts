import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  ParseUUIDPipe,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UploadService } from './upload.service';

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

@ApiTags('Upload')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('file')
  @Roles('hrd')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload a single file (HRD only)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async uploadFile(
    @UploadedFile() file: MulterFile,
    @CurrentUser('id') userId: string,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    return this.uploadService.saveAsset(file, userId);
  }

  @Post('files')
  @Roles('hrd')
  @UseInterceptors(FilesInterceptor('files', 10))
  @ApiOperation({ summary: 'Upload multiple files (HRD only, max 10)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  async uploadFiles(
    @UploadedFiles() files: MulterFile[],
    @CurrentUser('id') userId: string,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }
    const assets = await Promise.all(
      files.map((file) => this.uploadService.saveAsset(file, userId)),
    );
    return assets;
  }

  @Get('my')
  @Roles('hrd')
  @ApiOperation({ summary: 'Get my uploaded assets' })
  async getMyAssets(@CurrentUser('id') userId: string) {
    return this.uploadService.findByUploader(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get asset by ID' })
  async getAsset(@Param('id', ParseUUIDPipe) id: string) {
    return this.uploadService.findById(id);
  }

  @Delete(':id')
  @Roles('hrd')
  @ApiOperation({ summary: 'Delete asset (HRD only)' })
  async deleteAsset(@Param('id', ParseUUIDPipe) id: string) {
    await this.uploadService.remove(id);
    return { message: 'Asset deleted' };
  }
}
