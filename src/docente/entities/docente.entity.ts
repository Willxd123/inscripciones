import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { GrupoMateria } from '../../grupo-materia/entities/grupo-materia.entity';

@Entity({ name: 'docente' })
export class Docente {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 120 })
  nombre: string;

  @Column({ length: 120 })
  apellido: string;

  @Column({ length: 150, unique: true })
  correo: string;

  @OneToMany(() => GrupoMateria, (gm) => gm.docente)
  gruposMateria: GrupoMateria[];
}