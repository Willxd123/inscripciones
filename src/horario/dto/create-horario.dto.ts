import { IsString, IsNotEmpty, MaxLength, IsOptional, IsInt, IsPositive, Matches } from 'class-validator';

export class CreateHorarioDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, {
    message: 'hora_inicio debe tener formato HH:MM:SS'
  })
  hora_inicio: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, {
    message: 'hora_fin debe tener formato HH:MM:SS'
  })
  hora_fin: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  dia: string;

  @IsInt()
  @IsPositive()
  @IsOptional()
  aulaId?: number;
}
