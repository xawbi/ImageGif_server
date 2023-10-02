import { Injectable } from '@nestjs/common'
import { LessThan, Repository } from 'typeorm'
import { UserEntity } from './entities/user.entity'
import { Cron } from '@nestjs/schedule'
import { InjectRepository } from '@nestjs/typeorm'

@Injectable()
export class UserCleanupService {
  constructor(
    @InjectRepository(UserEntity)
    private repository: Repository<UserEntity>,
  ) {}

  @Cron('0 0 * * 0') // Каждая неделя в воскресенье в полночь (00:00)
  async removeInactiveUsers() {
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    await this.repository.delete({
      isEmailConfirmed: false,
      createAt: LessThan(oneWeekAgo),
    })
  }
}
