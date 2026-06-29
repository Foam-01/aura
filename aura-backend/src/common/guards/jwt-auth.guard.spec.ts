import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let jwtService: { verify: ReturnType<typeof jest.fn> };

  beforeEach(() => {
    jwtService = { verify: jest.fn() };
    guard = new JwtAuthGuard(jwtService as unknown as JwtService);
  });

  it('allows a valid bearer token', () => {
    jwtService.verify.mockReturnValue({ sub: 1, user: 'admin', level: '9' });

    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: { authorization: 'Bearer valid-token' },
        }),
      }),
    } as ExecutionContext;

    expect(guard.canActivate(context)).toBe(true);
  });

  it('accepts a valid bearer token from a capitalized authorization header', () => {
    jwtService.verify.mockReturnValue({ sub: 2, user: 'viewer', level: '3' });

    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: { Authorization: 'Bearer valid-token' },
        }),
      }),
    } as ExecutionContext;

    expect(guard.canActivate(context)).toBe(true);
  });

  it('throws when the token is missing', () => {
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({ headers: {} }),
      }),
    } as ExecutionContext;

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });
});
