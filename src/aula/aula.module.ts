import { QueueModule } from './../queue/queue.module';
import { AuthModule } from './../auth/auth.module';
import { Module, forwardRef } from '@nestjs/common';
import { AulaService } from './aula.service';
import { AulaController } from './aula.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Aula } from './entities/aula.entity';
import { Modulo } from '../modulo/entities/modulo.entity';
import { Horario } from '../horario/entities/horario.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Aula, Modulo, Horario]),
    forwardRef(() => AuthModule),
    forwardRef(() => QueueModule),
  ],
  controllers: [AulaController],
  providers: [AulaService],
  exports: [TypeOrmModule, AulaService],
})
export class AulaModule {}
