import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class SuperadminAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Superadmin token required');
    }

    const token = authHeader.slice(7);
    try {
      const secret = this.configService.get<string>('JWT_SECRET', 'default-secret');
      const payload = this.jwtService.verify(token, { secret }) as any;
      if (!payload?.isSuperadmin) {
        throw new UnauthorizedException('Not a superadmin token');
      }
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired superadmin token');
    }
  }
}
