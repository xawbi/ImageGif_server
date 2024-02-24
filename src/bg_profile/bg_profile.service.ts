import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Bg_profileEntity } from './entities/bg_profile.entity'

@Injectable()
export class Bg_profileService {
  constructor(
    @InjectRepository(Bg_profileEntity)
    private bgProfileRepository: Repository<Bg_profileEntity>,
  ) {}

  async postBgId(userId: number) {
    let bgProfile = await this.bgProfileRepository.findOne({
      where: { user: { id: userId } },
    })

    if (!bgProfile) {
      bgProfile = this.bgProfileRepository.create({
        user: { id: userId },
      })
    } else {
      bgProfile.bgId += 1
      if (bgProfile.bgId > 14) {
        bgProfile.bgId = 0
      }
    }

    await this.bgProfileRepository.save(bgProfile)
  }

  async findBgId(userId: number) {
    const bgProfile = await this.bgProfileRepository
      .createQueryBuilder('bgProfile')
      .select('bgProfile.bgId', 'bgId')
      .where('bgProfile.user.id = :userId', { userId })
      .getRawOne()

    if (!bgProfile) {
      throw new NotFoundException(
        `Bg_profile for user with id ${userId} not found`,
      )
    }

    return bgProfile.bgId
  }
}
