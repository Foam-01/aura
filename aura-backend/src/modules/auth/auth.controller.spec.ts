import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: { login: jest.Mock; getInfo: jest.Mock };

  beforeEach(async () => {
    authService = {
      login: jest.fn(),
      getInfo: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('delegates login to auth service', async () => {
    authService.login.mockResolvedValue({ token: 'abc' });

    await expect(
      controller.login({ usr: 'admin', pwd: 'secret' } as any),
    ).resolves.toEqual({ token: 'abc' });
  });

  it('delegates info lookup to auth service', async () => {
    authService.getInfo.mockResolvedValue({ payload: { sub: 1 } });

    await expect(controller.info('Bearer token')).resolves.toEqual({
      payload: { sub: 1 },
    });
  });
});
