import { Injectable, NotFoundException } from '@nestjs/common'
import { UsersService } from '../users/users.service'
import { CreateUserDto } from '../users/dto/create-user.dto'
import { UserEntity } from '../users/entities/user.entity'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import * as nodemailer from 'nodemailer'
import { ChangePasswordDto, ResetPasswordDto } from './dto/create-auth.dto'

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async comparePasswords(
    enteredPassword: string,
    storedPasswordHash: string,
  ): Promise<boolean> {
    return await bcrypt.compare(enteredPassword, storedPasswordHash)
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email)

    if (
      user &&
      user.isEmailConfirmed === true &&
      (await this.comparePasswords(password, user.password))
    ) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user
      return result
    }
    return null
  }

  generateActivationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  sendEmail(
    emailUser: string,
    loginForm: string,
    activationCodeOrToken: string,
  ) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    })

    let mailOptions: nodemailer.SendMailOptions

    if (loginForm === 'register') {
      mailOptions = {
        from: process.env.SMTP_USER,
        to: emailUser,
        subject: 'Activation code',
        text: `Your activation code: ${activationCodeOrToken}`,
      }
    } else if (loginForm === 'resetPassword') {
      mailOptions = {
        from: process.env.SMTP_USER,
        to: emailUser,
        subject: 'Reset your ImageGif password',
        text: ``,
        html: `
        <div>
          <h1>Reset your ImageGif password</h1>
          <p>Click the link below to reset your password.</p>
          <p>This single-use link will expire in 24 hours.</p><br>
          <a href='${process.env.IMAGEGIF_URL}/password/change/${activationCodeOrToken}'>Reset Your Password</a>
        </div>
      `,
      }
    }

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Ошибка при отправке письма:', error)
      } else {
        console.log('Письмо успешно отправлено:', info.response)
      }
    })
  }

  async register(dto: CreateUserDto) {
    const activationCode = this.generateActivationCode()
    await this.usersService.create(dto, activationCode)
    await this.sendEmail(dto.email, 'register', activationCode)
  }

  async activate(dto: CreateUserDto) {
    const userData = await this.usersService.findByEmail(dto.email)

    if (userData === null) {
      throw new NotFoundException('Пользователь не найден')
    }

    if (dto.activationCode === userData.activationCode) {
      await this.usersService.updateEmailConfirmed(dto.email)

      if (userData.isEmailConfirmed === true) {
        throw new NotFoundException('У вас уже активированный аккаунт')
      }

      return {
        token: this.jwtService.sign({ id: userData.id }),
      }
    } else {
      throw new NotFoundException('Активационные коды не совпадают')
    }
  }

  async login(user: UserEntity) {
    await this.usersService.updateTokenAndDate(user.id)

    return {
      token: this.jwtService.sign({ id: user.id }),
    }
  }

  generateRandomToken(length) {
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    const charactersLength = characters.length

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charactersLength)
      result += characters[randomIndex]
    }

    return result
  }

  async reset(dto: ResetPasswordDto) {
    const userData = await this.usersService.findByEmail(dto.email)

    if (userData === null) {
      throw new NotFoundException('User not found.')
    }

    if (userData.isEmailConfirmed === false) {
      throw new NotFoundException(
        "The user's email has not been confirmed yet.",
      )
    }

    const now = new Date()
    const halfHourAgo = new Date(now.getTime() - 30 * 60 * 1000)

    if (
      userData.lastPasswordResetEmailSent !== null &&
      userData.lastPasswordResetEmailSent > halfHourAgo
    ) {
      throw new NotFoundException(
        'An email with a link to change your password has already been sent. Please try again in 30 minutes.',
      )
    }

    const token = userData.id.toString() + this.generateRandomToken(15)
    await this.usersService.updateNewPasswordToken(dto.email, token)
    await this.sendEmail(dto.email, 'resetPassword', token)
  }

  async change(token: string, dto: ChangePasswordDto) {
    const userData = await this.usersService.findByToken(token)

    if (userData === null) {
      throw new NotFoundException('User not found.')
    }

    if (dto.newPassword !== dto.confirmNewPassword) {
      throw new NotFoundException('Passwords mismatch.')
    }

    await this.usersService.updatePassword(userData.id, dto.newPassword)
  }

  async checkValidPasswordToken(token: string) {
    const userData = await this.usersService.findByToken(token)

    if (userData === null) {
      throw new NotFoundException('The token is invalid.')
    }

    return true
  }
}
