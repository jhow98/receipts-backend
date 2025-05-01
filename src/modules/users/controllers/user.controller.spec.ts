import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from '../services/user.service';
import { UserDto } from '../dto/user.dto';
import { NotFoundException } from '@nestjs/common';
import { AppLogger } from '../../../common/logger/logger.service';

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

  const mockUserService = {
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
      controllers: [UserController],
      providers: [
        { provide: UserService, useValue: mockUserService },
        { provide: AppLogger, useValue: mockLogger },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
  });

  it('should create a user', async () => {
    const dto: UserDto = { name: 'John', login: 'john123', password: '123' };
    const resultMock = { id: 1, ...dto };
    mockUserService.create.mockResolvedValueOnce(resultMock);

    const result = await controller.create(dto);
    expect(result).toEqual(resultMock);
  });

  it('should return all users', async () => {
    const users = [{ id: 1, name: 'Alice', login: 'alice', password: '123' }];
    mockUserService.findAll.mockResolvedValueOnce(users);

    const result = await controller.findAll();
    expect(result).toEqual(users);
  });

  it('should return user by id', async () => {
    const user = { id: 1, name: 'Bob', login: 'bob', password: '123' };
    mockUserService.findById.mockResolvedValueOnce(user);

    const result = await controller.findById(1);
    expect(result).toEqual(user);
  });

  it('should call delete with correct ID', async () => {
    mockUserService.delete.mockResolvedValueOnce(undefined);
    await expect(controller.delete(1)).resolves.toBeUndefined();
    expect(service.delete).toHaveBeenCalledWith(1);
  });

  it('should throw NotFoundException when deleting nonexistent user', async () => {
    mockUserService.delete.mockRejectedValueOnce(new NotFoundException());
    await expect(controller.delete(999)).rejects.toThrow(NotFoundException);
  });
});
