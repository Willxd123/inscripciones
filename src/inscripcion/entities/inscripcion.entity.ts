import { DetalleInscripcion } from './../../detalle-inscripcion/entities/detalle-inscripcion.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, JoinColumn } from 'typeorm';
import { Estudiante } from '../../estudiante/entities/estudiante.entity';
import { GrupoMateria } from 'src/grupo-materia/entities/grupo-materia.entity';

@Entity({ name: 'inscripcion' })
export class Inscripcion {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ name: 'fecha_inscripcion', type: 'timestamp' })
  fechaInscripcion: Date;

  @ManyToOne(() => Estudiante, (e) => e.inscripciones, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'estudiante_id' })
  estudiante: Estudiante;


  @OneToMany(() => DetalleInscripcion, (d) => d.inscripcion)
  detalles: DetalleInscripcion[];

}