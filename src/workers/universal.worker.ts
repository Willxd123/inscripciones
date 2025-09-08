// workers/universal.worker.ts
import { Injectable, Logger } from '@nestjs/common';
import { StatusService } from '../queues/status.service';

export interface ICommand {
  requestId: string;
  resource: string;
  operation: string;
  data: any;
  timestamp: Date;
}

@Injectable()
export class UniversalWorker {
  private readonly logger = new Logger(UniversalWorker.name);
  private services = new Map<string, any>();

  constructor(private statusService: StatusService) {}

  registerService(name: string, service: any): void {
    this.services.set(name, service);
    this.logger.log(`📋 Service '${name}' registered`);
  }

  async processCommand(command: ICommand): Promise<void> {
    const { requestId, resource, operation, data } = command;
    
    try {
      this.logger.log(`🔄 Processing: ${resource}.${operation} [${requestId}]`);
      
      // Actualizar estado a "processing"
      this.statusService.updateStatus(requestId, 'processing');

      const service = this.services.get(resource);
      if (!service) {
        throw new Error(`Service '${resource}' not found`);
      }

      if (typeof service[operation] !== 'function') {
        throw new Error(`Operation '${operation}' not found in service '${resource}'`);
      }

      // Ejecutar la operación
      let result;
      switch (operation) {
        case 'create':
          result = await service.create(data);
          break;
        case 'findAll':
          result = await service.findAll();
          break;
        case 'findOne':
          result = await service.findOne(data.id);
          break;
        case 'update':
          result = await service.update(data.id, data);
          break;
        case 'delete':
          result = await service.remove(data.id);
          break;
        default:
          // Para operaciones personalizadas
          result = await service[operation](data);
          break;
      }

      // Actualizar estado a "completed" con el resultado
      this.statusService.updateStatus(requestId, 'completed', result);
      
      this.logger.log(`✅ Completed: ${resource}.${operation} [${requestId}]`);
      
    } catch (error) {
      this.logger.error(`❌ Failed: ${resource}.${operation} [${requestId}]`, error);
      
      // Actualizar estado a "failed" con el error
      this.statusService.updateStatus(requestId, 'failed', null, error.message);
    }
  }

  getRegisteredServices(): string[] {
    return Array.from(this.services.keys());
  }

  isServiceRegistered(serviceName: string): boolean {
    return this.services.has(serviceName);
  }
}