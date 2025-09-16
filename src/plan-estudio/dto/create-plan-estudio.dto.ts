import { IsString, IsNotEmpty, MaxLength, IsInt, IsPositive } from 'class-validator';

export class CreatePlanEstudioDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200) // Más permisivo
  nombre: string;

  @IsInt()
  @IsPositive()
  carreraId: number;
}