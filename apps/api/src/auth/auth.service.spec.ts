import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GoogleAuthService } from './google-auth.service';
import { SessionService } from './session.service';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole, UserStatus } from '@prisma/client';

describe('AuthService', () => {
  let service: AuthService;
  let googleAuthService: { verifyIdToken: jest.Mock };
  let sessionService: {
    createSession: jest.Mock;
    setSessionCookie: jest.Mock;
    verifySession: jest.Mock;
    clearSessionCookie: jest.Mock;
    getCookieName: jest.Mock;
  };
  let prismaService: {
    user: {
      findUnique: jest.Mock;
      update: jest.Mock;
    };
  };

  const mockUser = {
    id: 'user-123',
    email: 'owner@aursuq.com',
    role: UserRole.OWNER,
    status: UserStatus.ACTIVE,
    lastLoginAt: null,
  };

  const mockSessionPayload = {
    userId: 'user-123',
    email: 'owner@aursuq.com',
    role: UserRole.OWNER,
  };

  beforeEach(async () => {
    googleAuthService = {
      verifyIdToken: jest.fn(),
    };

    sessionService = {
      createSession: jest.fn(),
      setSessionCookie: jest.fn(),
      verifySession: jest.fn(),
      clearSessionCookie: jest.fn(),
      getCookieName: jest.fn().mockReturnValue('aursuq_session'),
    };

    prismaService = {
      user: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: GoogleAuthService, useValue: googleAuthService },
        { provide: SessionService, useValue: sessionService },
        { provide: PrismaService, useValue: prismaService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('loginWithGoogle', () => {
    const mockResponse = {
      cookie: jest.fn(),
    } as any;

    it('should allow valid Google identity + existing ACTIVE OWNER', async () => {
      googleAuthService.verifyIdToken.mockResolvedValue({
        email: 'owner@aursuq.com',
        email_verified: true,
        sub: 'google-sub-123',
      });

      prismaService.user.findUnique.mockResolvedValue(mockUser);
      prismaService.user.update.mockResolvedValue(mockUser);
      sessionService.createSession.mockResolvedValue('session-token');

      const result = await service.loginWithGoogle('valid-google-token', mockResponse);

      expect(googleAuthService.verifyIdToken).toHaveBeenCalledWith('valid-google-token');
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'owner@aursuq.com' },
      });
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: { lastLoginAt: expect.any(Date) },
      });
      expect(sessionService.createSession).toHaveBeenCalledWith(mockSessionPayload);
      expect(sessionService.setSessionCookie).toHaveBeenCalledWith(mockResponse, 'session-token');
      expect(result.user).toEqual(mockSessionPayload);
    });
it('should deny valid Google identity + non-existing user', async () => {
      googleAuthService.verifyIdToken.mockResolvedValue({
        email: 'nonexistent@aursuq.com',
        email_verified: true,
        sub: 'google-sub-123',
      });

      prismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.loginWithGoogle('valid-google-token', mockResponse)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(prismaService.user.update).not.toHaveBeenCalled();
      expect(sessionService.createSession).not.toHaveBeenCalled();
    });

    it('should deny existing ADMIN user', async () => {
      googleAuthService.verifyIdToken.mockResolvedValue({
        email: 'admin@aursuq.com',
        email_verified: true,
        sub: 'google-sub-123',
      });

      prismaService.user.findUnique.mockResolvedValue({
        ...mockUser,
        email: 'admin@aursuq.com',
        role: UserRole.ADMIN,
      });

      await expect(service.loginWithGoogle('valid-google-token', mockResponse)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(prismaService.user.update).not.toHaveBeenCalled();
      expect(sessionService.createSession).not.toHaveBeenCalled();
    });

    it('should deny existing OWNER but SUSPENDED', async () => {
      googleAuthService.verifyIdToken.mockResolvedValue({
        email: 'suspended@aursuq.com',
        email_verified: true,
        sub: 'google-sub-123',
      });

      prismaService.user.findUnique.mockResolvedValue({
        ...mockUser,
        email: 'suspended@aursuq.com',
        status: UserStatus.SUSPENDED,
      });

      await expect(service.loginWithGoogle('valid-google-token', mockResponse)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should deny existing OWNER but DISABLED', async () => {
      googleAuthService.verifyIdToken.mockResolvedValue({
        email: 'disabled@aursuq.com',
        email_verified: true,
        sub: 'google-sub-123',
      });

      prismaService.user.findUnique.mockResolvedValue({
        ...mockUser,
        email: 'disabled@aursuq.com',
        status: UserStatus.DISABLED,
      });

      await expect(service.loginWithGoogle('valid-google-token', mockResponse)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should deny unverified Google email', async () => {
      googleAuthService.verifyIdToken.mockRejectedValue(
        new UnauthorizedException('Google email not verified'),
      );

      await expect(service.loginWithGoogle('unverified-email-token', mockResponse)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(prismaService.user.findUnique).not.toHaveBeenCalled();
    });

    it('should deny invalid Google credential', async () => {
      googleAuthService.verifyIdToken.mockRejectedValue(
        new UnauthorizedException('Invalid Google credential'),
      );

      await expect(service.loginWithGoogle('invalid-token', mockResponse)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(prismaService.user.findUnique).not.toHaveBeenCalled();
    });
  });

  describe('getCurrentUser', () => {
    it('should return user for valid ACTIVE OWNER session', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.getCurrentUser(mockSessionPayload);

      expect(result).toEqual({ user: mockSessionPayload });
    });

    it('should return null for non-existing user', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.getCurrentUser(mockSessionPayload);

      expect(result).toBeNull();
    });

    it('should return null for SUSPENDED OWNER', async () => {
      prismaService.user.findUnique.mockResolvedValue({
        ...mockUser,
        status: UserStatus.SUSPENDED,
      });

      const result = await service.getCurrentUser(mockSessionPayload);

      expect(result).toBeNull();
    });

    it('should return null for DISABLED OWNER', async () => {
      prismaService.user.findUnique.mockResolvedValue({
        ...mockUser,
        status: UserStatus.DISABLED,
      });

      const result = await service.getCurrentUser(mockSessionPayload);

      expect(result).toBeNull();
    });

    it('should return null for non-OWNER role', async () => {
      prismaService.user.findUnique.mockResolvedValue({
        ...mockUser,
        role: UserRole.ADMIN,
      });

      const result = await service.getCurrentUser(mockSessionPayload);

      expect(result).toBeNull();
    });
  });

  describe('logout', () => {
    it('should clear session cookie', async () => {
      const mockResponse = { cookie: jest.fn() } as any;

      await service.logout(mockResponse);

      expect(sessionService.clearSessionCookie).toHaveBeenCalledWith(mockResponse);
    });
  });
});