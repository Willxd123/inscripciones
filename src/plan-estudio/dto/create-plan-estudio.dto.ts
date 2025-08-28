import { IsString, IsNotEmpty, MaxLength, IsInt, IsPositive } from 'class-validator';

export class CreatePlanEstudioDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  nombre: string;

  @IsInt()
  @IsPositive()
  carreraId: number;
}