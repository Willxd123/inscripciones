import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { QueueConfig } from './entities/queue-config.entity';
import { QueueConfigService } from './queue-config.service';
import { QueueController } from './queue.controller';
import { AuthModule } from '../auth/auth.module';
import { GenericQueueProcessor, GENERIC_QUEUE } from './generic-queue.processor';
import { GenericWrapperService } from './generic-wrapper.service';
import { CarreraModule } from '../carrera/carrera.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([QueueConfig]),
    BullModule.registerQueue({
      name: GENERIC_QUEUE,
    }),
    forwardRef(() => AuthModule),
    forwardRef(() => CarreraModule),
  ],
  controllers: [QueueController],
  providers: [
    QueueConfigService,
    GenericQueueProcessor,
    GenericWrapperService,
  ],
  exports: [
    QueueConfigService,
    GenericWrapperService,
    TypeOrmModule,
  ],
})
export class QueueModule {}