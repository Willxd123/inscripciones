import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateGrupoMateriaDto } from './dto/create-grupo-materia.dto';
import { UpdateGrupoMateriaDto } from './dto/update-grupo-materia.dto';
import { GrupoMateria } from './entities/grupo-materia.entity';

@Injectable()
export class GrupoMateriaService {
  constructor(
    @InjectRepository(GrupoMateria)
    private readonly grupoMateriaRepository: Repository<GrupoMateria>,
  ) {}

  create(createGrupoMateriaDto: CreateGrupoMateriaDto) {
    const grupoMateria = this.grupoMateriaRepository.create(createGrupoMateriaDto);
    return this.grupoMateriaRepository.save(grupoMateria);
  }

  findAll() {
    return this.grupoMateriaRepository.find({ 
      relations: ['materia', 'docente', 'grupo', 'periodo', 'boletahorarios', 'notas'] 
    });
  }

  findOne(id: number) {
    return this.grupoMateriaRepository.findOne({ 
      where: { id }, 
      relations: ['materia', 'docente', 'grupo', 'periodo', 'boletahorarios', 'notas'] 
    });
  }

  update(id: number, updateGrupoMateriaDto: UpdateGrupoMateriaDto) {
    return this.grupoMateriaRepository.update(id, updateGrupoMateriaDto);
  }

  remove(id: number) {
    return this.grupoMateriaRepository.delete(id);
  }
}