import { QueueModule } from './../queue/queue.module';
import { AuthModule } from './../auth/auth.module';
import { forwardRef, Module } from '@nestjs/common';
import { HorarioService } from './horario.service';
import { HorarioController } from './horario.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Horario } from './entities/horario.entity';
import { Aula } from '../aula/entities/aula.entity';
import { BoletaHorario } from '../boleta-horario/entities/boleta-horario.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Horario, Aula, BoletaHorario]),forwardRef(() => AuthModule),forwardRef(() => QueueModule),
  ],
  controllers: [HorarioController],
  providers: [HorarioService],
  exports: [TypeOrmModule,HorarioService],
})
export class HorarioModule {}