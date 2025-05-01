import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../users/services/user.service';
import bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let userService: Partial<Record<keyof UserService, jest.Mock>>;
  let jwtService: Partial<Record<keyof JwtService, jest.Mock>>;

  beforeEach(async () => {
    userService = {
      findByLogin: jest.fn(),
    };
    jwtService = {
      sign: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: userService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  const uniqueLogin = `usuario.e2e.${Date.now()}`;


  it('should validate a user with correct credentials', async () => {
    const user = { id: 1, uniqueLogin, password: await bcrypt.hash('1234', 10) };
    userService.findByLogin!.mockResolvedValue(user);

    const result = await service.validateUser(uniqueLogin, '1234');
    expect(result).toHaveProperty('id', 1);
    expect(result).not.toHaveProperty('password');
  });

  it('should return null with incorrect credentials', async () => {
    const user = { id: 1, uniqueLogin, password: await bcrypt.hash('wrong', 10) };
    userService.findByLogin!.mockResolvedValue(user);

    const result = await service.validateUser(uniqueLogin, '1234');
    expect(result).toBeNull();
  });

  it('should sign a JWT token', async () => {
    const user = { id: 1, uniqueLogin };
    jwtService.sign!.mockReturnValue('mock-token');

    const result = await service.login(user as any);
    expect(result.access_token).toBe('mock-token');
  });
});
