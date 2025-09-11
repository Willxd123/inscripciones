import { GENERIC_QUEUE } from './generic-queue.processor';
import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { QueueConfigService } from './queue-config.service';
import { AuthGuard } from '../auth/guard/auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { SetQueueModeDto } from './dto/set-queue-mode.dto';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Controller('queue')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class QueueController {
  constructor(
    private readonly queueConfigService: QueueConfigService,
    @InjectQueue(GENERIC_QUEUE) private readonly genericQueue: Queue,
  ) {}
  // Cambiar modo de un servicio (síncrono ↔ asíncrono)
  @Post('config')
  async setQueueMode(@Body() dto: SetQueueModeDto) {
    await this.queueConfigService.setServiceQueueMode(dto.serviceName, dto.useQueue);
    return {
      message: `Servicio ${dto.serviceName} configurado para usar ${dto.useQueue ? 'colas' : 'modo síncrono'}`,
      serviceName: dto.serviceName,
      useQueue: dto.useQueue
    };
  }

  // Pausar cola de un servicio
  @Post('pause/:service')
  async pauseQueue(@Param('service') serviceName: string) {
    await this.queueConfigService.pauseQueue(serviceName);
    return {
      message: `Cola del servicio ${serviceName} pausada`,
      serviceName,
      status: 'paused'
    };
  }

  // Reanudar cola de un servicio
  @Post('resume/:service')
  async resumeQueue(@Param('service') serviceName: string) {
    await this.queueConfigService.resumeQueue(serviceName);
    return {
      message: `Cola del servicio ${serviceName} reanudada`,
      serviceName,
      status: 'running'
    };
  }

  // Ver estado de todas las colas
  @Get('status')
  async getQueueStatus() {
    const configs = await this.queueConfigService.getAllServicesConfig();
    return {
      message: 'Estado actual de las colas',
      services: configs,
      totalServices: configs.length
    };
  }

  // Ver configuración específica de un servicio
  @Get('status/:service')
  async getServiceStatus(@Param('service') serviceName: string) {
    const config = await this.queueConfigService.getServiceConfig(serviceName);
    return {
      serviceName,
      useQueue: config.useQueue,
      isPaused: config.isPaused,
      effectiveMode: config.useQueue && !config.isPaused ? 'cola activa' : 
                    config.useQueue && config.isPaused ? 'cola pausada' : 'síncrono'
    };
  }
  // Ver trabajos pendientes y activos de un servicio específico
  @Get('jobs/:service')
  async getServiceJobs(@Param('service') serviceName: string) {
    try {
      const waiting = await this.genericQueue.getWaiting();
      const active = await this.genericQueue.getActive();
      
      // Filtrar trabajos por servicio
      const serviceWaiting = waiting.filter(job => job.data.serviceName === serviceName);
      const serviceActive = active.filter(job => job.data.serviceName === serviceName);
      
      return {
        serviceName,
        waiting: serviceWaiting.length,
        active: serviceActive.length,
        jobs: {
          waiting: serviceWaiting.slice(0, 10).map(job => ({
            id: job.id,
            data: job.data
          })),
          active: serviceActive.map(job => ({
            id: job.id,
            data: job.data
          }))
        }
      };
    } catch (error) {
      return {
        serviceName,
        status: 'error',
        message: 'Error obteniendo trabajos del servicio',
        error: error.message
      };
    }
  }
  // Consultar estado y resultado de un trabajo específico
  @Get('job/:jobId')
  async getJobStatus(@Param('jobId') jobId: string) {
    try {
      const job = await this.genericQueue.getJob(jobId);
      
      if (!job) {
        return {
          jobId,
          status: 'not_found',
          message: 'Trabajo no encontrado'
        };
      }

      // Determinar estado de forma rápida
      let status: string;
      let result: any = null;

      if (job.finishedOn) {
        status = 'completed';
        result = job.returnvalue;
      } else if (job.failedReason) {
        status = 'failed';
        result = { error: job.failedReason };
      } else if (job.processedOn) {
        status = 'processing';
      } else {
        status = 'pending';
      }

      return {
        jobId,
        status,
        result
      };
      
    } catch (error) {
      return {
        jobId,
        status: 'error',
        result: { error: 'Error consultando el trabajo' }
      };
    }
  }
}