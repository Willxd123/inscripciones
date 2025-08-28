import { AuthGuard } from './../auth/guard/auth.guard';
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { GrupoMateriaService } from './grupo-materia.service';
import { CreateGrupoMateriaDto } from './dto/create-grupo-materia.dto';
import { UpdateGrupoMateriaDto } from './dto/update-grupo-materia.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('grupo-materia')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class GrupoMateriaController {
  constructor(private readonly grupoMateriaService: GrupoMateriaService) {}

  @Post()
  create(@Body() createGrupoMateriaDto: CreateGrupoMateriaDto) {
    return this.grupoMateriaService.create(createGrupoMateriaDto);
  }

  @Get()
  findAll() {
    return this.grupoMateriaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.grupoMateriaService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGrupoMateriaDto: UpdateGrupoMateriaDto) {
    return this.grupoMateriaService.update(+id, updateGrupoMateriaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.grupoMateriaService.remove(+id);
  }
}
