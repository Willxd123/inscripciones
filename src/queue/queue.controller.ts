import { GENERIC_QUEUE } from './generic-queue.processor';
import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { QueueConfigService } from './queue-config.service';
import { AuthGuard } from '../auth/guard/auth.guard';
import { 
  ApiBearerAuth, 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam,
  ApiBody 
} from '@nestjs/swagger';
import { SetQueueModeDto } from './dto/set-queue-mode.dto';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@ApiTags('Queue Management')
@Controller('queue')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class QueueController {
  constructor(
    private readonly queueConfigService: QueueConfigService,
    @InjectQueue(GENERIC_QUEUE) private readonly genericQueue: Queue,
  ) {}

  @Post('config')
  @ApiOperation({ summary: 'Cambiar modo de un servicio (síncrono ↔ asíncrono)' })
  @ApiBody({ type: SetQueueModeDto })
  @ApiResponse({ status: 200, description: 'Configuración aplicada exitosamente' })
  async setQueueMode(@Body() dto: SetQueueModeDto) {
    await this.queueConfigService.setServiceQueueMode(
      dto.serviceName,
      dto.useQueue,
    );
    return {
      message: `Servicio ${dto.serviceName} configurado para usar ${dto.useQueue ? 'colas' : 'modo síncrono'}`,
      serviceName: dto.serviceName,
      useQueue: dto.useQueue,
    };
  }

  @Post('pause/:service')
  @ApiOperation({ summary: 'Pausar cola de un servicio específico' })
  @ApiParam({ name: 'service', description: 'Nombre del servicio' })
  @ApiResponse({ status: 200, description: 'Cola pausada exitosamente' })
  async pauseQueue(@Param('service') serviceName: string) {
    await this.queueConfigService.pauseQueue(serviceName);
    return {
      message: `Cola del servicio ${serviceName} pausada`,
      serviceName,
      status: 'paused',
    };
  }

  @Post('resume/:service')
  @ApiOperation({ summary: 'Reanudar cola de un servicio específico' })
  @ApiParam({ name: 'service', description: 'Nombre del servicio' })
  @ApiResponse({ status: 200, description: 'Cola reanudada exitosamente' })
  async resumeQueue(@Param('service') serviceName: string) {
    await this.queueConfigService.resumeQueue(serviceName);
    return {
      message: `Cola del servicio ${serviceName} reanudada`,
      serviceName,
      status: 'running',
    };
  }

  @Get('status')
  @ApiOperation({ summary: 'Ver estado de todas las colas' })
  @ApiResponse({ status: 200, description: 'Estado de todas las colas' })
  async getQueueStatus() {
    const configs = await this.queueConfigService.getAllServicesConfig();
    return {
      message: 'Estado actual de las colas',
      services: configs,
      totalServices: configs.length,
    };
  }

  @Get('status/:service')
  @ApiOperation({ summary: 'Ver configuración específica de un servicio' })
  @ApiParam({ name: 'service', description: 'Nombre del servicio' })
  @ApiResponse({ status: 200, description: 'Configuración del servicio' })
  async getServiceStatus(@Param('service') serviceName: string) {
    const config = await this.queueConfigService.getServiceConfig(serviceName);
    return {
      serviceName,
      useQueue: config.useQueue,
      isPaused: config.isPaused,
      effectiveMode:
        config.useQueue && !config.isPaused
          ? 'cola activa'
          : config.useQueue && config.isPaused
            ? 'cola pausada'
            : 'síncrono',
    };
  }

  @Get('jobs/:service')
  @ApiOperation({ summary: 'Ver trabajos pendientes y activos de un servicio' })
  @ApiParam({ name: 'service', description: 'Nombre del servicio' })
  @ApiResponse({ status: 200, description: 'Trabajos del servicio' })
  async getServiceJobs(@Param('service') serviceName: string) {
    try {
      const waiting = await this.genericQueue.getWaiting();
      const active = await this.genericQueue.getActive();

      const serviceWaiting = waiting.filter(
        (job) => job.data.serviceName === serviceName,
      );
      const serviceActive = active.filter(
        (job) => job.data.serviceName === serviceName,
      );

      return {
        serviceName,
        waiting: serviceWaiting.length,
        active: serviceActive.length,
        jobs: {
          waiting: serviceWaiting.slice(0, 10).map((job) => ({
            id: job.id,
            data: job.data,
          })),
          active: serviceActive.map((job) => ({
            id: job.id,
            data: job.data,
          })),
        },
      };
    } catch (error) {
      return {
        serviceName,
        status: 'error',
        message: 'Error obteniendo trabajos del servicio',
        error: error.message,
      };
    }
  }

  @Get('job/:jobId')
  @ApiOperation({ summary: 'Consultar estado y resultado de un trabajo específico' })
  @ApiParam({ name: 'jobId', description: 'ID del trabajo' })
  @ApiResponse({ status: 200, description: 'Estado del trabajo' })
  async getJobStatus(@Param('jobId') jobId: string) {
    try {
      const job = await this.genericQueue.getJob(jobId);

      if (!job) {
        return {
          jobId,
          status: 'not_found',
          message: 'Trabajo no encontrado',
        };
      }

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
        result,
      };
    } catch (error) {
      return {
        jobId,
        status: 'error',
        result: { error: 'Error consultando el trabajo' },
      };
    }
  }

  @Post('concurrency/:workers')
  @ApiOperation({ summary: 'Cambiar concurrencia dinámicamente (requiere reinicio)' })
  @ApiParam({ name: 'workers', description: 'Número de workers (1-50)' })
  @ApiResponse({ status: 200, description: 'Concurrencia configurada' })
  async setConcurrency(@Param('workers') workers: string) {
    const numWorkers = parseInt(workers, 10);

    if (numWorkers < 1 || numWorkers > 50) {
      return { error: 'Workers debe estar entre 1 y 50' };
    }

    try {
      process.env.QUEUE_CONCURRENCY = numWorkers.toString();

      return {
        message: `Concurrencia configurada a ${numWorkers} workers (requiere reinicio para aplicarse)`,
        workers: numWorkers,
        currentConcurrency: parseInt(process.env.QUEUE_CONCURRENCY || '5'),
        queueStats: await this.getQueueStats(),
        note: 'La concurrencia se aplicará en el siguiente reinicio de la aplicación',
      };
    } catch (error) {
      return { error: 'Error cambiando concurrencia', details: error.message };
    }
  }

  @Get('concurrency')
  @ApiOperation({ summary: 'Ver concurrencia actual y estadísticas' })
  @ApiResponse({ status: 200, description: 'Concurrencia actual' })
  async getCurrentConcurrency() {
    const stats = await this.getQueueStats();

    return {
      currentConcurrency: parseInt(process.env.QUEUE_CONCURRENCY || '5'),
      queueStats: stats,
      recommendations: {
        suggestedWorkers: this.calculateOptimalWorkers(stats),
      },
    };
  }

  @Get('stats/all')
  @ApiOperation({ summary: 'Estadísticas completas de todas las colas' })
  @ApiResponse({ status: 200, description: 'Estadísticas detalladas' })
  async getAllStats() {
    const waiting = await this.genericQueue.getWaiting();
    const active = await this.genericQueue.getActive();
    const completed = await this.genericQueue.getCompleted();
    const failed = await this.genericQueue.getFailed();

    return {
      total: waiting.length + active.length + completed.length + failed.length,
      waiting: waiting.length,
      active: active.length,
      completed: completed.length,
      failed: failed.length,
      throughput: `${completed.length} trabajos procesados`,
      details: {
        waitingJobs: waiting
          .slice(0, 10)
          .map((j) => ({ id: j.id, data: j.data })),
        completedJobs: completed
          .slice(-10)
          .map((j) => ({ id: j.id, completedAt: j.finishedOn })),
      },
    };
  }

  @Post('config/all/queue')
  @ApiOperation({ summary: 'Cambiar TODOS los servicios a modo cola (asíncrono)' })
  @ApiResponse({ status: 200, description: 'Todos los servicios configurados para colas' })
  async setAllToQueue() {
    const servicios = [
      'carrera', 'plan-estudio', 'estudiante', 'inscripcion', 'aula',
      'boleta-horario', 'docente', 'gestion', 'grupo', 'grupo-materia',
      'horario', 'materia', 'modulo', 'nivel', 'nota', 'periodo',
      'prerequisito', 'detalle-inscripcion',
    ];

    for (const servicio of servicios) {
      await this.queueConfigService.setServiceQueueMode(servicio, true);
    }

    return {
      message: 'Todos los servicios configurados para usar COLAS',
      services: servicios,
      mode: 'asíncrono',
    };
  }

  @Post('config/all/sync')
  @ApiOperation({ summary: 'Cambiar TODOS los servicios a modo síncrono' })
  @ApiResponse({ status: 200, description: 'Todos los servicios configurados para modo síncrono' })
  async setAllToSync() {
    const servicios = [
      'carrera', 'plan-estudio', 'estudiante', 'inscripcion', 'aula',
      'boleta-horario', 'docente', 'gestion', 'grupo', 'grupo-materia',
      'horario', 'materia', 'modulo', 'nivel', 'nota', 'periodo',
      'prerequisito', 'detalle-inscripcion',
    ];

    for (const servicio of servicios) {
      await this.queueConfigService.setServiceQueueMode(servicio, false);
    }

    return {
      message: 'Todos los servicios configurados para modo SÍNCRONO',
      services: servicios,
      mode: 'síncrono',
    };
  }

  @Post('pause/all')
  @ApiOperation({ summary: 'Pausar TODAS las colas' })
  @ApiResponse({ status: 200, description: 'Todas las colas pausadas' })
  async pauseAllQueues() {
    const servicios = [
      'carrera', 'plan-estudio', 'estudiante', 'inscripcion', 'aula',
      'boleta-horario', 'docente', 'gestion', 'grupo', 'grupo-materia',
      'horario', 'materia', 'modulo', 'nivel', 'nota', 'periodo',
      'prerequisito', 'detalle-inscripcion',
    ];

    for (const servicio of servicios) {
      await this.queueConfigService.pauseQueue(servicio);
    }

    return {
      message: 'Todas las colas pausadas',
      services: servicios,
      status: 'paused',
    };
  }

  @Post('resume/all')
  @ApiOperation({ summary: 'Reanudar TODAS las colas' })
  @ApiResponse({ status: 200, description: 'Todas las colas reanudadas' })
  async resumeAllQueues() {
    const servicios = [
      'carrera', 'plan-estudio', 'estudiante', 'inscripcion', 'aula',
      'boleta-horario', 'docente', 'gestion', 'grupo', 'grupo-materia',
      'horario', 'materia', 'modulo', 'nivel', 'nota', 'periodo',
      'prerequisito', 'detalle-inscripcion',
    ];

    for (const servicio of servicios) {
      await this.queueConfigService.resumeQueue(servicio);
    }

    return {
      message: 'Todas las colas reanudadas',
      services: servicios,
      status: 'running',
    };
  }

  @Get('workers/status')
  @ApiOperation({ summary: 'Ver estado de workers y trabajos activos' })
  @ApiResponse({ status: 200, description: 'Estado de workers' })
  async getWorkersStatus() {
    const active = await this.genericQueue.getActive();
    const waiting = await this.genericQueue.getWaiting();

    return {
      concurrency: parseInt(process.env.QUEUE_CONCURRENCY || '10'),
      activeWorkers: active.length,
      availableWorkers:
        parseInt(process.env.QUEUE_CONCURRENCY || '10') - active.length,
      totalJobs: {
        processing: active.length,
        waiting: waiting.length,
      },
      activeJobs: active.map((job) => ({
        jobId: job.id,
        serviceName: job.data.serviceName,
        operation: job.data.operation,
        startedAt: job.processedOn ? new Date(job.processedOn) : null,
        duration: job.processedOn ? Date.now() - job.processedOn : 0,
      })),
      queueStatus:
        active.length >= parseInt(process.env.QUEUE_CONCURRENCY || '10')
          ? 'saturado'
          : 'disponible',
    };
  }

  private async getQueueStats() {
    return {
      waiting: (await this.genericQueue.getWaiting()).length,
      active: (await this.genericQueue.getActive()).length,
      completed: (await this.genericQueue.getCompleted()).length,
      failed: (await this.genericQueue.getFailed()).length,
    };
  }

  private calculateOptimalWorkers(stats: any): number {
    const { waiting } = stats;

    if (waiting > 100) return Math.min(20, Math.ceil(waiting / 10));
    if (waiting > 50) return Math.min(15, Math.ceil(waiting / 5));
    if (waiting > 20) return Math.min(10, Math.ceil(waiting / 3));
    if (waiting > 10) return 8;
    if (waiting > 5) return 5;
    return 3;
  }
}