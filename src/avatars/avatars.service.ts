import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { AvatarEntity } from './entities/avatar.entity'
import * as fs from 'fs'
import { CreateAvatarDto } from './dto/create-avatar.dto'

@Injectable()
export class AvatarsService {
  constructor(
    @InjectRepository(AvatarEntity)
    private avatarRepository: Repository<AvatarEntity>,
  ) {}

  postAvatar(file: string, userId: number, dto: CreateAvatarDto) {
    const fileParams = file.split(' ')
    const avatar = new AvatarEntity()
    avatar.fileName = fileParams[0]
    avatar.size = +fileParams[1]
    avatar.user = { id: userId }
    avatar.x = dto.x
    avatar.y = dto.y
    avatar.width = dto.width
    avatar.height = dto.height

    return this.avatarRepository
      .find({ where: { user: { id: userId } } })
      .then(existingAvatars => {
        if (existingAvatars.length > 0) {
          const existingAvatar = existingAvatars[0]
          // Обновление аватарки
          existingAvatar.fileName = avatar.fileName
          existingAvatar.size = avatar.size
          existingAvatar.user = { id: userId }
          existingAvatar.x = dto.x
          existingAvatar.y = dto.y
          existingAvatar.width = dto.width
          existingAvatar.height = dto.height
          return this.avatarRepository.save(existingAvatar)
        } else {
          // Создание новой аватарки
          return this.avatarRepository.save(avatar)
        }
      })
  }

  async getAvatar(userId: number) {
    const qb = this.avatarRepository.createQueryBuilder('avatar')

    qb.leftJoin('avatar.user', 'user').addSelect([
      'user.id',
      'user.username',
      'user.role',
    ])

    qb.where('avatar.userId = :userId', { userId })

    qb.select(['avatar', 'user.id'])

    const result = await qb.getOne()

    if (!result) {
      throw new NotFoundException('Avatar not found') // Выбрасываем исключение, если данные отсутствуют
    } else return result
  }

  async delete(userId: number, id: number) {
    const file = await this.avatarRepository.findOne({
      where: { id, user: { id: userId } },
    })
    if (!file) {
      throw new NotFoundException('File not found')
    }

    const filePath = `avatars/${userId}/${file.fileName}`
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }

    await this.avatarRepository.delete({ id: id, user: { id: userId } })
  }
}
