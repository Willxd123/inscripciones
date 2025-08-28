import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { GrupoMateria } from '../../grupo-materia/entities/grupo-materia.entity';

@Entity({ name: 'grupo' })
export class Grupo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 10 })
  nombre: string;

  @OneToMany(() => GrupoMateria, (gm) => gm.grupo)
  gruposMateria: GrupoMateria[];
}