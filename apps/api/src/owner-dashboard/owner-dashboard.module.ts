import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { OwnerDashboardController } from './owner-dashboard.controller';
import { OwnerDashboardService } from './owner-dashboard.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [OwnerDashboardController],
  providers: [OwnerDashboardService],
  exports: [OwnerDashboardService],
})
export class OwnerDashboardModule {}