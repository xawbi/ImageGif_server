import { Injectable, NotFoundException } from '@nestjs/common'
import { CreateUserDto } from './dto/create-user.dto'
import { InjectRepository } from '@nestjs/typeorm'
import { UserEntity } from './entities/user.entity'
import { Repository } from 'typeorm'
import * as bcrypt from 'bcrypt'

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private repository: Repository<UserEntity>,
  ) {}

  async findByEmail(email: string) {
    return this.repository.findOneBy({
      email,
    })
  }

  findById(id: number) {
    return this.repository.findOneBy({
      id,
    })
  }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10
    const salt = await bcrypt.genSalt(saltRounds)
    return await bcrypt.hash(password, salt)
  }

  async create(dto: CreateUserDto, activationCode: string) {
    dto.password = await this.hashPassword(dto.password)
    dto.activationCode = activationCode
    return await this.repository.save(dto)
  }

  async update(dto: CreateUserDto, email: string) {
    const user = await this.repository.findOneBy({
      email,
    })
    if (!user) {
      throw new NotFoundException('Пользователь не найден')
    }

    user.isEmailConfirmed = true
    await this.repository.update(user.id, user)
  }
}
