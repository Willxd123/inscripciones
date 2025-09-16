import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Inscripcion } from '../../inscripcion/entities/inscripcion.entity';
import { GrupoMateria } from '../../grupo-materia/entities/grupo-materia.entity';

@Entity({ name: 'detalle_inscripcion' })
export class DetalleInscripcion {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Inscripcion, (i) => i.detalles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'inscripcion_id' })
  inscripcion: Inscripcion;

  @ManyToOne(() => GrupoMateria, (gm) => gm.detalles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'grupo_materia_id' })
  grupoMateria: GrupoMateria;
}