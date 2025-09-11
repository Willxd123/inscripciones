import { QueueModule } from './../queue/queue.module';
import { AuthModule } from './../auth/auth.module';
import { forwardRef, Module } from '@nestjs/common';
import { NotaService } from './nota.service';
import { NotaController } from './nota.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Nota } from './entities/nota.entity';
import { Estudiante } from '../estudiante/entities/estudiante.entity';
import { GrupoMateria } from '../grupo-materia/entities/grupo-materia.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Nota, Estudiante, GrupoMateria]),
    forwardRef(() => AuthModule),
    forwardRef(() => QueueModule),
  ],
  controllers: [NotaController],
  providers: [NotaService],
  exports: [TypeOrmModule, NotaService],
})
export class NotaModule {}
