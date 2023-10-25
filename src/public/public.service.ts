import { Injectable, NotFoundException } from '@nestjs/common'
import { FileEntity, FileType } from '../files/entities/file.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { CommentEntity } from '../comments/entities/comment.entity'
import * as fs from 'fs'
import { RatingEntity } from '../rating/entities/rating.entity'

@Injectable()
export class PublicService {
  constructor(
    @InjectRepository(FileEntity)
    private fileEntityRepository: Repository<FileEntity>,
    @InjectRepository(CommentEntity)
    private commentEntityRepository: Repository<CommentEntity>,
    @InjectRepository(RatingEntity)
    private ratingEntityRepository: Repository<RatingEntity>,
  ) {}

  async getFiles(fileType: FileType) {
    const qb = this.fileEntityRepository.createQueryBuilder('file')

    qb.leftJoinAndSelect('file.user', 'user')
    qb.leftJoin('file.rating', 'rating').addSelect([
      'rating.like',
      'rating.dislike',
    ])

    qb.where('file.restricted = :restricted', { restricted: 'public' })

    if (fileType === FileType.PHOTOS) {
      qb.andWhere('file.mimetype IN (:...types)', {
        types: ['image/jpg', 'image/png', 'image/jpeg', 'image/webp'],
      })
    }

    if (fileType === FileType.GIFS) {
      qb.andWhere('file.mimetype IN (:...types)', {
        types: ['image/gif'],
      })
    }

    const files = await qb.getMany()

    files.map(file => {
      file.totalLike = file.rating.reduce((acc, rating) => acc + rating.like, 0)
      file.totalDislike = file.rating.reduce(
        (acc, rating) => acc + rating.dislike,
        0,
      )
    })

    return files
  }

  async getFileComments(id: number) {
    const comments = await this.commentEntityRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.user', 'user')
      .leftJoinAndSelect('user.avatar', 'avatar')
      .where('comment.file = :id', { id })
      .getMany()

    return comments || []
  }

  async getFileRating(id: number) {
    const { likeSum, dislikeSum } = await this.ratingEntityRepository
      .createQueryBuilder('rating')
      .select('SUM(rating.like)', 'likeSum')
      .addSelect('SUM(rating.dislike)', 'dislikeSum')
      .where('rating.fileId = :id', { id: id })
      .getRawOne()

    if (likeSum === null || dislikeSum === null) {
      throw new NotFoundException('File not found')
    }

    return { likeSum: parseInt(likeSum), dislikeSum: parseInt(dislikeSum) }
  }

  async getCommentRating(id: number) {
    const { likeSum, dislikeSum } = await this.ratingEntityRepository
      .createQueryBuilder('rating')
      .select('SUM(rating.like)', 'likeSum')
      .addSelect('SUM(rating.dislike)', 'dislikeSum')
      .where('rating.commentId = :id', { id: id })
      .getRawOne()

    if (likeSum === null || dislikeSum === null) {
      throw new NotFoundException('Comment not found')
    }

    return { likeSum: parseInt(likeSum), dislikeSum: parseInt(dislikeSum) }
  }

  async downloadFile(userId: string, fileName: string, res) {
    const filePath = `uploads/${userId}/${fileName}`

    if (!fs.existsSync(filePath)) {
      throw new Error('Файл не найден')
    }

    return res.download(filePath, fileName)
  }
}
