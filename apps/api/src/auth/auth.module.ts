import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { GoogleAuthService } from './google-auth.service';
import { SessionService } from './session.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule, ConfigModule],
  controllers: [AuthController],
  providers: [AuthService, GoogleAuthService, SessionService],
  exports: [AuthService, SessionService],
})
export class AuthModule {}