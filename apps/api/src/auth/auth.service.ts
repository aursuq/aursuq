import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole, UserStatus } from '@prisma/client';
import { GoogleAuthService, GoogleTokenPayload } from './google-auth.service';
import { SessionService, SessionPayload } from './session.service';
import { Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly googleAuth: GoogleAuthService,
    private readonly session: SessionService,
  ) {}

  async loginWithGoogle(idToken: string, response: Response): Promise<{ user: SessionPayload }> {
    // Verify Google ID token
    const googlePayload = await this.googleAuth.verifyIdToken(idToken);

    // Find user by verified email
    const user = await this.prisma.user.findUnique({
      where: { email: googlePayload.email },
    });

    if (!user) {
      throw new UnauthorizedException('Account not authorized');
    }

    // Check role and status
    if (user.role !== UserRole.OWNER) {
      throw new UnauthorizedException('Account not authorized');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Account not authorized');
    }

    // Update lastLoginAt
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Create session
    const sessionPayload: SessionPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const token = await this.session.createSession(sessionPayload);
    this.session.setSessionCookie(response, token);

    return { user: sessionPayload };
  }

  async getCurrentUser(sessionPayload: SessionPayload): Promise<{ user: SessionPayload } | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: sessionPayload.userId },
    });

    if (!user) {
      return null;
    }

    if (user.role !== UserRole.OWNER || user.status !== UserStatus.ACTIVE) {
      return null;
    }

    return {
      user: {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }

  async logout(response: Response): Promise<void> {
    this.session.clearSessionCookie(response);
  }
}