import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { SellersService } from './sellers.service';
import { PrismaService } from '../prisma/prisma.service';
import { StoreNumberAllocatorService } from './store-number-allocator.service';
import { UserRole, UserStatus, SellerVerificationStatus, SellerModerationStatus } from '@prisma/client';
import { CreateSellerDto } from './create-seller.dto';

describe('SellersService', () => {
  let service: SellersService;
  let storeNumberAllocator: {
    allocate: jest.Mock;
    associateStore: jest.Mock;
  };
  let prismaService: {
    user: {
      findUnique: jest.Mock;
      create: jest.Mock;
    };
    store: {
      findUnique: jest.Mock;
      create: jest.Mock;
    };
    sellerProfile: {
      create: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
    };
    $transaction: jest.Mock;
  };

  const validDto: CreateSellerDto = {
    email: '  SELLER@Example.com  ',
    legalName: ' Acme Corp ',
    businessName: ' Acme Store ',
    taxRegistrationNumber: ' IL987654321 ',
    phone: '+972-50-9876543',
    businessAddress: ' 456 Market St, Tel Aviv ',
    storeName: ' Acme Retail ',
    storeSlug: '  ACME-STORE  ',
  };

  beforeEach(async () => {
    storeNumberAllocator = {
      allocate: jest.fn().mockResolvedValue(1),
      associateStore: jest.fn().mockResolvedValue(undefined),
    };

    prismaService = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
      store: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
      sellerProfile: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
      },
      $transaction: jest.fn((callback) => callback(prismaService)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SellersService,
        { provide: PrismaService, useValue: prismaService },
        { provide: StoreNumberAllocatorService, useValue: storeNumberAllocator },
      ],
    }).compile();

    service = module.get<SellersService>(SellersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const mockUser = {
    id: 'user-uuid-1',
    email: 'seller@example.com',
    role: UserRole.SELLER,
    status: UserStatus.ACTIVE,
  };

  const mockSellerProfile = {
    id: 'seller-uuid-1',
    userId: 'user-uuid-1',
    legalName: 'Acme Corp',
    businessName: 'Acme Store',
    taxRegistrationNumber: 'IL987654321',
    phone: '+972-50-9876543',
    businessAddress: '456 Market St, Tel Aviv',
    identityDocumentReference: null,
    verificationStatus: SellerVerificationStatus.VERIFIED,
    moderationStatus: SellerModerationStatus.ACTIVE,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  };

  const mockStore = {
    id: 'store-uuid-1',
    sellerId: 'seller-uuid-1',
    name: 'Acme Retail',
    slug: 'acme-store',
    isActive: false,
    storeNumber: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  };

  describe('createSeller', () => {
    it('should create seller with normalized data and correct defaults', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);
      prismaService.store.findUnique.mockResolvedValue(null);
      prismaService.user.create.mockResolvedValue(mockUser);
      prismaService.sellerProfile.create.mockResolvedValue(mockSellerProfile);
      prismaService.store.create.mockResolvedValue(mockStore);

      const result = await service.createSeller(validDto);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'seller@example.com' },
      });
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: 'seller@example.com',
          role: UserRole.SELLER,
          status: UserStatus.ACTIVE,
        },
      });

      expect(prismaService.store.findUnique).toHaveBeenCalledWith({
        where: { slug: 'acme-store' },
      });
      expect(prismaService.store.create).toHaveBeenCalledWith({
        data: {
          sellerId: 'seller-uuid-1',
          name: 'Acme Retail',
          slug: 'acme-store',
          isActive: false,
          storeNumber: 1,
        },
      });

      expect(storeNumberAllocator.allocate).toHaveBeenCalled();
      expect(storeNumberAllocator.associateStore).toHaveBeenCalledWith(
        expect.anything(),
        1,
        'store-uuid-1',
      );

      expect(prismaService.sellerProfile.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-uuid-1',
          legalName: 'Acme Corp',
          businessName: 'Acme Store',
          taxRegistrationNumber: 'IL987654321',
          phone: '+972-50-9876543',
          businessAddress: '456 Market St, Tel Aviv',
          verificationStatus: SellerVerificationStatus.VERIFIED,
          moderationStatus: SellerModerationStatus.ACTIVE,
        },
      });

      expect(result.id).toBe('seller-uuid-1');
      expect(result.userId).toBe('user-uuid-1');
      expect(result.email).toBe('seller@example.com');
      expect(result.legalName).toBe('Acme Corp');
      expect(result.businessName).toBe('Acme Store');
      expect(result.taxRegistrationNumber).toBe('IL987654321');
      expect(result.phone).toBe('+972-50-9876543');
      expect(result.businessAddress).toBe('456 Market St, Tel Aviv');
      expect(result.verificationStatus).toBe(SellerVerificationStatus.VERIFIED);
      expect(result.moderationStatus).toBe(SellerModerationStatus.ACTIVE);
      expect(result.userStatus).toBe(UserStatus.ACTIVE);
      expect(result.store).toEqual({
        id: 'store-uuid-1',
        name: 'Acme Retail',
        slug: 'acme-store',
        isActive: false,
        storeNumber: 1,
      });
      expect(result.createdAt).toEqual(mockSellerProfile.createdAt);
      expect(result.updatedAt).toEqual(mockSellerProfile.updatedAt);
    });

    it('should throw ConflictException when email already exists', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(service.createSeller(validDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.createSeller(validDto)).rejects.toThrow(
        'Email already registered',
      );

      expect(prismaService.store.findUnique).not.toHaveBeenCalled();
      expect(prismaService.$transaction).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when store slug already exists', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);
      prismaService.store.findUnique.mockResolvedValue(mockStore);

      await expect(service.createSeller(validDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.createSeller(validDto)).rejects.toThrow(
        'Store slug already in use',
      );

      expect(prismaService.$transaction).not.toHaveBeenCalled();
    });

    it('should rollback transaction if user creation fails', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);
      prismaService.store.findUnique.mockResolvedValue(null);
      prismaService.user.create.mockRejectedValue(new Error('DB error'));

      await expect(service.createSeller(validDto)).rejects.toThrow('DB error');

      expect(prismaService.sellerProfile.create).not.toHaveBeenCalled();
      expect(prismaService.store.create).not.toHaveBeenCalled();
    });

    it('should rollback transaction if sellerProfile creation fails', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);
      prismaService.store.findUnique.mockResolvedValue(null);
      prismaService.user.create.mockResolvedValue(mockUser);
      prismaService.sellerProfile.create.mockRejectedValue(new Error('DB error'));

      await expect(service.createSeller(validDto)).rejects.toThrow('DB error');

      expect(prismaService.store.create).not.toHaveBeenCalled();
    });

    it('should rollback transaction if store creation fails', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);
      prismaService.store.findUnique.mockResolvedValue(null);
      prismaService.user.create.mockResolvedValue(mockUser);
      prismaService.sellerProfile.create.mockResolvedValue(mockSellerProfile);
      prismaService.store.create.mockRejectedValue(new Error('DB error'));

      await expect(service.createSeller(validDto)).rejects.toThrow('DB error');
    });
  });

  describe('listSellers', () => {
    it('should return list of sellers with correct mapping', async () => {
      const mockSellerProfiles = [
        {
          ...mockSellerProfile,
          moderationStatus: SellerModerationStatus.ACTIVE,
          user: { email: 'seller1@example.com', status: UserStatus.ACTIVE },
          store: { ...mockStore, name: 'Store 1', slug: 'store-1' },
        },
      ];

      prismaService.sellerProfile.findMany.mockResolvedValue(mockSellerProfiles);

      const result = await service.listSellers();

      expect(result).toHaveLength(1);
      expect(result[0].email).toBe('seller1@example.com');
      expect(result[0].verificationStatus).toBe(SellerVerificationStatus.VERIFIED);
      expect(result[0].moderationStatus).toBe(SellerModerationStatus.ACTIVE);
    });

    it('should return empty array when no sellers exist', async () => {
      prismaService.sellerProfile.findMany.mockResolvedValue([]);

      const result = await service.listSellers();

      expect(result).toEqual([]);
    });
  });

  describe('getSellerById', () => {
    it('should return seller detail when seller exists', async () => {
      const mockSellerWithRelations = {
        ...mockSellerProfile,
        user: { ...mockUser, id: 'user-uuid-1' },
        store: mockStore,
      };

      prismaService.sellerProfile.findUnique.mockResolvedValue(mockSellerWithRelations);

      const result = await service.getSellerById('seller-uuid-1');

      expect(result.id).toBe('seller-uuid-1');
      expect(result.email).toBe('seller@example.com');
    });

    it('should throw NotFoundException when seller does not exist', async () => {
      prismaService.sellerProfile.findUnique.mockResolvedValue(null);

      await expect(service.getSellerById('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});