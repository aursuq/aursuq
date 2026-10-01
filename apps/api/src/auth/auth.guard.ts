import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { SessionService } from './session.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly sessionService: SessionService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const cookieName = this.sessionService.getCookieName();
    const token = request.cookies?.[cookieName];

    if (!token) {
      throw new UnauthorizedException('Not authenticated');
    }

    const payload = await this.sessionService.verifySession(token);
    if (!payload) {
      throw new UnauthorizedException('Invalid session');
    }

    request.sessionPayload = payload;
    return true;
  }
}