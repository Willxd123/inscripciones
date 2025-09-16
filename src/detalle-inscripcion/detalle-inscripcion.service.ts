import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDetalleInscripcionDto } from './dto/create-detalle-inscripcion.dto';
import { UpdateDetalleInscripcionDto } from './dto/update-detalle-inscripcion.dto';
import { DetalleInscripcion } from './entities/detalle-inscripcion.entity';

@Injectable()
export class DetalleInscripcionService {
  constructor(
    @InjectRepository(DetalleInscripcion)
    private readonly detalleInscripcionRepository: Repository<DetalleInscripcion>,
  ) {}

  create(createDetalleInscripcionDto: CreateDetalleInscripcionDto) {
    const detalle = this.detalleInscripcionRepository.create(createDetalleInscripcionDto);
    return this.detalleInscripcionRepository.save(detalle);
  }

  findAll() {
    return this.detalleInscripcionRepository.find({
      relations: ['inscripcion', 'grupoMateria', 'grupoMateria.materia', 'grupoMateria.grupo']
    });
  }

  findOne(id: number) {
    return this.detalleInscripcionRepository.findOne({
      where: { id },
      relations: ['inscripcion', 'grupoMateria', 'grupoMateria.materia', 'grupoMateria.grupo']
    });
  }

  update(id: number, updateDetalleInscripcionDto: UpdateDetalleInscripcionDto) {
    return this.detalleInscripcionRepository.update(id, updateDetalleInscripcionDto);
  }

  remove(id: number) {
    return this.detalleInscripcionRepository.delete(id);
  }
}