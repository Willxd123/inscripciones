import { ColaModule } from './../cola/cola.module';
import { AuthModule } from './../auth/auth.module';
import { forwardRef, Module } from '@nestjs/common';
import { MateriaService } from './materia.service';
import { MateriaController } from './materia.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Materia } from './entities/materia.entity';
import { Nivel } from '../nivel/entities/nivel.entity';
import { GrupoMateria } from '../grupo-materia/entities/grupo-materia.entity';
import { Prerequisito } from '../prerequisito/entities/prerequisito.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Materia, Nivel, GrupoMateria, Prerequisito]),
    forwardRef(() => AuthModule),forwardRef(() => ColaModule),
  ],
  controllers: [MateriaController],
  providers: [MateriaService],
  exports: [TypeOrmModule, MateriaService],
})
export class MateriaModule {}
