import { Injectable, ConflictException, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, SellerVerificationStatus, UserRole, UserStatus } from '@prisma/client';
import { CreateSellerDto } from './create-seller.dto';
import { SellerListItemResponse, SellerDetailResponse, SellerStoreResponse } from './seller-response.interface';

@Injectable()
export class SellersService {
  constructor(private readonly prisma: PrismaService) {}

  async createSeller(dto: CreateSellerDto): Promise<SellerDetailResponse> {
    const normalizedEmail = dto.email.trim().toLowerCase();
    const normalizedStoreSlug = dto.storeSlug.trim().toLowerCase();

    // Check if email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Check if store slug already exists
    const existingStore = await this.prisma.store.findUnique({
      where: { slug: normalizedStoreSlug },
    });

    if (existingStore) {
      throw new ConflictException('Store slug already in use');
    }

    // Create everything in a transaction
    const result = await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Create User with SELLER role
      const user = await tx.user.create({
        data: {
          email: normalizedEmail,
          role: UserRole.SELLER,
          status: UserStatus.ACTIVE,
        },
      });

      // Create SellerProfile with PENDING verification
      const sellerProfile = await tx.sellerProfile.create({
        data: {
          userId: user.id,
          legalName: dto.legalName.trim(),
          businessName: dto.businessName.trim(),
          taxRegistrationNumber: dto.taxRegistrationNumber.trim(),
          phone: dto.phone.trim(),
          businessAddress: dto.businessAddress.trim(),
          verificationStatus: SellerVerificationStatus.PENDING,
        },
      });

      // Create Store with isActive = false
      const store = await tx.store.create({
        data: {
          sellerId: sellerProfile.id,
          name: dto.storeName.trim(),
          slug: normalizedStoreSlug,
          isActive: false,
        },
      });

      return { user, sellerProfile, store };
    });

    return this.mapToDetailResponse(result.user, result.sellerProfile, result.store);
  }

  async listSellers(search?: string): Promise<SellerListItemResponse[]> {
    const where: Prisma.SellerProfileWhereInput = {};

    if (search && search.trim()) {
      const trimmedSearch = search.trim();
      // Check if search looks like a store number (numeric, possibly with leading zeros)
      const numericSearch = trimmedSearch.replace(/^0+/, '');
      const isStoreNumberSearch = /^\d+$/.test(numericSearch);

      where.OR = [
        // Search by store name (case-insensitive)
        {
          store: {
            name: {
              contains: trimmedSearch,
              mode: 'insensitive',
            },
          },
        },
        // Search by store number (numeric, with or without leading zeros)
        ...(isStoreNumberSearch
          ? [
              {
                store: {
                  storeNumber: parseInt(numericSearch, 10),
                },
              },
            ]
          : []),
      ];
    }

    const sellerProfiles = await this.prisma.sellerProfile.findMany({
      where,
      include: {
        user: true,
        store: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return sellerProfiles.map((sp) => this.mapToListItemResponse(sp));
  }

  async getSellerById(sellerId: string): Promise<SellerDetailResponse> {
    const sellerProfile = await this.prisma.sellerProfile.findUnique({
      where: { id: sellerId },
      include: {
        user: true,
        store: true,
      },
    });

    if (!sellerProfile) {
      throw new NotFoundException('Seller not found');
    }

    return this.mapToDetailResponse(sellerProfile.user, sellerProfile, sellerProfile.store);
  }

  private mapToStoreResponse(store: { id: string; name: string; slug: string; isActive: boolean; storeNumber: number } | null): SellerStoreResponse | null {
    if (!store) return null;
    return {
      id: store.id,
      name: store.name,
      slug: store.slug,
      isActive: store.isActive,
      storeNumber: store.storeNumber,
    };
  }

  private mapToListItemResponse(sellerProfile: {
    id: string;
    userId: string;
    legalName: string;
    businessName: string;
    taxRegistrationNumber: string;
    phone: string;
    verificationStatus: SellerVerificationStatus;
    createdAt: Date;
    user: { email: string; status: UserStatus };
    store: { id: string; name: string; slug: string; isActive: boolean; storeNumber: number } | null;
  }): SellerListItemResponse {
    return {
      id: sellerProfile.id,
      userId: sellerProfile.userId,
      email: sellerProfile.user.email,
      legalName: sellerProfile.legalName,
      businessName: sellerProfile.businessName,
      taxRegistrationNumber: sellerProfile.taxRegistrationNumber,
      phone: sellerProfile.phone,
      verificationStatus: sellerProfile.verificationStatus,
      userStatus: sellerProfile.user.status,
      store: this.mapToStoreResponse(sellerProfile.store),
      createdAt: sellerProfile.createdAt,
    };
  }

  private mapToDetailResponse(
    user: { id: string; email: string; status: UserStatus },
    sellerProfile: {
      id: string;
      userId: string;
      legalName: string;
      businessName: string;
      taxRegistrationNumber: string;
      phone: string;
      businessAddress: string;
      identityDocumentReference: string | null;
      verificationStatus: SellerVerificationStatus;
      createdAt: Date;
      updatedAt: Date;
    },
    store: { id: string; name: string; slug: string; isActive: boolean; storeNumber: number } | null
  ): SellerDetailResponse {
    return {
      id: sellerProfile.id,
      userId: sellerProfile.userId,
      email: user.email,
      legalName: sellerProfile.legalName,
      businessName: sellerProfile.businessName,
      taxRegistrationNumber: sellerProfile.taxRegistrationNumber,
      phone: sellerProfile.phone,
      businessAddress: sellerProfile.businessAddress,
      identityDocumentReference: sellerProfile.identityDocumentReference,
      verificationStatus: sellerProfile.verificationStatus,
      userStatus: user.status,
      store: this.mapToStoreResponse(store),
      createdAt: sellerProfile.createdAt,
      updatedAt: sellerProfile.updatedAt,
    };
  }

  async deletePendingSeller(sellerId: string): Promise<void> {
    const sellerProfile = await this.prisma.sellerProfile.findUnique({
      where: { id: sellerId },
      include: {
        user: true,
        store: true,
      },
    });

    if (!sellerProfile) {
      throw new NotFoundException('Seller not found');
    }

    // Verify deletion is allowed: only PENDING verification AND store not active
    if (sellerProfile.verificationStatus !== SellerVerificationStatus.PENDING) {
      throw new ForbiddenException('Only pending sellers can be deleted');
    }

    if (sellerProfile.store?.isActive) {
      throw new ForbiddenException('Cannot delete seller with an active store');
    }

    // Delete atomically in transaction: Store, SellerProfile, User
    await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Delete Store first (if exists)
      if (sellerProfile.store) {
        await tx.store.delete({
          where: { id: sellerProfile.store.id },
        });
      }

      // Delete SellerProfile
      await tx.sellerProfile.delete({
        where: { id: sellerProfile.id },
      });

      // Delete User
      await tx.user.delete({
        where: { id: sellerProfile.userId },
      });
    });
  }
}