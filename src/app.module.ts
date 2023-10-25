import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UsersModule } from './users/users.module'
import { UserEntity } from './users/entities/user.entity'
import { FilesModule } from './files/files.module'
import { FileEntity } from './files/entities/file.entity'
import { AuthModule } from './auth/auth.module'
import { UserCleanupService } from './users/user-cleanup.service'
import { ScheduleModule } from '@nestjs/schedule'
import { AdminModule } from './admin/admin.module'
import { PublicModule } from './public/public.module'
import { CommentsModule } from './comments/comments.module'
import { CommentEntity } from './comments/entities/comment.entity'
import { AvatarsModule } from './avatars/avatars.module'
import { AvatarEntity } from './avatars/entities/avatar.entity'
import { BgProfileModule } from './bg_profile/bg_profile.module'
import { Bg_profileEntity } from './bg_profile/entities/bg_profile.entity'
import { RatingModule } from './rating/rating.module'
import { RatingEntity } from './rating/entities/rating.entity'
import { FavoritesModule } from './favorites/favorites.module'
import { FavoriteEntity } from './favorites/entities/favorite.entity'
import { MulterModule } from '@nestjs/platform-express'
import { memoryStorage } from 'multer'

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      envFilePath: `.${process.env.NODE_ENV}.env`,
    }),
    MulterModule.register({
      storage: memoryStorage(),
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [
        UserEntity,
        FileEntity,
        CommentEntity,
        AvatarEntity,
        Bg_profileEntity,
        RatingEntity,
        FavoriteEntity,
      ],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([UserEntity]),
    UsersModule,
    FilesModule,
    AuthModule,
    AdminModule,
    PublicModule,
    CommentsModule,
    AvatarsModule,
    BgProfileModule,
    RatingModule,
    FavoritesModule,
  ],
  controllers: [AppController],
  providers: [AppService, UserCleanupService],
})
export class AppModule {}
