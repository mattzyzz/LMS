import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

class SuperadminAuthDto {
  @IsString() @IsNotEmpty() secret: string;
}

@ApiTags('superadmin')
@Controller('superadmin')
export class SuperadminController {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  @Post('auth')
  @ApiOperation({ summary: 'Superadmin login (developer-only)' })
  auth(@Body() dto: SuperadminAuthDto) {
    const validSecret = this.configService.get<string>('SUPERADMIN_SECRET', 'alfadev-secret-2024');
    if (dto.secret !== validSecret) {
      throw new UnauthorizedException('Invalid superadmin secret');
    }
    const token = this.jwtService.sign(
      { isSuperadmin: true, sub: 'superadmin' },
      { expiresIn: '12h' },
    );
    return { accessToken: token };
  }
}
