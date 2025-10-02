import { ColaModule } from './../cola/cola.module';
import { CarreraController } from './carrera.controller';
import { AuthModule } from './../auth/auth.module';
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Carrera } from './entities/carrera.entity';
import { CarreraService } from './carrera.service';
import { PlanEstudio } from 'src/plan-estudio/entities/plan-estudio.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Carrera, PlanEstudio]),
    forwardRef(() => AuthModule),
    forwardRef(() => ColaModule),
  ],
  controllers: [CarreraController],
  providers: [CarreraService],
  exports: [TypeOrmModule, CarreraService],
})
export class CarreraModule {}