import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Bg_profileEntity } from './entities/bg_profile.entity'
import { Bg_profileService } from './bg_profile.service'
import { Bg_profileController } from './bg_profile.controller'
import { UserEntity } from '../users/entities/user.entity'
import { SharpPipe } from '../files/sharp.pipe'

@Module({
  imports: [TypeOrmModule.forFeature([Bg_profileEntity, UserEntity])],
  controllers: [Bg_profileController],
  providers: [Bg_profileService, SharpPipe],
})
export class BgProfileModule {}
