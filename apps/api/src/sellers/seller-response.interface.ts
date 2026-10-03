import { SellerVerificationStatus, SellerModerationStatus, UserStatus } from '@prisma/client';

export interface SellerStoreResponse {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  storeNumber: number | null;
  archivedStoreNumber: number | null;
}

export interface SellerListItemResponse {
  id: string;
  userId: string;
  email: string;
  legalName: string;
  businessName: string;
  taxRegistrationNumber: string;
  phone: string;
  verificationStatus: SellerVerificationStatus;
  moderationStatus: SellerModerationStatus;
  userStatus: UserStatus;
  store: SellerStoreResponse | null;
  createdAt: Date;
}

export interface SellerDetailResponse {
  id: string;
  userId: string;
  email: string;
  legalName: string;
  businessName: string;
  taxRegistrationNumber: string;
  phone: string;
  businessAddress: string;
  identityDocumentReference: string | null;
  verificationStatus: SellerVerificationStatus;
  moderationStatus: SellerModerationStatus;
  userStatus: UserStatus;
  store: SellerStoreResponse | null;
  createdAt: Date;
  updatedAt: Date;
}