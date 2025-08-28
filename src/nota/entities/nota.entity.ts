import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Unique, JoinColumn, Index, PrimaryColumn } from 'typeorm';
import { Estudiante } from '../../estudiante/entities/estudiante.entity';
import { GrupoMateria } from 'src/grupo-materia/entities/grupo-materia.entity';

@Entity({ name: 'nota' })

export class Nota {
  @PrimaryColumn({ name: 'grupo_materia_id', type: 'int' })
  grupoMateriaId: number;

  @PrimaryColumn({ name: 'estudiante_id', type: 'int' })
  estudianteId: number;

  @Column({ type: 'numeric', precision: 5, scale: 2 })
  numero: number;

  @ManyToOne(() => GrupoMateria, (gm) => gm.notas, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'grupo_materia_id' })
  grupoMateria: GrupoMateria;

  @ManyToOne(() => Estudiante, (e) => e.notas, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'estudiante_id' })
  estudiante: Estudiante;
}