import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { UserRole } from '@prisma/client';

@Injectable()
export class OwnerGuard implements CanActivate {
  constructor(private readonly authGuard: AuthGuard) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // First run the standard auth guard
    await this.authGuard.canActivate(context);

    const request = context.switchToHttp().getRequest();
    const payload = request.sessionPayload;

    if (!payload) {
      throw new UnauthorizedException('Not authenticated');
    }

    // Check if the user has OWNER role
    if (payload.role !== UserRole.OWNER) {
      throw new UnauthorizedException('Not authorized - Owner role required');
    }

    return true;
  }
}