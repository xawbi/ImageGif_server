import {
  Controller,
  Get,
  Post,
  Delete,
  ForbiddenException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Query,
  Patch,
  Param,
  Inject,
} from '@nestjs/common'
import { FilesService } from './files.service'
import { FileInterceptor } from '@nestjs/platform-express'
import { UserId } from '../decorators/user-id.decorator'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { FileType } from './entities/file.entity'
import { fileFilter, SharpPipe } from './sharp.pipe'

@Controller('files')
@UseGuards(JwtAuthGuard)
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    @Inject(SharpPipe) private readonly sharpPipe: SharpPipe,
  ) {}

  @Get()
  findAll(@UserId() userId: number, @Query('type') fileType: FileType) {
    return this.filesService.findAll(userId, fileType)
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 1024 * 1024 * 5 },
      fileFilter,
    }),
  )
  async create(
    @UserId() userId: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    try {
      global.filePath = `./uploads/${userId}`
      const processedFile = await this.sharpPipe.transform(file)
      return this.filesService.create(processedFile, userId)
    } catch (error) {
      throw new ForbiddenException()
    }
  }

  @Delete(':id/delete')
  delete(@UserId() userId: number, @Param('id') id: number) {
    return this.filesService.delete(userId, id)
  }

  @Patch(':id/updateRestricted')
  updateRestricted(@UserId() userId: number, @Param('id') id: string) {
    return this.filesService.updateRestricted(userId, id)
  }
}
