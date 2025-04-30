import { Injectable } from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';
import { CreateUserDto } from '../dto/create-user.dto';
import { User } from '../entities/user.entity';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = new User();
    user.name = createUserDto.name;
    user.login = createUserDto.login;
    user.password = createUserDto.password;
    return await this.userRepository.create(user);
  }

  async findAll(): Promise<User[]> {
    return await this.userRepository.findAll();
  }

  async findById(id: number): Promise<User | null> {
    return await this.userRepository.findById(id);
  }
}
