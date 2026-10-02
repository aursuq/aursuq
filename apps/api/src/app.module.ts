import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { HealthModule } from './health/health.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { OwnerDashboardModule } from './owner-dashboard/owner-dashboard.module';
import { SellersModule } from './sellers/sellers.module';

@Module({
  imports: [PrismaModule, HealthModule, AuthModule, OwnerDashboardModule, SellersModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
