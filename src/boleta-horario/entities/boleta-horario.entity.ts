import { Entity, ManyToOne, JoinColumn, Unique, PrimaryColumn } from 'typeorm';
import { Horario } from '../../horario/entities/horario.entity';
import { GrupoMateria } from 'src/grupo-materia/entities/grupo-materia.entity';

@Entity('boleta_horario')
export class BoletaHorario {

  @PrimaryColumn({ name: 'grupo_materia_id', type: 'int' })
  grupoMateriaId: number;

  @PrimaryColumn({ name: 'horario_id', type: 'int' })
  horarioId: number;

  @ManyToOne(() => GrupoMateria, (gm) => gm.boletahorarios, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'grupo_materia_id', referencedColumnName: 'id' })
  grupoMateria: GrupoMateria;

  @ManyToOne(() => Horario, (h) => h.boletasHorario, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'horario_id', referencedColumnName: 'id' })
  horario: Horario;
}
