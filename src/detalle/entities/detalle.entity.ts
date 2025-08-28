import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Inscripcion } from '../../inscripcion/entities/inscripcion.entity';
import { GrupoMateria } from 'src/grupo-materia/entities/grupo-materia.entity';

@Entity('detalle')
export class Detalle {
  @PrimaryGeneratedColumn() id: number;

  @ManyToOne(() => GrupoMateria, (gm) => gm.detalles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'grupo_materia_id' })
  grupoMateria: GrupoMateria;

  @ManyToOne(() => Inscripcion, (i) => i.detalles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'inscripcion_id' })
  inscripcion: Inscripcion;
}
