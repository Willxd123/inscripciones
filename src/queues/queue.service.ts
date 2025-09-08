// queues/queue.service.ts
import { Injectable, Inject, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);

  constructor(
    @Inject('QUEUE_SERVICE') private client: ClientProxy,
  ) {}

  async sendCommand(resource: string, operation: string, payload: any): Promise<string> {
    const requestId = uuidv4();
    
    try {
      // Construir el patrón que espera el QueueConsumer
      const pattern = `${resource}.${operation}`;
      
      const command = {
        requestId,
        resource,
        operation,
        data: payload,
        timestamp: new Date(),
      };

      this.logger.log(`📤 Sending command: ${pattern} with requestId: ${requestId}`);
      
      // Emitir el mensaje
      this.client.emit(pattern, command);
      
      return requestId;
    } catch (error) {
      this.logger.error(`❌ Failed to send command ${resource}.${operation}:`, error);
      throw error;
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      // Intentar enviar un mensaje de prueba
      this.client.emit('test.connection', { timestamp: new Date() });
      this.logger.log('✅ RabbitMQ connection test sent');
      return true;
    } catch (error) {
      this.logger.error('❌ RabbitMQ connection test failed:', error);
      return false;
    }
  }
}