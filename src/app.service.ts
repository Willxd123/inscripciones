import { QueueConsumer } from './workers/queue.consumer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  constructor(
    private queueConsumer: QueueConsumer, // Forzar instanciación
  ) {}
  getHello(): string {
    return 'Hello World!';
  }
}
