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
import { CommentEntity } from '../../comments/entities/comment.entity'
import { RatingEntity } from '../../rating/entities/rating.entity'
import { FavoriteEntity } from '../../favorites/entities/favorite.entity'

export enum FileType {
  PHOTOS = 'photos',
  GIFS = 'gifs',
  SENT = 'sent',
  PUBLIC = 'public',
}

export enum FileSort {
  OLDEST = 'oldest',
  NEWEST = 'newest',
  POPULAR = 'popular',
  BEST = 'best',
  RANDOM = 'random',
}

@Entity('files')
export class FileEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  fileName: string

  @Column()
  width: number

  @Column()
  height: number

  @Column()
  size: number

  @Column({
    type: 'enum',
    enum: ['private', 'pending', 'public'],
    default: 'private',
    nullable: false,
  })
  restricted: string

  @Column({ default: 0 })
  views: number

  @Column({ nullable: false, default: false })
  reject: boolean

  @ManyToOne(() => UserEntity, user => user.file, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  user: UserEntity

  @OneToMany(() => FavoriteEntity, favorites => favorites.file, {
    nullable: false,
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  favorites: FavoriteEntity[]

  @OneToMany(() => CommentEntity, comment => comment.file, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  comment: CommentEntity[]

  @OneToMany(() => RatingEntity, rating => rating.file, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  rating: RatingEntity[]

  @CreateDateColumn()
  createAt: Date

  @UpdateDateColumn()
  updateAt: Date

  @Column({ nullable: true })
  restrictedUpdatedAt: Date

  @Column({ nullable: true })
  postName: string

  @Column({ nullable: true })
  postDescription: string
}
