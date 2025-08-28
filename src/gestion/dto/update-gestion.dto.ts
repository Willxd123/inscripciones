import { PartialType } from '@nestjs/mapped-types';
import { CreateGestionDto } from './create-gestion.dto';

export class UpdateGestionDto extends (PartialType as any)(CreateGestionDto) {}
