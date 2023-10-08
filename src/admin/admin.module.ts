import { Module } from '@nestjs/common'
import { AdminService } from './admin.service'
import { AdminController } from './admin.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserEntity } from '../users/entities/user.entity'
import { FileEntity } from '../files/entities/file.entity'
import { CommentEntity } from '../comments/entities/comment.entity'

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, FileEntity, CommentEntity])],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
