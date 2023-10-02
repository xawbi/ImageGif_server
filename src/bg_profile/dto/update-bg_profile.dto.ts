import { PartialType } from '@nestjs/mapped-types';
import { CreateBgProfileDto } from './create-bg_profile.dto';

export class UpdateBgProfileDto extends PartialType(CreateBgProfileDto) {}
