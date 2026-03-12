import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SuperadminAuthGuard } from './superadmin-auth.guard';

/**
 * Accepts EITHER a regular user JWT or a superadmin JWT.
 * Used on GET endpoints that need to be accessible both
 * from the portal (user token) and the superadmin panel.
 */
@Injectable()
export class EitherAuthGuard implements CanActivate {
  constructor(
    private readonly jwtGuard: JwtAuthGuard,
    private readonly superadminGuard: SuperadminAuthGuard,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Try regular JWT first
    try {
      const result = await this.jwtGuard.canActivate(context);
      if (result) return true;
    } catch {}

    // Fall back to superadmin token
    try {
      return this.superadminGuard.canActivate(context);
    } catch {}

    return false;
  }
}
