import { Controller, Get, Param, Query, Res } from '@nestjs/common'
import { PublicService } from './public.service'
import { FileType } from '../files/entities/file.entity'

@Controller('public')
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  @Get('files')
  findAll(@Query('type') fileType: FileType) {
    return this.publicService.findAll(fileType)
  }

  @Get(':id/fileLikes')
  getFileLikes(@Param('id') id: number) {
    return this.publicService.getFileLikes(id)
  }

  @Get(':id/fileDislikes')
  getFileDislikes(@Param('id') id: number) {
    return this.publicService.getFileDislikes(id)
  }

  @Get(':id/commentLikes')
  getCommentLikes(@Param('id') id: number) {
    return this.publicService.getCommentLikes(id)
  }

  @Get(':id/commentDislikes')
  getCommentDislikes(@Param('id') id: number) {
    return this.publicService.getCommentDislikes(id)
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
