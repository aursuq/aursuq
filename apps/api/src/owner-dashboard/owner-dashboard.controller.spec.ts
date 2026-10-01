import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, HttpStatus } from '@nestjs/common';
import { OwnerDashboardController } from './owner-dashboard.controller';
import { OwnerDashboardService } from './owner-dashboard.service';
import { AuthGuard } from '../auth/auth.guard';

describe('OwnerDashboardController', () => {
  let controller: OwnerDashboardController;
  let service: {
    getSummary: jest.Mock;
  };
  let authGuard: { canActivate: jest.Mock };

  const mockSummary = {
    totalSellers: 10,
    activeSellers: 7,
    totalCustomers: 42,
    totalOrders: null,
    todayOrders: null,
    warehouseUnits: null,
    frozenSellerFunds: null,
    availableSellerFunds: null,
    aursuqProfit: null,
    todayAursuqProfit: null,
  };

  beforeEach(async () => {
    service = {
      getSummary: jest.fn().mockResolvedValue(mockSummary),
    };

    authGuard = {
      canActivate: jest.fn().mockReturnValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OwnerDashboardController],
      providers: [
        { provide: OwnerDashboardService, useValue: service },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue(authGuard)
      .compile();

    controller = module.get<OwnerDashboardController>(OwnerDashboardController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getSummary', () => {
    it('should return dashboard summary for authenticated OWNER', async () => {
      const result = await controller.getSummary();

      expect(service.getSummary).toHaveBeenCalled();
      expect(result).toEqual(mockSummary);
    });

    it('should call service with no additional parameters', async () => {
      await controller.getSummary();

      expect(service.getSummary).toHaveBeenCalledWith();
    });

    it('should return correct shape with real counts and null for unimplemented metrics', async () => {
      const result = await controller.getSummary();

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
  });
});