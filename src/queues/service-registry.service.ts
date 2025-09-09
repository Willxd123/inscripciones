import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';

@Injectable()
export class ServiceRegistryService {
  private queues: Map<string, Queue> = new Map();

  registerQueue(name: string, queue: Queue) {
    this.queues.set(name, queue);
  }

  getQueue(name: string): Queue | undefined {
    return this.queues.get(name);
  }

  listQueues(): string[] {
    return Array.from(this.queues.keys());
  }
}
