import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UserRepository } from '../repositories/user.repository';
import { User } from '../entities/user.entity';

describe('UserService', () => {
  let service: UserService;
  let userRepository: {
    create: jest.Mock;
    findAll: jest.Mock;
    findById: jest.Mock;
  };

  beforeEach(async () => {
    userRepository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: UserRepository, useValue: userRepository },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should create a user', async () => {
    const userDto = { name: 'John', login: 'john123', password: 'securepass' };
    const createdUser: User = { id: 1, ...userDto, createdAt: new Date(), updatedAt: new Date(), recipes: [] };

    userRepository.create.mockResolvedValue(createdUser);

    const result = await service.create(userDto);
    expect(result).toEqual(createdUser);
    expect(userRepository.create).toHaveBeenCalledWith(expect.objectContaining(userDto));
  });

  it('should return all users', async () => {
    const users: User[] = [
      { id: 1, name: 'John', login: 'john123', password: 'securepass', createdAt: new Date(), updatedAt: new Date(), recipes: [] },
    ];

    userRepository.findAll.mockResolvedValue(users);

    const result = await service.findAll();
    expect(result).toEqual(users);
    expect(userRepository.findAll).toHaveBeenCalled();
  });

  it('should return a user by ID', async () => {
    const user: User = { id: 1, name: 'John', login: 'john123', password: 'securepass', createdAt: new Date(), updatedAt: new Date(), recipes: [] };

    userRepository.findById.mockResolvedValue(user);

    const result = await service.findById(1);
    expect(result).toEqual(user);
    expect(userRepository.findById).toHaveBeenCalledWith(1);
  });

  it('should return null if user not found', async () => {
    userRepository.findById.mockResolvedValue(null);

    const result = await service.findById(999);
    expect(result).toBeNull();
    expect(userRepository.findById).toHaveBeenCalledWith(999);
  });
});
