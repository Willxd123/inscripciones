import { Controller, Get, Post, Body, Param, Patch } from '@nestjs/common';
import { QueueConfigService, ServiceConfig } from './queue-config.service'; // ✅ Importar las interfaces
import { StatusService } from './status.service';
import { QueueService } from './queue.service';
import { IsArray, IsBoolean, IsNumber, IsString } from 'class-validator';

// ✅ DTOs simples sin archivos adicionales
export class UpdateServiceConfigDto {
    @IsBoolean()
    enabled: boolean;
  
    @IsArray()
    @IsString({ each: true })
    operations: string[];
  
    @IsNumber()
    workers: number;
  }

export class CreateServiceConfigDto extends UpdateServiceConfigDto {
  serviceName: string;
}

@Controller('queue-config')
export class QueueConfigController {
  constructor(
    private readonly queueConfigService: QueueConfigService,
    private readonly statusService: StatusService,
    private readonly queueService: QueueService,
  ) {}

  @Get()
  getConfig() {
    return {
      config: this.queueConfigService.getConfig(),
      services: this.queueConfigService.getAvailableServices(),
      stats: this.queueConfigService.getStats(),
    };
  }

  @Get('services/:serviceName')
  getServiceConfig(@Param('serviceName') serviceName: string) {
    const config = this.queueConfigService.getServiceConfig(serviceName);
    if (!config) {
      return { message: `Servicio ${serviceName} no encontrado`, config: null };
    }
    return { serviceName, config };
  }

  @Post('services')
  createServiceConfig(@Body() dto: CreateServiceConfigDto) {
    return this.queueConfigService.updateServiceConfig(
      dto.serviceName,
      dto.enabled,
      dto.operations,
      dto.workers,
    );
  }

  @Patch('services/:serviceName')
  updateServiceConfig(
    @Param('serviceName') serviceName: string,
    @Body() dto: any,
  ) {
    return this.queueConfigService.updateServiceConfig(
      serviceName,
      dto.enabled,
      dto.operations,
      dto.workers,
    );
  }

  @Post('services/:serviceName/toggle')
  toggleService(@Param('serviceName') serviceName: string) {
    return this.queueConfigService.toggleService(serviceName);
  }

  @Post('services/:serviceName/operations/:operation/toggle')
  toggleOperation(
    @Param('serviceName') serviceName: string,
    @Param('operation') operation: string,
  ) {
    return this.queueConfigService.toggleOperation(serviceName, operation);
  }

  @Get('services/:serviceName/test/:operation')
  testOperation(
    @Param('serviceName') serviceName: string,
    @Param('operation') operation: string,
  ) {
    const isEnabled = this.queueConfigService.isQueueEnabled(serviceName, operation);
    const config = this.queueConfigService.getServiceConfig(serviceName);
    
    return {
      serviceName,
      operation,
      queueEnabled: isEnabled,
      mode: isEnabled ? 'async' : 'sync',
      config,
    };
  }

  @Get('test-connection')
  async testConnection() {
    return this.queueService.testConnection();
  }

  @Post('test-command')
  async testCommand(
    @Body() body: { resource: string; operation: string; data: any },
  ) {
    const requestId = await this.queueService.sendCommand(
      body.resource,
      body.operation,
      body.data,
    );
    this.statusService.createJob(requestId, body.resource, body.operation);
    return { requestId, status: 'queued', resource: body.resource, operation: body.operation };
  }

  @Get('status/jobs')
  getAllJobs() {
    const jobs = this.statusService.getAllJobs();
    const summary = {
      total: jobs.length,
      queued: jobs.filter(j => j.status === 'queued').length,
      processing: jobs.filter(j => j.status === 'processing').length,
      completed: jobs.filter(j => j.status === 'completed').length,
      failed: jobs.filter(j => j.status === 'failed').length,
    };
    
    return { summary, jobs };
  }

  @Get('status/jobs/:requestId')
  getJobStatus(@Param('requestId') requestId: string) {
    const job = this.statusService.getStatus(requestId);
    if (!job) {
      return { message: `Job ${requestId} no encontrado`, job: null };
    }
    return { requestId, job };
  }

  @Get('status/summary')
  getStatusSummary() {
    const jobs = this.statusService.getAllJobs();
    const config = this.queueConfigService.getConfig();
    
    return {
      jobs: {
        total: jobs.length,
        queued: jobs.filter(j => j.status === 'queued').length,
        processing: jobs.filter(j => j.status === 'processing').length,
        completed: jobs.filter(j => j.status === 'completed').length,
        failed: jobs.filter(j => j.status === 'failed').length,
      },
      services: {
        total: Object.keys(config.services).length,
        enabled: Object.values(config.services).filter(s => s.enabled).length,
        totalWorkers: Object.values(config.services).reduce((sum, s) => sum + (s.enabled ? s.workers : 0), 0),
      },
    };
  }

  @Post('reload')
  reloadConfig() {
    return this.queueConfigService.reloadConfig();
  }

  @Get('stats')
  getStats() {
    return this.queueConfigService.getStats();
  }
}