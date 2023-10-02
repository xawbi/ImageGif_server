import { IsEmail, IsOptional, Length } from 'class-validator'

export class CreateUserDto {
  @Length(1, 32)
  username: string

  @IsEmail(undefined, { message: 'неверная почта' })
  email: string

  @Length(4, 32, { message: 'пароль должен быть минимум 4 символа' })
  @IsOptional()
  password: string

  // @Length(6, 6)
  activationCode: string
}
