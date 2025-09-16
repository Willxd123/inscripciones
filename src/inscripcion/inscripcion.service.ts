import { DetalleInscripcion } from './../detalle-inscripcion/entities/detalle-inscripcion.entity';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { CreateInscripcionDto } from './dto/create-inscripcion.dto';
import { UpdateInscripcionDto } from './dto/update-inscripcion.dto';
import { Inscripcion } from './entities/inscripcion.entity';

@Injectable()
export class InscripcionService {
  private readonly logger = new Logger(InscripcionService.name);

  constructor(
    @InjectRepository(Inscripcion)
    private readonly inscripcionRepository: Repository<Inscripcion>,
    @InjectRepository(DetalleInscripcion)
    private readonly detalleInscripcionRepository: Repository<DetalleInscripcion>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createInscripcionDto: CreateInscripcionDto) {
    this.logger.log(
      'Iniciando creación de inscripción:',
      JSON.stringify(createInscripcionDto, null, 2),
    );

    let inscripcionId: number | undefined;

    try {
      // Paso 1: Ejecutar transacción para crear inscripción y detalles
      await this.dataSource.transaction(async (manager) => {
        // Crear inscripción
        const inscripcion = this.inscripcionRepository.create({
          fechaInscripcion: createInscripcionDto.fechaInscripcion || new Date(),
          estudiante: { id: createInscripcionDto.estudianteId },
        });

        const savedInscripcion = await manager.save(Inscripcion, inscripcion);
        inscripcionId = savedInscripcion.id;

        this.logger.log(`Inscripción creada con ID: ${inscripcionId}`);

        // Crear detalles si existen
        if (
          createInscripcionDto.detalles &&
          createInscripcionDto.detalles.length > 0
        ) {
          const detalles = createInscripcionDto.detalles.map((detalle) =>
            this.detalleInscripcionRepository.create({
              inscripcion: { id: inscripcionId },
              grupoMateria: { id: detalle.grupoMateriaId },
            }),
          );

          await manager.save(DetalleInscripcion, detalles);
          this.logger.log(
            `${detalles.length} detalles creados para inscripción ${inscripcionId}`,
          );
        }
      });

      // Paso 2: Consultar el resultado completo DESPUÉS de la transacción
      if (inscripcionId !== undefined) {
        this.logger.log(
          `Consultando inscripción completa con ID: ${inscripcionId}`,
        );
        const inscripcionCompleta = await this.findOne(inscripcionId);

        if (inscripcionCompleta) {
          this.logger.log(
            `Inscripción ${inscripcionId} retornada exitosamente`,
          );
          return inscripcionCompleta;
        } else {
          this.logger.warn(
            `No se pudo consultar la inscripción ${inscripcionId} después de crearla`,
          );
          return {
            id: inscripcionId,
            message: `Inscripción creada exitosamente. Consulte GET /inscripcion/${inscripcionId} para ver detalles completos.`,
          };
        }
      } else {
        this.logger.error(
          'Error: inscripcionId no fue asignado correctamente.',
        );
        throw new Error('Error interno: inscripcionId no asignado.');
      }
    } catch (error) {
      this.logger.error('Error creando inscripción:', error);
      throw new Error(`Error al crear inscripción: ${error.message}`);
    }
  }

  async findAll() {
    try {
      return await this.inscripcionRepository.find({
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
      });
    } catch (error) {
      this.logger.error('Error consultando todas las inscripciones:', error);
      throw new Error(`Error al consultar inscripciones: ${error.message}`);
    }
  }

  async findOne(id: number) {
    try {
      this.logger.log(`Buscando inscripción con ID: ${id}`);

      const inscripcion = await this.inscripcionRepository.findOne({
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
      });

      if (inscripcion) {
        this.logger.log(
          `Inscripción ${id} encontrada con ${inscripcion.detalles?.length || 0} detalles`,
        );
        return inscripcion;
      } else {
        this.logger.warn(`Inscripción con ID ${id} no encontrada`);
        return null;
      }
    } catch (error) {
      this.logger.error(`Error consultando inscripción ${id}:`, error);
      throw new Error(`Error al consultar inscripción: ${error.message}`);
    }
  }

