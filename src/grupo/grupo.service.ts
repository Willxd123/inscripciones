import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateGrupoDto } from './dto/create-grupo.dto';
import { UpdateGrupoDto } from './dto/update-grupo.dto';
import { Grupo } from './entities/grupo.entity';

@Injectable()
export class GrupoService {
  constructor(
    @InjectRepository(Grupo)
    private readonly grupoRepository: Repository<Grupo>,
  ) {}

  create(createGrupoDto: CreateGrupoDto) {
    const grupo = this.grupoRepository.create(createGrupoDto);
    return this.grupoRepository.save(grupo);
  }

  findAll() {
    return this.grupoRepository.find({ relations: ['gruposMateria'] });
  }

  findOne(id: number) {
    return this.grupoRepository.findOne({ 
      where: { id }, 
      relations: ['gruposMateria'] 
    });
  }

  update(id: number, updateGrupoDto: UpdateGrupoDto) {
    return this.grupoRepository.update(id, updateGrupoDto);
  }

  remove(id: number) {
    return this.grupoRepository.delete(id);
  }
}