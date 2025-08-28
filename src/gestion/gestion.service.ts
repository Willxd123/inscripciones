import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateGestionDto } from './dto/create-gestion.dto';
import { UpdateGestionDto } from './dto/update-gestion.dto';
import { Gestion } from './entities/gestion.entity';

@Injectable()
export class GestionService {
  constructor(
    @InjectRepository(Gestion)
    private readonly gestionRepository: Repository<Gestion>,
  ) {}

  create(createGestionDto: CreateGestionDto) {
    const gestion = this.gestionRepository.create(createGestionDto);
    return this.gestionRepository.save(gestion);
  }

  findAll() {
    return this.gestionRepository.find({ relations: ['periodos'] });
  }

  findOne(id: number) {
    return this.gestionRepository.findOne({ 
      where: { id }, 
      relations: ['periodos'] 
    });
  }

  update(id: number, updateGestionDto: UpdateGestionDto) {
    return this.gestionRepository.update(id, updateGestionDto);
  }

  remove(id: number) {
    return this.gestionRepository.delete(id);
  }
}