import { Injectable, NotFoundException } from '@nestjs/common'
import { UsersService } from '../users/users.service'
import { CreateUserDto } from '../users/dto/create-user.dto'
import { UserEntity } from '../users/entities/user.entity'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import * as nodemailer from 'nodemailer'

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

  sendActivateCodeByEmail(activationCode: string, emailUser: string) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    })

    // Настройки письма
    const mailOptions: nodemailer.SendMailOptions = {
      from: process.env.SMTP_USER,
      to: emailUser,
      subject: 'Активационный код',
      text: `Ваш код активации: ${activationCode}`,
    }

    // Отправка письма
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
    await this.sendActivateCodeByEmail(activationCode, dto.email)
  }

  async activate(dto: CreateUserDto) {
    const userData = await this.usersService.findByEmail(dto.email)

    if (userData === null) {
      throw new NotFoundException('Пользователь не найден')
    }

    if (dto.activationCode === userData.activationCode) {
      await this.usersService.update(dto, dto.email)

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
    return {
      token: this.jwtService.sign({ id: user.id }),
    }
  }
}
