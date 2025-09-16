import { IsInt, IsPositive, IsOptional, IsDateString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class DetalleInscripcionDto {
  @IsInt()
  @IsPositive()
  grupoMateriaId: number;
}

export class CreateInscripcionDto {
  @IsOptional() // Remover @IsDateString para ser más flexible
  fechaInscripcion?: any; // Aceptar cualquier tipo

  @IsInt()
  @IsPositive()
  estudianteId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DetalleInscripcionDto)
  @IsOptional()
  detalles?: DetalleInscripcionDto[];
}