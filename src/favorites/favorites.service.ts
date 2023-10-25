import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { FavoriteEntity } from './entities/favorite.entity'
import { Repository } from 'typeorm'

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(FavoriteEntity)
    private favoritesEntityRepository: Repository<FavoriteEntity>,
  ) {}

  async addToFavorites(userId: number, fileId: number) {
    const favorites = this.favoritesEntityRepository.create({
      user: { id: userId },
      file: { id: fileId },
    })

    await this.favoritesEntityRepository.save(favorites)
  }

  async getFavorites(userId: number) {
    return await this.favoritesEntityRepository
      .createQueryBuilder('favorites')
      .leftJoinAndSelect('favorites.file', 'file')
      .where('favorites.userId = :id', { id: userId })
      .getMany()
  }
}
