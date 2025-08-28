import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateMateriaDto } from './dto/create-materia.dto';
import { UpdateMateriaDto } from './dto/update-materia.dto';
import { Materia } from './entities/materia.entity';

@Injectable()
export class MateriaService {
  constructor(
    @InjectRepository(Materia)
    private readonly materiaRepository: Repository<Materia>,
  ) {}

  create(createMateriaDto: CreateMateriaDto) {
    const materia = this.materiaRepository.create(createMateriaDto);
    return this.materiaRepository.save(materia);
  }

  findAll() {
    return this.materiaRepository.find({ 
      relations: ['nivel', 'prerequisitos', 'esPrerequisitoDe', 'gruposMateria'] 
    });
  }

  findOne(id: number) {
    return this.materiaRepository.findOne({ 
      where: { id }, 
      relations: ['nivel', 'prerequisitos', 'esPrerequisitoDe', 'gruposMateria'] 
    });
  }

  update(id: number, updateMateriaDto: UpdateMateriaDto) {
    return this.materiaRepository.update(id, updateMateriaDto);
  }

  remove(id: number) {
    return this.materiaRepository.delete(id);
  }
}