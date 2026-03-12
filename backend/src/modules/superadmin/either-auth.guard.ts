import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

/**
 * Accepts EITHER a regular user JWT (with sub+email) or a superadmin JWT (with isSuperadmin).
 * Used on GET endpoints that need to be accessible both
 * from the portal (user token) and the superadmin panel.
 */
@Injectable()
export class EitherAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token required');
    }

    const token = authHeader.slice(7);
    try {
      const secret = this.configService.get<string>('JWT_SECRET', 'default-secret');
      const payload = this.jwtService.verify(token, { secret }) as any;

      // Accept superadmin tokens
      if (payload?.isSuperadmin) return true;

      // Accept regular user tokens (must have sub)
      if (payload?.sub) {
        (request as any).user = { id: payload.sub, email: payload.email, role: payload.role };
        return true;
      }

      throw new UnauthorizedException('Invalid token payload');
    } catch (err) {
      if (err instanceof UnauthorizedException) throw err;
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
