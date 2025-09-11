import { Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne, ManyToOne, JoinColumn } from 'typeorm';
import { Inscripcion } from '../../inscripcion/entities/inscripcion.entity';
import { Nota } from '../../nota/entities/nota.entity';
import { on } from 'events';
import { PlanEstudio } from 'src/plan-estudio/entities/plan-estudio.entity';

@Entity({ name: 'estudiante' })
export class Estudiante {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 30, unique: true })
  registro: string;

  @Column({ select: false, nullable: true })
  clave: string;

  @Column({ length: 120 })
  nombre: string;

  @Column({ length: 120 })
  apellido: string;

  @Column({ length: 150, unique: true })
  correo: string;

  @OneToMany(() => Inscripcion, (i) => i.estudiante)
  inscripciones: Inscripcion[];

  @OneToMany(() => Nota, (n) => n.estudiante)
  notas: Nota[];

  @ManyToOne(() => PlanEstudio, (p) => p.estudiantes, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'plan_estudio_id' })
  planEstudio: PlanEstudio | null;
}