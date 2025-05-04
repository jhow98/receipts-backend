import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from '../entities/user.entity'

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async create(user: User): Promise<User> {
    const newUser = this.userRepo.create(user)
    return this.userRepo.save(newUser)
  }

  async findAll(): Promise<User[]> {
    return this.userRepo.find()
  }

  async findById(id: number): Promise<User | null> {
    return this.userRepo.findOne({ where: { id } })
  }

  async findByLogin(login: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { login } })
  }

  async delete(id: number): Promise<void> {
    await this.userRepo.delete(id)
  }
}
