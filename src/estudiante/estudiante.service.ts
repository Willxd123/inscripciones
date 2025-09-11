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
    return this.estudianteRepository.find({
      relations: [
        'inscripciones',
        'notas',
        'planEstudio',
        'planEstudio.carrera',
      ],
      select: {
        id: true,
        registro: true,
        nombre: true,
        apellido: true,
        correo: true,
        planEstudio: {
          id: true,
          nombre: true,
          carrera: {
            id: true,
            nombre: true,
            codigo: true,
          },
        },
      },
    });
  }

  findOne(id: number) {
    return this.estudianteRepository.findOne({
      where: { id },
      relations: [
        'inscripciones',
        'inscripciones.detalles',
        'inscripciones.detalles.grupoMateria',
        'inscripciones.detalles.grupoMateria.materia',
        'inscripciones.detalles.grupoMateria.grupo',
        'inscripciones.detalles.grupoMateria.docente',
        'inscripciones.detalles.grupoMateria.boletahorarios',
        'inscripciones.detalles.grupoMateria.boletahorarios.horario',
        'notas',
        'planEstudio',
        'planEstudio.carrera',
      ],
      select: {
        id: true,
        registro: true,
        nombre: true,
        apellido: true,
        correo: true,
        inscripciones: {
          id: true,
          fechaInscripcion: true,
          detalles: {
            id: true,
            grupoMateria: {
              id: true,
              cupos: true,
              materia: {
                id: true,
                nombre: true,
                sigla: true,
              },
              grupo: {
                id: true,
                nombre: true,
              },
              docente: {
                id: true,
                nombre: true,
                apellido: true,
              },
              boletahorarios: {
                horario: {
                  id: true,
                  dia: true,
                  hora_inicio: true,
                  hora_fin: true,
                },
              },
            },
          },
        },
        planEstudio: {
          id: true,
          nombre: true,
          carrera: {
            id: true,
            nombre: true,
            codigo: true,
          },
        },
      },
    });
  }

  async update(id: number, updateEstudianteDto: UpdateEstudianteDto) {
    const estudiante = await this.estudianteRepository.findOneBy({ id });
    if (!estudiante) throw new Error(`Estudiante ${id} no encontrado`);

    if (updateEstudianteDto.clave) {
      updateEstudianteDto.clave = await bcrypt.hash(
        updateEstudianteDto.clave,
        10,
      );
    }

    return this.estudianteRepository.update(id, updateEstudianteDto);
  }

  remove(id: number) {
    return this.estudianteRepository.delete(id);
  }
  findByRegistroWithPassword(registro: string) {
    return this.estudianteRepository.findOne({
      where: { registro },
      select: ['id', 'nombre', 'apellido', 'correo', 'registro', 'clave'],
    });
  }
}
