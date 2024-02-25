import { Injectable, NotFoundException } from '@nestjs/common'
import { FileEntity, FileSort, FileType } from '../files/entities/file.entity'
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

  async updateView(fileId: number) {
    const file = await this.fileEntityRepository.findOne({
      where: { id: fileId },
    })
    if (!file) {
      throw new NotFoundException(`File with id ${fileId} not found`)
    }
    file.views += 1
    await this.fileEntityRepository.save(file)
  }

  async getFiles(fileType: FileType, fileSort: FileSort) {
    const qbFile = this.fileEntityRepository.createQueryBuilder('file')

    qbFile.leftJoinAndSelect('file.user', 'user')
    qbFile
      .leftJoin('file.rating', 'rating')
      .addSelect(['rating.like', 'rating.dislike'])

    qbFile.where('file.restricted = :restricted', { restricted: 'public' })

    if (fileType === FileType.PHOTOS) {
      qbFile.andWhere('file.fileName LIKE :extensions', {
        extensions: `%webp`,
      })
    }

    if (fileType === FileType.GIFS) {
      qbFile.andWhere('file.fileName LIKE :extensions', {
        extensions: `%gif`,
      })
    }

    if (fileSort === FileSort.OLDEST) {
      qbFile.orderBy('file.restrictedUpdatedAt', 'ASC')
    } else if (fileSort === FileSort.NEWEST) {
      qbFile.orderBy('file.restrictedUpdatedAt', 'DESC')
    } else if (fileSort === FileSort.POPULAR) {
      qbFile.orderBy('file.views', 'DESC')
    } else if (fileSort === FileSort.RANDOM) {
      qbFile.orderBy('RANDOM()')
    } else {
      qbFile.orderBy('file.restrictedUpdatedAt', 'DESC')
    }

    return await qbFile
      .leftJoinAndSelect('file.rating', 'fileRating')
      .leftJoinAndSelect('fileRating.user', 'userRating')
      .leftJoinAndSelect('file.favorites', 'favorites')
      .leftJoinAndSelect('favorites.user', 'userFavorite')
      .leftJoinAndSelect('favorites.file', 'fileFavorite')
      .getMany()
  }

  async findFile(fileId: number) {
    const qbFile = this.fileEntityRepository.createQueryBuilder('file')

    if (!qbFile) {
      throw new NotFoundException(`File with id ${fileId} not found`)
    }

    return await qbFile
      .leftJoinAndSelect('file.user', 'user')
      .leftJoin('file.rating', 'rating')
      .addSelect(['rating.like', 'rating.dislike'])
      .where('file.id = :fileId', { fileId })
      .leftJoinAndSelect('file.rating', 'fileRating')
      .leftJoinAndSelect('fileRating.user', 'userRating')
      .leftJoinAndSelect('file.favorites', 'favorites')
      .leftJoinAndSelect('favorites.user', 'userFavorite')
      .leftJoinAndSelect('favorites.file', 'fileFavorite')
      .getOne()
  }

  async getFileComments(id: number, parentCommentId: number = null) {
    const comments = await this.commentEntityRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.user', 'user')
      .leftJoin('comment.rating', 'rating')
      .addSelect(['rating.like', 'rating.dislike'])
      .leftJoinAndSelect('comment.parentComment', 'parentComment')
      .leftJoinAndSelect('parentComment.user', 'parentCommentUser')
      .leftJoinAndSelect('user.avatar', 'avatar')
      .leftJoinAndSelect('comment.childComments', 'childComments')
      .leftJoinAndSelect('childComments.user', 'childUser')
      .leftJoinAndSelect('childUser.avatar', 'childAvatar')
      .leftJoinAndSelect('comment.rating', 'commentRating')
      .leftJoinAndSelect('commentRating.user', 'userRating')
      .where('comment.file = :id', { id })
      .andWhere(
        parentCommentId
          ? 'comment.parentComment = :parentId'
          : 'comment.parentComment IS NULL',
        {
          parentId: parentCommentId,
        },
      )
      .orderBy('comment.createAt', 'DESC')
      .getMany()

    await Promise.all(
      comments.map(async comment => {
        comment.childComments = await this.getFileComments(id, comment.id)
        comment.childCommentsCount = comment.childComments.length
      }),
    )

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

    res.download(filePath, fileName)
  }
}
