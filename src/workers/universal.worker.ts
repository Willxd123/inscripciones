import { Worker } from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
});

export const startUniversalWorker = (queueName: string, processor: (job: any) => Promise<any>) => {
  const worker = new Worker(queueName, processor, { connection });

  worker.on('completed', (job) => console.log(`Job ${job.id} de ${queueName} completado`));
  worker.on('failed', (job, err) => console.error(`Job ${job?.id} de ${queueName} falló`, err));

  console.log(`✅ Worker universal ${queueName} corriendo`);
};
