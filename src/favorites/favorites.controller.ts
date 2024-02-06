import { Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common'
import { FavoritesService } from './favorites.service'
import { UserId } from '../decorators/user-id.decorator'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

@Controller('favorites')
@UseGuards(JwtAuthGuard)
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post(':fileId')
  addToFavorites(@UserId() userId: number, @Param('fileId') fileId: number) {
    return this.favoritesService.addToFavorites(userId, fileId)
  }

  @Get()
  getFavorites(@UserId() userId: number) {
    return this.favoritesService.getFavorites(userId)
  }

  @Delete('delete/:id')
  delFavorite(@UserId() userId: number, @Param('id') id: number) {
    return this.favoritesService.delFavorite(userId, id)
  }
}
