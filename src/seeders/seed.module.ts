
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { Carrera } from '../carrera/entities/carrera.entity';
import { PlanEstudio } from '../plan-estudio/entities/plan-estudio.entity';
import { Nivel } from '../nivel/entities/nivel.entity';
import { Materia } from '../materia/entities/materia.entity';
import { Prerequisito } from '../prerequisito/entities/prerequisito.entity';
import { Grupo } from '../grupo/entities/grupo.entity';
import { Docente } from '../docente/entities/docente.entity';
import { Aula } from '../aula/entities/aula.entity';
import { Modulo } from '../modulo/entities/modulo.entity';
import { Horario } from '../horario/entities/horario.entity';
import { Gestion } from '../gestion/entities/gestion.entity';
import { Periodo } from '../periodo/entities/periodo.entity';
import { Estudiante } from '../estudiante/entities/estudiante.entity';
import { GrupoMateria } from '../grupo-materia/entities/grupo-materia.entity';
import { Inscripcion } from '../inscripcion/entities/inscripcion.entity';
import { BoletaHorario } from '../boleta-horario/entities/boleta-horario.entity';
import { Nota } from '../nota/entities/nota.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Carrera, PlanEstudio, Nivel, Materia, Prerequisito, Grupo,
      Docente, Aula, Modulo, Horario, Gestion, Periodo, Estudiante,
      GrupoMateria, Inscripcion, BoletaHorario, Nota
    ]),
  ],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}
