import { AuthModule } from './../auth/auth.module';
import { Module, forwardRef } from '@nestjs/common';
import { BoletaHorarioService } from './boleta-horario.service';
import { BoletaHorarioController } from './boleta-horario.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoletaHorario } from './entities/boleta-horario.entity';
import { Horario } from '../horario/entities/horario.entity';
import { GrupoMateria } from '../grupo-materia/entities/grupo-materia.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([BoletaHorario, Horario, GrupoMateria]),forwardRef(() => AuthModule),
  ],
  controllers: [BoletaHorarioController],
  providers: [BoletaHorarioService],
  exports: [BoletaHorarioService], 
})
export class BoletaHorarioModule {}