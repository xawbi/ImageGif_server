import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Bg_profileEntity } from './entities/bg_profile.entity'
import * as fs from 'fs'

@Injectable()
export class Bg_profileService {
  constructor(
    @InjectRepository(Bg_profileEntity)
    private bgProfileRepository: Repository<Bg_profileEntity>,
  ) {}

  create(file: string, userId: number) {
    const fileParams = file.split(' ')
    const bgProfile = new Bg_profileEntity()
    bgProfile.fileName = fileParams[0]
    bgProfile.size = +fileParams[1]
    bgProfile.user = { id: userId }

    return this.bgProfileRepository
      .find({ where: { user: { id: userId } } })
      .then(existingBgProfiles => {
        if (existingBgProfiles.length > 0) {
          const existingBgProfile = existingBgProfiles[0]
          existingBgProfile.fileName = bgProfile.fileName
          existingBgProfile.size = bgProfile.size
          return this.bgProfileRepository.save(existingBgProfile)
        } else {
          return this.bgProfileRepository.save(bgProfile)
        }
      })
  }

  findAll(userId: number) {
    return this.bgProfileRepository.findOne({
      where: { user: { id: userId } },
    })
  }

  async delete(userId: number, id: number) {
    const file = await this.bgProfileRepository.findOne({
      where: { id, user: { id: userId } },
    })
    if (!file) {
      throw new NotFoundException('File not found')
    }

    const filePath = `bgProfile/${userId}/${file.fileName}`
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }

    await this.bgProfileRepository.delete({ id: id, user: { id: userId } })
  }
}
