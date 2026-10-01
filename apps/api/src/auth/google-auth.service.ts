import { Injectable, UnauthorizedException } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { ConfigService } from '@nestjs/config';

export interface GoogleTokenPayload {
  email: string;
  email_verified: boolean;
  sub: string;
  name?: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
  locale?: string;
}

@Injectable()
export class GoogleAuthService {
  private readonly client: OAuth2Client;

  constructor(private readonly configService: ConfigService) {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    if (!clientId) {
      throw new Error('GOOGLE_CLIENT_ID environment variable is not configured');
    }
    this.client = new OAuth2Client(clientId);
  }

  async verifyIdToken(idToken: string): Promise<GoogleTokenPayload> {
    try {
      const ticket = await this.client.verifyIdToken({
        idToken,
        audience: this.configService.get<string>('GOOGLE_CLIENT_ID'),
      });

      const payload = ticket.getPayload();
      if (!payload) {
        throw new UnauthorizedException('Invalid Google token: no payload');
      }

      if (!payload.email) {
        throw new UnauthorizedException('Invalid Google token: email not provided');
      }

      if (payload.email_verified !== true) {
        throw new UnauthorizedException('Google email not verified');
      }

      return {
        email: payload.email.toLowerCase().trim(),
        email_verified: payload.email_verified,
        sub: payload.sub,
        name: payload.name,
        picture: payload.picture,
        given_name: payload.given_name,
        family_name: payload.family_name,
        locale: payload.locale,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid Google credential');
    }
  }
}