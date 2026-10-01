import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { HealthModule } from './health/health.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [PrismaModule, HealthModule, AuthModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
