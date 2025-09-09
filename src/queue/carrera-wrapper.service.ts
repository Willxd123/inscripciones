import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { CarreraService } from '../carrera/carrera.service';
import { QueueConfigService } from './queue-config.service';
import { CreateCarreraDto } from '../carrera/dto/create-carrera.dto';
import { UpdateCarreraDto } from '../carrera/dto/update-carrera.dto';
import { CARRERA_QUEUE, CARRERA_JOB_TYPES } from './carrera-queue.processor';

@Injectable()
export class CarreraWrapperService {
  private readonly logger = new Logger(CarreraWrapperService.name);
  private readonly serviceName = 'carrera';

  constructor(
    @InjectQueue(CARRERA_QUEUE) private carreraQueue: Queue,
    private readonly carreraService: CarreraService,
    private readonly queueConfigService: QueueConfigService,
  ) {}

  async create(createCarreraDto: CreateCarreraDto) {
    const shouldUseQueue = await this.queueConfigService.shouldUseQueue(this.serviceName);

    if (shouldUseQueue) {
      this.logger.log(`Encolando creación de carrera: ${createCarreraDto.nombre}`);
      
      const job = await this.carreraQueue.add(CARRERA_JOB_TYPES.CREATE, {
        createCarreraDto
      });

      return {
        message: 'Carrera encolada para creación',
        jobId: job.id,
        status: 'queued',
        data: createCarreraDto
      };
    } else {
      this.logger.log(`Ejecutando creación directa de carrera: ${createCarreraDto.nombre}`);
      return await this.carreraService.create(createCarreraDto);
    }
  }

  async findAll() {
    // Las consultas siempre van directas (no se encolan)
    return await this.carreraService.findAll();
  }

  async findOne(id: number) {
    // Las consultas siempre van directas (no se encolan)
    return await this.carreraService.findOne(id);
  }

  async update(id: number, updateCarreraDto: UpdateCarreraDto) {
    const shouldUseQueue = await this.queueConfigService.shouldUseQueue(this.serviceName);

    if (shouldUseQueue) {
      this.logger.log(`Encolando actualización de carrera ID: ${id}`);
      
      const job = await this.carreraQueue.add(CARRERA_JOB_TYPES.UPDATE, {
        id,
        updateCarreraDto
      });

      return {
        message: 'Carrera encolada para actualización',
        jobId: job.id,
        status: 'queued',
        carreraId: id,
        data: updateCarreraDto
      };
    } else {
      this.logger.log(`Ejecutando actualización directa de carrera ID: ${id}`);
      return await this.carreraService.update(id, updateCarreraDto);
    }
  }

  async remove(id: number) {
    const shouldUseQueue = await this.queueConfigService.shouldUseQueue(this.serviceName);

    if (shouldUseQueue) {
      this.logger.log(`Encolando eliminación de carrera ID: ${id}`);
      
      const job = await this.carreraQueue.add(CARRERA_JOB_TYPES.DELETE, {
        id
      });

      return {
        message: 'Carrera encolada para eliminación',
        jobId: job.id,
        status: 'queued',
        carreraId: id
      };
    } else {
      this.logger.log(`Ejecutando eliminación directa de carrera ID: ${id}`);
      return await this.carreraService.remove(id);
    }
  }
}