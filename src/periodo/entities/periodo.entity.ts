import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Gestion } from '../../gestion/entities/gestion.entity';
import { GrupoMateria } from 'src/grupo-materia/entities/grupo-materia.entity';

@Entity({ name: 'periodo' })
export class Periodo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  numero: number;

  @ManyToOne(() => Gestion, (g) => g.periodos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'gestion_id' })
  gestion: Gestion;

  @OneToMany(() => GrupoMateria, (gm) => gm.periodo)
  grupoMateria: GrupoMateria[];
}