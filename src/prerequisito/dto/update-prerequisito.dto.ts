import { PartialType } from '@nestjs/mapped-types';
import { CreatePrerequisitoDto } from './create-prerequisito.dto';

export class UpdatePrerequisitoDto extends (PartialType as any)(CreatePrerequisitoDto) {}
