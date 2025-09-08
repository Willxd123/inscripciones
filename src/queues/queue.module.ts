import { Module, forwardRef } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { QueueService } from './queue.service';
import { QueueConfigService } from './queue-config.service';
import { AsyncWrapperService } from './async-wrapper.service';
import { StatusService } from './status.service';
import { QueueConfigController } from './queue-config.controller';
import { ServiceRegistryService } from './service-registry.service';
import { WorkersModule } from '../workers/workers.module';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'QUEUE_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || `amqp://admin:admin123@localhost:5672/academic`],
          queue: 'academic_queue',
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
    forwardRef(() => WorkersModule),
  ],
  controllers: [QueueConfigController],
  providers: [
    QueueService, 
    QueueConfigService, 
    AsyncWrapperService, 
    StatusService,
    ServiceRegistryService,
  ],
  exports: [
    QueueService, 
    QueueConfigService, 
    AsyncWrapperService, 
    StatusService,
    ServiceRegistryService,
  ],
})
export class QueueModule {}