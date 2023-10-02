import {
  AfterLoad,
  AfterUpdate,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { UserEntity } from '../../users/entities/user.entity'
import { CommentEntity } from '../../comments/entities/comment.entity'

export enum FileType {
  PHOTOS = 'photos',
  GIFS = 'gifs',
  SENT = 'sent',
  PUBLIC = 'public',
}

// export enum filePublicFilter {
//
// }

@Entity('files')
export class FileEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  fileName: string

  @Column()
  originalName: string

  @Column()
  size: number

  @Column()
  mimetype: string

  @Column({
    type: 'enum',
    enum: ['private', 'pending', 'public'],
    default: 'private',
    nullable: false,
  })
  restricted: string

  @Column({ nullable: false, default: false })
  reject: boolean

  @ManyToOne(() => UserEntity, user => user.file)
  user: UserEntity

  @OneToMany(() => CommentEntity, comment => comment.file)
  comment: CommentEntity[]

  @Column({ default: 0 })
  like: number

  @Column({ default: 0 })
  dislike: number

  @CreateDateColumn()
  createAt: Date

  @UpdateDateColumn()
  updateAt: Date

  @UpdateDateColumn()
  restrictedUpdatedAt: Date

  private previousRestricted: string

  @BeforeUpdate()
  updateRestrictedUpdatedAt() {
    if (this.restricted !== this.previousRestricted) {
      this.restrictedUpdatedAt = new Date()
    }
  }
}
