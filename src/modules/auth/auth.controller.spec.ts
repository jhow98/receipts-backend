import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let service: Partial<Record<keyof AuthService, jest.Mock>>;

  beforeEach(async () => {
    service = {
      validateUser: jest.fn(),
      login: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: service }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should return access_token if credentials are valid', async () => {
    const user = { id: 1, login: 'test' };
    service.validateUser!.mockResolvedValue(user);
    service.login!.mockResolvedValue({ access_token: 'token' });

    const result = await controller.login({ login: 'test', password: '1234' });
    expect(result).toEqual({ access_token: 'token' });
  });

  it('should throw UnauthorizedException for invalid credentials', async () => {
    service.validateUser!.mockResolvedValue(null);

    await expect(controller.login({ login: 'test', password: 'wrong' })).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
