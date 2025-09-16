import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { PlanEstudio } from '../../plan-estudio/entities/plan-estudio.entity';

@Entity({ name: 'carrera' })
export class Carrera {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 150 })
  nombre: string;

  @Column({ length: 20 })
  codigo: string;

  @OneToMany(() => PlanEstudio, (p) => p.carrera)
  planes: PlanEstudio[];
}
