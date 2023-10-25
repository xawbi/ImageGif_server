import { TargetTypeEnum, TypeEnum } from '../entities/rating.entity'

export class CreateRatingDto {
  targetType: TargetTypeEnum
  type: TypeEnum
  targetId: number
  // fileId?: number
  // commentId?: number
}
