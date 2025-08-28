import { PartialType } from '@nestjs/mapped-types';
import { CreatePlanEstudioDto } from './create-plan-estudio.dto';

export class UpdatePlanEstudioDto extends PartialType(CreatePlanEstudioDto) {}
