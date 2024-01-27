import { Controller, Post, Body, UseGuards, Get, Param } from '@nestjs/common'
import { RatingService } from './rating.service'
import { UserId } from '../decorators/user-id.decorator'
import { CreateRatingDto } from './dto/create-rating.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

@Controller('rating')
@UseGuards(JwtAuthGuard)
export class RatingController {
  constructor(private readonly ratingService: RatingService) {}

  @Post()
  createRatingFile(@Body() dto: CreateRatingDto, @UserId() userId: number) {
    return this.ratingService.createRating(userId, dto)
  }

  @Get('/check/:userId')
  checkRatingExists(
    @Body() dto: CreateRatingDto,
    @Param('userId') userId: number,
  ) {
    return this.ratingService.checkRatingExists(dto, userId)
  }
}
