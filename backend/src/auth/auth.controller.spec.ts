import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { vi } from 'vitest';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  const mockAuthService = {
    register: vi.fn(),
    login: vi.fn(),
  };

  beforeEach(() => {
    controller = new AuthController(mockAuthService as unknown as AuthService);
    service = mockAuthService as unknown as AuthService;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should call authService.register and return the result', async () => {
      const dto = { email: 'test@example.com', password: 'password', name: 'Test' };
      const result = { user: { id: '1', email: 'test@example.com' } as any, token: 'token' };
      vi.spyOn(service, 'register').mockResolvedValue(result);

      expect(await controller.register(dto)).toEqual(result);
      expect(service.register).toHaveBeenCalledWith(dto);
    });
  });

  describe('login', () => {
    it('should call authService.login and return the result', async () => {
      const dto = { email: 'test@example.com', password: 'password' };
      const result = { user: { id: '1', email: 'test@example.com' } as any, token: 'token' };
      vi.spyOn(service, 'login').mockResolvedValue(result);

      expect(await controller.login(dto)).toEqual(result);
      expect(service.login).toHaveBeenCalledWith(dto);
    });
  });
});
