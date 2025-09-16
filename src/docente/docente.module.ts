import { QueueModule } from './../queue/queue.module';
import { AuthModule } from './../auth/auth.module';
import { forwardRef, Module } from '@nestjs/common';
import { DocenteService } from './docente.service';
import { DocenteController } from './docente.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Docente } from './entities/docente.entity';
import { GrupoMateria } from '../grupo-materia/entities/grupo-materia.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Docente, GrupoMateria]),
    forwardRef(() => AuthModule),
    forwardRef(() => QueueModule),
  ],
  controllers: [DocenteController],
  providers: [DocenteService],
  exports: [DocenteService, TypeOrmModule],
})
export class DocenteModule {}
