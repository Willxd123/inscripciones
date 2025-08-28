import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Materia } from 'src/materia/entities/materia.entity';
import { Docente } from 'src/docente/entities/docente.entity';
import { Grupo } from 'src/grupo/entities/grupo.entity';
import { Periodo } from 'src/periodo/entities/periodo.entity';
import { BoletaHorario } from 'src/boleta-horario/entities/boleta-horario.entity';
import { Detalle } from 'src/detalle/entities/detalle.entity';
import { Nota } from 'src/nota/entities/nota.entity';

@Entity('grupo_materia')
export class GrupoMateria {

    @PrimaryGeneratedColumn() id: number;

    @Column({ type: 'int' }) cupos: number;

    @ManyToOne(() => Materia, (m) => m.gruposMateria, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'materia_id' })
    materia: Materia;

    @ManyToOne(() => Docente, (d) => d.gruposMateria, { onDelete: 'SET NULL', nullable: true })
    @JoinColumn({ name: 'docente_id' })
    docente: Docente | null;

    @ManyToOne(() => Grupo, (g) => g.gruposMateria, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'grupo_id' })
    grupo: Grupo;

    @ManyToOne(() => Periodo, (p) => p.grupoMateria, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'periodo_id' })
    periodo: Periodo;

    @OneToMany(() => BoletaHorario, (bh) => bh.grupoMateria) boletahorarios: BoletaHorario[];
    @OneToMany(() => Detalle, (d) => d.grupoMateria) detalles: Detalle[];
    @OneToMany(() => Nota, (n) => n.grupoMateria) notas: Nota[];
}
