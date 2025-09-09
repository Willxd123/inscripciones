import { IsString, IsBoolean, IsNotEmpty } from 'class-validator';

export class SetQueueModeDto {
  @IsString()
  @IsNotEmpty()
  serviceName: string;

  @IsBoolean()
  useQueue: boolean;
}