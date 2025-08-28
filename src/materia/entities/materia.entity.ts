import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Nivel } from '../../nivel/entities/nivel.entity';
import { GrupoMateria } from '../../grupo-materia/entities/grupo-materia.entity';
import { Prerequisito } from '../../prerequisito/entities/prerequisito.entity';


@Entity({ name: 'materia' })
export class Materia {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 150 })
  nombre: string;

  @Column({ length: 20, unique: true })
  sigla: string;

  @ManyToOne(() => Nivel, (n) => n.materias, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'nivel_id' })
  nivel: Nivel | null;

  @OneToMany(() => Prerequisito, (pr) => pr.materia)
  prerequisitos: Prerequisito[];

  @OneToMany(() => Prerequisito, (pr) => pr.materiaRequerida)
  esPrerequisitoDe: Prerequisito[];

  @OneToMany(() => GrupoMateria, (gm) => gm.materia)
  gruposMateria: GrupoMateria[];
}