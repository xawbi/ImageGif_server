import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { FavoriteEntity } from './entities/favorite.entity'
import { Repository } from 'typeorm'
import { FileEntity, FileSort } from '../files/entities/file.entity'
import { UserEntity } from '../users/entities/user.entity'

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(FavoriteEntity)
    private favoritesEntityRepository: Repository<FavoriteEntity>,
    @InjectRepository(FileEntity)
    private fileEntityRepository: Repository<FileEntity>,
    @InjectRepository(UserEntity)
    private userEntityRepository: Repository<UserEntity>,
  ) {}

  async addToFavorites(userId: number, fileId: number) {
    const file = await this.fileEntityRepository.findOne({
      where: { id: fileId, restricted: 'public' },
    })

    if (!file) {
      throw new NotFoundException(
        'File does not exist or is not marked as favorite',
      )
    }

    const existingFavorite = await this.favoritesEntityRepository.findOne({
      where: { user: { id: userId }, file: { id: fileId } },
    })

    if (existingFavorite) {
      await this.favoritesEntityRepository.remove(existingFavorite)
    } else {
      const newFavorite = this.favoritesEntityRepository.create({
        user: { id: userId },
        file: { id: fileId },
      })

      await this.favoritesEntityRepository.save(newFavorite)
    }
  }

  async updateUserFavorites(userId: number) {
    const user = await this.userEntityRepository.findOne({
      where: { id: userId },
    })
    if (!user) {
      throw new Error('User not found')
    }
    user.openFavorites = !user.openFavorites
    await this.userEntityRepository.save(user)
  }

  async getFavorites(userId: number, fileSort: FileSort) {
    const qbFile =
      this.favoritesEntityRepository.createQueryBuilder('favorites')
    qbFile
      .leftJoinAndSelect('favorites.file', 'file')
      .leftJoinAndSelect('file.user', 'user')
      .addSelect(['user.id', 'user.username', 'user.role'])
      .where('favorites.userId = :id', { id: userId })
      .leftJoin('file.rating', 'rating')
      .addSelect(['rating.like', 'rating.dislike'])

    if (fileSort === FileSort.OLDEST) {
      qbFile.orderBy('file.restrictedUpdatedAt', 'ASC')
    } else if (fileSort === FileSort.NEWEST) {
      qbFile.orderBy('file.restrictedUpdatedAt', 'DESC')
    } else if (fileSort === FileSort.POPULAR) {
      qbFile.orderBy('file.views', 'DESC')
    } else {
      qbFile.orderBy('file.restrictedUpdatedAt', 'DESC')
    }

    return await qbFile
      .leftJoin('rating.user', 'userRating')
      .addSelect(['userRating.id', 'userRating.username', 'userRating.role'])
      .getMany()
  }

  async delFavorite(userId: number, id: number) {
    const favorite = await this.favoritesEntityRepository.findOne({
      where: { id, user: { id: userId } },
    })
    if (!favorite) {
      throw new NotFoundException('Favorite not found')
    }

    await this.favoritesEntityRepository.delete({
      id: id,
      user: { id: userId },
    })
  }
}
