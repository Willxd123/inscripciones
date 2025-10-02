import { EnvolventeGenericaService } from './../cola/envolvente-generica.service';
import { AuthGuard } from './../auth/guard/auth.guard';
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { EstudianteService } from './estudiante.service';
import { CreateEstudianteDto } from './dto/create-estudiante.dto';
import { UpdateEstudianteDto } from './dto/update-estudiante.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('estudiante')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class EstudianteController {

private estudianteWrapper: any;
  constructor(private readonly envolventeGenericaService: EnvolventeGenericaService) {
    this.estudianteWrapper = this.envolventeGenericaService.crearEnvolventeServicio('estudiante');
  }
  @Post()
  create(@Body() createEstudianteDto: CreateEstudianteDto) {
    return this.estudianteWrapper.create(createEstudianteDto);
  }

  @Get()
  findAll() {
    return this.estudianteWrapper.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.estudianteWrapper.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEstudianteDto: UpdateEstudianteDto) {
    return this.estudianteWrapper.update(+id, updateEstudianteDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.estudianteWrapper.remove(+id);
  }
}
