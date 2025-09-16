import { IsString, IsNotEmpty, MaxLength, IsOptional, IsInt, IsPositive } from 'class-validator';

export class CreateHorarioDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(20) // Remover regex estricto, ser más flexible
  hora_inicio: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20) // Remover regex estricto
  hora_fin: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50) // Más permisivo
  dia: string;

  @IsInt()
  @IsPositive()
  @IsOptional()
  aulaId?: number;
}
