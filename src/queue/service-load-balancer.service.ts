import { Injectable, Logger } from '@nestjs/common';
import { QueueConfigService } from './queue-config.service';
import { GenericQueueProcessor } from './generic-queue.processor';

export interface LoadBalancerResult {
  workerQueueName: string;
  waitingJobs: number;
  activeJobs: number;
  totalJobs: number;
  reason: string;
}

@Injectable()
export class ServiceLoadBalancerService {
  private readonly logger = new Logger(ServiceLoadBalancerService.name);

  constructor(
    private readonly queueConfigService: QueueConfigService,
    private readonly genericQueueProcessor: GenericQueueProcessor,
  ) {}

  async selectWorkerQueue(serviceName: string): Promise<LoadBalancerResult | null> {
    const shouldUseQueue = await this.queueConfigService.shouldUseQueue(serviceName);
    
    if (!shouldUseQueue) {
      this.logger.debug(`Servicio ${serviceName} configurado como SÍNCRONO`);
      return null;
    }

    const eligibleQueues = await this.queueConfigService.getWorkerQueuesForService(serviceName);

    if (eligibleQueues.length === 0) {
      this.logger.warn(`No hay worker queues disponibles para ${serviceName}`);
      return null;
    }

    const queueStats = await Promise.all(
      eligibleQueues.map(async (queueConfig) => {
        const stats = await this.getWorkerQueueStats(queueConfig.workerQueueName);
        return { queueConfig, ...stats };
      })
    );

    const selectedQueue = queueStats.reduce((least, current) => {
      if (current.waitingJobs < least.waitingJobs) {
        return current;
      } else if (current.waitingJobs === least.waitingJobs && current.activeJobs < least.activeJobs) {
        return current;
      }
      return least;
    });

    const result: LoadBalancerResult = {
      workerQueueName: selectedQueue.queueConfig.workerQueueName,
      waitingJobs: selectedQueue.waitingJobs,
      activeJobs: selectedQueue.activeJobs,
      totalJobs: selectedQueue.totalJobs,
      reason: `Menos cargada entre ${queueStats.length} worker queues`,
    };

    this.logger.debug(
      `${serviceName} → ${result.workerQueueName} (waiting: ${result.waitingJobs}, active: ${result.activeJobs})`
    );

    return result;
  }

  private async getWorkerQueueStats(workerQueueName: string) {
    try {
      const queue = this.genericQueueProcessor.getQueue(workerQueueName);
      
      if (!queue) {
        this.logger.warn(`Cola ${workerQueueName} no registrada físicamente`);
        return {
          waitingJobs: 0,
          activeJobs: 0,
          completedJobs: 0,
          failedJobs: 0,
          totalJobs: 0,
        };
      }

      const waiting = await queue.getWaiting();
      const active = await queue.getActive();
      const completed = await queue.getCompleted();
      const failed = await queue.getFailed();

      return {
        waitingJobs: waiting.length,
        activeJobs: active.length,
        completedJobs: completed.length,
        failedJobs: failed.length,
        totalJobs: waiting.length + active.length + completed.length + failed.length,
      };
    } catch (error) {
      this.logger.error(`Error stats ${workerQueueName}:`, error.message);
      return {
        waitingJobs: 0,
        activeJobs: 0,
        completedJobs: 0,
        failedJobs: 0,
        totalJobs: 0,
      };
    }
  }

  async getAllWorkerQueuesStats() {
    const allWorkerQueues = await this.queueConfigService.getAllWorkerQueues();

    const stats = await Promise.all(
      allWorkerQueues.map(async (queueConfig) => {
        const queueStats = await this.getWorkerQueueStats(queueConfig.workerQueueName);
        const queue = this.genericQueueProcessor.getQueue(queueConfig.workerQueueName);
        const isPhysicallyRegistered = !!queue;
        
        return {
          workerQueueName: queueConfig.workerQueueName,
          concurrency: queueConfig.workerQueueConcurrency,
          assignedServices: queueConfig.assignedServices,
          enabled: queueConfig.enabled,
          physicallyRegistered: isPhysicallyRegistered,
          ...queueStats,
          loadPercentage: queueConfig.workerQueueConcurrency > 0 
            ? Math.round((queueStats.activeJobs / queueConfig.workerQueueConcurrency) * 100)
            : 0,
          availableWorkers: Math.max(0, queueConfig.workerQueueConcurrency - queueStats.activeJobs),
          status: queueConfig.workerQueueConcurrency === 0 
            ? '⏸️ PAUSADA' 
            : isPhysicallyRegistered 
              ? '✅ ACTIVA' 
              : '⚠️ NO REGISTRADA',
        };
      })
    );

    return stats;
  }

