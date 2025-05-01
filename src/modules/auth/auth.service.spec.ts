import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: Repository<User>;
  let jwtService: JwtService;

  beforeEach(async () => {
    const mockUserRepository = {
      findOne: jest.fn(),
    };

    const mockJwtService = {
      signAsync: jest.fn().mockReturnValue('fake-jwt-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should validate a user with correct credentials', async () => {
    const user = new User();
    user.id = 1;
    user.login = 'usuario.med';
    user.name = 'Dra. Helena';
    user.password = await bcrypt.hash('senha123', 10);

    jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);

    const result = await service.validateUser('usuario.med', 'senha123');
    expect(result).toBeDefined();
    expect(result?.id).toBe(1);
  });

  it('should return null with incorrect password', async () => {
    const user = new User();
    user.password = await bcrypt.hash('senhaErrada', 10);

    jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);

    const result = await service.validateUser('usuario.med', 'senhaIncorreta');
    expect(result).toBeNull();
  });

  it('should sign a JWT token', async () => {
    const user = new User();
    user.id = 1;
    user.login = 'usuario.med';
    user.name = 'Dra. Helena';

    const result = await service.login(user);
    expect(jwtService.signAsync).toHaveBeenCalledWith({ sub: 1, login: 'usuario.med' });
    expect(result).toEqual({ access_token: 'fake-jwt-token' });
  });
});
