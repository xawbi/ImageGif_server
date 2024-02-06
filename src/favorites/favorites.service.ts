import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { FavoriteEntity } from './entities/favorite.entity'
import { Repository } from 'typeorm'
import { FileEntity } from '../files/entities/file.entity'

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(FavoriteEntity)
    private favoritesEntityRepository: Repository<FavoriteEntity>,
    @InjectRepository(FileEntity)
    private fileEntityRepository: Repository<FileEntity>,
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

  async getFavorites(userId: number) {
    return await this.favoritesEntityRepository
      .createQueryBuilder('favorites')
      .leftJoinAndSelect('favorites.file', 'file')
      .leftJoinAndSelect('file.user', 'user')
      .where('favorites.userId = :id', { id: userId })
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
