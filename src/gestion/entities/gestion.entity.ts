import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Periodo } from '../../periodo/entities/periodo.entity';

@Entity({ name: 'gestion' })
export class Gestion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', unique: true })
  numero: number;

  @OneToMany(() => Periodo, (p) => p.gestion)
  periodos: Periodo[];
}