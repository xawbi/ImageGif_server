import {
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'
import { FavoritesService } from './favorites.service'
import { UserId } from '../decorators/user-id.decorator'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { FileSort } from '../files/entities/file.entity'

@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post(':fileId')
  @UseGuards(JwtAuthGuard)
  addToFavorites(@UserId() userId: number, @Param('fileId') fileId: number) {
    return this.favoritesService.addToFavorites(userId, fileId)
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  getFavorites(@UserId() userId: number, @Query('sort') fileSort: FileSort) {
    return this.favoritesService.getFavorites(userId, fileSort)
  }

  @Patch('/updateUserFavorites')
  @UseGuards(JwtAuthGuard)
  updateUserFavorites(@UserId() userId: number) {
    return this.favoritesService.updateUserFavorites(userId)
  }

  @Get('/public/:userId')
  getFavoritesPublic(
    @Param('userId') userId: number,
    @Query('sort') fileSort: FileSort,
  ) {
    return this.favoritesService.getFavorites(userId, fileSort)
  }

  @Delete('delete/:id')
  @UseGuards(JwtAuthGuard)
  delFavorite(@UserId() userId: number, @Param('id') id: number) {
    return this.favoritesService.delFavorite(userId, id)
  }
}
