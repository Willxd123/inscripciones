import { Module, forwardRef } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { CarreraModule } from '../carrera/carrera.module';
import { QueueModule } from './queue.module';
import {
  CarreraQueueProcessor,
  CARRERA_QUEUE,
} from './carrera-queue.processor';
import { CarreraWrapperService } from './carrera-wrapper.service';

@Module({
  imports: [
    // Registrar la cola específica de carrera
    BullModule.registerQueue({
      name: CARRERA_QUEUE,
    }),

    forwardRef(() => CarreraModule),

    forwardRef(() => QueueModule),
  ],
  providers: [CarreraQueueProcessor, CarreraWrapperService],
  exports: [CarreraWrapperService, BullModule],
})
export class CarreraQueueModule {}