  async getLoadBalancerStatus() {
    const allStats = await this.getAllWorkerQueuesStats();
    const totalWaiting = allStats.reduce((sum, stat) => sum + stat.waitingJobs, 0);
    const totalActive = allStats.reduce((sum, stat) => sum + stat.activeJobs, 0);
    const totalConcurrency = allStats.reduce((sum, stat) => sum + stat.concurrency, 0);
    const totalAvailableWorkers = allStats.reduce((sum, stat) => sum + stat.availableWorkers, 0);

    const activeQueues = allStats.filter(s => s.status === '✅ ACTIVA');
    const pausedQueues = allStats.filter(s => s.status === '⏸️ PAUSADA');
    const unregisteredQueues = allStats.filter(s => s.status === '⚠️ NO REGISTRADA');

    return {
      totalWorkerQueues: allStats.length,
      activeWorkerQueues: activeQueues.length,
      pausedWorkerQueues: pausedQueues.length,
      unregisteredWorkerQueues: unregisteredQueues.length,
      totalWaitingJobs: totalWaiting,
      totalActiveJobs: totalActive,
      totalConcurrency,
      totalAvailableWorkers,
      overallLoad: totalConcurrency > 0 ? Math.round((totalActive / totalConcurrency) * 100) : 0,
      workerQueues: allStats,
      recommendations: this.generateRecommendations(allStats),
      warnings: this.generateWarnings(allStats),
    };
  }

  private generateRecommendations(stats: any[]): string[] {
    const recommendations: string[] = [];

    const overloaded = stats.filter(stat => stat.loadPercentage >= 90 && stat.status === '✅ ACTIVA');
    if (overloaded.length > 0) {
      recommendations.push(
        `Sobrecargadas (>90%): ${overloaded.map(q => q.workerQueueName).join(', ')}`
      );
    }

    const underutilized = stats.filter(stat => stat.loadPercentage <= 10 && stat.concurrency > 1 && stat.status === '✅ ACTIVA');
    if (underutilized.length > 0) {
      recommendations.push(
        `Subutilizadas (<10%): ${underutilized.map(q => q.workerQueueName).join(', ')}`
      );
    }

    const withBacklog = stats.filter(stat => stat.waitingJobs > 10 && stat.status === '✅ ACTIVA');
    if (withBacklog.length > 0) {
      recommendations.push(
        `Acumulación: ${withBacklog.map(q => `${q.workerQueueName} (${q.waitingJobs})`).join(', ')}`
      );
    }

    const idle = stats.filter(stat => stat.totalJobs === 0 && stat.concurrency > 0 && stat.status === '✅ ACTIVA');
    if (idle.length > 0) {
      recommendations.push(
        `Inactivas: ${idle.map(q => q.workerQueueName).join(', ')}`
      );
    }

    if (recommendations.length === 0) {
      recommendations.push('✅ Sistema balanceado');
    }

    return recommendations;
  }

  private generateWarnings(stats: any[]): string[] {
    const warnings: string[] = [];

    const unregistered = stats.filter(s => s.status === '⚠️ NO REGISTRADA');
    if (unregistered.length > 0) {
      warnings.push(
        `⚠️ No registradas: ${unregistered.map(q => q.workerQueueName).join(', ')} - REINICIAR app`
      );
    }

    const pausedWithJobs = stats.filter(s => s.status === '⏸️ PAUSADA' && (s.waitingJobs > 0 || s.activeJobs > 0));
    if (pausedWithJobs.length > 0) {
      warnings.push(
        `⏸️ Pausadas con trabajos: ${pausedWithJobs.map(q => `${q.workerQueueName} (${q.waitingJobs + q.activeJobs})`).join(', ')}`
      );
    }

    const atCapacity = stats.filter(s => s.loadPercentage >= 100 && s.status === '✅ ACTIVA');
    if (atCapacity.length > 0) {
      warnings.push(
        `🔴 Al 100%: ${atCapacity.map(q => q.workerQueueName).join(', ')}`
      );
    }

    const activeQueues = stats.filter(s => s.status === '✅ ACTIVA' && s.concurrency > 0);
    if (activeQueues.length === 0) {
      warnings.push('🔴 CRÍTICO: Sin worker queues activas');
    }

    return warnings;
  }
}