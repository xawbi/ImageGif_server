import { IsOptional, Length } from 'class-validator'

export class CreateFileDto {
  @Length(1, 40)
  postName: string

  @Length(1, 20000)
  @IsOptional()
  postDescription?: string
}
