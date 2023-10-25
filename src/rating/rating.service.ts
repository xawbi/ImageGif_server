import { Injectable } from '@nestjs/common'
import {
  RatingEntity,
  TargetTypeEnum,
  TypeEnum,
} from './entities/rating.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { CreateRatingDto } from './dto/create-rating.dto'

@Injectable()
export class RatingService {
  constructor(
    @InjectRepository(RatingEntity)
    private ratingEntityRepository: Repository<RatingEntity>,
  ) {}

  async createRating(userId: number, dto: CreateRatingDto) {
    let existingRating
    if (dto.targetType === TargetTypeEnum.FILE) {
      existingRating = await this.ratingEntityRepository.findOne({
        where: {
          user: { id: userId },
          file: { id: dto.targetId },
          targetType: dto.targetType,
        },
      })
    } else {
      existingRating = await this.ratingEntityRepository.findOne({
        where: {
          user: { id: userId },
          comment: { id: dto.targetId },
          targetType: dto.targetType,
        },
      })
    }

    if (existingRating) {
      // Проверка на повторное действие пользователя
      if (
        (existingRating.like === 1 && dto.type === TypeEnum.LIKE) ||
        (existingRating.dislike === 1 && dto.type === TypeEnum.DISLIKE)
      ) {
        // Пользователь повторно выполнил то же самое действие, уберем его
        existingRating.like = 0
        existingRating.dislike = 0
      } else {
        // Пользователь сделал новое действие, обновим его
        existingRating.like = dto.type === TypeEnum.LIKE ? 1 : 0
        existingRating.dislike = dto.type === TypeEnum.DISLIKE ? 1 : 0
      }
      return this.ratingEntityRepository.save(existingRating)
    } else {
      const likeValue = dto.type === 'like' ? 1 : 0
      const dislikeValue = dto.type === 'dislike' ? 1 : 0
      const targetTypeValue =
        dto.targetType === TargetTypeEnum.FILE
          ? TargetTypeEnum.FILE
          : TargetTypeEnum.COMMENT
      const targetIdFile =
        dto.targetType === TargetTypeEnum.FILE ? dto.targetId : null
      const targetIdComment =
        dto.targetType === TargetTypeEnum.COMMENT ? dto.targetId : null

      // Запись не существует, создайте новую
      const newRating = this.ratingEntityRepository.create({
        targetType: targetTypeValue,
        user: { id: userId },
        file: { id: targetIdFile },
        comment: { id: targetIdComment },
        like: likeValue,
        dislike: dislikeValue,
      })

      return this.ratingEntityRepository.save(newRating)
    }
  }
}