  async update(id: number, updateInscripcionDto: UpdateInscripcionDto) {
    try {
      this.logger.log(
        `Actualizando inscripción ${id}:`,
        JSON.stringify(updateInscripcionDto, null, 2),
      );

      // Verificar que la inscripción existe
      const inscripcionExistente = await this.inscripcionRepository.findOne({
        where: { id },
      });

      if (!inscripcionExistente) {
        throw new Error(`Inscripción con ID ${id} no encontrada`);
      }

      // Ejecutar actualización en transacción
      await this.dataSource.transaction(async (manager) => {
        // 1. Actualizar campos básicos de la inscripción
        const updateData: any = {};
        if (updateInscripcionDto.fechaInscripcion !== undefined) {
          updateData.fechaInscripcion = updateInscripcionDto.fechaInscripcion;
        }
        if (updateInscripcionDto.estudianteId !== undefined) {
          updateData.estudiante = { id: updateInscripcionDto.estudianteId };
        }

        if (Object.keys(updateData).length > 0) {
          await manager.update(Inscripcion, id, updateData);
          this.logger.log(`Campos básicos de inscripción ${id} actualizados`);
        }

        // 2. Actualizar detalles si se proporcionan
        if (updateInscripcionDto.detalles !== undefined) {
          this.logger.log(`Actualizando detalles de inscripción ${id}`);

          // Eliminar todos los detalles existentes
          await manager.delete(DetalleInscripcion, { inscripcion: { id } });
          this.logger.log(
            `Detalles existentes eliminados para inscripción ${id}`,
          );

          // Crear los nuevos detalles
          if (updateInscripcionDto.detalles.length > 0) {
            const nuevosDetalles = updateInscripcionDto.detalles.map(
              (detalle) =>
                this.detalleInscripcionRepository.create({
                  inscripcion: { id },
                  grupoMateria: { id: detalle.grupoMateriaId },
                }),
            );

            await manager.save(DetalleInscripcion, nuevosDetalles);
            this.logger.log(
              `${nuevosDetalles.length} nuevos detalles creados para inscripción ${id}`,
            );
          }
        }
      });

      this.logger.log(`Inscripción ${id} actualizada exitosamente`);

      // Retornar la inscripción actualizada con todas las relaciones
      return await this.findOne(id);
    } catch (error) {
      this.logger.error(`Error actualizando inscripción ${id}:`, error);
      throw new Error(`Error al actualizar inscripción: ${error.message}`);
    }
  }

  async remove(id: number) {
    try {
      this.logger.log(`Eliminando inscripción ${id}`);

      // Verificar que la inscripción existe
      const inscripcionExistente = await this.inscripcionRepository.findOne({
        where: { id },
      });

      if (!inscripcionExistente) {
        throw new Error(`Inscripción con ID ${id} no encontrada`);
      }

      // Eliminar inscripción (los detalles se eliminan automáticamente por CASCADE)
      const result = await this.inscripcionRepository.delete(id);

      if (result.affected && result.affected > 0) {
        this.logger.log(`Inscripción ${id} eliminada exitosamente`);
        return { message: `Inscripción ${id} eliminada exitosamente` };
      } else {
        throw new Error(`No se pudo eliminar la inscripción ${id}`);
      }
    } catch (error) {
      this.logger.error(`Error eliminando inscripción ${id}:`, error);
      throw new Error(`Error al eliminar inscripción: ${error.message}`);
    }
  }

  // Método adicional para agregar detalles a una inscripción existente
  async agregarDetalles(inscripcionId: number, grupoMateriaIds: number[]) {
    try {
      this.logger.log(
        `Agregando ${grupoMateriaIds.length} detalles a inscripción ${inscripcionId}`,
      );

      // Verificar que la inscripción existe
      const inscripcion = await this.inscripcionRepository.findOne({
        where: { id: inscripcionId },
      });

      if (!inscripcion) {
        throw new Error(`Inscripción con ID ${inscripcionId} no encontrada`);
      }

      // Crear los nuevos detalles en transacción
      await this.dataSource.transaction(async (manager) => {
        const detalles = grupoMateriaIds.map((grupoMateriaId) =>
          this.detalleInscripcionRepository.create({
            inscripcion: { id: inscripcionId },
            grupoMateria: { id: grupoMateriaId },
          }),
        );

        await manager.save(DetalleInscripcion, detalles);
      });

      this.logger.log(
        `Detalles agregados exitosamente a inscripción ${inscripcionId}`,
      );

      // Retornar la inscripción completa actualizada
      return await this.findOne(inscripcionId);
    } catch (error) {
      this.logger.error(
        `Error agregando detalles a inscripción ${inscripcionId}:`,
        error,
      );
      throw new Error(`Error al agregar detalles: ${error.message}`);
    }
  }

  // Método adicional para consultar inscripciones por estudiante
  async findByEstudiante(estudianteId: number) {
    try {
      this.logger.log(
        `Consultando inscripciones del estudiante ${estudianteId}`,
      );

      return await this.inscripcionRepository.find({
        where: { estudiante: { id: estudianteId } },
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
        order: { fechaInscripcion: 'DESC' },
      });
    } catch (error) {
      this.logger.error(
        `Error consultando inscripciones del estudiante ${estudianteId}:`,
        error,
      );
      throw new Error(
        `Error al consultar inscripciones del estudiante: ${error.message}`,
      );
    }
  }
}
