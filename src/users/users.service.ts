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
    private userRepository: Repository<UserEntity>,
  ) {}

  async findByEmail(email: string) {
    return this.userRepository.findOneBy({
      email,
    })
  }

  async findByToken(token: string) {
    return this.userRepository.findOneBy({
      newPasswordToken: token,
    })
  }

  async findById(id: number) {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.username',
        'user.role',
        'user.openFavorites',
        'user.ban',
      ])
      .where('user.id = :id', { id })
      .getOne()
    if (!user) {
      throw new Error('User not found')
    }
    return user
  }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10
    const salt = await bcrypt.genSalt(saltRounds)
    return await bcrypt.hash(password, salt)
  }

  async create(dto: CreateUserDto, activationCode: string) {
    let user = await this.userRepository.findOne({
      where: { email: dto.email },
    })

    if (user && user.isEmailConfirmed === false) {
      user.activationCode = activationCode
      user.password = await this.hashPassword(dto.password)
      user.username = dto.username
    } else {
      user = this.userRepository.create({
        ...dto,
        activationCode,
        password: await this.hashPassword(dto.password),
      })
    }

    return await this.userRepository.save(user)
  }

  async updateEmailConfirmed(email: string) {
    const user = await this.userRepository.findOneBy({
      email,
    })
    if (!user) {
      throw new NotFoundException('Пользователь не найден')
    }

    user.isEmailConfirmed = true
    await this.userRepository.update(user.id, user)
  }

  async updateNewPasswordToken(email: string, token: string) {
    const user = await this.userRepository.findOneBy({
      email,
    })
    if (!user) {
      throw new NotFoundException('Пользователь не найден')
    }

    user.lastPasswordResetEmailSent = new Date()
    user.newPasswordToken = token
    await this.userRepository.update(user.id, user)
  }

  async updatePassword(userId: number, newPassword: string) {
    const user = await this.userRepository.findOneBy({
      id: userId,
    })
    if (!user) {
      throw new NotFoundException('Пользователь не найден')
    }

    if (newPassword) user.password = await this.hashPassword(newPassword)
    user.lastPasswordResetEmailSent = null
    user.newPasswordToken = null
    await this.userRepository.update(user.id, user)
  }

  async updateTokenAndDate(userId: number) {
    const user = await this.userRepository.findOneBy({
      id: userId,
    })
    if (!user) {
      throw new NotFoundException('Пользователь не найден')
    }

    user.lastPasswordResetEmailSent = null
    user.newPasswordToken = null
    await this.userRepository.update(user.id, user)
  }
}
