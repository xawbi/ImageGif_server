import { Injectable, NotFoundException } from '@nestjs/common'
import { FileEntity, FileSort, FileType } from './entities/file.entity'
import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import * as fs from 'fs'
import { CreateFileDto } from './dto/create-file.dto'

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(FileEntity)
    private repository: Repository<FileEntity>,
  ) {}

  async getUserFiles(
    userId: number,
    fileType: FileType,
    fileSort: FileSort,
    page: number,
    per_page: number,
  ) {
    const offset = (+page - 1) * +per_page
    const qb = this.repository.createQueryBuilder('file')
    qb.where('file.userId = :userId', { userId })
      .leftJoin('file.user', 'user')
      .addSelect(['user.id', 'user.username', 'user.role'])
    if (fileType === FileType.PHOTOS) {
      qb.andWhere('file.fileName NOT LIKE :extensions', {
        extensions: `%gif`,
      })
    } else if (fileType === FileType.GIFS) {
      qb.andWhere('file.fileName LIKE :extensions', {
        extensions: `%gif`,
      })
    } else if (fileType === FileType.SENT) {
      qb.andWhere('file.restricted IN (:...restricted)', {
        restricted: ['pending'],
      })
    } else if (fileType === FileType.PUBLIC) {
      qb.andWhere('file.restricted IN (:...restricted)', {
        restricted: ['public'],
      })
    }
    fileSort === FileSort.OLDEST
      ? qb.orderBy('file.createAt', 'ASC')
      : qb.orderBy('file.createAt', 'DESC')
    return qb.skip(offset).take(+per_page).getMany()
  }

  async delete(userId: number, id: number) {
    const file = await this.repository.findOne({
      where: { id, user: { id: userId } },
      relations: ['comment'],
    })
    if (!file) {
      throw new NotFoundException('File not found')
    }
    const filePath = `uploads/${userId}/${file.fileName}`
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }
    await this.repository.delete({ id: id, user: { id: userId } })
  }

  async create(file: string, userId: number) {
    const fileParams = file.split(' ')
    return this.repository.save({
      fileName: fileParams[0],
      width: +fileParams[1],
      height: +fileParams[2],
      size: +fileParams[3],
      user: { id: userId },
    })
  }

  async updateRestricted(userId: number, id: string, dto: CreateFileDto) {
    const qb = this.repository.createQueryBuilder('file')
    const file = qb.where(
      'id = :id AND userId = :userId AND reject = :rejectPublic AND restricted = :restricted',
      {
        id,
        userId,
        rejectPublic: false,
        restricted: 'private',
      },
    )
    const normalizedPostName = dto.postName.replace(/\s+/g, ' ').trim()
    const normalizedDescription = dto.postDescription
      ? dto.postDescription.replace(/ {2,}|\n\n+/g, match =>
          match[0] === ' ' ? ' ' : '\n\n',
        )
      : null
    await file
      .update()
      .set({
        restricted: 'pending',
        restrictedUpdatedAt: new Date(),
        postName: normalizedPostName,
        postDescription: normalizedDescription,
      })
      .execute()
  }
}
