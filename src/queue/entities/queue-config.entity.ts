import { Entity, PrimaryColumn, Column, UpdateDateColumn, CreateDateColumn } from 'typeorm';

@Entity({ name: 'queue_config' })
export class QueueConfig {
  @PrimaryColumn({ length: 50 })
  serviceName: string; // 'carrera', 'materia', 'docente', etc.

  @Column({ name: 'use_queue', default: false })
  useQueue: boolean; // true = usa cola, false = síncrono

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}