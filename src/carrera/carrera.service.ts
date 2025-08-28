import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCarreraDto } from './dto/create-carrera.dto';
import { UpdateCarreraDto } from './dto/update-carrera.dto';
import { Carrera } from './entities/carrera.entity';

@Injectable()
export class CarreraService {
  constructor(
    @InjectRepository(Carrera)
    private readonly carreraRepository: Repository<Carrera>,
  ) {}

  create(createCarreraDto: CreateCarreraDto) {
    const carrera = this.carreraRepository.create(createCarreraDto);
    return this.carreraRepository.save(carrera);
  }

  findAll() {
    return this.carreraRepository.find({ relations: ['planes'] });
  }

  findOne(id: number) {
    return this.carreraRepository.findOne({ 
      where: { id }, 
      relations: ['planes'] 
    });
  }

  update(id: number, updateCarreraDto: UpdateCarreraDto) {
    return this.carreraRepository.update(id, updateCarreraDto);
  }

  remove(id: number) {
    return this.carreraRepository.delete(id);
  }
}