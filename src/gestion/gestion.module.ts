import { QueueModule } from './../queue/queue.module';
import { AuthModule } from './../auth/auth.module';
import { forwardRef, Module } from '@nestjs/common';
import { GestionService } from './gestion.service';
import { GestionController } from './gestion.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Gestion } from './entities/gestion.entity';
import { Periodo } from '../periodo/entities/periodo.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Gestion, Periodo]),forwardRef(() => AuthModule),forwardRef(() => QueueModule),
  ],
  controllers: [GestionController],
  providers: [GestionService],
  exports: [GestionService],
})
export class GestionModule {}