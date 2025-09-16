import { PartialType } from '@nestjs/swagger';
import { CreateDetalleInscripcionDto } from './create-detalle-inscripcion.dto';

export class UpdateDetalleInscripcionDto extends PartialType(CreateDetalleInscripcionDto) {}
