import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { HealthModule } from './health/health.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { OwnerDashboardModule } from './owner-dashboard/owner-dashboard.module';

@Module({
  imports: [PrismaModule, HealthModule, AuthModule, OwnerDashboardModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
