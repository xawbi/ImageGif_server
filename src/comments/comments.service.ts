import { Injectable } from '@nestjs/common'
import { CreateCommentDto } from './dto/create-comment.dto'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { CommentEntity } from './entities/comment.entity'

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(CommentEntity)
    private commentEntityRepository: Repository<CommentEntity>,
  ) {}

  create(dto: CreateCommentDto, userId) {
    return this.commentEntityRepository.save({
      text: dto.text,
      file: { id: dto.fileId },
      user: userId,
    })
  }

  async addLike(id: string) {
    await this.commentEntityRepository
      .createQueryBuilder('file')
      .update()
      .set({ like: () => 'like + 1' })
      .where('id = :id', { id })
      .execute()
  }

  async addDislike(id: string) {
    await this.commentEntityRepository
      .createQueryBuilder('file')
      .update()
      .set({ dislike: () => 'dislike + 1' })
      .where('id = :id', { id })
      .execute()
  }

  async removeLike(id: string) {
    await this.commentEntityRepository
      .createQueryBuilder('file')
      .update()
      .set({ like: () => 'like - 1' })
      .where('id = :id', { id })
      .execute()
  }

  async removeDislike(id: string) {
    await this.commentEntityRepository
      .createQueryBuilder('file')
      .update()
      .set({ dislike: () => 'dislike - 1' })
      .where('id = :id', { id })
      .execute()
  }
}
