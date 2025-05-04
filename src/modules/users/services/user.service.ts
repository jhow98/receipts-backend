import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'
import { UserRepository } from '../repositories/user.repository'
import { UserDto } from '../dto/user.dto'
import { UserResponseDto } from '../dto/user-response.dto'
import { AppLogger } from '../../../common/logger/logger.service'
import bcrypt from 'bcrypt'
import { User } from '../entities/user.entity'

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly logger: AppLogger,
  ) {}

  async create(userDto: UserDto): Promise<UserResponseDto> {
    this.logger.log(`Criando usuário com dados: ${JSON.stringify(userDto)}`)
    const hashedPassword = await bcrypt.hash(userDto.password, 10)
    const user = new User()
    user.name = userDto.name
    user.login = userDto.login
    user.password = hashedPassword

    let saved
    try {
      saved = await this.userRepository.create(user)
    } catch (err: any) {
      if (err.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Login já existe.')
      }
      throw err
    }

    this.logger.log(`Usuário criado com ID ${saved.id}`)
    const { password, ...result } = saved
    return result as UserResponseDto
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.findAll()
  }

  async findById(id: number): Promise<User> {
    const user = await this.userRepository.findById(id)
    if (!user) {
      this.logger.warn(`Usuário com ID ${id} não encontrado`)
      throw new NotFoundException('Usuário não encontrado')
    }
    return user
  }

  async findByLogin(login: string): Promise<User | null> {
    return (await this.userRepository.findByLogin(login)) ?? null
  }

  async delete(id: number): Promise<void> {
    const user = await this.userRepository.findById(id)
    if (!user) {
      this.logger.warn(`Usuário com ID ${id} não encontrado para exclusão`)
      throw new NotFoundException('Usuário não encontrado')
    }
    await this.userRepository.delete(id)
    this.logger.log(`Usuário com ID ${id} excluído com sucesso`)
  }
}
