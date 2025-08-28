import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateNivelDto } from './dto/create-nivel.dto';
import { UpdateNivelDto } from './dto/update-nivel.dto';
import { Nivel } from './entities/nivel.entity';

@Injectable()
export class NivelService {
  constructor(
    @InjectRepository(Nivel)
    private readonly nivelRepository: Repository<Nivel>,
  ) {}

  create(createNivelDto: CreateNivelDto) {
    const nivel = this.nivelRepository.create(createNivelDto);
    return this.nivelRepository.save(nivel);
  }

  findAll() {
    return this.nivelRepository.find({ relations: ['plan', 'materias'] });
  }

  findOne(id: number) {
    return this.nivelRepository.findOne({ 
      where: { id }, 
      relations: ['plan', 'materias'] 
    });
  }

  update(id: number, updateNivelDto: UpdateNivelDto) {
    return this.nivelRepository.update(id, updateNivelDto);
  }

  remove(id: number) {
    return this.nivelRepository.delete(id);
  }
}
