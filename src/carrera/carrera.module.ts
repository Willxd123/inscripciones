import { MicroserviceModule } from './../microservice.module';
import { AuthModule } from './../auth/auth.module';
import { Module, forwardRef, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Carrera } from './entities/carrera.entity';
import { CarreraService } from './carrera.service';
import { CarreraController } from './carrera.controller';
import { PlanEstudio } from 'src/plan-estudio/entities/plan-estudio.entity';
import { QueueModule } from 'src/queues/queue.module';
import { UniversalWorker } from 'src/workers/universal.worker';

@Module({
  imports: [
    TypeOrmModule.forFeature([Carrera, PlanEstudio]),
    QueueModule,
    forwardRef(() => AuthModule),
  ],
  controllers: [CarreraController],
  providers: [CarreraService],
  exports: [TypeOrmModule, CarreraService],
})
export class CarreraModule implements OnModuleInit {
  constructor(
    private carreraService: CarreraService,
    private universalWorker: UniversalWorker,
  ) {}

  onModuleInit() {
    // Registrar el servicio carrera cuando el módulo se inicializa
    this.universalWorker.registerService('carrera', this.carreraService);
    console.log('✅ CarreraService registered successfully');
  }
}