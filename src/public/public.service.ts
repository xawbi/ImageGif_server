import { Injectable } from '@nestjs/common'
import { FileEntity, FileType } from '../files/entities/file.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { CommentEntity } from '../comments/entities/comment.entity'
import * as fs from 'fs'

@Injectable()
export class PublicService {
  constructor(
    @InjectRepository(FileEntity)
    private fileEntityRepository: Repository<FileEntity>,
    @InjectRepository(CommentEntity)
    private commentEntityRepository: Repository<CommentEntity>,
  ) {}

  findAll(fileType: FileType) {
    const qb = this.fileEntityRepository.createQueryBuilder('file')

    qb.leftJoinAndSelect('file.user', 'user')

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

    qb.orderBy('file.restrictedUpdatedAt', 'DESC')

    return qb.getMany()
  }

  async getFileLikes(id: number) {
    const file = await this.fileEntityRepository.findOne({ where: { id } })
    if (!file) {
      return null
    }
    return file.like
  }

  async getFileDislikes(id: number) {
    const file = await this.fileEntityRepository.findOne({ where: { id } })
    if (!file) {
      return null
    }
    return file.dislike
  }

  async getCommentLikes(id: number) {
    const comment = await this.commentEntityRepository.findOne({
      where: { id },
    })
    if (!comment) {
      return null
    }
    return comment.like
  }

  async getCommentDislikes(id: number) {
    const comment = await this.commentEntityRepository.findOne({
      where: { id },
    })
    if (!comment) {
      return null
    }
    return comment.dislike
  }

  async downloadFile(userId: string, fileName: string, res) {
    const filePath = `uploads/${userId}/${fileName}`
    console.log(filePath)

    if (!fs.existsSync(filePath)) {
      throw new Error('Файл не найден')
    }

    return res.download(filePath, fileName)
  }
}
