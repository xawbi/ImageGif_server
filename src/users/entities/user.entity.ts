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

  @OneToMany(() => FileEntity, file => file.user)
  file: FileEntity[]

  @OneToMany(() => CommentEntity, comment => comment.user)
  comment: CommentEntity[]

  @OneToMany(() => AvatarEntity, avatar => avatar.user)
  avatar: AvatarEntity

  @OneToMany(() => Bg_profileEntity, bgProfile => bgProfile.user)
  bgProfile: Bg_profileEntity

  @CreateDateColumn()
  createAt: Date

  @UpdateDateColumn()
  updateAt: Date
}
