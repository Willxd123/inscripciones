import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Aula } from '../../aula/entities/aula.entity';

@Entity({ name: 'modulo' })
export class Modulo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 120 })
  nombre: string;

  @Column({ length: 30 })
  codigo: string;

  @OneToMany(() => Aula, (a) => a.modulo) // Cambiar relación
  aulas: Aula[];
}