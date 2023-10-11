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
} from '@nestjs/common'
import { FilesService } from './files.service'
import { fileFilter, fileStorage } from './storage'
import { FileInterceptor } from '@nestjs/platform-express'
import { UserId } from '../decorators/user-id.decorator'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { FileType } from './entities/file.entity'

@Controller('files')
@UseGuards(JwtAuthGuard)
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Get()
  findAll(@UserId() userId: number, @Query('type') fileType: FileType) {
    return this.filesService.findAll(userId, fileType)
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: fileStorage,
      fileFilter,
      limits: {
        fileSize: 1024 * 1024 * 5,
      },
    }),
  )
  create(@UploadedFile() file: Express.Multer.File, @UserId() userId: number) {
    try {
      return this.filesService.create(file, userId)
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
