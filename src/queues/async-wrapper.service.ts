// queues/async-wrapper.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { QueueService } from './queue.service';
import { QueueConfigService } from './queue-config.service';
import { StatusService } from './status.service';

export interface ExecutionResult {
  requestId?: string;
  result?: any;
  status: 'queued' | 'completed' | 'processing' | 'failed';
  mode: 'sync' | 'async' | 'sync_fallback';
  timestamp: Date;
  executionTime?: number;
  error?: string;
  message?: string;
}

@Injectable()
export class AsyncWrapperService {
  private readonly logger = new Logger(AsyncWrapperService.name);

  constructor(
    private queueService: QueueService,
    private configService: QueueConfigService,
    private statusService: StatusService,
  ) {}

  async executeOrQueue(
    resource: string,
    operation: string,
    payload: any,
    syncCallback: () => Promise<any>
  ): Promise<ExecutionResult> {
    const startTime = Date.now();
   
    // Registrar el servicio automáticamente
    this.configService.registerService(resource);
   
    const useQueue = this.configService.isQueueEnabled(resource, operation);
    this.logger.log(
      `🔄 ${resource}.${operation} → ${useQueue ? 'ASYNC' : 'SYNC'} mode`
    );

    if (useQueue) {
      return this.executeAsync(resource, operation, payload, startTime, syncCallback);
    } else {
      return this.executeSync(syncCallback, startTime);
    }
  }

  private async executeAsync(
    resource: string,
    operation: string,
    payload: any,
    startTime: number,
    syncCallback: () => Promise<any>
  ): Promise<ExecutionResult> {
    try {
      const requestId = await this.queueService.sendCommand(resource, operation, payload);
     
      // Crear job inicial
      this.statusService.createJob(requestId, resource, operation);
     
      this.logger.log(`📝 Job ${requestId} queued for ${resource}.${operation}`);
     
      return {
        requestId,
        status: 'queued',
        mode: 'async',
        timestamp: new Date(),
        executionTime: Date.now() - startTime,
        message: `Request queued successfully. Use /result/${requestId} to check status.`,
      };
    } catch (error) {
      this.logger.error(`❌ Failed to queue ${resource}.${operation}:`, error);
      
      // Fallback a modo sync si falla la cola
      this.logger.log(`🔄 ${resource}.${operation} → SYNC mode (fallback due to queue error)`);
      
      try {
        const result = await syncCallback();
        return {
          result,
          status: 'completed',
          mode: 'sync_fallback',
          timestamp: new Date(),
          executionTime: Date.now() - startTime,
          message: 'Executed synchronously due to queue unavailability',
        };
      } catch (syncError) {
        return {
          status: 'failed',
          mode: 'sync_fallback',
          timestamp: new Date(),
          executionTime: Date.now() - startTime,
          error: `Queue failed: ${error.message}. Sync fallback failed: ${syncError.message}`,
        };
      }
    }
  }

  private async executeSync(
    syncCallback: () => Promise<any>,
    startTime: number
  ): Promise<ExecutionResult> {
    try {
      const result = await syncCallback();
     
      return {
        result,
        status: 'completed',
        mode: 'sync',
        timestamp: new Date(),
        executionTime: Date.now() - startTime,
      };
    } catch (error) {
      this.logger.error('❌ Sync execution failed:', error);
     
      return {
        status: 'failed',
        mode: 'sync',
        timestamp: new Date(),
        executionTime: Date.now() - startTime,
        error: error.message,
      };
    }
  }

  // Obtener resultado de operación asíncrona
  async getAsyncResult(requestId: string): Promise<any> {
    const job = this.statusService.getStatus(requestId);
   
    if (!job) {
      return {
        error: 'Request ID not found',
        requestId,
        timestamp: new Date(),
      };
    }

    return {
      requestId: job.requestId,
      status: job.status,
      resource: job.resource,
      operation: job.operation,
      result: job.result,
      error: job.error,
      timestamp: job.timestamp,
      createdAt: job.createdAt,
      completedAt: job.completedAt,
      executionTime: job.completedAt
        ? job.completedAt.getTime() - job.timestamp.getTime()
        : null,
    };
  }
}