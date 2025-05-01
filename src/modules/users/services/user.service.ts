import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';
import { UserDto } from '../dto/user.dto';
import { User } from '../entities/user.entity';
import { AppLogger } from '../../../common/logger/logger.service';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly logger: AppLogger,
  ) {}

  async create(userDto: UserDto): Promise<User> {
    this.logger.log(`Criando usuário com dados: ${JSON.stringify(userDto)}`);
    const user = new User();
    user.name = userDto.name;
    user.login = userDto.login;
    user.password = userDto.password;
    const saved = await this.userRepository.create(user);
    this.logger.log(`Usuário criado com ID ${saved.id}`);
    return saved;
  }

  async findAll(): Promise<User[]> {
    return await this.userRepository.findAll();
  }

  async findById(id: number): Promise<User | null> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      this.logger.warn(`Usuário com ID ${id} não encontrado`);
      throw new NotFoundException('Usuário não encontrado');
    }
    return user;
  }

  async delete(id: number): Promise<void> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      this.logger.warn(`Usuário com ID ${id} não encontrado para exclusão`);
      throw new NotFoundException('Usuário não encontrado');
    }

    await this.userRepository.delete(id);
    this.logger.log(`Usuário com ID ${id} excluído com sucesso`);
  }
}
