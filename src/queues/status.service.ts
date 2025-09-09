// src/queues/status.service.ts
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import IORedis from 'ioredis';

@Injectable()
export class StatusService {
  private redis: IORedis;

  constructor() {
    this.redis = new IORedis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT!) || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
    });
  }

  async saveResult(requestId: string, data: any) {
    await this.redis.set(`job:${requestId}`, JSON.stringify(data), 'EX', 60 * 60); // 1 hora de expiración
  }

  async getResult(requestId: string) {
    const data = await this.redis.get(`job:${requestId}`);
    if (!data) return { status: 'pending', message: 'Job is still processing or not found' };
    return JSON.parse(data);
  }
}
