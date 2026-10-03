import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, StoreNumberReservationStatus } from '@prisma/client';

/**
 * Store Number Allocator Service
 * 
 * Concurrency-safe allocator using PostgreSQL transaction-scoped advisory lock.
 * Returns the lowest available positive store number.
 * 
 * Strategy:
 * 1. Acquire advisory lock (pg_advisory_xact_lock) with constant key
 * 2. Find lowest available number:
 *    - First: lowest RELEASED reservation number (reusable)
 *    - Second: next positive integer not in any reservation
 * 3. Reserve it (upsert: reuse RELEASED row or insert new)
 * 4. Lock released at transaction commit
 */
@Injectable()
export class StoreNumberAllocatorService {
  // Constant lock key for store number allocator - stable across deployments
  private static readonly ALLOCATOR_LOCK_KEY = 0x4155525351; // "AURSQ" as hex

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Allocate the lowest available store number within a transaction.
   * Must be called inside a Prisma transaction to ensure atomicity.
   * 
   * @param tx - Prisma transaction client
   * @returns The allocated store number
   */
  async allocate(tx: Prisma.TransactionClient): Promise<number> {
    // Acquire transaction-scoped advisory lock
    // This ensures only one allocation runs at a time
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(${StoreNumberAllocatorService.ALLOCATOR_LOCK_KEY})`;

    // Find the lowest RELEASED reservation (reusable number)
    const releasedReservation = await tx.storeNumberReservation.findFirst({
      where: { status: StoreNumberReservationStatus.RELEASED },
      orderBy: { number: 'asc' },
    });

    if (releasedReservation) {
      // Reuse the released number: update status back to RESERVED
      await tx.storeNumberReservation.update({
        where: { id: releasedReservation.id },
        data: {
          status: StoreNumberReservationStatus.RESERVED,
          reservedAt: new Date(),
          releasedAt: null,
          storeId: null, // Will be set when store is created
        },
      });
      return releasedReservation.number;
    }

    // No released numbers available - find the lowest unused positive integer
    // We need to find the smallest positive integer not present in reservations
    // Strategy: get all reserved numbers in order, find the first gap
    const reservedNumbers = await tx.storeNumberReservation.findMany({
      where: { status: StoreNumberReservationStatus.RESERVED },
      select: { number: true },
      orderBy: { number: 'asc' },
    });

    // Find the lowest available positive integer
    let candidate = 1;
    for (const reserved of reservedNumbers) {
      if (reserved.number === candidate) {
        candidate++;
      } else if (reserved.number > candidate) {
        // Found a gap - candidate is available
        break;
      }
    }

    // Create new reservation for the candidate number
    await tx.storeNumberReservation.create({
      data: {
        number: candidate,
        status: StoreNumberReservationStatus.RESERVED,
      },
    });

    return candidate;
  }

  /**
   * Release a store number back to the available pool.
   * Called by archive workflow (not yet implemented).
   * Must be called inside a Prisma transaction.
   * 
   * @param tx - Prisma transaction client
   * @param number - Store number to release
   * @returns true if released, false if not found or already released
   */
  async release(tx: Prisma.TransactionClient, number: number): Promise<boolean> {
    // Acquire the same advisory lock for consistency
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(${StoreNumberAllocatorService.ALLOCATOR_LOCK_KEY})`;

    const reservation = await tx.storeNumberReservation.findUnique({
      where: { number },
    });

    if (!reservation) {
      return false;
    }

    if (reservation.status === StoreNumberReservationStatus.RELEASED) {
      return false; // Already released
    }

    await tx.storeNumberReservation.update({
      where: { id: reservation.id },
      data: {
        status: StoreNumberReservationStatus.RELEASED,
        releasedAt: new Date(),
        storeId: null,
      },
    });

    return true;
  }

  /**
   * Associate a store ID with an already-reserved number.
   * Called after store creation within the same transaction.
   * 
   * @param tx - Prisma transaction client
   * @param number - Store number
   * @param storeId - Store UUID
   */
  async associateStore(tx: Prisma.TransactionClient, number: number, storeId: string): Promise<void> {
    await tx.storeNumberReservation.update({
      where: { number },
      data: { storeId },
    });
  }

  /**
   * Get the current highest reserved store number (for monitoring/debugging).
   */
  async getHighestReserved(): Promise<number | null> {
    const reservation = await this.prisma.storeNumberReservation.findFirst({
      where: { status: StoreNumberReservationStatus.RESERVED },
      orderBy: { number: 'desc' },
      select: { number: true },
    });
    return reservation?.number ?? null;
  }

  /**
   * Check if a store number is currently reserved.
   */
  async isReserved(number: number): Promise<boolean> {
    const reservation = await this.prisma.storeNumberReservation.findUnique({
      where: { number },
    });
    return reservation?.status === StoreNumberReservationStatus.RESERVED;
  }
}