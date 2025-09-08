import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateModuloDto } from './dto/create-modulo.dto';
import { UpdateModuloDto } from './dto/update-modulo.dto';
import { Modulo } from './entities/modulo.entity';

@Injectable()
export class ModuloService {
  constructor(
    @InjectRepository(Modulo)
    private readonly moduloRepository: Repository<Modulo>,
  ) {}

  create(createModuloDto: CreateModuloDto) {
    const modulo = this.moduloRepository.create(createModuloDto);
    return this.moduloRepository.save(modulo);
  }

  findAll() {
    return this.moduloRepository.find({ relations: ['aulas'] });
  }
  
  findOne(id: number) {
    return this.moduloRepository.findOne({ 
      where: { id }, 
      relations: ['aulas'] 
    });
  }

  update(id: number, updateModuloDto: UpdateModuloDto) {
    return this.moduloRepository.update(id, updateModuloDto);
  }

  remove(id: number) {
    return this.moduloRepository.delete(id);
  }
}