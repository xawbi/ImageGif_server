import { Module } from '@nestjs/common'
import { CommentsService } from './comments.service'
import { CommentsController } from './comments.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CommentEntity } from './entities/comment.entity'
import { FileEntity } from '../files/entities/file.entity'

@Module({
  imports: [TypeOrmModule.forFeature([CommentEntity, FileEntity])],
  controllers: [CommentsController],
  providers: [CommentsService],
})
export class CommentsModule {}
