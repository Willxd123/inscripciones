import { Injectable } from '@nestjs/common';
// ❌ REMOVIDO: import { QueueConsumer } from './workers/queue.consumer';

@Injectable()
export class AppService {
  // ❌ REMOVIDO: constructor(private queueConsumer: QueueConsumer) {}
  
  getHello(): string {
    return 'Hello World!';
  }
}