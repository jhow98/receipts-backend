import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UserRepository } from '../repositories/user.repository';
import { UserDto } from '../dto/user.dto';
import { NotFoundException } from '@nestjs/common';
import { AppLogger } from '../../../common/logger/logger.service';

describe('UserService', () => {
  let service: UserService;
  let repo: UserRepository;

  const mockRepo = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    delete: jest.fn(),
  };

  const mockLogger = {
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: UserRepository, useValue: mockRepo },
        { provide: AppLogger, useValue: mockLogger }
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repo = module.get<UserRepository>(UserRepository);
  });

  it('should create user', async () => {
    const dto: UserDto = { name: 'Alice', login: 'alice', password: 'secret' };
    const created = { id: 1, ...dto };

    mockRepo.create.mockResolvedValueOnce(created);
    const result = await service.create(dto);

    expect(result).toEqual(created);
    expect(repo.create).toHaveBeenCalledWith(expect.objectContaining(dto));
  });

  it('should return all users', async () => {
    const users = [{ id: 1, name: 'A', login: 'a', password: '123' }];
    mockRepo.findAll.mockResolvedValueOnce(users);

    const result = await service.findAll();
    expect(result).toEqual(users);
  });

  it('should return user by id', async () => {
    const user = { id: 1, name: 'Test', login: 'test', password: '123' };
    mockRepo.findById.mockResolvedValueOnce(user);

    const result = await service.findById(1);
    expect(result).toEqual(user);
  });

  it('should throw NotFoundException if user not found', async () => {
    mockRepo.findById.mockResolvedValue(null);
  
    await expect(service.findById(99)).rejects.toThrow(NotFoundException);
  });

  it('should delete user if exists', async () => {
    const user = { id: 1, name: 'X', login: 'x', password: '123' };
    mockRepo.findById.mockResolvedValueOnce(user);
    mockRepo.delete.mockResolvedValueOnce(undefined);

    await expect(service.delete(1)).resolves.toBeUndefined();
    expect(mockRepo.delete).toHaveBeenCalledWith(1);
  });

  it('should throw if trying to delete nonexistent user', async () => {
    mockRepo.findById.mockResolvedValueOnce(null);

    await expect(service.delete(999)).rejects.toThrow(NotFoundException);
  });
});
