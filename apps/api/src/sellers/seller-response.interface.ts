import { SellerVerificationStatus, UserStatus } from '@prisma/client';

export interface SellerStoreResponse {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
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
  userStatus: UserStatus;
  store: SellerStoreResponse | null;
  createdAt: Date;
  updatedAt: Date;
}