import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { UserEntity } from '../../users/entities/user.entity'
import { FileEntity } from '../../files/entities/file.entity'
import { CommentEntity } from '../../comments/entities/comment.entity'

export enum TargetTypeEnum {
  COMMENT = 'comment',
  FILE = 'file',
}

export enum TypeEnum {
  LIKE = 'like',
  DISLIKE = 'dislike',
}

@Entity('rating')
export class RatingEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column({
    type: 'enum',
    enum: TargetTypeEnum,
    nullable: false,
  })
  targetType: string

  @Column({ default: 0 })
  like: number

  @Column({ default: 0 })
  dislike: number

  @ManyToOne(() => UserEntity, user => user.comment, {
    nullable: false,
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  user: UserEntity

  @ManyToOne(() => FileEntity, file => file.rating, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  file: FileEntity

  @ManyToOne(() => CommentEntity, comment => comment.rating, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  comment: CommentEntity
}
