import { Injectable, ConflictException, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, SellerVerificationStatus, SellerModerationStatus, UserRole, UserStatus, StoreNumberReservationStatus } from '@prisma/client';
import { CreateSellerDto } from './create-seller.dto';
import { ArchiveSellerDto } from './archive-seller.dto';
import { SellerListItemResponse, SellerDetailResponse, SellerStoreResponse } from './seller-response.interface';
import { StoreNumberAllocatorService } from './store-number-allocator.service';

@Injectable()
export class SellersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storeNumberAllocator: StoreNumberAllocatorService,
  ) {}

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

    // Create everything in a transaction including store number allocation
    const result = await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Allocate store number FIRST - this acquires advisory lock
      const storeNumber = await this.storeNumberAllocator.allocate(tx);

      // Create User with SELLER role
      const user = await tx.user.create({
        data: {
          email: normalizedEmail,
          role: UserRole.SELLER,
          status: UserStatus.ACTIVE,
        },
      });

      // Create SellerProfile with VERIFIED verification and ACTIVE moderation for OWNER-created seller per rule 9
      const sellerProfile = await tx.sellerProfile.create({
        data: {
          userId: user.id,
          legalName: dto.legalName.trim(),
          businessName: dto.businessName.trim(),
          taxRegistrationNumber: dto.taxRegistrationNumber.trim(),
          phone: dto.phone.trim(),
          businessAddress: dto.businessAddress.trim(),
          verificationStatus: SellerVerificationStatus.VERIFIED,
          moderationStatus: SellerModerationStatus.ACTIVE,
        },
      });

      // Create Store with isActive = false and the allocated store number
      const store = await tx.store.create({
        data: {
          sellerId: sellerProfile.id,
          name: dto.storeName.trim(),
          slug: normalizedStoreSlug,
          isActive: false,
          storeNumber,
        },
      });

      // Associate the store with the reservation
      await this.storeNumberAllocator.associateStore(tx, storeNumber, store.id);

      return { user, sellerProfile, store };
    });

    return this.mapToDetailResponse(result.user, result.sellerProfile, result.store);
  }

  async listSellers(search?: string): Promise<SellerListItemResponse[]> {
    const where: Prisma.SellerProfileWhereInput = {
      isArchived: false,
    };

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

  private mapToStoreResponse(store: { id: string; name: string; slug: string; isActive: boolean; storeNumber: number | null; archivedStoreNumber: number | null } | null): SellerStoreResponse | null {
    if (!store) return null;
    return {
      id: store.id,
      name: store.name,
      slug: store.slug,
      isActive: store.isActive,
      storeNumber: store.storeNumber,
      archivedStoreNumber: store.archivedStoreNumber,
    };
  }

  private mapToListItemResponse(sellerProfile: {
    id: string;
    userId: string;
    legalName: string;
    businessName: string;
    taxRegistrationNumber: string;
    phone: string;
    businessAddress: string;
    identityDocumentReference: string | null;
    verificationStatus: SellerVerificationStatus;
    moderationStatus: SellerModerationStatus;
    createdAt: Date;
    user: { email: string; status: UserStatus };
    store: { id: string; name: string; slug: string; isActive: boolean; storeNumber: number | null; archivedStoreNumber: number | null } | null;
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
      moderationStatus: sellerProfile.moderationStatus,
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
      moderationStatus: SellerModerationStatus;
      createdAt: Date;
      updatedAt: Date;
    },
    store: { id: string; name: string; slug: string; isActive: boolean; storeNumber: number | null; archivedStoreNumber: number | null } | null
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
      moderationStatus: sellerProfile.moderationStatus,
      userStatus: user.status,
      store: this.mapToStoreResponse(store),
      createdAt: sellerProfile.createdAt,
      updatedAt: sellerProfile.updatedAt,
    };
  }

  async archiveSeller(sellerId: string, ownerUserId: string, dto: ArchiveSellerDto): Promise<SellerDetailResponse> {
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

    if (sellerProfile.isArchived) {
      throw new ConflictException('Seller is already archived');
    }

    const result = await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      let releasedStoreNumber: number | null = null;

      if (sellerProfile.store && sellerProfile.store.storeNumber !== null) {
        releasedStoreNumber = sellerProfile.store.storeNumber;
        
        // Update Store: decouple storeNumber, set archivedStoreNumber, set isActive = false
        await tx.store.update({
          where: { id: sellerProfile.store.id },
          data: {
            storeNumber: null,
            archivedStoreNumber: releasedStoreNumber,
            isActive: false,
          },
        });

        // Release the store number via allocator service
        await this.storeNumberAllocator.release(tx, releasedStoreNumber);
      }

      // Update SellerProfile to archived state
      const updatedProfile = await tx.sellerProfile.update({
        where: { id: sellerId },
        data: {
          isArchived: true,
          archivedAt: new Date(),
          archivedByUserId: ownerUserId,
          archiveReason: dto.reason?.trim() || null,
        },
        include: {
          user: true,
          store: true,
        },
      });

      // Create SellerAudit record
      await tx.sellerAudit.create({
        data: {
          sellerProfileId: sellerId,
          actorUserId: ownerUserId,
          actorRole: 'OWNER',
          eventType: 'ARCHIVE',
          reason: dto.reason?.trim() || null,
          metadata: {
            archivedStoreNumber: releasedStoreNumber,
          },
        },
      });

      return updatedProfile;
    });

    return this.mapToDetailResponse(result.user, result, result.store);
  }
}