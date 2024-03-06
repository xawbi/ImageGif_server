import { Controller, Post, UseGuards, Get, Inject, Param } from '@nestjs/common'
import { UserId } from '../decorators/user-id.decorator'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { Bg_profileService } from './bg_profile.service'
import { SharpPipe } from '../files/sharp.pipe'

@Controller('bgProfile')
export class Bg_profileController {
  constructor(
    private readonly bgProfileService: Bg_profileService,
    @Inject(SharpPipe) private readonly sharpPipe: SharpPipe,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  postBgId(@UserId() userId: number) {
    return this.bgProfileService.postBgId(userId)
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findBgId(@UserId() userId: number) {
    return this.bgProfileService.findBgId(userId)
  }

  @Get('/public/:userId')
  findBgIdPublic(@Param('userId') userId: number) {
    return this.bgProfileService.findBgId(userId)
  }
}
