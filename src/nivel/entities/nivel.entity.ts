import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { PlanEstudio } from '../../plan-estudio/entities/plan-estudio.entity';
import { Materia } from '../../materia/entities/materia.entity';

@Entity({ name: 'nivel' })
export class Nivel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  numero: number;

  @ManyToOne(() => PlanEstudio, (p) => p.niveles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'plan_estudio_id' })
  plan: PlanEstudio;

  @OneToMany(() => Materia, (m) => m.nivel)
  materias: Materia[];
}