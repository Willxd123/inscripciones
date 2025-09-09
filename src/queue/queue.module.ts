import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { QueueConfig } from './entities/queue-config.entity';
import { QueueConfigService } from './queue-config.service';
import { QueueController } from './queue.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([QueueConfig]),
    BullModule.registerQueue({
      name: 'carrera-queue',
    }),
    forwardRef(() => AuthModule),
  ],
  controllers: [QueueController],
  providers: [QueueConfigService],
  exports: [QueueConfigService, TypeOrmModule],
})
export class QueueModule {}