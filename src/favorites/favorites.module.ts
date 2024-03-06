import { Module } from '@nestjs/common'
import { FavoritesService } from './favorites.service'
import { FavoritesController } from './favorites.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { FavoriteEntity } from './entities/favorite.entity'
import { FileEntity } from '../files/entities/file.entity'
import { UserEntity } from '../users/entities/user.entity'

@Module({
  imports: [TypeOrmModule.forFeature([FavoriteEntity, FileEntity, UserEntity])],
  controllers: [FavoritesController],
  providers: [FavoritesService],
})
export class FavoritesModule {}
