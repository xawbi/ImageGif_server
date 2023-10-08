import { Module } from '@nestjs/common'
import { PublicService } from './public.service'
import { PublicController } from './public.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserEntity } from '../users/entities/user.entity'
import { FileEntity } from '../files/entities/file.entity'
import { CommentEntity } from '../comments/entities/comment.entity'
import { RatingEntity } from '../rating/entities/rating.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      FileEntity,
      CommentEntity,
      RatingEntity,
    ]),
  ],
  controllers: [PublicController],
  providers: [PublicService],
})
export class PublicModule {}
