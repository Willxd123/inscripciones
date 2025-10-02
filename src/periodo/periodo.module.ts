import { ColaModule } from './../cola/cola.module';
import { AuthModule } from './../auth/auth.module';
import { forwardRef, Module } from '@nestjs/common';
import { PeriodoService } from './periodo.service';
import { PeriodoController } from './periodo.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Periodo } from './entities/periodo.entity';
import { Gestion } from '../gestion/entities/gestion.entity';
import { GrupoMateria } from '../grupo-materia/entities/grupo-materia.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Periodo, Gestion, GrupoMateria]),forwardRef(() => AuthModule),forwardRef(() => ColaModule),
  ],
  controllers: [PeriodoController],
  providers: [PeriodoService],
  exports: [TypeOrmModule, PeriodoService],
})
export class PeriodoModule {}