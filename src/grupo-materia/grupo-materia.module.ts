import { DetalleInscripcion } from './../detalle-inscripcion/entities/detalle-inscripcion.entity';
import { QueueModule } from './../queue/queue.module';
import { AuthModule } from './../auth/auth.module';
import { forwardRef, Module } from '@nestjs/common';
import { GrupoMateriaService } from './grupo-materia.service';
import { GrupoMateriaController } from './grupo-materia.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GrupoMateria } from './entities/grupo-materia.entity';
import { Materia } from '../materia/entities/materia.entity';
import { Docente } from '../docente/entities/docente.entity';
import { Grupo } from '../grupo/entities/grupo.entity';
import { Periodo } from '../periodo/entities/periodo.entity';
import { BoletaHorario } from '../boleta-horario/entities/boleta-horario.entity';
import { Nota } from '../nota/entities/nota.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      GrupoMateria, 
      Materia, 
      Docente, 
      Grupo, 
      Periodo, 
      BoletaHorario, DetalleInscripcion , 
      Nota
    ]),forwardRef(() => AuthModule),
    forwardRef(() => QueueModule),
  ],
  controllers: [GrupoMateriaController],
  providers: [GrupoMateriaService],
  exports: [TypeOrmModule, GrupoMateriaService],
})
export class GrupoMateriaModule {}