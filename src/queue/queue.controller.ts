import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { QueueConfigService } from './queue-config.service';
import { AuthGuard } from '../auth/guard/auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { SetQueueModeDto } from './dto/set-queue-mode.dto';

@Controller('queue')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class QueueController {
  constructor(private readonly queueConfigService: QueueConfigService) {}

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
}