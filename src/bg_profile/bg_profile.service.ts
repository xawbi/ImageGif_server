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

  create(file: Express.Multer.File, userId: number) {
    const avatar = new Bg_profileEntity()
    avatar.fileName = file.filename
    avatar.originalName = file.originalname
    avatar.size = file.size
    avatar.mimetype = file.mimetype
    avatar.user = { id: userId }

    return this.bgProfileRepository
      .find({ where: { user: { id: userId } } })
      .then(existingAvatars => {
        if (existingAvatars.length > 0) {
          const existingAvatar = existingAvatars[0]
          // Обновление аватарки
          existingAvatar.fileName = avatar.fileName
          existingAvatar.originalName = avatar.originalName
          existingAvatar.size = avatar.size
          existingAvatar.mimetype = avatar.mimetype
          return this.bgProfileRepository.save(existingAvatar)
        } else {
          // Создание новой аватарки
          return this.bgProfileRepository.save(avatar)
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
