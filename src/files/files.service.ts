import { Injectable, NotFoundException } from '@nestjs/common'
import { FileEntity, FileType } from './entities/file.entity'
import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import * as fs from 'fs'

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(FileEntity)
    private repository: Repository<FileEntity>,
  ) {}

  findAll(userId: number, fileType: FileType) {
    const qb = this.repository.createQueryBuilder('file')

    qb.leftJoinAndSelect('file.user', 'user')

    qb.where('file.userId = :userId', { userId })

    if (fileType === FileType.PHOTOS) {
      qb.andWhere('file.mimetype IN (:...types)', {
        types: ['image/jpg', 'image/png', 'image/jpeg', 'image/webp'],
      })
    } else if (fileType === FileType.GIFS) {
      qb.andWhere('file.mimetype IN (:...types)', {
        types: ['image/gif'],
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

    qb.orderBy('file.updateAt', 'DESC')

    return qb.getMany()
  }

  // delete(userId: number, id: string) {
  //   const qb = this.repository.createQueryBuilder('file')
  //
  //   qb.where('id = :id AND userId = :userId', {
  //     id,
  //     userId,
  //   })
  //
  //   return qb.delete().execute()
  // }

  async delete(userId: number, id: number) {
    const file = await this.repository.findOne({
      where: { id, user: { id: userId } },
      relations: ['comment'],
    })
    if (!file) {
      throw new NotFoundException('File not found')
    }

    // Удаление файла из файловой системы
    const filePath = `uploads/${userId}/${file.fileName}`
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }

    // Удаление записи файла из базы данных
    await this.repository.delete({ id: id, user: { id: userId } })
  }

  create(file: string, userId: number) {
    console.log(file)
    // return this.repository.save({
    //   fileName: file.filename,
    //   originalName: file.originalname,
    //   size: file.size,
    //   mimetype: file.mimetype,
    //   user: { id: userId },
    // })
  }

  async updateRestricted(userId: number, id: string) {
    const qb = this.repository.createQueryBuilder('file')

    qb.where('id = :id AND userId = :userId AND reject = :rejectPublic', {
      id,
      userId,
      rejectPublic: false,
    })

    await qb
      .update()
      .set({ restricted: 'pending', restrictedUpdatedAt: new Date() })
      .execute()
  }
}
