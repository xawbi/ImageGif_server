import { Controller, Get, Param, Post, Query, Res } from '@nestjs/common'
import { PublicService } from './public.service'
import { FileSort, FileType } from '../files/entities/file.entity'

@Controller('public')
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  @Get('files')
  getFiles(
    @Query('userId') userId: FileType,
    @Query('all') allType: string,
    @Query('sort') fileSort: FileSort,
    @Query('page') page: number,
    @Query('per_page') per_page: number,
  ) {
    return this.publicService.getFiles(
      userId,
      allType,
      fileSort,
      page,
      per_page,
    )
  }

  @Post('searchPosts')
  searchPosts(@Query('postNameAndDesc') postNameAndDesc: string) {
    return this.publicService.searchPosts(postNameAndDesc)
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
  getFileComments(
    @Param('id') fileId: number,
    @Query('page') page: number,
    @Query('per_page') per_page: number,
  ) {
    return this.publicService.getFileComments(fileId, page, per_page)
  }

  @Get(':id/commentsLength')
  getFileCommentsLength(@Param('id') fileId: number) {
    return this.publicService.getFileCommentsLength(fileId)
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
