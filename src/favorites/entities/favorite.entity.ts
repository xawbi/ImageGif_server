import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { UserEntity } from '../../users/entities/user.entity'
import { FileEntity } from '../../files/entities/file.entity'

@Entity('favorites')
export class FavoriteEntity {
  @PrimaryGeneratedColumn()
  id: number

  @ManyToOne(() => UserEntity, user => user.favorites, { nullable: false })
  user: UserEntity

  @ManyToOne(() => FileEntity, file => file.favorites, {
    nullable: false,
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  file: FileEntity
}
