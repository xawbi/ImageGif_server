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

  create(file: Express.Multer.File, userId: number, dto: CreateAvatarDto) {
    const avatar = new AvatarEntity()
    avatar.fileName = file.filename
    avatar.originalName = file.originalname
    avatar.size = file.size
    avatar.mimetype = file.mimetype
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
          existingAvatar.originalName = avatar.originalName
          existingAvatar.size = avatar.size
          existingAvatar.mimetype = avatar.mimetype
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

  async findAll(userId: number) {
    const qb = this.avatarRepository.createQueryBuilder('avatar')

    qb.leftJoinAndSelect('avatar.user', 'user')

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
