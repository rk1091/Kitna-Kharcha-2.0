import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as bcrypt from 'bcryptjs';

vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn().mockResolvedValue('hashed_password'),
    compare: vi.fn().mockResolvedValue(true),
  },
  hash: vi.fn().mockResolvedValue('hashed_password'),
  compare: vi.fn().mockResolvedValue(true),
}));

describe('AuthService', () => {
  let service: AuthService;
  let prisma: any;
  let jwt: any;

  beforeEach(() => {
    prisma = {
      user: {
        findUnique: vi.fn(),
        create: vi.fn(),
      },
    };
    jwt = {
      sign: vi.fn(),
    };
    service = new AuthService(prisma as any, jwt as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should throw ConflictException if user already exists', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: '1' });
      await expect(service.register({ email: 'test@example.com', password: 'password', name: 'Test' })).rejects.toThrow(ConflictException);
    });

    it('should hash password and create a user', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({ id: '1', email: 'test@example.com' });
      jwt.sign.mockReturnValue('token');

      const result = await service.register({ email: 'test@example.com', password: 'password', name: 'Test' });

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email: 'test@example.com',
          name: 'Test',
        }),
      });
      expect(result).toEqual({ user: { id: '1', email: 'test@example.com' }, token: 'token' });
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedException if user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(service.login({ email: 'test@example.com', password: 'password' })).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password does not match', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: '1', passwordHash: 'hashed_password' });
      (bcrypt.compare as any).mockResolvedValueOnce(false);
      
      await expect(service.login({ email: 'test@example.com', password: 'wrong' })).rejects.toThrow(UnauthorizedException);
    });

    it('should return a token if login is successful', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: '1', email: 'test@example.com', passwordHash: 'hashed_password' });
      (bcrypt.compare as any).mockResolvedValueOnce(true);
      jwt.sign.mockReturnValue('token');

      const result = await service.login({ email: 'test@example.com', password: 'password' });

      expect(result).toEqual({ user: { id: '1', email: 'test@example.com' }, token: 'token' });
    });
  });
});
