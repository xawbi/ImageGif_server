import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { UserEntity } from '../../users/entities/user.entity'
import { FileEntity } from '../../files/entities/file.entity'
import { RatingEntity } from '../../rating/entities/rating.entity'

@Entity('comments')
export class CommentEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  text: string

  @ManyToOne(() => UserEntity, user => user.comment, { nullable: false })
  user: UserEntity

  @ManyToOne(() => FileEntity, file => file.comment, {
    nullable: false,
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  file: FileEntity

  @OneToMany(() => RatingEntity, rating => rating.comment, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  rating: RatingEntity[]

  @Column({ default: 0 })
  like: number

  @Column({ default: 0 })
  dislike: number

  @CreateDateColumn()
  createAt: string

  @UpdateDateColumn()
  updateAt: string
}
