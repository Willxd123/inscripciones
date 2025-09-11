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
    return this.inscripcionRepository.find({
      relations: [
        'estudiante',
        'estudiante.planEstudio',
        'estudiante.planEstudio.carrera',
        'detalles',
        'detalles.grupoMateria',
        'detalles.grupoMateria.materia',
        'detalles.grupoMateria.grupo',
        'detalles.grupoMateria.docente',
        'detalles.grupoMateria.periodo',
        'detalles.grupoMateria.periodo.gestion',
      ],
      select: {
        id: true,
        fechaInscripcion: true,
        estudiante: {
          id: true,
          registro: true,
          nombre: true,
          apellido: true,
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
            periodo: {
              id: true,
              numero: true,
              gestion: {
                id: true,
                numero: true,
              },
            },
          },
        },
      },
    });
  }

  findOne(id: number) {
    return this.inscripcionRepository.findOne({
      where: { id },
      relations: [
        'estudiante',
        'estudiante.planEstudio',
        'estudiante.planEstudio.carrera',
        'detalles',
        'detalles.grupoMateria',
        'detalles.grupoMateria.materia',
        'detalles.grupoMateria.grupo',
        'detalles.grupoMateria.docente',
        'detalles.grupoMateria.periodo',
        'detalles.grupoMateria.periodo.gestion',
        'detalles.grupoMateria.boletahorarios',
        'detalles.grupoMateria.boletahorarios.horario',
      ],
      select: {
        id: true,
        fechaInscripcion: true,
        estudiante: {
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
            periodo: {
              id: true,
              numero: true,
              gestion: {
                id: true,
                numero: true,
              },
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
    });
  }

  update(id: number, updateInscripcionDto: UpdateInscripcionDto) {
    return this.inscripcionRepository.update(id, updateInscripcionDto);
  }

  remove(id: number) {
    return this.inscripcionRepository.delete(id);
  }
}
