import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { FileEntity } from '../../files/entities/file.entity'
import { CommentEntity } from '../../comments/entities/comment.entity'
import { AvatarEntity } from '../../avatars/entities/avatar.entity'
import { Bg_profileEntity } from '../../bg_profile/entities/bg_profile.entity'
import { FavoriteEntity } from '../../favorites/entities/favorite.entity'

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ unique: true })
  email: string

  @Column({ default: false })
  isEmailConfirmed: boolean

  @Column({ nullable: true })
  activationCode: string

  @Column()
  password: string

  @Column()
  username: string

  @Column({
    type: 'enum',
    enum: ['user', 'admin'],
    default: 'user',
    nullable: false,
  })
  role: string

  @OneToMany(() => FavoriteEntity, favorites => favorites.user, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  favorites: FavoriteEntity[]

  @Column({ default: false })
  openFavorites: boolean

  @OneToMany(() => FileEntity, file => file.user, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  file: FileEntity[]

  @OneToMany(() => CommentEntity, comment => comment.user, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  comment: CommentEntity[]

  @OneToMany(() => AvatarEntity, avatar => avatar.user, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  avatar: AvatarEntity

  @OneToMany(() => Bg_profileEntity, bgProfile => bgProfile.user, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  bgProfile: Bg_profileEntity

  @CreateDateColumn()
  createAt: Date

  @UpdateDateColumn()
  updateAt: Date

  @Column({
    default: false,
    nullable: false,
  })
  ban: boolean

  @Column({ nullable: true })
  newPasswordToken: string

  @Column({ nullable: true })
  lastPasswordResetEmailSent: Date
}
