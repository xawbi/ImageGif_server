import { Controller, Get, Param, Patch, Post, Query, Res } from '@nestjs/common'
import { PublicService } from './public.service'
import { FileSort, FileType } from '../files/entities/file.entity'

@Controller('public')
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  @Get('files')
  getFiles(
    @Query('type') fileType: FileType,
    @Query('sort') fileSort: FileSort,
  ) {
    return this.publicService.getFiles(fileType, fileSort)
  }

  @Post('file/:fileId/updateView')
  updateView(@Param('fileId') fileId: number) {
    return this.publicService.updateView(fileId)
  }

  @Get('file/:fileId')
  findFile(@Param('fileId') fileId: number) {
    return this.publicService.findFile(fileId)
  }

  @Get(':id/comments')
  getFileComments(@Param('id') fileId: number) {
    return this.publicService.getFileComments(fileId)
  }

  @Get(':id/fileRating')
  getFileLikes(@Param('id') id: number) {
    return this.publicService.getFileRating(id)
  }

  @Get(':id/commentRating')
  getCommentLikes(@Param('id') id: number) {
    return this.publicService.getCommentRating(id)
  }

  @Get('/download/:userId/:fileName')
  async downloadFile(
    @Param('userId') userId: string,
    @Param('fileName') fileName: string,
    @Res() res,
  ) {
    return this.publicService.downloadFile(userId, fileName, res)
  }
}
