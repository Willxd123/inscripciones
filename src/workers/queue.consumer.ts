// workers/queue.consumer.ts
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { MessagePattern, Payload, Ctx, RmqContext, EventPattern } from '@nestjs/microservices';
import { UniversalWorker } from './universal.worker';
import { StatusService } from '../queues/status.service';
import { ICommand } from './universal.worker';

@Injectable()
export class QueueConsumer implements OnModuleInit {
  private readonly logger = new Logger(QueueConsumer.name);

  constructor(
    private universalWorker: UniversalWorker,
    private statusService: StatusService,
  ) {
    this.logger.log('QueueConsumer constructor called');
  }

  onModuleInit() {
    this.logger.log('🔄 QueueConsumer initialized - Ready to process commands');
    this.logger.log('📋 Registered handlers: carrera.create, carrera.findAll, carrera.findOne, carrera.update, carrera.delete');
  }

  // Usar EventPattern en lugar de MessagePattern para emit()
  @EventPattern('carrera.create')
  async handleCarreraCreate(@Payload() command: ICommand, @Ctx() context?: RmqContext) {
    this.logger.log(`📨 Processing carrera.create with requestId: ${command.requestId}`);
    await this.processCommand(command, context);
  }

  @EventPattern('carrera.findAll')
  async handleCarreraFindAll(@Payload() command: ICommand, @Ctx() context?: RmqContext) {
    this.logger.log(`📨 Processing carrera.findAll with requestId: ${command.requestId}`);
    await this.processCommand(command, context);
  }

  @EventPattern('carrera.findOne')
  async handleCarreraFindOne(@Payload() command: ICommand, @Ctx() context?: RmqContext) {
    this.logger.log(`📨 Processing carrera.findOne with requestId: ${command.requestId}`);
    await this.processCommand(command, context);
  }

  @EventPattern('carrera.update')
  async handleCarreraUpdate(@Payload() command: ICommand, @Ctx() context?: RmqContext) {
    this.logger.log(`📨 Processing carrera.update with requestId: ${command.requestId}`);
    await this.processCommand(command, context);
  }

  @EventPattern('carrera.delete')
  async handleCarreraDelete(@Payload() command: ICommand, @Ctx() context?: RmqContext) {
    this.logger.log(`📨 Processing carrera.delete with requestId: ${command.requestId}`);
    await this.processCommand(command, context);
  }

  // Handler genérico para capturar cualquier evento no manejado
  @EventPattern('*')
  async handleAnyEvent(@Payload() data: any, @Ctx() context?: RmqContext) {
    this.logger.warn(`📨 Received unhandled event:`, data);
  }

  // Método centralizado para procesar comandos
  private async processCommand(command: ICommand, context?: RmqContext): Promise<void> {
    try {
      this.logger.log(`🔄 Processing command: ${command.resource}.${command.operation} - ${command.requestId}`);
      
      // Verificar estructura del comando
      if (!command.requestId || !command.resource || !command.operation) {
        this.logger.error('❌ Invalid command structure:', command);
        if (context) {
          const channel = context.getChannelRef();
          const originalMsg = context.getMessage();
          channel.ack(originalMsg);
        }
        return;
      }

      // Crear o actualizar el job en StatusService si no existe
      if (!this.statusService.getStatus(command.requestId)) {
        this.statusService.createJob(command.requestId, command.resource, command.operation);
      }
      
      // Procesar el comando a través del UniversalWorker
      await this.universalWorker.processCommand(command);
      
      this.logger.log(`✅ Successfully processed: ${command.resource}.${command.operation} - ${command.requestId}`);
      
      if (context) {
        const channel = context.getChannelRef();
        const originalMsg = context.getMessage();
        channel.ack(originalMsg);
      }
      
    } catch (error) {
      this.logger.error(`❌ Error processing command ${command.requestId}:`, error);
      this.statusService.updateStatus(command.requestId, 'failed', null, error.message);
      
      if (context) {
        const channel = context.getChannelRef();
        const originalMsg = context.getMessage();
        channel.ack(originalMsg);
      }
    }
  }
}