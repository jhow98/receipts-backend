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
  ) {
    this.logger.log(UserService.name);
  }

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
        this.logger.warn(`Conflito ao criar usuário, login existe: ${userDto.login}`)
        throw new ConflictException('Login já existe.')
      }
      this.logger.error('Erro inesperado ao criar usuário', err.stack)
      throw err
    }

    this.logger.log(`Usuário criado com ID ${saved.id}`)
    const { password, ...result } = saved
    return result as UserResponseDto
  }

  async findAll(): Promise<User[]> {
    this.logger.log('Listando todos os usuários')
    const list = await this.userRepository.findAll()
    this.logger.log(`Total de usuários encontrados: ${list.length}`)
    return list
  }

  async findById(id: number): Promise<User> {
    this.logger.log(`Buscando usuário com ID ${id}`)
    const user = await this.userRepository.findById(id)
    if (!user) {
      this.logger.warn(`Usuário com ID ${id} não encontrado`)
      throw new NotFoundException('Usuário não encontrado')
    }
    this.logger.log(`Usuário com ID ${id} encontrado`)
    return user
  }

  async findByLogin(login: string): Promise<User | null> {
    this.logger.log(`Buscando usuário pelo login: ${login}`)
    const user = await this.userRepository.findByLogin(login)
    if (!user) {
      this.logger.log(`Nenhum usuário encontrado para login: ${login}`)
      return null
    }
    this.logger.log(`Usuário encontrado para login: ${login}`)
    return user
  }

  async delete(id: number): Promise<void> {
    this.logger.log(`Solicitando exclusão do usuário ID ${id}`)
    const user = await this.userRepository.findById(id)
    if (!user) {
      this.logger.warn(`Usuário com ID ${id} não encontrado para exclusão`)
      throw new NotFoundException('Usuário não encontrado')
    }
    await this.userRepository.delete(id)
    this.logger.log(`Usuário com ID ${id} excluído com sucesso`)
  }
}