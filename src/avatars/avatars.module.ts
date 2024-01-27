import { Module } from '@nestjs/common'
import { AvatarsService } from './avatars.service'
import { AvatarsController } from './avatars.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AvatarEntity } from './entities/avatar.entity'
import { SharpPipe } from '../files/sharp.pipe'
// import { UserEntity } from '../users/entities/user.entity'

@Module({
  imports: [TypeOrmModule.forFeature([AvatarEntity])],
  controllers: [AvatarsController],
  providers: [AvatarsService, SharpPipe],
})
export class AvatarsModule {}
