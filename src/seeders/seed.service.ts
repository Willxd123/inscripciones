import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Carrera } from '../carrera/entities/carrera.entity';
import { PlanEstudio } from '../plan-estudio/entities/plan-estudio.entity';
import { Nivel } from '../nivel/entities/nivel.entity';
import { Materia } from '../materia/entities/materia.entity';
import { Prerequisito } from '../prerequisito/entities/prerequisito.entity';
import { Grupo } from '../grupo/entities/grupo.entity';
import { Docente } from '../docente/entities/docente.entity';
import { Aula } from '../aula/entities/aula.entity';
import { Modulo } from '../modulo/entities/modulo.entity';
import { Horario } from '../horario/entities/horario.entity';
import { Gestion } from '../gestion/entities/gestion.entity';
import { Periodo } from '../periodo/entities/periodo.entity';
import { Estudiante } from '../estudiante/entities/estudiante.entity';
import { GrupoMateria } from '../grupo-materia/entities/grupo-materia.entity';
import { Inscripcion } from '../inscripcion/entities/inscripcion.entity';
import { Detalle } from '../detalle/entities/detalle.entity';
import { BoletaHorario } from '../boleta-horario/entities/boleta-horario.entity';
import { Nota } from '../nota/entities/nota.entity';

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(Carrera) private carreraRepository: Repository<Carrera>,
    @InjectRepository(PlanEstudio)
    private planEstudioRepository: Repository<PlanEstudio>,
    @InjectRepository(Nivel) private nivelRepository: Repository<Nivel>,
    @InjectRepository(Materia) private materiaRepository: Repository<Materia>,
    @InjectRepository(Prerequisito)
    private prerequisitoRepository: Repository<Prerequisito>,
    @InjectRepository(Grupo) private grupoRepository: Repository<Grupo>,
    @InjectRepository(Docente) private docenteRepository: Repository<Docente>,
    @InjectRepository(Aula) private aulaRepository: Repository<Aula>,
    @InjectRepository(Modulo) private moduloRepository: Repository<Modulo>,
    @InjectRepository(Horario) private horarioRepository: Repository<Horario>,
    @InjectRepository(Gestion) private gestionRepository: Repository<Gestion>,
    @InjectRepository(Periodo) private periodoRepository: Repository<Periodo>,
    @InjectRepository(Estudiante)
    private estudianteRepository: Repository<Estudiante>,
    @InjectRepository(GrupoMateria)
    private grupoMateriaRepository: Repository<GrupoMateria>,
    @InjectRepository(Inscripcion)
    private inscripcionRepository: Repository<Inscripcion>,
    @InjectRepository(Detalle) private detalleRepository: Repository<Detalle>,
    @InjectRepository(BoletaHorario)
    private boletaHorarioRepository: Repository<BoletaHorario>,
    @InjectRepository(Nota) private notaRepository: Repository<Nota>,
  ) {}

  async runAllSeeds() {
    console.log('🌱 Iniciando seeders...');

    // Verificar si ya existen datos
    const carreraCount = await this.carreraRepository.count();
    if (carreraCount > 0) {
      console.log('✅ Los seeders ya fueron ejecutados anteriormente');
      return;
    }

    try {
      // Orden correcto respetando dependencias
      await this.seedCarreras();
      await this.seedPlanesEstudio();
      await this.seedNiveles();
      await this.seedMaterias();
      await this.seedPrerequisitos();
      await this.seedGrupos();
      await this.seedDocentes();
      await this.seedModulos();
      await this.seedAulas();
      await this.seedHorarios();
      await this.seedGestiones();
      await this.seedPeriodos();
      await this.seedEstudiantes();
      await this.seedGrupoMaterias();
      await this.seedInscripciones();
      await this.seedDetalles();
      await this.seedBoletasHorario();
      await this.seedNotas();

      console.log('🎉 Todos los seeders ejecutados exitosamente');
    } catch (error) {
      console.error('❌ Error ejecutando seeders:', error);
      throw error;
    }
  }

  private async seedCarreras() {
    console.log('📚 Creando carreras...');
    const carreras = [
      { nombre: 'Ingeniería de Sistemas', codigo: 'ISI' },
      { nombre: 'Ingeniería Civil', codigo: 'ICI' },
      { nombre: 'Ingeniería Industrial', codigo: 'IIN' },
      { nombre: 'Administración de Empresas', codigo: 'ADE' },
      { nombre: 'Contaduría Pública', codigo: 'CPU' },
      { nombre: 'Derecho', codigo: 'DER' },
      { nombre: 'Medicina', codigo: 'MED' },
      { nombre: 'Arquitectura', codigo: 'ARQ' },
    ];

    for (const carrera of carreras) {
      await this.carreraRepository.save(this.carreraRepository.create(carrera));
    }
  }

  private async seedPlanesEstudio() {
    console.log('📋 Creando planes de estudio...');
    const carreras = await this.carreraRepository.find();

    for (let i = 0; i < carreras.length; i++) {
      const plan = this.planEstudioRepository.create({
        nombre: `Plan ${carreras[i].codigo} ${2020 + (i % 5)}`, // Usa código de carrera para hacer único
        carrera: carreras[i],
      });
      await this.planEstudioRepository.save(plan);
    }
  }

  private async seedNiveles() {
    console.log('📊 Creando niveles...');
    const planes = await this.planEstudioRepository.find();

    for (const plan of planes) {
      for (let nivel = 1; nivel <= 10; nivel++) {
        const nivelEntity = this.nivelRepository.create({
          numero: nivel,
          plan: plan,
        });
        await this.nivelRepository.save(nivelEntity);
      }
    }
  }

  private async seedMaterias() {
    console.log('📖 Creando materias...');
    const niveles = await this.nivelRepository.find();
    const materiasBase = [
      'Matemáticas I',
      'Física I',
      'Química General',
      'Cálculo I',
      'Álgebra Lineal',
      'Estadística',
      'Programación I',
      'Base de Datos',
      'Estructuras de Datos',
      'Algoritmos',
      'Redes de Computadores',
      'Sistemas Operativos',
      'Ingeniería de Software',
      'Arquitectura de Computadores',
      'Inteligencia Artificial',
      'Contabilidad I',
      'Microeconomía',
      'Macroeconomía',
      'Finanzas I',
      'Marketing',
      'Gestión de Recursos Humanos',
      'Derecho Civil',
      'Derecho Penal',
      'Anatomía Humana',
      'Fisiología',
      'Patología',
      'Farmacología',
    ];

    let siglaCounter = 1;
    for (const nivel of niveles) {
      // 3-5 materias por nivel
      const numMaterias = Math.floor(Math.random() * 3) + 3;
      for (let i = 0; i < numMaterias; i++) {
        const nombreMateria =
          materiasBase[Math.floor(Math.random() * materiasBase.length)];
        const materia = this.materiaRepository.create({
          nombre: `${nombreMateria} - Nivel ${nivel.numero}`,
          sigla: `MAT${siglaCounter.toString().padStart(3, '0')}`,
          nivel: nivel,
        });
        await this.materiaRepository.save(materia);
        siglaCounter++;
      }
    }
  }

  private async seedPrerequisitos() {
    console.log('🔗 Creando prerequisitos...');
    const materias = await this.materiaRepository.find({
      relations: ['nivel'],
    });

    // Filtrar solo materias que tienen nivel asignado
    const materiasConNivel = materias.filter((m) => m.nivel !== null);

    // Crear algunos prerequisitos lógicos
    for (let i = 0; i < 20; i++) {
      const materia =
        materiasConNivel[Math.floor(Math.random() * materiasConNivel.length)];

      // Solo buscar en materias que tienen nivel y es menor al nivel de la materia actual
      const materiasPrevias = materiasConNivel.filter(
        (m) => m.nivel!.numero < materia.nivel!.numero && m.id !== materia.id,
      );

      if (materiasPrevias.length > 0) {
        const materiaRequerida =
          materiasPrevias[Math.floor(Math.random() * materiasPrevias.length)];

        const exists = await this.prerequisitoRepository.findOne({
          where: {
            materiaId: materia.id,
            materiaRequeridaId: materiaRequerida.id,
          },
        });

        if (!exists) {
          const preRequisito = this.prerequisitoRepository.create({
            materiaId: materia.id,
            materiaRequeridaId: materiaRequerida.id,
          });
          await this.prerequisitoRepository.save(preRequisito);
        }
      }
    }
  }

  private async seedGrupos() {
    console.log('👥 Creando grupos...');
    const grupos = ['A', 'B', 'C', 'D', 'E', 'F'];

    for (const nombre of grupos) {
      const grupo = this.grupoRepository.create({ nombre });
      await this.grupoRepository.save(grupo);
    }
  }

  private async seedDocentes() {
    console.log('👨‍🏫 Creando docentes...');
    const nombres = [
      'Juan',
      'María',
      'Carlos',
      'Ana',
      'Luis',
      'Carmen',
      'Pedro',
      'Laura',
      'José',
      'Elena',
    ];
    const apellidos = [
      'García',
      'Rodríguez',
      'López',
      'Martínez',
      'González',
      'Pérez',
      'Sánchez',
      'Ramírez',
    ];

    for (let i = 0; i < 25; i++) {
      const nombre = nombres[Math.floor(Math.random() * nombres.length)];
      const apellido = apellidos[Math.floor(Math.random() * apellidos.length)];
      const docente = this.docenteRepository.create({
        nombre,
        apellido,
        correo: `${nombre.toLowerCase()}.${apellido.toLowerCase()}${i}@universidad.edu`,
      });
      await this.docenteRepository.save(docente);
    }
  }

  private async seedAulas() {
    console.log('Creando aulas...');
    const modulos = await this.moduloRepository.find();

    for (const modulo of modulos) {
      const numAulas = Math.floor(Math.random() * 21) + 20; // 20-40 aulas por módulo
      for (let i = 1; i <= numAulas; i++) {
        const aula = this.aulaRepository.create({
          codigo: `${modulo.codigo}-${i.toString().padStart(3, '0')}`,
          modulo: modulo,
        });
        await this.aulaRepository.save(aula);
      }
    }
  }

  private async seedModulos() {
    console.log('Creando módulos (facultades)...');
    const facultades = [
      {
        nombre: 'Facultad de Ciencias Exactas',
        codigo: 'FCE',
        carreras: ['ISI', 'IIN'],
      },
      { nombre: 'Facultad de Ingeniería', codigo: 'FIN', carreras: ['ICI'] },
      {
        nombre: 'Facultad de Ciencias Económicas',
        codigo: 'ECO',
        carreras: ['ADE', 'CPU'],
      },
      { nombre: 'Facultad de Derecho', codigo: 'DER', carreras: ['DER'] },
      { nombre: 'Facultad de Medicina', codigo: 'MED', carreras: ['MED'] },
      { nombre: 'Facultad de Arquitectura', codigo: 'ARQ', carreras: ['ARQ'] },
    ];
    for (const facultad of facultades) {
      const modulo = this.moduloRepository.create({
        nombre: facultad.nombre,
        codigo: facultad.codigo,
      });
      await this.moduloRepository.save(modulo);
    }
  }

  private async seedHorarios() {
    console.log('🕐 Creando horarios...');
    const aulas = await this.aulaRepository.find();
    const dias = [
      'Lunes',
      'Martes',
      'Miércoles',
      'Jueves',
      'Viernes',
      'Sábado',
    ];
    const horasInicio = [
      '07:00:00',
      '08:30:00',
      '10:00:00',
      '11:30:00',
      '14:00:00',
      '15:30:00',
      '17:00:00',
    ];
    const horasFin = [
      '08:20:00',
      '09:50:00',
      '11:20:00',
      '12:50:00',
      '15:20:00',
      '16:50:00',
      '18:20:00',
    ];

    for (let i = 0; i < 100; i++) {
      const diaIndex = Math.floor(Math.random() * dias.length);
      const horaIndex = Math.floor(Math.random() * horasInicio.length);
      const aulaAleatoria = aulas[Math.floor(Math.random() * aulas.length)];

      const horario = this.horarioRepository.create({
        hora_inicio: horasInicio[horaIndex],
        hora_fin: horasFin[horaIndex],
        dia: dias[diaIndex],
        aula: Math.random() > 0.3 ? aulaAleatoria : null, // 70% tienen aula
      });
      await this.horarioRepository.save(horario);
    }
  }

  private async seedGestiones() {
    console.log('📅 Creando gestiones...');
    const gestiones = [2020, 2021, 2022, 2023, 2024, 2025];

    for (const año of gestiones) {
      const gestion = this.gestionRepository.create({ numero: año });
      await this.gestionRepository.save(gestion);
    }
  }

  private async seedPeriodos() {
    console.log('📆 Creando periodos...');
    const gestiones = await this.gestionRepository.find();

    for (const gestion of gestiones) {
      for (let periodo = 1; periodo <= 2; periodo++) {
        const periodoEntity = this.periodoRepository.create({
          numero: periodo,
          gestion: gestion,
        });
        await this.periodoRepository.save(periodoEntity);
      }
    }
  }

  private async seedEstudiantes() {
    console.log('Creando estudiantes...');
    const nombres = [
      'Alex',
      'Sofia',
      'Diego',
      'Valentina',
      'Santiago',
      'Isabella',
      'Mateo',
      'Camila',
      'Sebastián',
      'Lucia',
    ];
    const apellidos = [
      'Morales',
      'Vargas',
      'Herrera',
      'Castillo',
      'Jiménez',
      'Rojas',
      'Mendoza',
      'Torres',
    ];

    for (let i = 0; i < 100; i++) {
      const nombre = nombres[Math.floor(Math.random() * nombres.length)];
      const apellido = apellidos[Math.floor(Math.random() * apellidos.length)];

      // Generar registro con formato 217164791
      const año = Math.floor(Math.random() * 25) + 2000; // 2000-2024
      const últimosDosDigitos = año.toString().slice(-2); // Ej: 2017 -> 17
      const seisDígitosRandom = Math.floor(100000 + Math.random() * 900000); // 100000-999999
      const registro = `${últimosDosDigitos}${seisDígitosRandom}`;

      const estudiante = this.estudianteRepository.create({
        registro,
        nombre,
        apellido,
        correo: `${nombre.toLowerCase()}.${apellido.toLowerCase()}${i}@estudiante.edu`,
        clave: '123456', // Clave simple común para todos
      });
      await this.estudianteRepository.save(estudiante);
    }
  }

  private async seedGrupoMaterias() {
    console.log('📚👥 Creando grupo-materias...');
    const materias = await this.materiaRepository.find();
    const docentes = await this.docenteRepository.find();
    const grupos = await this.grupoRepository.find();
    const periodos = await this.periodoRepository.find();

    for (let i = 0; i < 150; i++) {
      const materia = materias[Math.floor(Math.random() * materias.length)];
      const docente =
        Math.random() > 0.2
          ? docentes[Math.floor(Math.random() * docentes.length)]
          : null;
      const grupo = grupos[Math.floor(Math.random() * grupos.length)];
      const periodo = periodos[Math.floor(Math.random() * periodos.length)];

      const grupoMateria = this.grupoMateriaRepository.create({
        cupos: Math.floor(Math.random() * 30) + 20, // 20-50 cupos
        materia: materia,
        docente: docente,
        grupo: grupo,
        periodo: periodo,
      });
      await this.grupoMateriaRepository.save(grupoMateria);
    }
  }

  private async seedInscripciones() {
    console.log('📝 Creando inscripciones...');
    const estudiantes = await this.estudianteRepository.find();

    // Crear 1-3 inscripciones por estudiante
    for (const estudiante of estudiantes) {
      const numInscripciones = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < numInscripciones; i++) {
        const fechaBase = new Date('2024-01-01');
        const fechaAleatoria = new Date(
          fechaBase.getTime() + Math.random() * 365 * 24 * 60 * 60 * 1000,
        );

        const inscripcion = this.inscripcionRepository.create({
          fechaInscripcion: fechaAleatoria,
          estudiante: estudiante,
        });
        await this.inscripcionRepository.save(inscripcion);
      }
    }
  }

  private async seedDetalles() {
    console.log('📋 Creando detalles...');
    const inscripciones = await this.inscripcionRepository.find();
    const grupoMaterias = await this.grupoMateriaRepository.find();

    for (const inscripcion of inscripciones) {
      const numDetalles = Math.floor(Math.random() * 6) + 3; // 3-8 materias por inscripción
      const grupoMateriasSeleccionados = new Set();

      for (
        let i = 0;
        i < numDetalles && grupoMateriasSeleccionados.size < numDetalles;
        i++
      ) {
        const grupoMateria =
          grupoMaterias[Math.floor(Math.random() * grupoMaterias.length)];
        if (!grupoMateriasSeleccionados.has(grupoMateria.id)) {
          grupoMateriasSeleccionados.add(grupoMateria.id);

          const detalle = this.detalleRepository.create({
            grupoMateria: grupoMateria,
            inscripcion: inscripcion,
          });
          await this.detalleRepository.save(detalle);
        }
      }
    }
  }

  private async seedBoletasHorario() {
    console.log('🕐📚 Creando boletas de horario...');
    const grupoMaterias = await this.grupoMateriaRepository.find();
    const horarios = await this.horarioRepository.find();

    for (const grupoMateria of grupoMaterias) {
      const numHorarios = Math.floor(Math.random() * 3) + 1; // 1-3 horarios por grupo-materia
      const horariosSeleccionados = new Set();

      for (
        let i = 0;
        i < numHorarios && horariosSeleccionados.size < numHorarios;
        i++
      ) {
        const horario = horarios[Math.floor(Math.random() * horarios.length)];
        if (!horariosSeleccionados.has(horario.id)) {
          horariosSeleccionados.add(horario.id);

          const boletaHorario = this.boletaHorarioRepository.create({
            grupoMateriaId: grupoMateria.id,
            horarioId: horario.id,
          });
          await this.boletaHorarioRepository.save(boletaHorario);
        }
      }
    }
  }

  private async seedNotas() {
    console.log('📊 Creando notas...');
    const detalles = await this.detalleRepository.find({
      relations: ['grupoMateria', 'inscripcion', 'inscripcion.estudiante'],
    });

    for (const detalle of detalles) {
      // 80% de probabilidad de tener nota
      if (Math.random() > 0.2) {
        const nota = this.notaRepository.create({
          grupoMateriaId: detalle.grupoMateria.id,
          estudianteId: detalle.inscripcion.estudiante.id,
          numero: Math.round((Math.random() * 40 + 40) * 100) / 100, // Notas entre 40 y 80
        });

        try {
          await this.notaRepository.save(nota);
        } catch (error) {
          // Evitar duplicados
          console.log(
            `Nota duplicada evitada: GM${detalle.grupoMateria.id}-E${detalle.inscripcion.estudiante.id}`,
          );
        }
      }
    }
  }
}
