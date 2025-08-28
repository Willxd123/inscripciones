// detalle.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { CreateDetalleDto } from './dto/create-detalle.dto';
import { UpdateDetalleDto } from './dto/update-detalle.dto';
import { Detalle } from './entities/detalle.entity';

@Injectable()
export class DetalleService {
  constructor(
    @InjectRepository(Detalle)
    private readonly detalleRepository: Repository<Detalle>,
  ) {}

  create(dto: CreateDetalleDto) {
    const entity: DeepPartial<Detalle> = {
      grupoMateria: { id: dto.grupoMateriaId } as any,
      inscripcion: { id: dto.inscripcionId } as any,
    };

    const detalle = this.detalleRepository.create(entity);
    return this.detalleRepository.save(detalle);
  }

  findAll() {
    return this.detalleRepository.find({
      relations: ['grupoMateria', 'inscripcion'],
    });
  }

  findOne(id: number) {
    return this.detalleRepository.findOne({
      where: { id },
      relations: ['grupoMateria', 'inscripcion'],
    });
  }

  // Usa save para actualizar relaciones; update() no gestiona relaciones
  async update(id: number, dto: UpdateDetalleDto) {
    const partial: DeepPartial<Detalle> = { id };

    if (dto.grupoMateriaId !== undefined) {
      partial.grupoMateria = { id: dto.grupoMateriaId } as any;
    }
    if (dto.inscripcionId !== undefined) {
      partial.inscripcion = { id: dto.inscripcionId } as any;
    }

    return this.detalleRepository.save(partial);
  }

  remove(id: number) {
    return this.detalleRepository.delete(id);
  }
}
