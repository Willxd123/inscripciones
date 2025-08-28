import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateEstudianteDto } from './dto/create-estudiante.dto';
import { UpdateEstudianteDto } from './dto/update-estudiante.dto';
import { Estudiante } from './entities/estudiante.entity';
import * as bcrypt from 'bcryptjs';
@Injectable()
export class EstudianteService {
  constructor(
    @InjectRepository(Estudiante)
    private readonly estudianteRepository: Repository<Estudiante>,
  ) {}

  create(createEstudianteDto: CreateEstudianteDto) {
    const estudiante = this.estudianteRepository.create(createEstudianteDto);
    return this.estudianteRepository.save(estudiante);
  }

  findAll() {
    return this.estudianteRepository.find({ relations: ['inscripciones', 'notas'] });
  }

  findOne(id: number) {
    return this.estudianteRepository.findOne({ 
      where: { id }, 
      relations: ['inscripciones', 'notas'] 
    });
  }

  async update(id: number, updateEstudianteDto: UpdateEstudianteDto) {
    const estudiante = await this.estudianteRepository.findOneBy({ id });
    if (!estudiante) throw new Error(`Estudiante ${id} no encontrado`);
  
    if (updateEstudianteDto.clave) {
      updateEstudianteDto.clave = await bcrypt.hash(updateEstudianteDto.clave, 10);
    }
  
    return this.estudianteRepository.update(id, updateEstudianteDto);
  }

  remove(id: number) {
    return this.estudianteRepository.delete(id);
  }
  findByRegistroWithPassword(registro: string) {
    return this.estudianteRepository.findOne({
      where: { registro },
      select: ['id', 'nombre','apellido', 'correo', 'registro', 'clave']
    });
  }
}