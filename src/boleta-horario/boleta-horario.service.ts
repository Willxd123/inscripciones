import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateBoletaHorarioDto } from './dto/create-boleta-horario.dto';
import { UpdateBoletaHorarioDto } from './dto/update-boleta-horario.dto';
import { BoletaHorario } from './entities/boleta-horario.entity';

@Injectable()
export class BoletaHorarioService {
  constructor(
    @InjectRepository(BoletaHorario)
    private readonly boletaHorarioRepository: Repository<BoletaHorario>,
  ) {}

  create(createBoletaHorarioDto: CreateBoletaHorarioDto) {
    const boletaHorario = this.boletaHorarioRepository.create(createBoletaHorarioDto);
    return this.boletaHorarioRepository.save(boletaHorario);
  }

  findAll() {
    return this.boletaHorarioRepository.find({ relations: ['grupoMateria', 'horario'] });
  }

  findOne(grupoMateriaId: number, horarioId: number) {
    return this.boletaHorarioRepository.findOne({
      where: { grupoMateriaId, horarioId },
      relations: ['grupoMateria', 'horario']
    });
  }

  update(grupoMateriaId: number, horarioId: number, updateBoletaHorarioDto: UpdateBoletaHorarioDto) {
    return this.boletaHorarioRepository.update({ grupoMateriaId, horarioId }, updateBoletaHorarioDto);
  }

  remove(grupoMateriaId: number, horarioId: number) {
    return this.boletaHorarioRepository.delete({ grupoMateriaId, horarioId });
  }
}