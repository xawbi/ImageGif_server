import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common'
import * as express from 'express'
import { join } from 'path'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.useGlobalPipes(new ValidationPipe())
  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')))
  app.use('/avatars', express.static(join(__dirname, '..', 'avatars')))
  app.enableCors({ credentials: true, origin: true })
  await app.listen(process.env.PORT)
}

bootstrap()
