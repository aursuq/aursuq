import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { SellersService } from './sellers.service';
import { SellersController } from './sellers.controller';
import { StoreNumberAllocatorService } from './store-number-allocator.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [SellersController],
  providers: [SellersService, StoreNumberAllocatorService],
  exports: [SellersService, StoreNumberAllocatorService],
})
export class SellersModule {}