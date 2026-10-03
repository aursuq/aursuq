import { Test, TestingModule } from '@nestjs/testing';
import {
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { SellersController } from './sellers.controller';
import { SellersService } from './sellers.service';
import { OwnerGuard } from '../auth/owner.guard';
import { CreateSellerDto } from './create-seller.dto';
import {
  SellerListItemResponse,
  SellerDetailResponse,
} from './seller-response.interface';
import { UserRole, UserStatus, SellerVerificationStatus, SellerModerationStatus } from '@prisma/client';

describe('SellersController', () => {
  let controller: SellersController;
  let service: {
    createSeller: jest.Mock;
    listSellers: jest.Mock;
    getSellerById: jest.Mock;
  };
  let ownerGuard: { canActivate: jest.Mock };

  const mockDetailResponse = {
    id: 'seller-uuid-1',
    userId: 'user-uuid-1',
    email: 'seller@example.com',
    legalName: 'Acme Corp',
    businessName: 'Acme Store',
    taxRegistrationNumber: 'IL987654321',
    phone: '+972-50-9876543',
    businessAddress: '456 Market St, Tel Aviv',
    identityDocumentReference: null,
    verificationStatus: SellerVerificationStatus.VERIFIED,
    moderationStatus: SellerModerationStatus.ACTIVE,
    userStatus: UserStatus.ACTIVE,
    store: {
      id: 'store-uuid-1',
      name: 'Acme Retail',
      slug: 'acme-store',
      isActive: false,
    },
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  };

  const mockListResponse = [
    {
      id: 'seller-uuid-1',
      userId: 'user-uuid-1',
      email: 'seller1@example.com',
      legalName: 'Acme Corp',
      businessName: 'Acme Store',
      taxRegistrationNumber: 'IL987654321',
      phone: '+972-50-9876543',
      verificationStatus: SellerVerificationStatus.VERIFIED,
      moderationStatus: SellerModerationStatus.ACTIVE,
      userStatus: UserStatus.ACTIVE,
      store: {
        id: 'store-uuid-1',
        name: 'Store 1',
        slug: 'store-1',
        isActive: false,
      },
      createdAt: new Date('2026-01-01'),
    },
  ];

  const validDto: CreateSellerDto = {
    email: 'seller@example.com',
    legalName: 'Acme Corp',
    businessName: 'Acme Store',
    taxRegistrationNumber: 'IL987654321',
    phone: '+972-50-9876543',
    businessAddress: '456 Market St, Tel Aviv',
    storeName: 'Acme Retail',
    storeSlug: 'acme-store',
  };

  beforeEach(async () => {
    service = {
      createSeller: jest.fn().mockResolvedValue(mockDetailResponse),
      listSellers: jest.fn().mockResolvedValue(mockListResponse),
      getSellerById: jest.fn().mockResolvedValue(mockDetailResponse),
    };

    ownerGuard = {
      canActivate: jest.fn().mockReturnValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SellersController],
      providers: [
        { provide: SellersService, useValue: service },
      ],
    })
      .overrideGuard(OwnerGuard)
      .useValue(ownerGuard)
      .compile();

    controller = module.get<SellersController>(SellersController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createSeller', () => {
    it('should create seller for authenticated OWNER', async () => {
      const result = await controller.createSeller(validDto);

      expect(service.createSeller).toHaveBeenCalledWith(validDto);
      expect(result).toEqual(mockDetailResponse);
    });

    it('should propagate ConflictException for duplicate email', async () => {
      service.createSeller.mockRejectedValue(
        new ConflictException('Email already registered'),
      );

      await expect(controller.createSeller(validDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(controller.createSeller(validDto)).rejects.toThrow(
        'Email already registered',
      );
    });

    it('should propagate ConflictException for duplicate store slug', async () => {
      service.createSeller.mockRejectedValue(
        new ConflictException('Store slug already in use'),
      );

      await expect(controller.createSeller(validDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(controller.createSeller(validDto)).rejects.toThrow(
        'Store slug already in use',
      );
    });

    it('should propagate internal errors from service', async () => {
      service.createSeller.mockRejectedValue(new Error('Transaction failed'));

      await expect(controller.createSeller(validDto)).rejects.toThrow(
        'Transaction failed',
      );
    });
  });

  describe('listSellers', () => {
    it('should return list of sellers for authenticated OWNER', async () => {
      const result = await controller.listSellers();

      expect(service.listSellers).toHaveBeenCalled();
      expect(result).toEqual(mockListResponse);
    });
  });

  describe('getSeller', () => {
    it('should return seller detail for authenticated OWNER', async () => {
      const result = await controller.getSeller('seller-uuid-1');

      expect(service.getSellerById).toHaveBeenCalledWith('seller-uuid-1');
      expect(result).toEqual(mockDetailResponse);
    });

    it('should throw NotFoundException when seller does not exist', async () => {
      service.getSellerById.mockRejectedValue(
        new NotFoundException('Seller not found'),
      );

      await expect(controller.getSeller('non-existent')).rejects.toThrow(
        NotFoundException,
      );
      await expect(controller.getSeller('non-existent')).rejects.toThrow(
        'Seller not found',
      );
    });
  });
});