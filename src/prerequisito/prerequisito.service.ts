import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePrerequisitoDto } from './dto/create-prerequisito.dto';
import { UpdatePrerequisitoDto } from './dto/update-prerequisito.dto';
import { Prerequisito } from './entities/prerequisito.entity';

@Injectable()
export class PrerequisitoService {
  constructor(
    @InjectRepository(Prerequisito)
    private readonly preRequisitoRepository: Repository<Prerequisito>,
  ) {}

  create(createPrerequisitoDto: CreatePrerequisitoDto) {
    const preRequisito = this.preRequisitoRepository.create(createPrerequisitoDto);
    return this.preRequisitoRepository.save(preRequisito);
  }

  findAll() {
    return this.preRequisitoRepository.find({ relations: ['materia', 'materiaRequerida'] });
  }

  findOne(materiaId: number, materiaRequeridaId: number) {
    return this.preRequisitoRepository.findOne({
      where: { materiaId, materiaRequeridaId },
      relations: ['materia', 'materiaRequerida']
    });
  }

  update(materiaId: number, materiaRequeridaId: number, updatePrerequisitoDto: UpdatePrerequisitoDto) {
    return this.preRequisitoRepository.update({ materiaId, materiaRequeridaId }, updatePrerequisitoDto);
  }

  remove(materiaId: number, materiaRequeridaId: number) {
    return this.preRequisitoRepository.delete({ materiaId, materiaRequeridaId });
  }
}