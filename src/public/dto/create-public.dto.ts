import { Length } from 'class-validator'
export class CreatePublicDto {
  @Length(1, 32)
  fileName: string

  @Length(1, 32)
  id: string
}
