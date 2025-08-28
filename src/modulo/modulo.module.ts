import { AuthModule } from './../auth/auth.module';
import { forwardRef, Module } from '@nestjs/common';
import { ModuloService } from './modulo.service';
import { ModuloController } from './modulo.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Modulo } from './entities/modulo.entity';
import { Aula } from '../aula/entities/aula.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Modulo, Aula]),forwardRef(() => AuthModule),
  ],
  controllers: [ModuloController],
  providers: [ModuloService],
  exports: [ModuloService],
})
export class ModuloModule {}