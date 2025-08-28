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
  constructor(private readonly planEstudioService: PlanEstudioService) {}

  @Post()
  create(@Body() createPlanEstudioDto: CreatePlanEstudioDto) {
    return this.planEstudioService.create(createPlanEstudioDto);
  }

  @Get()
  findAll() {
    return this.planEstudioService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.planEstudioService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePlanEstudioDto: UpdatePlanEstudioDto) {
    return this.planEstudioService.update(+id, updatePlanEstudioDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.planEstudioService.remove(+id);
  }
}