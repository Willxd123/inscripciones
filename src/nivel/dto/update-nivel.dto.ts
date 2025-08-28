import { PartialType } from '@nestjs/mapped-types';
import { CreateNivelDto } from './create-nivel.dto';

export class UpdateNivelDto extends (PartialType as any)(CreateNivelDto) {}
