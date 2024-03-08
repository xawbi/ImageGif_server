import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { FileEntity } from '../files/entities/file.entity'
import { Repository } from 'typeorm'
import { CommentEntity } from '../comments/entities/comment.entity'

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(FileEntity)
    private fileEntityRepository: Repository<FileEntity>,
    @InjectRepository(CommentEntity)
    private commentEntityRepository: Repository<CommentEntity>,
  ) {}

  getFilesPending(page: number, per_page: number) {
    const offset = (+page - 1) * +per_page
    const qb = this.fileEntityRepository.createQueryBuilder('file')

    qb.leftJoinAndSelect('file.user', 'user')

    qb.where('file.restricted = :restricted', { restricted: 'pending' })

    qb.orderBy('file.updateAt', 'ASC')

    return qb.skip(offset).take(+per_page).getMany()
  }

  async updateRestricted(ids: string) {
    const idsArray = ids.split(',')

    const qb = this.fileEntityRepository.createQueryBuilder('file')

    qb.andWhere('id IN (:...ids) AND restricted = :restrictedPublic', {
      ids: idsArray,
      restrictedPublic: 'pending',
    })

    await qb
      .update()
      .set({ restricted: 'public', restrictedUpdatedAt: new Date() })
      .execute()
  }

  async reject(ids: string) {
    const idsArray = ids.split(',')

    const qb = this.fileEntityRepository.createQueryBuilder('file')

    qb.andWhere(
      'id IN (:...ids) AND restricted IN (:...restrictedPublic) AND reject = :rejectPublic',
      {
        ids: idsArray,
        restrictedPublic: ['pending', 'public'],
        rejectPublic: false,
      },
    )

    await qb.update().set({ restricted: 'private', reject: true }).execute()
  }

  async deleteFile(id: string) {
    const qb = this.fileEntityRepository.createQueryBuilder('file')

    qb.where('id = :id AND restricted = :restricted', {
      id: id,
      restricted: 'public',
    })

    await qb.delete().execute()
  }
}
