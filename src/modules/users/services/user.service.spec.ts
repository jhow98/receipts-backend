import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UserRepository } from '../repositories/user.repository';
import { AppLogger } from '../../../common/logger/logger.service';
import { UserDto } from '../dto/user.dto';
import bcrypt from 'bcrypt';

describe('UserService', () => {
  let service: UserService;
  let userRepository: Partial<Record<keyof UserRepository, jest.Mock>>;
  let logger: Partial<AppLogger>;

  beforeEach(async () => {
    userRepository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      findByLogin: jest.fn(),
      delete: jest.fn(),
    };

    logger = {
      log: jest.fn(),
      warn: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: UserRepository, useValue: userRepository },
        { provide: AppLogger, useValue: logger },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should create user', async () => {
    const dto: UserDto = { name: 'Alice', login: 'alice', password: 'secret' };
    const hashed = await bcrypt.hash(dto.password, 10);
    const created = {
      id: 1,
      name: dto.name,
      login: dto.login,
      password: hashed,
      createdAt: new Date(),
      updatedAt: new Date(),
      recipes: [],
    };

    userRepository.create!.mockResolvedValue(created);

    const result = await service.create(dto);

    expect(result).toMatchObject({
      id: created.id,
      name: created.name,
      login: created.login,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
    });

    expect(userRepository.create).toHaveBeenCalledWith(expect.any(Object));
  });
});
