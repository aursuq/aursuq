import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { GoogleAuthService } from './google-auth.service';
import { SessionService } from './session.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthGuard } from './auth.guard';
import { OwnerGuard } from './owner.guard';

@Module({
  imports: [PrismaModule, ConfigModule],
  controllers: [AuthController],
  providers: [AuthService, GoogleAuthService, SessionService, AuthGuard, OwnerGuard],
  exports: [AuthService, SessionService, AuthGuard, OwnerGuard],
})
export class AuthModule {}