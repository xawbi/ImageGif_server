import { Controller, Post, Body, UseGuards, Patch, Param } from '@nestjs/common'
import { CommentsService } from './comments.service'
import { CreateCommentDto } from './dto/create-comment.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { UserId } from '../decorators/user-id.decorator'

@Controller('comments')
@UseGuards(JwtAuthGuard)
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  create(@Body() dto: CreateCommentDto, @UserId() userId: number) {
    return this.commentsService.create(dto, userId)
  }

  @Patch(':id/addLike')
  addLike(@Param('id') id: string) {
    return this.commentsService.addLike(id)
  }

  @Patch(':id/addDislike')
  addDislike(@Param('id') id: string) {
    return this.commentsService.addDislike(id)
  }

  @Patch(':id/removeLike')
  removeLike(@Param('id') id: string) {
    return this.commentsService.removeLike(id)
  }

  @Patch(':id/removeDislike')
  removeDislike(@Param('id') id: string) {
    return this.commentsService.removeDislike(id)
  }
}
