// queues/status.service.ts
import { Injectable, Logger } from '@nestjs/common';

export interface JobStatus {
  requestId: string;
  resource: string;
  operation: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  result?: any;
  error?: string;
  timestamp: Date;        // Cuando se creó el job
  createdAt: Date;        // Alias para timestamp (compatibilidad)
  completedAt?: Date;     // Cuando se completó
  startedAt?: Date;       // Cuando comenzó el procesamiento
}

@Injectable()
export class StatusService {
  private readonly logger = new Logger(StatusService.name);
  private jobs = new Map<string, JobStatus>();

  createJob(requestId: string, resource: string, operation: string): JobStatus {
    const now = new Date();
    const job: JobStatus = {
      requestId,
      resource,
      operation,
      status: 'queued',
      timestamp: now,
      createdAt: now,  // Alias para compatibilidad
    };

    this.jobs.set(requestId, job);
    this.logger.log(`📋 Job created: ${requestId} (${resource}.${operation})`);
    
    return job;
  }

  updateStatus(
    requestId: string, 
    status: JobStatus['status'], 
    result?: any, 
    error?: string
  ): boolean {
    const job = this.jobs.get(requestId);
    
    if (!job) {
      this.logger.warn(`⚠️ Job not found: ${requestId}`);
      return false;
    }

    // Actualizar timestamps según el estado
    if (status === 'processing' && !job.startedAt) {
      job.startedAt = new Date();
    }
    
    if (status === 'completed' || status === 'failed') {
      job.completedAt = new Date();
    }

    job.status = status;
    if (result !== undefined) job.result = result;
    if (error) job.error = error;

    this.jobs.set(requestId, job);
    this.logger.log(`📝 Job updated: ${requestId} → ${status}`);
    
    return true;
  }

  getStatus(requestId: string): JobStatus | undefined {
    return this.jobs.get(requestId);
  }

  getAllJobs(): JobStatus[] {
    return Array.from(this.jobs.values());
  }

  getJobsByStatus(status: JobStatus['status']): JobStatus[] {
    return Array.from(this.jobs.values()).filter(job => job.status === status);
  }

  removeJob(requestId: string): boolean {
    const deleted = this.jobs.delete(requestId);
    if (deleted) {
      this.logger.log(`🗑️ Job removed: ${requestId}`);
    }
    return deleted;
  }

  // Limpiar jobs antiguos (opcional)
  cleanupOldJobs(maxAgeHours: number = 24): number {
    const cutoff = new Date(Date.now() - maxAgeHours * 60 * 60 * 1000);
    let cleaned = 0;

    for (const [requestId, job] of this.jobs.entries()) {
      if (job.timestamp < cutoff && (job.status === 'completed' || job.status === 'failed')) {
        this.jobs.delete(requestId);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      this.logger.log(`🧹 Cleaned up ${cleaned} old jobs`);
    }

    return cleaned;
  }

  // Estadísticas
  getStats() {
    const jobs = Array.from(this.jobs.values());
    return {
      total: jobs.length,
      queued: jobs.filter(j => j.status === 'queued').length,
      processing: jobs.filter(j => j.status === 'processing').length,
      completed: jobs.filter(j => j.status === 'completed').length,
      failed: jobs.filter(j => j.status === 'failed').length,
    };
  }
}