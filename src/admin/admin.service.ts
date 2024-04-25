import { Injectable, UnauthorizedException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { FileEntity } from '../files/entities/file.entity'
import { Repository } from 'typeorm'
import { CommentEntity } from '../comments/entities/comment.entity'
import { UserEntity } from '../users/entities/user.entity'

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(FileEntity)
    private fileEntityRepository: Repository<FileEntity>,
    @InjectRepository(CommentEntity)
    private commentEntityRepository: Repository<CommentEntity>,
    @InjectRepository(UserEntity)
    private userEntityRepository: Repository<UserEntity>,
  ) {}

  getFilesPending(page: number, per_page: number) {
    const offset = (+page - 1) * +per_page
    const qb = this.fileEntityRepository.createQueryBuilder('file')
    qb.leftJoinAndSelect('file.user', 'user')
    qb.where('file.restricted = :restricted', { restricted: 'pending' })
    qb.orderBy('file.updateAt', 'ASC')
    return qb.skip(offset).take(+per_page).getMany()
  }

  async getUsers() {
    return await this.userEntityRepository.find()
  }

  async updateUserBan(ids: string, userId: number) {
    const idsArray = ids.split(',')
    const qb = this.userEntityRepository.createQueryBuilder('user')
    const user = await qb.where('id IN (:...ids)', { ids: idsArray }).getOne()
    if (!user || user.id === userId) {
      throw new UnauthorizedException('user not found')
    }
    await qb
      .update()
      .set({ ban: () => 'NOT ban' })
      .execute()
  }

  async updateUserRole(userId: string, userRole: string) {
    const qb = this.userEntityRepository.createQueryBuilder('user')
    const user = await qb.where('id = :userId', { userId }).getOne()
    if (!user) {
      throw new UnauthorizedException('user not found')
    }
    await qb.update().set({ role: userRole }).execute()
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
