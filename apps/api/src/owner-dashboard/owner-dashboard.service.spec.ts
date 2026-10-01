import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { OwnerDashboardService } from './owner-dashboard.service';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole, UserStatus } from '@prisma/client';

describe('OwnerDashboardService', () => {
  let service: OwnerDashboardService;
  let prismaService: {
    user: {
      count: jest.Mock;
    };
  };

  beforeEach(async () => {
    prismaService = {
      user: {
        count: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OwnerDashboardService,
        { provide: PrismaService, useValue: prismaService },
      ],
    }).compile();

    service = module.get<OwnerDashboardService>(OwnerDashboardService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getSummary', () => {
    it('should return real counts for sellers, active sellers, and customers', async () => {
      prismaService.user.count
        .mockResolvedValueOnce(10) // totalSellers
        .mockResolvedValueOnce(7)  // activeSellers
        .mockResolvedValueOnce(42); // totalCustomers

      const result = await service.getSummary();

      expect(result.totalSellers).toBe(10);
      expect(result.activeSellers).toBe(7);
      expect(result.totalCustomers).toBe(42);
      expect(result.totalOrders).toBeNull();
      expect(result.todayOrders).toBeNull();
      expect(result.warehouseUnits).toBeNull();
      expect(result.frozenSellerFunds).toBeNull();
      expect(result.availableSellerFunds).toBeNull();
      expect(result.aursuqProfit).toBeNull();
      expect(result.todayAursuqProfit).toBeNull();
    });

    it('should return zero for empty database', async () => {
      prismaService.user.count
        .mockResolvedValueOnce(0) // totalSellers
        .mockResolvedValueOnce(0) // activeSellers
        .mockResolvedValueOnce(0); // totalCustomers

      const result = await service.getSummary();

      expect(result.totalSellers).toBe(0);
      expect(result.activeSellers).toBe(0);
      expect(result.totalCustomers).toBe(0);
      // null fields remain null
      expect(result.totalOrders).toBeNull();
    });

    it('should query Prisma with correct filters', async () => {
      prismaService.user.count
        .mockResolvedValueOnce(5)
        .mockResolvedValueOnce(3)
        .mockResolvedValueOnce(20);

      await service.getSummary();

      expect(prismaService.user.count).toHaveBeenCalledTimes(3);
      expect(prismaService.user.count).toHaveBeenNthCalledWith(1, {
        where: { role: UserRole.SELLER },
      });
      expect(prismaService.user.count).toHaveBeenNthCalledWith(2, {
        where: { role: UserRole.SELLER, status: UserStatus.ACTIVE },
      });
      expect(prismaService.user.count).toHaveBeenNthCalledWith(3, {
        where: { role: UserRole.CUSTOMER },
      });
    });
  });
});