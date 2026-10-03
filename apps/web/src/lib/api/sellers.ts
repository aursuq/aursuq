// Sellers API Service - Frontend data layer for real backend integration

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    credentials: 'include',
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message || `HTTP ${res.status}`);
  }

  return res.json();
}

export interface SellerStoreResponse {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  storeNumber: number;
}

export interface SellerListItemResponse {
  id: string;
  userId: string;
  email: string;
  legalName: string;
  businessName: string;
  taxRegistrationNumber: string;
  phone: string;
  verificationStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  userStatus: 'ACTIVE' | 'SUSPENDED' | 'DISABLED';
  store: SellerStoreResponse | null;
  createdAt: string;
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
  verificationStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  userStatus: 'ACTIVE' | 'SUSPENDED' | 'DISABLED';
  store: SellerStoreResponse | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSellerDto {
  email: string;
  legalName: string;
  businessName: string;
  taxRegistrationNumber: string;
  phone: string;
  businessAddress: string;
  storeName: string;
  storeSlug: string;
}

/**
 * Fetches all sellers with optional search.
 * Backend endpoint: GET /owner/sellers?q=search
 * Response: SellerListItemResponse[]
 */
export async function fetchSellers(search?: string): Promise<SellerListItemResponse[]> {
  const params = new URLSearchParams();
  if (search && search.trim()) {
    params.set('q', search.trim());
  }
  return fetchJson(`${API_BASE_URL}/owner/sellers?${params}`);
}

/**
 * Creates a new seller.
 * Backend endpoint: POST /owner/sellers
 * Response: SellerDetailResponse
 */
export async function createSeller(dto: CreateSellerDto): Promise<SellerDetailResponse> {
  return fetchJson(`${API_BASE_URL}/owner/sellers`, {
    method: 'POST',
    body: JSON.stringify(dto),
  });
}

/**
 * Fetches seller details by ID.
 * Backend endpoint: GET /owner/sellers/:sellerId
 * Response: SellerDetailResponse
 */
export async function fetchSellerById(sellerId: string): Promise<SellerDetailResponse> {
  return fetchJson(`${API_BASE_URL}/owner/sellers/${sellerId}`);
}

/**
 * Deletes a pending seller.
 * Backend endpoint: DELETE /owner/sellers/:sellerId
 * Response: void (204)
 */
export async function deleteSeller(sellerId: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/owner/sellers/${sellerId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message || `HTTP ${res.status}`);
  }
}