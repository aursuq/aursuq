import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import { Response } from 'express';

export interface SessionPayload {
  userId: string;
  email: string;
  role: string;
}

const COOKIE_NAME = 'aursuq_session';

@Injectable()
export class SessionService {
  private readonly secret: Uint8Array;
  private readonly cookieName: string;
  private readonly isProduction: boolean;

  constructor(private readonly configService: ConfigService) {
    const secret = this.configService.get<string>('AURSUQ_SESSION_SECRET');
    if (!secret) {
      throw new Error('AURSUQ_SESSION_SECRET environment variable is not configured');
    }
    this.secret = new TextEncoder().encode(secret);
    this.cookieName = COOKIE_NAME;
    this.isProduction = this.configService.get<string>('NODE_ENV') === 'production';
  }

  async createSession(payload: SessionPayload): Promise<string> {
    const jwt = await new SignJWT({ ...payload } as JWTPayload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(this.secret);
    return jwt;
  }

  async verifySession(token: string): Promise<SessionPayload | null> {
    try {
      const { payload } = await jwtVerify(token, this.secret);
      return {
        userId: payload.userId as string,
        email: payload.email as string,
        role: payload.role as string,
      };
    } catch {
      return null;
    }
  }

  setSessionCookie(response: Response, token: string): void {
    response.cookie(this.cookieName, token, {
      httpOnly: true,
      secure: this.isProduction,
      sameSite: this.isProduction ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });
  }

  clearSessionCookie(response: Response): void {
    response.cookie(this.cookieName, '', {
      httpOnly: true,
      secure: this.isProduction,
      sameSite: this.isProduction ? 'none' : 'lax',
      maxAge: 0,
      path: '/',
    });
  }

  getCookieName(): string {
    return this.cookieName;
  }
}