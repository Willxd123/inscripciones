import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, JoinColumn } from 'typeorm';
import { Estudiante } from '../../estudiante/entities/estudiante.entity';
import { Detalle } from 'src/detalle/entities/detalle.entity';

@Entity({ name: 'inscripcion' })
export class Inscripcion {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ name: 'fecha_inscripcion', type: 'timestamp' })
  fechaInscripcion: Date;

  @ManyToOne(() => Estudiante, (e) => e.inscripciones, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'estudiante_id' })
  estudiante: Estudiante;

  @OneToMany(() => Detalle, (d) => d.inscripcion) 
  detalles: Detalle[];
}