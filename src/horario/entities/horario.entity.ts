import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Aula } from '../../aula/entities/aula.entity';
import { BoletaHorario } from 'src/boleta-horario/entities/boleta-horario.entity';

@Entity({ name: 'horario' })
export class Horario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'time' })
  hora_inicio: string;

  @Column({ type: 'time' })
  hora_fin: string;

  @Column({ length: 20 })
  dia: string;

  @OneToMany(() => BoletaHorario, (bh) => bh.horario)
  boletasHorario: BoletaHorario[];

  @ManyToOne(() => Aula, (a) => a.horarios, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'aula_id' })
  aula: Aula | null;
}