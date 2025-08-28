import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAulaDto } from './dto/create-aula.dto';
import { UpdateAulaDto } from './dto/update-aula.dto';
import { Aula } from './entities/aula.entity';

@Injectable()
export class AulaService {
  constructor(
    @InjectRepository(Aula)
    private readonly aulaRepository: Repository<Aula>,
  ) {}

  create(createAulaDto: CreateAulaDto) {
    const aula = this.aulaRepository.create(createAulaDto);
    return this.aulaRepository.save(aula);
  }

  findAll() {
    return this.aulaRepository.find({ relations: ['modulos', 'horarios'] });
  }

  findOne(id: number) {
    return this.aulaRepository.findOne({ 
      where: { id }, 
      relations: ['modulos', 'horarios'] 
    });
  }

  update(id: number, updateAulaDto: UpdateAulaDto) {
    return this.aulaRepository.update(id, updateAulaDto);
  }

  remove(id: number) {
    return this.aulaRepository.delete(id);
  }
}
