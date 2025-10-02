import { ColaModule } from './../cola/cola.module';
import { AuthModule } from './../auth/auth.module';
import { forwardRef, Module } from '@nestjs/common';
import { PrerequisitoService } from './prerequisito.service';
import { PrerequisitoController } from './prerequisito.controller';

import { TypeOrmModule } from '@nestjs/typeorm';
import { Prerequisito } from './entities/prerequisito.entity';
import { Materia } from '../materia/entities/materia.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Prerequisito, Materia]),
    forwardRef(() => AuthModule),
    forwardRef(() => ColaModule),
  ],
  controllers: [PrerequisitoController],
  providers: [PrerequisitoService],
  exports: [TypeOrmModule, PrerequisitoService],
})
export class PrerequisitoModule {}
