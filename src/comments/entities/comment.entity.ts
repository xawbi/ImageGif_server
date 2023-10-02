import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { UserEntity } from '../../users/entities/user.entity'
import { FileEntity } from '../../files/entities/file.entity'

@Entity('comments')
export class CommentEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  text: string

  @ManyToOne(() => UserEntity, user => user.comment, { nullable: false })
  user: UserEntity

  @ManyToOne(() => FileEntity, file => file.comment, { nullable: false })
  file: FileEntity

  @Column({ default: 0 })
  like: number

  @Column({ default: 0 })
  dislike: number

  @CreateDateColumn()
  createAt: string

  @UpdateDateColumn()
  updateAt: string
}
