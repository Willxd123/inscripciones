import { AuthModule } from './../auth/auth.module';
import { forwardRef, Module } from '@nestjs/common';
import { InscripcionService } from './inscripcion.service';
import { InscripcionController } from './inscripcion.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inscripcion } from './entities/inscripcion.entity';
import { Estudiante } from '../estudiante/entities/estudiante.entity';
import { Detalle } from '../detalle/entities/detalle.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Inscripcion, Estudiante, Detalle]),forwardRef(() => AuthModule),
  ],
  controllers: [InscripcionController],
  providers: [InscripcionService],
  exports: [InscripcionService],
})
export class InscripcionModule {}