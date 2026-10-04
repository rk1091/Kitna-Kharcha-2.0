import { describe, it, expect } from 'vitest';
import { UnauthorizedException, ExecutionContext } from '@nestjs/common';
import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';
import { CurrentUser } from './current-user.decorator';

function getParamDecoratorFactory(decorator: Function) {
  class Test {
    public test(@decorator() value: any) {}
  }

  const args = Reflect.getMetadata(ROUTE_ARGS_METADATA, Test, 'test');
  return args[Object.keys(args)[0]].factory;
}

describe('CurrentUser Decorator', () => {
  const factory = getParamDecoratorFactory(CurrentUser);

  it('should extract userId when request has user.id', () => {
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          user: { id: 'user-123' },
        }),
      }),
    } as unknown as ExecutionContext;

    const result = factory(null, mockContext);
    expect(result).toBe('user-123');
  });

  it('should throw UnauthorizedException when request has no user', () => {
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({}),
      }),
    } as unknown as ExecutionContext;

    expect(() => factory(null, mockContext)).toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException when request.user has no id', () => {
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({ user: {} }),
      }),
    } as unknown as ExecutionContext;

    expect(() => factory(null, mockContext)).toThrow(UnauthorizedException);
  });
});
