import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common'
import * as express from 'express'
import { join } from 'path'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.useGlobalPipes(new ValidationPipe())
  app.setGlobalPrefix('api')
  app.use('/api/uploads', express.static(join(__dirname, '..', 'uploads')))
  app.use('/api/avatars', express.static(join(__dirname, '..', 'avatars')))
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'https://imagegif.ru',
      'http://imagegif.ru',
      'http://176.109.100.227:3000',
    ],
    credentials: true,
  })
  await app.listen(process.env.PORT)
}

bootstrap()
