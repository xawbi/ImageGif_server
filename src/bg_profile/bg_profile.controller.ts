import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  ForbiddenException,
  UseGuards,
  Get,
  Delete,
  Param,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { fileFilter } from '../files/storage'
import { UserId } from '../decorators/user-id.decorator'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { bgProfileStorage } from './storage'
import { Bg_profileService } from './bg_profile.service'

@Controller('bgProfile')
@UseGuards(JwtAuthGuard)
export class Bg_profileController {
  constructor(private readonly bgProfileService: Bg_profileService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: bgProfileStorage,
      fileFilter,
      limits: {
        fileSize: 1024 * 1024 * 5,
      },
    }),
  )
  create(@UploadedFile() file: Express.Multer.File, @UserId() userId: number) {
    try {
      return this.bgProfileService.create(file, userId)
    } catch (error) {
      throw new ForbiddenException()
    }
  }

  @Get()
  findAll(@UserId() userId: number) {
    return this.bgProfileService.findAll(userId)
  }

  @Delete(':id/delete')
  delete(@UserId() userId: number, @Param('id') id: number) {
    return this.bgProfileService.delete(userId, id)
  }
}
