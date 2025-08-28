import { AuthGuard } from './../auth/guard/auth.guard';
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { BoletaHorarioService } from './boleta-horario.service';
import { CreateBoletaHorarioDto } from './dto/create-boleta-horario.dto';
import { UpdateBoletaHorarioDto } from './dto/update-boleta-horario.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('boleta-horario')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class BoletaHorarioController {
  constructor(private readonly boletaHorarioService: BoletaHorarioService) {}

  @Post()
  create(@Body() createBoletaHorarioDto: CreateBoletaHorarioDto) {
    return this.boletaHorarioService.create(createBoletaHorarioDto);
  }

  @Get()
  findAll() {
    return this.boletaHorarioService.findAll();
  }

  @Get(':grupoMateriaId/:horarioId')
  findOne(@Param('grupoMateriaId') grupoMateriaId: string, @Param('horarioId') horarioId: string) {
    return this.boletaHorarioService.findOne(+grupoMateriaId, +horarioId);
  }

  @Patch(':grupoMateriaId/:horarioId')
  update(@Param('grupoMateriaId') grupoMateriaId: string, @Param('horarioId') horarioId: string, @Body() updateBoletaHorarioDto: UpdateBoletaHorarioDto) {
    return this.boletaHorarioService.update(+grupoMateriaId, +horarioId, updateBoletaHorarioDto);
  }

  @Delete(':grupoMateriaId/:horarioId')
  remove(@Param('grupoMateriaId') grupoMateriaId: string, @Param('horarioId') horarioId: string) {
    return this.boletaHorarioService.remove(+grupoMateriaId, +horarioId);
  }
}