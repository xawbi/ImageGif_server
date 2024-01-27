import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { CreateCommentDto } from './dto/create-comment.dto'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { CommentEntity } from './entities/comment.entity'
import { FileEntity } from '../files/entities/file.entity'

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(CommentEntity)
    private commentEntityRepository: Repository<CommentEntity>,
    @InjectRepository(FileEntity)
    private fileEntityRepository: Repository<FileEntity>,
  ) {}

  async addComment(dto: CreateCommentDto, userId) {
    const file = await this.fileEntityRepository.findOne({
      where: { id: dto.fileId },
    })

    if (!file) {
      throw new NotFoundException(`File with id ${dto.fileId} not found`)
    }

    if (file.restricted !== 'public' || dto.text.length > 500) {
      throw new ForbiddenException(
        `You cannot comment on a file with restricted access`,
      )
    }

    const normalizedText = dto.text.replace(/(\r?\n){2,}/g, '\n')

    const parentComment = dto.parentCommentId
      ? await this.commentEntityRepository.findOne({
          where: { id: dto.parentCommentId },
          relations: ['file'],
        })
      : null

    if (parentComment && parentComment.file.id !== +dto.fileId) {
      throw new ForbiddenException(
        `You cannot reply to a comment from a different file`,
      )
    }

    const newComment = this.commentEntityRepository.create({
      text: normalizedText,
      file: { id: dto.fileId },
      user: userId,
      parentComment,
    })

    return this.commentEntityRepository.save(newComment)
  }

  async deleteComment(id: string) {
    const qb = this.commentEntityRepository.createQueryBuilder('comment')

    const comment = qb.where('id = :id', {
      id: id,
    })

    if (comment === undefined) {
      throw new NotFoundException('Comment not found')
    }

    await qb.delete().execute()
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
