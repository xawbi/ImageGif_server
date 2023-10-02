import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { UserEntity } from '../../users/entities/user.entity'

@Entity('avatars')
export class AvatarEntity {
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

  @ManyToOne(() => UserEntity, user => user.avatar)
  user: { id: number }

  @Column()
  x: string

  @Column()
  y: string

  @Column()
  width: string

  @Column()
  height: string

  @CreateDateColumn()
  createAt: Date

  @UpdateDateColumn()
  updateAt: Date
}
