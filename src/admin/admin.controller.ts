import {
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common'
import { AdminService } from './admin.service'
import { AdminGuard, Role, Roles } from './guards/check-admin.guard'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('files/pending')
  @UseGuards(AdminGuard)
  @Roles(Role.Admin)
  getFilesPending() {
    return this.adminService.getFilesPending()
  }

  @Patch('files/updateRestricted')
  @UseGuards(AdminGuard)
  @Roles(Role.Admin)
  updateRestricted(@Query('ids') ids: string) {
    return this.adminService.updateRestricted(ids)
  }

  @Patch('files/reject')
  @UseGuards(AdminGuard)
  @Roles(Role.Admin)
  reject(@Query('ids') ids: string) {
    return this.adminService.reject(ids)
  }

  @Delete('files/:id/delete')
  @UseGuards(AdminGuard)
  @Roles(Role.Admin)
  delete(@Param('id') id: string) {
    return this.adminService.delete(id)
  }
}
