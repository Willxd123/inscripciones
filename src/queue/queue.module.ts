import { DetalleInscripcionModule } from './../detalle-inscripcion/detalle-inscripcion.module';
import { BoletaHorarioModule } from './../boleta-horario/boleta-horario.module';
import { GestionModule } from './../gestion/gestion.module';
import { PeriodoModule } from './../periodo/periodo.module';
import { NotaModule } from './../nota/nota.module';
import { InscripcionModule } from './../inscripcion/inscripcion.module';
import { ModuloModule } from './../modulo/modulo.module';
import { AulaModule } from './../aula/aula.module';
import { HorarioModule } from './../horario/horario.module';
import { DocenteModule } from './../docente/docente.module';
import { GrupoMateriaModule } from './../grupo-materia/grupo-materia.module';
import { GrupoModule } from './../grupo/grupo.module';
import { PrerequisitoModule } from './../prerequisito/prerequisito.module';
import { MateriaModule } from './../materia/materia.module';
import { NivelModule } from './../nivel/nivel.module';
import { EstudianteModule } from './../estudiante/estudiante.module';
import { PlanEstudioModule } from '../plan-estudio/plan-estudio.module';
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { QueueConfig } from './entities/queue-config.entity';
import { QueueConfigService } from './queue-config.service';
import { QueueController } from './queue.controller';
import { AuthModule } from '../auth/auth.module';
import {
  GenericQueueProcessor,
  GENERIC_QUEUE,
} from './generic-queue.processor';
import { GenericWrapperService } from './generic-wrapper.service';
import { CarreraModule } from '../carrera/carrera.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([QueueConfig]),
    BullModule.registerQueue({
      name: GENERIC_QUEUE,
    }),
    forwardRef(() => AuthModule),
    forwardRef(() => CarreraModule),
    forwardRef(() => PlanEstudioModule),
    forwardRef(() => EstudianteModule),
    forwardRef(() => NivelModule),
    forwardRef(() => MateriaModule),
    forwardRef(() => PrerequisitoModule),
    forwardRef(() => GrupoModule),
    forwardRef(() => GrupoMateriaModule),
    forwardRef(() => DocenteModule),
    forwardRef(() => HorarioModule),
    forwardRef(() => AulaModule),
    forwardRef(() => ModuloModule),
    forwardRef(() => InscripcionModule),
    forwardRef(() => NotaModule),
    forwardRef(() => PeriodoModule),
    forwardRef(() => GestionModule),
    forwardRef(() => BoletaHorarioModule),
    forwardRef(() => DetalleInscripcionModule),
  ],
  controllers: [QueueController],
  providers: [QueueConfigService, GenericQueueProcessor, GenericWrapperService],
  exports: [QueueConfigService, GenericWrapperService, TypeOrmModule],
})
export class QueueModule {}
