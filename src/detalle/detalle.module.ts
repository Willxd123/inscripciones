import { AuthModule } from './../auth/auth.module';
import { Module, forwardRef } from '@nestjs/common';
import { DetalleService } from './detalle.service';
import { DetalleController } from './detalle.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Detalle } from './entities/detalle.entity';
import { Inscripcion } from '../inscripcion/entities/inscripcion.entity';
import { GrupoMateria } from '../grupo-materia/entities/grupo-materia.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Detalle, Inscripcion, GrupoMateria]),forwardRef(() => AuthModule),
  ],
  controllers: [DetalleController],
  providers: [DetalleService],
  exports: [DetalleService], // Exporta el servicio si otros módulos lo necesitan
})
export class DetalleModule {}