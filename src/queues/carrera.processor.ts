import { Worker, Queue } from 'bullmq';
import IORedis from 'ioredis';
import { CarreraService } from '../carrera/carrera.service';
import { AppModule } from '../app.module';
import { NestFactory } from '@nestjs/core';
import { StatusService } from './status.service';
/*
// Configuración de Redis
const connection = new IORedis({
  host: process.env.REDIS_HOST! || 'localhost',
  port: parseInt(process.env.REDIS_PORT!) || 6379,
  password: process.env.REDIS_PASSWORD!,
});

// Nombre de la cola
const CARRERA_QUEUE_NAME = 'carrera_queue';

// Función para iniciar worker
export async function startCarreraWorker() {
  const appContext = await NestFactory.createApplicationContext(AppModule);
  const carreraService = appContext.get(CarreraService);
  const statusService = appContext.get(StatusService);

  const worker = new Worker(
    CARRERA_QUEUE_NAME,
    async (job) => {
      try {
        if (job.name === 'create') {
          const result = await carreraService.create(job.data as CreateCarreraDto);
          await statusService.saveResult(job.id.toString(), {
            status: 'completed',
            result,
            timestamp: new Date(),
          });
        }
      } catch (error: unknown) {
        await statusService.saveResult(job.id.toString(), {
          status: 'failed',
          error: error instanceof Error ? error.message : String(error),
          timestamp: new Date(),
        });
      }
    },
    { connection },
  );

  worker.on('completed', (job) => {
    console.log(`✅ Job ${job.id} completado`);
  });

  worker.on('failed', (job, err) => {
    console.log(`❌ Job ${job?.id} falló:`, err);
  });

  console.log('🚀 Carrera worker iniciado');
}*/