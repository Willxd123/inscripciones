import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';

@Module({
  imports: [ConfigModule.forRoot()],
  providers: [
    {
      provide: 'CARRERA_QUEUE',
      useFactory: (configService: ConfigService) => {
        return new Queue('carrera', {
          connection: {
            host: configService.get<string>('REDIS_HOST'),
            port: configService.get<number>('REDIS_PORT'),
            password: configService.get<string>('REDIS_PASSWORD'),
          },
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: ['CARRERA_QUEUE'],
})
export class QueueModule {}
