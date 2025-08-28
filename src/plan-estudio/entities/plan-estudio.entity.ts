import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn  } from 'typeorm';
import { Carrera } from '../../carrera/entities/carrera.entity';
import { Nivel } from '../../nivel/entities/nivel.entity';

@Entity({ name: 'plan_estudio' })
export class PlanEstudio {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 30, unique: true })
  nombre: string;

  @ManyToOne(() => Carrera, (c) => c.planes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'carrera_id' })
  carrera: Carrera;

  @OneToMany(() => Nivel, (n) => n.plan)
  niveles: Nivel[];
}
