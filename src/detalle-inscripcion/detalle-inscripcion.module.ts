import { DetalleInscripcion } from './entities/detalle-inscripcion.entity';
import { GrupoMateria } from 'src/grupo-materia/entities/grupo-materia.entity';
import { QueueModule } from './../queue/queue.module';
import { AuthModule } from './../auth/auth.module';
import { Inscripcion } from 'src/inscripcion/entities/inscripcion.entity';
import { Module, forwardRef } from '@nestjs/common';
import { DetalleInscripcionService } from './detalle-inscripcion.service';
import { DetalleInscripcionController } from './detalle-inscripcion.controller';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
      TypeOrmModule.forFeature([GrupoMateria, Inscripcion,  DetalleInscripcion]),
      forwardRef(() => AuthModule),
      forwardRef(() => QueueModule),
    ],
  controllers: [DetalleInscripcionController],
  
  providers: [DetalleInscripcionService],
  exports:[DetalleInscripcionService, TypeOrmModule],
})
export class DetalleInscripcionModule {}
