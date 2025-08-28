import { IsInt, IsPositive, IsOptional, IsDateString } from 'class-validator';

export class CreateInscripcionDto {
  @IsDateString()
  @IsOptional()
  fechaInscripcion?: Date;

  @IsInt()
  @IsPositive()
  estudianteId: number;
}