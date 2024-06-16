import {
  Controller,
  Post,
  UseGuards,
  Request,
  Body,
  Param,
  Get,
} from '@nestjs/common'
import { CreateUserDto } from '../users/dto/create-user.dto'
import { AuthService } from './auth.service'
import { UserEntity } from '../users/entities/user.entity'
import { LocalAuthGuard } from './guards/local-auth.guard'
import { ChangePasswordDto, ResetPasswordDto } from './dto/create-auth.dto'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user as UserEntity)
  }

  @Post('register')
  register(@Body() dto: CreateUserDto) {
    return this.authService.register(dto)
  }

  @Post('register/activate')
  activate(@Body() dto: CreateUserDto) {
    return this.authService.activate(dto)
  }

  @Post('password/reset')
  reset(@Body() dto: ResetPasswordDto) {
    return this.authService.reset(dto)
  }

  @Post('password/change/:token')
  change(@Param('token') token: string, @Body() dto: ChangePasswordDto) {
    return this.authService.change(token, dto)
  }

  @Get('checkToken/:token')
  checkValidPasswordToken(@Param('token') token: string) {
    return this.authService.checkValidPasswordToken(token)
  }
}
