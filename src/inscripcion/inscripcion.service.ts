import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateInscripcionDto } from './dto/create-inscripcion.dto';
import { UpdateInscripcionDto } from './dto/update-inscripcion.dto';
import { Inscripcion } from './entities/inscripcion.entity';

@Injectable()
export class InscripcionService {
  constructor(
    @InjectRepository(Inscripcion)
    private readonly inscripcionRepository: Repository<Inscripcion>,
  ) {}

  create(createInscripcionDto: CreateInscripcionDto) {
    const inscripcion = this.inscripcionRepository.create(createInscripcionDto);
    return this.inscripcionRepository.save(inscripcion);
  }

  findAll() {
    return this.inscripcionRepository.find({ relations: ['estudiante', 'detalles'] });
  }

  findOne(id: number) {
    return this.inscripcionRepository.findOne({ 
      where: { id }, 
      relations: ['estudiante', 'detalles'] 
    });
  }

  update(id: number, updateInscripcionDto: UpdateInscripcionDto) {
    return this.inscripcionRepository.update(id, updateInscripcionDto);
  }

  remove(id: number) {
    return this.inscripcionRepository.delete(id);
  }
}