import { Transform } from 'class-transformer';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LogingDto {
  @IsString()
  registro: string;

  @Transform(({ value }) => value.trim())
  @IsString()
  @MinLength(6)
  clave: string;
}
