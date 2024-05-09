import { Injectable, NotFoundException } from '@nestjs/common'
import { FileEntity, FileSort } from '../files/entities/file.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { CommentEntity } from '../comments/entities/comment.entity'
import * as fs from 'fs'
import { RatingEntity } from '../rating/entities/rating.entity'
import { shuffle } from 'lodash'

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

  async searchPosts(postNameAndDesc: string) {
    if (!postNameAndDesc.trim()) {
      return []
    }
    const searchTerms = postNameAndDesc.trim().split(/\s+/)
    const qbFile = this.fileEntityRepository.createQueryBuilder('file')
    qbFile.leftJoinAndSelect('file.user', 'user')
    qbFile.where('file.restricted = :restricted', { restricted: 'public' })
    for (const term of searchTerms) {
      qbFile.andWhere(
        '(file.postName ILIKE :searchTerm OR file.postDescription ILIKE :searchTerm)',
        { searchTerm: `%${term}%` },
      )
    }
    // Возвращаем результаты поиска
    return await qbFile.take(10).getMany()
  }

  async getFiles(userId, allType, fileSort, page, per_page) {
    const offset = (+page - 1) * +per_page

    const qbFile = this.fileEntityRepository.createQueryBuilder('file')

    qbFile
      .leftJoin('file.user', 'user')
      .addSelect(['user.id', 'user.username', 'user.role'])
      .leftJoin('file.rating', 'rating')
      .addSelect(['rating.like', 'rating.dislike'])

    if (userId) {
      qbFile.where('file.userId = :userId AND file.restricted = :restricted', {
        userId: userId,
        restricted: 'public',
      })
    } else {
      qbFile.where('file.restricted = :restricted', { restricted: 'public' })
    }

    if (fileSort === FileSort.OLDEST) {
      qbFile.orderBy('file.restrictedUpdatedAt', 'ASC')
    } else if (fileSort === FileSort.NEWEST) {
      qbFile.orderBy('file.restrictedUpdatedAt', 'DESC')
    } else if (fileSort === FileSort.POPULAR) {
      qbFile.orderBy('file.views', 'DESC')
    } else if (fileSort === FileSort.RANDOM) {
      qbFile.orderBy('RANDOM()')
    }

    const files = await qbFile
      .leftJoin('rating.user', 'userRating')
      .addSelect(['userRating.id', 'userRating.username', 'userRating.role'])
      .leftJoinAndSelect('file.favorites', 'favorites')
      .leftJoin('favorites.user', 'userFavorite')
      .addSelect([
        'userFavorite.id',
        'userFavorite.username',
        'userFavorite.role',
      ])
      .leftJoinAndSelect('favorites.file', 'fileFavorite')
      .getMany()

    if (allType === 'yes') {
      return files
    }

    const remainingItems = files.length - offset
    const itemsToShowOnLastPage = Math.min(per_page, remainingItems)
    return fileSort === FileSort.RANDOM
      ? shuffle(files).slice(offset, offset + itemsToShowOnLastPage)
      : files.slice(offset, offset + itemsToShowOnLastPage)
  }

  async findFile(fileId: number) {
    const qbFile = this.fileEntityRepository.createQueryBuilder('file')
    const file = await qbFile
      .leftJoin('file.user', 'user')
      .addSelect(['user.id', 'user.username', 'user.role'])
      .leftJoin('file.rating', 'fileRating')
      .addSelect(['fileRating.like', 'fileRating.dislike'])
      .where('file.id = :fileId', { fileId })
      .leftJoinAndSelect('fileRating.user', 'userRating')
      .leftJoinAndSelect('user.avatar', 'avatar')
      .leftJoin('avatar.user', 'userAvatar')
      .addSelect(['userAvatar.id', 'userAvatar.username', 'userAvatar.role'])
      .leftJoinAndSelect('file.favorites', 'favorites')
      .leftJoinAndSelect('favorites.user', 'userFavorite')
      .addSelect([
        'userFavorite.id',
        'userFavorite.username',
        'userFavorite.role',
      ])
      .leftJoinAndSelect('favorites.file', 'fileFavorite')
      .getOne()
    if (!file) {
      throw new NotFoundException(`File with id ${fileId} not found`)
    }
    return file
  }

  async getFileComments(
    id: number,
    page: number,
    per_page: number,
    parentCommentId: number = null,
  ) {
    const offset = (+page - 1) * +per_page
    const qb = await this.commentEntityRepository
      .createQueryBuilder('comment')
      .leftJoin('comment.user', 'user')
      .addSelect(['user.id', 'user.username', 'user.role'])
      .leftJoin('comment.rating', 'rating')
      .addSelect(['rating.like', 'rating.dislike'])
      .leftJoinAndSelect('comment.parentComment', 'parentComment')
      .leftJoin('parentComment.user', 'parentCommentUser')
      .addSelect([
        'parentCommentUser.id',
        'parentCommentUser.username',
        'parentCommentUser.role',
      ])
      .leftJoinAndSelect('user.avatar', 'avatar')
      .leftJoin('avatar.user', 'userAvatar')
      .addSelect(['userAvatar.id', 'userAvatar.username', 'userAvatar.role'])
      .leftJoinAndSelect('comment.childComments', 'childComments')
      .leftJoin('childComments.user', 'childUser')
      .addSelect(['childUser.id', 'childUser.username', 'childUser.role'])
      .leftJoinAndSelect('childUser.avatar', 'childAvatar')
      .leftJoinAndSelect('comment.rating', 'commentRating')
      .leftJoin('commentRating.user', 'userRating')
      .addSelect(['userRating.id', 'userRating.username', 'userRating.role'])
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

    if (parentCommentId === null) {
      qb.skip(offset).take(+per_page)
    }

    const comments = await qb.getMany()

    await Promise.all(
      comments.map(async comment => {
        comment.childComments = await this.getFileComments(
          id,
          page,
          per_page,
          comment.id,
        )
        comment.childCommentsCount = comment.childComments.length
      }),
    )

    return comments || []
  }

  async getFileCommentsLength(id: number) {
    const comments = await this.commentEntityRepository
      .createQueryBuilder('comment')
      .where('comment.file = :id', { id })
      .getMany()

    const mainComments = await this.commentEntityRepository
      .createQueryBuilder('comment')
      .where('comment.file = :id AND comment.parentCommentId IS NULL', { id })
      .getMany()

    return {
      totalComments: comments.length,
      totalMainComments: mainComments.length,
    }
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
