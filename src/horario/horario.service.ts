import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateHorarioDto } from './dto/create-horario.dto';
import { UpdateHorarioDto } from './dto/update-horario.dto';
import { Horario } from './entities/horario.entity';

@Injectable()
export class HorarioService {
  constructor(
    @InjectRepository(Horario)
    private readonly horarioRepository: Repository<Horario>,
  ) {}

  create(createHorarioDto: CreateHorarioDto) {
    const horario = this.horarioRepository.create(createHorarioDto);
    return this.horarioRepository.save(horario);
  }

  findAll() {
    return this.horarioRepository.find({ relations: ['boletasHorario', 'aula'] });
  }

  findOne(id: number) {
    return this.horarioRepository.findOne({ 
      where: { id }, 
      relations: ['boletasHorario', 'aula'] 
    });
  }

  update(id: number, updateHorarioDto: UpdateHorarioDto) {
    return this.horarioRepository.update(id, updateHorarioDto);
  }

  remove(id: number) {
    return this.horarioRepository.delete(id);
  }
}
