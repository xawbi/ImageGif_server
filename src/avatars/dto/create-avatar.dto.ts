import { Length } from 'class-validator'

export class CreateAvatarDto {
  @Length(1, 32)
  x: string

  @Length(1, 32)
  y: string

  @Length(1, 32)
  width: string

  @Length(1, 32)
  height: string
}
