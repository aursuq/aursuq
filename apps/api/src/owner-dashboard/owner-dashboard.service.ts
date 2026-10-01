import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole, UserStatus } from '@prisma/client';

export interface DashboardSummaryMetrics {
  totalSellers: number;
  activeSellers: number;
  totalCustomers: number;

  totalOrders: number | null;
  todayOrders: number | null;
  warehouseUnits: number | null;

  frozenSellerFunds: number | null;
  availableSellerFunds: number | null;

  aursuqProfit: number | null;
  todayAursuqProfit: number | null;
}

@Injectable()
export class OwnerDashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(): Promise<DashboardSummaryMetrics> {
    const [totalSellers, activeSellers, totalCustomers] = await Promise.all([
      this.prisma.user.count({
        where: { role: UserRole.SELLER },
      }),
      this.prisma.user.count({
        where: { role: UserRole.SELLER, status: UserStatus.ACTIVE },
      }),
      this.prisma.user.count({
        where: { role: UserRole.CUSTOMER },
      }),
    ]);

    return {
      totalSellers,
      activeSellers,
      totalCustomers,

      totalOrders: null,
      todayOrders: null,
      warehouseUnits: null,

      frozenSellerFunds: null,
      availableSellerFunds: null,

      aursuqProfit: null,
      todayAursuqProfit: null,
    };
  }
}