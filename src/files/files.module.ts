import { Module } from '@nestjs/common'
import { FilesService } from './files.service'
import { FilesController } from './files.controller'
import { FileEntity } from './entities/file.entity'
import { TypeOrmModule } from '@nestjs/typeorm'
import { SharpPipe } from './sharp.pipe'

@Module({
  imports: [TypeOrmModule.forFeature([FileEntity])],
  controllers: [FilesController],
  providers: [FilesService, SharpPipe],
})
export class FilesModule {}
