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
  Inject,
} from '@nestjs/common'
import { AvatarsService } from './avatars.service'
import { FileInterceptor } from '@nestjs/platform-express'
import { UserId } from '../decorators/user-id.decorator'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CreateAvatarDto } from './dto/create-avatar.dto'
import { fileFilter, SharpPipe } from '../files/sharp.pipe'

@Controller('avatars')
export class AvatarsController {
  constructor(
    private readonly avatarsService: AvatarsService,
    @Inject(SharpPipe) private readonly sharpPipe: SharpPipe,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 1024 * 1024 * 5 },
      fileFilter,
    }),
  )
  async postAvatar(
    @UploadedFile() file: Express.Multer.File,
    @UserId() userId: number,
    @Body() dto: CreateAvatarDto,
  ) {
    try {
      global.filePath = `./avatars/${userId}`
      const processedAvatar = await this.sharpPipe.transform(file)
      return this.avatarsService.postAvatar(processedAvatar, userId, dto)
    } catch (error) {
      throw new ForbiddenException()
    }
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  getAvatar(@UserId() userId: number) {
    return this.avatarsService.getAvatar(userId)
  }

  @Get('/public/:userId')
  getAvatarPublic(@Param('userId') userId: number) {
    return this.avatarsService.getAvatar(userId)
  }

  @Delete(':id/delete')
  @UseGuards(JwtAuthGuard)
  delete(@UserId() userId: number, @Param('id') id: number) {
    return this.avatarsService.delete(userId, id)
  }
}
