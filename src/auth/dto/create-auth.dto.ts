import { IsEmail, IsOptional, Length } from 'class-validator'

export class ResetPasswordDto {
  @IsEmail(undefined, { message: 'Invalid email.' })
  email: string
}

export class ChangePasswordDto {
  @Length(4, 32, {
    message: 'The password must be at least 4 characters long.',
  })
  @IsOptional()
  newPassword: string

  @Length(4, 32, {
    message: 'The password must be at least 4 characters long.',
  })
  @IsOptional()
  confirmNewPassword: string
}
