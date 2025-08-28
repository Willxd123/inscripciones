import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePeriodoDto } from './dto/create-periodo.dto';
import { UpdatePeriodoDto } from './dto/update-periodo.dto';
import { Periodo } from './entities/periodo.entity';

@Injectable()
export class PeriodoService {
  constructor(
    @InjectRepository(Periodo)
    private readonly periodoRepository: Repository<Periodo>,
  ) {}

  create(createPeriodoDto: CreatePeriodoDto) {
    const periodo = this.periodoRepository.create(createPeriodoDto);
    return this.periodoRepository.save(periodo);
  }

  findAll() {
    return this.periodoRepository.find({ relations: ['gestion', 'grupoMateria'] });
  }

  findOne(id: number) {
    return this.periodoRepository.findOne({ 
      where: { id }, 
      relations: ['gestion', 'grupoMateria'] 
    });
  }

  update(id: number, updatePeriodoDto: UpdatePeriodoDto) {
    return this.periodoRepository.update(id, updatePeriodoDto);
  }

  remove(id: number) {
    return this.periodoRepository.delete(id);
  }
}