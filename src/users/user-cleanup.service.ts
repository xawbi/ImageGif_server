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

  @Cron('0 0 * * 0')
  async removeInactiveUsers() {
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    await this.repository.delete({
      isEmailConfirmed: false,
      createAt: LessThan(oneWeekAgo),
    })
  }

  @Cron('0 0 * * *')
  async clearOldResetTokens() {
    const oneDayAgo = new Date()
    oneDayAgo.setDate(oneDayAgo.getDay() - 1)

    const usersToUpdate = await this.repository.find({
      where: {
        lastPasswordResetEmailSent: LessThan(oneDayAgo),
      },
    })

    for (const user of usersToUpdate) {
      user.lastPasswordResetEmailSent = null
      user.newPasswordToken = null
      await this.repository.save(user)
    }
  }
}
