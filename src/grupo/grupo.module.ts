import { QueueModule } from './../queue/queue.module';
import { AuthModule } from './../auth/auth.module';
import { forwardRef, Module } from '@nestjs/common';
import { GrupoService } from './grupo.service';
import { GrupoController } from './grupo.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Grupo } from './entities/grupo.entity';
import { GrupoMateria } from '../grupo-materia/entities/grupo-materia.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Grupo, GrupoMateria]),forwardRef(() => AuthModule),forwardRef(() => QueueModule),
  ],
  controllers: [GrupoController],
  providers: [GrupoService],
  exports: [TypeOrmModule,GrupoService],
})
export class GrupoModule {}