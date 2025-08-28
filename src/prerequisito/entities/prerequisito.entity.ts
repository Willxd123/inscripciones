import { Entity, PrimaryGeneratedColumn, ManyToOne, Unique, JoinColumn, PrimaryColumn, Check} from 'typeorm';
import { Materia } from '../../materia/entities/materia.entity';

@Entity({ name: 'pre_requisito' })
@Check(`"materia_id" <> "materia_requerida_id"`) // evita que una materia sea prereq de sí misma
export class Prerequisito {

  @PrimaryColumn({ name: 'materia_id', type: 'int' })
  materiaId: number;

  // materia_requerida_id = la materia PREREQUISITO
  @PrimaryColumn({ name: 'materia_requerida_id', type: 'int' })
  materiaRequeridaId: number;

  @ManyToOne(() => Materia, (m) => m.prerequisitos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'materia_id' })
  materia: Materia;

  @ManyToOne(() => Materia, (m) => m.esPrerequisitoDe, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'materia_requerida_id' })
  materiaRequerida: Materia;
}
