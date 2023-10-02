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
  Body,
} from '@nestjs/common'
import { AvatarsService } from './avatars.service'
import { FileInterceptor } from '@nestjs/platform-express'
import { fileFilter } from '../files/storage'
import { avatarStorage } from './storage'
import { UserId } from '../decorators/user-id.decorator'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CreateAvatarDto } from './dto/create-avatar.dto'

@Controller('avatars')
@UseGuards(JwtAuthGuard)
export class AvatarsController {
  constructor(private readonly avatarsService: AvatarsService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: avatarStorage,
      fileFilter,
      limits: {
        fileSize: 1024 * 1024 * 5,
      },
    }),
  )
  create(
    @UploadedFile() file: Express.Multer.File,
    @UserId() userId: number,
    @Body() dto: CreateAvatarDto,
  ) {
    try {
      return this.avatarsService.create(file, userId, dto)
    } catch (error) {
      throw new ForbiddenException()
    }
  }

  @Get()
  findAll(@UserId() userId: number) {
    return this.avatarsService.findAll(userId)
  }

  @Delete(':id/delete')
  delete(@UserId() userId: number, @Param('id') id: number) {
    return this.avatarsService.delete(userId, id)
  }
}
