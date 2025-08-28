import { AuthModule } from './../auth/auth.module';
import { forwardRef, Module } from '@nestjs/common';
import { PlanEstudioService } from './plan-estudio.service';
import { PlanEstudioController } from './plan-estudio.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlanEstudio } from './entities/plan-estudio.entity';
import { Carrera } from '../carrera/entities/carrera.entity';
import { Nivel } from '../nivel/entities/nivel.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([PlanEstudio, Carrera, Nivel]),forwardRef(() => AuthModule),
  ],
  controllers: [PlanEstudioController],
  providers: [PlanEstudioService],
  exports: [PlanEstudioService],
})
export class PlanEstudioModule {}