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
  Inject,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { UserId } from '../decorators/user-id.decorator'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { Bg_profileService } from './bg_profile.service'
import { fileFilter, SharpPipe } from '../files/sharp.pipe'

@Controller('bgProfile')
@UseGuards(JwtAuthGuard)
export class Bg_profileController {
  constructor(
    private readonly bgProfileService: Bg_profileService,
    @Inject(SharpPipe) private readonly sharpPipe: SharpPipe,
  ) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 1024 * 1024 * 5 },
      fileFilter,
    }),
  )
  async create(
    @UploadedFile() file: Express.Multer.File,
    @UserId() userId: number,
  ) {
    try {
      global.filePath = `./bgProfile/${userId}`
      const processedAvatar = await this.sharpPipe.transform(file)
      return this.bgProfileService.create(processedAvatar, userId)
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
