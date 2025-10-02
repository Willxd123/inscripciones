import { EnvolventeGenericaService } from './../cola/envolvente-generica.service';
import { AuthGuard } from './../auth/guard/auth.guard';
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { PlanEstudioService } from './plan-estudio.service';
import { CreatePlanEstudioDto } from './dto/create-plan-estudio.dto';
import { UpdatePlanEstudioDto } from './dto/update-plan-estudio.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('plan-estudio')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class PlanEstudioController {
  private planEstudioWrapper: any;
  constructor(private readonly envolventeGenericaService: EnvolventeGenericaService) {
    this.planEstudioWrapper = this.envolventeGenericaService.crearEnvolventeServicio('plan-estudio');
  }

  @Post()
  create(@Body() createPlanEstudioDto: CreatePlanEstudioDto) {
    return this.planEstudioWrapper.create(createPlanEstudioDto);
  }

  @Get()
  findAll() {
    return this.planEstudioWrapper.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.planEstudioWrapper.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePlanEstudioDto: UpdatePlanEstudioDto) {
    return this.planEstudioWrapper.update(+id, updatePlanEstudioDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.planEstudioWrapper.remove(+id);
  }
}