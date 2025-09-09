import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn  } from 'typeorm';
import { Carrera } from '../../carrera/entities/carrera.entity';
import { Materia } from 'src/materia/entities/materia.entity';
import { Estudiante } from 'src/estudiante/entities/estudiante.entity';

@Entity({ name: 'plan_estudio' })
export class PlanEstudio {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 30, unique: true })
  nombre: string;

  @ManyToOne(() => Carrera, (c) => c.planes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'carrera_id' })
  carrera: Carrera;

  @OneToMany(() => Materia, (m) => m.planEstudio)
  materias: Materia[];

  @OneToMany(() => Estudiante, (e) => e.planEstudio)
  estudiantes: Estudiante[];

 }
