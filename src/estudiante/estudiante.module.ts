import { AuthModule } from './../auth/auth.module';
import { Module, forwardRef } from '@nestjs/common';
import { EstudianteService } from './estudiante.service';
import { EstudianteController } from './estudiante.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Estudiante } from './entities/estudiante.entity';
import { Inscripcion } from '../inscripcion/entities/inscripcion.entity';
import { Nota } from '../nota/entities/nota.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Estudiante, Inscripcion, Nota]),
    forwardRef(() => AuthModule),
  ],
  controllers: [EstudianteController],
  providers: [EstudianteService],
  exports: [EstudianteService],
})
export class EstudianteModule {}
