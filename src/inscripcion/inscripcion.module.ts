import { DetalleInscripcion } from './../detalle-inscripcion/entities/detalle-inscripcion.entity';
import { QueueModule } from './../queue/queue.module';
import { AuthModule } from './../auth/auth.module';
import { forwardRef, Module } from '@nestjs/common';
import { InscripcionService } from './inscripcion.service';
import { InscripcionController } from './inscripcion.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inscripcion } from './entities/inscripcion.entity';
import { Estudiante } from '../estudiante/entities/estudiante.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Inscripcion, Estudiante, DetalleInscripcion]),
    forwardRef(() => AuthModule),
    forwardRef(() => QueueModule),
  ],
  controllers: [InscripcionController],
  providers: [InscripcionService],
  exports: [TypeOrmModule, InscripcionService],
})
export class InscripcionModule {}
