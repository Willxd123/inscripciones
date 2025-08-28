import { AuthModule } from './../auth/auth.module';
import { forwardRef, Module } from '@nestjs/common';
import { NivelService } from './nivel.service';
import { NivelController } from './nivel.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Nivel } from './entities/nivel.entity';
import { PlanEstudio } from '../plan-estudio/entities/plan-estudio.entity';
import { Materia } from '../materia/entities/materia.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Nivel, PlanEstudio, Materia]),forwardRef(() => AuthModule),
  ],
  controllers: [NivelController],
  providers: [NivelService],
  exports: [NivelService],
})
export class NivelModule {}