import { Controller, Get, Post, Body, Param, UseGuards, Put, Delete } from '@nestjs/common';
import { QueueConfigService } from './queue-config.service';
import { ServiceLoadBalancerService } from './service-load-balancer.service';
import { AuthGuard } from '../auth/guard/auth.guard';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { SetQueueModeDto } from './dto/set-queue-mode.dto';
import { GenericQueueProcessor } from './generic-queue.processor';

interface CreateWorkerQueueDto {
  workerQueueName: string;
  concurrency: number;
  services: string[];
}

@ApiTags('Queue Management')
@Controller('queue')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class QueueController {
  constructor(
    private readonly queueConfigService: QueueConfigService,
    private readonly serviceLoadBalancerService: ServiceLoadBalancerService,
    private readonly genericQueueProcessor: GenericQueueProcessor,
  ) {}

  // ============ ENDPOINTS DE SERVICIOS ============

  @Post('config')
  @ApiOperation({ summary: 'Cambiar modo de un servicio (síncrono ↔ asíncrono)' })
  async setQueueMode(@Body() dto: SetQueueModeDto) {
    await this.queueConfigService.setServiceQueueMode(dto.serviceName, dto.useQueue);
    return {
      message: `Servicio ${dto.serviceName} configurado para usar ${dto.useQueue ? 'colas' : 'modo síncrono'}`,
      serviceName: dto.serviceName,
      useQueue: dto.useQueue,
    };
  }

  @Get('status')
  @ApiOperation({ summary: 'Ver estado de todas las colas' })
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
  async getServiceStatus(@Param('service') serviceName: string) {
    const config = await this.queueConfigService.getServiceConfig(serviceName);
    return {
      serviceName,
      useQueue: config.useQueue,
      isPaused: config.isPaused,
      effectiveMode: config.useQueue && !config.isPaused ? 'cola activa' : config.useQueue && config.isPaused ? 'cola pausada' : 'síncrono',
    };
  }

  @Post('config/all/queue')
  @ApiOperation({ summary: 'Cambiar TODOS los servicios a modo cola' })
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

  // ============ ENDPOINTS DE WORKER QUEUES ============

  @Post('worker-queues')
  @ApiOperation({ summary: 'Crear nueva worker queue (REQUIERE REINICIO)' })
  @ApiResponse({ status: 201, description: 'Worker queue creada - reiniciar app para activar' })
  async createWorkerQueue(@Body() body: { workerQueueName: string; concurrency: number; services: string[] }) {
    await this.queueConfigService.createWorkerQueue(
      body.workerQueueName,
      body.concurrency,
      body.services
    );

    return {
      message: `Worker queue ${body.workerQueueName} creada`,
      workerQueueName: body.workerQueueName,
      concurrency: body.concurrency,
      services: body.services,
      warning: '⚠️ REINICIAR LA APLICACIÓN para que la cola se registre en Bull',
    };
  }

  @Get('worker-queues')
  @ApiOperation({ summary: 'Listar todas las worker queues' })
  async getAllWorkerQueues() {
    const workerQueues = await this.queueConfigService.getAllWorkerQueues();
    const stats = await this.serviceLoadBalancerService.getAllWorkerQueuesStats();

    return {
      message: 'Worker queues activas',
      totalWorkerQueues: workerQueues.length,
      workerQueues: stats,
    };
  }

  @Get('worker-queues/:name')
  @ApiOperation({ summary: 'Obtener worker queue específica' })
  async getWorkerQueue(@Param('name') workerQueueName: string) {
    const config = await this.queueConfigService.getWorkerQueueConfig(workerQueueName);
    
    if (!config) {
      return {
        error: `Worker queue ${workerQueueName} no encontrada`,
        workerQueueName,
      };
    }

    const allStats = await this.serviceLoadBalancerService.getAllWorkerQueuesStats();
    const stats = allStats.find(stat => stat.workerQueueName === workerQueueName);

    // Verificar si la cola está físicamente registrada
    const queue = this.genericQueueProcessor.getQueue(workerQueueName);
    const isPhysicallyRegistered = !!queue;

    return {
      workerQueueName: config.workerQueueName,
      concurrency: config.workerQueueConcurrency,
      assignedServices: config.assignedServices,
      enabled: config.enabled,
      physicallyRegistered: isPhysicallyRegistered,
      stats: stats || null,
      warning: !isPhysicallyRegistered ? 'Cola definida en JSON pero no registrada en Bull (reiniciar app)' : undefined,
    };
  }

  @Put('worker-queues/:name/services')
  @ApiOperation({ summary: 'Actualizar servicios asignados' })
  async updateWorkerQueueServices(
    @Param('name') workerQueueName: string,
    @Body() body: { services: string[] }
  ) {
    await this.queueConfigService.updateWorkerQueueServices(workerQueueName, body.services);

    return {
      message: `Servicios de ${workerQueueName} actualizados`,
      workerQueueName,
      newServices: body.services,
      note: 'Cambios aplicados inmediatamente (no requiere reinicio)',
    };
  }

  @Put('worker-queues/:name/concurrency')
  @ApiOperation({ summary: 'Actualizar concurrencia (pausa/reanuda pero requiere reinicio para cambiar workers)' })
  async updateWorkerQueueConcurrency(
    @Param('name') workerQueueName: string,
    @Body() body: { concurrency: number }
  ) {
    await this.queueConfigService.updateWorkerQueueConcurrency(workerQueueName, body.concurrency);
    
    // Cambiar worker en background (no esperar)
    this.genericQueueProcessor.updateWorkerQueueConcurrency(workerQueueName, body.concurrency)
      .catch(error => console.error('Error cambiando worker:', error));
  
    return {
      message: `Concurrencia de ${workerQueueName} actualizada`,
      workerQueueName,
      newConcurrency: body.concurrency,
      note: '✅ Cambio aplicándose en background (~1-2 segundos)',
    };
  }

  @Delete('worker-queues/:name')
  @ApiOperation({ summary: 'Eliminar worker queue (REQUIERE REINICIO)' })
  async removeWorkerQueue(@Param('name') workerQueueName: string) {
    await this.queueConfigService.removeWorkerQueue(workerQueueName);

    return {
      message: `Worker queue ${workerQueueName} eliminada del JSON`,
      workerQueueName,
      warning: '⚠️ REINICIAR LA APLICACIÓN para desregistrar la cola de Bull',
    };
  }

  @Get('worker-queues/:name/jobs')
  @ApiOperation({ summary: 'Ver trabajos de una worker queue específica' })
  async getWorkerQueueJobs(@Param('name') workerQueueName: string) {
    try {
      const queue = this.genericQueueProcessor.getQueue(workerQueueName);
      
      if (!queue) {
        return {
          error: `Worker queue ${workerQueueName} no está registrada físicamente`,
          workerQueueName,
          suggestion: 'Reiniciar la aplicación si fue creada recientemente',
        };
      }

      const waiting = await queue.getWaiting();
      const active = await queue.getActive();
      const completed = await queue.getCompleted();
      const failed = await queue.getFailed();

      return {
        workerQueueName,
        waiting: waiting.length,
        active: active.length,
        completed: completed.length,
        failed: failed.length,
        jobs: {
          waiting: waiting.slice(0, 10).map(job => ({
            id: job.id,
            serviceName: job.data.serviceName,
            operation: job.data.operation,
          })),
          active: active.map(job => ({
            id: job.id,
            serviceName: job.data.serviceName,
            operation: job.data.operation,
          })),
        },
      };
    } catch (error) {
      return {
        workerQueueName,
        error: 'Error obteniendo trabajos',
        details: error.message,
      };
    }
  }

  @Get('job/:jobId')
  @ApiOperation({ summary: 'Consultar estado de un trabajo específico' })
  async getJobStatus(@Param('jobId') jobId: string) {
    // Buscar en todas las worker queues
    const workerQueues = await this.queueConfigService.getAllWorkerQueues();

    for (const wq of workerQueues) {
      const queue = this.genericQueueProcessor.getQueue(wq.workerQueueName);
      if (!queue) continue;

      try {
        const job = await queue.getJob(jobId);

        if (job) {
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
            workerQueue: wq.workerQueueName,
            serviceName: job.data.serviceName,
            operation: job.data.operation,
            status,
            result,
          };
        }
      } catch (error) {
        continue;
      }
    }

    return {
      jobId,
      status: 'not_found',
      message: 'Trabajo no encontrado en ninguna worker queue',
    };
  }

  // ============ LOAD BALANCER ============

  @Get('load-balancer/status')
  @ApiOperation({ summary: 'Ver estado del load balancer' })
  async getLoadBalancerStatus() {
    return await this.serviceLoadBalancerService.getLoadBalancerStatus();
  }

  @Get('load-balancer/service/:serviceName')
  @ApiOperation({ summary: 'Ver a qué worker queue se asignaría un servicio' })
  async getServiceAssignment(@Param('serviceName') serviceName: string) {
    const assignment = await this.serviceLoadBalancerService.selectWorkerQueue(serviceName);

    if (!assignment) {
      return {
        serviceName,
        assignment: 'SÍNCRONO',
        message: 'El servicio está configurado para procesamiento síncrono',
      };
    }

    return {
      serviceName,
      assignment: assignment.workerQueueName,
      reason: assignment.reason,
      stats: {
        waitingJobs: assignment.waitingJobs,
        activeJobs: assignment.activeJobs,
        totalJobs: assignment.totalJobs,
      },
    };
  }

  // ============ SETUP RÁPIDO ============

  @Post('worker-queues/setup/default')
  @ApiOperation({ summary: 'Configuración inicial: 2 worker queues (REQUIERE REINICIO)' })
  async setupDefaultWorkerQueues() {
    await this.queueConfigService.createWorkerQueue(
      'worker-queue-1',
      1,
      ['carrera', 'estudiante', 'inscripcion', 'detalle-inscripcion']
    );

    await this.queueConfigService.createWorkerQueue(
      'worker-queue-2',
      1,
      ['*']
    );

    return {
      message: 'Configuración inicial completada',
      workerQueues: [
        {
          name: 'worker-queue-1',
          concurrency: 1,
          services: ['carrera', 'estudiante', 'inscripcion', 'detalle-inscripcion'],
        },
        {
          name: 'worker-queue-2',
          concurrency: 1,
          services: ['*'],
        },
      ],
      warning: '⚠️ REINICIAR LA APLICACIÓN para activar las colas',
      nextSteps: [
        '1. Reiniciar aplicación',
        '2. Configurar servicios en modo cola: POST /api/queue/config/all/queue',
        '3. Monitorear: GET /api/queue/load-balancer/status',
      ],
    };
  }

  // ============ ESTADÍSTICAS ============

  @Get('stats/all')
  @ApiOperation({ summary: 'Estadísticas globales de todas las worker queues' })
  async getAllStats() {
    const workerQueues = await this.queueConfigService.getAllWorkerQueues();
    const allStats = await this.serviceLoadBalancerService.getAllWorkerQueuesStats();

    const totals = {
      totalWaiting: 0,
      totalActive: 0,
      totalCompleted: 0,
      totalFailed: 0,
    };

    allStats.forEach(stat => {
      totals.totalWaiting += stat.waitingJobs;
      totals.totalActive += stat.activeJobs;
      totals.totalCompleted += stat.completedJobs;
      totals.totalFailed += stat.failedJobs;
    });

    return {
      totalWorkerQueues: workerQueues.length,
      ...totals,
      workerQueues: allStats,
    };
  }
}