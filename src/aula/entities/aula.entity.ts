import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { Modulo } from '../../modulo/entities/modulo.entity';
import { Horario } from '../../horario/entities/horario.entity';

@Entity({ name: 'aula' })
export class Aula {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 30 })
  codigo: string;

  @ManyToOne(() => Modulo, (m) => m.aulas, { onDelete: 'CASCADE' }) 
  @JoinColumn({ name: 'modulo_id' })
  modulo: Modulo;

  @OneToMany(() => Horario, (h) => h.aula)
  horarios: Horario[];
}