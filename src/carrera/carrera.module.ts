import { AuthModule } from './../auth/auth.module';
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Carrera } from './entities/carrera.entity';
import { CarreraService } from './carrera.service';
import { CarreraController } from './carrera.controller';
import { PlanEstudio } from 'src/plan-estudio/entities/plan-estudio.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Carrera,PlanEstudio]),forwardRef(() => AuthModule),],
  controllers: [CarreraController],
  providers: [CarreraService],
  exports: [TypeOrmModule],
})
export class CarreraModule {}
