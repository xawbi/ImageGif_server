import {
  Controller,
  Post,
  Body,
  UseGuards,
  Param,
  Delete,
} from '@nestjs/common'
import { CommentsService } from './comments.service'
import { CreateCommentDto } from './dto/create-comment.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { UserId } from '../decorators/user-id.decorator'

@Controller('comments')
@UseGuards(JwtAuthGuard)
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  addComment(@Body() dto: CreateCommentDto, @UserId() userId: number) {
    return this.commentsService.addComment(dto, userId)
  }

  @Delete(':id/delete')
  deleteComment(@Param('id') id: string) {
    return this.commentsService.deleteComment(id)
  }
}
