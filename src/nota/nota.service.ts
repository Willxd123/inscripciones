import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateNotaDto } from './dto/create-nota.dto';
import { UpdateNotaDto } from './dto/update-nota.dto';
import { Nota } from './entities/nota.entity';

@Injectable()
export class NotaService {
  constructor(
    @InjectRepository(Nota)
    private readonly notaRepository: Repository<Nota>,
  ) {}

  create(createNotaDto: CreateNotaDto) {
    const nota = this.notaRepository.create(createNotaDto);
    return this.notaRepository.save(nota);
  }

  findAll() {
    return this.notaRepository.find({ relations: ['grupoMateria', 'estudiante'] });
  }

  findOne(grupoMateriaId: number, estudianteId: number) {
    return this.notaRepository.findOne({
      where: { grupoMateriaId, estudianteId },
      relations: ['grupoMateria', 'estudiante']
    });
  }

  update(grupoMateriaId: number, estudianteId: number, updateNotaDto: UpdateNotaDto) {
    return this.notaRepository.update({ grupoMateriaId, estudianteId }, updateNotaDto);
  }

  remove(grupoMateriaId: number, estudianteId: number) {
    return this.notaRepository.delete({ grupoMateriaId, estudianteId });
  }
}