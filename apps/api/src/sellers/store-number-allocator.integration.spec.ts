import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { StoreNumberAllocatorService } from './store-number-allocator.service';
import { Prisma, StoreNumberReservationStatus } from '@prisma/client';
import { INestApplication } from '@nestjs/common';

/**
 * Integration tests for StoreNumberAllocatorService with real PostgreSQL.
 * These tests verify the concurrency-safe allocation behavior.
 */
describe('StoreNumberAllocatorService (Integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let allocator: StoreNumberAllocatorService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService, StoreNumberAllocatorService],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    prisma = module.get<PrismaService>(PrismaService);
    allocator = module.get<StoreNumberAllocatorService>(StoreNumberAllocatorService);
  });

  afterAll(async () => {
    await prisma.storeNumberReservation.deleteMany({
      where: { number: { gte: 1 } },
    });
    await app.close();
  });

  beforeEach(async () => {
    await prisma.storeNumberReservation.deleteMany({
      where: { number: { gte: 1 } },
    });
  });

  describe('allocate()', () => {
    it('should allocate 1 in empty system', async () => {
      const number = await prisma.$transaction(async (tx) => {
        return allocator.allocate(tx);
      });

      expect(number).toBe(1);

      const reservation = await prisma.storeNumberReservation.findUnique({
        where: { number: 1 },
      });
      expect(reservation).toBeDefined();
      expect(reservation?.status).toBe(StoreNumberReservationStatus.RESERVED);
    });

    it('should allocate 2 when 1 is reserved', async () => {
      await prisma.storeNumberReservation.create({
        data: { number: 1, status: StoreNumberReservationStatus.RESERVED },
      });

      const number = await prisma.$transaction(async (tx) => {
        return allocator.allocate(tx);
      });

      expect(number).toBe(2);
    });

    it('should allocate 3 when 1, 2, 4 are reserved (lowest available wins)', async () => {
      await prisma.storeNumberReservation.createMany({
        data: [
          { number: 1, status: StoreNumberReservationStatus.RESERVED },
          { number: 2, status: StoreNumberReservationStatus.RESERVED },
          { number: 4, status: StoreNumberReservationStatus.RESERVED },
        ],
      });

      const number = await prisma.$transaction(async (tx) => {
        return allocator.allocate(tx);
      });

      expect(number).toBe(3);
    });

    it('should reuse released number (lowest released first)', async () => {
      await prisma.storeNumberReservation.createMany({
        data: [
          { number: 1, status: StoreNumberReservationStatus.RESERVED },
          { number: 2, status: StoreNumberReservationStatus.RESERVED },
          { number: 3, status: StoreNumberReservationStatus.RESERVED },
        ],
      });

      await prisma.storeNumberReservation.update({
        where: { number: 2 },
        data: { status: StoreNumberReservationStatus.RELEASED, releasedAt: new Date() },
      });

      const number = await prisma.$transaction(async (tx) => {
        return allocator.allocate(tx);
      });

      expect(number).toBe(2);

      const reservations = await prisma.storeNumberReservation.findMany({
        where: { number: 2 },
      });
      expect(reservations).toHaveLength(1);
      expect(reservations[0].status).toBe(StoreNumberReservationStatus.RESERVED);
    });

    it('should release a number and make it available again', async () => {
      await prisma.storeNumberReservation.create({
        data: { number: 5, status: StoreNumberReservationStatus.RESERVED },
      });

      const released = await prisma.$transaction(async (tx) => {
        return allocator.release(tx, 5);
      });

      expect(released).toBe(true);

      const reservation = await prisma.storeNumberReservation.findUnique({
        where: { number: 5 },
      });
      expect(reservation?.status).toBe(StoreNumberReservationStatus.RELEASED);
      expect(reservation?.releasedAt).toBeDefined();

      const number = await prisma.$transaction(async (tx) => {
        return allocator.allocate(tx);
      });

      expect(number).toBe(5);
    });

    it('should not release already released number', async () => {
      await prisma.storeNumberReservation.create({
        data: { number: 7, status: StoreNumberReservationStatus.RELEASED },
      });

      const released = await prisma.$transaction(async (tx) => {
        return allocator.release(tx, 7);
      });

      expect(released).toBe(false);
    });

    it('should not release non-existent number', async () => {
      const released = await prisma.$transaction(async (tx) => {
        return allocator.release(tx, 999);
      });

      expect(released).toBe(false);
    });
  });
  describe('concurrent allocations', () => {
    it('should never allocate the same number to two concurrent requests', async () => {
      const concurrency = 10;
      const results: number[] = [];

      const promises = Array.from({ length: concurrency }, async () => {
        const number = await prisma.$transaction(async (tx) => {
          return allocator.allocate(tx);
        });
        results.push(number);
        return number;
      });

      await Promise.all(promises);

      const uniqueResults = new Set(results);
      expect(uniqueResults.size).toBe(concurrency);

      const sorted = results.sort((a, b) => a - b);
      expect(sorted).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    });

    it('should handle concurrent allocations with some pre-reserved numbers', async () => {
      await prisma.storeNumberReservation.createMany({
        data: [
          { number: 1, status: StoreNumberReservationStatus.RESERVED },
          { number: 3, status: StoreNumberReservationStatus.RESERVED },
          { number: 5, status: StoreNumberReservationStatus.RESERVED },
        ],
      });

      const concurrency = 5;
      const results: number[] = [];

      const promises = Array.from({ length: concurrency }, async () => {
        const number = await prisma.$transaction(async (tx) => {
          return allocator.allocate(tx);
        });
        results.push(number);
        return number;
      });

      await Promise.all(promises);

      const uniqueResults = new Set(results);
      expect(uniqueResults.size).toBe(concurrency);

      const sorted = results.sort((a, b) => a - b);
      expect(sorted).toEqual([2, 4, 6, 7, 8]);
    });

    it('should not leak numbers when transaction fails after allocation', async () => {
      let allocatedNumber: number | null = null;

      try {
        await prisma.$transaction(async (tx) => {
          allocatedNumber = await allocator.allocate(tx);
          throw new Error('Simulated failure');
        });
      } catch (e) {
        // Expected to fail
      }

      const number = await prisma.$transaction(async (tx) => {
        return allocator.allocate(tx);
      });

      expect(number).toBe(allocatedNumber);
      expect(number).toBe(1);
    });
  });

  describe('associateStore', () => {
    it('should associate store ID with reserved number', async () => {
      const number = await prisma.$transaction(async (tx) => {
        const n = await allocator.allocate(tx);
        await allocator.associateStore(tx, n, 'store-uuid-123');
        return n;
      });

      const reservation = await prisma.storeNumberReservation.findUnique({
        where: { number },
      });
      expect(reservation?.storeId).toBe('store-uuid-123');
    });
  });

  describe('helper methods', () => {
    it('should return highest reserved number', async () => {
      await prisma.storeNumberReservation.createMany({
        data: [
          { number: 1, status: StoreNumberReservationStatus.RESERVED },
          { number: 5, status: StoreNumberReservationStatus.RESERVED },
          { number: 3, status: StoreNumberReservationStatus.RESERVED },
        ],
      });

      const highest = await allocator.getHighestReserved();
      expect(highest).toBe(5);
    });

    it('should return null for highest reserved when empty', async () => {
      const highest = await allocator.getHighestReserved();
      expect(highest).toBeNull();
    });

    it('should check if number is reserved', async () => {
      await prisma.storeNumberReservation.create({
        data: { number: 42, status: StoreNumberReservationStatus.RESERVED },
      });

      const isReserved = await allocator.isReserved(42);
      expect(isReserved).toBe(true);

      const notReserved = await allocator.isReserved(43);
      expect(notReserved).toBe(false);
    });
  });
});
