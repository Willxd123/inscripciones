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

  @ManyToOne(() => GrupoMateria, (gm) => gm.inscripciones, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'grupo_materia_id' })
  grupoMateria: GrupoMateria;


}