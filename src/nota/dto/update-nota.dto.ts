import { PartialType } from '@nestjs/mapped-types';
import { CreateNotaDto } from './create-nota.dto';

export class UpdateNotaDto extends (PartialType as any)(CreateNotaDto) {}
