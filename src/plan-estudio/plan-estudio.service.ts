import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePlanEstudioDto } from './dto/create-plan-estudio.dto';
import { UpdatePlanEstudioDto } from './dto/update-plan-estudio.dto';
import { PlanEstudio } from './entities/plan-estudio.entity';

@Injectable()
export class PlanEstudioService {
  constructor(
    @InjectRepository(PlanEstudio)
    private readonly planEstudioRepository: Repository<PlanEstudio>,
  ) {}

  create(createPlanEstudioDto: CreatePlanEstudioDto) {
    const planEstudio = this.planEstudioRepository.create(createPlanEstudioDto);
    return this.planEstudioRepository.save(planEstudio);
  }

  findAll() {
    return this.planEstudioRepository.find({ relations: ['carrera', 'materias', ]  });
  }

  findOne(id: number) {
    return this.planEstudioRepository.findOne({ 
      where: { id }, 
      relations: ['carrera', 'materias', ] 
    });
  }

  update(id: number, updatePlanEstudioDto: UpdatePlanEstudioDto) {
    return this.planEstudioRepository.update(id, updatePlanEstudioDto);
  }

  remove(id: number) {
    return this.planEstudioRepository.delete(id);
  }
}