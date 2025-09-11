import { DetalleInscripcion } from './../detalle-inscripcion/entities/detalle-inscripcion.entity';
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
import { BoletaHorario } from '../boleta-horario/entities/boleta-horario.entity';
import { Nota } from '../nota/entities/nota.entity';

@Injectable()
export class SeedService {
  private readonly carriersData = {
    'Ingeniería Informática': {
      codigo: 'INF',
      planCodigo: '187-3',
      materias: {
        1: [
          { nombre: 'Cálculo I', sigla: 'MAT101' },
          { nombre: 'Estructuras Discretas', sigla: 'INF119' },
          { nombre: 'Introducción a la Informática', sigla: 'INF110' },
          { nombre: 'Inglés Técnico I', sigla: 'LIN100' },
          { nombre: 'Física I', sigla: 'FIS100' },
        ],
        2: [
          { nombre: 'Cálculo II', sigla: 'MAT102' },
          { nombre: 'Álgebra Lineal', sigla: 'MAT103' },
          { nombre: 'Programación I', sigla: 'INF120' },
          { nombre: 'Inglés Técnico II', sigla: 'LIN101' },
          { nombre: 'Física II', sigla: 'FIS102' },
        ],
        3: [
          { nombre: 'Ecuaciones Diferenciales', sigla: 'MAT207' },
          { nombre: 'Programación II', sigla: 'INF210' },
          { nombre: 'Arquitectura de Computadores', sigla: 'INF211' },
          { nombre: 'Administración', sigla: 'ADM100' },
          { nombre: 'Física III', sigla: 'FIS200' },
        ],
        4: [
          { nombre: 'Probabilidad y Estadística I', sigla: 'MAT202' },
          { nombre: 'Métodos Numéricos', sigla: 'MAT205' },
          { nombre: 'Estructura de Datos I', sigla: 'INF220' },
          { nombre: 'Programación Ensamblador', sigla: 'INF221' },
          { nombre: 'Contabilidad', sigla: 'ADM200' },
        ],
        5: [
          { nombre: 'Probabilidad y Estadística II', sigla: 'MAT302' },
          { nombre: 'Lenguajes Formales', sigla: 'INF319' },
          { nombre: 'Estructura de Datos II', sigla: 'INF310' },
          { nombre: 'Programación Lógica y Funcional', sigla: 'INF318' },
          { nombre: 'Base de Datos I', sigla: 'INF312' },
        ],
        6: [
          { nombre: 'Investigación Operativa I', sigla: 'MAT329' },
          { nombre: 'Compiladores', sigla: 'INF329' },
          { nombre: 'Sistemas Operativos I', sigla: 'INF323' },
          { nombre: 'Sistemas de Información I', sigla: 'INF342' },
          { nombre: 'Base de Datos II', sigla: 'INF322' },
        ],
        7: [
          { nombre: 'Investigación Operativa II', sigla: 'MAT419' },
          { nombre: 'Redes I', sigla: 'INF433' },
          { nombre: 'Sistemas Operativos II', sigla: 'INF413' },
          { nombre: 'Inteligencia Artificial', sigla: 'INF418' },
          { nombre: 'Sistemas de Información II', sigla: 'INF412' },
        ],
        8: [
          { nombre: 'Preparación y Evaluación de Proyectos', sigla: 'ECO449' },
          { nombre: 'Redes II', sigla: 'INF423' },
          { nombre: 'Sistemas Expertos', sigla: 'INF428' },
          { nombre: 'Sistemas de Información Geográfica', sigla: 'INF442' },
          { nombre: 'Ingeniería de Software I', sigla: 'INF422' },
        ],
        9: [
          { nombre: 'Taller de Grado I', sigla: 'INF511' },
          { nombre: 'Ingeniería de Software II', sigla: 'INF512' },
          { nombre: 'Tecnología Web', sigla: 'INF513' },
          { nombre: 'Arquitectura de Software', sigla: 'INF552' },
        ],
      },
    },
    'Ingeniería en Sistemas': {
      codigo: 'SIS',
      planCodigo: '187-4',
      materias: {
        1: [
          { nombre: 'Cálculo I', sigla: 'MAT101' },
          { nombre: 'Estructuras Discretas', sigla: 'INF119' },
          { nombre: 'Introducción a la Informática', sigla: 'INF110' },
          { nombre: 'Inglés Técnico I', sigla: 'LIN100' },
          { nombre: 'Física I', sigla: 'FIS100' },
        ],
        2: [
          { nombre: 'Cálculo II', sigla: 'MAT102' },
          { nombre: 'Álgebra Lineal', sigla: 'MAT103' },
          { nombre: 'Programación I', sigla: 'INF120' },
          { nombre: 'Inglés Técnico II', sigla: 'LIN101' },
          { nombre: 'Física II', sigla: 'FIS102' },
        ],
        3: [
          { nombre: 'Ecuaciones Diferenciales', sigla: 'MAT207' },
          { nombre: 'Programación II', sigla: 'INF210' },
          { nombre: 'Arquitectura de Computadores', sigla: 'INF211' },
          { nombre: 'Administración', sigla: 'ADM100' },
          { nombre: 'Física III', sigla: 'FIS200' },
        ],
        4: [
          { nombre: 'Probabilidad y Estadística I', sigla: 'MAT202' },
          { nombre: 'Métodos Numéricos', sigla: 'MAT205' },
          { nombre: 'Estructura de Datos I', sigla: 'INF220' },
          { nombre: 'Programación Ensamblador', sigla: 'INF221' },
          { nombre: 'Contabilidad', sigla: 'ADM200' },
        ],
        5: [
          { nombre: 'Probabilidad y Estadística II', sigla: 'MAT302' },
          { nombre: 'Estructura de Datos II', sigla: 'INF310' },
          { nombre: 'Organización y Métodos', sigla: 'ADM330' },
          { nombre: 'Base de Datos I', sigla: 'INF312' },
          { nombre: 'Economía para la Gestión', sigla: 'ECO300' },
        ],
        6: [
          { nombre: 'Investigación Operativa I', sigla: 'MAT329' },
          { nombre: 'Sistemas Operativos I', sigla: 'INF323' },
          { nombre: 'Finanzas para la Empresa', sigla: 'ADM320' },
          { nombre: 'Sistemas de Información I', sigla: 'INF342' },
          { nombre: 'Base de Datos II', sigla: 'INF322' },
        ],
        7: [
          { nombre: 'Investigación Operativa II', sigla: 'MAT419' },
          { nombre: 'Redes I', sigla: 'INF433' },
          { nombre: 'Sistemas Operativos II', sigla: 'INF413' },
          {
            nombre: 'Sistemas para el Soporte a la Toma de Decisiones',
            sigla: 'INF432',
          },
          { nombre: 'Sistemas de Información II', sigla: 'INF412' },
        ],
        8: [
          { nombre: 'Preparación y Evaluación de Proyectos', sigla: 'ECO449' },
          { nombre: 'Redes II', sigla: 'INF423' },
          { nombre: 'Auditoría Informática', sigla: 'INF462' },
          { nombre: 'Sistemas de Información Geográfica', sigla: 'INF442' },
          { nombre: 'Ingeniería de Software I', sigla: 'INF422' },
        ],
        9: [
          { nombre: 'Taller de Grado I', sigla: 'INF511' },
          { nombre: 'Ingeniería de Software II', sigla: 'INF512' },
          { nombre: 'Tecnología Web', sigla: 'INF513' },
          { nombre: 'Arquitectura de Software', sigla: 'INF552' },
        ],
      },
    },
    'Ingeniería en Redes y Telecomunicaciones': {
      codigo: 'RDS',
      planCodigo: '187-5',
      materias: {
        1: [
          { nombre: 'Cálculo I', sigla: 'MAT101' },
          { nombre: 'Estructuras Discretas', sigla: 'INF119' },
          { nombre: 'Introducción a la Informática', sigla: 'INF110' },
          { nombre: 'Inglés Técnico I', sigla: 'LIN100' },
          { nombre: 'Física I', sigla: 'FIS100' },
        ],
        2: [
          { nombre: 'Cálculo II', sigla: 'MAT102' },
          { nombre: 'Álgebra Lineal', sigla: 'MAT103' },
          { nombre: 'Programación I', sigla: 'INF120' },
          { nombre: 'Inglés Técnico II', sigla: 'LIN101' },
          { nombre: 'Física II', sigla: 'FIS102' },
        ],
        3: [
          { nombre: 'Ecuaciones Diferenciales', sigla: 'MAT207' },
          { nombre: 'Programación II', sigla: 'INF210' },
          { nombre: 'Análisis de Circuitos', sigla: 'RDS210' },
          { nombre: 'Teoría de Campo', sigla: 'ELT241' },
        ],
        4: [
          { nombre: 'Probabilidad y Estadística I', sigla: 'MAT202' },
          { nombre: 'Métodos Numéricos', sigla: 'MAT205' },
          { nombre: 'Señales y Sistemas', sigla: 'ELT354' },
          { nombre: 'Análisis de Circuitos Electrónicos', sigla: 'RDS220' },
        ],
        5: [
          { nombre: 'Probabilidad y Estadística II', sigla: 'MAT302' },
          { nombre: 'Sistemas Lógicos y Digitales I', sigla: 'ELT352' },
          { nombre: 'Electrónica Aplicada a Redes', sigla: 'RDS310' },
          { nombre: 'Base de Datos I', sigla: 'INF312' },
        ],
        6: [
          { nombre: 'Investigación Operativa I', sigla: 'MAT329' },
          { nombre: 'Interpretación de Señales y Sistemas', sigla: 'RDS320' },
          { nombre: 'Sistemas Lógicos y Digitales II', sigla: 'ELT362' },
          { nombre: 'Sistemas Operativos I', sigla: 'INF323' },
          { nombre: 'Base de Datos II', sigla: 'INF322' },
        ],
        7: [
          { nombre: 'Investigación Operativa II', sigla: 'MAT419' },
          { nombre: 'Redes I', sigla: 'INF433' },
          { nombre: 'Sistemas de Comunicación I', sigla: 'ELT374' },
          { nombre: 'Sistemas Operativos II', sigla: 'INF413' },
          { nombre: 'Aplicaciones con Microprocesadores', sigla: 'RDS410' },
        ],
        8: [
          { nombre: 'Preparación y Evaluación de Proyectos', sigla: 'ECO449' },
          { nombre: 'Redes II', sigla: 'INF423' },
          { nombre: 'Taller de Análisis y Diseño de Redes', sigla: 'RDS421' },
          { nombre: 'Sistemas de Comunicación II', sigla: 'ELT384' },
          { nombre: 'Legislación en Redes y Comunicaciones', sigla: 'RDS429' },
        ],
        9: [
          { nombre: 'Taller de Grado I', sigla: 'INF511' },
          { nombre: 'Gestión y Administración de Redes', sigla: 'RDS511' },
          { nombre: 'Tecnología Web', sigla: 'INF513' },
          {
            nombre: 'Redes Inalámbricas y Comunicaciones Móviles',
            sigla: 'RDS512',
          },
          {
            nombre: 'Seguridad de Redes y Transmisión de Datos',
            sigla: 'RDS519',
          },
        ],
      },
    },
  };

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
    @InjectRepository(DetalleInscripcion)
    private detalleInscripcionRepository: Repository<DetalleInscripcion>,
    @InjectRepository(BoletaHorario)
    private boletaHorarioRepository: Repository<BoletaHorario>,
    @InjectRepository(Nota) private notaRepository: Repository<Nota>,
  ) {}

  async runAllSeeds() {
    console.log('🌱 Iniciando seeders FICCT...');

    try {
      await this.safeSeed(() => this.seedModulos(), 'Módulos');
      await this.safeSeed(() => this.seedAulas(), 'Aulas');
      await this.safeSeed(() => this.seedHorarios(), 'Horarios');
      await this.safeSeed(() => this.seedCarreras(), 'Carreras');
      await this.safeSeed(() => this.seedPlanesEstudio(), 'Planes de Estudio');
      await this.safeSeed(() => this.seedNiveles(), 'Niveles');
      await this.safeSeed(() => this.seedMaterias(), 'Materias');
      await this.safeSeed(() => this.seedPrerequisitos(), 'Prerequisitos');
      await this.safeSeed(() => this.seedGrupos(), 'Grupos');
      await this.safeSeed(() => this.seedDocentes(), 'Docentes');
      await this.safeSeed(() => this.seedGestiones(), 'Gestiones');
      await this.safeSeed(() => this.seedPeriodos(), 'Periodos');
      await this.safeSeed(() => this.seedEstudiantes(), 'Estudiantes');
      await this.safeSeed(() => this.seedGrupoMaterias(), 'Grupo Materias');
      await this.safeSeed(() => this.seedInscripciones(), 'Inscripciones');
      await this.safeSeed(() => this.seedDetalleInscripciones(), 'Detalle Inscripciones');
      await this.safeSeed(() => this.seedBoletasHorario(), 'Boletas Horario');
      await this.safeSeed(() => this.seedNotas(), 'Notas');

      console.log('🎉 Todos los seeders FICCT ejecutados exitosamente');
    } catch (error) {
      console.error('❌ Error ejecutando seeders:', error);
      throw error;
    }
  }

  private async safeSeed(seedFn: () => Promise<void>, nombre: string) {
    try {
      await seedFn();
      console.log(`✅ ${nombre} creados correctamente`);
    } catch (error: any) {
      if (error.code === '23505') {
        // Código de error de duplicado en Postgres
        console.warn(`⚠️ ${nombre} ya existen, se omite.`);
      } else {
        throw error; // Otros errores sí se lanzan
      }
    }
  }

  private async seedCarreras(force = false) {
    console.log('📚 Creando carreras FICCT...');

    const count = await this.carreraRepository.count();
    if (count > 0) {
      console.log('⚠️ La tabla de carreras ya tiene datos');
      return;
    }

    for (const [nombreCarrera, data] of Object.entries(this.carriersData)) {
      // Verificar si ya existe
      const carreraExistente = await this.carreraRepository.findOneBy({
        codigo: data.codigo,
      });

      if (carreraExistente && !force) {
        console.log(`⚠️ Carrera ${data.codigo} ya existe, se omite.`);
        continue; // Salta la inserción
      }

      // Si no existe o se fuerza, insertar
      const carrera = this.carreraRepository.create({
        nombre: nombreCarrera,
        codigo: data.codigo,
      });
      await this.carreraRepository.save(carrera);
      console.log(`✅ Carrera ${data.codigo} creada`);
    }
  }

  private async seedPlanesEstudio() {
    console.log('📋 Creando planes de estudio FICCT...');

    const count = await this.planEstudioRepository.count();
    if (count > 0) {
      console.log('⚠️ La tabla de planes de estudio ya tiene datos');
      return;
    }

    const carreras = await this.carreraRepository.find();

    for (const carrera of carreras) {
      const carreraData = Object.values(this.carriersData).find(
        (data) => data.codigo === carrera.codigo,
      );

      if (carreraData) {
        const plan = this.planEstudioRepository.create({
          nombre: carreraData.planCodigo,
          carrera: carrera,
        });
        await this.planEstudioRepository.save(plan);
      }
    }
  }

  private async seedNiveles() {
    console.log('📊 Creando niveles (1 a 9)...');

    const count = await this.nivelRepository.count();
    if (count > 0) {
      console.log('⚠️ La tabla de niveles ya tiene datos');
      return;
    }

    for (let numero = 1; numero <= 9; numero++) {
      const nivelEntity = this.nivelRepository.create({ numero });
      await this.nivelRepository.save(nivelEntity);
    }
  }

  private async seedMaterias() {
    console.log('📖 Creando materias específicas por carrera...');

    const count = await this.materiaRepository.count();
    if (count > 0) {
      console.log('⚠️ La tabla de materias ya tiene datos');
      return;
    }

    const planes = await this.planEstudioRepository.find({
      relations: ['carrera'],
    });

    for (const plan of planes) {
      const carreraData = Object.values(this.carriersData).find(
        (data) => data.codigo === plan.carrera.codigo,
      );

      if (carreraData) {
        // recorremos los niveles definidos en carriersData
        for (const [nivelNumero, materiasNivel] of Object.entries(
          carreraData.materias,
        )) {
          // buscamos el nivel ya creado en la BD
          const nivel = await this.nivelRepository.findOneBy({
            numero: Number(nivelNumero),
          });

          if (!nivel) {
            console.warn(`⚠️ Nivel ${nivelNumero} no encontrado, se omite`);
            continue;
          }

          // creamos las materias para ese nivel
          for (const materiaData of materiasNivel) {
            // ✅ Verificar si la materia ya existe
            const materiaExistente = await this.materiaRepository.findOne({
              where: { sigla: materiaData.sigla },
            });

            if (materiaExistente) {
              console.log(`Materia ${materiaData.sigla} ya existe, se omite.`);
              continue;
            }

            const materia = this.materiaRepository.create({
              nombre: materiaData.nombre,
              sigla: materiaData.sigla,
              nivel: nivel,
              planEstudio: plan,
            });

            await this.materiaRepository.save(materia);
          }
        }
      }
    }
  }

  private async seedPrerequisitos() {
    console.log('🔗 Creando prerequisitos lógicos...');

    const count = await this.prerequisitoRepository.count();
    if (count > 0) {
      console.log('⚠️ La tabla de prerequisitos ya tiene datos');
      return;
    }

    // Prerequisitos comunes por siglas
    const prerequisitosMap = {
      MAT102: ['MAT101'],
      MAT103: ['MAT101'],
      MAT207: ['MAT102'],
      MAT202: ['MAT102', 'MAT103'],
      MAT302: ['MAT202'],
      MAT329: ['MAT302'],
      MAT419: ['MAT329'],
      INF120: ['INF110'],
      INF210: ['INF120'],
      INF220: ['INF210'],
      INF310: ['INF220'],
      INF211: ['INF120'],
      INF221: ['INF211'],
      INF312: ['INF310'],
      INF322: ['INF312'],
      INF323: ['INF211'],
      INF413: ['INF323'],
      INF433: ['INF323'],
      INF423: ['INF433'],
      FIS102: ['FIS100'],
      FIS200: ['FIS102'],
      LIN101: ['LIN100'],
      ADM200: ['ADM100'],
    };

    for (const [siglaMateria, prerequisitosSiglas] of Object.entries(
      prerequisitosMap,
    )) {
      const materia = await this.materiaRepository.findOne({
        where: { sigla: siglaMateria },
      });

      if (materia) {
        for (const prerequisitoSigla of prerequisitosSiglas) {
          const materiaRequerida = await this.materiaRepository.findOne({
            where: { sigla: prerequisitoSigla },
          });

          if (materiaRequerida) {
            const prerequisito = this.prerequisitoRepository.create({
              materiaId: materia.id,
              materiaRequeridaId: materiaRequerida.id,
            });
            await this.prerequisitoRepository.save(prerequisito);
          }
        }
      }
    }
  }

  private async seedModulos() {
    console.log('🏢 Creando módulos FICCT...');

    const count = await this.moduloRepository.count();
    if (count > 0) {
      console.log('⚠️ La tabla de módulos ya tiene datos');
      return;
    }

    const modulos = [
      {
        nombre:
          'Facultad de Ingeniería en Ciencias de la Computación y Tecnologías',
        codigo: '236',
      },
    ];

    for (const modulo of modulos) {
      await this.moduloRepository.save(this.moduloRepository.create(modulo));
    }
  }

  private async seedAulas() {
    console.log('🏫 Creando aulas por módulo...');

    const count = await this.aulaRepository.count();
    if (count > 0) {
      console.log('⚠️ La tabla de aulas ya tiene datos');
      return;
    }

    const modulos = await this.moduloRepository.find();

    const aulasConfig = {
      '236': { cantidad: 50, prefijo: 'AULAS' },
    };

    for (const modulo of modulos) {
      const config = aulasConfig[modulo.codigo];
      if (config) {
        for (let i = 1; i <= config.cantidad; i++) {
          const aula = this.aulaRepository.create({
            codigo: `${config.prefijo}-${i.toString().padStart(2, '0')}`,
            modulo: modulo,
          });
          await this.aulaRepository.save(aula);
        }
      }
    }
  }

  private async seedHorarios() {
    console.log('🕐 Creando horarios académicos...');

    const count = await this.horarioRepository.count();
    if (count > 0) {
      console.log('⚠️ La tabla de horarios ya tiene datos');
      return;
    }

    const dias = [
      'lunes',
      'martes',
      'miercoles',
      'jueves',
      'viernes',
      'sabado',
    ];
    const aulas = await this.aulaRepository.find();

    // Horarios académicos típicos
    const bloques = [
      { inicio: '07:00', fin: '08:20' },
      { inicio: '08:30', fin: '09:50' },
      { inicio: '10:00', fin: '11:20' },
      { inicio: '11:30', fin: '12:50' },
      { inicio: '14:00', fin: '15:20' },
      { inicio: '15:30', fin: '16:50' },
      { inicio: '17:00', fin: '18:20' },
      { inicio: '18:30', fin: '19:50' },
      { inicio: '20:00', fin: '21:20' },
    ];

    for (const dia of dias) {
      for (const bloque of bloques) {
        const horario = this.horarioRepository.create({
          dia: dia,
          hora_inicio: bloque.inicio,
          hora_fin: bloque.fin,
        });
        await this.horarioRepository.save(horario);
      }
    }
  }

  // Métodos restantes simplificados
  private async seedGrupos() {
    console.log('👥 Creando grupos...');

    const count = await this.grupoRepository.count();
    if (count > 0) {
      console.log('⚠️ La tabla de grupos ya tiene datos');
      return;
    }

    const grupos = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

    for (const nombre of grupos) {
      const grupo = this.grupoRepository.create({ nombre });
      await this.grupoRepository.save(grupo);
    }
  }

  private async seedDocentes() {
    console.log('👨‍🏫 Creando docentes FICCT...');

    const count = await this.docenteRepository.count();
    if (count > 0) {
      console.log('⚠️ La tabla de docentes ya tiene datos');
      return;
    }

    const docentes = [
      {
        nombre: 'Carlos',
        apellido: 'Rodriguez',
        correo: 'carlos.rodriguez@ficct.edu',
      },
      {
        nombre: 'María',
        apellido: 'González',
        correo: 'maria.gonzalez@ficct.edu',
      },
      { nombre: 'Luis', apellido: 'Mendoza', correo: 'luis.mendoza@ficct.edu' },
      { nombre: 'Ana', apellido: 'Torres', correo: 'ana.torres@ficct.edu' },
      { nombre: 'Pedro', apellido: 'Vargas', correo: 'pedro.vargas@ficct.edu' },
      {
        nombre: 'Laura',
        apellido: 'Herrera',
        correo: 'laura.herrera@ficct.edu',
      },
      {
        nombre: 'José',
        apellido: 'Castillo',
        correo: 'jose.castillo@ficct.edu',
      },
      {
        nombre: 'Carmen',
        apellido: 'Jiménez',
        correo: 'carmen.jimenez@ficct.edu',
      },
      {
        nombre: 'Diego',
        apellido: 'Morales',
        correo: 'diego.morales@ficct.edu',
      },
      { nombre: 'Elena', apellido: 'Rojas', correo: 'elena.rojas@ficct.edu' },
    ];

    for (const docente of docentes) {
      await this.docenteRepository.save(this.docenteRepository.create(docente));
    }
  }

  private async seedGestiones() {
    console.log('📅 Creando gestiones...');

    const count = await this.gestionRepository.count();
    if (count > 0) {
      console.log('⚠️ La tabla de gestiones ya tiene datos');
      return;
    }

    const gestiones = [2022, 2023, 2024, 2025];

    for (const año of gestiones) {
      const gestion = this.gestionRepository.create({ numero: año });
      await this.gestionRepository.save(gestion);
    }
  }

  private async seedPeriodos() {
    console.log('📆 Creando periodos...');

    const count = await this.periodoRepository.count();
    if (count > 0) {
      console.log('⚠️ La tabla de periodos ya tiene datos');
      return;
    }

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
    console.log('👨‍🎓 Creando estudiantes...');

    const count = await this.estudianteRepository.count();
    if (count > 0) {
      console.log('⚠️ La tabla de estudiantes ya tiene datos');
      return;
    }

    // Obtener todos los planes de estudio disponibles
    const planes = await this.planEstudioRepository.find({
      relations: ['carrera'],
    });

    if (planes.length === 0) {
      console.warn('⚠️ No hay planes de estudio disponibles');
      return;
    }

    const nombres = [
      'Alex',
      'Sofia',
      'Diego',
      'Valentina',
      'Santiago',
      'Isabella',
      'Mateo',
      'Camila',
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

    for (let i = 0; i < 50; i++) {
      const nombre = nombres[Math.floor(Math.random() * nombres.length)];
      const apellido = apellidos[Math.floor(Math.random() * apellidos.length)];

      const año = Math.floor(Math.random() * 25) + 2000;
      const últimosDosDigitos = año.toString().slice(-2);
      const seisDígitosRandom = Math.floor(100000 + Math.random() * 900000);
      const registro = `${últimosDosDigitos}${seisDígitosRandom}`;

      // Asignar un plan de estudio aleatorio
      const planAleatorio = planes[Math.floor(Math.random() * planes.length)];

      const estudiante = this.estudianteRepository.create({
        registro,
        nombre,
        apellido,
        correo: `${nombre.toLowerCase()}.${apellido.toLowerCase()}${i}@estudiante.ficct.edu`,
        clave: '123456',
        planEstudio: planAleatorio, // ← ESTO FALTABA
      });
      await this.estudianteRepository.save(estudiante);
    }
  }

  private async seedGrupoMaterias() {
    console.log('📚👥 Creando grupo-materias...');

    const count = await this.grupoMateriaRepository.count();
    if (count > 0) {
      console.log('⚠️ La tabla de grupo-materias ya tiene datos');
      return;
    }

    const materias = await this.materiaRepository.find();
    const docentes = await this.docenteRepository.find();
    const grupos = await this.grupoRepository.find();
    const periodos = await this.periodoRepository.find();

    // Crear 1-2 grupos por materia en diferentes periodos
    for (const materia of materias) {
      const numGrupos = Math.floor(Math.random() * 2) + 1; // 1-2 grupos

      for (let i = 0; i < numGrupos; i++) {
        const docente =
          Math.random() > 0.1
            ? docentes[Math.floor(Math.random() * docentes.length)]
            : null;
        const grupo = grupos[Math.floor(Math.random() * grupos.length)];
        const periodo = periodos[Math.floor(Math.random() * periodos.length)];

        const grupoMateria = this.grupoMateriaRepository.create({
          cupos: Math.floor(Math.random() * 20) + 25, // 25-45 cupos
          materia: materia,
          docente: docente,
          grupo: grupo,
          periodo: periodo,
        });
        await this.grupoMateriaRepository.save(grupoMateria);
      }
    }
  }

  private async seedInscripciones() {
    console.log('📝 Creando inscripciones...');

    const count = await this.inscripcionRepository.count();
    if (count > 0) {
      console.log('⚠️ La tabla de inscripciones ya tiene datos');
      return;
    }

    const estudiantes = await this.estudianteRepository.find({
      relations: ['planEstudio'],
    });

    // Cada estudiante puede tener 1-3 inscripciones (simula diferentes momentos)
    for (const estudiante of estudiantes) {
      if (!estudiante.planEstudio) {
        console.warn(
          `⚠️ Estudiante ${estudiante.registro} sin plan de estudio asignado`,
        );
        continue;
      }

      const numInscripciones = Math.floor(Math.random() * 3) + 1; // 1-3 inscripciones

      for (let i = 0; i < numInscripciones; i++) {
        // Fechas diferentes para cada inscripción
        const fechaBase = new Date('2024-01-15');
        const diasAleatorios = Math.random() * 180; // Hasta 6 meses de diferencia
        const fechaAleatoria = new Date(
          fechaBase.getTime() + diasAleatorios * 24 * 60 * 60 * 1000,
        );

        const inscripcion = this.inscripcionRepository.create({
          fechaInscripcion: fechaAleatoria,
          estudiante: estudiante,
        });
        await this.inscripcionRepository.save(inscripcion);
      }
    }
  }

  private async seedDetalleInscripciones() {
    console.log('📋 Creando detalles de inscripciones...');

    const count = await this.detalleInscripcionRepository.count();
    if (count > 0) {
      console.log('⚠️ La tabla de detalle inscripciones ya tiene datos');
      return;
    }

    const inscripciones = await this.inscripcionRepository.find({
      relations: ['estudiante', 'estudiante.planEstudio'],
    });

    for (const inscripcion of inscripciones) {
      if (!inscripcion.estudiante.planEstudio) {
        console.warn(`⚠️ Estudiante sin plan de estudio`);
        continue;
      }

      // Obtener grupos-materias del plan del estudiante
      const grupoMaterias = await this.grupoMateriaRepository.find({
        relations: ['materia', 'materia.planEstudio', 'materia.nivel'],
        where: {
          materia: {
            planEstudio: {
              id: inscripcion.estudiante.planEstudio.id,
            },
          },
        },
      });

      if (grupoMaterias.length === 0) {
        console.warn(
          `⚠️ No hay grupos-materias para el plan ${inscripcion.estudiante.planEstudio.nombre}`,
        );
        continue;
      }

      // Número de materias por inscripción: 2-5
      const numMaterias = Math.floor(Math.random() * 4) + 2;
      const grupoMateriasSeleccionados = new Set<number>();

      // Nivel "aproximado" del estudiante
      const nivelEstudiante = Math.floor(Math.random() * 5) + 1;

      // Filtrar materias del nivel apropiado
      const grupoMateriasFiltrados = grupoMaterias.filter(
        (gm) =>
          gm.materia?.nivel &&
          gm.materia.nivel.numero <= nivelEstudiante + 1 &&
          gm.materia.nivel.numero >= Math.max(1, nivelEstudiante - 1),
      );

      const grupoMateriasDisponibles =
        grupoMateriasFiltrados.length > 0
          ? grupoMateriasFiltrados
          : grupoMaterias.slice(0, 8);

      while (
        grupoMateriasSeleccionados.size <
          Math.min(numMaterias, grupoMateriasDisponibles.length) &&
        grupoMateriasDisponibles.length > 0
      ) {
        const randomIndex = Math.floor(
          Math.random() * grupoMateriasDisponibles.length,
        );
        const grupoMateria = grupoMateriasDisponibles[randomIndex];

        if (!grupoMateriasSeleccionados.has(grupoMateria.id)) {
          grupoMateriasSeleccionados.add(grupoMateria.id);

          // Crear detalle de inscripción
          const detalleInscripcion = this.detalleInscripcionRepository.create({
            inscripcion: inscripcion,
            grupoMateria: grupoMateria,
          });
          await this.detalleInscripcionRepository.save(detalleInscripcion);
        }
      }
    }
  }

  private async seedBoletasHorario() {
    console.log('🕐📚 Creando boletas de horario...');

    const count = await this.boletaHorarioRepository.count();
    if (count > 0) {
      console.log('⚠️ La tabla de boletas de horario ya tiene datos');
      return;
    }

    const grupoMaterias = await this.grupoMateriaRepository.find({
      relations: ['materia'],
    });
    const horarios = await this.horarioRepository.find();
    const aulas = await this.aulaRepository.find();

    for (const grupoMateria of grupoMaterias) {
      // Cada grupo-materia tiene 2-3 horarios
      const numHorarios = Math.floor(Math.random() * 2) + 2; // 2-3 horarios
      const horariosSeleccionados = new Set<number>();
      const diasUsados = new Set<string>();

      while (horariosSeleccionados.size < numHorarios && horarios.length > 0) {
        let intentos = 0;
        let horario: (typeof horarios)[0];

        // Evitar repetir día
        do {
          horario = horarios[Math.floor(Math.random() * horarios.length)];
          intentos++;
        } while (diasUsados.has(horario.dia) && intentos < 20);

        if (
          !horariosSeleccionados.has(horario.id) &&
          !diasUsados.has(horario.dia)
        ) {
          horariosSeleccionados.add(horario.id);
          diasUsados.add(horario.dia);

          // Crear boleta horario asignando llaves compuestas
          const boletaHorario = this.boletaHorarioRepository.create({
            grupoMateriaId: grupoMateria.id,
            horarioId: horario.id,
            grupoMateria: grupoMateria,
            horario: horario,
          });

          await this.boletaHorarioRepository.save(boletaHorario);
        }
      }
    }

    console.log('✅ Boletas de horario creadas exitosamente');
  }

  private determinarTipoClase(siglaMateria: string): string {
    if (siglaMateria.startsWith('INF') || siglaMateria.startsWith('RDS')) {
      return Math.random() > 0.5 ? 'laboratorio' : 'practica';
    } else if (
      siglaMateria.startsWith('MAT') ||
      siglaMateria.startsWith('FIS')
    ) {
      return Math.random() > 0.3 ? 'teoria' : 'practica';
    } else {
      return 'teoria';
    }
  }

  private async seedNotas() {
    console.log('📊 Creando notas...');
  
    const count = await this.notaRepository.count();
    if (count > 0) {
      console.log('⚠️ La tabla de notas ya tiene datos');
      return;
    }
  
    // Obtener detalles de inscripción (la nueva relación)
    const detallesInscripcion = await this.detalleInscripcionRepository.find({
      relations: ['inscripcion', 'inscripcion.estudiante', 'grupoMateria']
    });
  
    for (const detalle of detallesInscripcion) {
      // 85% de probabilidad de generar nota
      if (Math.random() > 0.15) {
        const notaValue = Math.round((Math.random() * 40 + 51) * 100) / 100;
  
        const nota = this.notaRepository.create({
          grupoMateriaId: detalle.grupoMateria.id,
          estudianteId: detalle.inscripcion.estudiante.id,
          numero: notaValue,
          grupoMateria: detalle.grupoMateria,
          estudiante: detalle.inscripcion.estudiante,
        });
  
        try {
          await this.notaRepository.save(nota);
        } catch (error) {
          console.log(
            `⚠️ Nota duplicada evitada: GrupoMateria ${detalle.grupoMateria.id} - Estudiante ${detalle.inscripcion.estudiante.id}`
          );
        }
      }
    }
  }

    
}
