import { Module, forwardRef, Global } from '@nestjs/common';
import { UniversalWorker } from './universal.worker';
import { QueueConsumer } from './queue.consumer';
import { StatusService } from '../queues/status.service';
import { QueueModule } from '../queues/queue.module';

@Global()
@Module({
  imports: [
    forwardRef(() => QueueModule),
  ],
  providers: [
    UniversalWorker, 
        // Solo como provider, NO como controller
    StatusService
  ],
  exports: [
    UniversalWorker, 
    StatusService
  ],
})
export class WorkersModule {}